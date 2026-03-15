import { createClient } from "@/utils/supabase/client"; 
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
  restaurantSlug: string, // On garde ce paramètre pour ne pas casser le typage de CartDrawer
  customer: CustomerDetails,
  cartItems: CartItem[],
  totalAmount: number
) => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Le panier est vide.");
    }

    // 1. Plus besoin du slug ! On récupère l'UUID exact du restaurant depuis le premier plat du panier
    const restaurantId = cartItems[0].restaurant_id;
    
    if (!restaurantId) {
      throw new Error("Restaurant introuvable pour cette commande.");
    }
    
    // 2. Créer la commande principale
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: restaurantId,
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
      console.error("Erreur de création de commande :", orderError);
      throw new Error("Échec de la création de la commande globale.");
    }
    
    // 3. Préparer le tableau des plats à insérer
    const orderItemsToInsert = cartItems.map(item => {
      // ✅ SÉCURITÉ : On extrait uniquement les 36 premiers caractères pour récupérer le vrai UUID du produit
      // Cela enlève le timestamp "-171243567-0" qu'on avait ajouté dans ProductModal pour les personnalisations
      const realProductId = String(item.id).substring(0, 36);

      return {
        order_id: order.id,
        product_id: realProductId,
        quantity: item.quantity,
        unit_price: item.price,
        product_name: item.name
      };
    });
    
    // 4. Insérer toutes les lignes d'un seul coup (Bulk insert)
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);
      
    if (itemsError) {
      console.error("Erreur d'insertion des items :", itemsError);
      throw new Error("Échec de l'enregistrement des plats de la commande.");
    }
    
    // Succès total !
    return { success: true, orderId: order.id };
    
  } catch (error) {
    console.error("Erreur critique lors du checkout :", error);
    return { success: false, error };
  }
};