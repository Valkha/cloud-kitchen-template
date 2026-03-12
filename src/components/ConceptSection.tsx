"use client";

import { m } from "framer-motion";
import { ShieldCheck, Zap, Globe, Cpu } from "lucide-react";
import Reveal from "./Reveal";
import { useTranslation } from "@/context/LanguageContext";

const FEATURES = [
  {
    icon: <Cpu size={20} />,
    title: { fr: "Technologie de Pointe", en: "Cutting-edge Tech" },
    desc: { fr: "Nos algorithmes optimisent chaque seconde de préparation.", en: "Our algorithms optimize every second of preparation." }
  },
  {
    icon: <Zap size={20} />,
    title: { fr: "Vitesse Lumière", en: "Light Speed" },
    desc: { fr: "Une livraison si rapide qu'elle défie les lois de la physique.", en: "Delivery so fast it defies the laws of physics." }
  },
  {
    icon: <ShieldCheck size={20} />,
    title: { fr: "Qualité Certifiée", en: "Certified Quality" },
    desc: { fr: "Sélection rigoureuse de nos équipages et produits.", en: "Rigorous selection of our crews and products." }
  }
];

export default function ConceptSection() {
  const { lang } = useTranslation();

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Éléments de fond */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full -translate-y-1/2" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* --- TEXTE : MISSION BRIEFING --- */}
          <div className="order-2 lg:order-1">
            <Reveal>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 mb-8">
                <Globe size={14} className="text-brand-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                  Mission Briefing
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-8 leading-none">
                Au-delà de la <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Simple Livraison</span>
              </h2>
            </Reveal>

            <Reveal delay={0.4}>
              <p className="text-neutral-500 text-sm md:text-base mb-12 leading-relaxed font-light max-w-lg">
                Planet Food n&apos;est pas qu&apos;une Cloud Kitchen. C&apos;est un écosystème conçu pour ramener l&apos;excellence gastronomique dans votre salon. 
                Grâce à nos stations stratégiquement positionnées, nous garantissons une fraîcheur absolue, de la sortie du feu jusqu&apos;à votre porte.
              </p>
            </Reveal>

            {/* Liste de features style HUD */}
            <div className="space-y-6">
              {FEATURES.map((f, i) => (
                <Reveal key={i} delay={0.5 + i * 0.1}>
                  <div className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center text-brand-primary group-hover:glow-primary transition-all duration-500 shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">
                        {lang === 'fr' ? f.title.fr : f.title.en}
                      </h4>
                      <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                        {lang === 'fr' ? f.desc.fr : f.desc.en}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* --- VISUEL : RADAR DE COUVERTURE --- */}
          <div className="order-1 lg:order-2 relative flex justify-center items-center">
            <Reveal delay={0.3}>
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Cercles concentriques */}
                {[1, 2, 3].map((circle) => (
                  <m.div
                    key={circle}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: circle * 0.2, duration: 1 }}
                    className="absolute inset-0 border border-brand-primary/20 rounded-full"
                    style={{ margin: `${circle * 15}%` }}
                  />
                ))}

                {/* Radar Sweep */}
                <m.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-transparent to-transparent rounded-full"
                />

                {/* Points de données (Stations) */}
                <m.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-1/4 left-1/3 w-3 h-3 bg-brand-primary rounded-full shadow-[0_0_15px_#A855F7]"
                />
                <m.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                  className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]"
                />

                {/* Icône Centrale */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-8 rounded-full bg-black border border-brand-primary/30 glow-primary">
                    <Cpu size={40} className="text-brand-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Chiffres HUD flottants */}
            <div className="absolute -top-10 -right-4 md:right-0 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md hidden md:block">
              <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-1">Signal Strength</span>
              <span className="text-xl font-display font-bold text-white tracking-tighter">99.8%</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}