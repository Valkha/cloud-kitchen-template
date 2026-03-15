import { ReactNode } from "react";
import LayoutClient from "@/components/LayoutClient"; 
import ActiveOrderButton from "@/components/ActiveOrderButton";

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* On réintègre LayoutClient pour supprimer l'erreur ESLint */}
      <LayoutClient>
        {children}
      </LayoutClient>
      <ActiveOrderButton />
    </>
  );
}