import { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <LanguageProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </LanguageProvider>
    </UserProvider>
  );
}