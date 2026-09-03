"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import { CountdownUnits } from "./common/CountdownUnits";
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift, Heart } from "lucide-react";
import { KineticText, LivingPhoto, MarqueeRibbon, FloatingQuote } from "../effects/MotionElements";

export const Template03SweetRomance: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-12-24T10:30:00Z");

  const groomName = data.groom?.fullName || "Phạm Quốc Huy";
  const groomShort = data.groom?.shortName || "Quốc Huy";
  const brideName = data.bride?.fullName || "Nguyễn Mai Anh";
  const brideShort = data.bride?.shortName || "Mai Anh";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/templates/template-03-sweet-pink.png";

  const brideAvatar = data.bride?.avatarUrl || "/images/demo/bride-avatar.png";
  const groomAvatar = data.groom?.avatarUrl || "/images/demo/groom-avatar.png";

  return (
    <div className="relative min-h-screen bg-[#FDF9F8] text-[#4A2E24] font-sans pb-28 sm:pb-32 overflow-x-hidden selection:bg-rose-200">
      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-white shadow-[0_15px_60px_rgba(184,74,57,0.12)] sm:border-x border-[#F2DDD7] relative">

        {/* 1. HEADER & RED ENVELOPE OPENER */}
        <section className="pt-8 pb-5 px-4 text-center bg-gradient-to-b from-[#FDF9F8] to-white border-b border-[#F5E5E0]">
          <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#B84A39]">
            WEDDING INVITATION
          </span>
          <h2 className="text-xl sm:text-2xl font-serif text-[#8B2E20] uppercase tracking-wider mt-1">
            THIỆP MỜI CƯỚI
          </h2>
          <div className="flex items-center justify-center gap-2 my-2 text-xl sm:text-2xl font-serif italic text-[#8B2E20]">
            <span>{brideShort}</span>
            <span className="text-rose-400">&amp;</span>
            <span>{groomShort}</span>
          </div>

          <div className="w-7 h-7 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-600 text-xs shadow-2xs mb-3">
            囍
          </div>

          {/* Phong bì đỏ sáp nến tròn mở nắp */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="mx-auto max-w-[280px] p-5 rounded-2xl bg-gradient-to-tr from-[#9B2C1D] to-[#BA3E2C] text-white shadow-lg cursor-pointer text-center relative overflow-hidden"
          >
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-300/30 border-2 border-amber-200 flex items-center justify-center text-amber-200 text-sm mb-2 shadow-inner">
              囍
            </div>
            <p className="text-xs font-serif italic tracking-wider text-amber-100">
              Chạm để mở thiệp &amp; xác nhận
            </p>
          </motion.div>
        </section>

        {/* KINETIC MARQUEE RIBBON */}
        <MarqueeRibbon
          text="SWEET ROMANCE INVITATION • PHẠM QUỐC HUY & NGUYỄN MAI ANH • 24.12.2026 • YES! I DO"
          bgClass="bg-[#BA3E2C] text-rose-100"
        />

        {/* 2. HERO PHOTO VỚI HỘP COUNTDOWN MÀU ĐẤT NUNG TRONG SUỐT */}
        <section className="p-4 sm:p-6 bg-[#FDF9F8] border-b border-[#F5E5E0]">
          <div
            onClick={() => onSelectPhoto(coverPhoto)}
            className="relative rounded-3xl overflow-hidden shadow-lg aspect-[4/5] bg-stone-100 cursor-pointer group"
          >
            <motion.img
              src={coverPhoto}
              alt="Sweet Couple"
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Inset translucent invitation card with countdown boxes */}
            <div className="absolute bottom-4 left-3 right-3 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md shadow-md text-center space-y-2">
              <CountdownUnits targetDate={targetDate} style="boxes-terracotta" showCalendarButton={false} />

              <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B84A39] font-bold block pt-1">
                I N V I T A T I O N
              </span>
              <p className="text-[11px] text-stone-600 leading-relaxed italic font-serif max-w-xs mx-auto">
                Gửi đến gia đình và bạn bè thân mến! Cảm ơn bạn đã dành thời gian quý báu để cùng chúng mình chung vui trong ngày đặc biệt này...
              </p>
            </div>
          </div>
        </section>

        {/* 3. THÔNG TIN HAI HỌ & BIG DATE (THÁNG 12 | 24 | NĂM 2026) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-white border-b border-[#F5E5E0] space-y-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-1 bg-[#8B2E20] h-20 rounded-full shrink-0 mt-1" />
            <div className="space-y-1">
              <span className="text-xs font-serif italic text-stone-500 block">Lễ Thành Hôn</span>
              <h3 className="text-xl sm:text-2xl font-serif italic text-[#8B2E20] font-bold animate-shimmer-text">
                {groomName}
              </h3>
              <span className="text-sm font-serif italic text-rose-400 block">&amp;</span>
              <h3 className="text-xl sm:text-2xl font-serif italic text-[#8B2E20] font-bold animate-shimmer-text">
                {brideName}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-stone-700 pt-2 border-t border-[#F5E5E0]">
            <div className="space-y-0.5">
              <span className="font-bold text-[#B84A39] block uppercase text-[11px]">Nhà Trai</span>
              <p>{data.groom?.parents?.fatherName || "Ông: Phạm Quang Hải"}</p>
              <p>{data.groom?.parents?.motherName || "Bà: Định Thị Mai"}</p>
              <span className="text-[10px] text-stone-400 italic">TP. Hà Nội</span>
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-[#B84A39] block uppercase text-[11px]">Nhà Gái</span>
              <p>{data.bride?.parents?.fatherName || "Ông: Nguyễn Tiến Minh"}</p>
              <p>{data.bride?.parents?.motherName || "Bà: Lê Thị Hải Yến"}</p>
              <span className="text-[10px] text-stone-400 italic">TP. Điện Biên</span>
            </div>
          </div>

          {/* Big Date Display */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="py-3 px-4 rounded-2xl bg-[#FDF9F8] border border-[#F5E5E0] text-center shadow-2xs"
          >
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              TIỆC MỪNG LỄ THÀNH HÔN VÀO LÚC 10:30 THỨ NĂM
            </span>
            <div className="flex items-center justify-center gap-4 my-1">
              <span className="text-sm font-bold text-[#4A2E24]">THÁNG 12</span>
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl font-serif font-bold text-[#B84A39] inline-block"
              >
                24
              </motion.span>
              <span className="text-sm font-bold text-[#4A2E24]">NĂM 2026</span>
            </div>
            <span className="text-[11px] text-stone-400 italic">
              (Tức ngày 17 tháng 11 năm Bính Ngọ)
            </span>
          </motion.div>

          {/* Địa điểm tổ chức Trống Đồng Palace */}
          <div className="space-y-2 text-center pt-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B84A39]">
              ĐỊA ĐIỂM TỔ CHỨC
            </span>
            <h4 className="text-lg font-serif font-bold text-[#8B2E20]">
              {mainEvent?.venueName || "TRỐNG ĐỒNG PALACE"}
            </h4>
            <p className="text-xs text-stone-500">
              {mainEvent?.address || "(08A Lý Văn Phúc, P. Ô Chợ Dừa, Tp Hà Nội)"}
            </p>

            {/* Embedded Google Maps card */}
            <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border border-[#F5E5E0] shadow-sm bg-white p-2 mt-2">
              <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-stone-100">
                <iframe
                  title="Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.116484391295!2d105.8288!3d21.028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAxJzQwLjgiTiAxMDXCsDQ5JzQzLjciRQ!5e0!3m2!1svi!2s!4v1620000000000"
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
                className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#FDF9F8] rounded-xl border border-[#F5E5E0] text-xs font-bold text-[#B84A39] hover:bg-rose-50 transition shadow-2xs cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Mở trong Google Maps</span>
              </motion.a>
            </div>
          </div>
        </motion.section>

        {/* 4. DUSTY PINK SECTION: SWEET WEDDING / MARRY ME? / YES! I DO */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-[#FDF9F8] border-b border-[#F5E5E0] space-y-4"
        >
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#B84A39]">
              S W E E T · W E D D I N G
            </span>
          </div>

          <div className="relative rounded-3xl bg-[#EEDAD6] p-5 overflow-hidden space-y-4 shadow-sm">
            <h3 className="text-2xl font-serif italic text-[#8B2E20] font-bold">
              MARRY ME?
            </h3>
            <div
              onClick={() => onSelectPhoto(coverPhoto)}
              className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPhoto} alt="Marry Me" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
            </div>

            <div className="text-right">
              <h3 className="text-2xl font-serif italic text-[#8B2E20] font-bold flex items-center justify-end gap-1">
                <span>YES! I DO</span>
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-rose-500 text-lg inline-block"
                >
                  ❤️
                </motion.span>
              </h3>
            </div>
          </div>
        </motion.section>

        {/* 5. ABOUT US CÔ DÂU VÀ CHÚ RỂ (OVERLAPPING CARDS) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-white border-b border-[#F5E5E0] space-y-6"
        >
          {/* CÔ DÂU */}
          <div className="space-y-2">
            <span className="text-xs font-serif italic text-[#B84A39]">About us</span>
            <div className="grid grid-cols-2 gap-3 items-center">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="p-3.5 rounded-2xl border-2 border-[#8B2E20] bg-white text-center space-y-1 shadow-2xs"
              >
                <h4 className="text-sm font-serif italic font-bold text-[#8B2E20]">{brideName}</h4>
                <p className="text-[10px] text-stone-500 font-mono">12/03/2000</p>
                <p className="text-[10px] text-stone-600 font-medium">TP. Điện Biên</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.04 }}
                onClick={() => onSelectPhoto(brideAvatar)}
                className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brideAvatar} alt="Cô Dâu" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
            </div>
            <div className="text-right pr-2">
              <span className="text-xs font-serif italic text-stone-400 tracking-widest uppercase">Bride</span>
            </div>
          </div>

          {/* CHÚ RỂ */}
          <div className="space-y-2 pt-2 border-t border-[#F5E5E0]">
            <span className="text-xs font-serif italic text-[#B84A39]">About us</span>
            <div className="grid grid-cols-2 gap-3 items-center">
              <motion.div
                whileHover={{ scale: 1.04 }}
                onClick={() => onSelectPhoto(groomAvatar)}
                className="aspect-[3/4] rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={groomAvatar} alt="Chú Rể" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="p-3.5 rounded-2xl border-2 border-[#8B2E20] bg-white text-center space-y-1 shadow-2xs"
              >
                <h4 className="text-sm font-serif italic font-bold text-[#8B2E20]">{groomName}</h4>
                <p className="text-[10px] text-stone-500 font-mono">02/08/1998</p>
                <p className="text-[10px] text-stone-600 font-medium">TP. Hà Nội</p>
              </motion.div>
            </div>
            <div className="pl-2">
              <span className="text-xs font-serif italic text-stone-400 tracking-widest uppercase">Groom</span>
            </div>
          </div>
        </motion.section>

        {/* 6. SAVE THE DATE VỚI LỊCH NHÚNG TRÊN ẢNH & TIMELINE ICON */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-[#FDF9F8] border-b border-[#F5E5E0] space-y-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-serif italic text-[#8B2E20] font-bold">
              Save the date
            </span>
            <span className="px-3 py-1 rounded-full bg-[#BA3E2C] text-white text-[10px] font-mono uppercase tracking-wider">
              2026 / Dec
            </span>
          </div>

          {/* Ảnh có nhúng lưới lịch với trái tim trên ngày 24 */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-[4/5] bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPhoto} alt="Save the date" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />

            {/* Inset translucent calendar box */}
            <div className="absolute bottom-4 right-4 w-52 p-3 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/50 text-[#4A2E24]">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-stone-400 pb-1">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 text-center text-[10px] font-sans">
                <span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span>
                <span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span>
                <span>22</span><span>23</span>
                {/* Ngày 24 có trái tim hồng */}
                <span className="relative font-bold text-rose-600 flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 border border-rose-500 rounded-full w-5 h-5 m-auto bg-rose-50"
                  />
                  <span className="relative z-10">24</span>
                </span>
                <span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span>
              </div>
            </div>
          </div>

          {/* Timeline Icons: 🚗, 🎀, 🥂 */}
          <div className="space-y-3 pt-2 max-w-xs mx-auto text-xs">
            <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3">
              <span className="text-xl">🚗</span>
              <span className="text-rose-500">❤️</span>
              <span className="font-semibold text-stone-800">09:00 - Lễ Rước Dâu</span>
            </motion.div>
            <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3">
              <span className="text-xl">🎀</span>
              <span className="text-rose-500">❤️</span>
              <span className="font-semibold text-stone-800">09:30 - Chụp hình lưu niệm</span>
            </motion.div>
            <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3">
              <span className="text-xl">🥂</span>
              <span className="text-rose-500">❤️</span>
              <span className="font-semibold text-stone-800">10:30 - Khai tiệc</span>
            </motion.div>
          </div>
        </motion.section>

        {/* 7. PHONG BÌ SÁP VÒM HỒNG RSVP */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 bg-white border-b border-[#F5E5E0] text-center space-y-4"
        >
          <p className="text-xs text-stone-600 leading-relaxed italic max-w-xs mx-auto">
            Mình rất muốn được chụp chung với bạn những tấm hình kỷ niệm vì vậy hãy đến sớm hơn một chút bạn yêu nhé! Đám cưới của chúng mình sẽ trọn vẹn hơn khi có thêm lời chúc phúc và sự hiện diện của các bạn.
          </p>

          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="max-w-[280px] mx-auto p-6 rounded-t-full rounded-b-3xl bg-[#E6BCB5] text-[#4A2E24] shadow-md space-y-2"
          >
            <span className="text-[10px] font-mono tracking-widest uppercase block">R.S.V.P.</span>
            <h4 className="text-base font-serif font-bold">Xác nhận tham dự</h4>
            <p className="text-[11px] text-stone-600">
              Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
            </p>
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={onOpenRsvp}
                className="px-6 py-2 rounded-full bg-white text-[#8B2E20] text-xs font-bold hover:bg-stone-50 transition shadow cursor-pointer"
              >
                ✍️ Gửi xác nhận
              </motion.button>
            </div>
          </motion.div>
        </motion.section>

        {/* 8. GỬI QUÀ MỪNG VỚI CẶP THẺ VIETQR TRÒN & VUÔNG */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 bg-[#FDF9F8] border-b border-[#F5E5E0] space-y-5"
        >
          <div className="text-center">
            <h4 className="text-base font-serif font-bold text-[#B84A39] tracking-widest uppercase">
              GỬI QUÀ MỪNG
            </h4>
          </div>

          {/* Thẻ Cô Dâu */}
          <div className="flex items-center justify-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08 }}
              onClick={() => onSelectPhoto(brideAvatar)}
              className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-300 shadow-sm cursor-pointer shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brideAvatar} alt="Cô Dâu" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenGift}
              className="p-3 px-4 rounded-2xl bg-white border border-[#F5E5E0] shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition"
            >
              <div className="text-xs space-y-0.5">
                <span className="text-[10px] text-stone-400 block font-sans">Cô dâu</span>
                <p className="font-bold text-[#8B2E20]">{brideName}</p>
                <p className="text-[10px] font-mono text-stone-500">MB Bank : 012345678</p>
              </div>
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-xs font-mono border border-stone-200">
                QR
              </div>
            </motion.div>
          </div>

          {/* Thẻ Chú Rể */}
          <div className="flex items-center justify-center gap-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenGift}
              className="p-3 px-4 rounded-2xl bg-white border border-[#F5E5E0] shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-xs font-mono border border-stone-200">
                QR
              </div>
              <div className="text-xs space-y-0.5 text-right">
                <span className="text-[10px] text-stone-400 block font-sans">Chú rể</span>
                <p className="font-bold text-[#8B2E20]">{groomName}</p>
                <p className="text-[10px] font-mono text-stone-500">MB Bank : 012345678</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.08 }}
              onClick={() => onSelectPhoto(groomAvatar)}
              className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-300 shadow-sm cursor-pointer shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={groomAvatar} alt="Chú Rể" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          {/* Chibi Dancing Couple & Thank You with floating animation */}
          <div className="pt-6 text-center space-y-1">
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl select-none"
            >
              🤵🏻‍♂️ 💃🏻
            </motion.div>
            <h5 className="text-2xl font-serif italic text-[#8B2E20]">
              Thank you
            </h5>
          </div>
        </motion.section>

        {/* 9. BOTTOM DOCK CỐ ĐỊNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F5E5E0] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-gradient-to-r from-[#BA3E2C] to-[#8B2E20] text-white text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-5 rounded-full bg-[#FDF9F8] border border-[#BA3E2C] text-[#BA3E2C] text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
