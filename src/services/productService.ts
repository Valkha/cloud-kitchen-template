import { createClient } from "@/utils/supabase/client"; // Ajuste l'import vers ton client Supabase

export const getRestaurantMenu = async (restaurantSlug: string) => {
  const supabase = createClient();

  try {
    // 1. Récupérer l'ID du restaurant
    const { data: restaurant, error: restoError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', restaurantSlug)
      .single();

    if (restoError || !restaurant) {
      console.error("Erreur : Restaurant introuvable pour le slug :", restaurantSlug);
      console.error("Détails :", restoError?.message);
      return null;
    }

    // 2. Récupérer les produits liés avec le nom de leur catégorie
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name_fr
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .eq('is_available', true); // Optionnel : ne charger que les produits dispos

    if (error) {
      // ✅ On déstructure l'erreur pour forcer le terminal à l'afficher en texte clair
      console.error("Erreur lors de la récupération du menu :");
      console.error("- Message :", error.message);
      console.error("- Détails :", error.details);
      console.error("- Indice :", error.hint);
      return null;
    }

    return products;

  } catch (err) {
    console.error("Erreur inattendue dans getRestaurantMenu :", err);
    return null;
  }
};