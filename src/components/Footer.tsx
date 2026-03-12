"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { Instagram, Facebook, MapPin, Phone, Globe } from "lucide-react"; 
import { siteConfig } from "../../config/site";

export default function Footer() {
  const { t, lang } = useTranslation();

  const days = {
    fr: { mon: "Lundi", tueFri: "Mardi - Vendredi", satSun: "Samedi - Dimanche", closed: "Fermé", midi: "Midi", soir: "Soir" },
    en: { mon: "Monday", tueFri: "Tuesday - Friday", satSun: "Saturday - Sunday", closed: "Closed", midi: "Lunch", soir: "Dinner" },
    es: { mon: "Lunes", tueFri: "Martes - Viernes", satSun: "Sábado - Domingo", closed: "Cerrado", midi: "Mediodía", soir: "Noche" }
  }[lang as "fr" | "en" | "es"];

  // ✅ Variable socialLinks utilisée dans le JSX plus bas
  const socialLinks = [
    { icon: <Instagram size={18} />, href: siteConfig.links.instagram, label: "Instagram" },
    { icon: <Facebook size={18} />, href: siteConfig.links.facebook, label: "Facebook" },
    { icon: <Globe size={18} />, href: siteConfig.url, label: "Website" }, 
  ].filter(link => link.href !== "");

  return (
    <footer className="bg-brand-black text-white border-t border-neutral-800 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <Link href={`/${lang}`} className="inline-block w-32">
              <Image src="/images/logo.png" alt={`${siteConfig.name} Logo`} width={150} height={150} className="w-full h-auto" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">{t.footer.desc}</p>
            
            {/* ✅ BOUCLE SUR LES RÉSEAUX SOCIAUX */}
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 hover:bg-brand-primary hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold uppercase mb-6 border-l-4 border-brand-primary pl-3">{t.footer.linksTitle}</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href={`/${lang}`} className="hover:text-red-400 transition">{t.nav.home}</Link></li>
              
              {/* ✅ CORRECTION : Lien Cloud Kitchen pointant vers l'ancre des enseignes */}
              <li>
                <Link href={`/${lang}#restaurants`} className="hover:text-red-400 transition">
                  {lang === 'en' ? 'Brands' : lang === 'es' ? 'Nuestras Marcas' : 'Enseignes'}
                </Link>
              </li>
              
              <li><Link href={`/${lang}/contact`} className="hover:text-red-400 transition">{t.nav.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold uppercase mb-6 border-l-4 border-brand-primary pl-3">{t.footer.contactTitle}</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start">
                <MapPin size={18} className="text-red-400 mr-3 shrink-0" />
                <span className="leading-snug">
                  {siteConfig.contact.address.street},<br/>
                  {siteConfig.contact.address.zipCode} {siteConfig.contact.address.city}
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-red-400 mr-3 shrink-0" />
                <span className="font-bold">{siteConfig.contact.phone}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-bold uppercase mb-6 border-l-4 border-brand-primary pl-3">{t.contact.opening}</h3>
            <ul className="space-y-4 text-gray-400 text-[10px] uppercase tracking-widest">
              <li className="flex flex-col gap-1">
                <span className="text-white font-bold">{days.tueFri}</span>
                <div className="flex justify-between"><span>{days.midi}</span><span className="text-white">11:20 - 14:00</span></div>
                <div className="flex justify-between"><span>{days.soir}</span><span className="text-white">18:00 - 22:30</span></div>
              </li>
              <li className="flex justify-between border-t border-neutral-800 pt-3 text-red-400 font-bold">
                <span>{days.mon}</span><span>{days.closed}</span>
              </li>
            </ul>
          </div>

        </div>
        <div className="border-t border-neutral-800 pt-8 flex justify-between items-center text-[10px] text-gray-400 uppercase">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}