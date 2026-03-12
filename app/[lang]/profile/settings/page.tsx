"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { ArrowLeft, CheckCircle, AlertTriangle, Save, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import { m, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const { user, profile } = useUser();
  const params = useParams();
  const router = useRouter();
  
  const lang = typeof params?.lang === 'string' ? params.lang : 'fr';

  const isProcessing = useRef(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setZipCode(profile.zip_code || ""); 
      setCity(profile.city || "");
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (isProcessing.current || isUpdating) return;
    if (!user) {
      setErrorMsg("Session introuvable. Veuillez vous reconnecter.");
      return;
    }
    
    isProcessing.current = true;
    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, address, zipCode, city, lang }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de la sauvegarde.");
      }

      setShowSuccess(true);
      
      // Rafraîchissement des données du layout/contexte
      router.refresh();

      // Petit délai pour laisser l'utilisateur voir le badge de succès
      setTimeout(() => {
        window.location.href = `/${lang}/profile`;
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      console.error("[SETTINGS_ERROR]:", errorMessage);
      setErrorMsg(errorMessage);
      isProcessing.current = false;
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="mb-8 inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-xs font-bold uppercase tracking-widest">Retour au profil</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold uppercase tracking-widest italic text-white">Paramètres</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Gérez vos informations personnelles</p>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-500 uppercase ml-1 tracking-widest">Nom complet</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="w-full bg-black border border-neutral-800 p-4 rounded-2xl focus:border-kabuki-red outline-none transition-all text-sm text-white" 
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-500 uppercase ml-1 tracking-widest">Téléphone</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-black border border-neutral-800 p-4 rounded-2xl focus:border-kabuki-red outline-none transition-all text-sm text-white" 
                  placeholder="+41 79 000 00 00"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-500 uppercase ml-1 tracking-widest">Adresse de livraison</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full bg-black border border-neutral-800 p-4 rounded-2xl focus:border-kabuki-red outline-none transition-all text-sm text-white" 
                placeholder="Rue de la Tour 1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-500 uppercase ml-1 tracking-widest">Code Postal</label>
                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="1200" className="w-full bg-black border border-neutral-800 p-4 rounded-2xl focus:border-kabuki-red outline-none transition-all text-sm text-white" />
               </div>
               <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-500 uppercase ml-1 tracking-widest">Ville</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Genève" className="w-full bg-black border border-neutral-800 p-4 rounded-2xl focus:border-kabuki-red outline-none transition-all text-sm text-white" />
               </div>
            </div>

            {errorMsg && (
              <div className="bg-red-900/10 border border-red-500/30 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase animate-pulse">
                <AlertTriangle size={18} className="shrink-0" /> 
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isUpdating} 
              className="w-full bg-kabuki-red text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-900/20"
            >
              {isUpdating ? <><Loader2 size={20} className="animate-spin" /> Mise à jour...</> : <><Save size={20} /> Enregistrer</>}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <m.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl z-50 border border-white/20"
          >
            <CheckCircle size={20} /> 
            <span className="text-[10px] font-bold uppercase tracking-widest">Profil mis à jour</span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}