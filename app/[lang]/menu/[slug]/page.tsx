import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Plus, Star, Info } from "lucide-react";

// ✅ Définition des types pour Supabase
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  desc: string;
  color: string;
  image: string;
  products: Product[]; // Jointure Supabase
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;

  // 1. Récupérer l'enseigne et ses produits
  const { data: brand, error } = await supabase
    .from("brands")
    .select("*, products(*)")
    .eq("slug", slug)
    .single();

  // Cast manuel pour aider TypeScript car le retour de Supabase est générique
  const typedBrand = brand as Brand | null;

  if (error || !typedBrand) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* --- HERO BANNER --- */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-end pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 bg-center bg-cover"
          style={{ backgroundImage: `url(${typedBrand.image || '/images/hero-bg.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <Reveal>
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-black/50"
                style={{ color: typedBrand.color }}
              >
                <Star size={20} fill="currentColor" className="opacity-20" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">
                Station Active
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-2">
              {typedBrand.name}
            </h1>
            <p className="max-w-xl text-neutral-400 text-sm font-medium italic">
              {typedBrand.desc}
            </p>
          </Reveal>
        </div>
      </section>

      {/* --- MENU GRID --- */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
            <h2 className="text-2xl font-display font-black uppercase tracking-widest">
              {lang === 'fr' ? 'La Carte' : 'The Menu'}
            </h2>
            <div className="flex gap-2 text-[10px] font-black uppercase opacity-40">
              <Info size={12} />
              <span>TVA incluse / Delivery Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {typedBrand.products?.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.1}>
                <div className="glass-panel rounded-[2rem] p-6 group hover:border-white/20 transition-all duration-500 flex flex-col h-full">
                  <div className="relative aspect-video mb-6 overflow-hidden rounded-2xl bg-white/5">
                    <Image
                      src={product.image_url || "/images/placeholder-food.png"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-display font-black uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-brand-primary font-display font-black text-lg italic">
                      {product.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-neutral-500 text-xs leading-relaxed mb-8 flex-grow">
                    {product.description}
                  </p>

                  <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                    <Plus size={14} />
                    {lang === 'fr' ? 'Ajouter au Panier' : 'Add to Cart'}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          {(!typedBrand.products || typedBrand.products.length === 0) && (
            <div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">
              Stock épuisé dans ce secteur.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}