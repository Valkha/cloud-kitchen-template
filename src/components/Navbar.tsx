"use client";

import { useState } from "react";
import TransitionLink from "./TransitionLink";
import Image from "next/image";
import { usePathname } from "next/navigation"; 
import { m, AnimatePresence } from "framer-motion"; 
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { ShoppingCart, User as UserIcon, LogOut } from "lucide-react"; 
import { useCart } from "@/context/CartContext"; 
import { useUser } from "@/context/UserContext"; 
import AuthModal from "./AuthModal";
import { siteConfig } from "../../config/site";

interface NavbarProps {
  onOpenCart: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  
  const pathname = usePathname();
  const { t, lang } = useTranslation();
  const { totalItems } = useCart(); 
  const { user, profile, signOut } = useUser(); 

  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isOpen) setIsOpen(false);
  }

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      setIsOpen(false);
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

  // ✅ LIENS ADAPTÉS POUR LA CLOUD KITCHEN
  const navLinks = [
    { name: t?.nav?.home || "Accueil", path: `/${lang}` },
    { name: t?.nav?.brands || "Enseignes", path: `/${lang}#restaurants` }, // 👈 C'est ici que la magie opère
    { name: t?.nav?.contact || "Contact", path: `/${lang}/contact` },
  ];

  return (
    <nav className="bg-brand-black text-white fixed w-full z-50 border-b border-neutral-800 shadow-lg">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        
        <TransitionLink 
          href={`/${lang}`} 
          className="relative w-24 md:w-32 hover:scale-105 transition-transform duration-300"
          onClick={() => setIsOpen(false)}
        >
          <Image 
            src="/images/logo.png" 
            alt={`${siteConfig.name} Logo`} 
            width={120} 
            height={120}
            className="w-full h-auto object-contain"
            priority
          />
        </TransitionLink>

        {/* --- DESKTOP --- */}
        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <TransitionLink 
              key={link.path} 
              href={link.path}
              className={`text-sm font-bold uppercase tracking-widest transition-colors duration-300 relative py-2 ${
                isActive(link.path) ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <m.div 
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </TransitionLink>
          ))}

          <div className="border-l border-neutral-800 pl-6 ml-2 flex items-center">
            {user ? (
              <div className="flex items-center gap-3 bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800">
                <TransitionLink 
                  href={`/${lang}/profile`}
                  className="flex flex-col items-end hover:opacity-70 transition-opacity"
                >
                  <span className="text-[11px] font-bold text-white capitalize leading-tight">
                    {profile?.full_name || "Client"}
                  </span>
                  <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest leading-tight">
                    {profile?.wallet_balance ? Number(profile.wallet_balance).toFixed(2) : "0.00"} {siteConfig.currency}
                  </span>
                </TransitionLink>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-white transition ml-2 p-1"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-brand-primary transition bg-neutral-900 px-5 py-2.5 rounded-full border border-neutral-800 shadow-md"
              >
                <UserIcon size={16} className="text-brand-primary" /> Connexion
              </button>
            )}
          </div>
          
          <button onClick={onOpenCart} className="relative group p-2 active:scale-90 transition-transform ml-2">
            <ShoppingCart size={22} className="text-gray-300 group-hover:text-white transition-colors" />
            <AnimatePresence>
              {totalItems > 0 && (
                <m.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-black"
                >
                  {totalItems}
                </m.div>
              )}
            </AnimatePresence>
          </button>

          <LanguageSwitcher />
        </div>

        {/* --- MOBILE --- */}
        <div className="flex md:hidden items-center space-x-4">
          <button onClick={() => setIsOpen(!isOpen)} className="z-50 w-8 h-10 flex flex-col justify-center items-center">
            <m.span animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-8 h-0.5 bg-white block mb-2 rounded-full" />
            <m.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-8 h-0.5 bg-brand-primary block mb-2 rounded-full" />
            <m.span animate={isOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 0 }} className="w-8 h-0.5 bg-white block rounded-full" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 bg-brand-black z-40 flex flex-col items-center justify-center md:hidden"
          >
            <ul className="space-y-8 text-center mt-12">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <TransitionLink href={link.path} className={`text-3xl font-display font-bold uppercase tracking-widest block transition-colors ${isActive(link.path) ? "text-brand-primary" : "text-white hover:text-gray-300"}`} onClick={() => setIsOpen(false)}>
                    {link.name}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}