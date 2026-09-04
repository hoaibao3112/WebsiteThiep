"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Volume2, VolumeX, Disc3 } from "lucide-react";

interface MusicFloatingPlayerProps {
  musicUrl?: string | null;
  accentColor?: string;
  autoPlay?: boolean;
}

export const MusicFloatingPlayer: React.FC<MusicFloatingPlayerProps> = ({
  musicUrl = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
  accentColor = "#BE944E",
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && musicUrl) {
      const audio = new Audio(musicUrl);
      audio.loop = true;
      audioRef.current = audio;

      // Autoplay on first user interaction if blocked
      const handleFirstInteraction = () => {
        if (audioRef.current && !isPlaying) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Autoplay policy prevented
          });
        }
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("touchstart", handleFirstInteraction);
      };

      if (autoPlay) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          window.addEventListener("click", handleFirstInteraction, { once: true });
          window.addEventListener("touchstart", handleFirstInteraction, { once: true });
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicUrl, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => console.error("Audio playback error:", err));
    }
  };

  if (!musicUrl) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-20 left-3 sm:bottom-24 sm:left-6 z-40 flex items-center gap-2"
    >
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={togglePlay}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-stone-900/90 text-amber-200 border-2 border-amber-300/40 shadow-xl flex items-center justify-center cursor-pointer backdrop-blur-md relative overflow-hidden group"
        aria-label={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
      >
        {/* Đĩa than xoay tròn */}
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-full h-full rounded-full flex items-center justify-center"
        >
          <Disc3 className={`w-7 h-7 sm:w-8 sm:h-8 ${isPlaying ? "text-amber-300" : "text-stone-500"}`} />
        </motion.div>

        {/* Lỗ tâm đĩa than */}
        <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-stone-900 border border-amber-400/60 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-amber-200" />
        </div>
      </motion.button>

      {/* Sóng âm thanh equalizer mini */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-end gap-0.5 h-4 bg-black/50 px-2 py-1 rounded-full backdrop-blur-xs border border-white/20"
        >
          {[0.6, 1, 0.4, 0.8].map((h, i) => (
            <motion.span
              key={i}
              animate={{ height: ["3px", `${h * 12}px`, "3px"] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              className="w-0.5 rounded-full bg-amber-300"
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
