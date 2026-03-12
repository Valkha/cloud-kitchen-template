import MenuClient from "./MenuClient"; 
import { getRestaurantMenu } from "@/services/productService";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Menu | ${siteConfig.name}`,
    description: "Découvrez notre sélection de plats exceptionnels.",
  };
}

interface RawProduct {
  id: string;
  name_fr: string;
  name_en?: string;
  name_es?: string;
  description_fr?: string;
  description_en?: string;
  description_es?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  categories?: { name_fr: string } | null;
}

export default async function MenuPage() {
  const config = siteConfig as Record<string, unknown>;
  const slug = (config.restaurantSlug as string) || "ma-super-cuisine";

  // 1. Récupération des produits depuis Supabase
  const rawProducts = await getRestaurantMenu(slug);

  // 2. Formatage des données
  const formattedProducts = (rawProducts || []).map((product: RawProduct) => ({
    // ✅ RETOUR DU HACK : On force le type number pour TS, 
    // mais à l'exécution ce sera bien le string UUID de Supabase.
    id: product.id as unknown as number, 
    
    name: product.name_fr,
    name_fr: product.name_fr,
    name_en: product.name_en,
    name_es: product.name_es,
    description_fr: product.description_fr || "",
    description_en: product.description_en,
    description_es: product.description_es,
    price: product.price,
    image_url: product.image_url,
    is_available: product.is_available,
    category: product.categories?.name_fr || "Non classé",
  }));

  return <MenuClient initialItems={formattedProducts} />;
}