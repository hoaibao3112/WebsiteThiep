"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import { CountdownUnits } from "./common/CountdownUnits";
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift, Calendar, Heart } from "lucide-react";
import { KineticText, LivingPhoto, MarqueeRibbon, FloatingQuote } from "../effects/MotionElements";

export const Template04CrimsonMarsala: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-12-20T16:00:00Z");

  const groomName = data.groom?.fullName || "Nguyễn Minh";
  const groomShort = data.groom?.shortName || "Nguyễn Minh";
  const brideName = data.bride?.fullName || "Bùi Phương";
  const brideShort = data.bride?.shortName || "Bùi Phương";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/templates/template-04-marsala.png";

  const groomAvatar = data.groom?.avatarUrl || "/images/demo/groom-avatar.png";
  const brideAvatar = data.bride?.avatarUrl || "/images/demo/bride-avatar.png";

  return (
    <div className="relative min-h-screen bg-[#F7F2EB] text-[#2C1810] font-sans pb-28 sm:pb-32 overflow-x-hidden selection:bg-rose-200">
      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-white shadow-[0_15px_60px_rgba(107,23,36,0.12)] sm:border-x border-[#EFE5D8] relative">

        {/* 1. HERO ARCH COVER VỚI 2 ẢNH POLAROID LỒNG NHAU */}
        <section className="relative w-full aspect-[4/5] overflow-hidden bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={coverPhoto}
            alt="Marsala Wedding Arch"
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Save the date overlay top left */}
          <div className="absolute top-4 left-4 text-white space-y-0.5">
            <span className="text-sm font-serif italic text-amber-200 block">Save the date</span>
            <span className="text-xs font-mono tracking-widest text-stone-300">20.12.2026</span>
          </div>

          {/* 2 White Polaroid frames overlapping bottom of hero với gleam overlay */}
          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onSelectPhoto(groomAvatar)}
              className="bg-white p-2 pb-3 shadow-lg rounded-xl text-center cursor-pointer gleam-overlay"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={groomAvatar} alt="Groom" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-stone-500 block">GROOM</span>
              <p className="text-xs font-serif italic font-bold text-[#6B1724] animate-shimmer-text">{groomName}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onSelectPhoto(brideAvatar)}
              className="bg-white p-2 pb-3 shadow-lg rounded-xl text-center cursor-pointer gleam-overlay"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brideAvatar} alt="Bride" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-stone-500 block">BRIDE</span>
              <p className="text-xs font-serif italic font-bold text-[#6B1724] animate-shimmer-text">{brideName}</p>
            </motion.div>
          </div>
        </section>

        {/* KINETIC MARQUEE RIBBON */}
        <MarqueeRibbon
          text="CRIMSON WINE MARSALA • NGUYỄN MINH & BÙI PHƯƠNG • 20.12.2026 • TRÂN TRỌNG BÁO HỶ"
          bgClass="bg-[#6B1724] text-amber-200"
        />

        {/* 2. TRÂN TRỌNG KÍNH MỜI & CỔNG VÒM LA MÃ */}
        <section className="p-6 text-center space-y-4 bg-[#FAF7F2] border-b border-[#EFE5D8]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">
              TRÂN TRỌNG KÍNH MỜI
            </span>
            <h3 className="text-2xl font-serif italic text-[#6B1724] font-bold">
              Quý Khách
            </h3>
            <p className="text-xs text-stone-600">
              Dự Tiệc mừng Lễ Thành Hôn của chúng mình
            </p>
          </div>

          {/* Cổng vòm Roman Arch có thấu kính lịch tròn */}
          <div
            onClick={() => onSelectPhoto(coverPhoto)}
            className="relative mx-auto w-full max-w-[320px] aspect-[4/5] rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl p-2 bg-gradient-to-b from-[#8B1E2D] via-[#6B1724] to-[#4A0E18] cursor-pointer group"
          >
            <div className="relative w-full h-full rounded-t-full rounded-b-xl overflow-hidden bg-stone-900">
              <motion.img
                src={coverPhoto}
                alt="Arch Cover"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

              <div className="absolute top-5 left-0 right-0 text-center">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-200">
                  WELCOME TO OUR WEDDING
                </span>
              </div>

              {/* Thấu kính lịch tròn màu đỏ rượu trong suốt */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-52 h-52 rounded-full bg-black/55 backdrop-blur-md border border-white/20 p-3 flex flex-col items-center justify-center text-white text-center shadow-lg">
                <span className="text-[9px] font-mono tracking-widest text-amber-200 block -mt-1 mb-1">
                  2026
                </span>
                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-stone-400 pb-0.5">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                </div>
                <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-[9px] font-mono">
                  <span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span>
                  <span>15</span><span>16</span><span>17</span><span>18</span><span>19</span>
                  {/* Ngày 20 khoanh tròn trái tim */}
                  <span className="relative font-bold text-rose-400 flex items-center justify-center">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 border border-rose-400 rounded-full w-4 h-4 m-auto"
                    />
                    <span className="relative z-10">20</span>
                  </span>
                  <span>21</span>
                  <span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span>
                  <span>29</span><span>30</span><span>31</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 2 THẺ TIỆC CƯỚI MÀU ĐỎ RƯỢU MARSALA (NHÀ TRAI & NHÀ GÁI) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-white border-b border-[#EFE5D8] space-y-4"
        >
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B1724]">
              THƯ MỜI TIỆC CƯỚI
            </span>
            <div className="flex items-center justify-center gap-2 text-[#6B1724] text-xs">
              <span>—</span>
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                🌸
              </motion.span>
              <span>—</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* THẺ NHÀ TRAI */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-3xl bg-[#5C131F] text-white text-center shadow-lg space-y-1.5"
            >
              <h4 className="font-serif font-bold text-base tracking-wider text-amber-100 uppercase">
                TIỆC CƯỚI NHÀ TRAI
              </h4>
              <p className="text-xs font-sans text-stone-300">CHỦ NHẬT — 16:00</p>
              <p className="text-2xl font-serif font-bold tracking-widest text-amber-200 py-0.5">
                20.12.2026
              </p>
              <p className="text-[11px] text-stone-300 italic font-serif">
                Tức ngày 06 tháng 11 năm Bính Ngọ
              </p>
              <h5 className="font-serif font-bold text-xs uppercase text-white pt-1">
                TẠI KHU PHỐ XUÂN THƯỢNG
              </h5>
              <p className="text-[11px] text-stone-300">
                Quảng Vinh, Nam Sầm Sơn, Thanh Hóa
              </p>
              <div className="pt-2">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-1.5 rounded-full bg-white text-[#5C131F] text-[11px] font-sans font-bold shadow hover:bg-stone-100 transition cursor-pointer"
                >
                  Xem chỉ đường
                </motion.a>
              </div>
            </motion.div>

            {/* THẺ NHÀ GÁI */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-3xl bg-[#5C131F] text-white text-center shadow-lg space-y-1.5"
            >
              <h4 className="font-serif font-bold text-base tracking-wider text-amber-100 uppercase">
                TIỆC CƯỚI NHÀ GÁI
              </h4>
              <p className="text-xs font-sans text-stone-300">THỨ BẢY — 16:00</p>
              <p className="text-2xl font-serif font-bold tracking-widest text-amber-200 py-0.5">
                19.12.2026
              </p>
              <p className="text-[11px] text-stone-300 italic font-serif">
                Tức ngày 05 tháng 11 năm Bính Ngọ
              </p>
              <h5 className="font-serif font-bold text-xs uppercase text-white pt-1">
                TẠI TƯ GIA NHÀ GÁI
              </h5>
              <p className="text-[11px] text-stone-300">
                Xóm 9, Ngũ Phúc, Tống Trân, Hưng Yên
              </p>
              <div className="pt-2">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-1.5 rounded-full bg-white text-[#5C131F] text-[11px] font-sans font-bold shadow hover:bg-stone-100 transition cursor-pointer"
                >
                  Xem chỉ đường
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 4. WE GOT MARRIED & ZIGZAG TIỆC CHI TIẾT KÈM GOOGLE MAPS */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-[#FAF7F2] border-b border-[#EFE5D8] space-y-6"
        >
          <div className="text-center space-y-0.5">
            <span className="text-2xl font-serif italic text-[#8B2E20] block">
              We got married
            </span>
            <h3 className="text-lg font-serif font-bold text-[#5C131F] uppercase tracking-wider">
              LỄ THÀNH HÔN
            </h3>
            <p className="text-xs text-stone-500 font-sans">CHỦ NHẬT</p>
            <div className="flex items-center justify-center gap-3 my-1">
              <span className="text-xs font-bold text-stone-600 uppercase">THÁNG 12</span>
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl font-serif font-bold text-[#5C131F] inline-block"
              >
                20
              </motion.span>
              <span className="text-xs font-bold text-stone-600 uppercase">NĂM 2026</span>
            </div>
            <p className="text-xs font-mono font-bold text-stone-700">16:00</p>
            <p className="text-[11px] text-stone-400 italic">Nhằm ngày 06 tháng 11 năm Bính Ngọ</p>
          </div>

          {/* ZIGZAG ROW 1: ẢNH BÊN TRÁI ➔ ĐỊA CHỈ & MAP BÊN PHẢI */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(coverPhoto)}
              className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPhoto} alt="Couple Detail" className="w-full h-full object-cover transition duration-300" />
            </motion.div>

            <div className="space-y-2 text-xs">
              <span className="text-xs font-serif italic tracking-widest text-[#6B1724] font-bold block">
                ADDRESS
              </span>
              <h5 className="font-serif font-bold text-[#5C131F] uppercase text-xs">
                TƯ GIA NHÀ TRAI
              </h5>
              <p className="text-[11px] text-stone-600 leading-tight">
                Quảng Vinh, Nam Sầm Sơn, Thanh Hóa
              </p>
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <iframe
                  title="Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3753.864!2d105.88!3d19.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDQ1JzAwLjAiTiAxMDXCsDUyJzQ4LjAiRQ!5e0!3m2!1svi!2s!4v1620000000000"
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* 4 Khối countdown màu đỏ đậm */}
          <div className="pt-2">
            <CountdownUnits targetDate={targetDate} style="boxes-burgundy" showCalendarButton={false} />
          </div>

          {/* CÂU ĐỐI THƠ TÌNH */}
          <div className="pt-4 text-center space-y-1 border-t border-[#EFE5D8]">
            <p className="text-xs font-serif italic text-stone-600">
              “Hôn duyên nên nghĩa vợ chồng”
            </p>
            <p className="text-xs font-serif italic text-stone-600">
              “Trăm năm giữ trọn tấm lòng cùng nhau”
            </p>
          </div>
        </motion.section>

        {/* 5. ALBUM ẢNH CƯỚI VINTAGE XẾP LỚP */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-white border-b border-[#EFE5D8] space-y-4"
        >
          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(coverPhoto)}
              className="aspect-[16/10] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPhoto} alt="Marsala Album 1" className="w-full h-full object-cover transition duration-500" />
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {card.photos.slice(1, 3).map((p, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => onSelectPhoto(p.url)}
                  className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-stone-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="Marsala Album 2" className="w-full h-full object-cover transition duration-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 6. KHỐI RSVP ĐỎ RƯỢU */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 bg-[#FAF7F2] border-b border-[#EFE5D8] text-center space-y-3"
        >
          <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">R.S.V.P.</span>
          <h4 className="text-base font-serif font-bold text-[#5C131F]">Xác nhận tham dự</h4>
          <div className="pt-1">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenRsvp}
              className="px-8 py-2.5 rounded-full bg-[#5C131F] text-white text-xs font-sans font-bold hover:bg-[#430D16] transition shadow cursor-pointer"
            >
              ✍️ Gửi xác nhận
            </motion.button>
          </div>
        </motion.section>

        {/* 7. HỘP QUÀ MỪNG CƯỚI TRÁI TIM 3D */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 bg-white border-b border-[#EFE5D8] text-center space-y-3"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenGift}
            className="cursor-pointer inline-block"
          >
            {/* Hộp quà hình trái tim 3D có nhịp nảy nhẹ */}
            <div className="w-20 h-16 mx-auto relative flex items-center justify-center">
              <motion.span
                animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl select-none filter drop-shadow inline-block"
              >
                💝
              </motion.span>
            </div>
            <h5 className="text-xs font-serif italic text-stone-600 font-bold mt-2">
              Gửi quà tới cô dâu chú rể
            </h5>
            <span className="text-[10px] text-stone-400 block font-sans">
              Chạm để xem tài khoản mừng cưới
            </span>
          </motion.div>
        </motion.section>

        {/* 8. LỜI CẢM ƠN THANKS VỚI ẢNH CÔ DÂU CHÚ RỂ */}
        <section className="relative w-full aspect-[3/4] overflow-hidden bg-[#5C131F]">
          <motion.img
            src={coverPhoto}
            alt="Marsala Thanks"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

          <div className="absolute bottom-6 left-0 right-0 text-center">
            <h3 className="text-3xl sm:text-4xl font-serif tracking-[0.25em] text-white font-light uppercase">
              THANKS
            </h3>
          </div>
        </section>

        {/* 9. BOTTOM DOCK CỐ ĐỊNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#5C131F]/95 backdrop-blur-md border-t border-white/20 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-[#430D16] text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-5 rounded-full bg-white/10 border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4 text-amber-200" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
