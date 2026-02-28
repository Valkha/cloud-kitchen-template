import { NextResponse } from "next/server";
import Stripe from "stripe";

// 1. Initialisation de Stripe avec ta clé SECRÈTE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", // ✅ Correction ici avec la version demandée par ton package
});

export async function POST(request: Request) {
  try {
    // On récupère les données envoyées par le panier (CartDrawer)
    const body = await request.json();
    const { amount, orderId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    // 🔒 SÉCURITÉ : Stripe fonctionne en centimes (Rappen pour CHF).
    // 45.50 CHF = 4550 centimes.
    const amountInCents = Math.round(amount * 100);

    // 2. Création de l'intention de paiement (PaymentIntent)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf", // Devise en Francs Suisses
      
      // Activer les méthodes de paiement automatiques (Apple Pay, Twint, Cartes...)
      automatic_payment_methods: {
        enabled: true,
      },

      // On attache l'ID de la commande Supabase
      metadata: {
        orderId: orderId ? orderId.toString() : "0",
      },
    });

    // 3. On renvoie uniquement la clé publique temporaire au navigateur
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    const err = error as Error;
    console.error("❌ Erreur Stripe API:", err.message);
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'initialisation du paiement." },
      { status: 500 }
    );
  }
}