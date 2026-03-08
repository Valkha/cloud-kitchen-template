"use client";

import { useUser } from "@/context/UserContext";
import { m } from "framer-motion";
// ✅ Wallet supprimé des imports car inutilisé
import { User, History, Settings, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  // ✅ useTranslation et 't' supprimés car inutilisés dans ce snippet

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
          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-24 h-24 bg-kabuki-red/10 rounded-full flex items-center justify-center border-2 border-kabuki-red shadow-lg shadow-red-900/20">
            <User size={48} className="text-kabuki-red" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider mb-2">
              {profile?.full_name || "Client Kabuki"}
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{user.email}</p>
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
          <m.div 
            whileHover={{ scale: 1.02 }}
            className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 cursor-not-allowed opacity-60"
          >
            <div className="p-3 bg-neutral-800 rounded-xl text-gray-400">
              <History size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Historique des commandes</h3>
              <p className="text-[10px] text-gray-500 uppercase">Bientôt disponible</p>
            </div>
            <ChevronRight size={18} className="text-neutral-700" />
          </m.div>

          <m.div 
            whileHover={{ scale: 1.02 }}
            className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-kabuki-red/50 transition-colors"
          >
            <div className="p-3 bg-neutral-800 rounded-xl text-kabuki-red">
              <Settings size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Paramètres du compte</h3>
              <p className="text-[10px] text-gray-500 uppercase">Gérer vos informations</p>
            </div>
            <ChevronRight size={18} className="text-neutral-700" />
          </m.div>
        </div>
      </div>
    </div>
  );
}