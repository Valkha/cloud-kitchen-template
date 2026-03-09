import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache"; // ✅ Ajout crucial

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, address, zipCode, city, lang } = body; // ✅ On récupère 'lang'

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

    // ✅ FORCE LE SERVEUR À RECHARGER LA PAGE PROFIL
    // Cela efface le cache de Next.js pour cette route précise
    revalidatePath(`/${lang}/profile`);
    revalidatePath(`/${lang}/profile/settings`);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}