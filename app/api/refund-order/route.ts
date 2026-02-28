import { NextResponse } from "next/server";
import Stripe from "stripe";

// 1. Initialisation de Stripe (Exactement comme pour la création)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 2. On demande à Stripe de chercher le paiement lié à cette commande
    const searchResults = await stripe.paymentIntents.search({
      query: `metadata['orderId']:'${orderId}'`,
    });

    // Si Stripe ne trouve rien
    if (searchResults.data.length === 0) {
      return NextResponse.json({ error: "Paiement introuvable sur Stripe pour cette commande." }, { status: 404 });
    }

    const paymentIntent = searchResults.data[0];

    // 3. Sécurité : On vérifie que le paiement avait bien réussi avant de le rembourser
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ 
        error: `Le paiement n'a pas pu être remboursé car son statut est : ${paymentIntent.status}` 
      }, { status: 400 });
    }

    // 4. On lance l'ordre de remboursement (Refund)
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent.id,
    });

    return NextResponse.json({ success: true, refund });

  } catch (error) {
    const err = error as Error;
    console.error("❌ Erreur Stripe Refund:", err.message);
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors du remboursement." },
      { status: 500 }
    );
  }
}