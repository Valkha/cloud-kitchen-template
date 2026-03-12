"use client";

import { m, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";

export default function ActiveOrderButton() {
  const { totalItems, totalPrice } = useCart();
  const { lang } = useTranslation();

  // On ne l'affiche que si le panier n'est pas vide
  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-0 right-0 z-[60] flex justify-center pointer-events-none"
        >
          <button
            onClick={() => {
              // Ici, on déclenchera l'ouverture du CartDrawer
              window.dispatchEvent(new Event("open-cart"));
            }}
            className="pointer-events-auto group relative flex items-center gap-6 bg-white text-black px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-300"
          >
            {/* Badge Quantité */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#080808] group-hover:rotate-12 transition-transform">
              {totalItems}
            </div>

            <div className="flex items-center gap-3">
              <ShoppingBag size={20} />
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                  {lang === 'fr' ? 'Votre Commande' : 'Your Order'}
                </span>
                <span className="text-sm font-display font-black uppercase italic">
                  {totalPrice.toFixed(2)} CHF
                </span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-black/10" />

            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-brand-primary transition-colors">
              {lang === 'fr' ? 'Voir le panier' : 'View Cart'}
            </span>
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}