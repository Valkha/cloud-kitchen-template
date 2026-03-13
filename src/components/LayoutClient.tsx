"use client";

import { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";

export default function LayoutClient({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ✅ On utilise une fonction de rappel dans useEffect pour éviter le setState synchrone
  // ou on laisse le CartDrawer gérer sa propre visibilité interne.
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("open-cart", handleOpenCart);

    return () => {
      window.removeEventListener("open-cart", handleOpenCart);
    };
  }, []);

  return (
    <>
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      
      {/* Le contenu (children) est rendu normalement ici. 
          Si ta page est vide, vérifie que {children} n'est pas "undefined".
      */}
      <main className="pt-20 min-h-screen">
        {children}
      </main>

      {/* On passe l'état à CartDrawer. 
          S'il y a une erreur d'hydratation, c'est au CartDrawer de la gérer 
          avec un rendu null s'il n'est pas prêt.
      */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}