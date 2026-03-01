import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// 1. Initialisation de Stripe avec ta version d'API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// 2. Initialisation du client Supabase Admin (Service Role)
// Important : Cette clé permet de modifier la table 'orders' même avec des RLS strictes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text(); // Stripe nécessite le corps brut pour la vérification
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    // 🔒 VÉRIFICATION : On s'assure que l'appel vient réellement de Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error("⚠️ Erreur de signature Webhook :", error.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // 3. Traitement du succès de paiement
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Récupération de l'ID de la commande stocké dans le PaymentIntent lors de sa création
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      console.log(`💰 Paiement confirmé pour la commande #${orderId}. Mise à jour BDD...`);
      
      // Mise à jour du statut en "Payé"
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ status: "Payé" })
        .eq("id", orderId);

      if (error) {
        console.error(`❌ Erreur mise à jour Supabase (Commande ${orderId}):`, error.message);
        return NextResponse.json({ error: "Erreur Base de données" }, { status: 500 });
      }
      
      console.log(`✅ Commande #${orderId} marquée comme PAYÉE en cuisine.`);
    } else {
      console.warn("⚠️ Aucun orderId trouvé dans les métadonnées de ce paiement.");
    }
  }

  // On répond à Stripe que nous avons bien reçu l'événement
  return NextResponse.json({ received: true }, { status: 200 });
}