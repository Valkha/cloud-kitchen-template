"use client";

import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import TransitionLink from "@/components/TransitionLink";

export default function ProfileDiagnosticPage({ params }: { params: { lang: string } }) {
  const { user, profile, loading } = useUser();
  const [rawSession, setRawSession] = useState<string>("Vérification des cookies en cours...");
  const [dbTest, setDbTest] = useState<string>("En attente...");
  const supabase = createClient();

  useEffect(() => {
    // 1. Test direct des cookies Supabase dans le navigateur
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setRawSession(`❌ Erreur: ${error.message}`);
      } else if (data.session) {
        setRawSession(`✅ Session présente (Expire le: ${new Date(data.session.expires_at! * 1000).toLocaleString()})`);
        
        // 2. Test direct de la base de données
        supabase.from('profiles').select('id').eq('id', data.session.user.id).single()
          .then(({ error: dbErr }) => {
            if (dbErr) setDbTest(`❌ Erreur DB: ${dbErr.message} (Code: ${dbErr.code})`);
            else setDbTest("✅ Accès DB fonctionnel");
          });
      } else {
        setRawSession("🔴 Aucune session trouvée dans les cookies du navigateur.");
        setDbTest("🔴 Non testable sans session.");
      }
    });
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black pt-32 px-6 text-white font-mono text-sm">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl text-kabuki-red font-bold border-b border-red-900 pb-2">
          🚨 DIAGNOSTIC VERCEL ACTIF 🚨
        </h1>
        
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-700 space-y-6 shadow-2xl">
          {/* ÉTAT 1 : Le Contexte React */}
          <div className="p-4 bg-black/50 rounded border border-neutral-800">
            <h2 className="text-yellow-400 font-bold mb-2">1. État du UserContext (La boucle infinie ?)</h2>
            <p>• Loading : {loading ? <span className="text-yellow-500 font-bold animate-pulse">⏳ TRUE (Bloqué en chargement)</span> : <span className="text-green-500 font-bold">✅ FALSE (Terminé)</span>}</p>
            <p>• User : {user ? <span className="text-green-500">🟢 {user.email}</span> : <span className="text-red-500">🔴 NULL</span>}</p>
            <p>• Profil : {profile ? <span className="text-green-500">🟢 Chargé</span> : <span className="text-red-500">🔴 NULL</span>}</p>
          </div>

          {/* ÉTAT 2 : Les Cookies et la DB */}
          <div className="p-4 bg-black/50 rounded border border-neutral-800">
            <h2 className="text-blue-400 font-bold mb-2">2. État Réel Supabase (Cookies Vercel)</h2>
            <p className="mb-1">• Statut Session : {rawSession}</p>
            <p>• Statut Database : {dbTest}</p>
          </div>

          {/* ACTIONS MANUELLES */}
          <div className="pt-4 flex flex-wrap gap-4 border-t border-neutral-800">
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.reload())} 
              className="bg-red-900/50 hover:bg-red-600 border border-red-500 px-4 py-2 rounded text-xs transition-colors"
            >
              1. Forcer le nettoyage (SignOut)
            </button>
            <TransitionLink 
              href={`/${params.lang || 'fr'}/login`}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-4 py-2 rounded text-xs transition-colors inline-block"
            >
              2. Aller au Login
            </TransitionLink>
          </div>
        </div>
      </div>
    </div>
  );
}