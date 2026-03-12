import { Metadata } from "next";
import { siteConfig } from "../../config/site";

// Importation des sections
import Hero from "@/components/Hero";
import BrandsSection from "@/components/BrandsSection";
import FeaturedSelection from "@/components/FeaturedSelection";
import ConceptSection from "@/components/ConceptSection";
import FinalCTA from "@/components/FinalCTA";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { 
    title: lang === 'fr' ? `Accueil - ${siteConfig.name}` : `Home - ${siteConfig.name}` 
  };
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#080808]">
      {/* ✅ FIX : On s'assure que le fond ne bloque pas les clics avec 'pointer-events-none' 
        et qu'il reste bien en dessous de tout avec 'z-0'.
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03)_0%,transparent_70%)]" />
      </div>

      {/* ✅ Le contenu doit impérativement être en z-10 pour être cliquable */}
      <div className="relative z-10 w-full">
        <Hero />
        <BrandsSection />
        <FeaturedSelection />
        <ConceptSection />
        <FinalCTA />
      </div>
    </main>
  );
}