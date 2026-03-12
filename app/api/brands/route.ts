import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// On initialise le client (utilise tes variables d'environnement)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 🛰️ Récupération des données depuis la table 'brands'
    // .select('*') récupère toutes les colonnes
    const { data: brands, error } = await supabase
      .from('brands') 
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la liaison avec Supabase" },
      { status: 500 }
    );
  }
}