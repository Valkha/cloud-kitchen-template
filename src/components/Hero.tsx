"use client";

import { m } from "framer-motion";
import { Rocket, ChevronDown } from "lucide-react";
import TransitionLink from "./TransitionLink";
import Reveal from "./Reveal";
import { useTranslation } from "@/context/LanguageContext";

export default function Hero() {
  const { t, lang } = useTranslation();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* --- CONTENT --- */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Rocket size={14} className="text-brand-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              {t.hero.subtitle || "Nouvelle Dimension Culinaire"}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black uppercase leading-[0.85] tracking-tighter mb-8">
            {t.hero.title_top || "Planet"} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 group hover:to-brand-primary transition-all duration-700 cursor-default">
              {t.hero.title_bottom || "Food"}
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="max-w-xl mx-auto text-neutral-500 text-sm md:text-base mb-12 font-light leading-relaxed tracking-wide italic">
            {/* ✅ CORRECTION : t.home.heroDesc devient t.hero.desc */}
            {t.hero.desc}
          </p>
        </Reveal>

        <Reveal delay={0.6}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <TransitionLink 
              href={`/${lang}/menu`}
              className="group relative px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              <div className="absolute inset-0 bg-brand-primary translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                {t.hero.btnMenu || "Lancer l'expérience"}
              </span>
            </TransitionLink>

            <TransitionLink 
              href={`/${lang}#restaurants`}
              className="px-10 py-5 rounded-2xl border border-white/10 text-white font-black uppercase text-[12px] tracking-[0.2em] hover:bg-white/5 transition-all"
            >
              {lang === 'fr' ? "Voir les enseignes" : "Explore Brands"}
            </TransitionLink>
          </div>
        </Reveal>
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-600">Scroll</span>
        <m.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown size={20} className="text-brand-primary" />
        </m.div>
      </m.div>
    </section>
  );
}