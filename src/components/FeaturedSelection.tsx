"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react"; // ✅ Zap supprimé car inutilisé
import Reveal from "./Reveal";
import { useTranslation } from "@/context/LanguageContext";

const BEST_SELLERS = [
  { id: 1, name: "Nebula Burger", price: "18.50", img: "/images/food/burger-1.png", brand: "Burger Station" },
  { id: 2, name: "Zenith Ramen", price: "22.00", img: "/images/food/ramen-1.png", brand: "Planet Food" },
  { id: 3, name: "Cosmo Sushi", price: "24.00", img: "/images/food/sushi-1.png", brand: "Neo Sushi" },
];

export default function FeaturedSelection() {
  // ✅ Correction : 'lang' supprimé car non utilisé pour le moment
  useTranslation(); 

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <Reveal>
              <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Top Rated</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="text-4xl md:text-6xl font-display font-black uppercase">
                La Sélection <span className="text-neutral-700">du Chef</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.4}>
            <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold border-b border-brand-primary pb-2">
              Exploration en cours...
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {BEST_SELLERS.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.2}>
              <div className="group relative">
                {/* Background Glow dynamique */}
                <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative aspect-square mb-8">
                  <m.div 
                    whileHover={{ y: -20, rotate: 5 }}
                    className="relative w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    {/* Placeholder si l'image n'existe pas encore */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-full border border-white/5 opacity-20 group-hover:opacity-40 transition-opacity">
                       <span className="text-[10px] font-black uppercase tracking-widest italic">{item.brand}</span>
                    </div>
                    
                    <Image 
                      src={item.img} 
                      alt={item.name} 
                      fill 
                      className="object-contain"
                    />
                  </m.div>

                  {/* Badge Enseigne style HUD */}
                  <div className="absolute top-0 left-0 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-neutral-400">
                    {item.brand}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-display font-black uppercase tracking-wide mb-2 group-hover:text-brand-primary transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-brand-primary font-display font-black text-lg italic">
                      {item.price} <small className="not-italic text-[10px] opacity-50">CHF</small>
                    </span>
                    <button className="w-8 h-8 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center text-white hover:bg-brand-primary hover:glow-primary transition-all">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}