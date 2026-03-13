import { createClient } from "@/utils/supabase/client";

export async function getRestaurantMenu(slug: string) {
  const supabase = createClient();
  
  try {
    // ✅ 1. LA VOIE RAPIDE (FOOD COURT) : On récupère tous les produits disponibles
    if (slug === "all") {
      const { data: allProducts, error: allProductsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (name_fr)
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (allProductsError) {
        console.error("Erreur lors de la récupération du menu global :", allProductsError);
        return [];
      }

      return allProducts;
    }

    // 👇 2. LE COMPORTEMENT NORMAL : On trouve l'ID exact du restaurant
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

    // 3. On récupère UNIQUEMENT les produits liés à cet ID de restaurant
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