"use client";

import { m } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";
import TransitionLink from "./TransitionLink";
import { siteConfig } from "../../config/site"; 
import { ChevronRight, Utensils, Star, ShieldCheck, Store } from "lucide-react"; // ✅ Ajout de l'icône Store

export default function HomeClient() {
  const { t, lang } = useTranslation();

  return (
    <div className="bg-brand-black min-h-screen text-white">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <m.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">
              Bienvenue chez {siteConfig.name}
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-bold uppercase leading-none mb-6">
              {t.hero.title_top} <br />
              <span className="text-gray-500">{t.hero.title_bottom}</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
              {t.hero.desc}
            </p>
            {/* ✅ CORRECTION : Le bouton pointe maintenant vers l'ancre #restaurants */}
            <TransitionLink 
              href={`/${lang}#restaurants`} 
              className="inline-flex items-center gap-3 bg-brand-primary text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
            >
              {t.hero.btnMenu}
              <ChevronRight size={20} />
            </TransitionLink>
          </m.div>
        </div>
      </section>

      {/* ARGUMENTS CLOUD KITCHEN */}
      <section className="py-24 border-t border-neutral-900 bg-neutral-900/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
                <Utensils size={32} />
              </div>
              <h3 className="text-xl font-bold uppercase">Multi-Restaurants</h3>
              <p className="text-gray-500 text-sm">Commandez dans plusieurs enseignes en un seul panier.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold uppercase">Qualité Premium</h3>
              <p className="text-gray-500 text-sm">Une sélection rigoureuse de produits frais et locaux.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold uppercase">Sécurité Garantie</h3>
              <p className="text-gray-500 text-sm">Transactions rapides et protégées pour votre sérénité.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ NOUVELLE SECTION CIBLE : C'est ici que la page va "scroller" */}
      <section id="restaurants" className="py-32 border-t border-neutral-900 relative">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-3xl mb-8">
            <Store size={40} />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-6">Nos Enseignes</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-lg">
            Découvrez nos différents univers culinaires et choisissez le restaurant de vos envies.
          </p>
          
          <div className="p-20 border-2 border-dashed border-neutral-800 rounded-[3rem] text-gray-600 uppercase tracking-widest text-sm font-bold bg-neutral-900/20">
            [ Espace pour afficher les cartes de vos restaurants ]
          </div>
        </div>
      </section>

    </div>
  );
}