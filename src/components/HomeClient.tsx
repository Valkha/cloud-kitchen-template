"use client";

import Link from "next/link";
import Image from "next/image";
// ✅ Suppression de 'motion' qui n'était plus utilisé ici (ESLint)
import Reveal from "@/components/Reveal";
import { useTranslation } from "@/context/LanguageContext";

// ✅ 1. Définition de l'interface pour supprimer l'erreur 'any'
interface Testimonial {
  text: string;
  name: string;
  role: string;
}

export default function Home() {
  // On récupère 'lang' pour construire les liens dynamiques
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/traiteur-hero.jpg" 
            alt="Sushi Art"
            fill
            priority 
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <Reveal delay={0.2}>
            <h2 className="text-kabuki-red font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
              {t.hero.subtitle}
            </h2>
          </Reveal>

          <Reveal delay={0.4}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-8 uppercase leading-none">
              {t.hero.title_top} <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                {t.hero.title_bottom}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.6}>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.hero.desc}
            </p>
          </Reveal>
          
          <Reveal delay={0.8} y={40}>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link 
                href={`/${lang}/menu`} 
                className="px-8 py-4 bg-kabuki-red text-white font-bold rounded-full hover:bg-red-700 transition uppercase tracking-widest shadow-lg hover:shadow-red-900/40"
              >
                {t.hero.btnMenu}
              </Link>
              <Link 
                href={`/${lang}/traiteur`} 
                className="px-8 py-4 bg-transparent border border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition uppercase tracking-widest"
              >
                {t.hero.btnTraiteur}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- SECTION AVIS CLIENTS --- */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-kabuki-red font-bold tracking-widest uppercase text-sm">
                {t.testimonials.subtitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mt-2">
                {t.testimonials.title}
              </h2>
              <div className="w-20 h-1 bg-neutral-700 mx-auto mt-6"></div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {t.testimonials.items.map((avis: Testimonial, index: number) => (
              <Reveal key={index} delay={index * 0.2} y={30}>
                <div className="bg-neutral-800/20 backdrop-blur-md p-8 rounded-2xl border border-neutral-700/30 hover:border-kabuki-red transition-colors duration-300 relative group h-full">
                  <div className="absolute top-6 right-8 text-6xl text-neutral-700 font-serif leading-none opacity-50 group-hover:text-kabuki-red transition-colors">&quot;</div>
                  
                  <div className="flex text-yellow-500 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-300 italic mb-6 leading-relaxed relative z-10">
                    {avis.text}
                  </p>

                  <div className="border-t border-neutral-700 pt-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold font-display tracking-wide">{avis.name}</h4>
                      <span className="text-xs text-kabuki-red font-bold uppercase">{avis.role}</span>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">
                      G
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5}>
            <div className="text-center mt-12">
              <p className="text-gray-400">
                {t.testimonials.rating.replace("{note}", "4.9")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- BANNIÈRE CTA FINALE --- */}
      <section className="py-20 bg-kabuki-red text-white text-center">
        <div className="container mx-auto px-6">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-display font-bold uppercase mb-6">
              {t.cta.title}
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              {t.cta.desc}
            </p>
          </Reveal>
          
          <Reveal delay={0.3} y={20}>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link 
                  href={`/${lang}/menu`} 
                  className="bg-white text-kabuki-red px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-neutral-100 transition shadow-xl"
                >
                  {t.hero.btnMenu}
                </Link>
                {/* ✅ Mise à jour du numéro : +41 78 604 15 42 */}
                <a 
                  href="tel:+41786041542" 
                  className="bg-black/20 border border-white/30 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-black/40 transition flex items-center justify-center gap-3"
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