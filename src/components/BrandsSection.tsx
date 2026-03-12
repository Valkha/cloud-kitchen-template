"use client";

import { m } from "framer-motion";
import { ChevronRight, Star } from "lucide-react";
import TransitionLink from "./TransitionLink";
import Reveal from "./Reveal";
import { useTranslation } from "@/context/LanguageContext";

// Simulation des données des enseignes (à lier à ta DB plus tard)
const BRANDS = [
  {
    id: "planet-food",
    name: "Planet Food",
    slug: "planet-food",
    desc: "Cuisine fusion galactique et saveurs stellaires.",
    color: "#A855F7",
    image: "/images/brands/planet.jpg",
    rating: 4.9
  },
  {
    id: "burger-station",
    name: "Burger Station",
    slug: "burger-station",
    desc: "Le ravitaillement lourd pour les longs voyages.",
    color: "#FACC15",
    image: "/images/brands/burger.jpg",
    rating: 4.8
  },
];

export default function BrandsSection() {
  // ✅ Correction : Suppression de 't' car non utilisé, on garde 'lang'
  const { lang } = useTranslation();

  return (
    <section id="restaurants" className="py-32 relative">
      <div className="container mx-auto px-6">
        
        {/* --- EN-TÊTE DE SECTION --- */}
        <div className="mb-20">
          <Reveal>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary mb-4">
              {lang === 'fr' ? 'Secteurs de Ravitaillement' : 'Supply Sectors'}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <h3 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter">
              Nos <span className="italic">Enseignes</span>
            </h3>
          </Reveal>
        </div>

        {/* --- GRILLE DES STATIONS (BRANDS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BRANDS.map((brand, index) => (
            <Reveal key={brand.id} delay={index * 0.1}>
              <TransitionLink 
                href={`/${lang}/menu/${brand.slug}`}
                className="group block relative"
              >
                <m.div 
                  whileHover={{ y: -10 }}
                  className="glass-panel rounded-[2.5rem] p-8 h-full transition-all duration-500 hover:border-white/20 relative overflow-hidden"
                >
                  {/* Effet de lueur dynamique au survol propre à la marque */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at center, ${brand.color} 0%, transparent 70%)` }}
                  />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-black/40 shadow-inner"
                        style={{ color: brand.color }}
                      >
                        <Star size={24} fill="currentColor" className="opacity-20" />
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <Star size={10} className="text-brand-primary" fill="currentColor" />
                        <span className="text-[10px] font-black text-white">{brand.rating}</span>
                      </div>
                    </div>

                    <h4 className="text-2xl font-display font-black uppercase tracking-tight mb-4 group-hover:text-brand-primary transition-colors">
                      {brand.name}
                    </h4>
                    
                    <p className="text-neutral-500 text-xs leading-relaxed mb-8 font-medium">
                      {brand.desc}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      <span>{lang === 'fr' ? 'Accéder au menu' : 'Open Menu'}</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Décoration HUD subtile */}
                  <div className="absolute bottom-4 right-8 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-800">
                    Station_{brand.id.slice(0,3).toUpperCase()}
                  </div>
                </m.div>
              </TransitionLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}