import MenuClient from "../../../src/components/MenuClient";
import { getRestaurantMenu } from "../../../src/services/productService";
import { siteConfig } from "../../../config/site";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Menu | ${siteConfig.name}`,
    description: "Découvrez notre sélection de plats exceptionnels.",
  };
}

// ✅ Interface pour définir exactement ce que renvoie Supabase et éliminer l'erreur "any"
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
  // ✅ On force TypeScript à accepter restaurantSlug même s'il n'est pas encore dans ton type officiel.
  // Pense bien à l'ajouter dans ton fichier config/site.ts (ex: restaurantSlug: "kabuki-sushi")
  const config = siteConfig as Record<string, unknown>;
  const slug = (config.restaurantSlug as string) || "ma-super-cuisine";

  // 1. Récupération des produits depuis Supabase
  const rawProducts = await getRestaurantMenu(slug);

  // 2. Formatage des données avec l'interface RawProduct
  const formattedProducts = (rawProducts || []).map((product: RawProduct) => ({
    id: product.id,
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