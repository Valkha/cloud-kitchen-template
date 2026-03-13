import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Star, Info } from "lucide-react";
import AddToCartWrapper from "@/components/AddToCartWrapper";

// ✅ Interfaces alignées sur ta structure Supabase
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string; // Vérifie si c'est 'desc' ou 'description' dans ta table
  color: string;
  image_url: string; // Vérifie si c'est 'image' ou 'image_url'
  products: Product[];
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

  // 📡 Récupération du restaurant et de ses produits via la relation
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*, products(*)")
    .eq("slug", slug)
    .single();

  const typedRestaurant = restaurant as Restaurant | null;

  if (error || !typedRestaurant) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* --- HERO BANNER --- */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-end pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 bg-center bg-cover"
          style={{ backgroundImage: `url(${typedRestaurant.image_url || '/images/hero-bg.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <Reveal>
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-black/50"
                style={{ color: typedRestaurant.color || "#A855F7" }}
              >
                <Star size={20} fill="currentColor" className="opacity-20" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">
                {lang === 'fr' ? 'Station Ouverte' : 'Station Online'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-2">
              {typedRestaurant.name}
            </h1>
            <p className="max-w-xl text-neutral-400 text-sm font-medium italic">
              {typedRestaurant.description}
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
            <div className="flex gap-4 text-[10px] font-black uppercase opacity-40">
              <div className="flex items-center gap-2">
                <Info size={12} />
                <span>Standard Galactique</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {typedRestaurant.products?.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.1}>
                <div className="glass-panel rounded-[2.5rem] p-6 group hover:border-white/20 transition-all duration-500 flex flex-col h-full bg-white/[0.02]">
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

                  <AddToCartWrapper 
                    lang={lang}
                    item={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      restaurant_id: typedRestaurant.id,
                      restaurant_name: typedRestaurant.name
                    }}
                  />
                </div>
              </Reveal>
            ))}
          </div>

          {(!typedRestaurant.products || typedRestaurant.products.length === 0) && (
            <div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">
              Aucun ravitaillement disponible pour le moment.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}