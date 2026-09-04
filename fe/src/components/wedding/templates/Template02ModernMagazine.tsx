"use client";

import React from "react";
import { motion } from "framer-motion";
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
import { MapPin, Navigation, UserCheck, Gift, Calendar, Heart } from "lucide-react";
import { KineticText, LivingPhoto, MarqueeRibbon } from "../effects/MotionElements";

export const Template02ModernMagazine: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-12-27T11:00:00Z");

  const groomName = data.groom?.fullName || "Phạm Công Vinh";
  const groomShort = data.groom?.shortName || "Công Vinh";
  const brideName = data.bride?.fullName || "Nguyễn Hải Yến";
  const brideShort = data.bride?.shortName || "Hải Yến";

  const heroPhoto = "/images/demo/korean-hero.png";
  const bridePhoto = "/images/demo/korean-bride.png";
  const groomPhoto = "/images/demo/korean-groom.png";
  const calendarPhoto = "/images/demo/korean-calendar.png";

  const defaultGalleryPhotos = [
    { url: heroPhoto, caption: "Khoảnh khắc hẹn ước" },
    { url: bridePhoto, caption: "Nụ cười rạng rỡ của cô dâu" },
    { url: groomPhoto, caption: "Ánh mắt ấm áp của chú rể" },
    { url: calendarPhoto, caption: "Từng ngày đong đầy yêu thương" },
    { url: "/images/demo/couple-sunset.png", caption: "Hoàng hôn lãng mạn" },
    { url: "/images/demo/couple-street.png", caption: "Bên nhau trên mọi nẻo đường" },
  ];

  const galleryPhotos =
    card.photos && card.photos.length >= 4
      ? card.photos.map((p) => ({ url: p.url, caption: p.caption }))
      : [
          ...(card.photos || []).map((p) => ({ url: p.url, caption: p.caption })),
          ...defaultGalleryPhotos.slice(card.photos?.length || 0),
        ];

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#3E2B22] font-serif pb-28 sm:pb-32 overflow-x-hidden selection:bg-[#EBDCD0]">
      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-[#FAF8F5] shadow-[0_15px_60px_rgba(74,46,32,0.12)] sm:border-x border-[#EDE3D8] relative">

        {/* 1. HERO VERTICAL PHOTO WITH SLOW KEN BURNS ANIMATION */}
        <section
          className="relative w-full aspect-[3/4] overflow-hidden bg-stone-900 group cursor-pointer"
          onClick={() => onSelectPhoto(heroPhoto)}
        >
          {/* Zoom chuyển động chậm điện ảnh */}
          <motion.img
            src={heroPhoto}
            alt="Hero Couple Editorial"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

          {/* Date and Quote Overlay với hiệu ứng trồi mượt mà */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="absolute bottom-5 left-4 right-4 text-center text-white space-y-2"
          >
            <span className="text-sm tracking-[0.3em] font-sans uppercase text-amber-100 font-medium">
              28.12.2026
            </span>
            <p className="text-[11px] sm:text-xs italic leading-relaxed text-stone-200 max-w-xs mx-auto px-2">
              “Chúng ta đã cùng nhau đi qua nhiều thăng trầm để nhận ra rằng được ở bên nhau là điều quý giá nhất...<br />
              Hôm nay, trước sự chứng kiến của mọi người, từ khoảnh khắc này chúng ta nhẹ nhàng gọi nhau bằng hai tiếng Vợ - Chồng”
            </p>
            <div className="pt-1">
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block text-base text-rose-300 drop-shadow"
              >
                囍
              </motion.span>
            </div>
          </motion.div>
        </section>

        {/* KINETIC EDITORIAL MARQUEE RIBBON */}
        <MarqueeRibbon
          text="MODERN EDITORIAL WEDDING • CÔNG VINH & HẢI YẾN • 28.12.2026 • JUST MARRIED"
          bgClass="bg-[#543A2C] text-[#F3E2B8]"
        />

        {/* 2. HANDWRITTEN SIGNATURES & SUBTITLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="py-6 px-4 text-center bg-[#FAF8F5] border-b border-[#EDE3D8] space-y-1"
        >
          <div className="flex items-center justify-center gap-6 text-[#B26E63] font-serif italic text-xl sm:text-2xl">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl block font-light leading-none -mb-1">Yến</span>
              <h2 className="text-sm font-serif font-bold text-[#B26E63] tracking-wide animate-shimmer-text">{brideName}</h2>
            </div>
            <motion.span
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-rose-400 text-sm inline-block"
            >
              ♥
            </motion.span>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl block font-light leading-none -mb-1">Vinh</span>
              <h2 className="text-sm font-serif font-bold text-[#B26E63] tracking-wide animate-shimmer-text">{groomName}</h2>
            </div>
          </div>
          <p className="text-xs text-stone-500 italic pt-1">
            Một hành trình mới của chúng mình bắt đầu từ hôm nay
          </p>
        </motion.section>

        {/* 3. EXACT ZIGZAG PARENTS & PORTRAIT LAYOUT */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-4 sm:p-6 space-y-5 bg-[#FAF8F5] border-b border-[#EDE3D8]"
        >
          {/* ROW 1: ẢNH CÔ DÂU BÊN TRÁI ➔ THÔNG TIN NHÀ GÁI BÊN PHẢI */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <LivingPhoto
              src={bridePhoto}
              alt="Cô Dâu Hải Yến"
              badgeText="CÔ DÂU"
              enableGleam={true}
              onClick={() => onSelectPhoto(bridePhoto)}
            />

            <div className="text-center space-y-1 pl-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4A2E20]">Nhà Gái</span>
              <div className="text-[10px] text-stone-400 tracking-widest -mt-1 mb-1">························</div>
              <p className="text-xs text-[#3E2B22] font-semibold">{data.bride?.parents?.fatherName || "Ông: Nguyễn Tiến Minh"}</p>
              <p className="text-xs text-[#3E2B22] font-semibold">{data.bride?.parents?.motherName || "Bà: Hoàng Cẩm Vân"}</p>
              <p className="text-[10px] text-stone-500 italic">Hoàng Mai — Hà Nội</p>
              <div className="my-1.5 flex items-center justify-center">
                {/* Chibi cô dâu cầm hoa từ mẫu 02b */}
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-xs">
                    <circle cx="30" cy="24" r="14" fill="#FFF0E6" stroke="#B26E63" strokeWidth="1" />
                    <path d="M18 20 Q30 10 42 20 Q36 15 30 15 Q24 15 18 20 Z" fill="#3E2B22" />
                    <circle cx="25" cy="24" r="1.5" fill="#3E2B22" />
                    <circle cx="35" cy="24" r="1.5" fill="#3E2B22" />
                    <circle cx="22" cy="27" r="1.8" fill="#F4A6A6" opacity="0.6" />
                    <circle cx="38" cy="27" r="1.8" fill="#F4A6A6" opacity="0.6" />
                    <path d="M28 28 Q30 30 32 28" stroke="#D9534F" strokeWidth="1" fill="none" strokeLinecap="round" />
                    <path d="M22 38 Q30 36 38 38 L40 54 L20 54 Z" fill="#FFF" stroke="#B26E63" strokeWidth="1" />
                    <circle cx="30" cy="42" r="3.5" fill="#E58A96" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-bold text-[#B26E63] pt-0.5">
                Út nữ: {brideName}
              </p>
            </div>
          </div>

          {/* ROW 2: THÔNG TIN NHÀ TRAI BÊN TRÁI ➔ ẢNH CHÚ RỂ BÊN PHẢI */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="text-center space-y-1 pr-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4A2E20]">Nhà Trai</span>
              <div className="text-[10px] text-stone-400 tracking-widest -mt-1 mb-1">························</div>
              <p className="text-xs text-[#3E2B22] font-semibold">{data.groom?.parents?.fatherName || "Ông: Phạm Minh Toàn"}</p>
              <p className="text-xs text-[#3E2B22] font-semibold">{data.groom?.parents?.motherName || "Bà: Lại Thị Tám"}</p>
              <p className="text-[10px] text-stone-500 italic">Từ Liêm — Hà Nội</p>
              <div className="my-1.5 flex items-center justify-center">
                {/* Chibi chú rể áo vest từ mẫu 02b */}
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-xs">
                    <circle cx="30" cy="24" r="14" fill="#FFE5D4" stroke="#543A2C" strokeWidth="1" />
                    <path d="M18 20 Q30 11 42 20 Q36 16 30 16 Q24 16 18 20 Z" fill="#2B1810" />
                    <circle cx="25" cy="24" r="1.5" fill="#2B1810" />
                    <circle cx="35" cy="24" r="1.5" fill="#2B1810" />
                    <path d="M28 28 Q30 30 32 28" stroke="#D9534F" strokeWidth="1" fill="none" strokeLinecap="round" />
                    <path d="M21 38 Q30 36 39 38 L41 54 L19 54 Z" fill="#3E2B22" stroke="#543A2C" strokeWidth="1" />
                    <polygon points="30,38 27,45 33,45" fill="#FFF" />
                    <polygon points="28,42 32,42 30,44" fill="#C92A2A" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-bold text-[#B26E63] pt-0.5">
                Trưởng nam: {groomName}
              </p>
            </div>

            <LivingPhoto
              src={groomPhoto}
              alt="Chú Rể Công Vinh"
              badgeText="CHÚ RỂ"
              enableGleam={true}
              onClick={() => onSelectPhoto(groomPhoto)}
            />
          </div>
        </motion.section>

        {/* 4. DOTTED DIVIDER & THIỆP MỜI CALLIGRAPHY */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="pt-6 pb-4 px-4 text-center bg-[#FAF8F5] space-y-3 relative"
        >
          {/* Brand watermark vertical */}
          <div className="absolute right-1 top-10 writing-vertical text-[8px] font-sans tracking-widest text-stone-400 select-none pointer-events-none">
            Made with Ngày chung đôi
          </div>

          <div className="text-xs text-stone-300 tracking-[0.25em]">
            ······························································
          </div>
          <h3 className="text-3xl font-serif italic text-[#543A2C] leading-tight animate-shimmer-text">
            Thiệp Mời
          </h3>
          <p className="text-xs text-stone-600 font-sans">
            Tham dự lễ cưới {groomShort} &amp; {brideShort}
          </p>

          {/* 3 ẢNH NGANG TRIPTYCH VỚI LIVING PHOTO */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { src: heroPhoto, alt: "Triptych 1" },
              { src: calendarPhoto, alt: "Triptych 2" },
              { src: bridePhoto, alt: "Triptych 3" },
            ].map((img, i) => (
              <LivingPhoto
                key={i}
                src={img.src}
                alt={img.alt}
                enableGleam={true}
                aspectRatio="aspect-[3/4]"
                onClick={() => onSelectPhoto(img.src)}
              />
            ))}
          </div>
        </motion.section>

        {/* 4.5. LOVE STORY TIMELINE */}
        <section className="bg-[#FAF8F5] border-b border-[#EDE3D8]">
          <LoveStoryTimeline
            accentColor="#543A2C"
            variant="editorial"
            onSelectPhoto={onSelectPhoto}
          />
        </section>

        {/* 5. LỊCH TIỆC CƯỚI CHÍNH XÁC (DATE BLOCK VINTAGE) */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-6 text-center bg-[#FAF8F5] border-b border-[#EDE3D8] space-y-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-stone-400">
              TRÂN TRỌNG KÍNH MỜI
            </span>
            <h4 className="text-lg font-serif italic text-[#B26E63] font-bold">QUÝ KHÁCH</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Đến dự Bữa Tiệc thân mật cùng Gia Đình chúng Tôi vào lúc:
            </p>
          </div>

          {/* KHỐI NGÀY 27/12 CHUẨN XÁC THEO ẢNH */}
          <div className="py-2 text-center">
            <span className="text-xs text-stone-600 block mb-1">Chủ Nhật</span>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-sans font-medium text-stone-700">11h00</span>
              <div className="h-8 w-px bg-[#543A2C]/40" />
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl font-serif font-bold text-[#543A2C] inline-block"
              >
                27
              </motion.span>
              <div className="h-8 w-px bg-[#543A2C]/40" />
              <span className="text-sm font-sans font-medium text-stone-700">Năm 2026</span>
            </div>
            <span className="text-xs text-stone-600 block mt-1">Tháng 12</span>
            <span className="text-[11px] text-stone-400 italic block mt-0.5">
              (Tức ngày 10 tháng 11 năm Bính Ngọ)
            </span>
          </div>

          {/* TIMELINE SVG ICONS */}
          <div className="flex items-center justify-center gap-8 text-xs text-stone-700 pt-1">
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="text-center space-y-1"
            >
              <div className="w-8 h-8 mx-auto flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#B26E63]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 22h8M12 15v7M8 15h8l1-10H7l1 10zM12 2a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3z" />
                </svg>
              </div>
              <span className="font-bold block">11h00</span>
              <p className="text-[10px] text-stone-500">Đón khách</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="text-center space-y-1"
            >
              <div className="w-8 h-8 mx-auto flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#B26E63]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3M7 7v10M17 7v10" />
                </svg>
              </div>
              <span className="font-bold block">11h30</span>
              <p className="text-[10px] text-stone-500">Khai tiệc</p>
            </motion.div>
          </div>

          {/* ĐỊA CHỈ DỰ TIỆC */}
          <div className="pt-2 space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-md bg-[#EDE3D8] text-[#543A2C] text-[10px] font-sans font-semibold">
              Địa chỉ dự tiệc
            </span>
            <h5 className="text-base font-bold text-[#543A2C] uppercase tracking-wider">
              {mainEvent?.venueName || "TƯ GIA NHÀ TRAI"}
            </h5>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              {mainEvent?.address || "16 P. Phúc Minh, Phúc Diễn, Bắc Từ Liêm, Hà Nội"}
            </p>
            {mainEvent?.mapUrl && (
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href={mainEvent.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B26E63] underline hover:text-[#8C5147] transition mt-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Chỉ đường trên Google Maps</span>
              </motion.a>
            )}
          </div>
        </motion.section>

        {/* 6. LỊCH THÁNG NHÚNG TRÊN ẢNH NỀN CÔ DÂU CHÚ RỂ (PART 2) */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[3/5] sm:aspect-[4/6] overflow-hidden bg-stone-900 text-white flex flex-col justify-between p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={calendarPhoto}
            alt="Calendar Background"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none" />

          {/* Wedding Calligraphy */}
          <div className="relative z-10 text-center pt-2">
            <span className="text-3xl sm:text-4xl font-serif italic tracking-wider text-white/90">
              Wedding
            </span>
          </div>

          {/* Calendar Grid With Day 27 Circled & Heart Pulse */}
          <div className="relative z-10 max-w-xs mx-auto w-full">
            <InteractiveCalendarGrid targetDate={targetDate} variant="glass" heartColor="#E11D48" />

            {/* Countdown Boxes */}
            <div className="pt-4 text-center">
              <span className="text-sm font-serif italic text-amber-200 block mb-2">Chỉ còn...</span>
              <CountdownUnits targetDate={targetDate} style="boxes-terracotta" showCalendarButton={false} />
            </div>
          </div>
        </motion.section>

        {/* 6.5. WEDDING ITINERARY */}
        <section className="bg-[#FAF8F5] border-b border-[#EDE3D8]">
          <WeddingItinerary
            accentColor="#543A2C"
            weddingDate={new Date(targetDate)}
            coupleNames={`${groomShort} & ${brideShort}`}
            venueName={mainEvent?.venueName}
            venueAddress={mainEvent?.address}
          />
        </section>

        {/* 6.6. DRESS CODE SECTION */}
        <section className="bg-[#FAF8F5] border-b border-[#EDE3D8]">
          <DressCodeSection
            accentColor="#543A2C"
            dressCodeTitle="Bảng Màu Trang Phục Tối Giản"
          />
        </section>

        {/* 7. PHONG BÌ SÁP RSVP THỜI TRANG */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-6 bg-[#FAF8F5] border-b border-[#EDE3D8] text-center space-y-4"
        >
          <p className="text-xs text-stone-600 leading-relaxed italic max-w-xs mx-auto">
            “Chúng mình rất mong sự hiện diện của bạn để cùng nhau chung vui, sẻ chia niềm hạnh phúc và lưu lại những khoảnh khắc đáng nhớ trong ngày cưới. Đừng quên để lại xác nhận tham dự để chúng mình chuẩn bị chu đáo hơn!”
          </p>

          {/* Mô phỏng phong bì thư mở nắp sáp */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative max-w-xs mx-auto pt-4"
          >
            <div className="w-full aspect-[5/3] bg-[#EAE0D2] rounded-2xl shadow-inner border border-[#D9CDBF] relative flex items-center justify-center">
              {/* Con dấu sáp nến tròn */}
              <motion.div
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-8 h-8 rounded-full bg-[#8B2E20] border-2 border-amber-200 shadow-md flex items-center justify-center text-amber-200 text-xs font-serif font-bold"
              >
                囍
              </motion.div>
            </div>

            {/* Thẻ trắng lồi ra từ phong bì */}
            <div className="bg-white p-5 rounded-2xl border border-[#EDE3D8] shadow-lg -mt-10 relative z-10 space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-[#B26E63] uppercase">R.S.V.P.</span>
              <h5 className="text-sm font-serif font-bold text-[#4A2E20]">Xác nhận tham dự</h5>
              <p className="text-[11px] text-stone-500">
                Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenRsvp}
                className="w-full py-2.5 rounded-xl bg-[#543A2C] text-white text-xs font-sans font-bold hover:bg-[#3D291F] transition shadow cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-200" />
                <span>Gửi xác nhận</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.section>

        {/* 8. HỘP GỬI QUÀ MỪNG PHONG THƯ TRÁI TIM NỞ RỘ (PART 2 TRONG ẢNH MẪU) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-6 bg-[#FAF8F5] border-b border-[#EDE3D8] text-center space-y-3 relative"
        >
          {/* Brand watermark vertical */}
          <div className="absolute right-2 top-8 writing-vertical text-[8px] font-sans tracking-widest text-stone-400 select-none pointer-events-none">
            Made with Ngày chung đôi
          </div>

          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenGift}
            className="cursor-pointer group inline-block p-4 rounded-3xl hover:bg-stone-100/50 transition text-center"
          >
            {/* Minh họa phong thư mở nắp và trái tim hồng bay lên chuẩn xác từ mẫu 02b */}
            <div className="w-20 h-16 mx-auto relative flex items-center justify-center">
              <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-sm">
                <path d="M15 35 L50 15 L85 35 L85 70 L15 70 Z" fill="#FBF6EE" stroke="#E3D1BE" strokeWidth="1.5" />
                <path d="M15 70 L45 45 M85 70 L55 45" stroke="#E3D1BE" strokeWidth="1" />
                {/* Trái tim hồng lớn nhú ra */}
                <path d="M50 35 C42 22 30 28 35 40 C40 50 50 56 50 56 C50 56 60 50 65 40 C70 28 58 22 50 35 Z" fill="#E88D98" />
                {/* Trái tim nhỏ bay lên */}
                <path d="M68 20 C64 12 56 16 59 23 C62 29 68 33 68 33 C68 33 74 29 77 23 C80 16 72 12 68 20 Z" fill="#F5B2BC" opacity="0.8" />
              </svg>
            </div>
            <h5 className="text-sm font-serif italic text-[#B26E63] font-bold mt-2">
              Gửi quà mừng
            </h5>
            <span className="text-[10px] text-stone-400 block font-sans">
              Chạm để xem thông tin mừng cưới
            </span>
          </motion.div>
        </motion.section>

        {/* 9. ALBUM ẢNH CƯỚI LIGHTBOX & MASONRY */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="bg-[#FAF8F5] border-b border-[#EDE3D8]"
        >
          <PhotoGalleryLightbox
            photos={galleryPhotos}
            accentColor="#543A2C"
            title="ALBUM ẢNH CƯỚI"
            subtitle="Từng khoảnh khắc đong đầy dư vị và cảm xúc yêu thương"
          />
        </motion.section>

        {/* 9.5. HEART BURST & QUICK WISH WALL */}
        <section className="p-6 bg-[#FAF8F5] border-b border-[#EDE3D8] space-y-6">
          <div className="flex justify-center">
            <HeartBurstButton accentColor="#543A2C" />
          </div>

          <div className="pt-2">
            <QuickWishWall
              cardId={card.id}
              accentColor="#543A2C"
              guestName={guestName}
            />
          </div>
        </section>

        {/* 10. BOTTOM DOCK CỐ ĐỊNH CHÂN MÀN HÌNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#EDE3D8] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-xl bg-[#543A2C] text-white text-xs font-sans font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-4 rounded-xl bg-white border border-[#543A2C] text-[#543A2C] text-xs font-sans font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4 text-[#B26E63]" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
