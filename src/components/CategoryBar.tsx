"use client";

import { useRef, useEffect } from "react";
// ✅ Suppression de useState et AnimatePresence inutilisés
import { m } from "framer-motion";

interface Category {
  id: string;
  name: string;
}

interface CategoryBarProps {
  categories: Category[];
  activeId: string;
  onCategoryClick: (id: string) => void;
}

export default function CategoryBar({ categories, activeId, onCategoryClick }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll de la barre pour garder la catégorie active centrée
  useEffect(() => {
    const activeElement = document.getElementById(`cat-${activeId}`);
    if (activeElement && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const scrollLeft = activeElement.offsetLeft - scrollContainer.offsetWidth / 2 + activeElement.offsetWidth / 2;
      scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <nav className="sticky top-16 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 py-4 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 px-6 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              id={`cat-${cat.id}`}
              onClick={() => onCategoryClick(cat.id)}
              className={`relative px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${
                isActive ? "text-black" : "text-gray-500 hover:text-white"
              }`}
            >
              <span className="relative z-10">{cat.name}</span>
              {isActive && (
                <m.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}