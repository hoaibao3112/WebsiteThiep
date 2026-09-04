"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { Music, Volume2, VolumeX, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioPlayerProps {
  musicUrl?: string | null;
  autoPlay?: boolean;
  startOnGesture?: boolean;
}

const DEFAULT_WEDDING_SONG = "/music/le-duong.mp3";

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  musicUrl,
  autoPlay = true,
  startOnGesture = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const userGestureAttachedRef = useRef(false);

  const url = musicUrl && musicUrl.trim() !== "" ? musicUrl : DEFAULT_WEDDING_SONG;

  const playMusic = useCallback(() => {
    if (!soundRef.current) return;
    try {
      const playPromise = soundRef.current.play();
      // Nếu Howl trả về play ID và audio đã unlock
      if (soundRef.current.playing()) {
        setIsPlaying(true);
        setShowPrompt(false);
      }
    } catch {
      setIsPlaying(false);
    }
  }, []);

  const pauseMusic = useCallback(() => {
    if (!soundRef.current) return;
    try {
      soundRef.current.pause();
      setIsPlaying(false);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    try {
      soundRef.current = new Howl({
        src: [url],
        html5: true,
        loop: true,
        volume: 0.65,
        preload: true,
        onplay: () => {
          if (!isCancelled) {
            setIsPlaying(true);
            setShowPrompt(false);
          }
        },
        onpause: () => {
          if (!isCancelled) setIsPlaying(false);
        },
        onstop: () => {
          if (!isCancelled) setIsPlaying(false);
        },
        onloaderror: () => {
          if (!isCancelled) setIsPlaying(false);
        },
        onplayerror: () => {
          // Trình duyệt chặn autoplay âm thanh (Browser Autoplay Policy)
          if (!isCancelled) {
            setIsPlaying(false);
            setShowPrompt(true);
          }
        },
      });

      // Thử phát ngay lập tức nếu autoPlay = true
      if (autoPlay || startOnGesture) {
        try {
          const playId = soundRef.current.play();
          // Kiểm tra xem trình duyệt có chặn không
          if (soundRef.current.playing()) {
            setIsPlaying(true);
            setShowPrompt(false);
          }
        } catch {
          setIsPlaying(false);
          setShowPrompt(true);
        }
      }
    } catch {
      setIsPlaying(false);
      setShowPrompt(true);
    }

    // Global listener để tự động phát nhạc ngay khi người dùng tương tác lần đầu
    const handleFirstUserGesture = () => {
      setHasInteracted(true);
      setShowPrompt(false);
      if (soundRef.current && !soundRef.current.playing() && (autoPlay || startOnGesture)) {
        try {
          soundRef.current.play();
        } catch {
          // ignore
        }
      }
      removeGestureListeners();
    };

    const removeGestureListeners = () => {
      if (userGestureAttachedRef.current && typeof window !== "undefined") {
        window.removeEventListener("pointerdown", handleFirstUserGesture);
        window.removeEventListener("touchstart", handleFirstUserGesture);
        window.removeEventListener("touchend", handleFirstUserGesture);
        window.removeEventListener("click", handleFirstUserGesture);
        window.removeEventListener("scroll", handleFirstUserGesture);
        window.removeEventListener("keydown", handleFirstUserGesture);
        userGestureAttachedRef.current = false;
      }
    };

    if (autoPlay || startOnGesture) {
      if (typeof window !== "undefined") {
        window.addEventListener("pointerdown", handleFirstUserGesture, { once: true, passive: true });
        window.addEventListener("touchstart", handleFirstUserGesture, { once: true, passive: true });
        window.addEventListener("touchend", handleFirstUserGesture, { once: true, passive: true });
        window.addEventListener("click", handleFirstUserGesture, { once: true });
        window.addEventListener("scroll", handleFirstUserGesture, { once: true, passive: true });
        window.addEventListener("keydown", handleFirstUserGesture, { once: true });
        userGestureAttachedRef.current = true;
      }
    }

    return () => {
      isCancelled = true;
      removeGestureListeners();
      try {
        soundRef.current?.unload();
      } catch {
        // ignore
      }
    };
  }, [url, autoPlay, startOnGesture]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
      setShowPrompt(false);
    }
  };

  return (
    <div className="fixed bottom-[74px] sm:bottom-24 right-3.5 sm:right-4 z-40 flex items-center gap-2">
      {/* Tooltip mời bật nhạc nếu trình duyệt chặn autoplay ban đầu */}
      <AnimatePresence>
        {!isPlaying && showPrompt && (
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2A1D15]/95 border border-amber-400/50 shadow-lg text-amber-200 text-xs font-semibold backdrop-blur-md cursor-pointer hover:bg-[#3D2C1E] active:scale-95 transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Bật nhạc</span>
            <span className="text-[10px] text-amber-300/80">♫</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Nốt nhạc bay lượn sinh động khi đang phát */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.span
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], y: -36, x: -14, scale: 1.2 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0 }}
              className="absolute -top-1 left-2 text-amber-300 text-xs font-bold select-none drop-shadow"
            >
              ♪
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], y: -45, x: 12, scale: 1.4 }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: 1 }}
              className="absolute -top-2 right-1 text-rose-300 text-sm font-bold select-none drop-shadow"
            >
              ♫
            </motion.span>
          </div>
        )}

        <motion.button
          type="button"
          onClick={togglePlay}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white shadow-xl cursor-pointer focus:outline-none transition-all ${
            isPlaying
              ? "bg-[#3D2C1E]/95 backdrop-blur-md border border-amber-400/50 ring-2 ring-amber-400/20"
              : "bg-[#241A13]/90 backdrop-blur-md border border-white/30 animate-pulse hover:border-amber-400"
          }`}
          title={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
          aria-label={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
        >
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex items-center justify-center"
          >
            <Music className={`w-4 h-4 ${isPlaying ? "text-amber-300" : "text-stone-300"}`} />
          </motion.div>

          <div
            className={`absolute -top-0.5 -right-0.5 rounded-full p-0.5 shadow-sm transition-colors ${
              isPlaying ? "bg-[#BE944E]" : "bg-stone-600"
            }`}
          >
            {isPlaying ? (
              <Volume2 className="w-2.5 h-2.5 text-white" />
            ) : (
              <VolumeX className="w-2.5 h-2.5 text-stone-200" />
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
};
