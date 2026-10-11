"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import {
  Heart,
  Calendar as CalendarIcon,
  MapPin,
  Navigation,
  Send,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Gift,
  CheckCircle2,
  Clock,
  Camera,
  Wine,
  PartyPopper,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import Image from "next/image";

export const Template12RoyalCrimson: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor = "#4A121A",
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
  isPreview = false,
}) => {
  // ── 1. DỮ LIỆU CÔ DÂU & CHÚ RỂ ──
  const groomName = data.groom?.fullName || "Đặng Hoàng Long";
  const groomShort = data.groom?.shortName || "Hoàng Long";
  const groomBirthOrder = data.groom?.birthOrder || "TRƯỞNG NAM";
  const groomFather = data.groom?.parents?.fatherName || "Đặng Văn Thắng";
  const groomMother = data.groom?.parents?.motherName || "Bùi Thị Mai";
  const groomAddress =
    data.groom?.parents?.address ||
    data.groom?.address ||
    "Quận 1, TP. Hồ Chí Minh";

  const brideName = data.bride?.fullName || "Vũ Bảo Ngọc";
  const brideShort = data.bride?.shortName || "Bảo Ngọc";
  const brideBirthOrder = data.bride?.birthOrder || "ÚT NỮ";
  const brideFather = data.bride?.parents?.fatherName || "Vũ Đức Trung";
  const brideMother = data.bride?.parents?.motherName || "Ngô Thị Hạnh";
  const brideAddress =
    data.bride?.parents?.address ||
    data.bride?.address ||
    "Quận 3, TP. Hồ Chí Minh";

  // ── 2. DỮ LIỆU SỰ KIỆN (LỄ THÀNH HÔN & TIỆC CƯỚI) ──
  const events = card.events && card.events.length > 0 ? card.events : [];
  const eventCeremony = events[0] || {
    eventName: "Lễ Thành Hôn",
    eventDate: new Date("2026-01-03T09:00:00Z"),
    lunarDate: "Tức ngày 15 tháng 11 năm Ất Tỵ",
    venueName: "Tư Gia",
    address: groomAddress,
    mapUrl: "https://maps.google.com/?q=Quận+1+TP+Hồ+Chí+Minh",
    welcomingTime: "08:30",
  };

  const eventReception = events[1] || events[0] || {
    eventName: "Tiệc Cưới",
    eventDate: new Date("2026-01-03T18:00:00Z"),
    lunarDate: "Tức ngày 15 tháng 11 năm Ất Tỵ",
    venueName: "Trung Tâm Hội Nghị White Palace",
    address: "194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh",
    mapUrl: "https://maps.google.com/?q=White+Palace+194+Hoàng+Văn+Thụ+Phú+Nhuận",
    welcomingTime: "17:30",
  };

  // Helper phân tích ngày giờ
  const parseDateDetails = (rawDate: string | Date) => {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) {
      return {
        dayName: "THỨ BẢY",
        day: "03",
        month: "01",
        year: "2026",
        time: "18:00",
        rawDate: d,
      };
    }
    const daysOfWeek = [
      "CHỦ NHẬT",
      "THỨ HAI",
      "THỨ BA",
      "THỨ TƯ",
      "THỨ NĂM",
      "THỨ SÁU",
      "THỨ BẢY",
    ];
    const dayName = daysOfWeek[d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return { dayName, day, month, year, time: `${hours}:${mins}`, rawDate: d };
  };

  const ceremonyTime = parseDateDetails(eventCeremony.eventDate);
  const receptionTime = parseDateDetails(eventReception.eventDate);

  // ── 3. DANH SÁCH ẢNH ALBUM ──
  const defaultPhotos = [
    "/images/demo/templates/t12-royal-crimson/cover.jpg",
    "/images/demo/templates/t12-royal-crimson/gallery-1.jpg",
    "/images/demo/templates/t12-royal-crimson/gallery-2.jpg",
    "/images/demo/templates/t12-royal-crimson/gallery-3.jpg",
    "/images/demo/templates/t12-royal-crimson/gallery-4.jpg",
    "/images/demo/templates/t12-royal-crimson/gallery-5.jpg",
    "/images/demo/templates/t12-royal-crimson/gallery-6.jpg",
  ];

  const photoList = useMemo(() => {
    if (card.photos && card.photos.length > 0) {
      return card.photos.map((p) => p.url);
    }
    return defaultPhotos;
  }, [card.photos]);

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos?.find((p) => p.isCover)?.url ||
    photoList[0];

  // ── 4. 3D COVERFLOW STATE ──
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const nextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % photoList.length);
  };

  const prevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  // ── 5. DRESS CODE ──
  const dressCode = (data as any).dressCode || {};
  const dressCodeTitle = dressCode.title || "DRESS CODE";
  const dressCodeDescription = dressCode.description || "Trang phục dự tiệc";
  const dressCodeColors: string[] =
    Array.isArray(dressCode.colors) && dressCode.colors.length > 0
      ? dressCode.colors
      : ["#4A121A", "#8F3B44", "#CCA24C", "#EFE8DE"];

  // ── 6. LỊCH TRÌNH NGÀY CƯỚI (TIMELINE) ──
  const rawTimeline = (data as any).timelineEvents;
  const timelineItems =
    Array.isArray(rawTimeline) && rawTimeline.length > 0
      ? rawTimeline
      : [
          { time: "17:00", title: "Đón khách", icon: "camera" },
          { time: "18:00", title: "Khai tiệc", icon: "cake" },
          { time: "18:30", title: "Nghi thức cưới", icon: "rings" },
          { time: "19:00", title: "Cắt bánh & nâng ly", icon: "toast" },
          { time: "20:30", title: "Kết thúc tiệc", icon: "heart" },
        ];

  // ── 7. LỜI CHÚC (GUESTBOOK) LOCAL STATE ──
  const [wishes, setWishes] = useState<
    Array<{ id: string; name: string; content: string; time: string }>
  >([
    {
      id: "w-1",
      name: "Minh Tuấn & Gia Đình",
      content: "Chúc hai bạn trăm năm hạnh phúc, răng long đầu bạc, vạn sự cát tường viên mãn!",
      time: "Vừa xong",
    },
    {
      id: "w-2",
      name: "Hội Bạn Thân",
      content: "Chúc Hoàng Long & Bảo Ngọc mãi ngọt ngào, yêu thương bền chặt như ngày đầu!",
      time: "1 giờ trước",
    },
  ]);
  const [wishName, setWishName] = useState(guestName || "");
  const [wishContent, setWishContent] = useState("");
  const [wishSuccess, setWishSuccess] = useState(false);

  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishContent.trim()) return;
    setWishes([
      {
        id: `wish-${Date.now()}`,
        name: wishName.trim(),
        content: wishContent.trim(),
        time: "Vừa xong",
      },
      ...wishes,
    ]);
    setWishContent("");
    setWishSuccess(true);
    setTimeout(() => setWishSuccess(false), 3500);
  };

  // ── 8. THÊM VÀO LỊCH (GOOGLE CALENDAR LINK) ──
  const googleCalendarUrl = useMemo(() => {
    const startDate = new Date(eventReception.eventDate);
    const startStr = isNaN(startDate.getTime())
      ? "20260103T110000Z"
      : startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
    const endStr = isNaN(endDate.getTime())
      ? "20260103T140000Z"
      : endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const title = encodeURIComponent(
      `Lễ Cưới: ${groomShort} & ${brideShort}`
    );
    const details = encodeURIComponent(
      `Trân trọng kính mời quý khách tham dự tiệc cưới của ${groomName} & ${brideName}.\nĐịa điểm: ${eventReception.venueName} - ${eventReception.address}`
    );
    const location = encodeURIComponent(
      `${eventReception.venueName}, ${eventReception.address}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  }, [eventReception, groomName, brideName, groomShort, brideShort]);

  // ── 9. MINI CALENDAR LOGIC CHO THÁNG 1 / 2026 ──
  const calendarDays = useMemo(() => {
    const days = [];
    // 2026-01-01 là Thứ Năm (T5) -> Trong tuần VN (T2=0, T3=1, T4=2, T5=3, T6=4, T7=5, CN=6), ngày 1 bắt đầu ở index 3
    // Cần 3 ô trống đầu tiên (T2, T3, T4)
    for (let i = 0; i < 3; i++) {
      days.push({ day: null, isWedding: false });
    }
    // Tháng 1 có 31 ngày
    const weddingDay = parseInt(receptionTime.day, 10) || 3;
    for (let d = 1; d <= 31; d++) {
      days.push({ day: d, isWedding: d === weddingDay });
    }
    return days;
  }, [receptionTime.day]);

  return (
    <div className="relative w-full min-h-screen bg-[#F6F1E8] text-[#2C1810] font-serif overflow-x-hidden select-none">
      {/* ── BACKGROUND ARCHITECTURAL ENGRAVING TEXTURE ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.06] bg-repeat"
        style={{
          backgroundImage: `radial-gradient(#4A121A 0.75px, transparent 0.75px), radial-gradient(#CCA24C 0.75px, #F6F1E8 0.75px)`,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 15px 15px",
        }}
      />
      {/* Classical European Palace watermark illustration in background */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.04] overflow-hidden">
        <svg
          viewBox="0 0 800 800"
          className="w-[1200px] h-[1200px] max-w-none text-[#4A121A] stroke-current fill-none stroke-[0.8]"
        >
          <circle cx="400" cy="400" r="380" strokeDasharray="6 6" />
          <circle cx="400" cy="400" r="320" />
          <path d="M 400 80 L 400 720 M 80 400 L 720 400" />
          <rect x="250" y="250" width="300" height="300" rx="40" />
          <path d="M 250 250 L 550 550 M 250 550 L 550 250" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[440px] mx-auto min-h-screen pb-24 shadow-2xl bg-[#F6F1E8]/80 backdrop-blur-[2px]">
        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 1: HERO - VINTAGE BURGUNDY ENVELOPE WITH POLAROID */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="pt-10 pb-8 px-6 text-center">
          {/* Header Tag */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-[#6E1C24] font-semibold">
              Save The Date
            </p>
          </motion.div>

          {/* Envelope with emerging polaroid & gold wax seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative w-full max-w-[340px] mx-auto aspect-[3/4] flex items-center justify-center my-2"
          >
            {/* Burgundy Envelope Back & Inside Pocket */}
            <div className="absolute inset-x-2 bottom-4 top-16 bg-[#4A121A] rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-end">
              {/* Envelope flap folds and velvet gradient */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#380910] via-[#4A121A] to-[#2B060C] opacity-90"
              />
              {/* Subtle velvet highlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_70%)]" />

              {/* Bottom V flap fold */}
              <div
                className="absolute inset-x-0 bottom-0 h-44 border-t border-[#6E1C24]/40"
                style={{
                  clipPath: "polygon(0 0, 50% 45%, 100% 0, 100% 100%, 0 100%)",
                  background:
                    "linear-gradient(180deg, #3C0A11 0%, #4A121A 60%, #2A050B 100%)",
                }}
              />
            </div>

            {/* Vintage peony floral branch tucked in envelope */}
            <div className="absolute -top-3 -left-2 z-10 w-28 h-40 pointer-events-none drop-shadow-md opacity-90">
              <svg viewBox="0 0 100 140" className="w-full h-full fill-none">
                {/* Burgundy Peonies illustration */}
                <path
                  d="M 20 80 Q 30 50 60 40 Q 80 50 70 80 Q 40 100 20 80 Z"
                  fill="#5A141E"
                />
                <circle cx="50" cy="60" r="16" fill="#801E2B" />
                <circle cx="48" cy="58" r="9" fill="#992635" />
                <circle cx="50" cy="56" r="4" fill="#CCA24C" />
                {/* Leaves */}
                <path
                  d="M 15 100 C 10 70 30 50 40 60 C 25 75 20 95 15 100 Z"
                  fill="#756A43"
                  opacity="0.85"
                />
                <path
                  d="M 65 35 C 80 20 95 30 85 45 C 75 40 68 35 65 35 Z"
                  fill="#8F8055"
                  opacity="0.85"
                />
                {/* Golden berry stems */}
                <circle cx="75" cy="20" r="3" fill="#CCA24C" />
                <circle cx="82" cy="16" r="2.5" fill="#CCA24C" />
                <circle cx="88" cy="24" r="2.5" fill="#CCA24C" />
                <path d="M 60 40 Q 75 25 85 20" stroke="#CCA24C" strokeWidth="1" />
              </svg>
            </div>

            {/* Couple Polaroid emerging from the envelope */}
            <motion.div
              initial={{ y: 20, rotate: -2 }}
              animate={{ y: -18, rotate: -2 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              onClick={() => onSelectPhoto?.(coverPhoto)}
              data-editable-field="cover-photo"
              data-editable-type="image"
              className="relative z-20 w-[78%] bg-[#FFFDF9] p-2.5 pb-7 rounded-sm shadow-[0_16px_36px_rgba(0,0,0,0.35)] cursor-pointer transform -rotate-2 hover:rotate-0 transition-transform duration-500"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 rounded-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPhoto}
                  alt={`${groomShort} & ${brideShort}`}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </motion.div>

            {/* Gold Wax Seal Stamp with Heart Monogram */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.9,
              }}
              className="absolute z-30 bottom-12 w-14 h-14 rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #F0D597 0%, #C99E4B 50%, #8A6424 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.5), 0 8px 18px rgba(45,8,12,0.45)",
              }}
            >
              <div className="w-11 h-11 rounded-full border border-[#7A551A]/60 flex items-center justify-center shadow-inner">
                <Heart className="w-5 h-5 text-[#6E4E16] fill-[#7A551A]/80 stroke-[1.5]" />
              </div>
            </motion.div>
          </motion.div>

          {/* Couple Names */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 mb-3 relative"
          >
            {/* Background calligraphic '&' watermark */}
            <span className="absolute left-1/2 -top-6 -translate-x-1/2 text-7xl font-serif italic text-[#4A121A]/10 pointer-events-none select-none">
              &
            </span>
            <h1
              data-editable-field="groom-short"
              data-editable-type="text"
              className="text-3xl md:text-4xl font-serif text-[#4A121A] tracking-wide font-normal leading-tight"
            >
              {groomShort}
            </h1>
            <p className="my-0.5 text-2xl font-serif italic text-[#8F3B44] font-light">
              &
            </p>
            <h2
              data-editable-field="bride-short"
              data-editable-type="text"
              className="text-3xl md:text-4xl font-serif text-[#4A121A] tracking-wide font-normal leading-tight"
            >
              {brideShort}
            </h2>
          </motion.div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 2: CEREMONY CARD (THÔNG TIN LỄ CƯỚI)             */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-[#4A121A] text-[#FFF9F2] rounded-[30px] p-6 md:p-8 shadow-[0_20px_45px_rgba(45,8,12,0.35)] overflow-hidden text-center border border-[#6E1C24]/50"
          >
            {/* Corner Peony Botanical Illustration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-44 pointer-events-none opacity-85 z-0">
              <svg viewBox="0 0 100 140" className="w-full h-full fill-none">
                <circle cx="65" cy="70" r="28" fill="#5A141E" />
                <circle cx="65" cy="70" r="20" fill="#751C27" />
                <circle cx="65" cy="70" r="12" fill="#912431" />
                <circle cx="65" cy="70" r="5" fill="#D4AF37" />
                <path
                  d="M 20 120 Q 50 90 70 95"
                  stroke="#8C7D52"
                  strokeWidth="2"
                />
                <circle cx="28" cy="112" r="3" fill="#D4AF37" />
                <circle cx="38" cy="102" r="3" fill="#D4AF37" />
              </svg>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header Title */}
              <h3 className="text-base uppercase tracking-[0.2em] font-serif font-bold text-[#FDF6ED] pb-1 border-b border-[#CCA24C]/30 inline-block">
                Thông Tin Lễ Cưới
              </h3>

              {/* Parents Information: 2 Columns */}
              <div className="grid grid-cols-2 gap-4 text-xs font-serif pt-1">
                {/* Groom's Parents */}
                <div className="border-r border-[#6E1C24]/80 pr-2">
                  <p className="text-[11px] text-[#D8B48D] italic font-light">
                    Ông Bà
                  </p>
                  <p
                    data-editable-field="groom-father"
                    data-editable-type="text"
                    className="font-bold text-sm text-[#FFFDF9] mt-0.5"
                  >
                    {groomFather}
                  </p>
                  <p
                    data-editable-field="groom-mother"
                    data-editable-type="text"
                    className="font-bold text-sm text-[#FFFDF9]"
                  >
                    {groomMother}
                  </p>
                  <p className="text-[11px] text-[#E0D0C5] mt-1 line-clamp-1 font-sans">
                    {groomAddress}
                  </p>
                </div>

                {/* Bride's Parents */}
                <div className="pl-2">
                  <p className="text-[11px] text-[#D8B48D] italic font-light">
                    Ông Bà
                  </p>
                  <p
                    data-editable-field="bride-father"
                    data-editable-type="text"
                    className="font-bold text-sm text-[#FFFDF9] mt-0.5"
                  >
                    {brideFather}
                  </p>
                  <p
                    data-editable-field="bride-mother"
                    data-editable-type="text"
                    className="font-bold text-sm text-[#FFFDF9]"
                  >
                    {brideMother}
                  </p>
                  <p className="text-[11px] text-[#E0D0C5] mt-1 line-clamp-1 font-sans">
                    {brideAddress}
                  </p>
                </div>
              </div>

              {/* Announcement */}
              <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.25em] text-[#EBD7BE] font-medium leading-relaxed">
                  Trân Trọng Báo Tin
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold mt-0.5">
                  Lễ Thành Hôn Của Con Chúng Tôi
                </p>
              </div>

              {/* Main Names */}
              <div className="space-y-1 py-1">
                <p
                  data-editable-field="groom-name"
                  data-editable-type="text"
                  className="text-2xl md:text-3xl font-serif text-[#FFFDF9] font-normal tracking-wide"
                >
                  {groomName}
                </p>
                <p
                  data-editable-field="groom-birth-order"
                  data-editable-type="text"
                  className="text-[10px] uppercase tracking-[0.3em] text-[#D8B48D]"
                >
                  {groomBirthOrder}
                </p>

                <p className="text-xl font-serif italic text-[#CCA24C] py-0.5 font-light">
                  &
                </p>

                <p
                  data-editable-field="bride-name"
                  data-editable-type="text"
                  className="text-2xl md:text-3xl font-serif text-[#FFFDF9] font-normal tracking-wide"
                >
                  {brideName}
                </p>
                <p
                  data-editable-field="bride-birth-order"
                  data-editable-type="text"
                  className="text-[10px] uppercase tracking-[0.3em] text-[#D8B48D]"
                >
                  {brideBirthOrder}
                </p>
              </div>

              {/* Ceremony Venue & Time Box */}
              <div className="pt-2 pb-1 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-[#F3E5D4] font-semibold">
                  Lễ Thành Hôn Được Cử Hành Tại Tư Gia
                </p>

                <div className="flex items-center justify-center gap-4 text-xs font-serif text-[#EBD7BE]">
                  <span>VÀO LÚC {ceremonyTime.time}</span>
                  <span className="w-1 h-1 rounded-full bg-[#CCA24C]" />
                  <span>{ceremonyTime.dayName}</span>
                </div>

                {/* Big Date Number Display */}
                <div className="flex items-center justify-center gap-4 my-2">
                  <span className="text-5xl font-serif font-light text-[#FFFDF9]">
                    {ceremonyTime.day}
                  </span>
                  <div className="w-[1px] h-10 bg-[#CCA24C]/40" />
                  <div className="text-left text-xs font-serif tracking-wider leading-snug text-[#F8EFE4]">
                    <p className="font-bold">THÁNG {ceremonyTime.month}</p>
                    <p className="text-stone-300 font-light">{ceremonyTime.year}</p>
                  </div>
                </div>

                {/* Lunar Date */}
                <p className="text-xs text-[#E3D1BE] italic font-light pt-1">
                  ({eventCeremony.lunarDate || "Tức ngày 15 tháng 11 năm Ất Tỵ"})
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 3: ALBUM ẢNH - 3D COVERFLOW CAROUSEL               */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="py-8 px-4 text-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <h3 className="text-base uppercase tracking-[0.3em] font-serif font-bold text-[#4A121A]">
              Album Ảnh
            </h3>
            <div className="w-10 h-[1.5px] bg-[#CCA24C] mx-auto mt-2" />
          </motion.div>

          {/* 3D Coverflow Container */}
          <div className="relative w-full py-4 flex items-center justify-center perspective-[1000px]">
            <div className="relative w-full max-w-[340px] h-[380px] flex items-center justify-center">
              {photoList.map((photoUrl, idx) => {
                const diff = (idx - activePhotoIdx + photoList.length) % photoList.length;
                let offset = diff;
                if (diff > photoList.length / 2) {
                  offset = diff - photoList.length;
                }

                // Show only active, left (-1), and right (+1)
                const isVisible = Math.abs(offset) <= 2;
                if (!isVisible) return null;

                const isActive = offset === 0;
                const xTranslate = offset * 140; // Horizontal shift
                const rotateY = offset * -28; // 3D rotation angle
                const scale = isActive ? 1 : 0.82;
                const opacity = isActive ? 1 : Math.abs(offset) === 1 ? 0.65 : 0.25;
                const zIndex = 30 - Math.abs(offset) * 10;

                return (
                  <motion.div
                    key={photoUrl + idx}
                    animate={{
                      x: xTranslate,
                      scale,
                      rotateY,
                      opacity,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 25 }}
                    onClick={() => {
                      if (isActive) {
                        onSelectPhoto?.(photoUrl);
                      } else {
                        setActivePhotoIdx(idx);
                      }
                    }}
                    style={{ zIndex }}
                    className={`absolute top-0 w-[220px] h-[340px] rounded-2xl overflow-hidden shadow-[0_18px_38px_rgba(0,0,0,0.3)] bg-white cursor-pointer select-none transition-shadow ${
                      isActive ? "ring-2 ring-[#CCA24C]/60" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`Kỷ niệm ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs text-[#4A121A] flex items-center justify-center shadow-md hover:bg-white transition cursor-pointer"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs text-[#4A121A] flex items-center justify-center shadow-md hover:bg-white transition cursor-pointer"
              title="Ảnh sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {photoList.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setActivePhotoIdx(dotIdx)}
                className={`transition-all rounded-full ${
                  dotIdx === activePhotoIdx
                    ? "w-6 h-1.5 bg-[#4A121A]"
                    : "w-1.5 h-1.5 bg-[#CCA24C]/40 hover:bg-[#CCA24C]"
                }`}
                aria-label={`Xem ảnh ${dotIdx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 4: RECEPTION CARD (THÔNG TIN TIỆC CƯỚI)           */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-[#4A121A] text-[#FFF9F2] rounded-[30px] p-6 md:p-8 shadow-[0_20px_45px_rgba(45,8,12,0.35)] overflow-hidden text-center border border-[#6E1C24]/50"
          >
            {/* Corner Peony Botanical Illustration */}
            <div className="absolute -top-6 -left-6 w-32 h-44 pointer-events-none opacity-85 z-0 transform rotate-180">
              <svg viewBox="0 0 100 140" className="w-full h-full fill-none">
                <circle cx="65" cy="70" r="28" fill="#5A141E" />
                <circle cx="65" cy="70" r="20" fill="#751C27" />
                <circle cx="65" cy="70" r="12" fill="#912431" />
                <circle cx="65" cy="70" r="5" fill="#D4AF37" />
              </svg>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header */}
              <h3 className="text-base uppercase tracking-[0.2em] font-serif font-bold text-[#FDF6ED] pb-1 border-b border-[#CCA24C]/30 inline-block">
                Thông Tin Tiệc Cưới
              </h3>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-[#EBD7BE] font-semibold">
                  Tiệc Cưới Sẽ Diễn Ra Vào Lúc:
                </p>

                <div className="flex items-center justify-center gap-4 text-xs font-serif text-[#EBD7BE]">
                  <span>{receptionTime.time}</span>
                  <span className="w-1 h-1 rounded-full bg-[#CCA24C]" />
                  <span>{receptionTime.dayName}</span>
                </div>

                {/* Big Date Display */}
                <div className="flex items-center justify-center gap-4 my-2">
                  <span className="text-5xl font-serif font-light text-[#FFFDF9]">
                    {receptionTime.day}
                  </span>
                  <div className="w-[1px] h-10 bg-[#CCA24C]/40" />
                  <div className="text-left text-xs font-serif tracking-wider leading-snug text-[#F8EFE4]">
                    <p className="font-bold">THÁNG {receptionTime.month}</p>
                    <p className="text-stone-300 font-light">{receptionTime.year}</p>
                  </div>
                </div>

                <p className="text-xs text-[#E3D1BE] italic font-light">
                  ({eventReception.lunarDate || "Tức ngày 15 tháng 11 năm Ất Tỵ"})
                </p>
              </div>

              {/* Welcoming and Banquet Times */}
              <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#6E1C24]/80 text-xs font-serif text-[#F3E5D4]">
                <div>
                  <p className="uppercase tracking-wider text-[10px] text-[#CCA24C] font-semibold">
                    Đón Khách
                  </p>
                  <p className="text-base font-bold text-[#FFFDF9] mt-0.5">
                    {eventReception.welcomingTime || "17:30"}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-wider text-[10px] text-[#CCA24C] font-semibold">
                    Khai Tiệc
                  </p>
                  <p className="text-base font-bold text-[#FFFDF9] mt-0.5">
                    {receptionTime.time || "18:00"}
                  </p>
                </div>
              </div>

              {/* ── EMBEDDED MINI CALENDAR CARD (LIGHT PARCHMENT) ── */}
              <div className="bg-[#FAF6EE] text-[#4A121A] rounded-2xl p-4.5 shadow-inner border border-[#E8DCB8]/60 my-4">
                <p className="font-serif italic text-lg text-[#5A141E] mb-2 font-medium">
                  Tháng {parseInt(receptionTime.month, 10)} / {receptionTime.year}
                </p>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 text-[11px] font-serif font-bold text-[#6E1C24] pb-2 border-b border-[#CCA24C]/30 mb-2">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                  <span>CN</span>
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-xs font-serif">
                  {calendarDays.map((dItem, cIdx) => (
                    <div
                      key={cIdx}
                      className="h-7 flex items-center justify-center"
                    >
                      {dItem.day ? (
                        dItem.isWedding ? (
                          <div className="w-7 h-7 rounded-full bg-[#4A121A] text-white font-bold flex items-center justify-center shadow-md relative">
                            <Heart className="w-6 h-6 text-[#4A121A] fill-[#4A121A] absolute inset-0 m-auto -z-10 opacity-90 scale-125" />
                            <span className="relative z-10 text-[11px] font-sans font-bold">
                              {dItem.day}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-700 font-light">
                            {dItem.day}
                          </span>
                        )
                      ) : (
                        <span className="opacity-0">-</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Calendar Link */}
              <div className="pt-1">
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-wider text-[#CCA24C] hover:text-[#E6C265] underline decoration-[#CCA24C]/60 underline-offset-4 font-semibold transition"
                >
                  Thêm vào lịch
                </a>
              </div>

              {/* RSVP CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenRsvp}
                  className="w-full py-3.5 px-6 rounded-full bg-[#FAF6EE] text-[#4A121A] hover:bg-white text-xs uppercase tracking-[0.25em] font-serif font-bold shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Xác Nhận Tham Dự
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 5: VENUE & GOOGLE MAPS                            */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="py-6 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-2 mb-5"
          >
            <h3 className="text-base uppercase tracking-[0.25em] font-serif font-bold text-[#4A121A]">
              Tiệc Cưới Sẽ Tổ Chức Tại
            </h3>
            <p className="text-sm font-serif font-bold text-stone-800">
              {eventReception.venueName}
            </p>
            <p className="text-xs text-stone-600 font-sans max-w-[320px] mx-auto leading-relaxed">
              {eventReception.address}
            </p>
          </motion.div>

          {/* Interactive Maps View Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-white"
          >
            {/* Map Preview or Embed */}
            <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
              <iframe
                title="Bản đồ địa điểm tiệc cưới"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  eventReception.venueName + " " + eventReception.address
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0 pointer-events-auto"
                loading="lazy"
              />

              {/* Open in Google Maps Quick Button */}
              <a
                href={
                  eventReception.mapUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    eventReception.venueName + " " + eventReception.address
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-semibold text-sky-700 shadow-md flex items-center gap-1.5 hover:bg-white transition"
              >
                <span>Mở trong Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Direct Directions Button */}
            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-center">
              <a
                href={
                  eventReception.mapUrl ||
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    eventReception.venueName + " " + eventReception.address
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-serif text-[#4A121A] font-bold flex items-center gap-1.5 hover:text-[#8F3B44] transition py-1"
              >
                <Navigation className="w-3.5 h-3.5 text-[#CCA24C]" />
                <span className="uppercase tracking-widest text-[11px]">
                  Chỉ đường tới tiệc cưới
                </span>
              </a>
            </div>
          </motion.div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 6: DRESS CODE                                     */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="py-6 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-1.5 mb-5"
          >
            <h3 className="text-base uppercase tracking-[0.3em] font-serif font-bold text-[#4A121A]">
              {dressCodeTitle}
            </h3>
            <p className="text-xs text-stone-600 font-serif italic">
              {dressCodeDescription}
            </p>
          </motion.div>

          {/* Color Swatches */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center justify-center gap-4 py-2"
          >
            {dressCodeColors.map((colorHex, sIdx) => (
              <div
                key={sIdx}
                className="w-12 h-12 rounded-full shadow-[0_6px_14px_rgba(0,0,0,0.18)] border-2 border-white/90 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: colorHex }}
                title={colorHex}
              />
            ))}
          </motion.div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 7: ITINERARY / TIMELINE (LỊCH TRÌNH NGÀY CƯỚI)     */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-[#4A121A] text-[#FFF9F2] rounded-[30px] p-6 md:p-8 shadow-[0_20px_45px_rgba(45,8,12,0.35)] overflow-hidden border border-[#6E1C24]/50"
          >
            {/* Corner Peonies Illustration on right */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-6 w-28 h-64 pointer-events-none opacity-85 z-0">
              <svg viewBox="0 0 100 180" className="w-full h-full fill-none">
                <circle cx="70" cy="50" r="24" fill="#5A141E" />
                <circle cx="70" cy="50" r="16" fill="#751C27" />
                <circle cx="70" cy="50" r="10" fill="#912431" />
                <circle cx="70" cy="120" r="26" fill="#5A141E" />
                <circle cx="70" cy="120" r="18" fill="#751C27" />
                <circle cx="70" cy="120" r="10" fill="#912431" />
                <circle cx="70" cy="120" r="4" fill="#D4AF37" />
                {/* Branches */}
                <path
                  d="M 20 20 Q 50 60 40 100 Q 60 140 20 170"
                  stroke="#8C7D52"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="relative z-10">
              {/* Heading */}
              <div className="text-center mb-8">
                <h3 className="text-base uppercase tracking-[0.2em] font-serif font-bold text-[#FDF6ED] pb-1 border-b border-[#CCA24C]/30 inline-block">
                  Lịch Trình Ngày Cưới
                </h3>
              </div>

              {/* Timeline Track */}
              <div className="relative max-w-[280px] mx-auto space-y-6">
                {/* Vertical Central Connecting Line */}
                <div className="absolute left-[88px] top-3 bottom-3 w-[1.5px] bg-[#CCA24C]/50" />

                {timelineItems.map((item, tIdx) => {
                  return (
                    <div
                      key={tIdx}
                      className="relative flex items-center gap-4 text-xs font-serif"
                    >
                      {/* Time (left column) */}
                      <span className="w-16 text-right font-bold text-[#FFFDF9] text-sm">
                        {item.time}
                      </span>

                      {/* Timeline Dot */}
                      <div className="relative z-10 w-3 h-3 rounded-full bg-[#FAF6EE] border-2 border-[#CCA24C] shadow-sm shrink-0" />

                      {/* Event Title (right column) */}
                      <div className="flex-1 flex items-center gap-2 text-[#EBD7BE] font-medium pl-1">
                        <span>{item.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 8: GUESTBOOK & WISHES (SỔ LƯU BÚT)                 */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="py-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-stone-200"
          >
            <div className="text-center mb-5">
              <h3 className="text-base uppercase tracking-[0.2em] font-serif font-bold text-[#4A121A]">
                Sổ Lưu Bút
              </h3>
              <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                Gửi lời chúc phúc ngọt ngào đến đôi uyên ương
              </p>
            </div>

            {/* Wish Form */}
            <form onSubmit={handleSubmitWish} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={wishName}
                  onChange={(e) => setWishName(e.target.value)}
                  placeholder="Tên của bạn..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 font-sans focus:outline-none focus:border-[#4A121A]"
                  required
                />
              </div>
              <div>
                <textarea
                  rows={3}
                  value={wishContent}
                  onChange={(e) => setWishContent(e.target.value)}
                  placeholder="Viết lời chúc mừng..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 font-sans focus:outline-none focus:border-[#4A121A] resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A121A] hover:bg-[#6E1C24] text-white text-xs font-serif font-semibold tracking-wider flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Lời Chúc Mừng</span>
              </button>
            </form>

            {wishSuccess && (
              <p className="text-xs text-emerald-600 font-sans text-center mt-2.5">
                ✓ Lời chúc của bạn đã được gửi thành công!
              </p>
            )}

            {/* Recent Wishes List */}
            {wishes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-3 max-h-48 overflow-y-auto">
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl bg-stone-50/80 border border-stone-100 text-xs font-sans text-left"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#4A121A] mb-1">
                      <span>{w.name}</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {w.time}
                      </span>
                    </div>
                    <p className="text-stone-700 text-xs leading-relaxed">
                      {w.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* SECTION 9: GIFT & BANKING QR TRIGGER                      */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="py-4 px-4 text-center">
          <button
            type="button"
            onClick={onOpenGift}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#4A121A] via-[#6E1C24] to-[#4A121A] text-[#FAF6EE] text-xs uppercase tracking-[0.2em] font-serif font-bold shadow-lg flex items-center justify-center gap-2.5 hover:opacity-95 transition cursor-pointer"
          >
            <Gift className="w-4 h-4 text-[#CCA24C]" />
            <span>Gửi Quà Mừng & Hộp Tiền Mừng Cưới</span>
          </button>
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/* FOOTER FAREWELL                                            */}
        {/* ────────────────────────────────────────────────────────── */}
        <footer className="pt-8 pb-12 text-center text-xs font-serif text-stone-500 space-y-1">
          <p
            data-editable-field="greeting"
            data-editable-type="text"
            className="italic text-stone-600 font-normal max-w-xs mx-auto px-4"
          >
            {card.greetingMessage || data.greeting || "“Cảm ơn bạn đã luôn hiện diện trong những khoảnh khắc hạnh phúc nhất của chúng tôi.”"}
          </p>
          <p className="font-bold tracking-widest uppercase text-[#4A121A] pt-1">
            {groomShort} & {brideShort}
          </p>
        </footer>

        {/* ────────────────────────────────────────────────────────── */}
        {/* FLOATING ACTION WIDGETS (BOTTOM RIGHT)                     */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-3">
          {/* Messenger / RSVP Trigger Widget */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onOpenRsvp}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF2B6D] to-[#FF6E9F] text-white shadow-xl flex items-center justify-center cursor-pointer"
            title="Xác nhận tham dự"
          >
            <MessageCircle className="w-6 h-6 fill-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
