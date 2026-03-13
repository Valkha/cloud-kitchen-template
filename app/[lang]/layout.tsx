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
  const { lang } = await params;

  return (
    <html lang={lang} className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="bg-[#080808] text-white antialiased">
        <UserProvider>
          <LanguageProvider>
            <CartProvider>
              {/* On réintègre LayoutClient pour supprimer l'erreur ESLint */}
              <LayoutClient>
                {children}
              </LayoutClient>
              <ActiveOrderButton />
            </CartProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}