import { Metadata } from "next";
import { siteConfig } from "../../config/site";
// 🛑 Les imports sont commentés pour le test
// import { Suspense } from "react";
import Hero from "@/components/Hero";
// import BrandsSection from "@/components/BrandsSection";
// import FeaturedSelection from "@/components/FeaturedSelection";
// import ConceptSection from "@/components/ConceptSection";
// import FinalCTA from "@/components/FinalCTA";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { 
    title: lang === 'en' ? `Home - ${siteConfig.name}` : `Accueil - ${siteConfig.name}` 
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  await params;

  return (
    <div className="relative min-h-screen bg-[#080808] z-10 p-10">
      
      {/* 🟢 ZONE DE CONTROLE VISUEL */}
      <div className="border-4 border-yellow-500 bg-black text-white p-10 mb-10 rounded-xl">
        <h1 className="text-4xl font-black text-brand-primary uppercase">📍 Base Planet Food : En Ligne</h1>
        {/* ✅ L'apostrophe est corrigée avec &apos; */}
        <p className="mt-4 text-xl">Si tu vois ce cadre, la page fonctionne. Le problème vient d&apos;un des composants en dessous.</p>
      </div>

      <div className="relative z-20 w-full flex flex-col gap-10">
        
        {/* 🛑 DECOMMENTE L'IMPORT EN HAUT ET LE COMPOSANT ICI LIGNE PAR LIGNE POUR TROUVER LE COUPABLE */}
        
        <Hero />
        
        {/* <Suspense fallback={<div className="h-48 border border-white/20 flex items-center justify-center text-white">Chargement des secteurs...</div>}>
          <BrandsSection />
        </Suspense> */}

        {/* <Suspense fallback={<div className="h-48 border border-white/20 flex items-center justify-center text-white">Initialisation des produits...</div>}>
          <FeaturedSelection />
        </Suspense> */}

        {/* <ConceptSection /> */}
        
        {/* <FinalCTA /> */}

      </div>
    </div>
  );
}