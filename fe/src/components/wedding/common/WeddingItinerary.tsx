"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Camera,
  Heart,
  Sparkles,
  Music,
  Utensils,
  Wine,
  Download,
  Check,
} from "lucide-react";

export interface ItineraryItem {
  time: string;
  title: string;
  desc: string;
  iconName?: "camera" | "rings" | "wine" | "utensils" | "party";
}

interface WeddingItineraryProps {
  items?: ItineraryItem[];
  weddingDate?: Date;
  coupleNames?: string;
  venueName?: string;
  venueAddress?: string;
  accentColor?: string;
}

const DEFAULT_ITINERARY: ItineraryItem[] = [
  {
    time: "08:30",
    title: "Đón Tiếp & Check-in",
    desc: "Đón tiếp quan khách, chụp ảnh lưu niệm tại Backdrop hoa tươi và gửi lời chúc phúc.",
    iconName: "camera",
  },
  {
    time: "09:30",
    title: "Nghi Thức Thành Hôn",
    desc: "Cô dâu chú rể tiến vào lễ đường, trao nhẫn cưới và lời thề ước trăm năm.",
    iconName: "rings",
  },
  {
    time: "10:15",
    title: "Cắt Bánh & Rót Rượu",
    desc: "Nghi thức tháp sâm panh hạnh phúc, cắt bánh cưới và nâng ly cùng gia đình hai họ.",
    iconName: "wine",
  },
  {
    time: "10:45",
    title: "Khai Tiệc Mừng Cưới",
    desc: "Thưởng thức ẩm thực tiệc cưới đặc sắc và thưởng thức các tiết mục âm nhạc acoustic.",
    iconName: "utensils",
  },
  {
    time: "11:45",
    title: "Tung Hoa & After Party",
    desc: "Khoảnh khắc bắt hoa cưới may mắn và chụp ảnh kỷ niệm tự do cùng bạn bè thân thiết.",
    iconName: "party",
  },
];

export const WeddingItinerary: React.FC<WeddingItineraryProps> = ({
  items = DEFAULT_ITINERARY,
  weddingDate = new Date("2026-12-24T10:00:00Z"),
  coupleNames = "Cô Dâu & Chú Rể",
  venueName = "Trung Tâm Tiệc Cưới",
  venueAddress = "Hà Nội",
  accentColor = "#B84A39",
}) => {
  const [downloaded, setDownloaded] = useState(false);

  // Tạo file .ics để tải về Apple Calendar / Outlook
  const handleDownloadIcs = () => {
    const startDate = new Date(weddingDate);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 giờ sau

    const formatIcsDate = (d: Date) =>
      d
        .toISOString()
        .replace(/-|:|\.\d+/g, "")
        .slice(0, 15) + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NgayChungDoi//WeddingInvitation//VI",
      "BEGIN:VEVENT",
      `SUMMARY:Lễ Cưới ${coupleNames}`,
      `DESCRIPTION:Tham dự tiệc mừng lễ cưới của ${coupleNames} tại ${venueName}. Rất hân hạnh được đón tiếp!`,
      `LOCATION:${venueName}, ${venueAddress}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dam-cuoi-${coupleNames.replace(/\s+/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  // Mở Google Calendar trực tiếp
  const handleOpenGoogleCalendar = () => {
    const startDate = new Date(weddingDate);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

    const formatGDate = (d: Date) =>
      d
        .toISOString()
        .replace(/-|:|\.\d+/g, "")
        .slice(0, 15) + "Z";

    const title = encodeURIComponent(`Lễ Cưới: ${coupleNames}`);
    const details = encodeURIComponent(
      `Trân trọng kính mời quý khách đến tham dự Lễ Thành Hôn của ${coupleNames} tại ${venueName} (${venueAddress}).`
    );
    const location = encodeURIComponent(`${venueName}, ${venueAddress}`);
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(googleUrl, "_blank", "noopener,noreferrer");
  };

  const renderIcon = (type?: string) => {
    switch (type) {
      case "camera":
        return <Camera className="w-4 h-4" />;
      case "rings":
        return <Heart className="w-4 h-4" />;
      case "wine":
        return <Wine className="w-4 h-4" />;
      case "utensils":
        return <Utensils className="w-4 h-4" />;
      case "party":
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="py-6 px-4 space-y-6 text-center">
      <div className="space-y-1">
        <span
          className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold block"
          style={{ color: accentColor }}
        >
          WEDDING PROGRAM
        </span>
        <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-stone-900">
          Lịch Trình Tiệc Cưới
        </h3>
        <p className="text-xs text-stone-500 italic max-w-xs mx-auto">
          Thời gian dự kiến các nghi thức và hoạt động chung vui trong ngày trọng đại
        </p>
      </div>

      <div className="max-w-sm mx-auto space-y-3 text-left">
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs hover:shadow-xs transition backdrop-blur-xs"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {renderIcon(it.iconName)}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-800 truncate">
                  {it.title}
                </h4>
                <span
                  className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0"
                  style={{
                    backgroundColor: `${accentColor}10`,
                    color: accentColor,
                  }}
                >
                  {it.time}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed italic">
                {it.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Nút lưu vào lịch điện thoại (Google Calendar & iCal) */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-xs mx-auto">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleOpenGoogleCalendar}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-sans shadow-sm flex items-center justify-center gap-1.5 transition text-white cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Thêm vào Google Lịch</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleDownloadIcs}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-sans shadow-2xs flex items-center justify-center gap-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition cursor-pointer"
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Đã lưu tệp iCal</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Tải file Apple / iCal</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
