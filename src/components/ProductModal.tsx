"use client";

import { useEffect, useState, useMemo } from "react";
import { m, useAnimation, PanInfo, AnimatePresence } from "framer-motion"; // ✅ AnimatePresence ajouté
import { X, Minus, Plus, ShoppingCart, Check } from "lucide-react"; // ✅ Maximize2 supprimé (inutile)
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";

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

  // ✅ Correction 'any' : Utilisation de unknown pour l'événement inutilisé
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
        restaurant_id: item.restaurant_id, // ✅ Ajouté pour corriger l'erreur de type
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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md"
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
        className="bg-neutral-950 border-t md:border border-neutral-800 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[92vh] md:max-h-[85vh]"
      >
        <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto mt-4 mb-2 md:hidden" />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-30 bg-white/5 hover:bg-brand-primary text-white p-3 rounded-full backdrop-blur-md transition-all md:flex hidden"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          <div className="relative w-full md:w-1/2 bg-[#050505] h-[35vh] md:h-auto overflow-hidden group">
            {item.image_url ? (
              <Image 
                src={item.image_url} 
                alt={name} 
                fill
                className="object-contain p-8 md:p-12 transition-transform duration-1000 group-hover:scale-110"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-900 font-display text-4xl uppercase opacity-20 tracking-widest">Kabuki</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent md:hidden" />
          </div>

          <div className="p-8 md:p-12 md:w-1/2 flex flex-col">
            <div className="mb-6">
              <span className="text-brand-primary text-[10px] uppercase font-black tracking-[0.4em] mb-2 block">Signature Kabuki</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-tighter leading-none">
                {name}
              </h2>
            </div>
            
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed italic font-light mb-8 line-clamp-4">
              {desc || "Une création d'exception, alliant tradition ancestrale et modernité."}
            </p>

            <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                  <span className="text-neutral-500 text-[10px] uppercase font-black tracking-widest">Prix Unitaire</span>
                  <span className="text-xl font-bold text-white">{Number(item.price).toFixed(2)} <span className="text-[10px] text-neutral-500 uppercase">chf</span></span>
               </div>

               <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-[10px] uppercase font-black tracking-widest">Quantité</span>
                  <div className="flex items-center gap-6 bg-white/5 p-1 rounded-2xl border border-neutral-800">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-90"><Minus size={18} /></button>
                    <span className="font-bold text-white min-w-[20px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-90"><Plus size={18} /></button>
                  </div>
               </div>
            </div>

            <div className="mt-10">
              <m.button 
                onClick={handleAddToCart}
                disabled={isAdded}
                animate={isAdded ? { scale: [1, 0.98, 1.02, 1] } : {}}
                className={`w-full h-16 rounded-2xl uppercase tracking-[0.2em] text-[11px] font-black transition-all flex items-center justify-center gap-4 relative overflow-hidden ${
                  isAdded ? "bg-green-600 text-white" : "bg-white text-black hover:bg-brand-primary hover:text-white"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <m.div key="check" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="flex items-center gap-2">
                      <Check size={20} strokeWidth={3} /> Ajouté
                    </m.div>
                  ) : (
                    <m.div key="add" initial={{ y: -20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="flex items-center gap-2">
                      <ShoppingCart size={18} />
                      <span>Ajouter • {(item.price * quantity).toFixed(2)} CHF</span>
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