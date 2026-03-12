import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// ✅ Définition d'un type strict pour les mises à jour de commande
type OrderUpdatePayload = {
  status?: string;
  driver_lat?: number | null;
  driver_lng?: number | null;
};

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Aligné sur les statuts techniques utilisés dans le dashboard et la DB
const ALLOWED_STATUSES = ["shipped", "delivered"];

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Vérification de l'authentification
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Vérification des droits (Profil Livreur)
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_livreur")
      .eq("id", user.id)
      .single();

    if (!profile?.is_livreur) {
      return NextResponse.json({ error: "Accès refusé : réservé aux livreurs" }, { status: 403 });
    }

    const { orderId, status, lat, lng } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 3. Construction du payload de mise à jour avec typage strict
    const updatePayload: OrderUpdatePayload = {};

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: `Statut non autorisé : ${status}` }, { status: 400 });
      }
      updatePayload.status = status;
    }

    // Gestion de la géolocalisation
    if (lat !== undefined && lng !== undefined) {
      updatePayload.driver_lat = lat;
      updatePayload.driver_lng = lng;
    } 
    
    // Si la commande est livrée, on nettoie les coordonnées GPS
    if (status === "delivered") {
      updatePayload.driver_lat = null;
      updatePayload.driver_lng = null;
    }

    // 4. Mise à jour via le client admin (Service Role)
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[DRIVER_API_ERROR]:", errorMessage);
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour" }, { status: 500 });
  }
}