"use client";

import React from "react";
import { motion } from "framer-motion";
import { Ticket, Plane, Sparkles, Heart, Film, Stamp, Download, Calendar, MapPin } from "lucide-react";
import type { WeddingPassConfig } from "@/types/card.types";

interface WeddingPassSectionProps {
  config?: WeddingPassConfig;
  groomName: string;
  brideName: string;
  eventDate?: string | Date;
  venueName?: string;
  primaryColor?: string;
  isPreview?: boolean;
}

export const WeddingPassSection: React.FC<WeddingPassSectionProps> = ({
  config,
  groomName,
  brideName,
  eventDate,
  venueName,
  primaryColor = "#BE944E",
  isPreview = false,
}) => {
  if (!config?.enabled) return null;

  const passType = config.passType || "boarding-pass";
  const title = config.title || (passType === "boarding-pass" ? "Boarding Pass to Happily Ever After" : passType === "cinema-ticket" ? "A Romantic Love Story • Admit Two" : "Wedding Vintage Postcard & Stamp");
  const departing = config.departing || "Độc Thân (Single Life)";
  const arriving = config.arriving || "Hôn Nhân (Marriage)";
  const gate = config.gate || "GATE 126";
  const seat = config.seat || "SEAT 01A & 01B";
  const passengerName = config.passengerName || `${groomName} & ${brideName}`;
  const note = config.note || "Vé mời danh dự dành riêng cho quý khách tham dự ngày hạnh phúc viên mãn.";

  // Format date text
  let dateText = "2026";
  let timeText = config.boardingTime || "17:30";
  if (eventDate) {
    try {
      const d = new Date(eventDate);
      if (!isNaN(d.getTime())) {
        dateText = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        if (!config.boardingTime) {
          timeText = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        }
      }
    } catch {}
  }

  return (
    <section className="relative w-full py-10 px-4 sm:px-6 bg-gradient-to-b from-[#FAF8F5]/60 via-[#F5EFEB]/80 to-[#FAF8F5]/60 overflow-hidden">
      {/* Decorative accessories: Ribbon & Floral corner */}
      {config.flowerCornerStyle === "peony-blush" && (
        <img
          src="/images/decor/watercolor-floral-corner-peony.png"
          alt="Hoa mẫu đơn"
          className="absolute -top-6 -right-6 w-32 sm:w-44 pointer-events-none opacity-85 z-10"
        />
      )}
      {config.flowerCornerStyle === "olive-gold" && (
        <img
          src="/images/decor/olive-branch-gold-watercolor.png"
          alt="Cành ô liu vàng"
          className="absolute -top-4 -left-4 w-28 sm:w-36 pointer-events-none opacity-80 z-10"
        />
      )}

      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Section Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-3">
          <Ticket className="w-3.5 h-3.5 text-amber-700" />
          <span>{passType === "boarding-pass" ? "Vé Mời Máy Bay VIP" : passType === "cinema-ticket" ? "Vé Điện Ảnh Tình Yêu" : "Thẻ Bưu Chính Vintage"}</span>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 text-center tracking-tight mb-1">
          {title}
        </h2>
        <p className="text-xs text-stone-500 text-center max-w-md mb-6 font-sans">
          {note}
        </p>

        {/* ══════════════════════════════════════════════════ */}
        {/* TICKET CARD CONTAINER                           */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="relative w-full">
          {/* Silk Bow Ornament */}
          {config.ribbonStyle === "silk-champagne" && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
              <img
                src="/images/decor/silk-ribbon-bow-champagne.png"
                alt="Nơ lụa satin champagne"
                className="w-24 sm:w-28 object-contain"
              />
            </div>
          )}

          {/* ── TYPE 1: BOARDING PASS ── */}
          {passType === "boarding-pass" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full rounded-2xl bg-[#FCFAF6] border border-[#E2D5BE] shadow-xl overflow-hidden text-stone-800"
            >
              {/* Gold trim header */}
              <div className="bg-gradient-to-r from-[#B99047] via-[#D5AF5C] to-[#A47932] px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-white rotate-45" />
                  <span className="font-serif font-bold text-xs uppercase tracking-widest">LOVE AIRLINES • FIRST CLASS</span>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-wider opacity-90">PASSENGER TICKET</span>
              </div>

              {/* Main Ticket Body */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Left 2 Cols: Flight info */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Hành khách / Passenger</span>
                    <span className="text-base sm:text-lg font-serif font-bold text-[#8B1E2D] block truncate">
                      {passengerName}
                    </span>
                  </div>

                  {/* Route: Departing -> Arriving */}
                  <div className="grid grid-cols-7 items-center bg-[#F7F3EB] p-2.5 rounded-xl border border-[#EBE3D3]">
                    <div className="col-span-3 text-left">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Khởi hành</span>
                      <span className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-1">{departing}</span>
                    </div>
                    <div className="col-span-1 flex justify-center text-amber-700">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Điểm đến</span>
                      <span className="text-xs sm:text-sm font-bold text-[#966E29] line-clamp-1">{arriving}</span>
                    </div>
                  </div>

                  {/* Flight Details: Gate, Seat, Time, Date */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-[9px] text-stone-400 font-bold block uppercase">Cửa</span>
                      <span className="text-xs font-mono font-bold text-stone-800">{gate}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-[9px] text-stone-400 font-bold block uppercase">Ghế</span>
                      <span className="text-xs font-mono font-bold text-stone-800">{seat}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-[9px] text-stone-400 font-bold block uppercase">Giờ bay</span>
                      <span className="text-xs font-mono font-bold text-amber-700">{timeText}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-200">
                      <span className="text-[9px] text-stone-400 font-bold block uppercase">Ngày</span>
                      <span className="text-xs font-mono font-bold text-stone-800">{dateText}</span>
                    </div>
                  </div>
                </div>

                {/* Right Col: Perforated Tear Stub with Barcode & Wax Seal */}
                <div className="md:border-l md:border-dashed md:border-stone-300 md:pl-4 flex flex-col items-center justify-between pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-stone-300">
                  <div className="text-center w-full">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">BOARDING STUB</span>
                    <span className="text-xs font-bold text-stone-700 block truncate">{groomName} & {brideName}</span>
                  </div>

                  {/* Wax Seal Stamp */}
                  {config.waxSealStyle === "dove-rose-gold" && (
                    <div className="my-2 drop-shadow-sm">
                      <img
                        src="/images/decor/wax-seal-dove-rose-gold.png"
                        alt="Con dấu sáp chim bồ câu"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                      />
                    </div>
                  )}

                  {/* Barcode graphic */}
                  <div className="w-full text-center">
                    <div className="font-mono text-[9px] text-stone-400 tracking-widest">||||||||||||||||||||||||||||</div>
                    <span className="text-[8px] font-mono text-stone-400">HAPPY-WEDDING-2026</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TYPE 2: CINEMA TICKETS VINTAGE ── */}
          {passType === "cinema-ticket" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full rounded-2xl bg-gradient-to-r from-[#FDFBF7] to-[#F7EFE2] border border-[#DECFB5] shadow-xl p-5 sm:p-6 text-stone-800"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-dashed border-amber-300/80 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-rose-800 mb-1">
                    <Film className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Lover's Theatre • Admit Two</span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Happily Ever After — A Romantic Love Story
                  </h3>
                </div>
                {config.waxSealStyle === "dove-rose-gold" && (
                  <img
                    src="/images/decor/wax-seal-dove-rose-gold.png"
                    alt="Con dấu sáp"
                    className="w-16 h-16 object-contain shrink-0"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-center">
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Suất chiếu</span>
                  <span className="text-xs font-bold text-stone-800">{timeText}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Ngày công chiếu</span>
                  <span className="text-xs font-bold text-stone-800">{dateText}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Hàng ghế</span>
                  <span className="text-xs font-bold text-stone-800">ROW: LOVE</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Số ghế</span>
                  <span className="text-xs font-bold text-rose-800">SEAT 01 & 02</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TYPE 3: VINTAGE STAMPS & POSTCARD ── */}
          {passType === "vintage-stamp" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full rounded-2xl bg-[#FCFAF7] border border-[#D9CBB0] shadow-xl p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-36 h-36 shrink-0 drop-shadow-md">
                  <img
                    src="/images/decor/vintage-postage-stamps-set.png"
                    alt="Bộ tem thư hoa cưới"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#B68837]">
                    <Stamp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Love Postmark Stamp</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Bưu Thiếp Kỷ Niệm Trăm Năm
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {note}
                  </p>
                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-stone-500 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{dateText} • {timeText}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
