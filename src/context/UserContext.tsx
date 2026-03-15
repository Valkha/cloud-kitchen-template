"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  wallet_balance: number;
  is_admin: boolean; // ✅ C'est cette valeur qu'on veut !
  address: string | null;
  zip_code: string | null;
  city: string | null;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const fetchProfile = useCallback(async (userId: string, silent = false) => {
    if (!silent) setLoading(true);

    try {
      // ✅ ON QUERY DIRECTEMENT SUPABASE AU LIEU DE L'API
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // ✅ CORRECTION : On ignore silencieusement l'erreur de synchronisation multi-onglets (Web Locks)
        if (error.message?.includes("AbortError") || error.message?.includes("Lock broken")) {
          console.warn("🤫 [UserContext] Synchronisation multi-onglets en cours (AbortError ignorée).");
          return; // On sort sans effacer le profil !
        }
        
        console.error("[UserContext] Error fetching profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // ✅ CORRECTION : Sécurité supplémentaire dans le bloc catch
      if (errorMessage.includes("AbortError") || errorMessage.includes("Lock broken")) {
        console.warn("🤫 [UserContext] Requête annulée pour cause de priorité inter-onglets.");
        return;
      }
      
      console.error("[UserContext] Catch Error:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, true);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  return (
    <UserContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error("useUser must be used within a UserProvider");
  return context;
};