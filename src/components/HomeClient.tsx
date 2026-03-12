"use client";

import { useEffect, useState, useMemo } from "react";
import { m } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";
import TransitionLink from "./TransitionLink";
import { siteConfig } from "../../config/site"; 
import { ChevronRight, Utensils, Star, ShieldCheck, Store, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ✅ Interface pour typer nos données
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export default function HomeClient() {
  const { t, lang } = useTranslation();
  const supabase = useMemo(() => createClient(), []);
  
  // ✅ États pour gérer le chargement et les données
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // On ne récupère que les enseignes actives
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setRestaurants(data);
      } catch (err) {
        console.error("Erreur lors du chargement des enseignes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [supabase]);

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

      {/* SECTION NOS ENSEIGNES (DYNAMIQUE) */}
      <section id="restaurants" className="py-32 border-t border-neutral-900 relative min-h-[50vh]">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-3xl mb-8">
            <Store size={40} />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold uppercase mb-6">Nos Enseignes</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-lg">
            Découvrez nos différents univers culinaires et choisissez le restaurant de vos envies.
          </p>
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-brand-primary">
              <Loader2 className="animate-spin mb-4" size={48} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Chargement des cuisines...</span>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="p-20 border-2 border-dashed border-neutral-800 rounded-[3rem] text-gray-600 uppercase tracking-widest text-sm font-bold bg-neutral-900/20">
              Aucune enseigne disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {/* ✅ CORRECTION: Suppression du paramètre 'index' inutilisé */}
              {restaurants.map((resto) => (
                <TransitionLink 
                  key={resto.id}
                  href={`/${lang}/menu?restaurant=${resto.slug}`}
                  className="group relative bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 hover:border-brand-primary transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[250px] shadow-2xl"
                >
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      <Store size={24} />
                    </div>
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-2 group-hover:text-brand-primary transition-colors">
                      {resto.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Découvrez le menu et commandez vos plats favoris.
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                    Voir la carte <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300 text-brand-primary" />
                  </div>
                </TransitionLink>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}