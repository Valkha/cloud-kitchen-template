"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { m, AnimatePresence } from "framer-motion";
import { Receipt, ChefHat, Package, CheckCircle2, Loader2, ArrowRight, XCircle, Truck, Store } from "lucide-react"; 
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-neutral-900 animate-pulse rounded-2xl flex items-center justify-center text-gray-500 text-xs border border-neutral-800">Chargement du GPS...</div>
});

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  restaurant_name: string;
}

interface OrderData {
  id: string;
  pickup_time: string;
  status: string;
  type: string; // ✅ CORRECTION : 'order_type' devient 'type'
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
  const { lang } = useTranslation();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, pickup_time, status, type, driver_lat, driver_lng,
          order_items (
            id,
            product_name,
            quantity,
            restaurant_name
          )
        `) // ✅ CORRECTION : 'order_type' devient 'type'
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Erreur chargement commande:", error);
      } else if (data) {
        setOrder(data as unknown as OrderData);
      }
      setLoading(false);
    };

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
  }, [orderId, supabase]);

  const groupedItems = useMemo(() => {
    if (!order?.order_items) return {};
    return order.order_items.reduce((acc, item) => {
      const key = item.restaurant_name || "Restaurant";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);
  }, [order]);

  const handleFinish = () => {
    localStorage.removeItem("kabuki_active_order");
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-primary" /></div>;
  if (!order) return <div className="text-center p-10 text-gray-500 font-bold uppercase tracking-widest text-sm">Commande introuvable</div>;

  // ✅ CORRECTION : Utilisation de 'order.type'
  const isDelivery = order.type === "Livraison";

  const steps = isDelivery ? [
    { id: "paid", label: "Validée", icon: Receipt },
    { id: "preparing", label: "En cuisine", icon: ChefHat },
    { id: "ready", label: "Attente livreur", icon: Package },
    { id: "shipped", label: "En route", icon: Truck },
    { id: "delivered", label: "Livrée", icon: CheckCircle2 }
  ] : [
    { id: "paid", label: "Validée", icon: Receipt },
    { id: "preparing", label: "En cuisine", icon: ChefHat },
    { id: "ready", label: "Prête pour retrait", icon: Package },
    { id: "delivered", label: "Terminée", icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled"; 
  const showMap = isDelivery && (order.status === "shipped" || (order.driver_lat && order.driver_lng));

  return (
    <div className="space-y-6 max-w-lg mx-auto px-2">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <span className="text-brand-primary font-bold text-[10px] uppercase tracking-[0.3em]">
            {isDelivery ? "Suivi de Livraison" : "Suivi en direct"}
          </span>
          <h2 className="text-white font-display font-bold uppercase text-3xl tracking-tighter italic mt-1">
            #ORD-{order.id.split('-')[0].toUpperCase()}
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            {isDelivered ? "Livraison effectuée" : isCancelled ? "Commande annulée" : `Prévu à ${order.pickup_time}`}
          </p>
        </div>

        {!isCancelled && !isDelivered && (
          <div className="mb-10 space-y-4">
            <div className="h-px bg-neutral-800 w-full mb-6" />
            {Object.entries(groupedItems).map(([restoName, items]) => (
              <div key={restoName} className="bg-black/30 rounded-2xl p-4 border border-neutral-800/50">
                <div className="flex items-center gap-2 text-brand-primary mb-3">
                  <Store size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{restoName}</span>
                </div>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item.id} className="flex justify-between text-xs">
                      <span className="text-gray-300">
                        <span className="font-bold text-white">{item.quantity}x</span> {item.product_name}
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
            <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8">
              <DeliveryMap driverLat={order.driver_lat} driverLng={order.driver_lng} />
            </m.div>
          )}
        </AnimatePresence>

        {isCancelled ? (
          <div className="text-center py-10 bg-red-900/10 rounded-2xl border border-red-500/20">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-bold uppercase tracking-widest mb-2">Commande Annulée</h3>
            <p className="text-gray-400 text-xs px-6 leading-relaxed">Remboursement initié vers votre moyen de paiement.</p>
          </div>
        ) : (
          <div className="relative mt-4">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-800" />
            <div className="space-y-8">
              {steps.map((step, index) => {
                const isCompleted = index <= activeIndex;
                const isActive = index === activeIndex;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative flex items-center gap-6 z-10">
                    <m.div
                      animate={{
                        backgroundColor: isCompleted ? "#dc2626" : "#171717",
                        borderColor: isCompleted ? "#dc2626" : "#262626",
                        color: isCompleted ? "#FFFFFF" : "#525252",
                        scale: isActive ? 1.1 : 1
                      }}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'shadow-[0_0_20px_rgba(220,38,38,0.4)]' : ''}`}
                    >
                      <Icon size={20} />
                    </m.div>
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</h4>
                      {isActive && (
                        <m.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs text-brand-primary font-bold mt-1">
                          {step.id === "paid" ? "En attente de prise en charge." :
                           step.id === "preparing" ? "Vos restaurants préparent vos plats..." : 
                           step.id === "ready" ? "C'est prêt !" : 
                           step.id === "shipped" ? "Le livreur arrive !" : ""}
                        </m.p>
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
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <Link href={`/${lang}/menu`} onClick={handleFinish} className="w-full bg-white text-black font-bold py-5 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-brand-primary hover:text-white transition-all shadow-xl">
              Nouvelle commande <ArrowRight size={16} />
            </Link>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}