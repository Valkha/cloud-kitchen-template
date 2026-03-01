"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Info, Plus, Minus } from "lucide-react"; // ✅ CheckCircle supprimé
import Reveal from "@/components/Reveal";
import { useTranslation } from "@/context/LanguageContext";
import { supabase } from "@/utils/supabase";
import PageLoader from "@/components/PageLoader";
import ProductModal from "@/components/ProductModal";
import { useCart, MenuItem as ContextMenuItem } from "@/context/CartContext";

export interface MenuItem extends ContextMenuItem {
  name_fr: string;
  name_en?: string;
  name_es?: string;
  description_fr: string;
  description_en?: string;
  description_es?: string;
  is_available: boolean;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#171717" offset="20%" />
      <stop stop-color="#262626" offset="50%" />
      <stop stop-color="#171717" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#171717" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

const MenuItemCard = ({ item, onClick }: { item: MenuItem; onClick: () => void }) => {
  const { lang } = useTranslation();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const getTranslation = () => {
    const currentLang = lang.toLowerCase();
    if (currentLang === "es") {
      return {
        name: item.name_es && item.name_es.trim() !== "" ? item.name_es : item.name_fr,
        desc: item.description_es && item.description_es.trim() !== "" ? item.description_es : item.description_fr
      };
    } else if (currentLang === "en") {
      return {
        name: item.name_en && item.name_en.trim() !== "" ? item.name_en : item.name_fr,
        desc: item.description_en && item.description_en.trim() !== "" ? item.description_en : item.description_fr
      };
    }
    return { name: item.name_fr, desc: item.description_fr };
  };

  const { name: displayName, desc: displayDesc } = getTranslation();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: item.id,
      name: displayName,
      price: item.price,
      image_url: item.image_url,
      category: item.category,
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
    <motion.div 
      layout="position"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden hover:-translate-y-1 transition-all duration-300 group border border-neutral-700 hover:border-kabuki-red flex flex-col h-full cursor-pointer relative"
    >
      <div className="w-full bg-neutral-900 relative aspect-square overflow-hidden">
        <AnimatePresence>
          {quantity > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2 left-2 z-20 bg-kabuki-red text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white/10"
            >
              {quantity}
            </motion.div>
          )}
        </AnimatePresence>

        {!imgError && item.image_url ? (
          <Image 
            src={item.image_url}
            alt={displayName || "Sushi Kabuki"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            priority={item.id < 1005} 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800 italic text-neutral-600 text-[10px] uppercase tracking-tighter">
            KABUKI SUSHI
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Info size={14} />
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow relative">
        <div className="flex-1 min-w-0 mb-3">
          <h3 className="text-[11px] md:text-xs font-bold text-white uppercase line-clamp-2 leading-tight font-display tracking-wide mb-1">
            {displayName ? displayName.split('(')[0] : "Sans nom"}
          </h3>
          <p className="text-gray-500 text-[9px] line-clamp-2 leading-snug">
            {displayDesc || "..."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-700/50">
          <span className="bg-kabuki-red text-white font-bold px-2 py-1 rounded text-[9px] whitespace-nowrap shadow-sm flex-shrink-0">
            {item.price ? Number(item.price).toFixed(2) : "0.00"} <span className="text-[7px] ml-0.5">CHF</span>
          </span>

          <div className="flex items-center bg-neutral-900 rounded-full p-0.5 border border-neutral-700">
            <AnimatePresence mode="popLayout">
              {quantity > 0 && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex items-center overflow-hidden"
                >
                  <button 
                    onClick={handleRemove}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="text-[10px] font-bold text-white w-4 text-center">
                    {quantity}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleAdd}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                quantity > 0 ? "text-kabuki-red" : "bg-neutral-700 text-white hover:bg-kabuki-red"
              }`}
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function MenuClient() {
  const { t, lang } = useTranslation();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  useEffect(() => {
    async function fetchPublicMenu() {
      setLoading(true);
      const { data } = await supabase
        .from("menu_items")
        .select("*") 
        .eq("is_available", true)
        .order("id", { ascending: true });

      if (data) {
        const mappedData = data.map(item => ({
          ...item,
          name: item.name_fr 
        }));
        setItems(mappedData as MenuItem[]);
      }
      setLoading(false);
    }
    fetchPublicMenu();
  }, []);

  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.name_fr?.toLowerCase().includes(searchLower) ||
      item.description_fr?.toLowerCase().includes(searchLower);

    const matchesCategory = activeCategory === "Tous" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const rawCategories = Array.from(new Set(items.map(item => item.category)));
  
  const filterCategories = [
    { id: "Tous", label: t.menu.all },
    ...rawCategories.map(cat => ({
      id: cat || "Non classé",
      label: (t.menu.categories as Record<string, string>)?.[cat || ""] || cat 
    }))
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="bg-neutral-900 min-h-screen pb-20 pt-24 relative">
      <div className="bg-black text-white py-12 md:py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-5 z-0"></div>
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest relative z-10">
            {t.menu.title}
          </h1>
          <p className="text-gray-400 mt-4 text-xs md:text-sm relative z-10 max-w-md mx-auto px-6 italic">
            {t.menu.subtitle}
          </p>
          <div className="w-16 h-1 bg-kabuki-red mx-auto mt-6 relative z-10"></div>
        </Reveal>
      </div>

      <div className="sticky top-[80px] z-30 bg-neutral-900/90 backdrop-blur-lg py-4 border-b border-neutral-800 mb-8">
        <div className="container mx-auto px-4">
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "fr" ? "Rechercher un sushi..." : "Search..."}
              className="w-full bg-black border border-neutral-800 rounded-full py-2.5 pl-12 pr-12 text-sm text-white focus:border-kabuki-red outline-none shadow-xl"
            />
          </div>

          <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:justify-center gap-2 pb-2 no-scrollbar">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  activeCategory === cat.id 
                  ? "bg-kabuki-red border-kabuki-red text-white" 
                  : "bg-neutral-800 border-neutral-700 text-gray-500 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <AnimatePresence mode="popLayout">
          {rawCategories.map((category) => {
            const itemsInCategory = filteredItems.filter(item => item.category === category);
            if (itemsInCategory.length === 0) return null;

            return (
              <motion.section 
                key={category}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-16"
              >
                <h2 className="text-lg md:text-2xl font-bold text-white mb-8 pl-4 border-l-4 border-kabuki-red uppercase font-display tracking-widest">
                  {(t.menu.categories as Record<string, string>)?.[category || ""] || category}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                  {itemsInCategory.map((item) => (
                    <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        onClick={() => setSelectedProduct(item)} 
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            item={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}