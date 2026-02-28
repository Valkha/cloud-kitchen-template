"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileActionBar from "@/components/MobileActionBar";
import CartDrawer from "@/components/CartDrawer";
import PageLoader from "@/components/PageLoader";
import ScrollToTop from "@/components/ScrollToTop";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <>
      <PageLoader />
      
      {/* On passe openCart à la Navbar pour l'icône panier desktop/mobile */}
      <Navbar onOpenCart={openCart} />

      <main className="flex-1">
        {children}
      </main>

      <ScrollToTop />

      {/* La nouvelle barre intelligente reçoit la fonction d'ouverture */}
      <MobileActionBar onOpenCart={openCart} />

      <CookieBanner />

      <Footer />

      {/* Le Drawer du panier, géré globalement */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}