"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Clock, CheckCircle2, Package, Truck, 
  AlertCircle, RefreshCw, 
  Search, Eye, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  special_instructions: string;
  created_at: string;
  order_items: OrderItem[];
}

// ✅ Remplacement de 'any' par React.ElementType pour une meilleure sécurité de type
const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "text-amber-500", icon: Clock, label: "En attente" },
  paid: { color: "text-blue-500", icon: CheckCircle2, label: "Payé" },
  preparing: { color: "text-purple-500", icon: Package, label: "En préparation" },
  ready: { color: "text-green-500", icon: Truck, label: "Prêt / En livraison" },
  delivered: { color: "text-gray-400", icon: CheckCircle2, label: "Livré" },
  cancelled: { color: "text-red-500", icon: AlertCircle, label: "Annulé" },
};

export default function AdminOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data: resto } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', siteConfig.restaurantSlug)
        .single();

      if (!resto) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items(*)`)
        .eq("restaurant_id", resto.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, supabase]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Erreur lors de la mise à jour du statut");
    } else {
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.id.includes(searchTerm);
    const matchesFilter = filter === "all" || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold uppercase tracking-wider text-kabuki-red">Commandes</h1>
            <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">Flux en temps réel de la cuisine</p>
          </div>
          <div className="flex gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            {["all", "paid", "preparing", "ready"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${filter === f ? "bg-kabuki-red text-white" : "text-gray-500 hover:text-white"}`}
              >
                {f === "all" ? "Toutes" : statusConfig[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un nom ou un N°..." 
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-kabuki-red outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-kabuki-red mb-4" /> Chargement...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800 text-gray-500 italic">Aucune commande trouvée</div>
            ) : (
              filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || AlertCircle;
                return (
                  <motion.div 
                    layout
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer group ${selectedOrder?.id === order.id ? 'bg-neutral-800 border-kabuki-red shadow-xl' : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-kabuki-red uppercase tracking-tighter">#ORD-{order.id.split('-')[0].toUpperCase()}</span>
                          <span className={`flex items-center gap-1 text-[9px] font-bold uppercase ${statusConfig[order.status]?.color}`}>
                            <StatusIcon size={12} /> {statusConfig[order.status]?.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">{order.customer_name}</h3>
                        <p className="text-gray-500 text-xs font-mono">{new Date(order.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-display font-bold">{order.total_amount.toFixed(2)} CHF</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">{order.order_items?.length} articles</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sticky top-32 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-tighter">Détails</h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-black/40 rounded-2xl border border-neutral-800">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Instructions</p>
                      <p className="text-sm italic text-gray-300">{selectedOrder.special_instructions || "Aucune instruction"}</p>
                    </div>

                    <div className="space-y-4">
                      {selectedOrder.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                          <div className="flex gap-3">
                            <span className="font-black text-kabuki-red">{item.quantity}x</span>
                            <span className="text-gray-200">{item.product_name}</span>
                          </div>
                          <span className="font-mono text-xs">{(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 space-y-3">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Changer le statut</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["preparing", "ready", "delivered", "cancelled"].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateOrderStatus(selectedOrder.id, s)}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${selectedOrder.status === s ? 'bg-white text-black border-white' : 'bg-transparent border-neutral-700 text-gray-400 hover:border-white hover:text-white'}`}
                          >
                            {statusConfig[s]?.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-800 flex flex-col gap-2">
                      <a href={`tel:${selectedOrder.customer_phone}`} className="w-full bg-neutral-800 hover:bg-neutral-700 py-3 rounded-xl text-center text-xs font-bold uppercase transition">Appeler le client</a>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-600 bg-neutral-900/20 border border-dashed border-neutral-800 rounded-3xl">
                  <Eye size={40} className="mb-4 opacity-20" />
                  <p className="text-xs uppercase font-bold tracking-widest">Sélectionnez une commande</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}