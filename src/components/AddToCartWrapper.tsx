"use client";

import { Plus } from "lucide-react";
import { useCart, MenuItem } from "@/context/CartContext";

interface AddToCartWrapperProps {
  item: MenuItem;
  lang: string;
}

export default function AddToCartWrapper({ item, lang }: AddToCartWrapperProps) {
  const { addToCart } = useCart();

  return (
    <button 
      onClick={() => addToCart(item)}
      className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
    >
      <Plus size={14} />
      {lang === 'fr' ? 'Ajouter au Panier' : 'Add to Cart'}
    </button>
  );
}