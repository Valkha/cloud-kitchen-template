"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion"; // ✅ Import de 'm' au lieu de 'motion'
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Gère la visibilité au scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <m.button // ✅ Utilisation de m.button pour la performance LazyMotion
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-[45] p-3 rounded-full bg-brand-primary text-white shadow-2xl hover:scale-110 transition-transform active:scale-95 border border-white/10"
          aria-label="Retour en haut"
        >
          <ChevronUp size={24} strokeWidth={3} />
        </m.button>
      )}
    </AnimatePresence>
  );
}