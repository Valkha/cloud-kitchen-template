"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function SettingsPage() {
  const { user, profile, refreshProfile, loading } = useUser();
  const { lang } = useParams();
  const supabase = createClient();

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

  const handleUpdate = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    setErrorMsg(null);

    try {
      // ✅ UPSERT via SDK (plus propre maintenant que le contexte est stable)
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          address: address,
          zip_code: zipCode,
          city: city,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // ✅ REFRESH SILENCIEUX (ne déclenchera pas le spinner de loading)
      await refreshProfile();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur de sauvegarde");
    } finally {
      setIsUpdating(false);
    }
  };

  // ⚠️ TRÈS IMPORTANT : On ne bloque l'affichage que si le user est null au premier chargement
  // Si on est déjà sur la page et qu'on rafraîchit, loading ne doit pas nous éjecter
  if (loading && !profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-kabuki-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="mb-8 inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Retour</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <h1 className="text-2xl font-display font-bold uppercase tracking-widest">Paramètres</h1>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tel" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none" />
            </div>

            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none" />
            
            <div className="grid grid-cols-2 gap-6">
               <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="CP" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none" />
               <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none" />
            </div>

            {errorMsg && <div className="text-red-500 text-xs flex items-center gap-2"><AlertTriangle size={16} /> {errorMsg}</div>}

            <button 
              onClick={handleUpdate}
              disabled={isUpdating} 
              className="w-full bg-kabuki-red text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
            >
              {isUpdating ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl z-50">
          <CheckCircle size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Profil mis à jour !</span>
        </div>
      )}
    </div>
  );
}