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
      
      {/* ✅ Suppression du pt-20 ici pour laisser le Hero respirer */}
      <main className="flex-grow">
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