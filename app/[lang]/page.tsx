import { Metadata } from "next";
import HomeClient from "src/components/HomeClient";
import { siteConfig } from "../../config/site"; // ✅ Import de la configuration

// ✅ Génération dynamique des métadonnées SEO pour le template
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';
  
  if (lang === 'en') {
    return { title: `Home - Premium Restaurant | ${siteConfig.name}` };
  } else if (lang === 'es') {
    return { title: `Inicio - Restaurante Premium | ${siteConfig.name}` };
  }
  
  return { title: `Accueil - Restaurant & Traiteur | ${siteConfig.name}` };
}

// ✅ Ici on retire 'params' car le composant n'en a pas besoin pour s'afficher
export default function HomePage() {
  return <HomeClient />;
}