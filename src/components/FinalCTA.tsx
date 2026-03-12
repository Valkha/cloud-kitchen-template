"use client";

import { Zap } from "lucide-react"; // ✅ 'm' supprimé car inutilisé
import TransitionLink from "./TransitionLink";
import Reveal from "./Reveal";
import { useTranslation } from "@/context/LanguageContext";

export default function FinalCTA() {
  const { lang } = useTranslation();

  return (
    <section className="py-40 relative overflow-hidden">
      {/* Halo de fond statique (ou géré en CSS) */}
      <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <Reveal>
          <h2 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter mb-12">
            Prêt pour le <br />
            <span className="text-brand-primary italic group">Décollage ?</span>
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex flex-col items-center gap-8">
            <TransitionLink 
              href={`/${lang}/menu`}
              className="group relative px-16 py-6 bg-brand-primary text-white rounded-2xl font-black uppercase text-[14px] tracking-[0.3em] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.4)] hover:scale-105 transition-all"
            >
              {/* Effet de remplissage au hover */}
              <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500" />
              
              <span className="relative z-10 group-hover:text-black transition-colors duration-500 flex items-center gap-3">
                <Zap size={18} fill="currentColor" />
                Commander Maintenant
              </span>
            </TransitionLink>
            
            <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-[0.4em]">
              Livraison en moins de 30 minutes ou crédit galactique offert.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}