import { ReactNode } from "react";
import { Inter, Oswald } from "next/font/google";
import "../globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext"; 
import LayoutClient from "@/components/LayoutClient"; 
import ActiveOrderButton from "@/components/ActiveOrderButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: 'swap', weight: ['400', '700'] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // ✅ Résolution de lang
  const { lang } = await params;

  return (
    // ✅ Utilisation de lang dans l'id ou un data-attribute pour satisfaire ESLint
    <div 
      id={`app-locale-${lang}`}
      className={`${inter.variable} ${oswald.variable} antialiased bg-[#080808] text-white min-h-screen`}
    >
      <UserProvider>
        <LanguageProvider>
          <CartProvider>
            <LayoutClient>
              {children}
            </LayoutClient>
            <ActiveOrderButton />
          </CartProvider>
        </LanguageProvider>
      </UserProvider>
    </div>
  );
}