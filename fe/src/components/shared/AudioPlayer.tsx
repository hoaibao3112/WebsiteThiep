"use client";

import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { Music, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  musicUrl?: string | null;
  autoPlay?: boolean;
}

const DEFAULT_WEDDING_SONG =
  "https://assets.mixkit.co/music/preview/mixkit-wedding-dreams-romantic-intro-1152.mp3";

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  musicUrl,
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    const url = musicUrl && musicUrl.trim() !== "" ? musicUrl : DEFAULT_WEDDING_SONG;

    soundRef.current = new Howl({
      src: [url],
      html5: true,
      loop: true,
      volume: 0.6,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
    });

    if (autoPlay) {
      soundRef.current.play();
    }

    return () => {
      soundRef.current?.unload();
    };
  }, [musicUrl, autoPlay]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-stone-900/80 backdrop-blur-md text-white shadow-xl border border-white/20 cursor-pointer focus:outline-none"
        title={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
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
          <Music className="w-5 h-5 text-amber-300" />
        </motion.div>

        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow-sm">
          {isPlaying ? (
            <Volume2 className="w-3 h-3 text-white" />
          ) : (
            <VolumeX className="w-3 h-3 text-white" />
          )}
        </div>
      </motion.button>
    </div>
  );
};
