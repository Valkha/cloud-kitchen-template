"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { m, AnimatePresence } from "framer-motion";
import { Clock, ChefHat, Truck, PackageCheck, Loader2, ShoppingBasket, Store } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  restaurant_name: string;
}

interface Order {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
  pickup_time: string;
  type: string;
  created_at: string;
}

export default function OrderManager() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const syncOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, customer_name, total_amount, status, pickup_time, type, created_at,
        order_items (
          id, product_name, quantity, restaurant_name
        )
      `)
      .not("status", "eq", "delivered")
      .not("status", "eq", "cancelled")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as Order[]);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    // ✅ On encapsule l'appel dans une fonction asynchrone interne
    const initializeKDS = async () => {
      await syncOrders();
      if (isMounted) {
        setLoading(false);
      }
    };

    initializeKDS();

    const subscription = supabase
      .channel("orders-kds")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        syncOrders();
      })
      .subscribe();

    return () => { 
      isMounted = false;
      supabase.removeChannel(subscription); 
    };
  }, [supabase, syncOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) alert("Erreur lors de la mise à jour");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid": 
        return { color: "bg-blue-600", icon: <PackageCheck size={18} />, next: "preparing", label: "Accepter", text: "Payée" };
      case "preparing": 
        return { color: "bg-orange-500", icon: <ChefHat size={18} />, next: "ready", label: "Prête", text: "En cuisine" };
      case "ready": 
        return { color: "bg-green-600", icon: <Truck size={18} />, next: "delivered", label: "Terminer", text: "En attente" };
      default: 
        return { color: "bg-gray-700", icon: <Clock size={18} />, next: null, label: "-", text: status };
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen text-white">
      <header className="flex justify-between items-center mb-10 border-b border-neutral-800 pb-6">
        <h2 className="text-2xl font-display font-bold uppercase tracking-widest">
          Gestion <span className="text-brand-primary">Cuisine</span>
        </h2>
        <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {orders.length} {orders.length > 1 ? "commandes actives" : "commande active"}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => {
            const config = getStatusConfig(order.status);
            return (
              <m.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl"
              >
                <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-white ${config.color}`}>
                        {config.text}
                      </span>
                      <span className="text-gray-600 text-[10px] font-mono font-bold">#ORD-{order.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{order.customer_name}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                       <span className="flex items-center gap-1.5 text-brand-primary"><Clock size={14} /> {order.pickup_time}</span>
                       <span className="text-gray-500 px-2 py-0.5 border border-neutral-800 rounded">{order.type}</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full bg-black/40 p-5 rounded-2xl border border-neutral-800/50">
                    <ul className="space-y-3">
                      {order.order_items.map((item, idx) => (
                        <li key={idx} className="flex flex-col border-b border-neutral-800/50 pb-2 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-200 text-sm font-bold">
                              <span className="text-brand-primary mr-2">{item.quantity}x</span> {item.product_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase font-bold mt-1">
                            <Store size={10} /> {item.restaurant_name}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[180px] w-full lg:w-auto">
                    <div className="text-2xl font-display font-bold text-white">
                      {Number(order.total_amount).toFixed(2)} <span className="text-xs text-gray-500">CHF</span>
                    </div>
                    
                    {config.next && (
                      <button
                        onClick={() => updateStatus(order.id, config.next!)}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-brand-primary hover:text-white transition-all px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
                      >
                        {config.icon}
                        {config.label}
                      </button>
                    )}
                  </div>
                </div>
              </m.div>
            );
          })}
        </AnimatePresence>

        {orders.length === 0 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
            <ShoppingBasket size={48} className="mx-auto mb-4 text-neutral-800" />
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-neutral-600">Aucune commande en cours</p>
          </m.div>
        )}
      </div>
    </div>
  );
}