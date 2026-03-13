"use client";

import { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer"; // ✅ Ajout de l'import (vérifie le chemin si besoin)

export default function LayoutClient({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("open-cart", handleOpenCart);
    return () => window.removeEventListener("open-cart", handleOpenCart);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      
      {/* flex-grow permet à la page de pousser le footer vers le bas */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* ✅ Réintégration du Footer */}
      <Footer />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
}