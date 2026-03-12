import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "../globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext"; 
import LayoutClient from "@/components/LayoutClient"; 
import ActiveOrderButton from "@/components/ActiveOrderButton";
import { siteConfig } from "../../config/site"; 

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const oswald = Oswald({ 
  subsets: ["latin"], 
  variable: "--font-oswald",
  display: 'swap',
  // ✅ Correction : On reste sur 400 et 700 (le max autorisé par le type)
  weight: ['400', '700'], 
});

export const viewport: Viewport = {
  themeColor: "#A855F7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
};

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';
  const siteUrl = siteConfig.url;

  return {
    metadataBase: new URL(siteUrl),
    manifest: "/manifest.json",
    appleWebApp: { 
      capable: true,
      statusBarStyle: "default",
      title: siteConfig.name,
    },
    title: {
      template: `%s | ${siteConfig.name}`,
      default: lang === 'en' 
        ? `${siteConfig.name} | Galactic Food Experience` 
        : `${siteConfig.name} | Expérience Culinaire Galactique`,
    },
    description: siteConfig.description,
    keywords: ["Planet Food", "Cloud Kitchen", "Gastronomie Galactique", "Livraison Premium"],
    authors: [{ name: siteConfig.name }],
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: {
        'fr-CH': `${siteUrl}/fr`,
        'en-CH': `${siteUrl}/en`,
        'es-CH': `${siteUrl}/es`,
      },
    },
    openGraph: {
      type: "website",
      locale: lang === 'fr' ? 'fr_CH' : lang === 'en' ? 'en_CH' : 'es_CH',
      url: `${siteUrl}/${lang}`,
      title: `${siteConfig.name} | Mission Control`,
      images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    },
    icons: { 
      icon: "/images/logo.png",
      apple: "/icons/icon-192x192.png",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';

  return (
    <html lang={lang} className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen bg-[#080808] text-white overflow-x-hidden">
        <UserProvider>
          <LanguageProvider>
            <CartProvider>
              <LayoutClient>
                {children}
              </LayoutClient>
              
              <ActiveOrderButton />

              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Restaurant",
                    "name": siteConfig.name,
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": siteConfig.contact.address.street,
                      "addressLocality": siteConfig.contact.address.city,
                      "postalCode": siteConfig.contact.address.zipCode,
                      "addressCountry": siteConfig.contact.address.country
                    },
                    "telephone": siteConfig.contact.phone,
                    "priceRange": "$$$",
                    "servesCuisine": "Galactic Fusion"
                  })
                }}
              />
            </CartProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}