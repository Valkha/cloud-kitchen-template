import { createClient } from "@/utils/supabase/client"; // Ajuste le chemin si besoin
import { CartItem } from "@/context/CartContext";

const supabase = createClient();

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  special_instructions?: string;
}

/**
 * Envoie la commande complète à Supabase en deux étapes :
 * 1. Création de l'entité globale 'orders'
 * 2. Insertion des lignes de plats 'order_items'
 */
export const submitOrder = async (
  restaurantSlug: string,
  customer: CustomerDetails,
  cartItems: CartItem[],
  totalAmount: number
) => {
  try {
    // 1. Récupérer l'ID UUID du restaurant grâce au slug de ta config
    const { data: restaurant, error: restoError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', restaurantSlug)
      .single();
      
    if (restoError || !restaurant) {
      throw new Error("Restaurant introuvable ou inactif.");
    }
    
    // 2. Créer la commande principale
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurant.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        total_amount: totalAmount,
        special_instructions: customer.special_instructions,
        status: 'pending' // En attente de préparation
      })
      .select('id')
      .single();
      
    if (orderError || !order) {
      throw new Error("Échec de la création de la commande globale.");
    }
    
    // 3. Préparer le tableau des plats à insérer
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id, // C'est maintenant un UUID (string)
      quantity: item.quantity,
      unit_price: item.price,
      product_name: item.name
    }));
    
    // 4. Insérer toutes les lignes d'un seul coup (Bulk insert)
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);
      
    if (itemsError) {
      // Dans un système de prod ultra-strict, on annulerait la commande ici (Rollback), 
      // mais pour l'instant on se contente de lever l'erreur.
      throw new Error("Échec de l'enregistrement des plats de la commande.");
    }
    
    // Succès total !
    return { success: true, orderId: order.id };
    
  } catch (error) {
    console.error("Erreur critique lors du checkout :", error);
    return { success: false, error };
  }
};