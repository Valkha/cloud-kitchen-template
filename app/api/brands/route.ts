import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialisation sécurisée hors de la fonction pour de meilleures performances
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  // 1. Vérification des variables d'environnement
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Configuration Supabase manquante dans le fichier .env" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 2. Requête vers la table 'brands'
    const { data, error: supabaseError } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    // 3. Gestion d'erreur spécifique à Supabase
    if (supabaseError) {
      throw new Error(supabaseError.message);
    }

    // 4. Retour des données (tableau vide par défaut)
    return NextResponse.json(data || []);

  } catch (error) {
    // ✅ Correction ESLint : On vérifie si l'erreur est une instance de Error
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    console.error("Supabase API Error:", errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}