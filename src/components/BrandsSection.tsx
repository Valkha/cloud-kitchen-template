"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { ChevronRight, Star, Loader2 } from "lucide-react";
import TransitionLink from "./TransitionLink";
import Reveal from "./Reveal";
import { useTranslation } from "@/context/LanguageContext";

// Interface pour typer tes données de base de données
interface Brand {
  id: string;
  name: string;
  slug: string;
  desc: string;
  color: string;
  image: string;
  rating: number;
}

export default function BrandsSection() {
  const { lang } = useTranslation();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Récupération des données depuis l'API
  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch('/api/brands');
        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des enseignes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrands();
  }, []);

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

        {/* --- ÉTAT DE CHARGEMENT --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic animate-pulse">
              Initialisation des stations...
            </p>
          </div>
        ) : (
          /* --- GRILLE DES STATIONS (DYNAMIQUE) --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand, index) => (
              <Reveal key={brand.id} delay={index * 0.1}>
                <TransitionLink 
                  href={`/${lang}/menu/${brand.slug}`}
                  className="group block relative"
                >
                  <m.div 
                    whileHover={{ y: -10 }}
                    className="glass-panel rounded-[2.5rem] p-8 h-full transition-all duration-500 hover:border-white/20 relative overflow-hidden"
                  >
                    {/* Effet de lueur dynamique au survol */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at center, ${brand.color || '#A855F7'} 0%, transparent 70%)` }}
                    />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-12">
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-black/40 shadow-inner"
                          style={{ color: brand.color || '#fff' }}
                        >
                          <Star size={24} fill="currentColor" className="opacity-20" />
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                          <Star size={10} className="text-brand-primary" fill="currentColor" />
                          <span className="text-[10px] font-black text-white">{brand.rating || '5.0'}</span>
                        </div>
                      </div>

                      <h4 className="text-2xl font-display font-black uppercase tracking-tight mb-4 group-hover:text-brand-primary transition-colors">
                        {brand.name}
                      </h4>
                      
                      <p className="text-neutral-500 text-xs leading-relaxed mb-8 font-medium line-clamp-2">
                        {brand.desc}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        <span>{lang === 'fr' ? 'Accéder au menu' : 'Open Menu'}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-8 text-[8px] font-black uppercase tracking-[0.3em] text-neutral-800">
                      Station_{brand.id.toString().slice(0,3).toUpperCase()}
                    </div>
                  </m.div>
                </TransitionLink>
              </Reveal>
            ))}
          </div>
        )}

        {/* Message si aucune enseigne n'est trouvée */}
        {!isLoading && brands.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-[2.5rem]">
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">
              Aucune station détectée dans ce secteur.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}