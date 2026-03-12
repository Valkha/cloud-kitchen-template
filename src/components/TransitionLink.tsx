"use client";

import Link, { LinkProps } from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";

interface TransitionLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void; // ✅ Permet de passer des fonctions comme la fermeture du menu mobile
}

export default function TransitionLink({ children, href, className, onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Si une action a été passée (ex: fermer le menu), on l'exécute
    if (onClick) onClick();

    const hrefString = href.toString();

    // ✅ GESTION INTELLIGENTE DES ANCRES (#)
    if (hrefString.includes("#")) {
      const [path, hash] = hrefString.split("#");
      
      // Si l'ancre est sur la page actuelle, on fait un scroll fluide sans loader
      if (path === pathname || path === "") {
        e.preventDefault();
        const targetElement = document.getElementById(hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
        return; // On arrête la fonction ici, pas besoin d'écran de chargement !
      }
    }

    // Comportement standard pour un vrai changement de page
    e.preventDefault();

    // 1. On lance le loader via un CustomEvent
    const startEvent = new CustomEvent("start-loader");
    window.dispatchEvent(startEvent);

    // 2. Sécurité Anti-Blocage (Force l'arrêt du loader après 2s max)
    const safetyTimeout = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("stop-loader"));
    }, 2000);

    // 3. Délai pour laisser le rideau/loader s'afficher (150ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 4. Changement de page
    router.push(hrefString);

    // 5. On laisse un peu de temps à la nouvelle page pour charger avant d'arrêter le loader
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("stop-loader"));
      clearTimeout(safetyTimeout);
    }, 500);
  };

  return (
    <Link {...props} href={href} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
}