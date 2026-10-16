"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import {
  MapPin,
  Calendar,
  Navigation,
  Send,
  Heart,
  ChevronDown,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Gift,
  CheckCircle2,
  Loader2,
  Clock,
  Wine,
  Utensils,
  PartyPopper,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  getResolvedWeddingData,
  translateWeddingRole,
  translateEventName,
  translateVenueName,
  formatWeddingDate,
  formatLunarDate,
} from "@/lib/i18n/wedding-translator";

export const Template11SageGardenGlass: React.FC<WeddingTemplateProps> = ({
  card,
  data: initialData,
  primaryColor = "#3B523B",
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
  isPreview = false,
}) => {
  const { lang, t } = useLanguage();
  const data = getResolvedWeddingData(card, lang);

  // ── 1. DỮ LIỆU CÔ DÂU & CHÚ RỂ ──
  const groomName = data.groom?.fullName || (lang === "en" ? "Thanh Dat" : lang === "zh" ? "阮成达" : "Nguyễn Thành Đạt");
  const groomShort = data.groom?.shortName || groomName.split(" ").slice(-2).join(" ");
  const groomBirthOrder = translateWeddingRole(data.groom?.birthOrder || "Thứ Nam", lang);
  const groomFather = data.groom?.parents?.fatherName || (lang === "en" ? "Nguyen Quoc Binh" : lang === "zh" ? "阮国平" : "Nguyễn Quốc Bình");
  const groomMother = data.groom?.parents?.motherName || (lang === "en" ? "Tran Thu Hanh" : lang === "zh" ? "陈秋杏" : "Trần Thu Hạnh");
  const groomAddress =
    data.groom?.parents?.address ||
    data.groom?.address ||
    (lang === "en" ? "46 Quan Thanh, Ba Dinh, Hanoi" : lang === "zh" ? "河内市巴亭坊馆圣街46号" : "46 Quán Thánh, phường Ba Đình, Hà Nội");

  const brideName = data.bride?.fullName || (lang === "en" ? "Khanh Ly" : lang === "zh" ? "武庆梨" : "Vũ Khánh Ly");
  const brideShort = data.bride?.shortName || brideName.split(" ").slice(-2).join(" ");
  const brideBirthOrder = translateWeddingRole(data.bride?.birthOrder || "Út Nữ", lang);
  const brideFather = data.bride?.parents?.fatherName || (lang === "en" ? "Vu Van Hai" : lang === "zh" ? "武文海" : "Vũ Văn Hải");
  const brideMother = data.bride?.parents?.motherName || (lang === "en" ? "Pham Ngoc Lan" : lang === "zh" ? "范玉兰" : "Phạm Ngọc Lan");
  const brideAddress =
    data.bride?.parents?.address ||
    data.bride?.address ||
    (lang === "en" ? "82 Yen Phu, Tay Ho, Hanoi" : lang === "zh" ? "河内市安附路82号" : "82 Yên Phụ, phường Hồng Hà, Hà Nội");

  // ── 2. DỮ LIỆU SỰ KIỆN (LỄ THÀNH HÔN & TIỆC CƯỚI) ──
  const events = card.events && card.events.length > 0 ? card.events : [];
  const rawCeremony = events[0] || {
    eventName: "Lễ Thành Hôn",
    eventDate: new Date("2026-08-02T09:00:00Z"),
    lunarDate: "Tức ngày 20/06 năm Bính Ngọ âm lịch",
    venueName: "Tư Gia",
    address: groomAddress,
    mapUrl: "https://maps.google.com/?q=46+Quán+Thánh+Ba+Đình+Hà+Nội",
  };

  const rawParty = events[1] || events[0] || {
    eventName: "Tiệc Cưới",
    eventDate: new Date("2026-08-02T11:30:00Z"),
    lunarDate: "Tức ngày 20/06 năm Bính Ngọ âm lịch",
    venueName: "Khách sạn Pan Pacific Hà Nội",
    address: "Số 1 đường Thanh Niên, phường Ba Đình, Hà Nội",
    mapUrl: "https://maps.google.com/?q=Pan+Pacific+Hanoi+1+Thanh+Nien",
  };

  const eventCeremony = {
    ...rawCeremony,
    eventName: translateEventName(rawCeremony.eventName, lang),
    venueName: translateVenueName(rawCeremony.venueName, lang),
    lunarDate: formatLunarDate(rawCeremony.lunarDate, lang),
  };

  const eventParty = {
    ...rawParty,
    eventName: translateEventName(rawParty.eventName, lang),
    venueName: translateVenueName(rawParty.venueName, lang),
    lunarDate: formatLunarDate(rawParty.lunarDate, lang),
  };

  const ceremonyTime = formatWeddingDate(eventCeremony.eventDate, lang);
  const partyTime = formatWeddingDate(eventParty.eventDate, lang);

  // ── 3. ẢNH BÌA & ALBUM ẢNH (LƯỚI 4 ẢNH 2x2) ──
  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos?.find((p) => p.isCover)?.url ||
    card.photos?.[0]?.url ||
    "/images/demo/templates/t11-sage-garden/cover.jpg";

  const defaultPhotos = [
    coverPhoto,
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
  ];

  const photosList =
    card.photos && card.photos.length >= 4
      ? card.photos.map((p) => p.url)
      : defaultPhotos;

  // ── 4. LỊCH TRÌNH TIỆC CƯỚI (TIMELINE) ──
  const timelineEvents = data.timelineEvents && data.timelineEvents.length > 0
    ? data.timelineEvents
    : [
        { time: "17:30", title: "Đón khách", icon: "welcome" },
        { time: "18:30", title: "Khai tiệc", icon: "cake" },
        { time: "18:45", title: "Rót rượu, cắt bánh", icon: "champagne" },
        { time: "19:00", title: "Phục vụ món chính", icon: "dinner" },
        { time: "21:00", title: "Kết thúc tiệc", icon: "farewell" },
      ];

  // ── 5. SỔ LƯU BÚT ──
  const [guestNameInput, setGuestNameInput] = useState(guestName || "");
  const [wishInput, setWishInput] = useState("");
  const [wishes, setWishes] = useState<Array<{ id: string; name: string; content: string; createdAt: string }>>([
    {
      id: "w-1",
      name: "Thùy Linh & Gia đình",
      content: "Chúc hai bạn trăm năm hạnh phúc, luôn yêu thương và cùng nhau xây đắp mái ấm thật viên mãn!",
      createdAt: "Vừa xong",
    },
    {
      id: "w-2",
      name: "Tuấn Anh (Bạn thân)",
      content: "Chúc mừng Thành Đạt & Khánh Ly! Chúc tân lang tân nương đầu bạc răng long, mãi mãi hạnh phúc nhé!",
      createdAt: "10 phút trước",
    },
  ]);
  const [submittingWish, setSubmittingWish] = useState(false);
  const [wishSuccess, setWishSuccess] = useState(false);

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishInput.trim()) return;

    setSubmittingWish(true);
    const newWish = {
      id: `wish-${Date.now()}`,
      name: guestNameInput.trim() || "Khách mời quý mến",
      content: wishInput.trim(),
      createdAt: "Vừa xong",
    };

    try {
      if (!isPreview && card.id && !card.id.startsWith("demo-")) {
        await fetch(`/api/cards/${card.id}/wishes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: newWish.name,
            content: newWish.content,
          }),
        });
      }
    } catch {
      // ignore in demo
    }

    setWishes((prev) => [newWish, ...prev]);
    setWishInput("");
    setSubmittingWish(false);
    setWishSuccess(true);
    setTimeout(() => setWishSuccess(false), 4000);
  };

  // Helper xuất file lịch ICS
  const handleAddToCalendar = () => {
    const partyDate = new Date(eventParty.eventDate);
    const startDate = !isNaN(partyDate.getTime()) ? partyDate : new Date("2026-08-02T11:30:00");
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

    const formatIcsDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//WebsiteThiep//VN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@websitethiep.vn`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:Tiệc Cưới ${groomShort} & ${brideShort}`,
      `DESCRIPTION:Tham dự tiệc cưới của ${groomName} và ${brideName}. Chúc mừng tân lang tân nương!`,
      `LOCATION:${eventParty.venueName} - ${eventParty.address}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Tiec-Cuoi-${groomShort}-${brideShort}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Smooth scroll
  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#EAEFE8] text-[#203322] font-sans overflow-x-hidden selection:bg-[#C2D6C0]">
      {/* ── NỀN HOA BẠCH MẪU ĐƠN MÀU NƯỚC (WATERCOLOR BOTANICAL BACKGROUND) ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-top bg-no-repeat opacity-95 transition-all duration-700"
        style={{
          backgroundImage: "url('/images/templates/t11-sage-garden/hero-bg.jpg')",
        }}
      />
      {/* Soft overlay gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent via-white/10 to-[#E4ECE2]/80" />

      {/* ── FLOATING HEADER BUTTON: SỬ DỤNG THIỆP NÀY (CHO TRANG DEMO/PREVIEW) ── */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          href={`/dashboard/cards/create?template=wedding-sage-garden-glass`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D12B2B] hover:bg-[#B71F1F] text-white text-xs font-bold shadow-lg shadow-red-900/20 transition-all transform hover:scale-105 active:scale-95"
        >
          <span>{t("useThisTemplate") || "Sử dụng thiệp này"}</span>
          <span className="text-sm font-semibold">→</span>
        </Link>
      </div>

      {/* ── NỘI DUNG CHÍNH (CONTAINER DẠNG MOBILE-FIRST 480PX HOẶC TABLET NHƯ ẢNH MẪU) ── */}
      <div className="relative z-10 max-w-[460px] mx-auto min-h-screen px-4 py-6 space-y-8 pb-32">
        {/* ══════════════════════════════════════════════════════════════
            1. HERO: MÁI VÒM KÍNH MỜ CÙNG ẢNH CÔ DÂU CHÚ RỂ (FROSTED GLASS ARCH)
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="pt-14 pb-6 space-y-4 text-center"
        >
          {/* Vòm kính mờ chứa ảnh cưới chân dung */}
          <div
            onClick={() => onSelectPhoto(coverPhoto)}
            className="w-full max-w-[320px] mx-auto aspect-[3/4] rounded-t-[160px] rounded-b-[36px] overflow-hidden p-2 bg-white/45 backdrop-blur-md border border-white/70 shadow-[0_14px_40px_rgba(40,65,40,0.16)] cursor-pointer group relative"
          >
            <div className="relative w-full h-full rounded-t-[152px] rounded-b-[28px] overflow-hidden bg-stone-100">
              <motion.img
                src={coverPhoto}
                alt={`${groomShort} & ${brideShort}`}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md text-[#223522] text-[10px] font-medium shadow flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                <span>{t("tapToViewPhoto") || "Chạm để xem ảnh"}</span>
              </div>
            </div>
          </div>

          {/* Khung kính mờ tên cô dâu chú rể & ngày cưới */}
          <div className="w-full max-w-[340px] mx-auto rounded-[32px] bg-white/50 backdrop-blur-md border border-white/70 shadow-[0_8px_32px_rgba(40,65,40,0.1)] p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#DDE8DA]/30 pointer-events-none" />
            <p className="text-[10px] font-serif uppercase tracking-[0.28em] text-[#556D55] mb-2 font-medium">
              {t("saveOurDate") || "Save Our Date"}
            </p>
            <motion.h1
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-2xl sm:text-3xl font-serif tracking-[0.16em] uppercase text-[#2B402B] font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {groomShort}
            </motion.h1>
            <span className="my-1.5 inline-block font-serif italic text-lg text-[#587358]">&</span>
            <motion.h1
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-2xl sm:text-3xl font-serif tracking-[0.16em] uppercase text-[#2B402B] font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {brideShort}
            </motion.h1>
            <p className="mt-3 text-[10.5px] uppercase tracking-[0.25em] text-[#4A644A] font-medium">
              {eventParty.venueName} • {partyTime.year}
            </p>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            2. THÔNG TIN LỄ CƯỚI: KHUNG KÍNH MỜ 2 BÊN GIA ĐÌNH
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="rounded-[36px] bg-white/45 backdrop-blur-md border border-white/60 p-6 sm:p-7 shadow-[0_12px_36px_rgba(40,65,40,0.12)] text-center relative overflow-hidden"
        >
          {/* Section Title */}
          <h2
            className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-[0.14em] text-[#223522] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {data.invitationTitle || t("weddingInformationTitle") || "THÔNG TIN LỄ CƯỚI"}
          </h2>

          {/* 2 Cột Nhà Trai & Nhà Gái */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6">
            {/* Nhà Trai */}
            <div className="space-y-1">
              <p className="text-[#556D55] italic text-[11px]">{t("grandparentsTitle") || "Ông Bà"}</p>
              <p className="font-bold text-[#1C2C1C] text-sm leading-tight">{groomFather}</p>
              <p className="font-bold text-[#1C2C1C] text-sm leading-tight">{groomMother}</p>
              <p className="text-[10px] text-[#556D55] pt-1 leading-snug line-clamp-2">
                {groomAddress}
              </p>
            </div>

            {/* Nhà Gái */}
            <div className="space-y-1">
              <p className="text-[#556D55] italic text-[11px]">{t("grandparentsTitle") || "Ông Bà"}</p>
              <p className="font-bold text-[#1C2C1C] text-sm leading-tight">{brideFather}</p>
              <p className="font-bold text-[#1C2C1C] text-sm leading-tight">{brideMother}</p>
              <p className="text-[10px] text-[#556D55] pt-1 leading-snug line-clamp-2">
                {brideAddress}
              </p>
            </div>
          </div>

          <div className="w-16 h-px bg-[#4A644A]/30 mx-auto my-4" />

          {/* Lời Báo Tin */}
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#354D35] mb-4">
            {t("weddingInformationSubtitle") || "TRÂN TRỌNG BÁO TIN"}<br />
            {t("ceremonyHeldAt") || "LỄ THÀNH HÔN CỦA CON CHÚNG TÔI."}
          </p>

          {/* Tên Chú Rể & Cô Dâu */}
          <div className="space-y-2 mb-6">
            <div>
              <p
                className="text-xl sm:text-2xl font-serif font-bold text-[#203322]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {groomName}
              </p>
              <p className="text-[11px] italic text-[#556D55]">{groomBirthOrder}</p>
            </div>

            <div className="font-serif italic text-lg text-[#556D55]">&</div>

            <div>
              <p
                className="text-xl sm:text-2xl font-serif font-bold text-[#203322]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {brideName}
              </p>
              <p className="text-[11px] italic text-[#556D55]">{brideBirthOrder}</p>
            </div>
          </div>

          {/* Thông Tin Lễ Thành Hôn Tại Tư Gia */}
          <div className="bg-white/50 rounded-2xl p-4 border border-white/70 shadow-sm space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2D452D]">
              {eventCeremony.eventName || t("ceremonyHeldAt") || "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI"}
            </p>
            <p className="text-xs font-medium text-[#465E46] uppercase">
              {eventCeremony.venueName || "TƯ GIA"}
            </p>

            <div className="flex items-center justify-center gap-3 py-1 font-serif text-[#1C2C1C]">
              <span className="text-xs font-bold uppercase tracking-widest">{ceremonyTime.dayName}</span>
              <span className="text-2xl font-bold px-2 border-x border-[#384F38]/40">
                {ceremonyTime.day}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">
                {t("monthPrefix") || "THÁNG"} {ceremonyTime.month}
              </span>
            </div>

            <p className="text-sm font-serif font-bold text-[#1C2C1C]">
              {ceremonyTime.year}
            </p>
            <p className="text-[10px] italic text-[#556D55]">
              {eventCeremony.lunarDate || "TỨC NGÀY 20/06 NĂM BÍNH NGỌ ÂM LỊCH"}
            </p>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            3. ALBUM ẢNH CƯỚI: LƯỚI 2x2 CÓ OVERLAY "+4"
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="rounded-[36px] bg-white/45 backdrop-blur-md border border-white/60 p-6 shadow-[0_12px_36px_rgba(40,65,40,0.12)] text-center"
        >
          <h2
            className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-[0.14em] text-[#223522] mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("photoAlbumTitle") || "ALBUM ẢNH CƯỚI"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {photosList.slice(0, 4).map((photoUrl, idx) => {
              const isLast = idx === 3;
              const remainingCount = Math.max(photosList.length - 4, 4);

              return (
                <div
                  key={idx}
                  onClick={() => onSelectPhoto(photoUrl)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md cursor-pointer group transform hover:scale-[1.02] transition-all duration-300 border border-white/50"
                >
                  <Image
                    src={photoUrl}
                    alt={`Ảnh cưới ${idx + 1}`}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 220px"
                  />

                  {/* Overlay "+4" trên ảnh thứ 4 như mẫu */}
                  {isLast && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-2xl font-serif">
                      <span>+{remainingCount}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#556D55] italic mt-3">
            {t("touchToViewAlbum") || "(Chạm vào ảnh để xem toàn bộ album ảnh cưới)"}
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            4. THÔNG TIN TIỆC CƯỚI & TỜ LỊCH THÁNG 8 / 2026
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="rounded-[36px] bg-white/45 backdrop-blur-md border border-white/60 p-6 shadow-[0_12px_36px_rgba(40,65,40,0.12)] text-center relative overflow-hidden"
        >
          <h2
            className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-[0.14em] text-[#223522] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("receptionSchedule") || "THÔNG TIN TIỆC CƯỚI"}
          </h2>

          <p className="text-[11px] uppercase tracking-wider text-[#4A644A] font-semibold">
            {t("partyHeldAt") || "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:"}
          </p>

          <p className="text-3xl font-serif font-bold text-[#1C2C1C] my-1">
            {partyTime.time}
          </p>

          <p className="text-xs font-bold uppercase tracking-wider text-[#2D452D]">
            {partyTime.dayName} / {partyTime.day} / {t("monthPrefix") || "THÁNG"} {partyTime.month}
          </p>
          <p className="text-sm font-serif font-bold text-[#1C2C1C] mb-1">
            {partyTime.year}
          </p>
          <p className="text-[10px] italic text-[#556D55] mb-6">
            {eventParty.lunarDate || "TỨC NGÀY 20/06 NĂM BÍNH NGỌ ÂM LỊCH"}
          </p>

          {/* ── TỜ LỊCH THÁNG 8/2026 (WIDGET LỊCH) ── */}
          <div className="relative rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 p-5 shadow-sm max-w-[320px] mx-auto text-[#1F2F1F]">
            {/* Heart Icon top right */}
            <div className="absolute top-3 right-3 text-[#3B523B]">
              <Heart className="w-6 h-6 fill-[#3B523B] text-[#3B523B]" />
            </div>

            <h3 className="font-bold text-xs uppercase tracking-wider text-[#2E472E] mb-3 text-center">
              {t("monthPrefix") || "THÁNG"} {parseInt(partyTime.month, 10)} / {partyTime.year}
            </h3>

            {/* Thứ trong tuần */}
            <div className="grid grid-cols-7 text-[10px] font-bold text-[#556D55] mb-2 text-center">
              <span>{t("monShort") || "T2"}</span>
              <span>{t("tueShort") || "T3"}</span>
              <span>{t("wedShort") || "T4"}</span>
              <span>{t("thuShort") || "T5"}</span>
              <span>{t("friShort") || "T6"}</span>
              <span>{t("satShort") || "T7"}</span>
              <span className="text-[#3B523B]">{t("sunShort") || "CN"}</span>
            </div>

            {/* Các ngày trong tháng 8/2026 (Bắt đầu từ Thứ 7 ngày 1) */}
            <div className="grid grid-cols-7 gap-y-2 text-xs text-center font-medium">
              {/* Offset 5 ngày trống cho T2->T6 */}
              <span className="text-transparent">0</span>
              <span className="text-transparent">0</span>
              <span className="text-transparent">0</span>
              <span className="text-transparent">0</span>
              <span className="text-transparent">0</span>
              <span>1</span>

              {/* Ngày 2 khoanh tròn xanh rêu */}
              <div className="flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[#3B523B] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  2
                </div>
              </div>

              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>

              <span>10</span>
              <span>11</span>
              <span>12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>

              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
              <span>22</span>
              <span>23</span>

              <span>24</span>
              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
              <span>29</span>
              <span>30</span>

              <span>31</span>
            </div>
          </div>

          {/* Nút "Thêm vào lịch" */}
          <div className="mt-4">
            <button
              onClick={handleAddToCalendar}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full border border-[#3B523B] bg-white/40 hover:bg-[#3B523B] hover:text-white text-[#3B523B] text-xs font-semibold shadow-sm transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t("addToCalendarBtn") || "Thêm vào lịch"}</span>
            </button>
          </div>

          <div className="w-16 h-px bg-[#4A644A]/30 mx-auto my-6" />

          {/* Địa điểm tiệc cưới */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2D452D]">
              {t("partyHeldAt") || "TIỆC CƯỚI SẼ TỔ CHỨC TẠI"}
            </p>
            <p className="text-sm font-bold text-[#1C2C1C]">
              {eventParty.venueName}
            </p>
            <p className="text-xs text-[#556D55] max-w-[280px] mx-auto">
              {eventParty.address}
            </p>

            <div className="pt-3 flex justify-center gap-2">
              <a
                href={eventParty.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(eventParty.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#3B523B] text-white text-xs font-medium hover:bg-[#2F422F] shadow-sm transition-all"
              >
                <Navigation className="w-3 h-3" />
                <span>{t("directionsBtn") || "Chỉ đường"}</span>
              </a>
              <button
                onClick={onOpenRsvp}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-[#3B523B] text-[#3B523B] bg-white/50 text-xs font-medium hover:bg-white transition-all"
              >
                <span>{t("confirmAttendanceBtn") || "Xác nhận tham dự"}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            5. LỊCH TRÌNH TIỆC CƯỚI (TIMELINE SCHEDULE)
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="rounded-[36px] bg-white/45 backdrop-blur-md border border-white/60 p-6 shadow-[0_12px_36px_rgba(40,65,40,0.12)]"
        >
          <h2
            className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-[0.14em] text-[#223522] mb-6 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("receptionSchedule") || "LỊCH TRÌNH TIỆC CƯỚI"}
          </h2>

          <div className="space-y-4 max-w-[320px] mx-auto">
            {timelineEvents.map((item: { time: string; title: string; icon?: string }, idx: number) => {
              const getIcon = () => {
                if (item.icon === "welcome" || item.title.includes("khách")) return <Users className="w-4 h-4 text-[#3B523B]" />;
                if (item.icon === "cake" || item.title.includes("Khai tiệc")) return <Sparkles className="w-4 h-4 text-[#3B523B]" />;
                if (item.icon === "champagne" || item.title.includes("rượu")) return <Wine className="w-4 h-4 text-[#3B523B]" />;
                if (item.icon === "dinner" || item.title.includes("món")) return <Utensils className="w-4 h-4 text-[#3B523B]" />;
                return <PartyPopper className="w-4 h-4 text-[#3B523B]" />;
              };

              // Localize standard wedding timeline items
              const localizedTitle = (() => {
                const lower = item.title.toLowerCase();
                if (lower.includes("đón khách") || lower.includes("welcome")) return t("timelineWelcome") || item.title;
                if (lower.includes("khai tiệc") || lower.includes("ceremony") || lower.includes("opening")) return t("timelineCeremony") || item.title;
                if (lower.includes("rượu") || lower.includes("bánh") || lower.includes("champagne") || lower.includes("cake")) return t("timelineCake") || item.title;
                if (lower.includes("món") || lower.includes("tiệc") || lower.includes("dinner") || lower.includes("banquet")) return t("timelineDinner") || item.title;
                if (lower.includes("kết") || lower.includes("farewell") || lower.includes("chụp ảnh")) return t("timelineFarewell") || item.title;
                return item.title;
              })();

              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/70 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-full bg-[#E4EDE2] flex items-center justify-center shrink-0 shadow-inner">
                    {getIcon()}
                  </div>
                  <div className="flex-1 flex items-baseline justify-between">
                    <span className="font-serif font-bold text-sm text-[#203322]">
                      {localizedTitle}
                    </span>
                    <span className="font-bold text-xs text-[#3B523B] tracking-wider">
                      {item.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            6. SỔ LƯU BÚT (GUESTBOOK)
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="rounded-[36px] bg-white/45 backdrop-blur-md border border-white/60 p-6 shadow-[0_12px_36px_rgba(40,65,40,0.12)] text-center"
        >
          <h2
            className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-[0.14em] text-[#223522] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("homeWishesTitle") || "SỔ LƯU BÚT"}
          </h2>

          <p className="text-xs text-[#4A644A] mb-5">
            {t("homeWishesSub") || "Gửi những lời chúc phúc ngọt ngào nhất tới tân lang & tân nương!"}
          </p>

          <form onSubmit={handleSendWish} className="space-y-3 max-w-[340px] mx-auto text-left">
            <div>
              <input
                type="text"
                placeholder={t("guestbookFormName") || "Tên của bạn"}
                value={guestNameInput}
                onChange={(e) => setGuestNameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white/90 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#3B523B]"
              />
            </div>

            <div>
              <textarea
                rows={3}
                placeholder={t("sendWishInputPlaceholder") || "Lời chúc của bạn"}
                value={wishInput}
                onChange={(e) => setWishInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white/90 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#3B523B]"
              />
            </div>

            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={submittingWish || !wishInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full bg-[#3B523B] hover:bg-[#2C402C] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
              >
                {submittingWish ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("submitting") || "Đang gửi..."}</span>
                  </>
                ) : (
                  <span>{t("guestbookSubmitWish") || "GỬI LỜI CHÚC"}</span>
                )}
              </button>
            </div>

            {wishSuccess && (
              <p className="text-xs text-center text-emerald-700 font-medium pt-1">
                {t("copiedSuccessToast") ? `${t("copiedSuccessToast")} ✨` : "Cảm ơn bạn! Lời chúc của bạn đã được lưu lại thành công ✨"}
              </p>
            )}
          </form>

          {/* Danh sách lời chúc gần đây */}
          <div className="mt-6 pt-5 border-t border-white/60 space-y-2.5 text-left max-w-[340px] mx-auto">
            {wishes.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-xs"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-[#203322]">{w.name}</span>
                  <span className="text-[10px] text-[#718771]">{w.createdAt}</span>
                </div>
                <p className="text-xs text-[#3C523C] leading-relaxed">{w.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            7. HỘP QUÀ MỪNG: HỘP THỦY TINH TRONG SUỐT NƠ BẠC
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="rounded-[36px] bg-white/45 backdrop-blur-md border border-white/60 p-6 shadow-[0_12px_36px_rgba(40,65,40,0.12)] text-center relative overflow-hidden"
        >
          <h2
            className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-[0.14em] text-[#223522] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("giftBoxTitle") || "HỘP QUÀ MỪNG"}
          </h2>

          <p className="text-xs text-[#4A644A] max-w-[300px] mx-auto mb-4">
            {t("giftBoxSubtitle") || "Sự hiện diện và lời chúc phúc của quý khách là món quà quý giá nhất dành cho chúng tôi!"}
          </p>

          {/* Glass Gift Box 3D Art */}
          <div
            onClick={onOpenGift}
            className="relative w-56 h-56 mx-auto cursor-pointer group transform hover:scale-105 transition-all duration-300"
          >
            <Image
              src="/images/templates/t11-sage-garden/glass-gift-box.png"
              alt="Hộp quà mừng cưới thủy tinh"
              fill
              className="object-contain drop-shadow-xl"
              sizes="224px"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={onOpenGift}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#3B523B] hover:bg-[#2C402C] text-white text-xs font-bold shadow-md transition-all"
            >
              <Gift className="w-4 h-4" />
              <span>{t("sendGiftQrBtn") || "Gửi quà mừng cưới (Mở mã QR)"}</span>
            </button>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            8. LỜI CẢM ƠN (FAREWELL)
        ══════════════════════════════════════════════════════════════ */}
        <div className="text-center pt-8 pb-12 space-y-2">
          <p
            className="text-2xl font-serif italic text-[#3B523B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("thankYouTitle") || "Thank you!"}
          </p>
          <p className="text-xs text-[#556D55] uppercase tracking-widest font-medium">
            {groomShort} & {brideShort}
          </p>
        </div>
      </div>

      {/* ── FLOATING BUTTONS GÓC DƯỚI PHẢI (MÀU XANH RÊU NHƯ ẢNH MẪU) ── */}
      <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3">
        {/* Nút mũi tên xuống */}
        <button
          onClick={handleScrollDown}
          className="w-11 h-11 rounded-full bg-[#3E553E] hover:bg-[#2E422E] text-white flex items-center justify-center shadow-lg shadow-emerald-950/20 transition-all transform hover:scale-110 active:scale-95"
          title={t("scrollDownToDetails") || "Cuộn xuống tiếp"}
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Nút sóng âm / RSVP */}
        <button
          onClick={onOpenRsvp}
          className="w-11 h-11 rounded-full bg-[#3E553E] hover:bg-[#2E422E] text-white flex items-center justify-center shadow-lg shadow-emerald-950/20 transition-all transform hover:scale-110 active:scale-95"
          title={t("confirmAttendanceBtn") || "Xác nhận tham dự"}
        >
          <div className="flex items-center gap-0.5">
            <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
            <span className="w-0.5 h-4 bg-white rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-white rounded-full animate-pulse delay-150" />
            <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse delay-100" />
          </div>
        </button>
      </div>
    </div>
  );
};
