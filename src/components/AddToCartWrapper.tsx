"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductModal, { MenuItem as ModalItem } from "./ProductModal";
import { AnimatePresence } from "framer-motion";

// ✅ On retire 'restaurant_id?: string' pour respecter le typage strict du parent qui l'exige comme 'string'
export interface WrapperItem extends ModalItem {
  restaurant_name?: string; 
}

interface AddToCartWrapperProps {
  item: WrapperItem;
  lang: string;
}

// Utilisation sécurisée des variables d'environnement
const UUID_LYONNAISE = process.env.NEXT_PUBLIC_RESTAURANT_LYONNAISE_ID;
const UUID_PIZZA_STATION = process.env.NEXT_PUBLIC_RESTAURANT_PIZZA_STATION_ID;

export default function AddToCartWrapper({ item, lang }: AddToCartWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  // Logique de détection par UUID (robuste)
  const isTacos = Boolean(
    item.restaurant_id === UUID_LYONNAISE && 
    (item.name?.toLowerCase().includes("tacos") || item.name_fr?.toLowerCase().includes("tacos"))
  );
  const isPizza = item.restaurant_id === UUID_PIZZA_STATION;
  
  const needsModal = isTacos || isPizza;

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (needsModal) {
      setIsModalOpen(true);
    } else {
      addToCart(item); // Plus d'erreur ici, le typage correspond parfaitement !
    }
  };

  return (
    <>
      <button
        onClick={handleAction}
        className="w-full bg-white/5 hover:bg-brand-primary border border-white/10 hover:border-brand-primary text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group cursor-pointer"
      >
        <Plus size={18} className="text-brand-primary group-hover:text-white transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {needsModal 
            ? (lang === 'fr' ? 'Personnaliser' : 'Customize') 
            : (lang === 'fr' ? 'Ajouter au panier' : 'Add to cart')
          }
        </span>
      </button>

      <AnimatePresence mode="wait">
        {isModalOpen && (
          <ProductModal 
            key="product-modal"
            item={item as ModalItem} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}