"use client";

import { useState, useMemo, memo } from "react";
import Image from "next/image";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion"; 
import { Search, Info, Plus, Minus, ShoppingBag } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useTranslation } from "@/context/LanguageContext";
import ProductModal from "@/components/ProductModal";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";
import { siteConfig } from "../../../config/site"; 

export interface MenuItem extends ContextMenuItem {
  name_fr: string;
  name_en?: string;
  name_es?: string;
  description_fr: string;
  description_en?: string;
  description_es?: string;
  is_available: boolean;
  restaurant_name: string;
}

interface MenuClientProps {
  initialItems: MenuItem[];
  restaurantSlug: string; 
}

const MenuItemCard = memo(({ item, index, onClick }: { item: MenuItem; index: number; onClick: (item: MenuItem) => void }) => {
  const { lang } = useTranslation();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const displayName = useMemo(() => {
    const currentLang = lang.toLowerCase();
    const n = currentLang === "es" ? item.name_es : currentLang === "en" ? item.name_en : item.name_fr;
    return n?.trim() ? n : item.name_fr;
  }, [lang, item]);

  const displayDesc = useMemo(() => {
    const currentLang = lang.toLowerCase();
    const d = currentLang === "es" ? item.description_es : currentLang === "en" ? item.description_en : item.description_fr;
    return d?.trim() ? d : item.description_fr;
  }, [lang, item]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.navigator?.vibrate) window.navigator.vibrate(15);
    addToCart({ 
      id: item.id, 
      name: displayName, 
      price: item.price, 
      image_url: item.image_url, 
      category: item.category,
      restaurant_id: item.restaurant_id,
      restaurant_name: item.restaurant_name
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(item)}
      className="bg-neutral-900/50 backdrop-blur-sm rounded-[2rem] overflow-hidden hover:border-[var(--brand-primary)]/50 transition-all duration-500 group border border-neutral-800 flex flex-col h-full cursor-pointer relative"
    >
      <div className="w-full bg-black/40 relative aspect-square overflow-hidden p-4">
        <AnimatePresence>
          {quantity > 0 && (
            <m.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 20 }}
              style={{ 
                backgroundColor: 'var(--brand-primary)',
                boxShadow: '0 0 15px var(--brand-glow)' 
              }}
              className="absolute top-4 left-4 z-20 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border border-white/20"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-white/20 pointer-events-none" />
              <span className="relative z-10">{quantity}</span>
            </m.div>
          )}
        </AnimatePresence>

        {!imgError && item.image_url ? (
          <div className="relative w-full h-full">
            <Image 
              src={item.image_url}
              alt={displayName}
              fill
              quality={80} 
              className={`object-contain transition-all duration-700 group-hover:scale-110 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setImgError(true)}
              priority={index < 6}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center italic text-neutral-700 text-[10px] uppercase font-display tracking-widest text-center">
            {siteConfig.name}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-1 mb-4">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-sm font-bold text-white uppercase leading-tight font-display tracking-wide group-hover:text-[var(--brand-primary)] transition-colors">
              {displayName.split('(')[0]}
            </h3>
            <Info size={14} className="text-neutral-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-neutral-500 text-[10px] line-clamp-2 leading-relaxed font-light italic">
            {displayDesc}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
          <span className="text-white font-black text-sm italic">
            {Number(item.price).toFixed(2)} <span className="text-[8px] not-italic text-neutral-500 ml-0.5">{siteConfig.currency}</span>
          </span>

          <div className="flex items-center bg-black/40 rounded-xl p-1 border border-neutral-800">
            <AnimatePresence mode="popLayout">
              {quantity > 0 && (
                <m.div initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex items-center overflow-hidden">
                  <button onClick={handleRemove} className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-bold text-white w-5 text-center">{quantity}</span>
                </m.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleAdd}
              style={{ color: quantity > 0 ? 'var(--brand-primary)' : 'inherit' }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                quantity > 0 ? "" : "bg-neutral-800 text-white hover:bg-[var(--brand-primary)]"
              }`}
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </m.div>
  );
});

MenuItemCard.displayName = "MenuItemCard";

export default function MenuClient({ initialItems, restaurantSlug }: MenuClientProps) {
  const { t, lang } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // ✅ Logique de thème dynamique
  const theme = useMemo(() => {
    const themes: Record<string, { primary: string; glow: string }> = {
      "planet-food": { primary: "#A855F7", glow: "rgba(168,85,247,0.6)" },
      "burger-station": { primary: "#FACC15", glow: "rgba(250,204,21,0.6)" }, // Exemple
      // Ajoute d'autres enseignes ici
    };
    return themes[restaurantSlug] || { primary: "#A855F7", glow: "rgba(168,85,247,0.6)" };
  }, [restaurantSlug]);

  const filteredItems = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return initialItems.filter((item) => {
      const matchesSearch = item.name_fr?.toLowerCase().includes(searchLower) || 
                          item.description_fr?.toLowerCase().includes(searchLower);
      const matchesCategory = activeCategory === "Tous" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialItems, searchQuery, activeCategory]);

  const rawCategories = useMemo(() => Array.from(new Set(initialItems.map(item => item.category))), [initialItems]);
  
  const filterCategories = useMemo(() => [
    { id: "Tous", label: t.menu.all },
    ...rawCategories.map(cat => ({
      id: cat || "Non classé",
      label: (t.menu.categories as Record<string, string>)?.[cat || ""] || cat 
    }))
  ], [t.menu.all, t.menu.categories, rawCategories]);

 return (
    <LazyMotion features={domAnimation}>
      <div 
        className="bg-[#080808] min-h-screen pb-40"
        style={{ 
          // ✅ Plus besoin de directive ici, le "as React.CSSProperties" fait le travail
          "--brand-primary": theme.primary, 
          "--brand-glow": theme.glow 
        } as React.CSSProperties}
      >
        <div className="bg-black py-20 text-center relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-50"
            style={{ background: `radial-gradient(circle at center, ${theme.primary}1A 0%, transparent 70%)` }}
          />
          <Reveal>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-[0.2em] text-white relative z-10">
              {restaurantSlug.replace(/-/g, ' ')}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-6">
               <div className="h-[1px] w-12 bg-neutral-800" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-primary)]">
                 {restaurantSlug.replace(/-/g, ' ')} Experience
               </span>
               <div className="h-[1px] w-12 bg-neutral-800" />
            </div>
          </Reveal>
        </div>

        <div className="sticky top-[70px] z-30 bg-[#080808]/90 backdrop-blur-2xl py-6 border-b border-white/5 mb-12">
          <div className="container mx-auto px-6">
            <div className="relative max-w-lg mx-auto mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "fr" ? "Explorer la carte..." : "Explore the menu..."}
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/20 outline-none transition-all"
              />
            </div>

            <nav className="flex flex-nowrap overflow-x-auto md:justify-center gap-4 pb-4 no-scrollbar">
              {filterCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <m.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className={`
                      flex-shrink-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] 
                      transition-all duration-500 relative overflow-hidden border
                      ${isActive 
                        ? "bg-white text-black border-white" 
                        : "bg-neutral-900/50 text-neutral-500 hover:text-white border-neutral-800"
                      }
                    `}
                    style={isActive ? { boxShadow: `0 0 30px ${theme.glow}` } : {}}
                  >
                    {isActive && (
                      <m.div 
                        layoutId="active-glow-sweep"
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </m.button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-6">
          <AnimatePresence mode="popLayout">
            <m.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {filteredItems.map((item, index) => (
                <MenuItemCard key={item.id} item={item} index={index} onClick={setSelectedProduct} />
              ))}
            </m.div>
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="text-center py-40">
              <ShoppingBag size={48} className="mx-auto text-neutral-800 mb-4" />
              <p className="text-neutral-500 font-display uppercase tracking-widest text-xs">Aucun résultat trouvé</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedProduct && (
            <ProductModal item={selectedProduct} onClose={() => setSelectedProduct(null)} />
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}