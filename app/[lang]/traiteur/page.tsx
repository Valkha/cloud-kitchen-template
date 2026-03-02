"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext"; 
import { z } from "zod";
// ✅ CORRECTION : 'Utensils' supprimé de la liste des imports
import { Camera, CheckCircle2, Star } from "lucide-react"; 

const cateringSchema = z.object({
  name: z.string().min(2, "Le nom est trop court").max(50),
  email: z.string().email("Format d'email invalide"),
  vision: z.string().min(10, "Détaillez un peu plus votre projet").max(2000),
});

interface CateringBloc {
  tag: string;
  title: string;
  desc: string;
}

export default function TraiteurPage() {
  const { t } = useTranslation(); 
  
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({}); // ✅ Utilisé maintenant dans le JSX

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      vision: formData.get("vision"),
    };

    const result = cateringSchema.safeParse(data);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]);
        formattedErrors[fieldName] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setFormStatus("submitting");
    setTimeout(() => {
      setFormStatus("success");
    }, 2000);
  }

  const experienceImages = [
    "/images/plateau-sushi-2.png",
    "/images/plateau-sushi.png",
    "/images/plateau-sushi-1.jpg"
  ];

  const galleryImages = [
    "/images/catering-1.jpg", "/images/catering-2.jpg", "/images/catering-3.jpg",
    "/images/catering-4.jpg", "/images/catering-5.jpg", "/images/catering-6.jpg",
    "/images/catering-7.jpg", "/images/catering-8.jpg", "/images/catering-9.jpg",
    "/images/catering-1.jpg", "/images/catering-2.jpg", "/images/catering-3.jpg",
    "/images/catering-4.jpg", "/images/catering-5.jpg", "/images/catering-6.jpg",
  ];

  return (
    <div className="bg-kabuki-black min-h-screen pb-0 text-white">
      
      {/* --- HERO TRAITEUR --- */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <h2 className="text-[12vw] font-black text-white/[0.03] uppercase leading-none select-none tracking-tighter">
            KABUKI CATERING
          </h2>
        </div>
        <div className="relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-7xl font-display font-bold uppercase tracking-[0.2em] mb-4">
              L&apos;ART DE RECEVOIR
            </h1>
            <div className="w-16 h-1 bg-kabuki-red mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 01 : SAVOIR-FAIRE --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          {t.catering.blocs.slice(0, 1).map((bloc: CateringBloc, index: number) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              <div className="relative aspect-[3/4] md:h-[650px] w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neutral-800">
                <Image src={experienceImages[0]} alt={bloc.title} fill className="object-cover" priority />
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-kabuki-red font-display text-xl font-bold uppercase tracking-widest">01. {bloc.tag}</span>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight uppercase font-display">{bloc.title}</h2>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed max-w-xl">{bloc.desc}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-500 font-bold uppercase tracking-[0.2em]">
                    <CheckCircle2 size={18} className="text-kabuki-red" /> Excellence Garantie
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- GALERIE AUTO-SCROLL --- */}
      <section className="py-24 bg-neutral-950 overflow-hidden">
        <div className="container mx-auto px-6 mb-16">
            <div className="flex items-center gap-6">
                <div className="h-px bg-neutral-800 flex-1"></div>
                <h2 className="text-xl font-display font-bold uppercase tracking-[0.3em] flex items-center gap-4">
                    <Camera size={20} className="text-kabuki-red" /> Galerie Signature
                </h2>
                <div className="h-px bg-neutral-800 flex-1"></div>
            </div>
        </div>

        <div className="flex w-full">
          <motion.div 
            className="flex flex-nowrap gap-6 px-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          >
            {galleryImages.map((img, i) => (
              <div key={i} className="relative w-[280px] h-[380px] md:w-[400px] md:h-[550px] rounded-2xl overflow-hidden shrink-0 border border-neutral-800 group">
                <Image src={img} alt={`Galerie ${i}`} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FORMULAIRE DEVIS --- */}
      <section id="devis" className="py-32 relative">
        <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-5 z-0"></div>
        <div className="container mx-auto px-6 relative z-10 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-neutral-900/40 backdrop-blur-xl p-10 md:p-20 rounded-[3rem] border border-neutral-800 shadow-2xl"
          >
            {formStatus === "success" ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-kabuki-red/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={40} className="text-kabuki-red" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4 uppercase tracking-wider">{t.catering.formSection.successTitle}</h2>
                <p className="text-gray-400 mb-10 text-lg">{t.catering.formSection.successDesc}</p>
                <button onClick={() => setFormStatus("idle")} className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-kabuki-red hover:text-white transition-all">Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-display font-bold uppercase tracking-[0.2em]">Demander un Devis</h2>
                    <p className="text-neutral-500 uppercase text-xs font-black tracking-widest italic">Réponse personnalisée sous 24h</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-kabuki-red uppercase tracking-[0.3em] ml-1">Nom Complet</label>
                    <input name="name" type="text" className={`w-full bg-transparent border-b ${errors.name ? 'border-kabuki-red' : 'border-neutral-700'} px-1 py-4 outline-none focus:border-kabuki-red transition-all`} placeholder="JEAN DUPONT" />
                    {/* ✅ CORRECTION : 'errors' utilisé ici */}
                    {errors.name && <p className="text-kabuki-red text-[9px] font-bold uppercase">{errors.name}</p>}
                  </div>
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black text-kabuki-red uppercase tracking-[0.3em] ml-1">Email Professionnel</label>
                    <input name="email" type="email" className={`w-full bg-transparent border-b ${errors.email ? 'border-kabuki-red' : 'border-neutral-700'} px-1 py-4 outline-none focus:border-kabuki-red transition-all`} placeholder="CONTACT@ENTREPRISE.CH" />
                    {/* ✅ CORRECTION : 'errors' utilisé ici */}
                    {errors.email && <p className="text-kabuki-red text-[9px] font-bold uppercase">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-kabuki-red uppercase tracking-[0.3em] ml-1">Votre Vision</label>
                    <textarea name="vision" rows={4} className={`w-full bg-transparent border-b ${errors.vision ? 'border-kabuki-red' : 'border-neutral-700'} px-1 py-4 outline-none focus:border-kabuki-red transition-all resize-none`} placeholder="DÉCRIVEZ VOTRE ÉVÉNEMENT..."></textarea>
                    {/* ✅ CORRECTION : 'errors' utilisé ici */}
                    {errors.vision && <p className="text-kabuki-red text-[9px] font-bold uppercase">{errors.vision}</p>}
                </div>

                <button type="submit" disabled={formStatus === "submitting"} className="w-full bg-kabuki-red py-6 rounded-full font-bold text-lg uppercase tracking-[0.3em] hover:bg-white hover:text-kabuki-black transition-all shadow-2xl flex items-center justify-center gap-4">
                    {formStatus === "submitting" ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "ENVOYER LA DEMANDE"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <footer className="py-20 border-t border-neutral-900 text-center">
          <div className="container mx-auto px-6">
              <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">
                  <span className="flex items-center gap-2"><Star size={12} className="text-kabuki-red" /> Ingrédients Ultra-Frais</span>
                  <span className="flex items-center gap-2"><Star size={12} className="text-kabuki-red" /> Maîtres Sushi</span>
                  <span className="flex items-center gap-2"><Star size={12} className="text-kabuki-red" /> Service Clé en Main</span>
              </div>
          </div>
      </footer>
    </div>
  );
}