"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar } from "lucide-react";

export type CountdownStyle =
  | "gold-elegant"
  | "boxes-terracotta"
  | "boxes-burgundy"
  | "boxes-forest"
  | "pure-lotus"
  | "cinematic-dark"
  | "alpine-lake"
  | "imperial-dragon";

interface CountdownUnitsProps {
  targetDate: string | Date;
  style?: CountdownStyle;
  showCalendarButton?: boolean;
}

export const CountdownUnits: React.FC<CountdownUnitsProps> = ({
  targetDate,
  style = "gold-elegant",
  showCalendarButton = true,
}) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const handleCalendar = () => {
    const d = new Date(targetDate);
    const startTime = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(d.getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lễ Cưới Trọng Đại&dates=${startTime}/${endTime}&details=Trân trọng kính mời quý khách đến tham dự hôn lễ!`;
    window.open(url, "_blank");
  };

  const units = [
    { label: t("days") || "Ngày", val: timeLeft.days },
    { label: t("hours") || "Giờ", val: timeLeft.hours },
    { label: t("minutes") || "Phút", val: timeLeft.minutes },
    { label: t("seconds") || "Giây", val: timeLeft.seconds },
  ];

  // 1. Boxes Terracotta (Mẫu 02 / Mẫu 03)
  if (style === "boxes-terracotta") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          {units.map((u, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#A84837] text-white shadow-sm"
            >
              <span className="text-base sm:text-lg font-bold leading-tight">
                {String(u.val).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider opacity-85 mt-0.5">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Boxes Burgundy (Mẫu 04 / Mẫu 07)
  if (style === "boxes-burgundy" || style === "cinematic-dark") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          {units.map((u, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#6B1724] text-white shadow-md border border-white/10"
            >
              <span className="text-base sm:text-lg font-bold leading-tight font-serif">
                {String(u.val).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider opacity-85 mt-0.5">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Boxes Forest (Mẫu 05)
  if (style === "boxes-forest") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          {units.map((u, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#3D4A34] text-white shadow-sm border border-emerald-900/30"
            >
              <span className="text-base sm:text-lg font-bold leading-tight font-sans">
                {String(u.val).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider opacity-85 mt-0.5">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Alpine Lake (Mẫu 08)
  if (style === "alpine-lake") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          {units.map((u, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#8A2424] text-white shadow-md"
            >
              <span className="text-base sm:text-lg font-bold leading-tight font-serif">
                {String(u.val).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider opacity-90 mt-0.5">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Imperial Dragon (Mẫu 09)
  if (style === "imperial-dragon") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          {units.map((u, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#4A1215] text-[#F4D080] border border-[#F4D080]/30 shadow-md"
            >
              <span className="text-base sm:text-lg font-bold leading-tight font-serif">
                {String(u.val).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-amber-200/80 mt-0.5">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Default Gold Elegant (Mẫu 01 / Mẫu 06)
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs sm:max-w-sm mx-auto">
        {units.map((u, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-white border border-[#E6D8C5] shadow-xs"
          >
            <span className="text-lg sm:text-2xl font-serif font-bold text-[#7A5636]">
              {String(u.val).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-[#9C795E] uppercase tracking-wider mt-0.5">
              {u.label}
            </span>
          </div>
        ))}
      </div>

      {showCalendarButton && (
        <button
          onClick={handleCalendar}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-full bg-white active:bg-[#FAF2E6] hover:bg-[#FAF6F0] text-[#7A5636] transition cursor-pointer border border-[#DFCEBA] shadow-2xs min-h-[36px]"
        >
          <Calendar className="w-3.5 h-3.5 text-[#BE944E]" />
          <span>{t("addToCalendar") || "Thêm vào Google Calendar"}</span>
        </button>
      )}
    </div>
  );
};
