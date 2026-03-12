import { Metadata } from "next";
import MenuClient from "./MenuClient";
import { createClient } from "@/utils/supabase/server";
import { siteConfig } from "../../../config/site"; // ✅ Import de la configuration globale

// ✅ OPTIMISATION PERF : Mise en cache du menu côté serveur
export const revalidate = 3600;

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || "fr";

  // ✅ SEO Dynamique et Vanillé
  const titles: Record<string, string> = {
    fr: `Notre Carte | ${siteConfig.name}`,
    en: `Our Menu | ${siteConfig.name}`,
    es: `Nuestra Carta | ${siteConfig.name}`,
  };

  const descriptions: Record<string, string> = {
    fr: `Découvrez la carte de ${siteConfig.name}. Profitez de nos plats à emporter ou en livraison directe.`,
    en: `Discover the menu at ${siteConfig.name}. Enjoy our dishes for takeaway or direct delivery.`,
    es: `Descubre la carta de ${siteConfig.name}. Disfruta de nuestros platos para llevar o con entrega a domicilio.`,
  };

  return {
    title: titles[lang] || titles.fr,
    description: descriptions[lang] || descriptions.fr,
  };
}

export default async function MenuPage({ params }: Props) {
  // On attend la résolution des params pour Next.js 15+
  await params; 

  // ✅ INITIALISATION DU CLIENT SUPABASE SERVEUR
  const supabase = await createClient();

  const { data } = await supabase
    .from("menu_items")
    .select("id, name_fr, name_en, name_es, description_fr, description_en, description_es, price, image_url, category, is_available") 
    .eq("is_available", true)
    .order("id", { ascending: true });

  // ✅ CORRECTION TS : On formate les données pour le contexte du panier
  const formattedData = (data || []).map((item) => ({
    ...item,
    name: item.name_fr 
  }));

  // ✅ FIX : On ne passe QUE initialItems car MenuClient ne gère pas la prop 'lang'
  return <MenuClient initialItems={formattedData} />;
}