"use client";

import { createClient } from "@/utils/supabase/client";

export function usePushNotifications() {
  const supabase = createClient();

  const subscribeToPush = async (restaurantId?: string) => {
    try {
      if (!("Notification" in window)) return false;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      // ✅ Correction ESLint : On utilise JSON.parse/stringify pour garantir 
      // un objet pur sans utiliser 'any'.
      await supabase.from('push_subscriptions').insert({
        user_id: user?.id || null,
        restaurant_id: restaurantId || null,
        subscription: JSON.parse(JSON.stringify(subscription)) as Record<string, unknown>
      });

      return true;
    } catch (error) {
      console.error("Erreur Push Sub:", error);
      return false;
    }
  };

  return { subscribeToPush };
}