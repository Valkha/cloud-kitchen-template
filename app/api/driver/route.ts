// app/api/driver/update-order/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Client avec droits étendus pour effectuer l'update après validation
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_STATUSES = ["En livraison", "Livrée"];

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    // 🛡️ SÉCURITÉ #4 : Vérification du rôle Livreur côté serveur
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_livreur")
      .eq("id", user.id)
      .single();

    if (!profile?.is_livreur) {
      return NextResponse.json({ error: "Accès refusé : Réservé aux livreurs" }, { status: 403 });
    }

    const { orderId, status, lat, lng } = await request.json();

    if (!orderId) return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });

    const updatePayload: any = {};
    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Statut non autorisé" }, { status: 400 });
      }
      updatePayload.status = status;
    }

    // Gestion des coordonnées (si transmises)
    if (lat !== undefined && lng !== undefined) {
      updatePayload.driver_lat = lat;
      updatePayload.driver_lng = lng;
    } else if (status === "Livrée") {
      // Nettoyage GPS en fin de course
      updatePayload.driver_lat = null;
      updatePayload.driver_lng = null;
    }

    // Mise à jour via Admin (bypass RLS restreinte)
    const { error } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DRIVER_API_ERROR]:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}