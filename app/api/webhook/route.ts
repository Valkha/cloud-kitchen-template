import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// 1. Initialisation de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// 2. Initialisation d'un client Supabase "Admin" (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text(); // On récupère le texte brut pour la signature
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    // 🔒 SÉCURITÉ MAXIMALE : On vérifie que le message vient bien de Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  // ✅ CORRECTION : Fini le "any", on utilise un typage propre
  } catch (err) {
    const error = err as Error;
    console.error("⚠️ Erreur de signature Webhook :", error.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // 3. Traitement de l'événement de paiement réussi
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // On récupère l'ID de la commande qu'on avait caché dans les métadonnées
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      console.log(`💰 Paiement reçu pour la commande #${orderId}! Mise à jour de la BDD...`);
      
      // Mise à jour sécurisée de la base de données côté serveur
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ status: "Payé" })
        .eq("id", orderId);

      if (error) {
        console.error("❌ Erreur lors de la mise à jour Supabase :", error);
        return NextResponse.json({ error: "Erreur Base de données" }, { status: 500 });
      }
    }
  }

  // On répond à Stripe que le message a bien été reçu
  return NextResponse.json({ received: true }, { status: 200 });
}