"use client";

import { useEffect, useState, useMemo } from "react";
import { m } from "framer-motion"; 
import { X, Minus, Plus, ShoppingCart, Maximize2 } from "lucide-react";
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

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

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
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: item.id,
        name: name,
        price: item.price,
        image_url: item.image_url,
        category: item.category,
      });
    }
    onClose();
  };

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
    >
      <m.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: "transform, opacity" }}
        className="bg-neutral-950 border border-neutral-800 rounded-[2rem] md:rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[95vh]"
      >
        <button 
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-6 right-6 z-30 bg-white/10 hover:bg-kabuki-red text-white p-3 rounded-full backdrop-blur-md transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        {/* --- ZONE IMAGE : OPTIMISATION NETTETÉ --- */}
        <div className="relative w-full bg-[#050505] h-[40vh] md:h-[55vh] flex-shrink-0 group overflow-hidden border-b border-neutral-900/50">
          {item.image_url ? (
            <Image 
              src={item.image_url} 
              alt={name} 
              fill
              // ✅ CORRECTIF ANTI-FLOU : Qualité maximale pour la vue détaillée
              quality={95}
              // ✅ CORRECTIF ANTI-FLOU : sizes généreux pour les écrans Retina (2x/3x)
              // On demande une résolution de ~1200px même si l'affichage réel est plus petit
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-contain p-4 md:p-10 transition-transform duration-700 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-800 font-display text-5xl uppercase opacity-10 tracking-[0.4em]">
              Kabuki
            </div>
          )}

          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white/20 uppercase text-[8px] tracking-[0.3em] font-bold pointer-events-none">
            <Maximize2 size={10} />
            Définition Optimale
          </div>
        </div>

        {/* --- CONTENU TEXTE --- */}
        <div className="p-8 md:p-12 flex flex-col flex-grow overflow-y-auto no-scrollbar">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter leading-none mb-2">
                {name}
              </h2>
              <span className="text-kabuki-red text-[10px] uppercase font-black tracking-[0.4em]">Signature Kabuki</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white whitespace-nowrap">
              {Number(item.price).toFixed(2)} <span className="text-xs text-neutral-500 uppercase ml-1">chf</span>
            </div>
          </div>
          
          <div className="mb-12">
            <h4 className="text-neutral-600 text-[10px] uppercase font-black tracking-[0.3em] mb-4">Description de la création</h4>
            <p className="text-neutral-400 text-sm md:text-lg leading-relaxed italic font-light max-w-2xl">
              {desc || "L'excellence du sushi Kabuki, préparée avec passion et précision par nos maîtres sushis."}
            </p>
          </div>

          {/* SÉLECTEUR & ACTION */}
          <div className="mt-auto flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center bg-white/5 border border-neutral-800 rounded-2xl h-16 w-full sm:w-auto overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-16 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:bg-neutral-800"
              >
                <Minus size={20} />
              </button>
              <span className="w-10 text-center font-bold text-white text-xl">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                className="w-16 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:bg-neutral-800"
              >
                <Plus size={20} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-1 w-full bg-kabuki-red hover:bg-red-700 text-white font-bold h-16 rounded-2xl uppercase tracking-[0.2em] text-[11px] transition-all active:scale-[0.98] shadow-2xl shadow-red-900/20 flex items-center justify-center gap-4"
            >
              <ShoppingCart size={20} />
              <span>Ajouter • {(item.price * quantity).toFixed(2)} CHF</span>
            </button>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}