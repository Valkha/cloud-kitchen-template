"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Truck, MapPin, Loader2, MessageSquare, Navigation, AlertTriangle, X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface Order {
  id: string; 
  customer_name: string;
  customer_phone: string;
  status: string;
  total_amount: number;
  special_instructions: string;
  type: string;
}

export default function DriverDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null); // ✅ Maintenant utilisé dans le JSX
  const watchIdRef = useRef<number | null>(null);

  const updateOrderSecurely = async (payload: { orderId: string; status?: string; lat?: number; lng?: number }) => {
    try {
      const res = await fetch('/api/driver/update-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch { // ✅ Suppression de 'err' inutilisé
      return false;
    }
  };

  const fetchDriverOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("type", "Livraison") 
        .in("status", ["ready", "preparing", "shipped"]) 
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      if (data) {
        setOrders(data as Order[]);
        const active = data.find(o => o.status === "shipped");
        if (active) setActiveDeliveryId(active.id);
      }
    } catch (error: unknown) { // ✅ Correction du 'any'
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("[DIAG] Erreur livraisons :", message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDriverOrders();
    const subscription = supabase
      .channel("driver-monitor")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
        fetchDriverOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [fetchDriverOrders, supabase]);

  const startDelivery = async (orderId: string) => {
    if (!navigator.geolocation) {
      setGeoError("GPS non supporté.");
      return;
    }
    setGeoError(null);
    const success = await updateOrderSecurely({ orderId, status: "shipped" });
    if (success) {
      setActiveDeliveryId(orderId);
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          await updateOrderSecurely({ orderId, lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => setGeoError("Accès GPS requis."),
        { enableHighAccuracy: true }
      );
    }
  };

  const endDelivery = async (orderId: string) => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    const success = await updateOrderSecurely({ orderId, status: "delivered" });
    if (success) {
      setActiveDeliveryId(null);
      fetchDriverOrders();
    }
  };

  const getCleanAddress = (instructions: string) => {
    if (!instructions) return "Adresse non spécifiée";
    const parts = instructions.split('|');
    const addressPart = parts.find(p => p.includes('Addresse:'));
    return addressPart ? addressPart.replace('Addresse:', '').trim() : instructions;
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold uppercase flex items-center gap-3 tracking-widest">
          <Truck className="text-brand-primary" size={28} /> Espace Livreur
        </h1>
        <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-widest">{orders.length} livraison(s) en attente</p>
      </div>

      {/* ✅ Utilisation de geoError, AlertTriangle et X pour satisfaire ESLint */}
      <AnimatePresence>
        {geoError && (
          <m.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-start gap-3 text-red-400 text-xs"
          >
            <AlertTriangle size={18} className="shrink-0" />
            <div className="flex-1 font-bold uppercase tracking-tight">{geoError}</div>
            <button onClick={() => setGeoError(null)} aria-label="Fermer"><X size={16}/></button>
          </m.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => {
             const address = getCleanAddress(order.special_instructions);
             const isTrackingMe = activeDeliveryId === order.id;

             return (
                <m.div 
                  key={order.id} 
                  layout 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-3xl border transition-all duration-300 ${isTrackingMe ? "bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(220,38,38,0.2)]" : "bg-neutral-900 border-neutral-800"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">#ORD-{order.id.split('-')[0].toUpperCase()}</span>
                      <h2 className="text-xl font-bold uppercase mt-2">{order.customer_name}</h2>
                      <p className="text-blue-400 text-sm font-mono mt-1">📞 {order.customer_phone}</p>
                    </div>
                    <span className="font-display font-bold text-xl">{Number(order.total_amount).toFixed(2)} CHF</span>
                  </div>
                  
                  <div className="bg-black/50 p-4 rounded-2xl border border-white/5 mb-6">
                    <div className="flex items-start gap-2 text-sm font-bold mb-2">
                      <MapPin className="text-brand-primary shrink-0" size={16} /> 
                      <span className="leading-tight">{address}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-gray-500 italic">
                      <MessageSquare size={12} className="shrink-0" />
                      <span className="line-clamp-2">{order.special_instructions}</span>
                    </div>
                  </div>

                  {isTrackingMe ? (
                    <button onClick={() => endDelivery(order.id)} className="w-full py-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                      Terminer la livraison
                    </button>
                  ) : (
                    <button 
                      onClick={() => startDelivery(order.id)} 
                      disabled={activeDeliveryId !== null}
                      className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${activeDeliveryId !== null ? "bg-neutral-800 text-gray-600 cursor-not-allowed" : "bg-brand-primary text-white hover:opacity-90"}`}
                    >
                      <Navigation size={16} /> Démarrer la course
                    </button>
                  )}
                </m.div>
             );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}