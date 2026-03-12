import { Metadata } from "next";
import { siteConfig } from "../../config/site";

// Importation des nouvelles sections Planet Food
import Hero from "@/components/Hero";
import BrandsSection from "@/components/BrandsSection";
import FeaturedSelection from "@/components/FeaturedSelection";
import ConceptSection from "@/components/ConceptSection";
import FinalCTA from "@/components/FinalCTA";

// ✅ Métadonnées SEO adaptées pour Planet Food
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';
  
  const titles = {
    en: `Home - Galactic Food Experience | ${siteConfig.name}`,
    es: `Inicio - Experiencia Galáctica | ${siteConfig.name}`,
    fr: `Accueil - Expérience Culinaire Galactique | ${siteConfig.name}`
  };
  
  return { 
    title: titles[lang as keyof typeof titles] || titles.fr 
  };
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#080808] overflow-x-hidden">
      {/* --- Effet de fond persistant (Nébuleuse très subtile) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03)_0%,transparent_70%)]" />
      </div>

      {/* --- Structure de la Page --- */}
      <div className="relative z-10">
        <Hero />
        
        <BrandsSection />
        
        <FeaturedSelection />
        
        <ConceptSection />
        
        <FinalCTA />
      </div>
    </main>
  );
}