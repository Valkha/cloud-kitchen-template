"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { Package, Clock, CheckCircle2, Truck } from "lucide-react";

type Order = {
  id: string;
  created_at: string;
  total_price: number;
  status: 'pending' | 'preparing' | 'shipping' | 'completed' | 'cancelled';
};

const statusMap = {
  pending: { label: "En attente", color: "text-yellow-500", icon: Clock },
  preparing: { label: "En préparation", color: "text-blue-500", icon: Package },
  shipping: { label: "En livraison", color: "text-orange-500", icon: Truck },
  completed: { label: "Livré", color: "text-green-500", icon: CheckCircle2 },
  cancelled: { label: "Annulé", color: "text-red-500", icon: Clock },
};

export default function OrderHistory() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_price, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data as Order[]);
      setLoading(false);
    }

    fetchOrders();
  }, [user, supabase]);

  if (loading) return <div className="text-gray-500 animate-pulse uppercase text-[10px] font-bold">Chargement des commandes...</div>;
  if (orders.length === 0) return <div className="text-gray-500 text-xs uppercase italic">Aucune commande passée.</div>;

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {orders.map((order) => {
        const status = statusMap[order.status] || statusMap.pending;
        const Icon = status.icon;

        return (
          <div key={order.id} className="bg-black/40 border border-neutral-800 p-4 rounded-xl flex items-center justify-between group hover:border-kabuki-red transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-neutral-900 ${status.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-xs uppercase tracking-wider">Commande #{order.id.slice(0, 8)}</p>
                <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">{order.total_price.toFixed(2)} CHF</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}