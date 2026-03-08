"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function SettingsPage() {
  const { profile } = useUser(); // On ne garde que profile ici pour l'affichage initial
  const { lang } = useParams();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
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
    alert("1. Entrée dans handleUpdate");
    setIsUpdating(true);
    setErrorMsg(null);

    try {
      // 🕵️ RÉCUPÉRATION DIRECTE DE L'USER (Bypass context)
      alert("2. Vérification de session en cours...");
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        alert("❌ ERREUR AUTH : " + (authError?.message || "Pas de session"));
        setIsUpdating(false);
        return;
      }

      alert("3. ID trouvé en direct : " + authUser.id);

      // 🚀 UPSERT
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          full_name: fullName,
          phone: phone,
          address: address,
          zip_code: zipCode,
          city: city,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        alert("❌ ERREUR SUPABASE : " + error.message);
        throw error;
      }

      alert("✅ FÉLICITATIONS : Sauvegarde réussie !");
      
      // On redirige manuellement pour forcer le rafraîchissement propre
      window.location.href = `/${lang}/profile`;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      alert("💥 CRASH CATCH : " + msg);
      setErrorMsg(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="inline-flex items-center gap-2 text-gray-500 mb-8">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Retour</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <h1 className="text-2xl font-display font-bold uppercase tracking-widest mb-4">Mise à jour du profil</h1>
          
          <div className="space-y-6">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom complet" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white outline-none focus:border-kabuki-red" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white outline-none focus:border-kabuki-red" />
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white outline-none focus:border-kabuki-red" />
            
            <div className="grid grid-cols-2 gap-4">
               <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="CP" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white outline-none" />
               <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-white outline-none" />
            </div>

            {errorMsg && (
              <div className="text-red-500 text-xs flex items-center gap-2">
                <AlertTriangle size={14}/> {errorMsg}
              </div>
            )}

            <button 
              type="button" 
              onClick={handleUpdate}
              disabled={isUpdating} 
              className="w-full bg-kabuki-red text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 mt-4"
            >
              {isUpdating ? "En cours..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}