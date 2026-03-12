"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Truck, MapPin, CheckCircle2, Navigation, Loader2, AlertTriangle, X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface Order {
  id: string; 
  customer_name: string;
  delivery_address: string;
  delivery_zip: string;
  customer_phone: string;
  status: string;
  total_amount: number;
}

export default function DriverDashboard() {
  const supabase = useMemo(() => createClient(), []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);

  const updateOrderSecurely = async (payload: { orderId: string; status?: string; lat?: number; lng?: number }) => {
    try {
      const res = await fetch('/api/driver/update-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      return true;
    } catch (err) {
      console.error("[SECURITY_GUARD] Échec de mutation :", err);
      return false;
    }
  };

  const fetchDriverOrders = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ CORRECTION : Utilisation de la colonne 'type' au lieu de 'order_type'
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
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[DIAG] Erreur livraisons :", err.message);
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
      setGeoError("Le GPS n'est pas supporté par ce navigateur.");
      return;
    }

    setGeoError(null);
    const success = await updateOrderSecurely({ orderId, status: "shipped" });
    
    if (success) {
      setActiveDeliveryId(orderId);
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await updateOrderSecurely({ orderId, lat: latitude, lng: longitude });
        },
        (error) => {
          setGeoError("Veuillez autoriser l'accès au GPS pour le suivi.");
          console.error("[DIAG] Erreur GPS :", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  };

  const endDelivery = async (orderId: string) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const success = await updateOrderSecurely({ orderId, status: "delivered" });

    if (success) {
      setActiveDeliveryId(null);
      fetchDriverOrders();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold uppercase flex items-center gap-3 tracking-widest">
          <Truck className="text-brand-primary" size={28} /> Espace Livreur
        </h1>
        <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-widest">
          {orders.length} livraison(s) en attente
        </p>
      </div>

      {geoError && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-start gap-3 text-red-400 text-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <div className="flex-1">{geoError}</div>
          <button onClick={() => setGeoError(null)}><X size={16}/></button>
        </div>
      )}

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => {
            const isTrackingMe = activeDeliveryId === order.id;

            return (
              <m.div 
                key={order.id} 
                layout 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border transition-all duration-500 flex flex-col ${
                  isTrackingMe 
                    ? "bg-brand-primary/10 border-brand-primary shadow-[0_0_30px_rgba(220,38,38,0.2)]" 
                    : "bg-neutral-900 border-neutral-800"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      #ORD-{order.id.split('-')[0].toUpperCase()}
                    </span>
                    <h2 className="text-xl font-bold uppercase mt-2">{order.customer_name}</h2>
                    <a href={`tel:${order.customer_phone}`} className="text-blue-400 text-sm font-mono mt-1 block hover:underline">
                      📞 {order.customer_phone}
                    </a>
                  </div>
                  <span className="font-display font-bold text-xl">{Number(order.total_amount).toFixed(2)} CHF</span>
                </div>

                <div className="bg-black/50 p-4 rounded-2xl border border-white/5 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="font-bold text-sm leading-tight">{order.delivery_address}</p>
                      <p className="text-brand-primary font-black text-xs mt-1">{order.delivery_zip}</p>
                    </div>
                  </div>
                  
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.delivery_address}, ${order.delivery_zip}, Suisse`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 py-3 rounded-xl text-xs font-bold uppercase transition"
                  >
                    <Navigation size={14} /> Ouvrir le GPS
                  </a>
                </div>

                <div className="mt-auto">
                  {isTrackingMe ? (
                    <button 
                      onClick={() => endDelivery(order.id)}
                      className="w-full py-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-green-500 transition-all active:scale-95"
                    >
                      <CheckCircle2 size={20} /> Livraison Terminée
                    </button>
                  ) : (
                    <button 
                      onClick={() => startDelivery(order.id)}
                      disabled={activeDeliveryId !== null}
                      className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        activeDeliveryId !== null 
                          ? "bg-neutral-800 text-gray-600 cursor-not-allowed" 
                          : "bg-brand-primary text-white shadow-lg hover:opacity-90 shadow-red-900/30"
                      }`}
                    >
                      <Navigation size={20} /> Démarrer la course
                    </button>
                  )}
                  
                  {isTrackingMe && (
                    <p className="text-center text-[10px] text-brand-primary uppercase font-bold mt-4 animate-pulse tracking-widest">
                      📍 Partage GPS en direct activé...
                    </p>
                  )}
                </div>
              </m.div>
            );
          })}
        </AnimatePresence>
        
        {orders.length === 0 && (
          <div className="text-center text-gray-500 py-20 uppercase font-bold text-sm tracking-widest border border-dashed border-neutral-800 rounded-3xl">
            Aucune livraison prête.
          </div>
        )}
      </div>
    </div>
  );
}