import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Config manquante" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error: supabaseError } = await supabase
      .from("products")
      // ✅ On adapte la jointure : 'restaurants(name)' au lieu de 'brands(name)'
      .select("*, restaurants(name)")
      .eq("is_featured", true)
      .limit(3);

    if (supabaseError) throw new Error(supabaseError.message);

    return NextResponse.json(data || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}