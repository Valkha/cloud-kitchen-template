"use client";

import { useState, useEffect } from "react";
import TransitionLink from "./TransitionLink";
import { usePathname } from "next/navigation"; 
// ✅ On remplace 'm' par 'motion' pour garantir l'affichage immédiat
import { motion, AnimatePresence } from "framer-motion"; 
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { ShoppingCart, User as UserIcon, LogOut, Rocket } from "lucide-react"; 
import { useCart } from "@/context/CartContext"; 
import { useUser } from "@/context/UserContext"; 
import AuthModal from "./AuthModal";
import { siteConfig } from "../../config/site";

interface NavbarProps {
  onOpenCart: () => void;
}

// ✅ 1. Composant Badge corrigé (motion au lieu de m, z-index forcé)
const CartBadge = ({ mounted, totalItems }: { mounted: boolean; totalItems: number }) => (
  <AnimatePresence>
    {mounted && totalItems > 0 && (
      <motion.div 
        key="cart-badge-global"
        initial={{ scale: 0, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0, opacity: 0 }}
        // z-[100] pour passer devant l'icône et le flou de la navbar
        className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#080808] shadow-[0_0_15px_rgba(168,85,247,0.8)] z-[100]"
      >
        {totalItems}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Navbar({ onOpenCart }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const { t, lang } = useTranslation();
  const { totalItems } = useCart(); 
  const { user, profile, signOut } = useUser(); 

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      closeMobileMenu();
      setIsAuthModalOpen(false);
      await signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = `/${lang}`; 
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      window.location.href = `/${lang}`;
    }
  };

  const navLinks = [
    { name: t?.nav?.home || "Accueil", path: `/${lang}` },
    { 
      name: lang === 'en' ? 'ORDER' : lang === 'es' ? 'PEDIR' : 'COMMANDER', 
      path: `/${lang}#restaurants` 
    }, 
    { name: t?.nav?.contact || "Contact", path: `/${lang}/contact` },
  ];

  return (
    <>
      <nav className="glass-panel text-white fixed w-full z-50 border-b border-white/5 shadow-2xl">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* --- LOGO --- */}
          <TransitionLink 
            href={`/${lang}`} 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={closeMobileMenu}
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.div
                whileHover={{ y: -4, rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Rocket size={30} className="text-brand-primary group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </motion.div>
            </div>
            <span className="text-xl font-display font-black uppercase tracking-[0.2em] leading-none">
              Planet <span className="text-brand-primary transition-all duration-300 group-hover:glow-primary">Food</span>
            </span>
          </TransitionLink>

          {/* --- DESKTOP --- */}
          <div className="hidden md:flex space-x-8 items-center">
            <div className="flex items-center space-x-6 mr-4">
              {navLinks.map((link) => (
                <TransitionLink 
                  key={link.path} 
                  href={link.path}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative py-2 cursor-pointer ${
                    isActive(link.path) ? "text-white" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-primary glow-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </TransitionLink>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              {mounted && user ? (
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <TransitionLink href={`/${lang}/profile`} className="flex flex-col items-end cursor-pointer">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{profile?.full_name?.split(' ')[0] || "Client"}</span>
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.15em] leading-tight">
                      {profile?.wallet_balance ? Number(profile.wallet_balance).toFixed(2) : "0.00"} {siteConfig.currency}
                    </span>
                  </TransitionLink>
                  <button onClick={handleSignOut} className="text-neutral-500 hover:text-brand-primary transition-colors p-1 cursor-pointer">
                    <LogOut size={14} />
                  </button>
                </div>
              ) : mounted && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:glow-white transition-all bg-white/5 px-6 py-3 rounded-2xl border border-white/10 cursor-pointer"
                >
                  <UserIcon size={14} className="text-brand-primary" /> Connexion
                </button>
              )}

              <button onClick={onOpenCart} className="relative p-2 active:scale-90 transition-transform group cursor-pointer">
                <ShoppingCart size={22} className="text-neutral-400 group-hover:text-white transition-colors" />
                <CartBadge mounted={mounted} totalItems={totalItems} />
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          {/* --- MOBILE --- */}
          <div className="flex md:hidden items-center space-x-4">
            <button onClick={onOpenCart} className="relative p-2 mr-2 cursor-pointer active:scale-90 transition-transform">
              <ShoppingCart size={22} className="text-white" />
              <CartBadge mounted={mounted} totalItems={totalItems} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="z-50 w-8 h-8 flex flex-col justify-center items-end gap-1.5 cursor-pointer">
              <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 8, width: "32px" } : { rotate: 0, y: 0, width: "32px" }} className="h-0.5 bg-white block rounded-full" />
              <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-0.5 bg-brand-primary block rounded-full" />
              <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -8, width: "32px" } : { rotate: 0, y: 0, width: "32px" }} className="h-0.5 bg-white block rounded-full" />
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU OVERLAY --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-[#080808]/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-center md:hidden"
            >
              <ul className="space-y-10 text-center">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <TransitionLink 
                      href={link.path} 
                      className={`text-3xl font-display font-bold uppercase tracking-[0.2em] block transition-all cursor-pointer ${isActive(link.path) ? "text-brand-primary glow-primary" : "text-white"}`} 
                      onClick={closeMobileMenu}
                    >
                      {link.name}
                    </TransitionLink>
                  </li>
                ))}
                {mounted && !user && (
                   <li>
                      <button onClick={() => { setIsAuthModalOpen(true); closeMobileMenu(); }} className="text-xl font-display font-bold uppercase tracking-widest text-brand-primary border-b-2 border-brand-primary pb-1 glow-primary cursor-pointer">
                        Connexion
                      </button>
                   </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}/>
    </>
  );
}