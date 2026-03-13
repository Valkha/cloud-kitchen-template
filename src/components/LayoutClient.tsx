"use client";

import { ReactNode } from "react";

export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-red-900 flex flex-col">
      <nav className="p-4 bg-black border-b border-white/10">
        TEST NAVIGATION - SI TU VOIS ÇA, LE LAYOUT FONCTIONNE
      </nav>
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}