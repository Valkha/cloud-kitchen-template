"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderTracker from "@/components/OrderTracker";
import { Loader2 } from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("order_id");
  
  // ✅ L'ID est une string (UUID Supabase)
  const [orderId, setOrderId] = useState<string | null>(urlOrderId || null);

  useEffect(() => {
    const initTracking = async () => {
      // ✅ Harmonisation avec le branding Planet Food
      const STORAGE_KEY = "planetfood_active_order"; 

      if (urlOrderId) {
        localStorage.setItem(STORAGE_KEY, urlOrderId);
      } else {
        const savedOrderId = localStorage.getItem(STORAGE_KEY);
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
        <div className="text-center text-gray-500 font-black uppercase tracking-[0.3em] mt-20 flex flex-col items-center gap-6">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
          <p className="text-sm">Recherche de votre commande Planet Food...</p>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Suspense 
        fallback={
          <div className="flex flex-col items-center mt-20 text-brand-primary">
            <Loader2 className="animate-spin mb-4" size={32} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              Initialisation du flux de suivi...
            </span>
          </div>
        }
      >
        <TrackContent />
      </Suspense>
    </div>
  );
}