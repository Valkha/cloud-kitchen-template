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
  restaurant_id: string;
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
  const restaurantSlug = resolvedSearchParams.restaurant;

  // ✅ Le Videur : Pas de resto = retour au choix des enseignes
  if (!restaurantSlug || typeof restaurantSlug !== "string" || restaurantSlug === "all") {
    redirect(`/${lang}#restaurants`);
  }

  const rawProducts = await getRestaurantMenu(restaurantSlug);

  const formattedProducts = (rawProducts || []).map((product: RawProduct) => ({
    id: product.id,
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
    restaurant_id: product.restaurant_id,
    restaurant_name: restaurantSlug.replace(/-/g, ' '), 
  }));

  return <MenuClient initialItems={formattedProducts} restaurantSlug={restaurantSlug} />;
}