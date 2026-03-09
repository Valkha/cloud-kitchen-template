import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile, error: dbError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') throw dbError;

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}