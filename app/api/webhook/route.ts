/**
 * 🔒 WEBHOOK STRIPE SÉCURISÉ — Template Cloud Kitchen
 */

import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// ─── Clients ──────────────────────────────────────────────────────────────────

// ✅ Mise à jour stricte de la version d'API selon les exigences de ton package Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as const, 
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ─── Idempotence (Anti-Replay) ─────────────────────────────────────────────────

async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .maybeSingle();

  if (error) {
    console.error('[webhook] Erreur lecture idempotence:', error.message);
    return true; 
  }
  return !!data;
}

async function markAsProcessed(eventId: string, eventType: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({
      stripe_event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });

  if (error) {
    if (error.code === '23505') {
      console.warn(`[webhook] Double traitement détecté pour ${eventId}, ignoré`);
    } else {
      console.error('[webhook] Erreur marquage idempotence:', error.message);
    }
  }
}

// ─── Handlers par type d'événement ───────────────────────────────────────────

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  // ✅ CORRECTION ESLINT : Suppression de couponUsed qui n'est pas exploité ici
  const { orderId, userId, walletUsed } = paymentIntent.metadata;

  if (!orderId) {
    console.error('[webhook] Metadata orderId manquante dans le PaymentIntent:', paymentIntent.id);
    return;
  }

  // 1. Mise à jour de la commande en "payée"
  const { error: orderUpdateError } = await supabaseAdmin
    .from('orders')
    .update({ 
      status: 'paid', 
    })
    .eq('id', orderId);

  if (orderUpdateError) {
    console.error(`[webhook] Erreur MAJ commande ${orderId}:`, orderUpdateError.message);
    return;
  }

  console.info(`[webhook] ✅ Commande ${orderId} marquée comme payée.`);

  // 2. Déduction de la cagnotte (Wallet) si utilisée
  if (walletUsed && parseFloat(walletUsed) > 0 && userId && userId !== 'guest') {
    const amountToDeduct = parseFloat(walletUsed);
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (profile) {
      const newBalance = Math.max(0, profile.wallet_balance - amountToDeduct);
      
      await supabaseAdmin
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);

      await supabaseAdmin.from("loyalty_transactions").insert([{
        user_id: userId,
        amount: -amountToDeduct,
        description: `Utilisation cagnotte pour la commande #${orderId.split('-')[0].toUpperCase()}`
      }]);

      console.info(`[webhook] 💰 Cagnotte débitée de ${amountToDeduct} CHF pour l'utilisateur ${userId}.`);
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata.orderId;
  
  if (!orderId) return;

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'payment_failed' })
    .eq('id', orderId); 

  if (error) {
    console.error('[webhook] Erreur mise à jour statut paiement échoué:', error.message);
  } else {
    console.info(`[webhook] ⚠️ Paiement échoué pour la commande ${orderId}`);
  }
}

async function handleRefundCreated(charge: Stripe.Charge): Promise<void> {
  if (!charge.payment_intent) return;
  console.info(`[webhook] 💸 Remboursement enregistré pour ${charge.payment_intent}`);
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const headersList = await headers();
  const stripeSignature = headersList.get('stripe-signature');

  if (!stripeSignature) {
    console.warn('[webhook] Requête reçue sans header stripe-signature');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[webhook] ❌ Signature invalide:', err instanceof Error ? err.message : err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const eventAgeSeconds = Math.floor(Date.now() / 1000) - event.created;
  const MAX_EVENT_AGE_SECONDS = 600;

  if (eventAgeSeconds > MAX_EVENT_AGE_SECONDS) {
    console.warn(
      `[webhook] Événement trop ancien: ${eventAgeSeconds}s (max ${MAX_EVENT_AGE_SECONDS}s) — ID: ${event.id}`
    );
    return new Response('Event timestamp too old', { status: 400 });
  }

  if (await isAlreadyProcessed(event.id)) {
    console.info(`[webhook] Événement ${event.id} déjà traité, skip`);
    return new Response('Already processed', { status: 200 });
  }

  console.info(`[webhook] Traitement de l'événement: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefundCreated(event.data.object as Stripe.Charge);
        break;

      default:
        console.info(`[webhook] Événement non géré: ${event.type}`);
    }
  } catch (err) {
    console.error(`[webhook] Erreur non gérée pour ${event.type}:`, err);
    return new Response('Internal processing error', { status: 500 });
  }

  await markAsProcessed(event.id, event.type);

  return new Response('OK', { status: 200 });
}