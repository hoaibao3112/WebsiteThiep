"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import { CountdownUnits } from "./common/CountdownUnits";
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift, Film, Heart } from "lucide-react";

export const Template07Cinematic: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-12-19T12:00:00Z");

  const groomName = data.groom?.fullName || "Quang Huy";
  const groomShort = data.groom?.shortName || "Quang Huy";
  const brideName = data.bride?.fullName || "Thuỳ Linh";
  const brideShort = data.bride?.shortName || "Thuỳ Linh";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/templates/template-07-cinematic.png";

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#1C1C1C] font-serif pb-28 sm:pb-32 overflow-x-hidden selection:bg-stone-200">
      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-white shadow-[0_20px_70px_rgba(0,0,0,0.15)] sm:border-x border-stone-200 relative">

        {/* 1. HERO CINEMATIC VERTICAL PHOTO TRÊN ĐỒI THÔNG */}
        <section className="relative w-full aspect-[9/16] overflow-hidden bg-stone-900 text-white">
          <motion.img
            src={coverPhoto}
            alt="Cinematic Poster"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Top quote */}
          <div className="absolute top-6 left-4 right-4 text-center">
            <p className="text-[10px] text-stone-200 italic font-serif leading-relaxed max-w-xs mx-auto">
              “I love three things in this world... Sun, moon and you.<br />
              Sun for morning, moon for night, and you forever.”
            </p>
            <span className="text-lg font-serif italic tracking-wider text-white font-bold block pt-3">
              Welcome to our wedding
            </span>
          </div>

          <div className="absolute top-28 left-6">
            <span className="text-2xl font-serif italic text-amber-200 block drop-shadow">
              We got married
            </span>
          </div>

          {/* Bride & Groom names on hero sides */}
          <div className="absolute bottom-12 left-6 right-6 flex items-end justify-between text-white drop-shadow-md">
            <div>
              <h3 className="text-lg font-serif font-bold">{brideShort}</h3>
              <span className="text-[10px] uppercase font-mono tracking-widest text-stone-300">BRIDE</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-mono tracking-widest text-amber-200">19.12.2026</span>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-serif font-bold">{groomShort}</h3>
              <span className="text-[10px] uppercase font-mono tracking-widest text-stone-300">GROOM</span>
            </div>
          </div>
        </section>

        {/* 2. STRIP BAR: WEDDING / INVITATION / 2026 */}
        <div className="py-2.5 px-6 bg-white border-y border-stone-200 flex items-center justify-between text-[11px] font-serif uppercase tracking-[0.25em] text-stone-700 font-bold">
          <span>WEDDING</span>
          <span>INVITATION</span>
          <span>2026</span>
        </div>

        {/* 3. LANDSCAPE PHOTO: RIGHT LOVE | RIGHT REASON */}
        <section className="relative w-full aspect-[16/10] overflow-hidden bg-stone-900 text-white text-center flex flex-col justify-end p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverPhoto} alt="Right Love" className="absolute inset-0 w-full h-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <p className="text-xs font-serif italic text-amber-200 tracking-wider">
              Right love | Right reason | Right for you
            </p>
            <p className="text-[10px] text-stone-200 leading-tight">
              To Our Family And Friends, Thank You For Celebrating Our Special Day.
            </p>
          </div>
        </section>

        {/* 4. OUR LOVE STORY / FALL IN LOVE VỚI CHỮ SWEET ĐỎ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 text-center space-y-4 bg-white border-b border-stone-200"
        >
          <div className="space-y-0.5">
            <h3 className="text-xl font-serif font-bold text-stone-900 tracking-widest uppercase">
              OUR LOVE STORY
            </h3>
            <span className="text-xs font-serif italic text-stone-500 block">Fall in love</span>
          </div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelectPhoto(coverPhoto)}
            className="relative max-w-xs mx-auto aspect-[4/3] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPhoto} alt="Sweet Couple" className="w-full h-full object-cover transition duration-500" />
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-2 right-3 text-3xl font-serif italic text-[#C92A2A] select-none drop-shadow inline-block"
            >
              Sweet
            </motion.span>
          </motion.div>

          <p className="text-xs text-stone-600 leading-relaxed italic max-w-xs mx-auto pt-2">
            “Trước đây cứ nghĩ đám cưới chỉ là một thông báo chính thức, giờ mới hiểu đó là một dịp hiếm hoi để mọi người tụ họp... Chúng mình, hẹn gặp nhau trong ngày cưới nhé!”
          </p>
          <span className="text-xs font-mono font-bold text-stone-800 block">19.12.2026</span>
        </motion.section>

        {/* 5. FALL IN LOVE & KHỐI ẢNH ÔM NHAU */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 text-center space-y-4 bg-[#FAF8F5] border-b border-stone-200"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full bg-[#8E1C1F] text-white flex items-center justify-center text-sm font-bold shadow-xs"
            >
              囍
            </motion.div>
            <div className="text-left">
              <span className="text-xs font-serif font-bold tracking-widest text-[#8E1C1F] uppercase block">FALL IN LOVE</span>
              <span className="text-[10px] text-stone-400 italic font-serif">Mộng rằng khi ngoảnh lại ta vẫn có nhau</span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelectPhoto(coverPhoto)}
            className="relative max-w-xs mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-stone-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPhoto} alt="Love and freedom" className="w-full h-full object-cover transition duration-300" />
            <div className="absolute bottom-3 left-4 text-left">
              <span className="text-sm font-serif italic text-white block drop-shadow">love and freedom</span>
              <span className="text-xl font-serif italic text-[#C92A2A] font-bold block drop-shadow">
                you And gentleness
              </span>
            </div>
          </motion.div>
        </motion.section>

        {/* 6. LỊCH THÁNG NHÚNG TRÊN ẢNH NỀN & COUNTDOWN ĐỎ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[3/4] overflow-hidden bg-stone-900 text-white flex flex-col justify-between p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={coverPhoto}
            alt="Calendar overlay"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between text-xs font-mono tracking-widest text-stone-300 border-b border-white/20 pb-2">
            <span>NO.12</span>
            <span>2026</span>
            <span>FALL IN</span>
            <span>LOVE</span>
          </div>

          {/* Lưới lịch tháng 12 với trái tim trên ngày 19 */}
          <div className="relative z-10 max-w-xs mx-auto w-full p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center">
            <div className="grid grid-cols-7 gap-1 text-[11px] font-mono text-stone-300 pb-1">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-xs font-mono">
              <span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span>
              <span>15</span><span>16</span><span>17</span><span>18</span>
              {/* Ngày 19 khoanh trái tim đỏ */}
              <span className="relative font-bold text-[#E03131] flex items-center justify-center">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 border-2 border-[#E03131] rounded-full w-6 h-6 m-auto"
                />
                <span className="relative z-10">19</span>
              </span>
              <span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
              <span>27</span><span>28</span><span>29</span><span>30</span><span>31</span>
            </div>
          </div>

          <div className="relative z-10 text-center space-y-1">
            <p className="text-xs font-sans text-stone-200">
              Thứ Bảy, 19.12.2026 | Âm Lịch 11/11 | 12:00 PM
            </p>
            <CountdownUnits targetDate={targetDate} style="boxes-burgundy" showCalendarButton={false} />
          </div>
        </motion.section>

        {/* 6.5. POEM & EDITORIAL 2-PHOTO GRID VỚI VERTICAL TYPOGRAPHY (PART 3 TRONG ẢNH MẪU) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 text-center space-y-5 bg-[#FDFBF7] border-b border-stone-200"
        >
          {/* Khổ thơ điện ảnh 1 */}
          <div className="space-y-1 text-xs font-serif italic text-stone-600 leading-relaxed max-w-xs mx-auto">
            <p>Ánh trời bừng sáng soi vào chốn nhân gian</p>
            <p>Ta vượt ngàn sông núi</p>
            <p>Chỉ để cùng em</p>
            <p className="font-semibold text-stone-800">Đi qua bốn mùa, dùng chung ba bữa</p>
          </div>

          {/* Bộ đôi ảnh tạp chí so le */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(coverPhoto)}
              className="aspect-[3/4] rounded-xl overflow-hidden shadow-sm bg-stone-200 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPhoto} alt="Editorial 1" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(coverPhoto)}
              className="aspect-[3/4] rounded-xl overflow-hidden shadow-sm bg-stone-200 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPhoto} alt="Editorial 2" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <p className="text-[11px] font-serif italic text-[#3B5E43] max-w-xs mx-auto">
            “As the clouds and mist dissipate, love you and everyone knows it”
          </p>

          {/* Ảnh vuông lớn kèm chữ đứng FOREVER AND EVER */}
          <div className="relative max-w-xs mx-auto flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectPhoto(coverPhoto)}
              className="flex-1 aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-stone-200 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPhoto} alt="Embracing Moment" className="w-full h-full object-cover" />
            </motion.div>
            <div className="writing-vertical text-[10px] font-mono tracking-[0.3em] uppercase text-stone-400 font-bold select-none">
              FOREVER · AND · EVER
            </div>
          </div>

          {/* Khổ thơ điện ảnh 2 */}
          <div className="space-y-1 text-xs font-serif italic text-stone-600 leading-relaxed max-w-xs mx-auto pt-2">
            <p>Em tựa mây trời băng qua ngàn đồi biếc</p>
            <p>Thoáng hiện như cánh chim muôn hoa bừng nở</p>
            <p>Giữa nhân gian cỏ cây vô tận</p>
            <p className="text-stone-800 font-medium">Riêng anh chỉ thấy em là ngọn núi xanh dịu dàng</p>
          </div>
        </motion.section>

        {/* 7. ĐỊA ĐIỂM PROMES CENTER CHỮ NEON ĐỎ & BẢN ĐỒ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 text-center space-y-4 bg-white border-b border-stone-200"
        >
          <div className="space-y-1">
            <motion.h4
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl font-serif italic text-[#C92A2A] font-bold"
            >
              Promes Center
            </motion.h4>
            <p className="text-xs text-stone-600">
              122-124 Xuân Thủy — Cầu Giấy — Hà Nội
            </p>
          </div>

          <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white p-2">
            <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-stone-100">
              <iframe
                title="Promes Center Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.897!2d105.78!3d21.037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAyJzEzLjIiTiAxMDXCsDQ2JzQ4LjAiRQ!5e0!3m2!1svi!2s!4v1620000000000"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />
            </div>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold text-[#C92A2A] hover:bg-stone-100 transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ đường trên Google Maps</span>
            </motion.a>
          </div>

          {/* Dải ảnh panorama ngang: LOVE YOU FOREVER AND EVER */}
          <div className="pt-3">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden relative shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPhoto} alt="Panorama Love" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30" />
            </div>
            <div className="py-2 flex items-center justify-between text-[10px] font-serif uppercase tracking-[0.25em] text-stone-500 font-semibold px-2">
              <span>LOVE YOU</span>
              <span>FOREVER</span>
              <span>AND EVER</span>
            </div>
          </div>
        </motion.section>

        {/* 8. YOU ARE MY SUNSHINE & KHỐI RSVP */}
        <section className="relative w-full aspect-[9/16] overflow-hidden bg-stone-900 text-white flex flex-col justify-between p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverPhoto} alt="Sunshine" className="absolute inset-0 w-full h-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

          <div className="relative z-10 pt-6">
            <span className="text-2xl sm:text-3xl font-serif italic text-amber-100 drop-shadow block">
              You are my
            </span>
            <span className="text-3xl sm:text-4xl font-serif italic text-white font-bold drop-shadow block">
              Sunshine
            </span>
          </div>

          {/* Khối RSVP trắng trong suốt ở đáy */}
          <div className="relative z-10 p-5 rounded-2xl bg-white/95 backdrop-blur-md text-stone-900 shadow-xl space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 block">R.S.V.P.</span>
            <h5 className="text-sm font-serif font-bold text-stone-900">Xác nhận tham dự</h5>
            <p className="text-[11px] text-stone-500">
              Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
            </p>
            <div className="pt-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenRsvp}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-sans font-bold hover:bg-black transition shadow cursor-pointer"
              >
                ✍️ Gửi xác nhận
              </motion.button>
            </div>
          </div>
        </section>

        {/* 9. BOTTOM DOCK CỐ ĐỊNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-5 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4 text-[#C92A2A]" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
