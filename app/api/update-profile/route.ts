import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide ou expirée." }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, address, zipCode, city } = body;

    const { error: dbError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        phone,
        address,
        zip_code: zipCode,
        city,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // ✅ CORRECTION : Utilisation de 'unknown' au lieu de 'any'
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur inconnue";
    console.error("[API_PROFILE_ERROR]:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}