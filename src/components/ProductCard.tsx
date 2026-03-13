"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Plus, Check, Store } from "lucide-react";
import Image from "next/image";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";
import { siteConfig } from "../../config/site";

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
  const [imgError, setImgError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      onClick={() => onOpenModal(product)}
      className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 rounded-[2.5rem] p-4 cursor-pointer transition-all duration-500 hover:bg-neutral-900 hover:border-[var(--brand-primary)]/50 hover:shadow-[0_10px_40px_rgba(var(--brand-primary-rgb),0.15)] flex flex-col h-full"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-black/40 mb-5 flex-shrink-0">
        {!imgError && product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name_fr}
            fill 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className={`object-contain p-6 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-800 font-black uppercase tracking-widest text-[10px]">
            {siteConfig.name}
          </div>
        )}

        {/* QUICK ADD BUTTON */}
        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl z-10 ${
            isAdded 
              ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
              : "bg-white text-black hover:bg-[var(--brand-primary)] hover:text-white hover:shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.6)]"
          }`}
          aria-label="Ajouter au panier"
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <m.div key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
                <Check size={22} strokeWidth={3} />
              </m.div>
            ) : (
              <m.div key="plus" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }}>
                <Plus size={22} strokeWidth={3} />
              </m.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* TEXT CONTENT */}
      <div className="px-2 flex flex-col flex-grow justify-between">
        <h3 className="font-display font-black text-base uppercase tracking-wider leading-tight group-hover:text-[var(--brand-primary)] transition-colors mb-2">
          {product.name_fr}
        </h3>
        
        <div className="flex justify-between items-end mt-auto pt-2 border-t border-white/5">
          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1.5">
            <Store size={12} className="text-[var(--brand-primary)]" /> 
            {product.restaurant_name || "Food Court"}
          </span>
          <span className="font-display font-black text-white text-lg leading-none">
            {Number(product.price).toFixed(2)} <span className="text-[10px] text-[var(--brand-primary)] tracking-widest ml-0.5">{siteConfig.currency}</span>
          </span>
        </div>
      </div>
    </m.div>
  );
}