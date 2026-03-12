"use client";

import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { 
  User, History, Settings, ChevronRight, 
  AlertCircle, Shield, LogOut, Package 
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
    <div className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-12 h-12 border-4 border-kabuki-red border-t-transparent rounded-full animate-spin" />
            <p className="text-kabuki-red text-xs font-bold uppercase tracking-widest animate-pulse">
              Chargement du profil...
            </p>
          </div>
        ) : !user ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 shadow-2xl"
          >
            <AlertCircle size={48} className="text-kabuki-red mb-2" />
            <h1 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Accès réservé</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Votre session a expiré ou vous n&apos;êtes pas connecté. Veuillez vous identifier pour accéder à votre espace.
            </p>
            <TransitionLink 
              href={`/${lang}/login`}
              className="bg-kabuki-red text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              Se connecter
            </TransitionLink>
          </motion.div>
        ) : (
          <>
            {/* HEADER PROFIL */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <User size={120} />
              </div>

              <div className="w-24 h-24 bg-kabuki-red/10 rounded-full flex items-center justify-center border-2 border-brand-primary shadow-lg z-10">
                <User size={48} className="text-brand-primary" />
              </div>

              <div className="text-center md:text-left flex-1 z-10">
                <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider mb-2">
                  {profile?.full_name || (profile?.is_admin ? "Administrateur" : "Client")}
                </h1>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest opacity-70">{user.email}</p>
                <button 
                  onClick={handleLogout}
                  className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-kabuki-red transition-colors tracking-widest"
                >
                  <LogOut size={14} /> Se déconnecter
                </button>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 text-center min-w-[220px] z-10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">Cagnotte Fidélité</p>
                <p className="text-3xl font-display font-bold text-brand-primary">
                  {profile?.wallet_balance ? Number(profile.wallet_balance).toFixed(2) : "0.00"} <span className="text-sm font-sans">{siteConfig.currency}</span>
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* HISTORIQUE */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 bg-neutral-900/50 border border-neutral-800 p-8 rounded-[2.5rem] shadow-xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-kabuki-red/10 rounded-2xl text-kabuki-red">
                    <History size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">Historique</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Vos dernières commandes</p>
                  </div>
                </div>

                <OrderHistory />
              </motion.div>

              {/* ACTIONS LATÉRALES */}
              <div className="space-y-6">
                
                {profile?.is_admin && (
                  <TransitionLink href={`/${lang}/admin`} className="block">
                    <motion.div 
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(220, 38, 38, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-brand-primary/10 border border-brand-primary/30 p-6 rounded-3xl flex items-center gap-4 cursor-pointer hover:border-brand-primary transition-all duration-300 shadow-xl"
                    >
                      <div className="p-3 bg-brand-primary text-white rounded-xl">
                        <Shield size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Admin</h3>
                        <p className="text-[10px] text-brand-primary font-black uppercase">Gestion restaurant</p>
                      </div>
                      <ChevronRight size={18} className="text-brand-primary" />
                    </motion.div>
                  </TransitionLink>
                )}

                <TransitionLink href={`/${lang}/profile/settings`} className="block">
                  <motion.div 
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(38, 38, 38, 0.8)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl flex items-center gap-4 cursor-pointer hover:border-brand-primary transition-all duration-300 shadow-xl"
                  >
                    <div className="p-3 bg-neutral-800 text-white rounded-xl">
                      <Settings size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-sm uppercase tracking-wider">Paramètres</h3>
                      <p className="text-[10px] text-gray-500 uppercase">Gérer mon compte</p>
                    </div>
                    <ChevronRight size={18} className="text-neutral-600" />
                  </motion.div>
                </TransitionLink>

                <div className="bg-neutral-900/30 border border-neutral-800/50 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-3 text-kabuki-red">
                    <Package size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
                  </div>
                  <p className="text-[11px] text-gray-500 uppercase leading-relaxed font-medium">
                    Besoin d&apos;aide ? Contactez notre support pour toute question concernant vos commandes ou votre cagnotte.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}