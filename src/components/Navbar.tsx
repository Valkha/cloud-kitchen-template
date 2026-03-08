"use client";

import { useState } from "react";
import TransitionLink from "./TransitionLink";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion"; 
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { ShoppingCart, User as UserIcon, LogOut } from "lucide-react"; 
import { useCart } from "@/context/CartContext"; 
import { useUser } from "@/context/UserContext"; 
import AuthModal from "./AuthModal";

// ✅ 1. Interface pour typer proprement les traductions et éviter le "any"
interface NavTranslations {
  home?: string;
  menu?: string;
  catering?: string;
  contact?: string;
  profile?: string;
}

interface NavbarProps {
  onOpenCart: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  
  const pathname = usePathname();
  const router = useRouter();
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
    await signOut();
    router.refresh(); 
    if (isOpen) setIsOpen(false);
  };

  const navLinks = [
    { name: t?.nav?.home || "Accueil", path: `/${lang}` },
    { name: t?.nav?.menu || "Menu", path: `/${lang}/menu` },
    { name: t?.nav?.catering || "Traiteur", path: `/${lang}/traiteur` },
    { name: t?.nav?.contact || "Contact", path: `/${lang}/contact` },
  ];

  return (
    <nav className="bg-kabuki-black text-white fixed w-full z-50 border-b border-neutral-800 shadow-lg">
      <div className="container mx-auto px-6 h-20 flex justify-between items-center">
        
        <TransitionLink 
          href={`/${lang}`} 
          className="relative w-24 md:w-32 hover:scale-105 transition-transform duration-300"
          onClick={() => setIsOpen(false)}
          aria-label="Retour à l'accueil Kabuki Sushi"
        >
          <Image 
            src="/images/logo.png" 
            alt="Kabuki Logo" 
            width={120} 
            height={120}
            className="w-full h-auto object-contain"
            priority
          />
        </TransitionLink>

        {/* --- DESKTOP NAV --- */}
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
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-kabuki-red"
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
                  <span className="text-[9px] font-bold text-kabuki-red uppercase tracking-widest leading-tight">
                    {profile?.wallet_balance ? Number(profile.wallet_balance).toFixed(2) : "0.00"} CHF
                  </span>
                </TransitionLink>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-white transition ml-2 p-1"
                  title="Se déconnecter"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-kabuki-red transition bg-neutral-900 px-5 py-2.5 rounded-full border border-neutral-800 shadow-md hover:border-kabuki-red/50"
              >
                <UserIcon size={16} className="text-kabuki-red" /> Connexion
              </button>
            )}
          </div>
          
          <button onClick={onOpenCart} className="relative group p-2 active:scale-90 transition-transform ml-2">
            <ShoppingCart size={22} className="text-gray-300 group-hover:text-white transition-colors" />
            <AnimatePresence>
              {totalItems > 0 && (
                <m.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-kabuki-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-kabuki-black"
                >
                  {totalItems}
                </m.div>
              )}
            </AnimatePresence>
          </button>

          <LanguageSwitcher />

          {user && (
            <TransitionLink 
              href={`/${lang}/admin/menu`} 
              className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded border border-white/20 font-bold uppercase tracking-widest transition-colors text-kabuki-red ml-2"
            >
              Admin
            </TransitionLink>
          )}
        </div>

        {/* --- MOBILE NAV --- */}
        <div className="flex md:hidden items-center space-x-4">
          <button onClick={() => user ? handleSignOut() : setIsAuthModalOpen(true)} className="relative p-2 active:scale-90 transition-transform">
            {user ? <LogOut size={22} className="text-kabuki-red" /> : <UserIcon size={22} className="text-white" />}
          </button>

          <button onClick={onOpenCart} className="relative p-2 z-50 active:scale-90 transition-transform">
            <ShoppingCart size={24} className="text-white" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-kabuki-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-kabuki-black">
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={() => setIsOpen(!isOpen)} className="z-50 w-8 h-10 flex flex-col justify-center items-center">
            <m.span animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-8 h-0.5 bg-white block mb-2 rounded-full" />
            <m.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-8 h-0.5 bg-kabuki-red block mb-2 rounded-full" />
            <m.span animate={isOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 0 }} className="w-8 h-0.5 bg-white block rounded-full" />
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE --- */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-kabuki-black z-40 flex flex-col items-center justify-center md:hidden"
          >
            {user && profile && (
              <TransitionLink href={`/${lang}/profile`} className="absolute top-24 w-full flex justify-center">
                <div className="bg-neutral-900 border border-neutral-800 rounded-full px-6 py-2 flex items-center gap-3 shadow-lg">
                  <span className="text-xs font-bold text-white capitalize">{profile.full_name}</span>
                  <span className="text-[10px] font-bold text-kabuki-red uppercase tracking-widest">
                    {Number(profile.wallet_balance).toFixed(2)} CHF
                  </span>
                </div>
              </TransitionLink>
            )}

            <ul className="space-y-8 text-center mt-12">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <TransitionLink href={link.path} className={`text-3xl font-display font-bold uppercase tracking-widest block transition-colors ${isActive(link.path) ? "text-kabuki-red" : "text-white hover:text-gray-300"}`}>
                    {link.name}
                  </TransitionLink>
                </li>
              ))}
              {user && (
                <li>
                  <TransitionLink 
                    href={`/${lang}/profile`} 
                    className={`text-3xl font-display font-bold uppercase tracking-widest block transition-colors ${isActive(`/${lang}/profile`) ? "text-kabuki-red" : "text-white hover:text-gray-300"}`}
                  >
                    {/* ✅ 2. Utilisation du type NavTranslations au lieu de any */}
                    {(t?.nav as NavTranslations)?.profile || "Mon Profil"}
                  </TransitionLink>
                </li>
              )}
              <li className="pt-8 flex flex-col items-center gap-6">
                  <TransitionLink href={`/${lang}/traiteur#devis`} className="bg-kabuki-red text-white px-8 py-4 rounded-full font-bold text-lg uppercase tracking-wider shadow-xl">
                    {t?.hero?.btnTraiteur || "Traiteur"}
                  </TransitionLink>
                  <LanguageSwitcher />
              </li>
            </ul>
          </m.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}