"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Rocket } from "lucide-react";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const startTimer = setTimeout(() => {
      setIsLoading(true);
    }, 0);

    const stopTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);
    window.addEventListener("start-loader", handleStart);
    window.addEventListener("stop-loader", handleStop);
    return () => {
      window.removeEventListener("start-loader", handleStart);
      window.removeEventListener("stop-loader", handleStop);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ willChange: "opacity" }}
          className="fixed inset-0 z-[9999] bg-[#080808]/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="relative w-48 h-48 flex items-center justify-center">
            
            {/* --- CERCLE DE CHARGEMENT DYNAMIQUE --- */}
            <m.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="50" cy="50" r="42"
                stroke="white" strokeWidth="0.5" fill="none" opacity="0.05"
              />
              <m.circle
                cx="50" cy="50" r="42"
                stroke="var(--brand-primary)" // ✅ Utilise maintenant la couleur de l'enseigne
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="100 300"
                style={{ filter: "drop-shadow(0 0 8px var(--brand-primary))" }}
              />
            </m.svg>

            {/* --- ICONE FUSÉE CENTRALE --- */}
            <m.div 
              animate={{ 
                scale: [0.9, 1.1, 0.9],
                y: [0, -5, 0] 
              }} 
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut" 
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <Rocket 
                size={40} 
                className="text-white" 
                style={{ filter: "drop-shadow(0 0 15px var(--brand-primary))" }}
              />
            </m.div>
          </div>

          {/* --- TEXTE DE CHARGEMENT --- */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mt-8"
          >
            <span className="text-white font-display uppercase tracking-[0.5em] text-[12px] font-black">
              Planet <span className="text-brand-primary">Food</span>
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <m.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1 h-1 bg-brand-primary rounded-full"
                />
              ))}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}