"use client";

import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Désormais utilisé !
import { 
  User, History, Settings, ChevronRight, 
  AlertCircle, Shield, LogOut,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import OrderHistory from "@/components/OrderHistory";
import { siteConfig } from "@/config/site";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const lang = typeof params.lang === 'string' ? params.lang : 'fr';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${lang}/login?logout=true`);
  };

  return (
    <div className="min-h-screen bg-black py-12 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ Ajout de AnimatePresence pour gérer les transitions entre les états */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
              <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-brand-primary text-xs font-bold uppercase tracking-widest animate-pulse">
                Synchronisation...
              </p>
            </motion.div>
          ) : !user ? (
            <motion.div 
              key="no-user"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 shadow-2xl"
            >
              <AlertCircle size={48} className="text-brand-primary mb-2" />
              <h1 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Accès réservé</h1>
              <p className="text-gray-400 max-w-md mx-auto">
                Votre session a expiré. Veuillez vous identifier.
              </p>
              <TransitionLink 
                href={`/${lang}/login`}
                className="bg-brand-primary text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
              >
                Se connecter
              </TransitionLink>
            </motion.div>
          ) : (
            <motion.div 
              key="profile-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* --- EN-TÊTE PROFIL --- */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center border-2 border-brand-primary shadow-lg z-10">
                  <User size={48} className="text-brand-primary" />
                </div>

                <div className="text-center md:text-left flex-1 z-10">
                  <h1 className="text-3xl font-display font-black uppercase text-white tracking-wider mb-2">
                    {profile?.full_name || "Client"}
                  </h1>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest opacity-70">{user.email}</p>
                  <button 
                    onClick={handleLogout} 
                    className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-brand-primary transition-colors tracking-widest cursor-pointer"
                  >
                    <LogOut size={14} /> Déconnexion
                  </button>
                </div>

                <div className="bg-black/40 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 text-center min-w-[220px] z-10">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">Cagnotte Fidélité</p>
                  <p className="text-3xl font-display font-bold text-brand-primary">
                    {profile?.wallet_balance ? Number(profile.wallet_balance).toFixed(2) : "0.00"} <span className="text-sm">{siteConfig.currency}</span>
                  </p>
                </div>
              </div>

              {/* --- CONTENU --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-neutral-900/50 border border-neutral-800 p-8 rounded-[2.5rem] shadow-xl">
                  <div className="flex items-center gap-4 mb-8 text-white">
                    <History size={24} className="text-brand-primary" />
                    <h2 className="text-xl font-display font-black uppercase tracking-widest">Historique</h2>
                  </div>
                  <OrderHistory />
                </div>

                <div className="space-y-6">
                  {profile?.is_admin && (
                    <TransitionLink href={`/${lang}/admin`} className="block group">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-brand-primary/10 border border-brand-primary/30 p-6 rounded-3xl flex items-center gap-4 cursor-pointer hover:border-brand-primary transition-all shadow-xl"
                      >
                        <Shield size={24} className="text-brand-primary" />
                        <div className="flex-1">
                          <h3 className="text-white font-black text-sm uppercase tracking-wider">Admin</h3>
                          <p className="text-[10px] text-brand-primary font-black uppercase">Gestion plateforme</p>
                        </div>
                        <ChevronRight size={18} className="text-brand-primary" />
                      </motion.div>
                    </TransitionLink>
                  )}

                  <TransitionLink href={`/${lang}/profile/settings`} className="block group">
                    <motion.div 
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl flex items-center gap-4 cursor-pointer hover:border-brand-primary transition-all shadow-xl"
                    >
                      <Settings size={24} className="text-white" />
                      <div className="flex-1">
                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Paramètres</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Gérer le compte</p>
                      </div>
                      <ChevronRight size={18} className="text-neutral-600" />
                    </motion.div>
                  </TransitionLink>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}