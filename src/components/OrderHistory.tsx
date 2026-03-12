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
  shipped: { label: "En livraison", color: "text-kabuki-red", icon: Truck },
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
    // 1. Vérification de l'utilisateur
    if (!user?.id) {
      console.error("[HISTORY_DEBUG] Erreur : Pas d'ID utilisateur trouvé dans le contexte.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("[HISTORY_DEBUG] Début du fetch...");
      console.log("[HISTORY_DEBUG] User ID:", user.id);
      console.log("[HISTORY_DEBUG] Restaurant Slug ciblé:", siteConfig.restaurantSlug);

      // 2. Récupération du restaurant
      const { data: resto, error: restoError } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('slug', siteConfig.restaurantSlug)
        .single();

      if (restoError) {
        console.error("[HISTORY_DEBUG] Erreur table 'restaurants':", {
          message: restoError.message,
          code: restoError.code,
          details: restoError.details
        });
        setLoading(false);
        return;
      }

      console.log("[HISTORY_DEBUG] Restaurant identifié:", resto.name, "(ID:", resto.id, ")");

      // 3. Récupération des commandes
      // On teste d'abord une requête simple pour voir si la table répond
      const { data, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, status")
        .eq("user_id", user.id)
        .eq("restaurant_id", resto.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        // ✅ On stringify l'erreur pour forcer l'affichage des détails cachés
        console.error("[HISTORY_DEBUG] Erreur table 'orders' COMPLETE:", JSON.stringify(ordersError, null, 2));
        throw ordersError;
      }

      console.log("[HISTORY_DEBUG] Données brutes reçues:", data);
      
      if (data) {
        setOrders(data as Order[]);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      console.error("[HISTORY_ERROR_FINAL]:", errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return (
    <div className="flex items-center gap-3 py-10">
      <Loader2 className="animate-spin text-kabuki-red" size={18} />
      <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Récupération de vos commandes...</span>
    </div>
  );

  if (orders.length === 0) return (
    <div className="py-10 text-center bg-black/20 rounded-2xl border border-dashed border-neutral-800">
      <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Aucune commande trouvée</p>
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
            <div className="bg-black/40 border border-neutral-800 p-5 rounded-[2rem] flex items-center justify-between group-hover:border-kabuki-red transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl bg-neutral-900 ${status.color} border border-white/5`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm uppercase tracking-tighter">
                      #ORD-{order.id.split('-')[0].toUpperCase()}
                    </p>
                    {order.status === 'shipped' && (
                      <span className="flex h-2 w-2 rounded-full bg-kabuki-red animate-ping" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-black text-sm">{Number(order.total_amount).toFixed(2)} CHF</p>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${status.color}`}>
                    {status.label}
                  </p>
                </div>
                <ChevronRight size={18} className="text-neutral-700 group-hover:text-kabuki-red transition-colors" />
              </div>
            </div>
          </TransitionLink>
        );
      })}
    </div>
  );
}