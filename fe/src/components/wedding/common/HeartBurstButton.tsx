"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  color: string;
}

const HEART_COLORS = ["#E11D48", "#F43F5E", "#FB7185", "#FDA4AF", "#BE123C"];

export const HeartBurstButton: React.FC<{ accentColor?: string }> = ({
  accentColor = "#E11D48",
}) => {
  const [likes, setLikes] = useState(68);
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleBurst = () => {
    setLikes((prev) => prev + 1);

    const newParticles: Particle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: -(Math.random() * 80 + 40),
      scale: Math.random() * 0.5 + 0.8,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1200);
  };

  return (
    <div className="relative inline-block">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute left-1/2 top-0 pointer-events-none z-30"
          >
            <Heart className="w-5 h-5 fill-current" style={{ color: p.color }} />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBurst}
        className="px-5 py-2.5 rounded-full bg-white shadow-md border border-rose-200 text-stone-800 text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-rose-50/50 transition group"
      >
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 group-hover:scale-110 transition" />
        </motion.div>
        <span className="font-serif">Thả Tim Chúc Phúc</span>
        <span className="font-mono text-[10px] text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full font-bold">
          {likes}
        </span>
      </motion.button>
    </div>
  );
};
