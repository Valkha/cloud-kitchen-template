"use client";

import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { Instagram, Facebook, MapPin, Phone, Globe, Rocket } from "lucide-react"; 
import { siteConfig } from "../../config/site";

export default function Footer() {
  const { t, lang } = useTranslation();

  const days = {
    fr: { mon: "Lundi", tueFri: "Mardi - Vendredi", satSun: "Samedi - Dimanche", closed: "Fermé", midi: "Midi", soir: "Soir" },
    en: { mon: "Monday", tueFri: "Tuesday - Friday", satSun: "Saturday - Sunday", closed: "Closed", midi: "Lunch", soir: "Dinner" },
    es: { mon: "Lunes", tueFri: "Martes - Viernes", satSun: "Sábado - Domingo", closed: "Cerrado", midi: "Mediodía", soir: "Noche" }
  }[lang as "fr" | "en" | "es"];

  const socialLinks = [
    { icon: <Instagram size={18} />, href: siteConfig.links.instagram, label: "Instagram" },
    { icon: <Facebook size={18} />, href: siteConfig.links.facebook, label: "Facebook" },
    { icon: <Globe size={18} />, href: siteConfig.url, label: "Website" }, 
  ].filter(link => link.href !== "");

  return (
    <footer className="bg-black text-white border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
      {/* Halo de lumière violet subtil en fond de footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-brand-primary/40 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-24">
          
          {/* --- COLONNE 1 : MARQUE ET RÉSEAUX --- */}
          <div className="space-y-8">
            <Link href={`/${lang}`} className="flex items-center gap-3 group inline-flex">
              <Rocket size={32} className="text-brand-primary transition-transform group-hover:rotate-12 group-hover:scale-110 duration-500" />
              <span className="text-2xl font-display font-black uppercase tracking-[0.2em]">
                Planet <span className="text-brand-primary">Food</span>
              </span>
            </Link>
            
            <p className="text-neutral-500 text-xs leading-relaxed max-w-xs font-bold uppercase tracking-wider">
              {t.footer.desc}
            </p>
            
            <div className="flex space-x-4 pt-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-[1rem] bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-300 shadow-xl hover:shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)] hover:-translate-y-1"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* --- COLONNE 2 : LIENS RAPIDES --- */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 border-l-2 border-brand-primary pl-4 text-white flex items-center h-4">
              {t.footer.linksTitle}
            </h3>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
              <li>
                <Link href={`/${lang}`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-px bg-brand-primary group-hover:w-3 transition-all duration-300" />
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#restaurants`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-px bg-brand-primary group-hover:w-3 transition-all duration-300" />
                  {lang === 'en' ? 'Brands' : lang === 'es' ? 'Nuestras Marcas' : 'Enseignes'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-px bg-brand-primary group-hover:w-3 transition-all duration-300" />
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* --- COLONNE 3 : CONTACT --- */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 border-l-2 border-brand-primary pl-4 text-white flex items-center h-4">
              {t.footer.contactTitle}
            </h3>
            <ul className="space-y-6 text-neutral-400">
              <li className="flex items-start group">
                <MapPin size={18} className="text-brand-primary mr-4 shrink-0 transition-transform group-hover:scale-110 duration-300" />
                <span className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                  <span className="text-white block mb-1">{siteConfig.name}</span>
                  {siteConfig.contact.address.street},<br/>
                  {siteConfig.contact.address.zipCode} {siteConfig.contact.address.city}
                </span>
              </li>
              <li className="flex items-center group">
                <Phone size={18} className="text-brand-primary mr-4 shrink-0 transition-transform group-hover:scale-110 duration-300" />
                <span className="text-sm font-black text-white tracking-widest">{siteConfig.contact.phone}</span>
              </li>
            </ul>
          </div>

          {/* --- COLONNE 4 : HORAIRES --- */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 border-l-2 border-brand-primary pl-4 text-white flex items-center h-4">
              {t.contact.opening}
            </h3>
            <ul className="space-y-4 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold bg-neutral-900/50 p-6 rounded-[1.5rem] border border-white/5 shadow-inner">
              <li className="flex flex-col gap-3">
                <span className="text-white font-black">{days.tueFri}</span>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>{days.midi}</span><span className="text-brand-primary font-black">11:20 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{days.soir}</span><span className="text-brand-primary font-black">18:00 - 22:30</span>
                </div>
              </li>
              <li className="flex justify-between border-t border-white/5 pt-4">
                <span className="text-white">{days.mon}</span>
                <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-black">{days.closed}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-neutral-600 font-black uppercase tracking-[0.3em]">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Launching flavor into orbit.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-brand-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}