import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // Empêche le cache statique au build

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  // 1. Vérification des variables d'environnement
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Variables d'environnement manquantes" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 2. Récupération des données
    const { data, error: supabaseError } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (supabaseError) throw new Error(supabaseError.message);

    // 3. Réponse avec headers anti-cache
    return NextResponse.json(data || [], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    // ✅ Correction ESLint : On évite 'any' en vérifiant le type de l'erreur
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    console.error("API Brands Error:", errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}