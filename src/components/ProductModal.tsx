"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
// ✅ Correction ESLint : Retrait de PanInfo et useAnimation inutilisés
import { motion, AnimatePresence } from "framer-motion"; 
import { X, Minus, Plus, ShoppingCart, Check } from "lucide-react"; 
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";
import { siteConfig } from "../../config/site";

export interface MenuItem extends ContextMenuItem {
  name_fr: string; 
  name_en?: string;
  name_es?: string;
  description_fr?: string; 
  description_en?: string;
  description_es?: string;
}

interface ProductModalProps {
  item: MenuItem;
  onClose: () => void;
}

const TACOS_CONFIG = {
  format: { label: "1. Choisissez votre format", max: 1, options: [
    { name: "Standard", price: 0 },
    { name: "Format XL", price: 12.0 }
  ]},
  sauces: { label: "Nos sauces (2 max)", max: 2, options: [
    { name: "Algérienne", price: 0 }, { name: "Biggy", price: 0 }, { name: "Ketchup", price: 0 }, 
    { name: "Mayo", price: 0 }, { name: "Samouraï", price: 0 }, { name: "Andalouse", price: 0 }, 
    { name: "Curry", price: 0 }, { name: "Marocaine", price: 0 }, { name: "Blanche", price: 0 }, 
    { name: "Tartare", price: 0 }, { name: "Sauce cheddar", price: 2.0 }, { name: "Extra sauce fromagère", price: 2.5 }
  ]},
  crudites: { label: "Crudités (3 max)", max: 3, options: [
    { name: "Salade", price: 0 }, { name: "Tomates", price: 0 }, { name: "Oignons", price: 0 }, 
    { name: "Oignons frits", price: 0 }, { name: "Olives", price: 0 }, { name: "Piments", price: 0 }, 
    { name: "Poivrons", price: 0 }, { name: "Cornichon", price: 0 }
  ]},
  viandes: { label: "Nos viandes (1 max)", max: 1, options: [
    { name: "Viande hachée", price: 0 }, { name: "Poulet nature", price: 0 }, { name: "Poulet tandoori", price: 0 }, 
    { name: "Poulet curry", price: 0 }, { name: "Merguez", price: 0 }, { name: "Kebab poulet", price: 0 }, 
    { name: "Kebab bœuf", price: 2.0 }, { name: "Tenders", price: 2.0 }, { name: "Cordon bleu", price: 2.0 }
  ]},
  extraViandes: { label: "Viandes supplémentaires (1 max)", max: 1, options: [
    { name: "Aucune", price: 0 }, { name: "Viandes hachée", price: 5.5 }, { name: "Poulet nature", price: 5.5 }, 
    { name: "Poulet tandoori", price: 5.5 }, { name: "Poulet curry", price: 5.5 }, { name: "Merguez", price: 5.5 }, 
    { name: "Kebab poulet", price: 5.5 }, { name: "Kebab bœuf", price: 7.5 }, { name: "Tenders", price: 7.5 }, { name: "Cordon bleu", price: 7.5 }
  ]},
  gratinage: { label: "Gratinage (1 max)", max: 1, options: [
    { name: "Aucun", price: 0 }, { name: "Cheddar", price: 2.5 }, { name: "Raclette", price: 2.5 }, 
    { name: "Camembert", price: 2.5 }, { name: "Fromage râpé", price: 2.5 }, { name: "Raclette - lardon", price: 5.0 }, { name: "Chèvre - miel", price: 5.0 }
  ]}
};

export default function ProductModal({ item, onClose }: ProductModalProps) {
  const { lang } = useTranslation();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isCustomTacos = item.name_fr?.toLowerCase().includes("tacos") && item.restaurant_name?.toLowerCase().includes("lyonnaise");

  const [tacosSelections, setTacosSelections] = useState<Record<string, string[]>>({
    format: ["Standard"], sauces: [], crudites: [], viandes: [], extraViandes: ["Aucune"], gratinage: ["Aucun"]
  });

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(handle);
      document.body.style.overflow = "unset";
    };
  }, []);

  const { baseName, desc } = useMemo(() => {
    const currentLang = lang.toLowerCase();
    const n = currentLang === "es" ? item.name_es : currentLang === "en" ? item.name_en : item.name_fr;
    const d = currentLang === "es" ? item.description_es : currentLang === "en" ? item.description_en : item.description_fr;
    return { baseName: n?.trim() || item.name_fr, desc: d?.trim() || item.description_fr };
  }, [lang, item]);

  const finalPrice = useMemo(() => {
    let extraCost = 0;
    if (isCustomTacos) {
      Object.entries(tacosSelections).forEach(([key, selections]) => {
        selections.forEach(sel => {
          const opt = TACOS_CONFIG[key as keyof typeof TACOS_CONFIG].options.find(o => o.name === sel);
          if (opt) extraCost += opt.price;
        });
      });
    }
    return item.price + extraCost;
  }, [item.price, isCustomTacos, tacosSelections]);

  const handleOptionToggle = (category: keyof typeof TACOS_CONFIG, optionName: string, max: number) => {
    setTacosSelections(prev => {
      const current = prev[category];
      if (current.includes(optionName)) {
        if (category === 'format') return prev;
        return { ...prev, [category]: current.filter(n => n !== optionName) };
      }
      return { ...prev, [category]: max === 1 ? [optionName] : current.length < max ? [...current, optionName] : current };
    });
  };

  const handleAddToCart = () => {
    if (window.navigator?.vibrate) window.navigator.vibrate(20);
    let finalName = baseName;
    if (isCustomTacos) {
      const extras = Object.values(tacosSelections).flat().filter(n => !["Aucune", "Aucun", "Standard"].includes(n));
      const xl = tacosSelections.format[0] === "Format XL" ? " XL" : "";
      finalName = `${baseName}${xl} (${extras.join(", ")})`;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...item, id: isCustomTacos ? `${item.id}-${Date.now()}-${i}` : item.id, name: finalName, price: finalPrice });
    }
    setIsAdded(true);
    setTimeout(() => onClose(), 600);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="relative bg-neutral-900 border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-brand-primary text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90">
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          <div className="relative w-full md:w-1/2 bg-black h-[20vh] md:h-auto overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--brand-primary-rgb),0.1)_0%,transparent_70%)]" />
            {item.image_url ? (
              <Image src={item.image_url} alt={baseName} fill className="object-contain p-6 md:p-12 drop-shadow-2xl" priority />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-800 font-display text-4xl uppercase opacity-20 font-black">Planet Food</div>
            )}
          </div>

          <div className="p-6 md:p-10 md:w-1/2 flex flex-col bg-neutral-900 overflow-hidden">
            <div className="mb-4 shrink-0">
              <span className="text-brand-primary text-[8px] uppercase font-black tracking-[0.4em] mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                Transmission Planet Food
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tighter leading-tight">{baseName}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
              {!isCustomTacos ? (
                <p className="text-gray-400 text-sm leading-relaxed font-bold uppercase tracking-wider">{desc}</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(TACOS_CONFIG).map(([key, category]) => (
                    <div key={key} className="bg-black/30 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-black uppercase tracking-widest text-[11px]">{category.label}</h4>
                        {key === 'viandes' && tacosSelections.viandes.length === 0 && (
                          <span className="text-red-500 text-[9px] uppercase font-black tracking-widest bg-red-500/10 px-2 py-0.5 rounded">Requis</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.options.map(opt => {
                          const isSelected = tacosSelections[key].includes(opt.name);
                          return (
                            <button
                              key={opt.name}
                              // ✅ Correction 'any' : Cast vers keyof typeof TACOS_CONFIG
                              onClick={() => handleOptionToggle(key as keyof typeof TACOS_CONFIG, opt.name, category.max)}
                              disabled={!isSelected && tacosSelections[key].length >= category.max && category.max !== 1}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                                isSelected ? "bg-brand-primary text-white border-brand-primary" : "bg-neutral-800 text-gray-400 border-transparent hover:bg-neutral-700 disabled:opacity-30"
                              }`}
                            >
                              {opt.name} {opt.price > 0 && <span>+{opt.price.toFixed(2)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4 shrink-0">
               <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-black">Coût Unitaire</span>
                  <span className="text-xl font-display font-black text-white">{finalPrice.toFixed(2)} {siteConfig.currency}</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-black">Quantité</span>
                  <div className="flex items-center gap-4 bg-black p-1 rounded-xl border border-white/5">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-primary transition-colors"><Minus size={14} /></button>
                    <span className="font-black text-white">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-primary transition-colors"><Plus size={14} /></button>
                  </div>
               </div>
              <button 
                onClick={handleAddToCart} 
                disabled={isAdded || (isCustomTacos && tacosSelections.viandes.length === 0)}
                className={`w-full h-14 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black transition-all flex items-center justify-center gap-3 ${
                  isAdded ? "bg-green-500 text-white" : "bg-white text-black hover:bg-brand-primary hover:text-white"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.div key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><Check size={18} /> Reçu</motion.div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={16} />
                      <span>{isCustomTacos && tacosSelections.viandes.length === 0 ? "Viande requise" : `Ajouter • ${(finalPrice * quantity).toFixed(2)}`}</span>
                    </div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}