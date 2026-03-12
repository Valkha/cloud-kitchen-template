"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";
import Image from "next/image";
import { Plus, Loader2 } from "lucide-react";
import Reveal from "./Reveal";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  brands: { name: string };
}

export default function FeaturedSelection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('/api/products/featured');
        if (!response.ok) throw new Error();
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Erreur produits:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeatured();
  }, []);

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
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {products.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.2}>
                <div className="group relative">
                  <div className="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative aspect-square mb-8">
                    <m.div 
                      whileHover={{ y: -20, rotate: 5 }}
                      className="relative w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                    >
                      <Image 
                        src={item.image_url || "/images/placeholder-food.png"} 
                        alt={item.name} 
                        fill 
                        className="object-contain"
                      />
                    </m.div>
                    <div className="absolute top-0 left-0 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-neutral-400">
                      {item.brands?.name}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-display font-black uppercase tracking-wide mb-2 group-hover:text-brand-primary transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-brand-primary font-display font-black text-lg italic">
                        {item.price.toFixed(2)} <small className="not-italic text-[10px] opacity-50">CHF</small>
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
        )}
      </div>
    </section>
  );
}