"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function SettingsPage() {
  const { user, profile, refreshProfile, loading } = useUser();
  const { lang } = useParams();

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
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': key!,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
          address: address,
          zip_code: zipCode,
          city: city,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("Échec de la mise à jour");

      // On rafraîchit les données du contexte sans recharger la page entière
      await refreshProfile();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-kabuki-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="mb-8 inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Retour au profil</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-8 shadow-2xl">
          <h1 className="text-2xl font-display font-bold uppercase tracking-widest">Paramètres</h1>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Nom complet</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Téléphone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Adresse de livraison</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Code Postal" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-colors" />
               <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-colors" />
            </div>

            {errorMsg && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-2 text-xs uppercase">
                <AlertTriangle size={16} /> {errorMsg}
              </div>
            )}

            <button 
              type="button" 
              onClick={handleUpdate}
              disabled={isUpdating} 
              className="w-full bg-kabuki-red text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl animate-bounce">
          <CheckCircle size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Profil mis à jour !</span>
        </div>
      )}
    </div>
  );
}