import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache"; 

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // ✅ SÉCURITÉ : Vérification d'identité stricte via la session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide ou expirée." }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, address, zipCode, city, lang } = body;

    // ✅ UPSERT sécurisé : On force l'ID de l'utilisateur connecté
    const { data: updatedProfile, error: dbError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id, 
        full_name: fullName,
        phone,
        address,
        zip_code: zipCode,
        city,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single(); 

    if (dbError) throw dbError;

    // ✅ INVALIDATION DU CACHE : Pour une mise à jour instantanée côté serveur
    if (lang) {
      revalidatePath(`/${lang}/profile`);
      revalidatePath(`/${lang}/profile/settings`);
    }

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[API_PROFILE_UPDATE_ERROR]:", errorMessage);
    
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil." }, 
      { status: 500 }
    );
  }
}