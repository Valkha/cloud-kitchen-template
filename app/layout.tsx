import { ReactNode } from "react";
import { Inter, Oswald } from "next/font/google";
import "./globals.css"; // Attention : on ajuste le chemin car on est à la racine de /app
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: 'swap', weight: ['400', '700'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // On met 'fr' par défaut. Le LanguageProvider gérera la traduction en interne.
    <html lang="fr" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="bg-[#080808] text-white antialiased">
        <UserProvider>
          <LanguageProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}