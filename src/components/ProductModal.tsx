"use client";

import { useEffect, useState, useMemo } from "react";
import { m, useAnimation, PanInfo, AnimatePresence } from "framer-motion"; 
import { X, Minus, Plus, ShoppingCart, Check } from "lucide-react"; 
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";
import { siteConfig } from "../../config/site";

export interface MenuItem extends ContextMenuItem {
  name_fr: string;
  name_en?: string;
  name_es?: string;
  description_fr: string;
  description_en?: string;
  description_es?: string;
}

interface ProductModalProps {
  item: MenuItem;
  onClose: () => void;
}

export default function ProductModal({ item, onClose }: ProductModalProps) {
  const { lang } = useTranslation();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 150) {
      onClose();
    } else {
      controls.start({ y: 0 });
    }
  };

  const { name, desc } = useMemo(() => {
    const currentLang = lang.toLowerCase();
    const n = currentLang === "es" ? item.name_es : currentLang === "en" ? item.name_en : item.name_fr;
    const d = currentLang === "es" ? item.description_es : currentLang === "en" ? item.description_en : item.description_fr;
    return {
      name: n?.trim() ? n : item.name_fr,
      desc: d?.trim() ? d : item.description_fr
    };
  }, [lang, item]);

  const handleAddToCart = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: item.id,
        name: name,
        price: item.price,
        image_url: item.image_url,
        category: item.category,
        restaurant_id: item.restaurant_id, 
        restaurant_name: item.restaurant_name
      });
    }

    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <m.div 
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[92vh] md:max-h-[85vh] cursor-default"
      >
        <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-4 mb-2 md:hidden" />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-30 bg-black/50 hover:bg-brand-primary border border-white/10 text-white p-3 rounded-full backdrop-blur-md transition-colors duration-300 md:flex hidden cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* IMAGE SECTION */}
          <div className="relative w-full md:w-1/2 bg-black h-[35vh] md:h-auto overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--brand-primary-rgb),0.1)_0%,transparent_70%)] opacity-50" />
            {item.image_url ? (
              <Image 
                src={item.image_url} 
                alt={name} 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-8 md:p-12 transition-transform duration-1000 group-hover:scale-110 drop-shadow-2xl"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-800 font-display text-4xl uppercase opacity-20 tracking-widest font-black">
                {siteConfig.name}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:hidden" />
          </div>

          {/* CONTENT SECTION */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-neutral-900">
            <div className="mb-6">
              <span className="text-brand-primary text-[10px] uppercase font-black tracking-[0.4em] mb-2 block flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                Transmission Planet Food
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
                {name}
              </h2>
            </div>
            
            <p className="text-gray-400 text-sm md:text-base leading-relaxed font-bold uppercase tracking-wider mb-8 overflow-y-auto custom-scrollbar">
              {desc || "Aucune information supplémentaire fournie pour cette transmission."}
            </p>

            <div className="space-y-6 mt-auto">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Coût Unitaire</span>
                  <span className="text-2xl font-display font-black text-white tracking-tighter">
                    {Number(item.price).toFixed(2)} <span className="text-[10px] text-brand-primary uppercase tracking-widest">{siteConfig.currency}</span>
                  </span>
               </div>

               <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Quantité requise</span>
                  <div className="flex items-center gap-6 bg-black p-1.5 rounded-2xl border border-white/5">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary transition-colors active:scale-90 cursor-pointer"><Minus size={18} /></button>
                    <span className="font-black text-white min-w-[20px] text-center text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary transition-colors active:scale-90 cursor-pointer"><Plus size={18} /></button>
                  </div>
               </div>
            </div>

            <div className="mt-8">
              <m.button 
                onClick={handleAddToCart}
                disabled={isAdded}
                animate={isAdded ? { scale: [1, 0.95, 1.05, 1] } : {}}
                className={`w-full h-16 rounded-2xl uppercase tracking-[0.3em] text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden cursor-pointer ${
                  isAdded 
                    ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                    : "bg-white text-black hover:bg-brand-primary hover:text-white shadow-xl hover:shadow-[0_0_25px_rgba(var(--brand-primary-rgb),0.5)]"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <m.div key="check" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-3">
                      <Check size={20} strokeWidth={3} /> Transmission réussie
                    </m.div>
                  ) : (
                    <m.div key="add" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="flex items-center gap-3">
                      <ShoppingCart size={18} />
                      <span>Ajouter au vaisseau • {(item.price * quantity).toFixed(2)} {siteConfig.currency}</span>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.button>
            </div>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}