"use client";

import Link from "next/link";
// ✅ Image supprimé car non utilisé
import Reveal from "@/components/Reveal";
import { useTranslation } from "@/context/LanguageContext";

interface Testimonial {
  text: string;
  name: string;
  role: string;
}

export default function Home() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-[#080808]">
      
      {/* --- HERO SECTION (Version Ultra-Performance) --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* --- FOND DESIGN SANS IMAGE --- */}
        <div className="absolute inset-0 z-0">
          {/* Dégradé radial pour l'effet "Luxe" */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-100" />
          
          {/* Texture de fond subtile */}
          <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-[0.03] pointer-events-none" />
          
          {/* Lueur rouge discrète pour le rappel de marque */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-kabuki-red/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-kabuki-red/5 rounded-full blur-[100px]" />
          
          {/* Overlay dégradé pour la profondeur */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <Reveal delay={0.2}>
            <p className="text-kabuki-red font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
              {t.hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-8 uppercase leading-none tracking-tighter">
              {t.hero.title_top} <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                {t.hero.title_bottom}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.6}>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light italic">
              {t.hero.desc}
            </p>
          </Reveal>
          
          <Reveal delay={0.8} y={40}>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link 
                href={`/${lang}/menu`} 
                className="px-10 py-5 bg-kabuki-red text-white font-bold rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest shadow-xl shadow-red-900/20"
              >
                {t.hero.btnMenu}
              </Link>
              <Link 
                href={`/${lang}/traiteur`} 
                className="px-10 py-5 bg-transparent border border-white/10 text-white font-bold rounded-2xl hover:bg-white hover:text-black transition-all uppercase tracking-widest backdrop-blur-sm"
              >
                {t.hero.btnTraiteur}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- SECTION AVIS CLIENTS --- */}
      <section className="py-24 relative bg-[#080808]">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-kabuki-red font-bold tracking-widest uppercase text-sm">
                {t.testimonials.subtitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mt-2">
                {t.testimonials.title}
              </h2>
              <div className="w-20 h-1 bg-neutral-800 mx-auto mt-6"></div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {t.testimonials.items.map((avis: Testimonial, index: number) => (
              <Reveal key={index} delay={index * 0.2} y={30}>
                <div className="bg-neutral-900/40 backdrop-blur-md p-8 rounded-3xl border border-neutral-800 hover:border-kabuki-red/50 transition-all duration-500 group h-full shadow-2xl">
                  <div className="absolute top-6 right-8 text-6xl text-neutral-800 font-serif leading-none opacity-50 group-hover:text-kabuki-red transition-colors" aria-hidden="true">&quot;</div>
                  
                  <div className="flex text-yellow-500 mb-6" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-300 italic mb-6 leading-relaxed relative z-10 text-sm">
                    {avis.text}
                  </p>

                  <div className="border-t border-neutral-800 pt-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold font-display tracking-wide">{avis.name}</h3>
                      <span className="text-[10px] text-kabuki-red font-bold uppercase tracking-widest">{avis.role}</span>
                    </div>
                    <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs" aria-hidden="true">
                      G
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5}>
            <div className="text-center mt-12">
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
                {t.testimonials.rating.replace("{note}", "4.9")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- BANNIÈRE CTA FINALE --- */}
      <section className="py-24 bg-kabuki-red text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-[0.05] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase mb-6 tracking-tighter">
              {t.cta.title}
            </h2>
            <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto font-light">
              {t.cta.desc}
            </p>
          </Reveal>
          
          <Reveal delay={0.3} y={20}>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link 
                  href={`/${lang}/menu`} 
                  className="bg-white text-kabuki-red px-12 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-neutral-100 transition shadow-2xl"
                >
                  {t.hero.btnMenu}
                </Link>
                <a 
                  href="tel:+41786041542" 
                  aria-label="Appeler Kabuki Sushi"
                  className="bg-black/20 border border-white/20 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-black/30 transition flex items-center justify-center gap-3 backdrop-blur-md"
                >
                  {t.cta.call} : +41 78 604 15 42
                </a>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}