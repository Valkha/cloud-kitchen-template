"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductModal, { MenuItem as ModalItem } from "./ProductModal";
import { AnimatePresence } from "framer-motion";

// On définit l'interface attendue pour éviter le 'any'
export interface WrapperItem extends ModalItem {
  restaurant_name?: string; 
  // name_fr est déjà hérité de ModalItem, pas besoin de le redéfinir ici
}

interface AddToCartWrapperProps {
  item: WrapperItem;
  lang: string;
}

export default function AddToCartWrapper({ item, lang }: AddToCartWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  // Détection souple du Tacos
  const isTacos = 
    (item.name?.toLowerCase().includes("tacos") || item.name_fr?.toLowerCase().includes("tacos")) &&
    item.restaurant_name?.toLowerCase().includes("lyonnaise");

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTacos) {
      setIsModalOpen(true);
    } else {
      addToCart(item);
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
          {isTacos 
            ? (lang === 'fr' ? 'Personnaliser' : 'Customize') 
            : (lang === 'fr' ? 'Ajouter au panier' : 'Add to cart')
          }
        </span>
      </button>

      <AnimatePresence mode="wait">
        {isModalOpen && (
          <ProductModal 
            key="tacos-modal"
            item={item as ModalItem} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}