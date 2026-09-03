"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift } from "lucide-react";

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
    "/images/templates/template-09-dragon.png";

  return (
    <div className="relative min-h-screen bg-[#4A0E10] text-[#FFF3D1] font-serif pb-28 sm:pb-32 overflow-x-hidden selection:bg-amber-300 selection:text-red-950">
      {/* Background rồng hoàng gia chìm */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] z-0" />

      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-[#520F12] shadow-[0_20px_80px_rgba(0,0,0,0.85)] sm:border-x border-[#D4AF37]/40 relative z-10 text-center space-y-6">

        {/* 1. TOP NAMES IN GOLD CURSIVE CALLIGRAPHY */}
        <section className="pt-10 px-4 space-y-1">
          <h2 className="text-3xl sm:text-4xl font-serif italic text-amber-200 tracking-wide font-light">
            {groomShort}
          </h2>
          <span className="text-xl font-serif italic text-amber-300/80 block">&amp;</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-amber-200 tracking-wide font-light">
            {brideShort}
          </h2>
        </section>

        {/* 2. CHIBI COUPLE LEANING ON GIANT 3D SONG HỶ GATE & EASEL STAND */}
        <section className="px-6 relative">
          <div className="relative max-w-xs mx-auto">
            {/* Cặp Chibi & Cổng 3D Song Hỷ */}
            <div className="relative z-10 text-center">
              {/* Chibi uyên ương tựa cổng */}
              <div className="text-6xl select-none mb-[-1rem] relative z-20">
                👩🏻‍❤️‍👨🏻
              </div>

              {/* Cổng 3D Song Hỷ khổng lồ viền trắng ruột đỏ đô */}
              <div className="w-48 h-44 mx-auto rounded-3xl bg-[#6E1719] border-4 border-[#FFF3D1] shadow-2xl flex items-center justify-center text-8xl font-bold text-[#FFF3D1] select-none">
                囍
              </div>

              {/* Giá vẽ hoa cưới đặt bên cạnh */}
              <div className="absolute top-12 left-0 w-20 p-1.5 rounded-lg bg-white/90 shadow-md border border-[#D4AF37] text-center text-[8px] text-stone-800 rotate-[-8deg] z-30">
                <span className="text-xs block">🌸</span>
                <span className="font-serif font-bold block text-[7px] text-[#8E1C1F]">Lễ Thành Hôn</span>
                <span className="font-serif text-[6px]">{groomShort} &amp; {brideShort}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <span className="text-3xl font-serif italic text-amber-200 tracking-wider block font-light">
              Save The Date
            </span>
          </div>
        </section>

        {/* 3. THÔNG TIN HAI HỌ (ÔNG BÀ) & TÂN LANG TÂN NƯƠNG */}
        <section className="px-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs font-sans text-amber-100/90">
            <div className="space-y-0.5">
              <span className="font-serif font-bold text-amber-300 block text-xs tracking-wider">NHÀ TRAI</span>
              <span className="text-[10px] text-amber-200/70 block">(Ông Bà)</span>
              <p className="font-semibold">{data.groom?.parents?.fatherName || "Nguyễn Văn Quản"}</p>
              <p className="font-semibold">{data.groom?.parents?.motherName || "Nguyễn Thị Oanh"}</p>
              <p className="text-[10px] text-amber-200/60 pt-0.5">68 Lê Văn Lương - Hà Nội</p>
            </div>

            <div className="space-y-0.5">
              <span className="font-serif font-bold text-amber-300 block text-xs tracking-wider">NHÀ GÁI</span>
              <span className="text-[10px] text-amber-200/70 block">(Ông Bà)</span>
              <p className="font-semibold">{data.bride?.parents?.fatherName || "Huỳnh Đăng Khoa"}</p>
              <p className="font-semibold">{data.bride?.parents?.motherName || "Lê Vân Anh"}</p>
              <p className="text-[10px] text-amber-200/60 pt-0.5">Quốc Oai - Hà Nội</p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-900/60 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-300/80 block">
              TRÂN TRỌNG THÔNG BÁO LỄ THÀNH HÔN CỦA CON CHÚNG TÔI
            </span>

            <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-200 tracking-wide">
              {groomName}
            </h3>

            <div className="flex items-center justify-center gap-3 text-xs text-amber-200/80 font-sans">
              <span>Trưởng nam</span>
              <span className="text-amber-400 font-serif italic text-base">&amp;</span>
              <span>Út nữ</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-200 tracking-wide">
              {brideName}
            </h3>
          </div>
        </section>

        {/* 4. HÔN LỄ TẠI TƯ GIA VÀ BADGE NGÀY CƯỚI */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-6 space-y-3"
        >
          <div className="space-y-1">
            <span className="text-xs text-amber-200/80 tracking-widest block font-serif uppercase">
              HÔN LỄ ĐƯỢC CỬ HÀNH TẠI
            </span>
            <h4 className="text-base font-serif font-bold text-white tracking-wider">TƯ GIA</h4>
            <p className="text-xs font-mono text-amber-200">VÀO LÚC: 09:00</p>
          </div>

          {/* Badge Ngày 19 Tháng 12 Năm 2025 */}
          <div className="flex items-center justify-center gap-3 py-2">
            <span className="text-xs font-mono tracking-widest text-amber-300 uppercase border-y border-amber-300/60 py-1">
              THỨ SÁU
            </span>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-full border-2 border-amber-300 flex items-center justify-center text-xl font-bold text-amber-200 shadow-inner"
            >
              19
            </motion.div>
            <span className="text-xs font-mono tracking-widest text-amber-300 uppercase border-y border-amber-300/60 py-1">
              THÁNG 12
            </span>
          </div>
          <span className="text-xs font-mono text-amber-200/80 block -mt-1">2025</span>
        </motion.section>

        {/* 5. TIỆC CƯỚI PROMES CENTER & BẢN ĐỒ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-6 space-y-3"
        >
          <span className="text-xs uppercase font-serif tracking-widest text-amber-200/70 block">
            TIỆC CƯỚI SẼ TỔ CHỨC TẠI
          </span>

          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="inline-block px-10 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E2B8] to-[#AA8222] text-[#4A0E10] font-serif font-bold text-base shadow-md cursor-pointer"
          >
            Promex Center
          </motion.div>

          <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border border-amber-300/30 shadow-md bg-white p-2">
            <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-stone-100">
              <iframe
                title="Promex Center Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.09!2d105.82!3d21.01!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAwJzM2LjAiTiAxMDXCsDQ5JzEyLjAiRQ!5e0!3m2!1svi!2s!4v1620000000000"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />
            </div>
          </div>

          <p className="text-xs text-amber-100/80 italic pt-2">
            Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!
          </p>
        </motion.section>

        {/* 6. HỘP MỪNG CƯỚI 2 THẺ QR VÀNG CÁT BO TRÒN */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-6 py-4 space-y-5 border-t border-amber-900/60"
        >
          <h4 className="text-base font-serif font-bold text-amber-300 tracking-widest uppercase">
            HỘP MỪNG CƯỚI
          </h4>

          {/* Thẻ QR Chú Rể */}
          <div className="space-y-1">
            <span className="text-xs text-amber-200/90 font-serif">Chú rể · Anh Tuấn</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenGift}
              className="w-36 h-36 mx-auto rounded-3xl bg-white p-3 shadow-lg flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-full h-full rounded-2xl bg-[#E6C994] flex items-center justify-center text-xs font-bold text-[#4A0E10] font-mono shadow-inner">
                Mã Qr
              </div>
            </motion.div>
          </div>

          {/* Thẻ QR Cô Dâu */}
          <div className="space-y-1 pt-2">
            <span className="text-xs text-amber-200/90 font-serif">Cô dâu · Thu Trang</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenGift}
              className="w-36 h-36 mx-auto rounded-3xl bg-white p-3 shadow-lg flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-full h-full rounded-2xl bg-[#E6C994] flex items-center justify-center text-xs font-bold text-[#4A0E10] font-mono shadow-inner">
                Mã Qr
              </div>
            </motion.div>
          </div>

          {/* Phù hiệu Song Hỷ tròn hoàng tộc */}
          <div className="pt-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto rounded-full border-2 border-amber-300/80 flex items-center justify-center text-xl text-amber-300"
            >
              囍
            </motion.div>
          </div>

          <p className="text-xs text-amber-200/80 italic font-serif max-w-xs mx-auto pb-4">
            Cảm ơn tất cả tình cảm của cô dì chú bác, bạn bè và anh chị em đã dành cho Anh Tuấn &amp; Thu Trang!
          </p>
        </motion.section>

        {/* 7. BOTTOM DOCK CỐ ĐỊNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#4A0E10]/95 backdrop-blur-md border-t-2 border-[#D4AF37] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
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
            className="py-3 px-5 rounded-full bg-black/40 border border-[#D4AF37] text-amber-200 text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4 text-amber-300" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
