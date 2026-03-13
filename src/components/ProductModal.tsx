"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { m, useAnimation, PanInfo, AnimatePresence } from "framer-motion"; 
import { X, Minus, Plus, ShoppingCart, Check } from "lucide-react"; 
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";
import { siteConfig } from "../../config/site";

export interface MenuItem extends ContextMenuItem {
  name_fr: string; // Obligatoire pour la détection du Tacos
  name_en?: string;
  name_es?: string;
  description_fr?: string; // ✅ Changé en optionnel (?) pour éviter les blocages
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
  const controls = useAnimation();

  const isCustomTacos = item.name_fr?.toLowerCase().includes("tacos") && item.restaurant_name?.toLowerCase().includes("lyonnaise");

  const [tacosSelections, setTacosSelections] = useState<Record<string, string[]>>({
    format: ["Standard"],
    sauces: [], 
    crudites: [], 
    viandes: [], 
    extraViandes: ["Aucune"], 
    gratinage: ["Aucun"]
  });

  // ✅ Correction ESLint : On évite le setState synchrone avec requestAnimationFrame
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    document.body.style.overflow = "hidden";
    
    return () => {
      cancelAnimationFrame(handle);
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 150) onClose();
    else controls.start({ y: 0 });
  };

  const { baseName, desc } = useMemo(() => {
    const currentLang = lang.toLowerCase();
    const n = currentLang === "es" ? item.name_es : currentLang === "en" ? item.name_en : item.name_fr;
    const d = currentLang === "es" ? item.description_es : currentLang === "en" ? item.description_en : item.description_fr;
    return { 
      baseName: n?.trim() || item.name_fr, 
      desc: d?.trim() || item.description_fr 
    };
  }, [lang, item]);

  const finalPrice = useMemo(() => {
    let extraCost = 0;
    if (isCustomTacos) {
      Object.entries(tacosSelections).forEach(([categoryKey, selectedItems]) => {
        const categoryData = TACOS_CONFIG[categoryKey as keyof typeof TACOS_CONFIG];
        selectedItems.forEach(sel => {
          const opt = categoryData.options.find(o => o.name === sel);
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
      if (max === 1) return { ...prev, [category]: [optionName] };
      if (current.length < max) return { ...prev, [category]: [...current, optionName] };
      return prev;
    });
  };

  const handleAddToCart = () => {
    if (window.navigator?.vibrate) window.navigator.vibrate(20);
    let finalName = baseName;
    if (isCustomTacos) {
      const allSelected = Object.values(tacosSelections).flat().filter(n => n !== "Aucune" && n !== "Aucun" && n !== "Standard");
      const formatLabel = tacosSelections.format[0] === "Format XL" ? " XL" : "";
      finalName = `${baseName}${formatLabel} (${allSelected.join(", ")})`;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: isCustomTacos ? `${item.id}-${Date.now()}-${i}` : item.id,
        name: finalName,
        price: finalPrice,
        image_url: item.image_url,
        category: item.category,
        restaurant_id: item.restaurant_id, 
        restaurant_name: item.restaurant_name
      });
    }
    setIsAdded(true);
    setTimeout(() => onClose(), 600);
  };

  const isCartDisabled = isAdded || (isCustomTacos && tacosSelections.viandes.length === 0);

  const modalJSX = (
    <m.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <m.div 
        drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2} onDragEnd={handleDragEnd} animate={controls}
        initial={{ y: "100%" }} whileInView={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[92vh] md:max-h-[85vh] cursor-default"
      >
        <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-4 mb-2 md:hidden" />
        <button onClick={onClose} className="absolute top-6 right-6 z-30 bg-black/50 hover:bg-brand-primary border border-white/10 text-white p-3 rounded-full backdrop-blur-md transition-colors duration-300 md:flex hidden cursor-pointer">
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          <div className="relative w-full md:w-1/2 bg-black h-[25vh] md:h-auto overflow-hidden group shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--brand-primary-rgb),0.1)_0%,transparent_70%)] opacity-50" />
            {item.image_url ? (
              <Image src={item.image_url} alt={baseName} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-8 md:p-12 transition-transform duration-1000 group-hover:scale-110 drop-shadow-2xl" priority />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-800 font-display text-4xl uppercase opacity-20 tracking-widest font-black">{siteConfig.name}</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:hidden" />
          </div>

          <div className="p-6 md:p-10 md:w-1/2 flex flex-col bg-neutral-900 overflow-hidden">
            <div className="mb-4 shrink-0">
              <span className="text-brand-primary text-[10px] uppercase font-black tracking-[0.4em] mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                Transmission Planet Food
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">{baseName}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
              {!isCustomTacos ? (
                <p className="text-gray-400 text-sm leading-relaxed font-bold uppercase tracking-wider">
                  {desc || "Aucune information supplémentaire fournie pour cette transmission."}
                </p>
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
                          const isDisabled = !isSelected && tacosSelections[key].length >= category.max && category.max !== 1;
                          return (
                            <button
                              key={opt.name}
                              onClick={() => handleOptionToggle(key as keyof typeof TACOS_CONFIG, opt.name, category.max)}
                              disabled={isDisabled}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer flex items-center gap-2 ${
                                isSelected 
                                  ? "bg-brand-primary text-white border-brand-primary" 
                                  : "bg-neutral-800 text-gray-400 border-transparent hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              }`}
                            >
                              {opt.name}
                              {opt.price > 0 && <span className={isSelected ? "text-white/80" : "text-brand-primary"}>+{opt.price.toFixed(2)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5 pt-4 border-t border-white/5 shrink-0">
               <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Coût Unitaire</span>
                  <span className="text-2xl font-display font-black text-white tracking-tighter">
                    {finalPrice.toFixed(2)} <span className="text-[10px] text-brand-primary uppercase tracking-widest">{siteConfig.currency}</span>
                  </span>
               </div>

               <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Quantité</span>
                  <div className="flex items-center gap-6 bg-black p-1.5 rounded-2xl border border-white/5">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary transition-colors active:scale-90 cursor-pointer"><Minus size={18} /></button>
                    <span className="font-black text-white min-w-[20px] text-center text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary transition-colors active:scale-90 cursor-pointer"><Plus size={18} /></button>
                  </div>
               </div>

              <m.button 
                onClick={handleAddToCart} disabled={isCartDisabled}
                animate={isAdded ? { scale: [1, 0.95, 1.05, 1] } : {}}
                className={`w-full h-16 rounded-2xl uppercase tracking-[0.3em] text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden cursor-pointer ${
                  isAdded ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                  : isCartDisabled ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
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
                      <span>{isCustomTacos && tacosSelections.viandes.length === 0 ? "Sélectionnez une viande" : `Ajouter • ${(finalPrice * quantity).toFixed(2)} ${siteConfig.currency}`}</span>
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

  if (!mounted) return null;
  return createPortal(modalJSX, document.body);
}