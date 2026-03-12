"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Phone, MapPin, Send, Loader2, CheckCircle, 
  Clock, ArrowRight 
} from "lucide-react";
import Reveal from "@/components/Reveal";
import { useTranslation } from "@/context/LanguageContext";
import { z } from "zod";
import { siteConfig } from "../../../config/site"; 

// ✅ Schéma de validation Zod
const contactSchema = z.object({
  name: z.string().min(2, "Le nom est trop court").max(50),
  email: z.string().email("Email invalide"),
  subject: z.string(),
  phone: z.string().optional(),
  message: z.string().min(10, "Message trop court (min. 10 caract.)").max(2000),
});

export default function ContactPage() {
  const { t, lang } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // URLs dynamiques
  const addressQuery = encodeURIComponent(`${siteConfig.contact.address.street}, ${siteConfig.contact.address.zipCode} ${siteConfig.contact.address.city}, ${siteConfig.contact.address.country}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${addressQuery}`;

  const findUsLabel = { fr: "Trouvez-nous", en: "Find us", es: "Encuéntranos" }[lang as "fr" | "en" | "es"] || "Trouvez-nous";
  
  const days = {
    fr: { mon: "Lundi", tueFri: "Mardi - Vendredi", satSun: "Samedi - Dimanche", closed: "Fermé", midi: "Midi", soir: "Soir" },
    en: { mon: "Monday", tueFri: "Tuesday - Friday", satSun: "Saturday - Sunday", closed: "Closed", midi: "Lunch", soir: "Dinner" },
    es: { mon: "Lunes", tueFri: "Martes - Viernes", satSun: "Sábado - Domingo", closed: "Cerrado", midi: "Mediodía", soir: "Noche" }
  }[lang as "fr" | "en" | "es"] || { mon: "Lundi", tueFri: "Mardi - Vendredi", satSun: "Samedi - Dimanche", closed: "Fermé", midi: "Midi", soir: "Soir" };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", subject: "Général", phone: "", message: ""
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
      setFormData({ name: "", email: "", subject: "Général", phone: "", message: "" });
      setTimeout(() => setIsSent(false), 5000);
    } catch { 
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen">
      
      {/* HERO */}
      <div className="bg-black text-white pt-24 md:pt-32 pb-20 text-center relative overflow-hidden">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest relative z-10">
            {t.contact.title}
          </h1>
          <p className="text-gray-400 mt-4 text-sm md:text-base relative z-10 max-w-xl mx-auto px-6 italic">
            {t.contact.subtitle}
          </p>
          <div className="w-16 h-1 bg-brand-primary mx-auto mt-8 relative z-10"></div>
        </Reveal>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          <div className="space-y-12">
            <Reveal x={-30}>
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-brand-primary border border-neutral-700 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-xl shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">{t.contact.address}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {siteConfig.name}<br />
                    {siteConfig.contact.address.street}<br />
                    {siteConfig.contact.address.zipCode} {siteConfig.contact.address.city}, {siteConfig.contact.address.country}
                  </p>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-brand-primary hover:text-white transition font-bold text-xs uppercase tracking-widest">
                    {findUsLabel} <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal x={-30} delay={0.2}>
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-brand-primary border border-neutral-700 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-xl shrink-0">
                  <Clock size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-wide">{t.contact.opening}</h3>
                  <div className="space-y-4 text-sm text-gray-400 max-w-xs text-[11px] uppercase tracking-widest">
                    <div className="border-b border-neutral-800 pb-3">
                      <div className="font-bold text-white mb-1">{days.tueFri}</div>
                      <div className="flex justify-between"><span>{days.midi}</span><span className="text-white">11:20 - 14:00</span></div>
                      <div className="flex justify-between"><span>{days.soir}</span><span className="text-white">18:00 - 22:30</span></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{days.mon}</span>
                      <span className="text-brand-primary font-bold">{days.closed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal x={-30} delay={0.4}>
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-brand-primary border border-neutral-700 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-xl shrink-0">
                  <Phone size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wide">Contact Direct</h3>
                  <p className="text-gray-400">Tél : <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="text-white font-bold">{siteConfig.contact.phone}</a></p>
                  <p className="text-gray-400">Email : <a href={`mailto:${siteConfig.contact.email}`} className="text-white font-bold">{siteConfig.contact.email}</a></p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal y={30} delay={0.5}>
            <div className="bg-neutral-800/40 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-neutral-700/50">
              <AnimatePresence mode="wait">
                {!isSent ? (
                  <m.form key="contact-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-2xl font-display font-bold text-white uppercase">Écrivez-nous</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <input 
                          placeholder="Nom" 
                          className={`w-full bg-black/40 text-white border ${errors.name ? 'border-brand-primary' : 'border-neutral-700'} rounded-2xl px-5 py-4 outline-none transition-all`} 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                        {errors.name && <p className="text-brand-primary text-[10px] font-bold uppercase px-2">{errors.name}</p>}
                      </div>
                      <div className="space-y-1">
                        <input 
                          placeholder="Email" 
                          type="email" 
                          className={`w-full bg-black/40 text-white border ${errors.email ? 'border-brand-primary' : 'border-neutral-700'} rounded-2xl px-5 py-4 outline-none transition-all`} 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                        {errors.email && <p className="text-brand-primary text-[10px] font-bold uppercase px-2">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <textarea 
                        placeholder="Message" 
                        rows={4} 
                        className={`w-full bg-black/40 text-white border ${errors.message ? 'border-brand-primary' : 'border-neutral-700'} rounded-2xl px-5 py-4 outline-none resize-none transition-all`} 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                      />
                      {errors.message && <p className="text-brand-primary text-[10px] font-bold uppercase px-2">{errors.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-5 rounded-2xl hover:opacity-90 transition uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Envoyer</>}
                    </button>
                  </m.form>
                ) : (
                  <div className="py-20 text-center space-y-6">
                    <CheckCircle size={48} className="text-green-500 mx-auto" />
                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Message Envoyé</h3>
                    <p className="text-gray-400 italic">Merci, nous reviendrons vers vous rapidement.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="w-full h-[450px] bg-neutral-800 border-t border-neutral-800 relative">
        <iframe 
          src={mapEmbedUrl}
          title={`Plan d'accès ${siteConfig.name}`}
          width="100%" 
          height="100%" 
          style={{border:0}} 
          allowFullScreen={true} 
          loading="lazy" 
          className="filter grayscale opacity-60 hover:opacity-100 transition-all duration-1000"
        ></iframe>
      </div>
    </div>
  );
}