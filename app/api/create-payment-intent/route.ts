import { NextResponse } from "next/server";
import Stripe from "stripe";

// 1. Initialisation de Stripe avec ta clé SECRÈTE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", // ✅ Version alignée sur ton environnement
});

export async function POST(request: Request) {
  try {
    // Récupération des données envoyées par le CartDrawer
    const body = await request.json();
    const { amount, orderId } = body;

    // Validation de base
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    if (!orderId) {
      console.error("❌ Tentative de paiement sans orderId");
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 🔒 SÉCURITÉ : Conversion en centimes (Stripe n'accepte que des entiers)
    // 45.50 CHF devient 4550 centimes
    const amountInCents = Math.round(amount * 100);

    // 2. Création de l'intention de paiement (PaymentIntent)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf", // 🇨🇭 Francs Suisses
      
      // ✅ Active Twint, Apple Pay, Google Pay et Cartes automatiquement
      automatic_payment_methods: {
        enabled: true,
      },

      // 🔗 CRUCIAL : On attache l'ID Supabase ici pour le récupérer dans le Webhook
      metadata: {
        orderId: orderId.toString(),
      },
    });

    // 3. Renvoi du clientSecret au CartDrawer pour afficher le formulaire de paiement
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    const err = error as Error;
    console.error("❌ Erreur Stripe API lors de la création du PaymentIntent:", err.message);
    
    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement. Veuillez réessayer." },
      { status: 500 }
    );
  }
}