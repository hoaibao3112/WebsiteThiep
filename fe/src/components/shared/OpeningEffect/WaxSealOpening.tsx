"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface WaxSealOpeningProps {
  primaryColor?: string;
  title: string;
  subtitle?: string;
  guestName?: string;
  guest?: { salutation?: string; fullName: string };
  monogram?: string;
  isVipExperience?: boolean;
  onOpenStart?: () => void;
  onOpened: () => void;
}

export const WaxSealOpening: React.FC<WaxSealOpeningProps> = ({
  primaryColor = "#D4AF37",
  title,
  subtitle,
  guestName,
  guest,
  monogram,
  isVipExperience = false,
  onOpenStart,
  onOpened,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, []);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    onOpenStart?.();

    try {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
      );
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    timerRef.current = window.setTimeout(() => {
      onOpened();
    }, reducedMotion ? 180 : 1400);
  };

  const displayGuest = guest ? `${guest.salutation ? `${guest.salutation} ` : ""}${guest.fullName}` : guestName;
  const displayMonogram = monogram || "♥";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/95 backdrop-blur-md p-4"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: reducedMotion ? 0.18 : 0.8 }}
      >
        {/* Nút đổi ngôn ngữ ở góc trên màn hình */}
        <div className="absolute top-6 right-6 z-50">
          <LanguageSwitcher />
        </div>

        <div className="relative w-full max-w-sm aspect-[4/5] perspective-1000">
          <motion.div
            className="relative w-full h-full bg-[#fdfbf7] rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col justify-between p-6 text-center select-none"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header phong bì */}
            <div className="pt-4">
              <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">
                {subtitle || t("cordiallyInvites")}
              </span>
          {displayGuest ? (
                <div className={`mt-2 inline-block px-4 py-1.5 rounded-full border border-amber-200/60 shadow-xs ${isVipExperience ? "bg-amber-50" : "bg-stone-50"}`}>
                  <p className="text-sm font-semibold text-amber-900">
                    {isVipExperience ? "Trân trọng kính mời" : t("invitationTo")}: {displayGuest}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Tiêu đề thiệp */}
            <div className="my-auto py-6">
              <h1
                className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 tracking-tight leading-snug"
                style={{ color: primaryColor }}
              >
                {title}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-3 text-stone-400">
                <div className="h-px w-8 bg-stone-300" />
                <Heart className="w-4 h-4 fill-stone-300 text-stone-300" />
                <div className="h-px w-8 bg-stone-300" />
              </div>
            </div>

            {/* CON DẤU SÁP */}
            <div className="pb-6 flex flex-col items-center">
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative group cursor-pointer focus:outline-none"
              >
                <motion.div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-full opacity-70 blur-sm motion-reduce:hidden"
                  style={{ backgroundColor: primaryColor }}
                  animate={reducedMotion ? undefined : {
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div
                  className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl border-2 border-white/40"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow:
                      "inset 0 2px 4px rgba(255,255,255,0.4), 0 8px 16px rgba(0,0,0,0.25)",
                  }}
                >
                  {isVipExperience ? <span className="text-xl font-serif tracking-widest" aria-label={`Con dấu ${displayMonogram}`}>{displayMonogram}</span> : <Sparkles className="w-6 h-6 animate-pulse mb-0.5" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {t("openCard")}
                  </span>
                </div>
              </motion.button>
              <p className="text-xs text-stone-400 mt-3 motion-reduce:animate-none">
                {t("tapToOpen")}
              </p>
              {isVipExperience && <button type="button" onClick={() => setReducedMotion((value) => !value)} className="mt-2 text-[11px] text-stone-500 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600">{reducedMotion ? "Bật chuyển động" : "Giảm chuyển động"}</button>}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
