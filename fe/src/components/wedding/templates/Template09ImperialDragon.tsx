"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import {
  CountdownUnits,
  InteractiveCalendarGrid,
  LoveStoryTimeline,
  WeddingItinerary,
  DressCodeSection,
  PhotoGalleryLightbox,
  HeartBurstButton,
  QuickWishWall,
} from "./common";
import {
  MapPin,
  Navigation,
  UserCheck,
  Gift,
  Heart,
  Calendar,
  Sparkles,
  QrCode,
  Copy,
  Check,
  Clock,
  Wine,
  Camera,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { MarqueeRibbon } from "../effects/MotionElements";
import { useLanguage } from "@/context/LanguageContext";
import {
  getResolvedWeddingData,
  translateWeddingRole,
  translateEventName,
  translateVenueName,
  formatWeddingDate,
  formatLunarDate,
} from "@/lib/i18n/wedding-translator";

export const Template09ImperialDragon: React.FC<WeddingTemplateProps> = ({
  card,
  data: rawData,
  primaryColor = "#6E1719",
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
  isPreview = false,
}) => {
  const { lang } = useLanguage();
  const data = getResolvedWeddingData(card, lang);

  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedBank(key);
      setTimeout(() => setCopiedBank(null), 2500);
    }
  };

  // 1. DỮ LIỆU CÔ DÂU & CHÚ RỂ
  const groomName = data.groom?.fullName || "Trịnh Quốc Bảo";
  const groomShort = data.groom?.shortName || "Quốc Bảo";
  const groomBirthOrder = translateWeddingRole(data.groom?.birthOrder || "Trưởng nam", lang);
  const groomFather = data.groom?.parents?.fatherName || "Trịnh Đình Khang";
  const groomMother = data.groom?.parents?.motherName || "Nguyễn Thị Thu Hà";
  const groomAddress = data.groom?.parents?.address || "10 Lê Lợi, Phường Đề Thám, TP. Thái Bình";
  const groomAvatar = data.groom?.avatarUrl || "/images/demo/templates/t09-dragon/groom.jpg";
  const groomStory = data.groom?.story || "Chàng trai đĩnh đạc, ấm áp, luôn là điểm tựa vững chãi nhất cho tình yêu của đôi mình.";

  const brideName = data.bride?.fullName || "Nguyễn Ngọc Mai";
  const brideShort = data.bride?.shortName || "Ngọc Mai";
  const brideBirthOrder = translateWeddingRole(data.bride?.birthOrder || "Trưởng nữ", lang);
  const brideFather = data.bride?.parents?.fatherName || "Nguyễn Văn Hùng";
  const brideMother = data.bride?.parents?.motherName || "Phạm Thúy Hằng";
  const brideAddress = data.bride?.parents?.address || "128 Nguyễn Trãi, Phường 2, TP. Thái Bình";
  const brideAvatar = data.bride?.avatarUrl || "/images/demo/templates/t09-dragon/bride.jpg";
  const brideStory = data.bride?.story || "Cô gái dịu dàng, nết na, nụ cười rạng rỡ luôn thắp sáng mỗi bước đi trên hành trình hạnh phúc.";

  // 2. DỮ LIỆU SỰ KIỆN (2 EVENTS)
  const events = (card.events && card.events.length > 0 ? card.events : (data.events && data.events.length > 0 ? data.events : []));
  const mainEvent = events[0] || {
    id: "ev-main",
    eventName: "Lễ Thành Hôn & Rước Dâu",
    eventDate: new Date("2026-11-29T09:00:00Z"),
    lunarDate: "Ngày 10 Tháng 10 Năm Bính Ngọ",
    venueName: "Tư Gia Nhà Trai",
    address: groomAddress,
    mapUrl: "https://maps.google.com/?q=10+Lê+Lợi+Thái+Bình",
    welcomingTime: "08:30",
  };

  const partyEvent = events[1] || events[0] || {
    id: "ev-party",
    eventName: "Tiệc Cưới Mừng Hỷ",
    eventDate: new Date("2026-11-29T17:30:00Z"),
    lunarDate: "Ngày 10 Tháng 10 Năm Bính Ngọ",
    venueName: "Diamond Palace Hoàng Gia",
    address: "Số 458 Phố Lý Bôn, Phường Đề Thám, TP. Thái Bình",
    mapUrl: "https://maps.google.com/?q=458+Lý+Bôn+Thái+Bình",
    welcomingTime: "17:00",
  };

  const targetDate = partyEvent.eventDate ? new Date(partyEvent.eventDate) : new Date("2026-11-29T17:30:00Z");

  // 3. DANH SÁCH ẢNH ALBUM MẪU
  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos?.[0]?.url ||
    "/images/demo/templates/t09-dragon/cover.jpg";

  const defaultGalleryPhotos = useMemo(() => [
    { url: "/images/demo/templates/t09-dragon/cover.jpg", caption: "Long Phụng Sum Vầy — Khoảnh khắc sánh bước kiêu hãnh" },
    { url: "/images/demo/templates/t09-dragon/gallery-1.jpg", caption: "Uyên ương giao bôi, trọn lời nguyện ước trăm năm" },
    { url: "/images/demo/templates/t09-dragon/gallery-2.jpg", caption: "Ánh nhìn đắm say ngập tràn hạnh phúc" },
    { url: "/images/demo/templates/t09-dragon/gallery-3.jpg", caption: "Nụ cười rạng rỡ ngày đại lễ vu quy" },
    { url: "/images/demo/templates/t09-dragon/gallery-4.jpg", caption: "Cô dâu thanh tú kiêu sa trong tà áo cưới truyền thống" },
    { url: "/images/demo/templates/t09-dragon/gallery-5.jpg", caption: "Nắm chặt tay nhau đi qua ngàn giông bão cuộc đời" },
    { url: "/images/demo/templates/t09-dragon/gallery-6.jpg", caption: "Sắc son gấm đỏ, hòa khúc ca loan phụng sum vầy" },
    { url: "/images/demo/templates/t09-dragon/gallery-7.jpg", caption: "Kỷ vật tình yêu trao tay thiêng liêng" },
    { url: "/images/demo/templates/t09-dragon/gallery-8.jpg", caption: "Phút giây lắng đọng bình yên bên bờ hạnh phúc" },
    { url: "/images/demo/templates/t09-dragon/gallery-9.jpg", caption: "Tình nồng thắm thiết kết mối tơ duyên ngàn đời" },
    { url: "/images/demo/templates/t09-dragon/gallery-10.jpg", caption: "Vẹn tròn duyên kiếp, trăm năm viên mãn cát tường" },
  ], []);

  const galleryPhotos = useMemo(() => {
    if (card.photos && card.photos.length >= 6) {
      return card.photos.map((p) => ({ url: p.url, caption: p.caption || "Hạnh phúc trăm năm" }));
    }
    return defaultGalleryPhotos;
  }, [card.photos, defaultGalleryPhotos]);

  return (
    <div className="relative min-h-screen bg-[#38090C] text-[#FFF4D4] font-serif pb-28 sm:pb-32 overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#38090C]">
      {/* Background gấm hoàng gia & hoa văn chìm */}
      <div className="fixed inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#D4AF37_1.2px,transparent_1.2px)] [background-size:24px_24px] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(45deg,#1A0305_25%,transparent_25%,transparent_75%,#1A0305_75%,#1A0305),linear-gradient(45deg,#1A0305_25%,transparent_25%,transparent_75%,#1A0305_75%,#1A0305)] [background-size:32px_32px] [background-position:0_0,16px_16px] z-0" />

      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-gradient-to-b from-[#561013] via-[#480B0E] to-[#2B0507] shadow-[0_30px_100px_rgba(0,0,0,0.95)] sm:border-x-2 border-[#D4AF37]/50 relative z-10 text-center space-y-9">

        {/* ── 1. HERO COVER HOÀNG GIA: LONG PHỤNG SUM VẦY & ẢNH ĐÔI UYÊN ƯƠNG ── */}
        <section className="pt-10 px-5 space-y-4 relative overflow-hidden">
          {/* Huy hiệu rồng phượng dập nổi */}
          <div className="flex items-center justify-center gap-2 text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase font-sans font-semibold">
            <span>❖</span>
            <span>ĐẠI HỶ HOÀNG TRIỀU · CÁT TƯỜNG NHƯ Ý</span>
            <span>❖</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-1.5"
          >
            <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#F3CD74]/80 font-medium block">
              {data.heroSubtitle || "THE WEDDING OF"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-200 tracking-wider drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
              {groomShort} &amp; {brideShort}
            </h1>
          </motion.div>

          {/* KHUNG VÒM HOÀNG GIA CHỨA ẢNH BÌA ĐÔI UYÊN ƯƠNG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative mx-auto max-w-xs sm:max-w-sm pt-2"
          >
            {/* Viền ngoài kép thếp vàng */}
            <div className="relative rounded-t-[140px] rounded-b-2xl p-2.5 bg-gradient-to-b from-[#E5C365] via-[#946F19] to-[#D4AF37] shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-[#FFF0B3]">
              <div className="relative rounded-t-[132px] rounded-b-xl overflow-hidden aspect-[3/4] bg-[#2A0507]">
                <img
                  src={coverPhoto}
                  alt={`${groomShort} & ${brideShort}`}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  onClick={() => onSelectPhoto?.(coverPhoto)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#200305]/80 via-transparent to-black/20 pointer-events-none" />

                {/* Chữ Song Hỷ (囍) dát vàng góc dưới ảnh */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className="size-12 rounded-full bg-[#78171C]/90 border-2 border-[#F3CD74] shadow-lg flex items-center justify-center text-2xl font-bold text-[#F3CD74]">
                    囍
                  </div>
                </div>
              </div>

              {/* Họa tiết hoa văn 4 góc */}
              <div className="absolute -top-1 -left-1 size-5 border-t-2 border-l-2 border-[#FFE599]" />
              <div className="absolute -top-1 -right-1 size-5 border-t-2 border-r-2 border-[#FFE599]" />
              <div className="absolute -bottom-1 -left-1 size-5 border-b-2 border-l-2 border-[#FFE599]" />
              <div className="absolute -bottom-1 -right-1 size-5 border-b-2 border-r-2 border-[#FFE599]" />
            </div>

            {/* Chim Phượng hoàng cánh vàng uốn lượn bên góc phải */}
            <div className="absolute -right-3 -top-3 w-16 h-16 pointer-events-none text-[#F3CD74] opacity-90 drop-shadow-md">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 C60 25 75 40 100 50 C75 60 60 75 50 100 C40 75 25 60 0 50 C25 40 40 25 50 0 Z" />
              </svg>
            </div>
          </motion.div>

          {/* LỜI MỜI DANH DỰ CÁ NHÂN HÓA */}
          <div className="bg-[#2D0609]/80 backdrop-blur-xs p-3.5 rounded-2xl border border-[#D4AF37]/35 shadow-inner max-w-sm mx-auto space-y-1">
            <span className="text-[10px] uppercase font-sans font-semibold tracking-[0.25em] text-[#F3CD74] block">
              TRÂN TRỌNG KÍNH MỜI
            </span>
            <p className="text-base sm:text-lg font-serif italic font-bold text-amber-100">
              {guestName || "Quý khách cùng người thương"}
            </p>
            <p className="text-[11px] text-amber-200/70 font-sans tracking-wide pt-0.5">
              Đến tham dự buổi tiệc chung vui cùng gia đình chúng tôi
            </p>
          </div>

          {/* CÂU TRÍCH DẪN TRIẾT LÝ TÌNH YÊU */}
          <div className="px-3 pt-1">
            <p className="text-xs sm:text-[13px] text-amber-200/85 italic leading-relaxed max-w-sm mx-auto">
              {card.greetingMessage || data.greeting || "“Hạnh phúc không nằm ở nơi ta đến, mà ở từng bước ta sánh vai bên nhau trên suốt chặng đường trăm năm.”"}
            </p>
          </div>
        </section>

        {/* MARQUEE GẤM HOÀNG GIA CHẠY CHỮ VÀNG */}
        <MarqueeRibbon
          text={`LONG PHỤNG SUM VẦY • ${groomName.toUpperCase()} & ${brideName.toUpperCase()} • 29.11.2026 • KÍNH BÁO ĐẠI HỶ`}
          bgClass="bg-[#260406] border-y border-[#D4AF37]/45 text-[#F3CD74]"
        />

        {/* ── 2. CỔNG SONG HỶ 3D & GIÁ VẼ HOA CƯỚI (CONCEPT GỐC NÂNG TẦM) ── */}
        <section className="px-5 relative">
          <div className="relative max-w-sm mx-auto bg-gradient-to-b from-[#661316] to-[#3E090C] p-5 rounded-3xl border-2 border-[#D4AF37]/60 shadow-[0_15px_45px_rgba(0,0,0,0.7)]">
            <div className="relative z-10 text-center">
              {/* Cổng 3D Song Hỷ khổng lồ mạ vàng cát ruột đỏ đô */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-56 sm:w-60 h-44 sm:h-48 mx-auto rounded-3xl bg-gradient-to-tr from-[#78171A] via-[#941D21] to-[#550E12] border-4 border-[#F3CD74] shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_2px_10px_rgba(255,255,255,0.2)] flex items-center justify-center text-8xl sm:text-9xl font-bold text-[#FFF3D1] select-none relative"
              >
                <span className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">囍</span>
                {/* Hoa văn góc cung đình */}
                <div className="absolute top-2 left-2 size-3 border-t-2 border-l-2 border-[#F3CD74]" />
                <div className="absolute top-2 right-2 size-3 border-t-2 border-r-2 border-[#F3CD74]" />
                <div className="absolute bottom-2 left-2 size-3 border-b-2 border-l-2 border-[#F3CD74]" />
                <div className="absolute bottom-2 right-2 size-3 border-b-2 border-r-2 border-[#F3CD74]" />
              </motion.div>

              {/* Giá vẽ hoa cưới đặt cạnh cổng (Easel Stand) */}
              <div className="absolute top-24 left-1 sm:left-3 w-28 p-2.5 rounded-xl bg-[#FFFDF9] shadow-2xl border-2 border-[#D4AF37] text-center text-[9px] text-stone-800 rotate-[-9deg] z-30">
                <div className="size-6 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#78171C] mb-1">
                  <Wine className="size-3.5" />
                </div>
                <span className="font-serif font-bold block text-[8.5px] text-[#78171C] uppercase tracking-wider">
                  Lễ Thành Hôn
                </span>
                <span className="font-serif text-[9px] text-stone-700 block mt-0.5 font-bold">
                  {groomShort} &amp; {brideShort}
                </span>
                <span className="text-[7.5px] text-stone-500 block font-sans font-medium mt-0.5">
                  29.11.2026
                </span>
              </div>
            </div>

            <div className="pt-6 pb-1">
              <span className="text-3xl sm:text-4xl font-serif italic text-[#F3CD74] tracking-wider block font-light">
                Save The Date
              </span>
              <p className="text-[11px] text-amber-100/75 font-sans mt-1">
                Kính mời quý quan khách cùng lưu lại ngày trọng đại
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. CHÂN DUNG & GIỚI THIỆU CÔ DÂU & CHÚ RỂ (SPOTLIGHT CARDS) ── */}
        <section className="px-5 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              UYÊN ƯƠNG GIAO BÔI
            </span>
            <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide">
              CHÚ RỂ &amp; CÔ DÂU
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm sm:max-w-md mx-auto">
            {/* THẺ CHÚ RỂ QUỐC BẢO */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-gradient-to-b from-[#4A0E12] to-[#320709] p-4 rounded-3xl border border-[#D4AF37]/40 shadow-xl space-y-3 text-center"
            >
              <div className="relative size-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#D4AF37] to-[#FFF0B3] shadow-md">
                <div className="size-full rounded-full overflow-hidden bg-stone-900">
                  <img
                    src={groomAvatar}
                    alt={groomName}
                    className="size-full object-cover object-top hover:scale-110 transition-transform duration-500"
                    onClick={() => onSelectPhoto?.(groomAvatar)}
                  />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#78171C] border border-[#F3CD74] text-[9.5px] font-bold text-amber-200 whitespace-nowrap">
                  {groomBirthOrder}
                </div>
              </div>

              <div className="space-y-0.5 pt-1">
                <h3 className="font-serif font-bold text-lg text-amber-100">{groomName}</h3>
                <p className="text-[10px] text-amber-300/80 font-sans">{groomAddress}</p>
              </div>

              <p className="text-[11px] font-serif italic text-amber-100/75 leading-relaxed px-1">
                “{groomStory}”
              </p>
            </motion.div>

            {/* THẺ CÔ DÂU NGỌC MAI */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-gradient-to-b from-[#4A0E12] to-[#320709] p-4 rounded-3xl border border-[#D4AF37]/40 shadow-xl space-y-3 text-center"
            >
              <div className="relative size-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#D4AF37] to-[#FFF0B3] shadow-md">
                <div className="size-full rounded-full overflow-hidden bg-stone-900">
                  <img
                    src={brideAvatar}
                    alt={brideName}
                    className="size-full object-cover object-top hover:scale-110 transition-transform duration-500"
                    onClick={() => onSelectPhoto?.(brideAvatar)}
                  />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#78171C] border border-[#F3CD74] text-[9.5px] font-bold text-amber-200 whitespace-nowrap">
                  {brideBirthOrder}
                </div>
              </div>

              <div className="space-y-0.5 pt-1">
                <h3 className="font-serif font-bold text-lg text-amber-100">{brideName}</h3>
                <p className="text-[10px] text-amber-300/80 font-sans">{brideAddress}</p>
              </div>

              <p className="text-[11px] font-serif italic text-amber-100/75 leading-relaxed px-1">
                “{brideStory}”
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 4. THÔNG TIN HAI HỌ & PHỤ MẪU (NHÀ TRAI & NHÀ GÁI) ── */}
        <section className="px-6 space-y-4">
          <div className="bg-black/30 p-5 rounded-3xl border border-[#D4AF37]/35 shadow-inner">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#F3CD74] block mb-3 font-semibold">
              KÍNH BÁO LỄ THÀNH HÔN HAI GIA ĐÌNH
            </span>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans relative">
              {/* Vạch ngăn cách & con dấu Song Hỷ mini */}
              <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex flex-col items-center justify-between pointer-events-none">
                <div className="w-[1px] flex-1 bg-[#D4AF37]/30" />
                <div className="my-1 size-6 rounded-full bg-[#561013] border border-[#F3CD74] flex items-center justify-center text-[#F3CD74] text-[10px] font-bold">
                  囍
                </div>
                <div className="w-[1px] flex-1 bg-[#D4AF37]/30" />
              </div>

              {/* NHÀ TRAI */}
              <div className="space-y-1 pr-3 text-right">
                <span className="font-serif font-bold text-[#F3CD74] block text-xs tracking-wider border-b border-amber-500/30 pb-1">
                  NHÀ TRAI
                </span>
                <p className="text-[10px] text-amber-200/70">(Thân Phụ &amp; Thân Mẫu)</p>
                <p className="font-semibold text-white pt-0.5">{groomFather}</p>
                <p className="font-semibold text-white">{groomMother}</p>
                <p className="text-[9.5px] text-amber-200/60 leading-tight pt-1">{groomAddress}</p>
              </div>

              {/* NHÀ GÁI */}
              <div className="space-y-1 pl-3 text-left">
                <span className="font-serif font-bold text-[#F3CD74] block text-xs tracking-wider border-b border-amber-500/30 pb-1">
                  NHÀ GÁI
                </span>
                <p className="text-[10px] text-amber-200/70">(Thân Phụ &amp; Thân Mẫu)</p>
                <p className="font-semibold text-white pt-0.5">{brideFather}</p>
                <p className="font-semibold text-white">{brideMother}</p>
                <p className="text-[9.5px] text-amber-200/60 leading-tight pt-1">{brideAddress}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. ĐỒNG HỒ ĐẾM NGƯỢC & LỊCH THÁNG CÁT TƯỜNG (COUNTDOWN & CALENDAR) ── */}
        <section className="px-5 space-y-4">
          <div className="bg-gradient-to-b from-[#4F0F12] to-[#36080A] p-5 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#F3CD74] block font-bold">
                CÙNG ĐẾM NGƯỢC ĐẾN NGÀY CHUNG ĐÔI
              </span>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                CHỦ NHẬT, 29 THÁNG 11 NĂM 2026
              </h3>
              <p className="text-xs text-amber-300/80 font-serif italic">
                (Tức Ngày 10 Tháng 10 Năm Bính Ngọ Cát Tường)
              </p>
            </div>

            {/* Khối đếm ngược mạ vàng */}
            <CountdownUnits targetDate={targetDate} style="gold-elegant" showCalendarButton={true} />

            {/* Lịch tháng tương tác */}
            <div className="pt-2">
              <InteractiveCalendarGrid
                targetDate={targetDate}
                variant="burgundy-circle"
                heartColor="#D4AF37"
              />
            </div>
          </div>
        </section>

        {/* ── 6. CHI TIẾT 2 SỰ KIỆN: HÔN LỄ TƯ GIA & TIỆC CƯỚI TRỌNG THỂ ── */}
        <section className="px-5 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              THỜI GIAN &amp; ĐỊA ĐIỂM
            </span>
            <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide">
              CHI TIẾT SỰ KIỆN
            </h2>
          </div>

          <div className="space-y-4">
            {/* SỰ KIỆN 1: HÔN LỄ TƯ GIA (LỄ THÀNH HÔN) */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#2D0609]/90 p-5 rounded-3xl border border-[#D4AF37]/40 shadow-lg text-left space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-2.5">
                <div className="space-y-0.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#78171C] border border-[#F3CD74] text-[9px] font-bold text-amber-200 uppercase">
                    NGHI LỄ GIA TIÊN · TƯ GIA
                  </span>
                  <h3 className="font-serif font-bold text-lg text-amber-100 pt-1">
                    {mainEvent.eventName || "Lễ Thành Hôn & Rước Dâu"}
                  </h3>
                </div>
                <div className="size-11 rounded-2xl bg-[#561013] border border-[#F3CD74] flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[9px] font-mono font-bold text-amber-300">THỨ 7</span>
                  <span className="text-sm font-bold text-amber-100 leading-none">28</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-amber-100/90 font-sans">
                <div className="flex items-center gap-2 text-[#F3CD74]">
                  <Clock className="size-4 shrink-0" />
                  <span className="font-semibold">Đón khách: {mainEvent.welcomingTime || "08:30"} · Làm lễ: 09:00</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 text-[#F3CD74] mt-0.5" />
                  <div>
                    <p className="font-bold text-white font-serif">{mainEvent.venueName || "TƯ GIA NHÀ TRAI"}</p>
                    <p className="text-[11px] text-amber-200/70 pt-0.5">{mainEvent.address}</p>
                  </div>
                </div>
              </div>

              <a
                href={mainEvent.mapUrl || "https://maps.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#561013] hover:bg-[#78171C] border border-[#D4AF37]/60 text-xs font-bold text-amber-200 transition shadow-sm"
              >
                <Navigation className="size-3.5 text-[#F3CD74]" />
                <span>Chỉ đường trên Google Maps (Tư Gia)</span>
              </a>
            </motion.div>

            {/* SỰ KIỆN 2: TIỆC CƯỚI MỪNG HỶ (DIAMOND PALACE) */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#2D0609]/90 p-5 rounded-3xl border border-[#D4AF37]/40 shadow-lg text-left space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-2.5">
                <div className="space-y-0.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-[#2D0609] text-[9px] font-bold uppercase tracking-wider">
                    DẠ TIỆC HOÀNG GIA
                  </span>
                  <h3 className="font-serif font-bold text-lg text-amber-100 pt-1">
                    {partyEvent.eventName || "Tiệc Cưới Mừng Hỷ"}
                  </h3>
                </div>
                <div className="size-11 rounded-2xl bg-[#561013] border border-[#F3CD74] flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[9px] font-mono font-bold text-amber-300">CHỦ NHẬT</span>
                  <span className="text-sm font-bold text-amber-100 leading-none">29</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-amber-100/90 font-sans">
                <div className="flex items-center gap-2 text-[#F3CD74]">
                  <Clock className="size-4 shrink-0" />
                  <span className="font-semibold">Đón khách: {partyEvent.welcomingTime || "17:00"} · Khai tiệc: 17:30</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 text-[#F3CD74] mt-0.5" />
                  <div>
                    <p className="font-bold text-white font-serif">{partyEvent.venueName || "Diamond Palace Hoàng Gia"}</p>
                    <p className="text-[11px] text-amber-200/70 pt-0.5">{partyEvent.address}</p>
                  </div>
                </div>
              </div>

              <a
                href={partyEvent.mapUrl || "https://maps.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3D1] to-[#AA8222] text-[#38090C] hover:opacity-95 text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                <Navigation className="size-3.5 text-[#38090C]" />
                <span>Xem Chỉ Đường Google Maps (Trung Tâm Tiệc Cưới)</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── 7. LỊCH TRÌNH TIỆC CƯỚI HOÀNG GIA (ITINERARY) ── */}
        <section className="bg-[#2B0507]/90 py-2 border-y border-[#D4AF37]/40">
          <WeddingItinerary
            accentColor="#D4AF37"
            weddingDate={targetDate}
            coupleNames={`${groomShort} & ${brideShort}`}
            venueName={partyEvent.venueName || "Diamond Palace Hoàng Gia"}
            venueAddress={partyEvent.address || "458 Lý Bôn, TP. Thái Bình"}
          />
        </section>

        {/* ── 8. HÀNH TRÌNH TÌNH YÊU (LOVE STORY TIMELINE) ── */}
        <section className="bg-[#480B0E]/80 border-b border-[#D4AF37]/40 py-2">
          <LoveStoryTimeline
            accentColor="#D4AF37"
            variant="imperial"
            onSelectPhoto={onSelectPhoto}
          />
        </section>

        {/* ── 9. GỢI Ý TRANG PHỤC DẠ TIỆC HOÀNG GIA (DRESS CODE) ── */}
        <section className="px-5">
          <DressCodeSection
            accentColor="#D4AF37"
            dressCodeTitle="Gợi Ý Trang Phục Dạ Tiệc Cát Tường"
            swatches={[
              { name: "Đỏ Đô Cung Đình", hex: "#78171C", textColor: "#FFFFFF" },
              { name: "Vàng Hoàng Kim", hex: "#D4AF37", textColor: "#35080A" },
              { name: "Champagne / Kem", hex: "#F5EAD4", textColor: "#35080A" },
              { name: "Đen Quyền Quý", hex: "#1C1917", textColor: "#FFFFFF" },
            ]}
            note="Để không gian tiệc cưới thêm phần trang trọng và gắn kết, kính mong quý khách ưu tiên trang phục tông màu Đỏ Đô, Hoàng Kim hoặc Tone Trầm Sang Trọng."
          />
        </section>

        {/* ── 10. ĐẠI TUYỂN TẬP ALBUM ẢNH CƯỚI (PHOTO GALLERY 10+ IMAGES) ── */}
        <section className="px-4 space-y-4">
          <PhotoGalleryLightbox
            photos={galleryPhotos}
            accentColor="#D4AF37"
            title="Đại Tuyển Tập Album Cưới"
            subtitle="Khoảnh khắc đại hỷ ngập tràn son sắc, hạnh phúc và vẹn tròn trăm năm"
          />
        </section>

        {/* ── 11. HỘP MỪNG CƯỚI 2 THẺ VIETQR VÀNG CÁT ĐỘC LẬP (GIFT REGISTRY) ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="px-5 py-6 space-y-5 bg-[#2A0507]/90 rounded-3xl mx-4 border-2 border-[#D4AF37]/50 shadow-2xl relative"
        >
          <div className="space-y-1 text-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              HỘP MỪNG CƯỚI
            </span>
            <h3 className="text-xl font-serif font-bold text-amber-100 tracking-wide">
              CHÚC PHÚC &amp; MỪNG CƯỚI
            </h3>
            <p className="text-xs text-amber-200/70 font-sans">
              Mừng cưới tiện lợi và nhanh chóng qua mã chuyển khoản VietQR
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* THẺ CHÚ RỂ QUỐC BẢO */}
            <div className="bg-[#FFFDF9] text-[#4A0E10] p-4 rounded-2xl border-2 border-[#E8CCA2] shadow-xl text-center space-y-2 relative">
              <div className="inline-block px-3 py-0.5 rounded-full bg-red-100 text-[#78171C] text-[10px] font-bold uppercase tracking-wider">
                CHÚ RỂ · {groomShort}
              </div>

              {/* QR Image / VietQR */}
              <div
                className="size-36 mx-auto rounded-xl bg-[#F5E6CC] border border-[#D4AF37]/70 flex flex-col items-center justify-center p-2 shadow-inner cursor-pointer group"
                onClick={onOpenGift}
              >
                <img
                  src={`https://img.vietqr.io/image/${card.bankingPrimary?.bankCode || "MB"}-${card.bankingPrimary?.accountNumber || "6666888899"}-compact.png?amount=0&addInfo=MungCuoi+QuocBao&accountName=${encodeURIComponent(card.bankingPrimary?.accountName || "TRINH QUOC BAO")}`}
                  alt="QR Chú Rể"
                  className="size-full object-contain rounded-md"
                  onError={(e) => {
                    // Fallback to QR icon if VietQR image fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <QrCode className="size-16 text-[#6E1719] hidden" />
              </div>

              <div className="text-xs space-y-0.5 text-stone-800 font-sans">
                <p className="font-bold text-[#6E1719] font-serif text-[13px]">{card.bankingPrimary?.accountName || "TRINH QUOC BAO"}</p>
                <p className="font-mono text-sm font-bold text-stone-900">{card.bankingPrimary?.accountNumber || "6666888899"}</p>
                <p className="text-[11px] text-stone-600 font-medium">Ngân hàng: {card.bankingPrimary?.bankCode || "MB Bank"}</p>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(card.bankingPrimary?.accountNumber || "6666888899", "groom")}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#6E1719] hover:bg-[#8B1E2D] text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              >
                {copiedBank === "groom" ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Đã sao chép STK!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-amber-300" />
                    <span>Sao chép số tài khoản</span>
                  </>
                )}
              </button>
            </div>

            {/* THẺ CÔ DÂU NGỌC MAI */}
            <div className="bg-[#FFFDF9] text-[#4A0E10] p-4 rounded-2xl border-2 border-[#E8CCA2] shadow-xl text-center space-y-2 relative">
              <div className="inline-block px-3 py-0.5 rounded-full bg-rose-100 text-[#78171C] text-[10px] font-bold uppercase tracking-wider">
                CÔ DÂU · {brideShort}
              </div>

              {/* QR Image / VietQR */}
              <div
                className="size-36 mx-auto rounded-xl bg-[#F5E6CC] border border-[#D4AF37]/70 flex flex-col items-center justify-center p-2 shadow-inner cursor-pointer group"
                onClick={onOpenGift}
              >
                <img
                  src={`https://img.vietqr.io/image/${card.bankingSecondary?.bankCode || "VCB"}-${card.bankingSecondary?.accountNumber || "9999888877"}-compact.png?amount=0&addInfo=MungCuoi+NgocMai&accountName=${encodeURIComponent(card.bankingSecondary?.accountName || "NGUYEN NGOC MAI")}`}
                  alt="QR Cô Dâu"
                  className="size-full object-contain rounded-md"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <QrCode className="size-16 text-[#6E1719] hidden" />
              </div>

              <div className="text-xs space-y-0.5 text-stone-800 font-sans">
                <p className="font-bold text-[#6E1719] font-serif text-[13px]">{card.bankingSecondary?.accountName || "NGUYEN NGOC MAI"}</p>
                <p className="font-mono text-sm font-bold text-stone-900">{card.bankingSecondary?.accountNumber || "9999888877"}</p>
                <p className="text-[11px] text-stone-600 font-medium">Ngân hàng: {card.bankingSecondary?.bankCode || "Vietcombank"}</p>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(card.bankingSecondary?.accountNumber || "9999888877", "bride")}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#6E1719] hover:bg-[#8B1E2D] text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              >
                {copiedBank === "bride" ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Đã sao chép STK!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-amber-300" />
                    <span>Sao chép số tài khoản</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Triện đồng Song Hỷ kết thiệp quay nhẹ nhàng */}
          <div className="pt-2 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="size-14 mx-auto rounded-full border-2 border-[#F3CD74] bg-[#78171C] flex items-center justify-center text-2xl text-[#F3CD74] shadow-lg"
            >
              囍
            </motion.div>
          </div>

          <p className="text-xs text-amber-200/90 italic font-serif max-w-xs mx-auto text-center leading-relaxed">
            “Cảm ơn tất cả tình cảm, lời chúc và món quà ý nghĩa mà quý quan khách đã dành cho Quốc Bảo &amp; Ngọc Mai!”
          </p>
        </motion.section>

        {/* ── 12. SỔ LƯU BÚT ĐIỆN TỬ & THẢ TIM CHÚC PHÚC (GUESTBOOK) ── */}
        <section className="px-5 py-6 bg-[#2B0507]/90 rounded-3xl mx-4 border border-[#D4AF37]/35 space-y-6">
          <div className="flex justify-center">
            <HeartBurstButton accentColor="#D4AF37" />
          </div>

          <div className="pt-2">
            <QuickWishWall
              cardId={card.id}
              accentColor="#D4AF37"
              guestName={guestName}
            />
          </div>
        </section>

        {/* ── 13. CHÂN TRANG HOÀNG GIA & LỜI TRI ÂN ── */}
        <footer className="pt-4 pb-12 px-6 text-center space-y-3">
          <div className="size-12 mx-auto rounded-full bg-[#561013] border border-[#F3CD74] flex items-center justify-center text-xl text-[#F3CD74] font-bold shadow-md">
            囍
          </div>
          <h4 className="font-serif text-lg font-bold text-amber-100 uppercase tracking-wider">
            TRÂN TRỌNG CẢM ƠN
          </h4>
          <p className="text-xs text-amber-200/80 font-serif italic max-w-sm mx-auto leading-relaxed">
            Sự hiện diện và lời chúc phúc của quý khách là niềm vinh hạnh to lớn cho gia đình chúng tôi trên hành trình trăm năm hạnh phúc!
          </p>
          <div className="pt-2 text-[10px] text-amber-400/40 uppercase tracking-widest font-sans">
            Trịnh Quốc Bảo &amp; Nguyễn Ngọc Mai · 2026
          </div>
        </footer>

        {/* ── 14. BOTTOM DOCK CỐ ĐỊNH NỔI BẬT DỄ THAO TÁC ── */}
        <div className={`${isPreview ? "sticky" : "fixed"} bottom-0 left-0 right-0 z-40 bg-[#2B0507]/95 backdrop-blur-md border-t-2 border-[#D4AF37] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3D1] to-[#AA8222] text-[#38090C] text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="size-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-4 sm:px-5 rounded-full bg-black/50 border border-[#D4AF37] text-[#F3CD74] text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="size-4 text-amber-300" />
            <span>Mừng Cưới</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
