import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
// ✅ IMPORT DU CLIENT SSR POUR LIRE LE COOKIE DE SESSION SÉCURISÉ
import { createClient } from "@/utils/supabase/server"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

// ✅ Client service_role — bypass RLS pour les opérations serveur
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { 
        amount, couponCode, useWallet, items, customerName, customerPhone, 
        pickupDate, pickupTime, orderType, deliveryAddress, deliveryZip, comments 
    } = body;

    // ✅ 0. RÉCUPÉRATION SÉCURISÉE DE L'UTILISATEUR
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    // --- 1.5 SÉCURITÉ : Vérification de la zone de livraison (Genève uniquement) ---
    if (orderType === "Livraison") {
      const isGenevaZip = /^12\d{2}$/.test(String(deliveryZip).trim());
      if (!isGenevaZip) {
        return NextResponse.json(
          { error: "La livraison est restreinte au canton de Genève (NPA 12xx)." }, 
          { status: 400 }
        );
      }
    }

    let finalAmount = amount;
    let discountApplied = 0;

    // --- 1. LOGIQUE DE COUPON CÔTÉ SERVEUR ---
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", (couponCode as string).toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (!couponError && coupon) {
        const now = new Date();
        const isExpired = coupon.expiration_date && new Date(coupon.expiration_date) < now;

        if (!isExpired && amount >= (coupon.min_order_amount || 0)) {
          if (coupon.discount_type === "percentage") {
            discountApplied = (amount * coupon.discount_value) / 100;
          } else {
            discountApplied = coupon.discount_value;
          }
          finalAmount = Math.max(0, amount - discountApplied);
        }
      }
    }

    // --- 2. LOGIQUE DE CAGNOTTE (WALLET) ---
    let walletUsed = 0;
    if (useWallet && user) {
      // On récupère le solde réel depuis la base de données (sécurité anti-triche)
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profile && profile.wallet_balance > 0) {
        // Règle Stripe : Un paiement CB doit être de minimum 0.50 CHF
        // On empêche la cagnotte de descendre le total en dessous de cette limite
        const maxWalletAllowed = Math.max(0, finalAmount - 0.50);
        walletUsed = Math.min(maxWalletAllowed, Number(profile.wallet_balance));
        finalAmount = finalAmount - walletUsed;

        // ✅ DÉDUCTION IMMÉDIATE DANS SUPABASE (Via la table de transactions)
        if (walletUsed > 0) {
          await supabaseAdmin.from("loyalty_transactions").insert([{
            user_id: user.id,
            amount: -walletUsed,
            description: "Utilisation cagnotte (Paiement en cours)"
          }]);
        }
      }
    }

    const amountInCents = Math.round(finalAmount * 100);

    if (amountInCents < 50) {
      return NextResponse.json({ error: "Montant trop faible pour Stripe (Minimum 0.50 CHF)." }, { status: 400 });
    }

    // On prépare une note propre pour la cuisine
    const finalComments = walletUsed > 0 
      ? `[Cagnotte client déduite: -${walletUsed.toFixed(2)} CHF]\n${comments || ""}` 
      : comments;

    // --- 3. CRÉATION DE LA COMMANDE DANS SUPABASE ---
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: user?.id || null, // ✅ On lie enfin la commande au compte client !
        customer_name: customerName, 
        customer_phone: customerPhone, 
        pickup_date: pickupDate,
        pickup_time: pickupTime, 
        order_type: orderType, 
        delivery_address: deliveryAddress, 
        delivery_zip: deliveryZip, 
        total_amount: finalAmount, 
        discount_amount: discountApplied, 
        coupon_code: couponCode || null, 
        items: items, 
        status: "Paiement en cours",
        comments: finalComments 
      }])
      .select('id')
      .single();

    if (orderError || !orderData) {
      console.error("❌ Erreur Supabase INSERT order:", orderError?.message);
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }

    const newOrderId = orderData.id;

    // --- 4. CRÉATION DU PAYMENT INTENT STRIPE ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(newOrderId),
        userId: user?.id || "guest",
        couponUsed: (couponCode as string) || "none",
        discountAmount: discountApplied.toFixed(2),
        walletUsed: walletUsed.toFixed(2), // Trace pour la compta
        originalAmount: amount.toFixed(2),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: newOrderId
    });

  } catch (error) {
    console.error("❌ Erreur API Stripe/Supabase:", (error as Error).message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}