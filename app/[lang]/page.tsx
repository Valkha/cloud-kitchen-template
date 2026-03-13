import { Metadata } from "next";
import { siteConfig } from "../../config/site";
import { Suspense } from "react";

// Importation des sections
import Hero from "@/components/Hero";
import BrandsSection from "@/components/BrandsSection";
import FeaturedSelection from "@/components/FeaturedSelection";
import ConceptSection from "@/components/ConceptSection";
import FinalCTA from "@/components/FinalCTA";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { 
    title: lang === 'en' ? `Home - ${siteConfig.name}` : `Accueil - ${siteConfig.name}` 
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  // ✅ On attend les params mais on ne déclare pas 'lang' s'il n'est pas utilisé ici
  await params;

  return (
    <main className="relative min-h-screen bg-[#080808]">
      {/* Fond décoratif */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full">
        <Hero />
        
        {/* Sections avec Suspense pour éviter de bloquer le rendu de la page */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center opacity-20 uppercase tracking-widest text-[10px]">Chargement des secteurs...</div>}>
          <BrandsSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 flex items-center justify-center opacity-20 uppercase tracking-widest text-[10px]">Initialisation des produits...</div>}>
          <FeaturedSelection />
        </Suspense>

        <ConceptSection />
        <FinalCTA />
      </div>
    </main>
  );
}