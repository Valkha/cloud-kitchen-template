"use client";

import { useUser } from "@/context/UserContext";
import { m } from "framer-motion";
import { User, History, Settings, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const params = useParams();
  const lang = params.lang as string;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-kabuki-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-white uppercase mb-4">Accès réservé</h1>
          <p className="text-gray-400 mb-8">Connectez-vous pour voir votre profil et vos points fidélité.</p>
          <TransitionLink 
            href={`/${lang}`}
            className="bg-kabuki-red text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Retour à l&apos;accueil
          </TransitionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER PROFIL */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl"
        >
          <div className="w-24 h-24 bg-kabuki-red/10 rounded-full flex items-center justify-center border-2 border-kabuki-red shadow-lg shadow-red-900/20">
            <User size={48} className="text-kabuki-red" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider mb-2">
              {/* ✅ Affiche le nom réel ou le fallback si pas encore synchronisé */}
              {profile?.full_name || "Client Kabuki"}
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest opacity-70">{user.email}</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 text-center min-w-[200px]">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">Cagnotte Fidélité</p>
            <p className="text-3xl font-display font-bold text-kabuki-red">
              {profile?.wallet_balance ? Number(profile.wallet_balance).toFixed(2) : "0.00"} <span className="text-sm">CHF</span>
            </p>
          </div>
        </m.div>

        {/* GRILLE D'ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Historique (Désactivé pour l'instant) */}
          <m.div 
            whileHover={{ scale: 1.01 }}
            className="bg-neutral-900/30 border border-neutral-800/50 p-6 rounded-2xl flex items-center gap-4 cursor-not-allowed opacity-40 grayscale"
          >
            <div className="p-3 bg-neutral-800 rounded-xl text-gray-500">
              <History size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Historique des commandes</h3>
              <p className="text-[10px] text-gray-500 uppercase">Bientôt disponible</p>
            </div>
            <ChevronRight size={18} className="text-neutral-800" />
          </m.div>

          {/* Paramètres (Activé) */}
          <TransitionLink 
            href={`/${lang}/profile/settings`}
            className="block"
          >
            <m.div 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(38, 38, 38, 0.8)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-kabuki-red transition-all duration-300 shadow-xl"
            >
              <div className="p-3 bg-kabuki-red/10 rounded-xl text-kabuki-red group-hover:bg-kabuki-red transition-colors">
                <Settings size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Paramètres du compte</h3>
                <p className="text-[10px] text-gray-500 uppercase">Gérer vos informations</p>
              </div>
              <ChevronRight size={18} className="text-kabuki-red" />
            </m.div>
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}