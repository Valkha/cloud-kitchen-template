"use client";

// ✅ On remplace 'm' par 'motion' pour éviter le crash lié à l'absence de LazyMotion
import { motion, useReducedMotion } from "framer-motion"; 
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
}

export default function Reveal({ 
  children, 
  width = "100%", 
  delay = 0.2, 
  y = 20, 
  x = 0,
  className = ""
}: Props) {
  const shouldReduceMotion = useReducedMotion();

  const initialY = shouldReduceMotion ? 0 : y;
  const initialX = shouldReduceMotion ? 0 : x;

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width }}
    >
      {/* ✅ Utilisation de motion.div au lieu de m.div */}
      <motion.div
        variants={{
          hidden: { 
            opacity: 0, 
            y: initialY, 
            x: initialX,
          },
          visible: { 
            opacity: 1, 
            y: 0, 
            x: 0,
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ 
          once: true, 
          margin: "-20px",
          amount: "some" 
        }}
        transition={{ 
          duration: 0.4,
          delay: shouldReduceMotion ? 0 : delay, 
          ease: [0.25, 1, 0.5, 1],
        }}
        style={{ 
          willChange: "opacity, transform"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}