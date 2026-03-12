import MenuClient from "./MenuClient"; 
import { getRestaurantMenu } from "@/services/productService";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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

// ✅ Les Server Components Next.js 15+ reçoivent params et searchParams sous forme de Promesses
export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const lang = resolvedParams.lang || "fr";
  
  // ✅ 1. On lit le paramètre ?restaurant=slug dans l'URL
  const restaurantSlug = resolvedSearchParams.restaurant;

  // ✅ 2. Si aucun restaurant n'est ciblé, on renvoie vers la Marketplace (l'accueil)
  if (!restaurantSlug || typeof restaurantSlug !== "string") {
    redirect(`/${lang}`);
  }

  // ✅ 3. Récupération des produits pour ce restaurant spécifique
  const rawProducts = await getRestaurantMenu(restaurantSlug);

  // 4. Formatage des données pour le client
  const formattedProducts = (rawProducts || []).map((product: RawProduct) => ({
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

  // ✅ 5. On passe les produits ET le nom du restaurant (via le slug pour l'instant) au client
  return <MenuClient initialItems={formattedProducts} restaurantSlug={restaurantSlug} />;
}