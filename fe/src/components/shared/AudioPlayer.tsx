"use client";

import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { Music, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  musicUrl?: string | null;
  autoPlay?: boolean;
  startOnGesture?: boolean;
}

const DEFAULT_WEDDING_SONG = "/music/le-duong.mp3";

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  musicUrl,
  autoPlay = false,
  startOnGesture = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    const url = musicUrl && musicUrl.trim() !== "" ? musicUrl : DEFAULT_WEDDING_SONG;

    try {
      soundRef.current = new Howl({
        src: [url],
        html5: true,
        loop: true,
        volume: 0.6,
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        onloaderror: () => {
          setIsPlaying(false);
        },
        onplayerror: () => {
          soundRef.current?.once("unlock", () => {
            soundRef.current?.play();
          });
          setIsPlaying(false);
        },
      });

      if (autoPlay || startOnGesture) {
        try {
          soundRef.current.play();
        } catch {
          setIsPlaying(false);
        }
      }
    } catch {
      setIsPlaying(false);
    }

    return () => {
      try {
        soundRef.current?.unload();
      } catch {
        // ignore
      }
    };
  }, [musicUrl, autoPlay, startOnGesture]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed bottom-[74px] sm:bottom-24 right-3.5 sm:right-4 z-40">
      <motion.button
        type="button"
        onClick={togglePlay}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3D2C1E]/85 backdrop-blur-md text-white shadow-xl border border-white/25 cursor-pointer focus:outline-none active:scale-90 transition-transform"
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
          <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
        </motion.div>

        <div className="absolute -top-0.5 -right-0.5 bg-[#BE944E] rounded-full p-0.5 shadow-sm">
          {isPlaying ? (
            <Volume2 className="w-2.5 h-2.5 text-white" />
          ) : (
            <VolumeX className="w-2.5 h-2.5 text-white" />
          )}
        </div>
      </motion.button>
    </div>
  );
};
