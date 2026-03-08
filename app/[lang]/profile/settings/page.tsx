"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, CheckCircle, AlertTriangle, Save, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

// 🛡️ Typage strict pour éviter les erreurs ESLint 'any'
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

interface UpsertResult {
  data: unknown | null;
  error: SupabaseError | null;
}

export default function SettingsPage() {
  const { user, profile, loading, refreshProfile } = useUser();
  const { lang } = useParams();
  
  const [supabase] = useState(() => createClient());

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
    console.log("[DIAG] 1. Clic sur Sauvegarder intercepté.");
    
    if (!user?.id) {
      console.log("[DIAG] ❌ ARRÊT : Session utilisateur manquante.");
      setErrorMsg("Session introuvable.");
      return;
    }

    if (loading) {
      console.log("[DIAG] ❌ ARRÊT : Synchronisation en cours.");
      return;
    }
    
    setIsUpdating(true);
    setErrorMsg(null);
    console.log(`[DIAG] 2. User ID : ${user.id}. Envoi imminent...`);

    // 🕒 Timeout de sécurité étendu à 8s pour diagnostiquer les blocages RLS/Locks
    const timeout = new Promise<UpsertResult>((_, reject) => 
      setTimeout(() => reject(new Error("Délai dépassé : Les règles de sécurité (RLS) ou un verrou bloquent peut-être la requête.")), 8000)
    );

    try {
      console.log("[DIAG] 3. Envoi de la requête upsert (optimisée sans select)...");

      const upsertTask = supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: fullName,
            phone: phone,
            address: address,
            zip_code: zipCode,
            city: city,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      // On attend soit le succès de l'écriture, soit le timeout
      const result = await Promise.race([upsertTask, timeout]) as UpsertResult;

      if (result.error) {
        console.error("[DIAG] ❌ Erreur Supabase :", result.error);
        throw new Error(result.error.message);
      }

      console.log("[DIAG] ✅ Succès DB.");
      console.log("[DIAG] 5. Appel de refreshProfile()...");

      await refreshProfile();
      
      console.log("[DIAG] 6. refreshProfile() terminé.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("[DIAG] ❌ Échec de la procédure :", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur de base de données";
      setErrorMsg(errorMessage);
    } finally {
      console.log("[DIAG] 7. Nettoyage de l'état (Finally).");
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="mb-8 inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Retour au profil</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <h1 className="text-2xl font-display font-bold uppercase tracking-widest">Mon Profil</h1>
          
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Nom complet</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Téléphone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Adresse</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-all text-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Code Postal" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-all text-sm" />
               <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-kabuki-red outline-none transition-all text-sm" />
            </div>

            {errorMsg && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase animate-pulse">
                <AlertTriangle size={16} /> {errorMsg}
              </div>
            )}

            <button 
              type="submit"
              disabled={isUpdating || loading || !user} 
              className="w-full bg-kabuki-red text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isUpdating ? (
                <><Loader2 size={18} className="animate-spin" /> Traitement...</>
              ) : loading ? (
                <><Loader2 size={18} className="animate-spin" /> Synchronisation...</>
              ) : (
                <><Save size={18} /> Sauvegarder</>
              )}
            </button>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Profil mis à jour</span>
        </div>
      )}
    </div>
  );
}