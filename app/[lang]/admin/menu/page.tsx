import { Metadata } from "next";
import MenuClient from "./MenuClient";
// ✅ CORRECTION IMPORT : On utilise le client Serveur pour ce Server Component !
import { createClient } from "@/utils/supabase/server";

// ✅ OPTIMISATION PERF : Mise en cache du menu côté serveur pendant 1 heure (3600 secondes)
// Cela signifie que le temps de réponse de ta base de données sera de 0ms pour la majorité de tes visiteurs.
export const revalidate = 3600; 

interface MenuProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(
  { params }: MenuProps
): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: resolvedParams.lang === "en" ? "Our Menu | Kabuki Sushi" :
           resolvedParams.lang === "es" ? "Nuestro Menú | Kabuki Sushi" :
           "Notre Menu | Kabuki Sushi",
    description: "Découvrez notre carte de sushis artisanaux.",
  };
}

export default async function MenuPage({ params }: MenuProps) {
  const resolvedParams = await params;
  
  // ✅ CORRECTION CLIENT : Initialisation du client Supabase Serveur
  const supabase = await createClient();

  // On récupère uniquement les produits actifs pour le menu public !
  const { data: menuItems, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true) // ✅ On n'affiche que ce qui est en stock
    .order("category", { ascending: true })
    .order("name_fr", { ascending: true });

  if (error) {
    console.error("Erreur chargement menu:", error.message);
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter mb-4">
            Notre <span className="text-kabuki-red">Carte</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto uppercase tracking-widest">
            {resolvedParams.lang === "en" ? "Handcrafted with passion" :
             resolvedParams.lang === "es" ? "Elaborado con pasión" :
             "Préparé avec passion et savoir-faire"}
          </p>
        </div>

        {/* On passe les données pré-chargées au composant interactif client */}
        <MenuClient initialItems={menuItems || []} lang={resolvedParams.lang} />
      </div>
    </main>
  );
}