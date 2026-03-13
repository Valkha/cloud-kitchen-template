"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCart, MenuItem } from "@/context/CartContext";
// ✅ Import de l'interface spécifique de la modale
import ProductModal, { MenuItem as ModalItem } from "./ProductModal";

// Interface étendue pour le Wrapper
interface ExtendedMenuItem extends MenuItem {
  name_fr?: string;
  description_fr?: string;
  description_en?: string;
  description_es?: string;
}

interface AddToCartWrapperProps {
  item: ExtendedMenuItem;
  lang: string;
}

export default function AddToCartWrapper({ item, lang }: AddToCartWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  // Détection : Est-ce un Tacos de chez "A La Lyonnaise" ?
  const isTacos = 
    item.name_fr?.toLowerCase().includes("tacos") && 
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

      {/* ✅ Correction TypeScript : Cast vers ModalItem au lieu de any */}
      {isModalOpen && (
        <ProductModal 
          item={item as ModalItem} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}