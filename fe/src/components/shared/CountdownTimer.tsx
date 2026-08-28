"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CountdownTimerProps {
  targetDate: string | Date;
  title?: string;
  location?: string;
  primaryColor?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = "Lễ Cưới",
  location = "Việt Nam",
  primaryColor = "#D4AF37",
}) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const handleAddToGoogleCalendar = () => {
    const d = new Date(targetDate);
    const startTime = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(d.getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startTime}/${endTime}&location=${encodeURIComponent(
      location
    )}&details=${encodeURIComponent("Trân trọng kính mời quý khách tham dự!")}`;

    window.open(url, "_blank");
  };

  return (
    <div className="w-full my-8 text-center">
      <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">
        <Clock className="w-4 h-4" />
        <span>{t("countdownTitle")}</span>
      </div>

      {/* 4 Ô BỘ ĐẾM */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xs sm:max-w-sm mx-auto">
        {[
          { label: t("days"), value: timeLeft.days },
          { label: t("hours"), value: timeLeft.hours },
          { label: t("minutes"), value: timeLeft.minutes },
          { label: t("seconds"), value: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200/80 shadow-xs"
          >
            <span
              className="text-xl sm:text-2xl font-bold font-serif"
              style={{ color: primaryColor }}
            >
              {String(item.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-500 mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* NÚT THÊM VÀO LỊCH */}
      <div className="mt-4">
        <button
          onClick={handleAddToGoogleCalendar}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer border border-stone-200"
        >
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <span>{t("addToCalendar")}</span>
        </button>
      </div>
    </div>
  );
};
