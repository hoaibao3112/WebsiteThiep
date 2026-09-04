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
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift, Heart, Calendar, Sparkles, QrCode } from "lucide-react";
import { MarqueeRibbon } from "../effects/MotionElements";

export const Template09ImperialDragon: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2025-12-19T09:00:00Z");

  const groomName = data.groom?.fullName || "Nguyễn Anh Tuấn";
  const groomShort = data.groom?.shortName || "Anh Tuấn";
  const brideName = data.bride?.fullName || "Huỳnh Thu Trang";
  const brideShort = data.bride?.shortName || "Thu Trang";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/demo/imperial-dragon-couple.jpg";

  const defaultGalleryPhotos = [
    { url: coverPhoto, caption: "Long Phụng Sum Vầy - Hạnh Phúc Trăm Năm" },
    { url: "/images/demo/couple-aodai.png", caption: "Lễ gia tiên truyền thống uy nghiêm" },
    { url: "/images/templates/references/mau-09-imperial-dragon-crimson-part-01.png", caption: "Minh họa cổng Song Hỷ hoàng gia" },
    { url: "/images/demo/couple-kiss.png", caption: "Hẹn ước bền chặt, keo sơn gắn bó" },
    { url: "/images/demo/couple-sunset.png", caption: "Ánh kim hoàng cung chiều hẹn ước" },
    { url: "/images/demo/gallery-rings.png", caption: "Kỷ vật trao tay trọn đời trọn kiếp" },
  ];

  const galleryPhotos =
    card.photos && card.photos.length >= 4
      ? card.photos.map((p) => ({ url: p.url, caption: p.caption }))
      : [
          ...(card.photos || []).map((p) => ({ url: p.url, caption: p.caption })),
          ...defaultGalleryPhotos.slice(card.photos?.length || 0),
        ];

  return (
    <div className="relative min-h-screen bg-[#450C0E] text-[#FFF3D1] font-serif pb-28 sm:pb-32 overflow-x-hidden selection:bg-amber-300 selection:text-red-950">
      {/* Background rồng hoàng gia chìm & gấm cung đình */}
      <div className="fixed inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#D4AF37_1.2px,transparent_1.2px)] [background-size:24px_24px] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(45deg,#200405_25%,transparent_25%,transparent_75%,#200405_75%,#200405),linear-gradient(45deg,#200405_25%,transparent_25%,transparent_75%,#200405_75%,#200405)] [background-size:30px_30px] [background-position:0_0,15px_15px] z-0" />

      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-gradient-to-b from-[#561013] via-[#4D0D10] to-[#3B090B] shadow-[0_25px_90px_rgba(0,0,0,0.9)] sm:border-x border-[#D4AF37]/50 relative z-10 text-center space-y-7">

        {/* 1. TOP NAMES IN GOLD CURSIVE CALLIGRAPHY & DRAGON HEADER */}
        <section className="pt-10 px-4 space-y-2 relative overflow-hidden">
          {/* Họa tiết rồng phượng dập nổi */}
          <div className="flex items-center justify-center gap-2 text-[#D4AF37]/80 text-[10px] tracking-[0.35em] uppercase font-sans">
            <span>❖</span>
            <span>Hỷ Sự Cát Tường</span>
            <span>❖</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-0.5"
          >
            <h2 className="text-3xl sm:text-4xl font-serif italic text-amber-200 tracking-wide font-light drop-shadow">
              {groomShort}
            </h2>
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-300/80" />
              <span className="text-xl font-serif italic text-amber-300/90">&amp;</span>
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-300/80" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-amber-200 tracking-wide font-light drop-shadow">
              {brideShort}
            </h2>
          </motion.div>

          <p className="text-[11px] text-amber-200/70 font-sans tracking-widest pt-1">
            THÁNG 12 • 2025 • HÀ NỘI
          </p>
        </section>

        {/* MARQUEE GẤM HOÀNG GIA */}
        <MarqueeRibbon
          text="LONG PHỤNG SUM VẦY • NGUYỄN ANH TUẤN & HUỲNH THU TRANG • 19.12.2025 • TRĂM NĂM HẠNH PHÚC"
          bgClass="bg-[#330708] border-y border-[#D4AF37]/40 text-[#F4D080]"
        />

        {/* 2. CHIBI COUPLE LEANING ON GIANT 3D SONG HỶ GATE & EASEL STAND */}
        <section className="px-5 relative">
          <div className="relative max-w-sm mx-auto bg-gradient-to-b from-[#661316] to-[#450C0E] p-5 rounded-3xl border-2 border-[#D4AF37]/60 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            {/* Cặp Chibi & Cổng 3D Song Hỷ */}
            <div className="relative z-10 text-center">
              {/* Minh họa uyên ương tựa cổng */}
              <div className="relative mx-auto w-36 h-28 flex items-center justify-center -mb-3 z-20">
                <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-lg">
                  {/* Groom avatar chibi */}
                  <circle cx="65" cy="55" r="28" fill="#FFE5D4" stroke="#D4AF37" strokeWidth="2" />
                  <path d="M45 45 Q65 25 85 45 Q75 35 65 35 Q55 35 45 45 Z" fill="#2B1810" />
                  <circle cx="58" cy="55" r="3" fill="#2B1810" />
                  <circle cx="72" cy="55" r="3" fill="#2B1810" />
                  <path d="M60 65 Q65 70 70 65" stroke="#D9534F" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M48 83 Q65 80 82 83 L85 110 L45 110 Z" fill="#751624" stroke="#D4AF37" strokeWidth="1.5" />
                  {/* Bride avatar chibi */}
                  <circle cx="102" cy="58" r="26" fill="#FFF0E6" stroke="#D4AF37" strokeWidth="2" />
                  <path d="M82 50 Q102 28 122 50 Q112 38 102 38 Q92 38 82 50 Z" fill="#3D2314" />
                  <path d="M85 30 Q105 18 125 35 Q115 50 125 65" fill="#FAF5ED" opacity="0.8" />
                  <circle cx="95" cy="58" r="3" fill="#2B1810" />
                  <circle cx="109" cy="58" r="3" fill="#2B1810" />
                  <path d="M98 67 Q102 71 106 67" stroke="#D9534F" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <circle cx="91" cy="62" r="3" fill="#FFB6C1" opacity="0.6" />
                  <circle cx="113" cy="62" r="3" fill="#FFB6C1" opacity="0.6" />
                  <path d="M86 84 Q102 82 118 84 L122 110 L82 110 Z" fill="#8B1E2D" stroke="#D4AF37" strokeWidth="1.5" />
                  {/* Mini Heart */}
                  <path d="M80 32 C80 28 75 25 72 28 C69 25 64 28 64 32 C64 37 72 42 72 42 C72 42 80 37 80 32 Z" fill="#E63946" />
                </svg>
              </div>

              {/* Cổng 3D Song Hỷ khổng lồ viền vàng cát ruột đỏ đô */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-56 sm:w-60 h-44 sm:h-48 mx-auto rounded-3xl bg-gradient-to-tr from-[#78171A] via-[#941D21] to-[#601215] border-4 border-[#F4D080] shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_2px_10px_rgba(255,255,255,0.2)] flex items-center justify-center text-8xl sm:text-9xl font-bold text-[#FFF3D1] select-none relative"
              >
                <span className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">囍</span>
                {/* Hoa văn góc hoàng cung */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#F4D080]" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#F4D080]" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#F4D080]" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#F4D080]" />
              </motion.div>

              {/* Giá vẽ hoa cưới đặt bên cạnh (Easel Stand) */}
              <div className="absolute top-24 left-1 sm:left-3 w-24 p-2 rounded-xl bg-[#FFFDF9] shadow-xl border border-[#D4AF37] text-center text-[9px] text-stone-800 rotate-[-9deg] z-30">
                <div className="w-5 h-5 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-0.5">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                    <path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5-1.2.7-2 2-2 3.5a4 4 0 0 0 8 0c0-1.5-.8-2.8-2-3.5 1.2-.7 2-2 2-3.5a4 4 0 0 0-4-4z" />
                  </svg>
                </div>
                <span className="font-serif font-bold block text-[8px] text-[#8E1C1F] uppercase tracking-wider">Lễ Thành Hôn</span>
                <span className="font-serif text-[8px] text-stone-600 block mt-0.5 font-semibold">{groomShort} &amp; {brideShort}</span>
                <span className="text-[7px] text-stone-400 block font-sans">19.12.2025</span>
              </div>
            </div>

            <div className="pt-5 pb-1">
              <span className="text-3xl sm:text-4xl font-serif italic text-[#F4D080] tracking-wider block font-light">
                Save The Date
              </span>
              <p className="text-[11px] text-amber-100/70 font-sans mt-1">
                Kính mời quý quan khách lưu lại ngày trọng đại
              </p>
            </div>
          </div>
        </section>

        {/* 3. THÔNG TIN HAI HỌ (ÔNG BÀ) & DÒNG DÕI HAI BÊN */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="px-6 space-y-6"
        >
          <div className="grid grid-cols-2 gap-4 text-xs font-sans text-amber-100/95 bg-black/25 p-4 rounded-2xl border border-amber-500/20">
            <div className="space-y-1">
              <span className="font-serif font-bold text-[#F4D080] block text-xs tracking-wider border-b border-amber-500/30 pb-1">NHÀ TRAI</span>
              <span className="text-[10px] text-amber-200/70 block">(Ông Bà)</span>
              <p className="font-semibold text-white">{data.groom?.parents?.fatherName || "Nguyễn Văn Quản"}</p>
              <p className="font-semibold text-white">{data.groom?.parents?.motherName || "Nguyễn Thị Oanh"}</p>
              <p className="text-[10px] text-amber-200/60 pt-0.5">68 Lê Văn Lương — Hà Nội</p>
            </div>

            <div className="space-y-1">
              <span className="font-serif font-bold text-[#F4D080] block text-xs tracking-wider border-b border-amber-500/30 pb-1">NHÀ GÁI</span>
              <span className="text-[10px] text-amber-200/70 block">(Ông Bà)</span>
              <p className="font-semibold text-white">{data.bride?.parents?.fatherName || "Huỳnh Đăng Khoa"}</p>
              <p className="font-semibold text-white">{data.bride?.parents?.motherName || "Lê Vân Anh"}</p>
              <p className="text-[10px] text-amber-200/60 pt-0.5">Quốc Oai — Hà Nội</p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-900/60 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#F4D080] block">
              TRÂN TRỌNG THÔNG BÁO LỄ THÀNH HÔN CỦA CON CHÚNG TÔI
            </span>

            <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-200 tracking-wide font-bold">
              {groomName}
            </h3>

            <div className="flex items-center justify-center gap-4 text-xs text-amber-200/90 font-sans">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-[10px]">Trưởng nam</span>
              <span className="text-[#F4D080] font-serif italic text-lg">&amp;</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-[10px]">Út nữ</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-200 tracking-wide font-bold">
              {brideName}
            </h3>
          </div>
        </motion.section>

        {/* 3.5. CHUYỆN TÌNH LONG PHỤNG - LOVE STORY TIMELINE */}
        <section className="bg-[#4D0D10]/80 border-y border-[#D4AF37]/40">
          <LoveStoryTimeline
            accentColor="#D4AF37"
            variant="imperial"
            onSelectPhoto={onSelectPhoto}
          />
        </section>

        {/* 4. HÔN LỄ TẠI TƯ GIA VÀ BADGE ĐỒNG HỒ CỔ */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="px-6 space-y-4"
        >
          <div className="space-y-1 bg-black/20 p-4 rounded-2xl border border-amber-500/20">
            <span className="text-xs text-amber-200/80 tracking-widest block font-serif uppercase">
              HÔN LỄ ĐƯỢC CỬ HÀNH TẠI
            </span>
            <h4 className="text-lg font-serif font-bold text-[#FFF3D1] tracking-wider">TƯ GIA</h4>
            <p className="text-xs font-mono text-[#F4D080]">VÀO LÚC: 09:00 SÁNG</p>

            {/* Badge Ngày 19 Tháng 12 Năm 2025 */}
            <div className="flex items-center justify-center gap-3 py-3">
              <span className="text-xs font-mono tracking-widest text-[#F4D080] uppercase border-y border-[#F4D080]/60 py-1 px-2">
                THỨ SÁU
              </span>
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-full border-2 border-[#F4D080] bg-[#6E1719] flex flex-col items-center justify-center text-2xl font-bold text-amber-200 shadow-xl ring-4 ring-amber-500/20"
              >
                19
              </motion.div>
              <span className="text-xs font-mono tracking-widest text-[#F4D080] uppercase border-y border-[#F4D080]/60 py-1 px-2">
                THÁNG 12
              </span>
            </div>
            <span className="text-xs font-mono text-amber-200/80 block -mt-1 font-bold">NĂM 2025</span>
            <p className="text-[11px] text-amber-300/80 italic font-serif pt-1">
              (Nhằm ngày 30 tháng 10 năm Ất Tỵ)
            </p>
          </div>

          {/* ĐẾM NGƯỢC CÁT TƯỜNG */}
          <div className="bg-[#3D0A0C] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-inner">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#F4D080] block mb-2 font-bold">
              ĐẾM NGƯỢC NGÀY CHUNG ĐÔI
            </span>
            <CountdownUnits targetDate={targetDate} style="gold-elegant" showCalendarButton={true} />
          </div>
        </motion.section>

        {/* 5. TIỆC CƯỚI PROMEX CENTER & BẢN ĐỒ GOOGLE MAPS */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="px-6 space-y-3"
        >
          <span className="text-xs uppercase font-serif tracking-widest text-[#F4D080] block font-bold">
            TIỆC CƯỚI TRỌNG THỂ TỔ CHỨC TẠI
          </span>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-block px-8 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3D1] to-[#AA8222] text-[#4A0E10] font-serif font-bold text-base shadow-lg cursor-pointer"
          >
            Promex Center
          </motion.div>

          <p className="text-xs text-amber-100/90 font-sans">
            Số 122 - 124 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội
          </p>

          <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border border-amber-300/30 shadow-md bg-white p-2">
            <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-stone-100">
              <iframe
                title="Promex Center Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8977!2d105.7877!3d21.0368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab361a5b8f3b%3A0x673d32!2zMTI0IFh1w6JuIFRo4buneSwgROG7i2NoIFbhu41uZyBI4bqtdSwgQ-G6p3UgR2nhuqV5LCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1680000000000"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />
            </div>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              href="https://maps.google.com/?q=124+Xuan+Thuy+Cau+Giay+Ha+Noi"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#6E1719] rounded-xl border border-amber-300/50 text-xs font-bold text-amber-200 hover:bg-[#8B1E2D] transition cursor-pointer shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300" />
              <span>Chỉ đường trên Google Maps</span>
            </motion.a>
          </div>

          <p className="text-xs text-amber-100/80 italic pt-1">
            Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!
          </p>
        </motion.section>

        {/* LỊCH TRÌNH TIỆC CƯỚI HOÀNG GIA */}
        <WeddingItinerary
          accentColor="#D4AF37"
          weddingDate={new Date(targetDate)}
          coupleNames={`${groomShort} & ${brideShort}`}
          venueName="Promex Center"
          venueAddress="Số 122 - 124 Xuân Thủy, Cầu Giấy, Hà Nội"
        />

        {/* GỢI Ý TRANG PHỤC DẠ TIỆC HOÀNG GIA */}
        <DressCodeSection
          accentColor="#D4AF37"
          dressCodeTitle="Gợi Ý Trang Phục Dạ Tiệc Hoàng Gia"
          swatches={[
            { name: "Đỏ Chu Sa Cung Đình", hex: "#8B1E2D", textColor: "#FFFFFF" },
            { name: "Vàng Hoàng Gia Long Phụng", hex: "#D4AF37", textColor: "#4A0E10" },
            { name: "Champagne Quý Phái", hex: "#F3E5AB", textColor: "#4A0E10" },
            { name: "Đen Quyền Quý", hex: "#1C1917", textColor: "#FFFFFF" },
          ]}
          note="Để không gian tiệc cưới thêm phần trang trọng và gắn kết, kính mong quý khách ưu tiên trang phục tông màu Đỏ Chu Sa, Hoàng Kim hoặc Tone Trầm Sang Trọng."
        />

        {/* 6. BỘ SƯU TẬP ẢNH CƯỚI LONG PHỤNG HOÀNG GIA */}
        <PhotoGalleryLightbox
          photos={galleryPhotos}
          accentColor="#D4AF37"
          title="Album Long Phụng Hoàng Gia"
          subtitle="Kỷ niệm ngày đại hỷ đong đầy phúc lộc, hân hoan và bình an"
        />

        {/* 7. HỘP MỪNG CƯỚI 2 THẺ QR VÀNG CÁT ĐỘC LẬP */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="px-6 py-6 space-y-5 border-t border-amber-900/60 bg-[#36080A]/60 rounded-3xl mx-4 relative"
        >
          {/* Brand watermark */}
          <div className="absolute right-2 top-8 writing-vertical text-[8px] font-sans tracking-widest text-amber-400/40 select-none pointer-events-none">
            Made with Ngày chung đôi
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-serif font-bold text-[#F4D080] tracking-widest uppercase">
              HỘP MỪNG CƯỚI
            </h4>
            <p className="text-xs text-amber-100/70 font-sans">
              Mừng cưới tiện lợi qua chuyển khoản VietQR
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thẻ QR Chú Rể Anh Tuấn */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={onOpenGift}
              className="bg-[#FFFDF9] text-[#4A0E10] p-4 rounded-2xl border-2 border-[#E8CCA2] shadow-xl text-center space-y-2 cursor-pointer"
            >
              <div className="inline-block px-3 py-0.5 rounded-full bg-red-100 text-[#8E1C1F] text-[10px] font-bold uppercase tracking-wider">
                CHÚ RỂ · {groomShort}
              </div>
              <div className="w-32 h-32 mx-auto rounded-xl bg-[#F5E6CC] border border-[#D4AF37]/60 flex flex-col items-center justify-center p-2 shadow-inner">
                <QrCode className="w-16 h-16 text-[#6E1719]" />
                <span className="text-[9px] font-mono font-bold text-[#6E1719] mt-1">QUÉT MÃ VIETQR</span>
              </div>
              <div className="text-xs space-y-0.5 text-stone-700">
                <p className="font-bold text-[#6E1719]">{card.bankingPrimary?.accountName || "NGUYEN ANH TUAN"}</p>
                <p className="font-mono text-[11px] font-bold text-stone-900">{card.bankingPrimary?.accountNumber || "190333666888"}</p>
                <p className="text-[10px] text-stone-500">{card.bankingPrimary?.bankCode || "Techcombank"}</p>
              </div>
            </motion.div>

            {/* Thẻ QR Cô Dâu Thu Trang */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={onOpenGift}
              className="bg-[#FFFDF9] text-[#4A0E10] p-4 rounded-2xl border-2 border-[#E8CCA2] shadow-xl text-center space-y-2 cursor-pointer"
            >
              <div className="inline-block px-3 py-0.5 rounded-full bg-rose-100 text-[#8E1C1F] text-[10px] font-bold uppercase tracking-wider">
                CÔ DÂU · {brideShort}
              </div>
              <div className="w-32 h-32 mx-auto rounded-xl bg-[#F5E6CC] border border-[#D4AF37]/60 flex flex-col items-center justify-center p-2 shadow-inner">
                <QrCode className="w-16 h-16 text-[#6E1719]" />
                <span className="text-[9px] font-mono font-bold text-[#6E1719] mt-1">QUÉT MÃ VIETQR</span>
              </div>
              <div className="text-xs space-y-0.5 text-stone-700">
                <p className="font-bold text-[#6E1719]">{card.bankingSecondary?.accountName || "HUYNH THU TRANG"}</p>
                <p className="font-mono text-[11px] font-bold text-stone-900">{card.bankingSecondary?.accountNumber || "0988776655"}</p>
                <p className="text-[10px] text-stone-500">{card.bankingSecondary?.bankCode || "MB Bank"}</p>
              </div>
            </motion.div>
          </div>

          {/* Triện đồng Song Hỷ kết thiệp */}
          <div className="pt-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 mx-auto rounded-full border-2 border-[#F4D080] bg-[#6E1719] flex items-center justify-center text-2xl text-[#F4D080] shadow-lg"
            >
              囍
            </motion.div>
          </div>

          <p className="text-xs text-amber-200/90 italic font-serif max-w-xs mx-auto">
            “Cảm ơn tất cả tình cảm của cô dì chú bác, bạn bè và anh chị em đã dành cho Anh Tuấn &amp; Thu Trang!”
          </p>
        </motion.section>

        {/* 7.5. NÚT THẢ TIM & SỔ LƯU BÚT CHÚC PHÚC HOÀNG GIA */}
        <section className="px-5 py-6 bg-[#36080A]/80 border-t border-amber-900/60 rounded-3xl mx-4 space-y-6">
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

        {/* 8. BOTTOM DOCK CỐ ĐỊNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#3B090B]/95 backdrop-blur-md border-t-2 border-[#D4AF37] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3D1] to-[#AA8222] text-[#4A0E10] text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-5 rounded-full bg-black/50 border border-[#D4AF37] text-[#F4D080] text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4 text-amber-300" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
