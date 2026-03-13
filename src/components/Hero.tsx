"use client";

import { useTranslation } from "@/context/LanguageContext";

export default function Hero() {
  const { t, lang } = useTranslation();

  return (
    <section className="relative min-h-[500px] flex flex-col items-center justify-center pt-20 bg-pink-500 text-white z-50">
      <h1 className="text-6xl font-black">🚀 HERO BASIQUE EN LIGNE</h1>
      <p className="mt-4 text-2xl">
        Langue active : {lang} <br />
        Titre traduit : {t?.hero?.title_top || "Traduction introuvable"}
      </p>
      <p className="mt-8 font-bold bg-black p-4 rounded-xl">
        Si tu vois ce gros bloc rose, le problème vient de TransitionLink ou de Reveal !
      </p>
    </section>
  );
}