import { NextResponse } from "next/server";
import webpush, { PushSubscription } from "web-push";
import { createClient } from "@/utils/supabase/server";

// Interface pour typer les erreurs renvoyées par web-push
interface WebPushError {
  statusCode: number;
  body?: string;
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:example@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { orderId, title, body, url } = await req.json();
    const supabase = await createClient();

    // 1. Récupérer le user_id lié à la commande
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (!order?.user_id) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // 2. Récupérer les souscriptions
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", order.user_id);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "Aucun appareil enregistré" });
    }

    // 3. Envoyer la notification
    const notifications = subscriptions.map((sub) => {
      // ✅ On utilise le type PushSubscription importé
      const pushSub = sub.subscription as unknown as PushSubscription;
      
      return webpush.sendNotification(
        pushSub,
        JSON.stringify({ title, body, url })
      ).catch(async (err: WebPushError) => {
        // ✅ On utilise l'interface WebPushError au lieu de any
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("subscription", sub.subscription);
        }
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // ✅ Gestion d'erreur type-safe pour ESLint
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}