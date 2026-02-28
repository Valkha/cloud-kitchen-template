"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ Pour détecter la page menu
import { useCart } from "@/context/CartContext"; // ✅ Pour les infos du panier
import { useTranslation } from "@/context/LanguageContext";
import { Phone, MessageCircle, X, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileActionBarProps {
  onOpenCart: () => void; // ✅ Prop pour ouvrir le drawer
}

export default function MobileActionBar({ onOpenCart }: MobileActionBarProps) {
  const { lang } = useTranslation();
  const pathname = usePathname();
  const { totalItems, totalPrice } = useCart();
  const [showContactMenu, setShowContactMenu] = useState(false);

  // Vérification si on est sur la page menu
  const isMenuPage = pathname?.includes("/menu");

  const phoneNumber = "41786041542"; 

  const text = {
    fr: { 
      contact: "Contact", 
      call: "Appel standard", 
      wa: "WhatsApp", 
      descCall: "Ligne directe", 
      descWa: "Message gratuit", 
      viewCart: "Voir le panier" 
    },
    en: { 
      contact: "Contact", 
      call: "Standard Call", 
      wa: "WhatsApp", 
      descCall: "Direct line", 
      descWa: "Free message", 
      viewCart: "View Cart" 
    },
    es: { 
      contact: "Contacto", 
      call: "Llamada", 
      wa: "WhatsApp", 
      descCall: "Línea directa", 
      descWa: "Mensaje gratis", 
      viewCart: "Ver carrito" 
    }
  }[lang as "fr" | "en" | "es"] || { contact: "Contact", call: "Appel", wa: "WhatsApp", descCall: "Ligne directe", descWa: "Message", viewCart: "Voir le panier" };

  return (
    <>
      {/* --- BARRE D'ACTION FIXE --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080808]/95 backdrop-blur-xl border-t border-neutral-800 p-4 z-[40] pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        <AnimatePresence mode="wait">
          {isMenuPage ? (
            /* ✅ VUE 1 : BOUTON PANIER (Uniquement sur /menu) */
            <motion.button
              key="cart-view"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={onOpenCart}
              className="w-full bg-kabuki-red text-white py-4 rounded-2xl font-bold flex items-center justify-between px-6 shadow-lg shadow-red-900/40 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-kabuki-red text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-kabuki-red">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs uppercase tracking-[0.2em] font-black">
                  {text.viewCart}
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                <span className="font-display text-lg font-bold">
                  {totalPrice.toFixed(2)} <span className="text-[10px] opacity-80 uppercase ml-0.5">CHF</span>
                </span>
                <ArrowRight size={18} className="text-white/50" />
              </div>
            </motion.button>
          ) : (
            /* ✅ VUE 2 : CONTACT + COMMANDER (Autres pages) */
            <motion.div
              key="standard-view"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex gap-4 w-full"
            >
              <button 
                onClick={() => setShowContactMenu(true)}
                className="flex-1 bg-neutral-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-neutral-800 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                <Phone size={16} className="text-kabuki-red" />
                {text.contact}
              </button>

              <Link 
                href={`/${lang}/menu`} 
                className="flex-[1.3] bg-kabuki-red text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                <span>🍣</span>
                {lang === "fr" ? "Commander" : lang === "en" ? "Order" : "Pedir"}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MENU DE CHOIX CONTACT --- */}
      <AnimatePresence>
        {showContactMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactMenu(false)}
              className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-neutral-900 rounded-t-[32px] p-8 z-[110] border-t border-neutral-800"
            >
              <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-8" />

              <div className="flex justify-between items-center mb-8">
                <h3 className="font-display font-bold text-xl uppercase italic text-white tracking-tighter">
                  Kabuki <span className="text-kabuki-red">{text.contact}</span>
                </h3>
                <button onClick={() => setShowContactMenu(false)} className="bg-neutral-800 p-2 rounded-full text-gray-400"><X size={20}/></button>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <a href={`tel:+${phoneNumber}`} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400"><Phone size={24}/></div>
                    <div className="text-left">
                      <div className="font-bold text-white text-sm">{text.call}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">{text.descCall}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-neutral-700" />
                </a>

                <a href={`https://wa.me/${phoneNumber}`} target="_blank" className="flex items-center justify-between p-5 bg-green-500/10 rounded-2xl border border-green-500/20 active:bg-green-500/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500/20 p-3 rounded-xl text-green-500"><MessageCircle size={24}/></div>
                    <div className="text-left">
                      <div className="font-bold text-green-500 text-sm">{text.wa}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest">{text.descWa}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-green-900/50" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}