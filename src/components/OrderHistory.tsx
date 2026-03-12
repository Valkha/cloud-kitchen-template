"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import TransitionLink from "./TransitionLink";
import { useParams } from "next/navigation";

type Order = {
  id: string;
  created_at: string;
  total_amount: number; 
  status: 'paid' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
};

const statusMap = {
  paid: { label: "Validée", color: "text-blue-500", icon: Clock },
  preparing: { label: "En cuisine", color: "text-purple-500", icon: Package },
  ready: { label: "Prête", color: "text-amber-500", icon: CheckCircle2 },
  shipped: { label: "En livraison", color: "text-brand-primary", icon: Truck },
  delivered: { label: "Livrée", color: "text-green-500", icon: CheckCircle2 },
  cancelled: { label: "Annulée", color: "text-gray-500", icon: XCircle },
};

export default function OrderHistory() {
  const { user } = useUser();
  const params = useParams();
  const lang = typeof params.lang === 'string' ? params.lang : 'fr';
  const supabase = useMemo(() => createClient(), []);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: resto, error: restoError } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('slug', siteConfig.restaurantSlug)
        .maybeSingle();

      if (restoError) {
        console.error("[HISTORY_DEBUG] Erreur Supabase détaillé:", restoError.message);
        setLoading(false);
        return;
      }

      if (!resto) {
        setLoading(false);
        return;
      }

      const { data, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, status")
        .eq("user_id", user.id)
        .eq("restaurant_id", resto.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      if (data) setOrders(data as Order[]);

    } catch (err: unknown) {
      // ✅ La correction est ici
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[HISTORY_ERROR_FINAL]:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return (
    <div className="flex items-center gap-3 py-10 justify-center">
      <Loader2 className="animate-spin text-brand-primary" size={18} />
      <span className="text-neutral-500 uppercase text-[10px] font-black tracking-[0.2em]">Synchronisation...</span>
    </div>
  );

  if (orders.length === 0) return (
    <div className="py-10 text-center bg-white/5 rounded-3xl border border-dashed border-neutral-800">
      <p className="text-neutral-500 text-[10px] uppercase font-black tracking-widest">Zone de commande vide</p>
    </div>
  );

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {orders.map((order) => {
        const status = statusMap[order.status] || statusMap.paid;
        const Icon = status.icon;

        return (
          <TransitionLink 
            key={order.id} 
            href={`/${lang}/track?order_id=${order.id}`}
            className="block group"
          >
            <div className="glass-panel p-5 rounded-[2rem] flex items-center justify-between group-hover:border-brand-primary/50 group-hover:glow-primary transition-all duration-500">
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl bg-black/40 ${status.color} border border-white/5 shadow-inner`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-display font-bold text-sm uppercase tracking-tight">
                      #ORD-{order.id.split('-')[0].toUpperCase()}
                    </p>
                    {order.status === 'shipped' && (
                      <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-ping" />
                    )}
                  </div>
                  <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mt-0.5">
                    {new Date(order.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-display font-black text-sm italic">{Number(order.total_amount).toFixed(2)} <span className="text-[10px] not-italic text-neutral-500">CHF</span></p>
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 ${status.color}`}>
                    {status.label}
                  </p>
                </div>
                <ChevronRight size={18} className="text-neutral-800 group-hover:text-brand-primary transition-colors" />
              </div>
            </div>
          </TransitionLink>
        );
      })}
    </div>
  );
}