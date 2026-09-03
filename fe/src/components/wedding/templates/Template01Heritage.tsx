"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import { CountdownUnits } from "./common/CountdownUnits";
import { InteractiveCalendarGrid } from "./common/InteractiveCalendarGrid";
import { GuestbookSection } from "@/components/shared/GuestbookSection";
import { formatDate } from "@/lib/utils";
import {
  Compass,
  Maximize2,
  Sparkles,
  Heart,
  UserCheck,
  Gift,
  Calendar,
  MapPin,
} from "lucide-react";

export const Template01Heritage: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-11-20T18:00:00Z");

  const groomName = data.groom?.fullName || "Nguyễn Minh Khôi";
  const groomShort = data.groom?.shortName || "Minh Khôi";
  const brideName = data.bride?.fullName || "Lê Ngọc Hân";
  const brideShort = data.bride?.shortName || "Ngọc Hân";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/demo/couple-aodai.png";

  const groomAvatar = data.groom?.avatarUrl || "/images/demo/groom-avatar.png";
  const brideAvatar = data.bride?.avatarUrl || "/images/demo/bride-avatar.png";

  return (
    <div className="relative min-h-screen bg-[#FFFDF9] text-stone-800 font-sans pb-28 sm:pb-32 overflow-x-hidden selection:bg-amber-200">
      {/* BACKGROUND WATERMARK */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] z-0" />

      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-[#FFFDF9] shadow-[0_15px_60px_rgba(139,30,45,0.15)] sm:border-x border-[#E9D5BD] relative z-10">

        {/* 1. TOP LACQUER CREST & BANNER */}
        <section className="pt-8 pb-6 px-4 text-center relative overflow-hidden bg-gradient-to-b from-[#8B1E2D] via-[#751624] to-[#60101C] text-amber-100 border-b-4 border-[#D4AF37]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Phù hiệu sơn mài cung đình */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-[#D4AF37] via-[#FFF3D1] to-[#AA8222] shadow-xl flex items-center justify-center relative mb-4"
          >
            <div className="w-full h-full rounded-full bg-[#8B1E2D] border-2 border-[#D4AF37] flex flex-col items-center justify-center text-center p-2 shadow-inner">
              <span className="text-[9px] uppercase tracking-widest text-[#E8CCA2] font-serif">Lễ Thành Hôn</span>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#FFF3D1] leading-tight mt-0.5">
                Tiệc Mừng Cưới
              </h2>
              <Sparkles className="w-3 h-3 text-[#D4AF37] mt-0.5" />
            </div>
          </motion.div>

          <p className="text-[10px] sm:text-[11px] font-serif uppercase tracking-[0.25em] text-[#E8CCA2] mb-1">
            {data.heroSubtitle || "TRÂN TRỌNG BÁO HỶ"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF3D1] tracking-wide">
            {groomShort} &amp; {brideShort}
          </h1>
          <p className="text-xs text-amber-200/80 font-serif italic mt-1">
            {formatDate(targetDate)}
          </p>
        </section>

        {/* 2. HERO COVER: CỬA SỔ VÒM CỔ ĐIỂN */}
        <section className="p-5 sm:p-7 text-center bg-[#FAF6F0] border-b border-[#EFE8DD]">
          <div
            onClick={() => onSelectPhoto(coverPhoto)}
            className="relative mx-auto w-full max-w-[320px] aspect-[4/5] rounded-t-full rounded-b-3xl overflow-hidden p-2 bg-gradient-to-b from-[#D4AF37] via-[#AA8222] to-[#8B1E2D] shadow-2xl cursor-pointer group active:scale-[0.99] transition"
          >
            <div className="relative w-full h-full rounded-t-full rounded-b-2xl overflow-hidden bg-stone-200">
              <motion.img
                src={coverPhoto}
                alt="Wedding Portrait"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-200 text-[10px] flex items-center gap-1.5 shadow">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Chạm để xem ảnh</span>
              </div>
            </div>
          </div>

          <div className="mt-5 max-w-sm mx-auto space-y-1 text-center">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#8B1E2D]">
              {groomName} &amp; {brideName}
            </h3>
            <p className="text-xs text-stone-600 italic font-serif">
              {card.greetingMessage || data.greeting || "“Trăm năm tình viên mãn — Bạc đầu nghĩa phu thê”"}
            </p>
            {guestName && (
              <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#8B1E2D]/10 border border-[#8B1E2D]/30 text-[#8B1E2D] text-xs font-bold">
                Kính mời: <span className="underline">{guestName}</span>
              </div>
            )}
          </div>
        </section>

        {/* 3. THÔNG TIN CHI TIẾT CÔ DÂU, CHÚ RỂ & HAI HỌ (Á ĐÔNG HOÀNG GIA) */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-5 sm:p-7 bg-[#FFFDF9] border-b border-[#EAE0D2] space-y-5"
        >
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8B1E2D]">
              THÀNH TÂM BÁO HỶ
            </span>
            <h3 className="text-xl font-serif font-bold text-[#8B1E2D]">Tân Lang &amp; Tân Nương</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* THẺ CHÚ RỂ */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/40 shadow-xs text-center space-y-2"
            >
              <div
                onClick={() => onSelectPhoto(groomAvatar)}
                className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-sm cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={groomAvatar} alt="Chú Rể" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">CHÚ RỂ</span>
                <h4 className="text-sm font-serif font-bold text-[#8B1E2D]">{groomName}</h4>
                <p className="text-[11px] text-stone-500 italic">{data.groom?.birthOrder || "Trưởng nam"}</p>
              </div>
              <div className="pt-1 border-t border-[#EAE0D2] text-[11px] text-stone-600 space-y-0.5">
                <span className="font-bold text-[#8B1E2D] block text-[10px]">NHÀ TRAI</span>
                <p>{data.groom?.parents?.fatherName || "Ông: Nguyễn Văn Hùng"}</p>
                <p>{data.groom?.parents?.motherName || "Bà: Trần Thị Mai"}</p>
                <p className="text-[10px] text-stone-400 italic">TP. Hà Nội</p>
              </div>
            </motion.div>

            {/* THẺ CÔ DÂU */}
            <motion.div
              whileHover={{ y: -3 }}
              className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/40 shadow-xs text-center space-y-2"
            >
              <div
                onClick={() => onSelectPhoto(brideAvatar)}
                className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-sm cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brideAvatar} alt="Cô Dâu" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">CÔ DÂU</span>
                <h4 className="text-sm font-serif font-bold text-[#8B1E2D]">{brideName}</h4>
                <p className="text-[11px] text-stone-500 italic">{data.bride?.birthOrder || "Út nữ"}</p>
              </div>
              <div className="pt-1 border-t border-[#EAE0D2] text-[11px] text-stone-600 space-y-0.5">
                <span className="font-bold text-[#8B1E2D] block text-[10px]">NHÀ GÁI</span>
                <p>{data.bride?.parents?.fatherName || "Ông: Lê Quốc Bảo"}</p>
                <p>{data.bride?.parents?.motherName || "Bà: Phạm Thu Cúc"}</p>
                <p className="text-[10px] text-stone-400 italic">TP. Hồ Chí Minh</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 4. LỊCH THÁNG & BỘ ĐẾM NGƯỢC CÁT TƯỜNG */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-5 sm:p-7 bg-[#FAF6F0] border-b border-[#EAE0D2] space-y-4"
        >
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E2D]">
              LỊCH KHẮC THIÊN DUYÊN
            </span>
            <h3 className="text-xl font-serif font-bold text-[#8B1E2D] mt-0.5">
              Ngày Cát Tường Viên Mãn
            </h3>
          </div>

          <InteractiveCalendarGrid targetDate={targetDate} variant="burgundy-circle" heartColor="#8B1E2D" />

          <div className="pt-2 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 block mb-2">
              ĐẾM NGƯỢC THỜI GIAN
            </span>
            <CountdownUnits targetDate={targetDate} style="gold-elegant" showCalendarButton={false} />
          </div>
        </motion.section>

        {/* 5. CEREMONY CARDS (LỄ VU QUY & TIỆC THÀNH HÔN) */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-5 sm:p-7 space-y-4 bg-[#FFFDF9] border-b border-[#EAE0D2]"
        >
          <div className="text-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E2D]">
              SCHEDULE &amp; CEREMONY
            </span>
            <h3 className="text-xl font-serif font-bold text-[#8B1E2D] mt-0.5">
              Sự Kiện Trọng Đại
            </h3>
          </div>

          <div className="space-y-4">
            {card.events.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/50 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-[#EAE0D2] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#8B1E2D] text-amber-200 text-xs font-serif font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-[#8B1E2D] text-sm sm:text-base">
                      {ev.eventName}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#8B1E2D]/10 text-[#8B1E2D]">
                    {formatDate(ev.eventDate)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-700">
                  <p><strong>Địa điểm:</strong> {ev.venueName}</p>
                  <p className="text-stone-500 leading-relaxed"><strong>Địa chỉ:</strong> {ev.address}</p>
                  {ev.lunarDate && (
                    <p className="text-[11px] text-amber-800 italic font-serif">
                      (Âm lịch: {ev.lunarDate})
                    </p>
                  )}
                </div>

                {ev.mapUrl && (
                  <a
                    href={ev.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full py-2 bg-white rounded-xl border border-[#D4AF37] text-xs font-bold text-[#8B1E2D] flex items-center justify-center gap-1.5 hover:bg-amber-50 shadow-2xs cursor-pointer transition"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Chỉ đường phong thủy trên Google Maps</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* 6. MEMORIES GALLERY: POLAROID VINTAGE & DẤU SÁP */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-[#FAF6F0] border-b border-[#EAE0D2]"
        >
          <div className="text-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E2D]">
              MEMORIES &amp; PHOTOS
            </span>
            <h3 className="text-xl font-serif font-bold text-[#8B1E2D] mt-0.5">
              Kỷ Niệm Tình Yêu
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {card.photos.map((photo, i) => (
              <motion.div
                key={photo.id || i}
                whileHover={{ scale: 1.04, y: -3 }}
                onClick={() => onSelectPhoto(photo.url)}
                className="bg-white p-2 pb-5 rounded-xl border border-[#EAE0D2] shadow-sm hover:shadow-md cursor-pointer transition relative group"
              >
                <div className="aspect-[4/5] rounded-lg overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "Ảnh cưới"}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                {/* Con dấu sáp đỏ xoay nhẹ */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#8B1E2D] border-2 border-[#D4AF37] shadow flex items-center justify-center text-[8px] text-amber-200 font-bold"
                >
                  囍
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. HỘP QUÀ MỪNG CƯỚI VIETQR HOÀNG GIA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-6 bg-[#FFFDF9] border-b border-[#EAE0D2] text-center space-y-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E2D]">
              CHÚC PHÚC &amp; MỪNG CƯỚI
            </span>
            <h3 className="text-xl font-serif font-bold text-[#8B1E2D]">Hộp Mừng Cưới Hoàng Gia</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Sự hiện diện và lời chúc phúc của quý khách là món quà quý giá nhất dành cho chúng tôi.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenGift}
            className="inline-block p-4 px-6 rounded-3xl bg-gradient-to-tr from-[#8B1E2D] to-[#60101C] text-amber-100 shadow-lg cursor-pointer border border-[#D4AF37]"
          >
            <Gift className="w-8 h-8 mx-auto text-amber-300 mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider block">Gửi Mừng Cưới VietQR</span>
            <span className="text-[10px] text-amber-200/70 block">Chạm để xem tài khoản mừng cưới</span>
          </motion.div>
        </motion.section>

        {/* 8. GUESTBOOK CUỘN THƯ HOÀNG GIA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 sm:p-6 bg-[#FFFDF9] border-b border-[#EAE0D2]"
        >
          <div className="text-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E2D]">
              BLESSINGS &amp; WISHES
            </span>
            <h3 className="text-xl font-serif font-bold text-[#8B1E2D]">Sổ Lưu Bút Hoàng Gia</h3>
          </div>
          <GuestbookSection cardId={card.id} primaryColor="#8B1E2D" />
        </motion.section>

        {/* 9. BOTTOM ACTION DOCK CỐ ĐỊNH CHÂN MÀN HÌNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#8B1E2D]/95 backdrop-blur-md border-t-2 border-[#D4AF37] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E2B8] to-[#AA8222] text-[#60101C] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4 text-[#8B1E2D]" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>

          {(card.bankingPrimary || card.bankingSecondary) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenGift}
              className="py-3 px-4 rounded-xl bg-[#60101C] border border-[#D4AF37] text-amber-200 text-xs sm:text-sm font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
            >
              <Gift className="w-4 h-4 text-[#D4AF37]" />
              <span>Gửi Quà Mừng</span>
            </motion.button>
          )}
        </div>
      </main>
    </div>
  );
};
