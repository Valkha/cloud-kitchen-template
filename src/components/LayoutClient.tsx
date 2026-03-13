"use client";

import { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer"; 

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
      
      {/* ✅ Restauration du pt-20 : cela garantit que le contenu des pages 
          standard (Profil, Contact, etc.) commence sous la Navbar. */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      <Footer />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
}