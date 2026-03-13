"use client";

import { useState } from "react";
// ✅ Correction : Passage de 'm' à 'motion'
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, MapPin, Send, Loader2, CheckCircle, 
  Clock, ArrowRight 
} from "lucide-react";
import Reveal from "@/components/Reveal";
import { useTranslation } from "@/context/LanguageContext";
import { z } from "zod";
import { siteConfig } from "../../../config/site"; 

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
  
  // ✅ Correction : URLs Google Maps valides et sécurisées
  const addressQuery = encodeURIComponent(`${siteConfig.contact.address.street}, ${siteConfig.contact.address.zipCode} ${siteConfig.contact.address.city}, ${siteConfig.contact.address.country}`);
  const googleMapsUrl = `https://maps.google.com/?q=${addressQuery}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${addressQuery}&t=m&z=15&output=embed&iwloc=near`;

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
    <div className="bg-black min-h-screen">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-[#080808] text-white pt-32 pb-24 text-center relative overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Transmission</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight relative z-10">
            {t.contact.title}
          </h1>
          <p className="text-gray-500 mt-6 text-sm md:text-base relative z-10 max-w-xl mx-auto px-6 font-bold uppercase tracking-widest">
            {t.contact.subtitle}
          </p>
        </Reveal>
      </div>

      {/* --- CONTENU --- */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* INFORMATIONS CONTACT */}
          <div className="space-y-12">
            <Reveal x={-30}>
              <div className="flex gap-6 items-start group cursor-default">
                <div className="w-16 h-16 bg-neutral-900 rounded-[1.5rem] flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105 transition-all shadow-xl shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-white mb-2 uppercase tracking-widest">{t.contact.address}</h3>
                  <p className="text-gray-500 leading-relaxed font-bold text-sm uppercase tracking-wider">
                    <span className="text-white">{siteConfig.name}</span><br />
                    {siteConfig.contact.address.street}<br />
                    {siteConfig.contact.address.zipCode} {siteConfig.contact.address.city}, {siteConfig.contact.address.country}
                  </p>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-brand-primary hover:text-white transition font-black text-[10px] uppercase tracking-[0.2em] bg-brand-primary/10 px-4 py-2 rounded-lg hover:bg-brand-primary cursor-pointer">
                    {findUsLabel} <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal x={-30} delay={0.2}>
              <div className="flex gap-6 items-start group cursor-default">
                <div className="w-16 h-16 bg-neutral-900 rounded-[1.5rem] flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105 transition-all shadow-xl shrink-0">
                  <Clock size={28} />
                </div>
                <div className="w-full">
                  <h3 className="text-xl font-display font-black text-white mb-4 uppercase tracking-widest">{t.contact.opening}</h3>
                  <div className="space-y-4 text-gray-500 max-w-sm text-[10px] uppercase tracking-[0.2em] font-black">
                    <div className="bg-neutral-900/50 p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="text-white mb-2">{days.tueFri}</div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2"><span>{days.midi}</span><span className="text-brand-primary">11:20 - 14:00</span></div>
                      <div className="flex justify-between items-center pt-1"><span>{days.soir}</span><span className="text-brand-primary">18:00 - 22:30</span></div>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-900/50 p-4 rounded-2xl border border-white/5">
                      <span className="text-white">{days.mon}</span>
                      <span className="text-red-500 bg-red-500/10 px-3 py-1 rounded-md">{days.closed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal x={-30} delay={0.4}>
              <div className="flex gap-6 items-start group cursor-default">
                <div className="w-16 h-16 bg-neutral-900 rounded-[1.5rem] flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105 transition-all shadow-xl shrink-0">
                  <Phone size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-white mb-3 uppercase tracking-widest">Contact Direct</h3>
                  <div className="space-y-2 text-sm font-bold uppercase tracking-wider">
                    <p className="text-gray-500">Tél : <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="text-white hover:text-brand-primary transition ml-2">{siteConfig.contact.phone}</a></p>
                    <p className="text-gray-500">Email : <a href={`mailto:${siteConfig.contact.email}`} className="text-white hover:text-brand-primary transition ml-2">{siteConfig.contact.email}</a></p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* FORMULAIRE */}
          <Reveal y={30} delay={0.5}>
            <div className="bg-neutral-900 border border-neutral-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {!isSent ? (
                  <motion.form key="contact-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-8">Écrivez-nous</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Nom</label>
                        <input 
                          placeholder="Ex: Jean Dupont" 
                          className={`w-full bg-black text-white border ${errors.name ? 'border-brand-primary' : 'border-neutral-800'} rounded-2xl px-5 py-4 font-bold outline-none focus:border-brand-primary transition-all`} 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                        {errors.name && <p className="text-brand-primary text-[9px] font-black uppercase tracking-widest px-2">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email</label>
                        <input 
                          placeholder="jean@exemple.com" 
                          type="email" 
                          className={`w-full bg-black text-white border ${errors.email ? 'border-brand-primary' : 'border-neutral-800'} rounded-2xl px-5 py-4 font-bold outline-none focus:border-brand-primary transition-all`} 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                        {errors.email && <p className="text-brand-primary text-[9px] font-black uppercase tracking-widest px-2">{errors.email}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Message</label>
                      <textarea 
                        placeholder="Votre transmission..." 
                        rows={5} 
                        className={`w-full bg-black text-white border ${errors.message ? 'border-brand-primary' : 'border-neutral-800'} rounded-2xl px-5 py-4 font-bold outline-none focus:border-brand-primary resize-none transition-all`} 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                      />
                      {errors.message && <p className="text-brand-primary text-[9px] font-black uppercase tracking-widest px-2">{errors.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-brand-primary hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 disabled:opacity-50 cursor-pointer shadow-xl mt-4">
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18}/> Envoyer le message</>}
                    </button>
                  </motion.form>
                ) : (
                  <div className="py-32 text-center space-y-8 relative z-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <CheckCircle size={56} className="text-green-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-2">Message Envoyé</h3>
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Notre équipage vous répondra rapidement.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>

      {/* --- CARTE GOOGLE MAPS --- */}
      <div className="w-full h-[500px] bg-neutral-900 border-t border-white/5 relative group overflow-hidden">
        {/* Overlay pour ne pas bloquer le scroll sur mobile */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 pointer-events-none z-10" />
        <iframe 
          src={mapEmbedUrl}
          title={`Plan d'accès ${siteConfig.name}`}
          width="100%" 
          height="100%" 
          style={{border:0}} 
          allowFullScreen={true} 
          loading="lazy" 
          className="filter grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 scale-105"
        ></iframe>
      </div>
    </div>
  );
}