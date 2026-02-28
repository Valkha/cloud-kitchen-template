"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChefHat, Package, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

interface OrderData {
  id: number;
  pickup_time: string;
  status: string;
}

interface OrderTrackerProps {
  orderId: number;
}

export default function OrderTracker({ orderId }: OrderTrackerProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useTranslation();

  const steps = [
    { id: "Payé", label: "Commande validée", icon: Receipt },
    { id: "En préparation", label: "En cuisine", icon: ChefHat },
    { id: "Prête", label: "Prête", icon: Package },
    { id: "Livrée", label: "Terminée", icon: CheckCircle2 }
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, pickup_time, status")
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Erreur lors du chargement de la commande:", error);
      } else if (data) {
        setOrder(data as OrderData);
      }
      setLoading(false);
    };

    fetchOrder();

    const subscription = supabase
      .channel(`public:orders:id=eq.${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(payload.new as OrderData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId]);

  const handleFinish = () => {
    localStorage.removeItem("kabuki_active_order");
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-kabuki-red" /></div>;
  if (!order) return <div className="text-center p-10 text-gray-500 font-bold uppercase tracking-widest text-sm">Commande introuvable</div>;

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const isDelivered = order.status === "Livrée";

  return (
    <div className="space-y-6 max-w-lg mx-auto px-2">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <span className="text-kabuki-red font-bold text-[10px] uppercase tracking-[0.3em]">Suivi en direct</span>
          <h2 className="text-white font-display font-bold uppercase text-3xl tracking-tighter italic mt-1">
            Commande #KBK-{order.id}
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            {isDelivered ? "Livraison effectuée" : `Retrait prévu à ${order.pickup_time}`}
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-800" />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const isCompleted = index <= activeIndex;
              const isActive = index === activeIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative flex items-center gap-6 z-10">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: isCompleted ? "#DC2626" : "#171717",
                      borderColor: isCompleted ? "#DC2626" : "#262626",
                      color: isCompleted ? "#FFFFFF" : "#525252",
                      scale: isActive ? 1.1 : 1
                    }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'shadow-[0_0_20px_rgba(220,38,38,0.4)]' : ''}`}
                  >
                    <Icon size={20} />
                  </motion.div>

                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                      {step.label}
                    </h4>
                    {isActive && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-kabuki-red font-bold mt-1 overflow-hidden"
                      >
                        {step.id === "Payé" ? "En attente de prise en charge par la cuisine." :
                         step.id === "En préparation" ? "Nos chefs préparent vos sushis..." : 
                         step.id === "Prête" ? "Votre commande est prête !" : 
                         step.id === "Livrée" ? "Bon appétit ! Merci de votre confiance." : ""}
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDelivered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <Link 
              href={`/${lang}/menu`}
              onClick={handleFinish}
              className="w-full bg-white text-black font-bold py-5 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-kabuki-red hover:text-white transition-all shadow-xl"
            >
              Nouvelle commande <ArrowRight size={16} />
            </Link>
            
            <Link 
              href={`/${lang}`}
              onClick={handleFinish}
              className="w-full text-center text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors py-2"
            >
              {/* ✅ Correction de l'erreur d'entité ici */}
              {"Retour à l'accueil"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}