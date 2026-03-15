"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, ChefHat, Package, CheckCircle2, 
  Loader2, ArrowRight, ArrowLeft, XCircle, Truck, Store,
  Bike, MapPin, AlertCircle 
} from "lucide-react"; 
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import dynamic from "next/dynamic";
import { siteConfig } from "@/config/site";

const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-neutral-900 animate-pulse rounded-[2rem] flex items-center justify-center text-gray-500 text-[10px] font-black uppercase tracking-widest border border-neutral-800">
      Initialisation GPS...
    </div>
  )
});

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface OrderData {
  id: string;
  special_instructions?: string; // ✅ CORRECTION : Remplacement de pickup_time
  status: string;
  type: string;
  driver_lat: number | null;
  driver_lng: number | null;
  order_items: OrderItem[];
}

interface OrderTrackerProps {
  orderId: string;
}

export default function OrderTracker({ orderId }: OrderTrackerProps) {
  const supabase = useMemo(() => createClient(), []);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); 
  const { lang } = useTranslation();

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setFetchError("ID de commande manquant.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        // ✅ CORRECTION : On demande special_instructions au lieu de pickup_time
        .select(`
          id, special_instructions, status, type, driver_lat, driver_lng,
          order_items (
            id,
            product_name,
            quantity
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Erreur Supabase:", error);
        throw new Error(error.message || "Accès refusé par la base de données (RLS).");
      }
      
      if (data) {
        setOrder(data as unknown as OrderData);
      } else {
        setFetchError("Aucune donnée trouvée pour cette commande.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("Erreur chargement commande:", errorMessage);
      setFetchError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [orderId, supabase]);

  useEffect(() => {
    fetchOrder();

    const subscription = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          const newData = payload.new as OrderData;
          setOrder(prev => prev ? { ...prev, ...newData } : newData);
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(subscription); 
    };
  }, [orderId, supabase, fetchOrder]);

  const groupedItems = useMemo(() => {
    if (!order?.order_items) return {};
    return order.order_items.reduce((acc, item) => {
      const key = "Planet Food"; 
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);
  }, [order]);

  // ✅ NOUVEAU : Extraction intelligente de l'heure depuis les instructions spéciales
  const targetTime = useMemo(() => {
    if (!order?.special_instructions) return "Dès que possible";
    const match = order.special_instructions.match(/Date:\s*[\d-]+\s+(\d{2}:\d{2})/);
    return match ? match[1] : "Dès que possible";
  }, [order?.special_instructions]);

  const handleFinish = () => {
    localStorage.removeItem("planetfood_active_order");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Connexion au flux live...</p>
    </div>
  );

  if (fetchError || !order) return (
    <div className="text-center p-10 md:p-20 bg-neutral-900 rounded-[2.5rem] border border-neutral-800 shadow-2xl max-w-lg mx-auto">
      <AlertCircle size={48} className="text-red-500/80 mx-auto mb-6" />
      <p className="text-white font-black uppercase tracking-widest text-lg mb-2">Commande introuvable</p>
      {fetchError && (
        <div className="bg-red-900/20 text-red-400 text-[10px] font-mono p-4 rounded-xl border border-red-500/20 mb-6">
          Erreur: {fetchError}
        </div>
      )}
      <Link 
        href={`/${lang}/menu`} 
        onClick={handleFinish}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black px-6 py-4 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Retour au menu
      </Link>
    </div>
  );

  const isDelivery = order.type === "Livraison";

  const steps = isDelivery ? [
    { id: "paid", label: "Validée", icon: Receipt },
    { id: "preparing", label: "Cuisines", icon: ChefHat },
    { id: "ready", label: "Pris en charge", icon: Package },
    { id: "shipped", label: "En route", icon: Truck },
    { id: "delivered", label: "Livré", icon: CheckCircle2 }
  ] : [
    { id: "paid", label: "Validée", icon: Receipt },
    { id: "preparing", label: "En cuisine", icon: ChefHat },
    { id: "ready", label: "À retirer", icon: Package },
    { id: "delivered", label: "Récupéré", icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled"; 
  const showMap = isDelivery && (order.status === "shipped" || (order.driver_lat && order.driver_lng));

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10">
      
      {/* --- SECTION RADAR --- */}
      {!isCancelled && !isDelivered && (
        <div className="relative h-64 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden flex items-center justify-center shadow-2xl">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />
           
           {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.2, 0], scale: [0.8, 2.5] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
                className="absolute w-40 h-40 border border-brand-primary/30 rounded-full"
              />
            ))}
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 border-t border-brand-primary/40 rounded-full"
              style={{ maskImage: 'conic-gradient(from 0deg, black, transparent 90deg)', WebkitMaskImage: 'conic-gradient(from 0deg, black, transparent 90deg)' }}
            />

            <div className="relative z-10 flex flex-col items-center">
               <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white p-5 rounded-[2rem] shadow-2xl mb-4"
               >
                 <Bike size={32} className="text-black" />
               </motion.div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary animate-pulse">
                 Localisation active
               </span>
            </div>

            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-10 right-20"
            >
              <MapPin size={14} className="text-brand-primary/40" />
            </motion.div>
        </div>
      )}

      {/* --- CARTE DE SUIVI --- */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
        
        <div className="text-center mb-10">
          <span className="text-brand-primary font-black text-[10px] uppercase tracking-[0.4em]">
            {isDelivery ? "Expédition Planet Food" : "Retrait Restaurant"}
          </span>
          <h2 className="text-white font-display font-black uppercase text-3xl tracking-tighter mt-2">
            #ORD-{order.id.split('-')[0].toUpperCase()}
          </h2>
          {/* ✅ CORRECTION : Utilisation de la nouvelle variable targetTime */}
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">
            {isDelivered ? "Service terminé" : isCancelled ? "Annulée" : `Objectif : ${targetTime}`}
          </p>
        </div>

        {!isCancelled && !isDelivered && (
          <div className="mb-10 space-y-4">
            {Object.entries(groupedItems).map(([restoName, items]) => (
              <div key={restoName} className="bg-black/40 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 text-brand-primary mb-4 border-b border-white/5 pb-2">
                  <Store size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{restoName}</span>
                </div>
                <ul className="space-y-3">
                  {items.map(item => (
                    <li key={item.id} className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300">
                        <span className="text-brand-primary mr-2">{item.quantity}x</span> {item.product_name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showMap && !isDelivered && !isCancelled && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="mb-10 overflow-hidden rounded-[2rem] border border-white/5"
            >
              <DeliveryMap driverLat={order.driver_lat} driverLng={order.driver_lng} />
            </motion.div>
          )}
        </AnimatePresence>

        {isCancelled ? (
          <div className="text-center py-10 bg-red-900/10 rounded-3xl border border-red-500/20">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Commande Annulée</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest px-8 leading-relaxed">Le remboursement est en cours de traitement.</p>
          </div>
        ) : (
          <div className="relative mt-4">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-neutral-800" />
            <div className="space-y-10">
              {steps.map((step, index) => {
                const isCompleted = index <= activeIndex;
                const isActive = index === activeIndex;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative flex items-center gap-8 z-10">
                    <motion.div
                      animate={{
                        backgroundColor: isCompleted ? "var(--brand-primary)" : "#171717",
                        borderColor: isCompleted ? "var(--brand-primary)" : "#262626",
                        color: isCompleted ? "#FFFFFF" : "#525252",
                        scale: isActive ? 1.15 : 1
                      }}
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all ${isActive ? 'shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.3)]' : ''}`}
                    >
                      <Icon size={22} />
                    </motion.div>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-[0.2em] ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
                        {step.label}
                      </h4>
                      {isActive && (
                        <motion.p 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          className="text-[9px] text-brand-primary font-black uppercase tracking-widest mt-1"
                        >
                          {step.id === "paid" ? "Transmission aux cuisines..." :
                           step.id === "preparing" ? "Préparation en cours..." : 
                           step.id === "ready" ? "Prêt pour le départ !" : 
                           step.id === "shipped" ? "Le coursier est proche." : "Bon appétit !"}
                        </motion.p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isDelivered || isCancelled) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 px-2">
            <Link 
              href={`/${lang}/menu`} 
              onClick={handleFinish} 
              className="w-full bg-white text-black font-black py-6 rounded-[2rem] uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-brand-primary hover:text-white transition-all shadow-2xl"
            >
              Commander à nouveau <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="hidden">{siteConfig.currency}</div>
    </div>
  );
}