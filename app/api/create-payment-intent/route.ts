import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

// ✅ FIX 2 : Client service_role — bypass RLS pour les opérations serveur
// Ce client ne doit JAMAIS être utilisé côté browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Jamais NEXT_PUBLIC_
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ✅ FIX 1 : On ne reçoit plus "amount" du client
    // On reçoit uniquement l'orderId et le couponCode
    // Le montant est recalculé ICI depuis la DB
    const { orderId, couponCode } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID de commande manquant" },
        { status: 400 }
      );
    }

    // --- 1. RECALCUL DU MONTANT DEPUIS LA BASE DE DONNÉES ---
    // ✅ Le client n'envoie PLUS le prix — on le lit depuis Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, total_amount, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    // Sécurité : empêcher de repayer une commande déjà payée
    if (order.status === "paid") {
      return NextResponse.json(
        { error: "Cette commande a déjà été payée" },
        { status: 400 }
      );
    }

    // Le montant de référence vient de la DB, jamais du client
    const originalAmount: number = order.total_amount;

    if (!originalAmount || originalAmount <= 0) {
      return NextResponse.json(
        { error: "Montant de commande invalide" },
        { status: 400 }
      );
    }

    let finalAmount = originalAmount;
    let discountApplied = 0;

    // --- 2. LOGIQUE DE COUPON CÔTÉ SERVEUR ---
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", (couponCode as string).toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (!couponError && coupon) {
        const now = new Date();
        const isExpired =
          coupon.expiration_date && new Date(coupon.expiration_date) < now;

        if (!isExpired && originalAmount >= (coupon.min_order_amount || 0)) {
          if (coupon.discount_type === "percentage") {
            discountApplied = (originalAmount * coupon.discount_value) / 100;
          } else {
            discountApplied = coupon.discount_value;
          }
          finalAmount = Math.max(0, originalAmount - discountApplied);
        }
      }
    }

    const amountInCents = Math.round(finalAmount * 100);

    // Stripe exige un minimum de 50 centimes
    if (amountInCents < 50) {
      return NextResponse.json(
        { error: "Montant trop faible pour être traité" },
        { status: 400 }
      );
    }

    // --- 3. CRÉATION DU PAYMENT INTENT ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(orderId),
        couponUsed: (couponCode as string) || "none",
        discountAmount: discountApplied.toFixed(2),
        originalAmount: originalAmount.toFixed(2),
      },
    });

    // --- 4. SYNCHRONISATION SUPABASE ---
    // ✅ FIX 2 : supabaseAdmin (service_role) — l'UPDATE fonctionnera
    // même avec les policies RLS restrictives qu'on a mises en place
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        total_amount: finalAmount,
        discount_amount: discountApplied,
        coupon_code: (couponCode as string) || null,
      })
      .eq("id", orderId);

    if (updateError) {
      // ✅ Maintenant on le traite comme une vraie erreur, pas un warning ignoré
      console.error("❌ Erreur Supabase UPDATE order:", updateError.message);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la commande" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    const err = error as Error;
    console.error("❌ Erreur API Stripe:", err.message);
    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement sécurisé." },
      { status: 500 }
    );
  }
}