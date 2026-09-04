"use client";

import React, { useState } from "react";
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
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift, Calendar, Heart, Share2, Music, Send, QrCode } from "lucide-react";

export const Template05ForestBotanical: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-08-02T10:30:00Z");

  const groomName = data.groom?.fullName || "Nguyễn Tuấn Minh";
  const groomShort = data.groom?.shortName || "Tuấn Minh";
  const brideName = data.bride?.fullName || "Lê Mai Lan";
  const brideShort = data.bride?.shortName || "Mai Lan";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/templates/template-05-forest.png";

  const groomAvatar = data.groom?.avatarUrl || "/images/demo/groom-avatar.png";
  const brideAvatar = data.bride?.avatarUrl || "/images/demo/bride-avatar.png";

  const photos = card.photos && card.photos.length >= 7 ? card.photos : [
    { id: "p1", url: "/images/demo/couple-cover.png", caption: "Nụ cười ngày chung đôi" },
    { id: "p2", url: "/images/demo/couple-studio.png", caption: "Hạnh phúc ngập tràn" },
    { id: "p3", url: "/images/demo/couple-aodai.png", caption: "Tình yêu thảo mộc" },
    { id: "p4", url: "/images/templates/template-05-forest.png", caption: "Tà voan trắng giữa rừng thông" },
    { id: "p5", url: "/images/demo/groom-avatar.png", caption: "Chú rể Tuấn Minh" },
    { id: "p6", url: "/images/demo/bride-avatar.png", caption: "Cô dâu Mai Lan" },
    { id: "p7", url: "/images/templates/references/mau-05-rustic-forest-green-part-02.png", caption: "Kỷ niệm sân vườn ngoài trời" },
  ];

  const [wishInput, setWishInput] = useState("");
  const [wishSent, setWishSent] = useState(false);

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishInput.trim()) return;
    setWishSent(true);
    setWishInput("");
    setTimeout(() => setWishSent(false), 3000);
  };

  return (
    <div className="relative min-h-screen bg-[#F5F8F4] text-[#1E3823] font-sans pb-28 sm:pb-32 overflow-x-hidden selection:bg-emerald-200">
      {/* Background họa tiết lá rừng & đốm nắng nhẹ */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#47664B_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-white shadow-[0_20px_70px_rgba(45,74,48,0.14)] sm:border-x border-[#DCE7DD] relative z-10">

        {/* ─────────────────────────────────────────────────────────────────────────────
            📍 PHẦN 1 (mau-05-rustic-forest-green-part-01.png):
            PHONG BÌ 3D HOA DẠI, LỊCH POLAROID "MY LOVE", BỐ CỤC ĐỐI DIỆN LỒNG THƠ TÌNH
           ───────────────────────────────────────────────────────────────────────────── */}
        <section className="pt-8 pb-7 px-4 text-center bg-gradient-to-b from-[#F2F6F1] via-white to-white border-b border-[#E3ECE5] space-y-4 relative overflow-hidden">
          {/* Nút share & audio góc trên */}
          <div className="flex items-center justify-between px-2 text-[#47664B]">
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs shadow-xs flex items-center justify-center text-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs shadow-xs flex items-center justify-center text-xs">
              <Music className="w-4 h-4" />
            </div>
          </div>

          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl font-serif italic text-[#47664B] block tracking-wide font-normal"
          >
            We got married
          </motion.span>

          {/* Phong bì xanh rêu thảo mộc 3D với 2 ảnh Polaroid thò ra & hoa dại */}
          <div className="relative max-w-xs mx-auto pt-6 pb-2">
            {/* Cành hoa dại bên trái phong bì */}
            <div className="absolute -left-3 top-2 w-14 h-24 pointer-events-none z-0 opacity-90">
              <svg viewBox="0 0 60 100" fill="none" className="w-full h-full">
                <path d="M30 90 Q20 50 15 20 Q10 40 5 60" stroke="#3D5A3A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="15" cy="18" r="6" fill="#F4C430" />
                <circle cx="15" cy="18" r="2.5" fill="#8E4A10" />
                <circle cx="28" cy="35" r="5" fill="#FFFFFF" stroke="#3D5A3A" strokeWidth="1" />
                <circle cx="8" cy="45" r="4.5" fill="#E67E22" />
                <path d="M22 65 Q12 55 18 48" fill="#4B6E48" opacity="0.8" />
              </svg>
            </div>

            {/* 2 Tấm ảnh Polaroid nghiêng góc thò ra từ lòng phong bì */}
            <div className="flex justify-center -space-x-5 mb-[-2.4rem] relative z-10">
              <motion.div
                whileHover={{ rotate: -4, y: -6, scale: 1.03 }}
                onClick={() => onSelectPhoto(brideAvatar)}
                className="w-32 aspect-[3/4] bg-white p-1.5 pb-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] rounded-xs -rotate-7 border border-stone-200/80 cursor-pointer transition-transform"
              >
                <div className="w-full h-full overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brideAvatar} alt="Bride" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ rotate: 4, y: -6, scale: 1.03 }}
                onClick={() => onSelectPhoto(groomAvatar)}
                className="w-32 aspect-[3/4] bg-white p-1.5 pb-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] rounded-xs rotate-6 border border-stone-200/80 cursor-pointer transition-transform"
              >
                <div className="w-full h-full overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={groomAvatar} alt="Groom" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>

            {/* Thân phong bì màu xanh rêu với nắp tam giác 3D */}
            <div className="w-full aspect-[5/3] bg-[#3B4C35] rounded-2xl shadow-[0_16px_35px_rgba(30,56,35,0.25)] relative flex items-center justify-center border border-[#2B3A26] overflow-hidden">
              {/* Nắp gấp hình tam giác */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#2F3D2A] to-[#3B4C35] [clip-path:polygon(0_0,100%_0,50%_48%)] opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#263222] to-transparent [clip-path:polygon(0_100%,100%_100%,50%_48%)] opacity-90" />

              {/* Con dấu sáp xanh rêu viền vàng bóng */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4D6546] to-[#243321] border-2 border-[#D4AF37]/80 flex items-center justify-center text-[#F4C430] text-sm font-bold shadow-xl relative z-20 cursor-pointer"
              >
                <span className="font-serif">TM</span>
              </motion.div>

              {/* Bó hoa dại trang trí góc phải dưới phong bì */}
              <div className="absolute -right-1 -bottom-1 w-16 h-16 pointer-events-none z-30">
                <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-md">
                  <circle cx="55" cy="55" r="8" fill="#F4C430" />
                  <circle cx="42" cy="48" r="7" fill="#E74C3C" />
                  <circle cx="62" cy="42" r="6" fill="#3498DB" />
                  <circle cx="48" cy="62" r="6" fill="#9B59B6" />
                  <circle cx="35" cy="58" r="5" fill="#FFFFFF" />
                  <path d="M48 52 Q35 70 25 80" stroke="#27AE60" strokeWidth="2.5" />
                  <path d="M52 56 Q45 75 35 85" stroke="#2ECC71" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tên cặp đôi font chữ thảo xanh ngọc & ngày tháng */}
          <div className="pt-2 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-[#264E36] tracking-wide">
              {groomShort} <span className="text-[#3B5E43] font-normal">&amp;</span> {brideShort}
            </h2>
            <p className="text-sm font-mono tracking-widest text-[#47664B] font-semibold">02·08·2026</p>
          </div>
        </section>

        {/* 2. THẺ POLAROID MY LOVE & LỊCH THÁNG 8 TRỰC QUAN (mau-05 part-01) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-5 sm:p-6 bg-[#FCFAF7] border-b border-[#E3ECE5]"
        >
          <div className="rounded-3xl bg-[#3E4E38] text-white p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4 border border-[#2E3C29]">
            {/* Polaroid My Love */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              onClick={() => onSelectPhoto(coverPhoto)}
              className="w-36 bg-white p-2 pb-5 rounded-xs shadow-md text-center text-stone-900 shrink-0 cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden bg-stone-100 mb-1.5 rounded-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPhoto} alt="My Love" className="w-full h-full object-cover transition duration-300" />
              </div>
              <span className="text-xs font-serif italic text-stone-600 block pt-0.5">My Love</span>
            </motion.div>

            {/* Lưới lịch tháng 8 */}
            <div className="flex-1 w-full text-center sm:text-left space-y-1">
              <span className="text-xs font-mono font-bold text-amber-200 block text-right pr-2 tracking-wider">
                Tháng 08.2026
              </span>
              <div className="grid grid-cols-7 gap-1 text-[10px] font-mono text-stone-300 pb-1 text-center font-medium">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs font-mono text-white">
                <span></span><span></span><span></span><span></span><span></span><span>1</span>
                {/* Ngày 2 khoanh trái tim vàng cam */}
                <span className="relative font-bold text-amber-300 flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 border-2 border-amber-300 rounded-full w-5 h-5 m-auto shadow-[0_0_8px_rgba(244,196,48,0.6)]"
                  />
                  <span className="relative z-10">2</span>
                </span>
                <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
                <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span>
                <span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span>
                <span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
                <span>31</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. TRÂN TRỌNG KÍNH MỜI & CẶP ẢNH ĐỐI DIỆN LỒNG THƠ TÌNH (mau-05 part-01) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-5 sm:p-7 bg-white border-b border-[#E3ECE5] text-center space-y-6"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-sans font-bold tracking-[0.25em] uppercase text-stone-400">
              TRÂN TRỌNG KÍNH MỜI
            </span>
            <h3 className="text-3xl font-serif italic text-[#3B5E43] font-bold">
              Quý Khách
            </h3>
            <p className="text-xs text-stone-500 font-sans tracking-wide">
              THAM DỰ TIỆC MỪNG LỄ THÀNH HÔN CỦA
            </p>

            {/* Nghệ thuật chữ lồng hoa dại ở dấu & */}
            <div className="pt-3 pb-2 flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1E3823]">
                {brideShort}
              </span>
              <span className="relative inline-flex items-center justify-center px-1">
                <span className="text-3xl font-serif italic text-[#3B5E43]">&amp;</span>
                {/* Mini bouquet lồng vào & */}
                <span className="absolute -top-2 -right-1 text-xs">💐</span>
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1E3823]">
                {groomShort}
              </span>
            </div>
          </div>

          {/* 2 Ảnh dọc đối diện và cột thơ ở giữa */}
          <div className="grid grid-cols-7 gap-2 items-center pt-2">
            {/* Ảnh cô dâu bên trái */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(brideAvatar)}
              className="col-span-3 aspect-[9/16] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100 border border-stone-200/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brideAvatar} alt="Cô Dâu Mai Lan" className="w-full h-full object-cover transition duration-300" />
            </motion.div>

            {/* Cột thơ màu xanh rêu ở giữa với chùm hoa */}
            <div className="col-span-1 py-4 px-1 rounded-2xl bg-[#3E4E38] text-white text-[9px] font-serif flex flex-col items-center justify-between h-full min-h-[160px] shadow-md border border-[#2D3C28]">
              <span className="[writing-mode:vertical-rl] tracking-wider leading-relaxed">
                Em là tình yêu anh muốn giữ
              </span>
              <div className="my-1.5 text-xs text-rose-300">🌸</div>
              <span className="[writing-mode:vertical-rl] tracking-wider leading-relaxed">
                Anh là hạnh phúc em muốn trao
              </span>
            </div>

            {/* Ảnh chú rể ôm bó hoa bi trắng bên phải */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(groomAvatar)}
              className="col-span-3 aspect-[9/16] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100 border border-stone-200/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={groomAvatar} alt="Chú Rể Tuấn Minh" className="w-full h-full object-cover transition duration-300" />
            </motion.div>
          </div>

          {/* Thông tin song thân hai họ */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-[#E3ECE5]">
            <div className="space-y-0.5 text-stone-700 text-center">
              <span className="font-bold text-[#3B5E43] block uppercase text-[11px] tracking-wider">NHÀ GÁI</span>
              <p className="font-semibold text-stone-900">{data.bride?.parents?.fatherName || "ÔNG NGUYỄN TRÍ THANH"}</p>
              <p className="font-semibold text-stone-900">{data.bride?.parents?.motherName || "BÀ LÊ THỊ HẢI"}</p>
            </div>
            <div className="space-y-0.5 text-stone-700 text-center">
              <span className="font-bold text-[#3B5E43] block uppercase text-[11px] tracking-wider">NHÀ TRAI</span>
              <p className="font-semibold text-stone-900">{data.groom?.parents?.fatherName || "ÔNG NGUYỄN VĂN TƯ"}</p>
              <p className="font-semibold text-stone-900">{data.groom?.parents?.motherName || "BÀ LÊ THỊ MAI"}</p>
            </div>
          </div>
        </motion.section>

        {/* 3.5. CHUYỆN TÌNH YÊU SÂN VƯỜN - LOVE STORY TIMELINE */}
        <section className="bg-white border-b border-[#E3ECE5]">
          <LoveStoryTimeline
            accentColor="#3E4E38"
            variant="botanical"
            onSelectPhoto={onSelectPhoto}
          />
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            📍 PHẦN 2 (mau-05-rustic-forest-green-part-02.png):
            THẺ SỰ KIỆN XANH RÊU LIỀN KHỐI 2 TIỆC, BỘ ĐẾM NGƯỢC XANH RÊU & ALBUM 3-1-3
           ───────────────────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-5 sm:p-7 bg-[#FCFAF7] border-b border-[#E3ECE5] space-y-5"
        >
          {/* Con dấu tròn đỏ liên kết hai phần */}
          <div className="flex justify-center -mb-3 relative z-20">
            <div className="w-8 h-8 rounded-full bg-[#9E2B2B] text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
              囍
            </div>
          </div>

          {/* Thẻ xanh rêu liền khối bao trọn cả 2 tiệc */}
          <div className="rounded-3xl bg-[#3E4E38] text-white p-6 shadow-2xl text-center space-y-6 border border-[#2E3C29] relative overflow-hidden">
            {/* TIỆC 1: DỰ BỮA CƠM THÂN MẬT (NHÀ GÁI) */}
            <div className="space-y-1.5 relative z-10">
              <span className="text-xs font-serif font-bold tracking-widest text-amber-200 uppercase block">
                DỰ BỮA CƠM THÂN MẬT
              </span>
              <p className="text-[11px] text-stone-300 font-sans tracking-wide">VÀO HỒI: 10 : 30 , CHỦ NHẬT</p>
              <p className="text-3xl sm:text-4xl font-serif font-bold tracking-wider text-white drop-shadow-xs">
                02 . 08 . 2026
              </p>
              <p className="text-[11px] text-stone-300 italic font-serif">
                Tức: Ngày 20 Tháng 07 Năm Bính Ngọ
              </p>
              <h5 className="font-serif font-bold text-sm uppercase text-white pt-1">
                TẠI TƯ GIA NHÀ GÁI
              </h5>
              <p className="text-xs text-stone-300 font-sans">
                Xóm 5 , Xã Phú Cát, Quốc Oai, Hà Nội
              </p>
              <div className="pt-2">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 rounded-full bg-white text-[#3E4E38] text-xs font-bold uppercase tracking-wider shadow-md hover:bg-stone-100 transition cursor-pointer"
                >
                  XEM CHỈ ĐƯỜNG
                </motion.a>
              </div>
            </div>

            <div className="w-3/4 mx-auto h-px bg-white/20 relative z-10" />

            {/* TIỆC 2: THAM DỰ HÔN LỄ (NHÀ TRAI) */}
            <div className="space-y-1.5 relative z-10">
              <span className="text-xs font-serif font-bold tracking-widest text-amber-200 uppercase block">
                THAM DỰ HÔN LỄ
              </span>
              <p className="text-[11px] text-stone-300 font-sans tracking-wide">VÀO HỒI: 12 : 30 , CHỦ NHẬT</p>
              <p className="text-3xl sm:text-4xl font-serif font-bold tracking-wider text-white drop-shadow-xs">
                02.08.2026
              </p>
              <p className="text-[11px] text-stone-300 italic font-serif">
                Tức: Ngày 20 Tháng 07 Năm Bính Ngọ
              </p>
              <h5 className="font-serif font-bold text-sm uppercase text-white pt-1">
                TẠI TƯ GIA NHÀ TRAI
              </h5>
              <p className="text-xs text-stone-300 font-sans">
                Hoàng Mai, Hà Nội
              </p>
              <div className="pt-2">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 rounded-full bg-white text-[#3E4E38] text-xs font-bold uppercase tracking-wider shadow-md hover:bg-stone-100 transition cursor-pointer"
                >
                  XEM CHỈ ĐƯỜNG
                </motion.a>
              </div>
            </div>

            {/* Bó hoa dại chân thẻ & câu chúc chân tình */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-center gap-2 text-left relative z-10">
              <span className="text-xl">💐</span>
              <p className="text-[11px] text-stone-200 italic font-serif leading-tight">
                Sự hiện diện của Quý Khách là niềm vinh hạnh cho gia đình chúng tôi
              </p>
            </div>
          </div>

          {/* 4 Khối countdown xanh rêu */}
          <div className="pt-1">
            <CountdownUnits targetDate={targetDate} style="boxes-forest" showCalendarButton={false} />
          </div>
        </motion.section>

        {/* 4.5. LỊCH TRÌNH TIỆC CƯỚI SÂN VƯỜN - WEDDING ITINERARY */}
        <section className="bg-white border-b border-[#E3ECE5]">
          <WeddingItinerary
            accentColor="#3E4E38"
            weddingDate={new Date(targetDate)}
            coupleNames={`${groomShort} & ${brideShort}`}
            venueName={mainEvent?.venueName}
            venueAddress={mainEvent?.address}
          />
        </section>

        {/* 4.6. DRESS CODE SECTION KHUYẾN NGHỊ */}
        <section className="bg-[#FCFAF7] border-b border-[#E3ECE5]">
          <DressCodeSection
            accentColor="#3E4E38"
            dressCodeTitle="Tone Màu Trang Phục Rustic"
          />
        </section>

        {/* 5. ALBUM ẢNH CƯỚI SÂN VƯỜN LIGHTBOX */}
        <section className="bg-white border-b border-[#E3ECE5]">
          <PhotoGalleryLightbox
            photos={photos.map((p) => ({ url: p.url, caption: p.caption }))}
            accentColor="#3E4E38"
            title="Album Ảnh Cưới Sân Vườn"
            subtitle="Hương thơm cây cỏ và những khoảnh khắc ngọt ngào bên nhau"
          />
        </section>

        {/* ─────────────────────────────────────────────────────────────────────────────
            📍 PHẦN 3 (mau-05-rustic-forest-green-part-03.png):
            LỜI DẶN DÒ, HỘP RSVP XANH RÊU, THẺ GỬI QUÀ MỪNG TRÁI TIM & LỜI CẢM ƠN SƯƠNG KHÓI
           ───────────────────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-6 bg-[#FCFAF7] border-b border-[#E3ECE5] text-center space-y-6"
        >
          {/* Lời dặn dò đón tiếp chu đáo */}
          <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed font-sans">
            Vui lòng điền xác nhận để chúng mình đón tiếp và chuẩn bị được chu đáo hơn. Trân trọng!
          </p>

          {/* Khối RSVP */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs max-w-sm mx-auto">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase block">R.S.V.P.</span>
            <h4 className="text-base font-serif font-bold text-[#1E3823]">Xác nhận tham dự</h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
            </p>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenRsvp}
                className="px-8 py-2.5 rounded-full bg-[#3E4E38] text-white text-xs font-sans font-bold hover:bg-[#2D3A29] transition shadow-md cursor-pointer"
              >
                ✍️ Gửi xác nhận
              </motion.button>
            </div>
          </div>

          {/* Thẻ Gửi Quà Mừng với phong bì trái tim nhô lên (mau-05 part-03) */}
          <div className="pt-2 max-w-xs mx-auto">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenGift}
              className="relative bg-[#3E4E38] text-white pt-6 pb-4 px-6 rounded-2xl shadow-xl cursor-pointer text-center border border-[#2E3C29]"
            >
              {/* Thẻ nhô lên ở đỉnh phong bì có con dấu trái tim */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl bg-[#F6EAE7] border-2 border-white shadow-md flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-400" />
              </div>

              <h5 className="text-base font-serif font-bold tracking-wide text-white pt-1">
                Gửi Quà Mừng
              </h5>
              <p className="text-[11px] text-stone-300 font-sans mt-0.5">
                Chạm để xem thông tin tài khoản &amp; gửi lời chúc
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* 6.5. NÚT THẢ TIM & DÒNG CHÚC PHÚC THẢO MỘC */}
        <section className="p-6 bg-[#FCFAF7] border-b border-[#E3ECE5] space-y-6">
          <div className="flex justify-center">
            <HeartBurstButton accentColor="#3E4E38" />
          </div>

          <div className="pt-2">
            <QuickWishWall
              cardId={card.id}
              accentColor="#3E4E38"
              guestName={guestName}
            />
          </div>
        </section>

        {/* 7. LỜI CẢM ƠN RỪNG SƯƠNG KHÓI & DÒNG CHỮ MADE WITH (mau-05 part-03) */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative py-14 px-6 text-center bg-stone-900 text-white overflow-hidden"
        >
          {/* Ảnh nền mờ với lớp sương khói */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverPhoto} alt="Garden Fog" className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-stone-900/90" />

          <div className="relative z-10 space-y-3 max-w-xs mx-auto">
            <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-200">
              Lời Cảm Ơn
            </h3>
            <p className="text-xs text-stone-200 leading-relaxed font-serif italic">
              “Trân trọng cảm ơn Quý Khách đã dành thời gian đến chung vui và chúc phúc cho chúng tôi. Sự hiện diện của Quý vị là niềm vinh hạnh và hạnh phúc lớn lao của gia đình chúng tôi.”
            </p>
            <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase pt-4">
              Made with Ngày chung đôi
            </p>
          </div>
        </motion.section>

        {/* 8. THANH DOCK CỐ ĐỊNH CHÂN MÀN HÌNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#3E4E38]/95 backdrop-blur-md border-t border-white/20 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between gap-2 max-w-md sm:max-w-lg mx-auto">
          {/* Ô nhập nhanh lời chúc */}
          <form onSubmit={handleSendWish} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={wishInput}
              onChange={(e) => setWishInput(e.target.value)}
              placeholder="Gửi lời chúc..."
              className="w-full pl-3 pr-8 py-2 bg-white/15 border border-white/30 rounded-full text-white placeholder:text-stone-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-300 transition"
            />
            <button
              type="submit"
              className="absolute right-2 text-amber-200 hover:text-white transition p-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Nút gửi quà mừng */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenGift}
            className="w-9 h-9 rounded-full bg-white/15 border border-white/30 text-amber-300 flex items-center justify-center shadow-xs cursor-pointer shrink-0"
            title="Gửi Quà Mừng"
          >
            <Gift className="w-4 h-4" />
          </motion.button>

          {/* Nút xác nhận RSVP */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenRsvp}
            className="py-2 px-3.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-[#243321] text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-1 cursor-pointer shrink-0"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>RSVP</span>
          </motion.button>
        </div>

        {/* Toast thông báo gửi lời chúc thành công */}
        <AnimatePresence>
          {wishSent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#243321] text-amber-200 text-xs px-4 py-2 rounded-full shadow-lg border border-amber-300/40"
            >
              Đã gửi lời chúc yêu thương thành công! ✨
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
