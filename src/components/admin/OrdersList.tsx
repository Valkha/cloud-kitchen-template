"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Eye, 
  XCircle, 
  Calendar,
  CheckCircle2, // ✅ Ajouté pour le statut Payé
  AlertCircle // ✅ Ajouté pour le statut En attente
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Interfaces
interface OrderItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  order_type: string;
  total_amount: number;
  items: OrderItem[]; 
  status: string; // ✅ Le statut est bien présent dans l'interface
  delivery_address?: string;
  delivery_zip?: string;
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ✅ 1. fetchOrders est maintenant optimisé
  const fetchOrders = useCallback(async (isRefresh = false) => {
    // On ne change le loading que si c'est un refresh manuel (bouton)
    // Au montage initial, loading est déjà à true (valeur par défaut du useState)
    if (isRefresh) setLoading(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur Supabase:", error);
      } else if (data) {
        setOrders(data as Order[]);
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 2. useEffect appelle fetchOrders sans provoquer de mise à jour d'état synchrone
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <div className="p-8 text-center text-gray-500 uppercase tracking-widest text-xs italic">Chargement du registre...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
          <Package className="text-kabuki-red" /> Registre des Commandes
        </h2>
        {/* On passe true pour forcer le loading lors d'un clic manuel */}
        <button 
          onClick={() => fetchOrders(true)} 
          className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-gray-400 px-4 py-2 rounded-full uppercase font-bold transition border border-neutral-700"
        >
          Actualiser
        </button>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
            <p className="text-gray-600 text-sm uppercase tracking-widest">Aucune commande enregistrée</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 hover:border-neutral-700 transition"
            >
              <div className="space-y-1 min-w-[120px]">
                <span className="text-[10px] font-bold text-kabuki-red uppercase tracking-tighter">#KBK-{order.id}</span>
                <p className="text-white font-bold text-sm uppercase">{order.customer_name}</p>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold mb-1">Passage</span>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Calendar size={12} className="text-kabuki-red" />
                    {/* Gestion sécurisée de la date au cas où elle serait null */}
                    {order.pickup_date ? format(new Date(order.pickup_date), "dd MMM", { locale: fr }) : "-"} à {order.pickup_time || "-"}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold mb-1">Type</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${order.order_type === 'Livraison' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {order.order_type}
                  </span>
                </div>

                {/* ✅ AJOUT DU BADGE DE STATUT */}
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-bold mb-1">Statut</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 border ${
                    order.status === 'Payé' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {order.status === 'Payé' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    {order.status || "Nouveau"}
                  </span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-gray-500 uppercase font-bold mb-1">Total</span>
                  <span className="text-sm font-bold text-white">{Number(order.total_amount).toFixed(2)} CHF</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setSelectedOrder(order)}
                  className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition border border-neutral-700"
                 >
                  <Eye size={18} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODALE DÉTAILS --- */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-black/20 shrink-0">
                <div className="flex items-center gap-4">
                  <h3 className="text-white font-display font-bold uppercase tracking-widest text-sm">#KBK-{selectedOrder.id}</h3>
                  {/* ✅ Badge de statut aussi dans la modale */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 border ${
                    selectedOrder.status === 'Payé' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {selectedOrder.status === 'Payé' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    {selectedOrder.status}
                  </span>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white transition"><XCircle size={20}/></button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center gap-1"><User size={10}/> Client</span>
                      <p className="text-white text-sm font-bold">{selectedOrder.customer_name}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center gap-1"><Phone size={10}/> Téléphone</span>
                      <p className="text-white text-sm font-bold">{selectedOrder.customer_phone}</p>
                   </div>
                </div>

                {selectedOrder.order_type === "Livraison" && (
                  <div className="bg-black/30 p-4 rounded-2xl border border-neutral-800">
                    <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center gap-1 mb-2"><MapPin size={10}/> Adresse de livraison</span>
                    <p className="text-white text-sm leading-relaxed">{selectedOrder.delivery_address}, {selectedOrder.delivery_zip}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center gap-1"><Package size={10}/> Panier</span>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/30">
                        <span className="text-gray-300 font-bold">{item.quantity}x <span className="text-white uppercase">{item.name}</span></span>
                        <span className="text-kabuki-red font-bold">{(item.price * item.quantity).toFixed(2)} CHF</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-between items-center px-2">
                  <span className="text-white font-bold uppercase tracking-tighter text-xs">Total</span>
                  <span className="text-2xl font-display font-bold text-kabuki-red">{Number(selectedOrder.total_amount).toFixed(2)} CHF</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}