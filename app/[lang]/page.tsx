import { Metadata } from "next";
import HomeClient from "src/components/HomeClient";
import { siteConfig } from "../../config/site";

// ✅ Métadonnées SEO épurées pour le template Cloud Kitchen
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';
  
  const titles = {
    en: `Home - Premium Marketplace | ${siteConfig.name}`,
    es: `Inicio - Marketplace Premium | ${siteConfig.name}`,
    fr: `Accueil - Votre Marketplace Cuisine | ${siteConfig.name}`
  };
  
  return { 
    title: titles[lang as keyof typeof titles] || titles.fr 
  };
}

export default function HomePage() {
  return <HomeClient />;
}