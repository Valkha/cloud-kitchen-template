import { createClient } from "@/utils/supabase/client";

export async function getRestaurantMenu(slug: string) {
  const supabase = createClient();
  
  try {
    // 1. On trouve d'abord l'ID exact du restaurant grâce à son slug
    const { data: restaurant, error: restoError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true) // Sécurité : on s'assure qu'il est actif
      .single();

    if (restoError || !restaurant) {
      console.error("Restaurant introuvable ou inactif :", slug);
      return [];
    }

    // 2. On récupère UNIQUEMENT les produits liés à cet ID de restaurant
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (name_fr)
      `)
      .eq('restaurant_id', restaurant.id) // 👈 C'EST ICI LE FILTRE MAGIQUE
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error("Erreur lors de la récupération des produits :", productsError);
      return [];
    }

    return products;
  } catch (error) {
    console.error("Erreur inattendue dans getRestaurantMenu :", error);
    return [];
  }
}