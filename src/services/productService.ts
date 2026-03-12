import { createClient } from "@/utils/supabase/client";

// Initialisation du client Supabase pour le côté navigateur
const supabase = createClient();

/**
 * Récupère le menu complet (produits et catégories) pour un restaurant spécifique.
 * Le filtrage par 'slug' via une jointure (inner join) assure que seules les données
 * appartenant à l'enseigne demandée sont retournées.
 * * @param restaurantSlug - Le slug unique du restaurant (ex: 'kabuki-sushi')
 */
export const getRestaurantMenu = async (restaurantSlug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (*),
      restaurants!inner(slug)
    `)
    .eq('restaurants.slug', restaurantSlug)
    .eq('is_available', true)
    .order('order', { ascending: true });

  if (error) {
    console.error("Erreur lors de la récupération du menu :", error);
    return null;
  }

  return data;
};

/**
 * Récupère la liste des catégories pour un restaurant donné.
 * Cette fonction est utile pour générer les onglets de navigation du menu.
 * * @param restaurantSlug - Le slug du restaurant
 */
export const getCategoriesByRestaurant = async (restaurantSlug: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      restaurants!inner(slug)
    `)
    .eq('restaurants.slug', restaurantSlug)
    .order('order', { ascending: true });

  if (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    return null;
  }

  return data;
};