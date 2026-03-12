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
    <footer className="bg-brand-black text-white border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      {/* Halo de lumière violet subtil en fond de footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-brand-primary/20 blur-2xl" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          <div className="space-y-8">
            {/* --- LOGO PLANET FOOD --- */}
            <Link href={`/${lang}`} className="flex items-center gap-3 group">
              <Rocket size={32} className="text-brand-primary transition-transform group-hover:rotate-12 duration-300" />
              <span className="text-2xl font-display font-black uppercase tracking-[0.2em]">
                Planet <span className="text-brand-primary">Food</span>
              </span>
            </Link>
            
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs italic font-light">
              {t.footer.desc}
            </p>
            
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:border-brand-primary hover:text-brand-primary hover:glow-primary transition-all duration-500"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 border-l-2 border-brand-primary pl-4 text-white">
              {t.footer.linksTitle}
            </h3>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link href={`/${lang}`} className="text-neutral-500 hover:text-white transition-colors">{t.nav.home}</Link></li>
              <li>
                <Link href={`/${lang}#restaurants`} className="text-neutral-500 hover:text-white transition-colors">
                  {lang === 'en' ? 'Brands' : lang === 'es' ? 'Nuestras Marcas' : 'Enseignes'}
                </Link>
              </li>
              <li><Link href={`/${lang}/contact`} className="text-neutral-500 hover:text-white transition-colors">{t.nav.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 border-l-2 border-brand-primary pl-4 text-white">
              {t.footer.contactTitle}
            </h3>
            <ul className="space-y-5 text-neutral-400">
              <li className="flex items-start group">
                <MapPin size={18} className="text-brand-primary mr-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-sm leading-relaxed">
                  {siteConfig.contact.address.street},<br/>
                  {siteConfig.contact.address.zipCode} {siteConfig.contact.address.city}
                </span>
              </li>
              <li className="flex items-center group">
                <Phone size={18} className="text-brand-primary mr-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold text-white tracking-widest">{siteConfig.contact.phone}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 border-l-2 border-brand-primary pl-4 text-white">
              {t.contact.opening}
            </h3>
            <ul className="space-y-4 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
              <li className="flex flex-col gap-2">
                <span className="text-white font-black">{days.tueFri}</span>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>{days.midi}</span><span className="text-white">11:20 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{days.soir}</span><span className="text-white">18:00 - 22:30</span>
                </div>
              </li>
              <li className="flex justify-between border-t border-white/5 pt-4 text-brand-primary font-black">
                <span>{days.mon}</span><span>{days.closed}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-neutral-600 font-black uppercase tracking-[0.3em]">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Launching flavor into orbit.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}