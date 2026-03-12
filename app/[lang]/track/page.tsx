"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderTracker from "@/components/OrderTracker";
import { Loader2 } from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("order_id");
  
  // ✅ CORRECTION : L'ID est maintenant une string (UUID) et non plus un number
  const [orderId, setOrderId] = useState<string | null>(urlOrderId || null);

  useEffect(() => {
    const initTracking = async () => {
      if (urlOrderId) {
        // Sauvegarde de l'ID technique (UUID) dans le storage pour persistance
        localStorage.setItem("template_restaurant_active_order", urlOrderId);
      } else {
        // Récupération si l'URL est "propre" (ex: après un partage de lien ou refresh)
        const savedOrderId = localStorage.getItem("template_restaurant_active_order");
        if (savedOrderId) {
          setOrderId(savedOrderId);
        }
      }
    };

    initTracking();
  }, [urlOrderId]);

  return (
    <div className="container mx-auto px-4">
      {orderId ? (
        <OrderTracker orderId={orderId} />
      ) : (
        <div className="text-center text-gray-500 font-bold uppercase tracking-widest mt-20 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-kabuki-red" size={40} />
          <p className="text-sm">Recherche de votre commande en cours...</p>
        </div>
      )}
    </div>
  );
}

// ✅ Next.js exige un Suspense pour l'utilisation de useSearchParams en mode "force-client"
export default function TrackPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Suspense 
        fallback={
          <div className="flex flex-col items-center mt-20 text-kabuki-red">
            <Loader2 className="animate-spin mb-4" size={32} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
              Initialisation du flux...
            </span>
          </div>
        }
      >
        <TrackContent />
      </Suspense>
    </div>
  );
}