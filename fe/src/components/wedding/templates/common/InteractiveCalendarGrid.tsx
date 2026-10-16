"use client";

import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { formatWeddingDate } from "@/lib/i18n/wedding-translator";

interface InteractiveCalendarGridProps {
  targetDate: string | Date;
  variant?: "glass" | "white-card" | "forest-card" | "minimal" | "burgundy-circle";
  monthLabel?: string;
  heartColor?: string;
}

export const InteractiveCalendarGrid: React.FC<InteractiveCalendarGridProps> = ({
  targetDate,
  variant = "white-card",
  monthLabel,
  heartColor = "#E11D48",
}) => {
  const { lang, t } = useLanguage();
  const d = new Date(targetDate);
  const validDate = isNaN(d.getTime()) ? new Date("2026-12-24T18:00:00Z") : d;
  
  const year = validDate.getFullYear();
  const month = validDate.getMonth(); // 0-indexed
  const dayOfMonth = validDate.getDate();

  // Days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // First day of month (0 = Sun, 1 = Mon...)
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust so Mon = 0, Sun = 6
  const startOffset = (firstDay + 6) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const dateDetails = formatWeddingDate(validDate, lang);
  const defaultMonthTitle =
    monthLabel ||
    (lang === "en"
      ? `${dateDetails.month} ${year}`
      : lang === "zh"
      ? `${year}年 ${month + 1}月`
      : `${t("monthPrefix") || "Tháng"} ${String(month + 1).padStart(2, "0")}.${year}`);

  const cornerLabel =
    lang === "en"
      ? `${dateDetails.monthShort} / ${year}`
      : lang === "zh"
      ? `良辰吉日 • ${year}`
      : `THÁNG ${month + 1} / ${year}`;

  const dayHeaders =
    lang === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : lang === "zh"
      ? ["一", "二", "三", "四", "五", "六", "日"]
      : [t("monShort") || "T2", t("tueShort") || "T3", t("wedShort") || "T4", t("thuShort") || "T5", t("friShort") || "T6", t("satShort") || "T7", t("sunShort") || "CN"];

  const isDark = variant === "forest-card" || variant === "glass";

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-all ${
        variant === "glass"
          ? "bg-black/35 backdrop-blur-md text-white border border-white/20 shadow-xl"
          : variant === "forest-card"
          ? "bg-[#3D4A34] text-white shadow-md border border-emerald-900/30"
          : variant === "burgundy-circle"
          ? "bg-white/90 backdrop-blur-sm text-stone-800 border border-rose-200/60 shadow-lg"
          : "bg-white text-stone-800 border border-[#EAE0D2] shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-3 border-b pb-2 border-current/15">
        <span className="text-xs sm:text-sm font-bold tracking-widest uppercase font-serif">
          {defaultMonthTitle}
        </span>
        <span className="text-[10px] sm:text-xs opacity-70 font-mono font-medium">
          {cornerLabel}
        </span>
      </div>

      {/* DAYS OF WEEK */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] sm:text-xs font-semibold opacity-60">
        {dayHeaders.map((dh, i) => (
          <span key={i}>{dh}</span>
        ))}
      </div>

      {/* DAYS NUMBERS */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs font-medium">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-7 sm:h-8" />;
          }

          const isWeddingDay = day === dayOfMonth;

          return (
            <div
              key={`day-${day}`}
              className={`h-7 sm:h-8 flex items-center justify-center relative rounded-full transition-transform ${
                isWeddingDay
                  ? "font-bold text-white scale-110 shadow-sm"
                  : "hover:bg-current/10"
              }`}
            >
              {isWeddingDay ? (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center relative text-white shadow-md cursor-pointer"
                  style={{ backgroundColor: heartColor }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1 -right-1"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white text-white drop-shadow" />
                  </motion.div>
                  <span className="relative z-10 text-xs font-bold">{day}</span>
                </motion.div>
              ) : (
                <span className={isDark ? "text-stone-100" : "text-stone-700"}>
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
