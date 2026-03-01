import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/utils/supabase";

// ✅ 1. Configuration Stripe avec Typage Strict
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ✅ On utilise une version stable et standard reconnue par tous les packages
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, couponCode } = body;

    // --- 1. VALIDATIONS DE SÉCURITÉ ---
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    let finalAmount = amount;
    let discountApplied = 0;

    // --- 2. LOGIQUE DE COUPON CÔTÉ SERVEUR ---
    // On re-vérifie toujours le coupon ici pour éviter qu'un client ne modifie le prix via le navigateur
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", (couponCode as string).toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (!couponError && coupon) {
        const now = new Date();
        const isExpired = coupon.expiration_date && new Date(coupon.expiration_date) < now;

        // On vérifie l'expiration et le montant minimum de commande
        if (!isExpired && amount >= (coupon.min_order_amount || 0)) {
          if (coupon.discount_type === "percentage") {
            discountApplied = (amount * coupon.discount_value) / 100;
          } else {
            discountApplied = coupon.discount_value;
          }
          // On s'assure que le montant ne devienne pas négatif
          finalAmount = Math.max(0, amount - discountApplied);
        }
      }
    }

    // Stripe attend des centimes (ex: 10.50 CHF -> 1050)
    const amountInCents = Math.round(finalAmount * 100);

    // --- 3. CRÉATION DU PAYMENT INTENT (STRIPE) ---
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(orderId),
        couponUsed: (couponCode as string) || "none",
        discountAmount: discountApplied.toFixed(2),
        originalAmount: amount.toFixed(2),
      },
    });

    // --- 4. SYNCHRONISATION SUPABASE ---
    // ⚠️ Rappel : Tu DOIS avoir ajouté les colonnes total_amount, discount_amount 
    // et coupon_code dans ta table 'orders' pour que ceci fonctionne.
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        total_amount: finalAmount,      // Le nouveau prix après réduction
        discount_amount: discountApplied, // Le montant économisé
        coupon_code: (couponCode as string) || null
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("⚠️ Erreur lors de la mise à jour des détails de réduction dans Supabase:", updateError.message);
      // On continue quand même car le PaymentIntent Stripe a été créé avec succès
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