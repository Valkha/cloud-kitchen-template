"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Plus, Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";

// ✅ On définit proprement ce qu'est un produit pour ce composant
interface ProductItem extends ContextMenuItem {
  name_fr: string;
  restaurant_name?: string;
}

interface ProductCardProps {
  product: ProductItem;
  onOpenModal: (product: ProductItem) => void;
}

export default function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name_fr,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      restaurant_id: product.restaurant_id,
    });

    setIsAdded(true);
    if (window.navigator?.vibrate) window.navigator.vibrate(15);
    
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <m.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onOpenModal(product)}
      className="group relative bg-neutral-900/40 border border-neutral-800/50 rounded-[2.5rem] p-4 cursor-pointer transition-colors hover:bg-neutral-900 hover:border-brand-primary/30"
    >
      <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-black/20 mb-4">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name_fr}
            fill 
            className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full opacity-10 font-display">Kabuki</div>
        )}

        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
            isAdded ? "bg-green-600 text-white" : "bg-white text-black hover:bg-brand-primary hover:text-white"
          }`}
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <m.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check size={20} strokeWidth={3} />
              </m.div>
            ) : (
              <m.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Plus size={20} strokeWidth={3} />
              </m.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="px-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-display font-bold text-base uppercase tracking-tight leading-tight group-hover:text-brand-primary transition-colors">
            {product.name_fr}
          </h3>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest flex items-center gap-1">
            <ShoppingBag size={10} /> {product.restaurant_name || "Food Court"}
          </span>
          <span className="font-display font-black text-white italic">
            {Number(product.price).toFixed(2)} <span className="text-[9px] not-italic text-neutral-500">CHF</span>
          </span>
        </div>
      </div>
    </m.div>
  );
}