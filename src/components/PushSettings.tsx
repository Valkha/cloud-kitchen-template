"use client";

import { useState, useEffect } from "react";
// ✅ Correction ESLint : Suppression de BellOff qui était inutilisé
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
// ✅ Correction TS2307 : Utilisation d'un chemin relatif pour garantir la résolution
import { usePushNotifications } from "../hooks/usePushNotifications";

export default function PushSettings() {
  const { subscribeToPush } = usePushNotifications();
  const [status, setStatus] = useState<"default" | "granted" | "denied">("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ Correction performance : initialisation asynchrone
    const syncStatus = async () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        setStatus(Notification.permission);
      }
    };
    syncStatus();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const success = await subscribeToPush();
      if (success) {
        setStatus("granted");
      } else if (Notification.permission === "denied") {
        setStatus("denied");
      }
    } catch (err) {
      console.error("Erreur Push:", err);
    } finally {
      setLoading(false);
    }
  };

  if (typeof window !== "undefined" && !("serviceWorker" in navigator)) {
    return null;
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-[2.5rem] mt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${status === "granted" ? "bg-green-500/10 text-green-500" : "bg-brand-primary/10 text-brand-primary"}`}>
            {status === "granted" ? <CheckCircle2 size={24} /> : <Bell size={24} />}
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Notifications</h3>
            <p className="text-xs text-gray-500 mt-1">
              {status === "granted" ? "Alertes actives." : "Soyez prévenu en direct."}
            </p>
          </div>
        </div>

        {status === "granted" ? (
          <div className="bg-green-500/20 text-green-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Activé</div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading || status === "denied"}
            className="bg-white text-black hover:bg-brand-primary hover:text-white transition-all px-6 py-3 rounded-2xl font-black uppercase text-[10px] disabled:opacity-30"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : status === "denied" ? "Bloqué" : "Activer"}
          </button>
        )}
      </div>
    </div>
  );
}