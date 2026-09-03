"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  duration: number;
  sway: number;
}

const EMOJIS = ["❤️", "💖", "🌸", "✨", "🥂", "💍", "🕊️", "💕"];

export const FloatingCelebrationWidget: React.FC<{ primaryColor?: string }> = ({
  primaryColor = "#E11D48",
}) => {
  const [likesCount, setLikesCount] = useState(128);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  const spawnBurst = useCallback((clientX?: number, clientY?: number) => {
    setLikesCount((prev) => prev + 1);
    setIsLiked(true);

    const originX = clientX !== undefined ? clientX : window.innerWidth - 60;
    const originY = clientY !== undefined ? clientY : window.innerHeight - 150;

    const count = 7;
    const newParticles: FloatingParticle[] = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x: originX + (Math.random() * 40 - 20),
        y: originY,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        size: Math.floor(Math.random() * 12) + 20,
        duration: 1.8 + Math.random() * 0.8,
        sway: (Math.random() - 0.5) * 60,
      });
    }

    setParticles((prev) => [...prev.slice(-25), ...newParticles]);

    // Tự động dọn dẹp particles sau khi bay xong
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 2800);
  }, []);

  return (
    <>
      {/* 1. LAYER PARTICLES FLOATING UP */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                x: p.x,
                y: p.y,
                scale: 0.6,
              }}
              animate={{
                opacity: [1, 1, 0],
                x: p.x + p.sway,
                y: p.y - (300 + Math.random() * 200),
                scale: [0.6, 1.3, 0.9],
                rotate: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 45],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute select-none drop-shadow-md pointer-events-none"
              style={{ fontSize: `${p.size}px` }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. FLOATING BUTTON CHÚC PHÚC / THẢ TIM */}
      <div className="fixed bottom-[130px] sm:bottom-[140px] right-3.5 sm:right-4 z-40 flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => spawnBurst(e.clientX, e.clientY)}
          className="relative group p-3 rounded-full bg-white/90 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.15)] border border-rose-100 flex items-center justify-center cursor-pointer transition-all active:ring-4 active:ring-rose-200"
          aria-label="Thả tim chúc phúc"
        >
          {/* Glowing pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-rose-400/30"
          />

          <motion.div
            animate={isLiked ? { scale: [1, 1.35, 1] } : { scale: [1, 1.1, 1] }}
            transition={{ duration: 0.4 }}
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 filter drop-shadow-xs" />
          </motion.div>

          {/* Sparkles icon tiny */}
          <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1 animate-spin-slow" />
        </motion.button>

        {/* Counter badge */}
        <motion.span
          key={likesCount}
          initial={{ scale: 0.8, y: -2 }}
          animate={{ scale: 1, y: 0 }}
          className="mt-1 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold shadow-xs select-none"
        >
          {likesCount}
        </motion.span>
      </div>
    </>
  );
};
