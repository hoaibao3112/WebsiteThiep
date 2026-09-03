"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import { CountdownUnits } from "./common/CountdownUnits";
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift, Calendar, Heart } from "lucide-react";

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

  const groomName = data.groom?.fullName || "Tuấn Minh";
  const groomShort = data.groom?.shortName || "Tuấn Minh";
  const brideName = data.bride?.fullName || "Mai Lan";
  const brideShort = data.bride?.shortName || "Mai Lan";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/templates/template-05-forest.png";

  const groomAvatar = data.groom?.avatarUrl || "/images/demo/groom-avatar.png";
  const brideAvatar = data.bride?.avatarUrl || "/images/demo/bride-avatar.png";

  return (
    <div className="relative min-h-screen bg-[#F5F8F4] text-[#1E3823] font-sans pb-28 sm:pb-32 overflow-x-hidden selection:bg-emerald-200">
      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-white shadow-[0_15px_60px_rgba(45,74,48,0.12)] sm:border-x border-[#DCE7DD] relative">

        {/* 1. TOP ENVELOPE OPENER VỚI ẢNH NGHIÊNG THẢO MỘC */}
        <section className="pt-8 pb-6 px-4 text-center bg-gradient-to-b from-[#F5F8F4] to-white border-b border-[#E3ECE5] space-y-3">
          <span className="text-2xl sm:text-3xl font-serif italic text-[#3B5E43] block">
            We got married
          </span>

          {/* Phong bì xanh rêu mở nắp với 2 ảnh thò ra */}
          <div className="relative max-w-xs mx-auto pt-8">
            <div className="flex justify-center -space-x-4 mb-[-2rem] relative z-10">
              <motion.div
                whileHover={{ rotate: -2, y: -4 }}
                onClick={() => onSelectPhoto(brideAvatar)}
                className="w-32 aspect-[3/4] bg-white p-1.5 shadow-lg rounded-sm -rotate-6 border border-stone-200 cursor-pointer"
              >
                <div className="w-full h-full overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brideAvatar} alt="Bride" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ rotate: 2, y: -4 }}
                onClick={() => onSelectPhoto(groomAvatar)}
                className="w-32 aspect-[3/4] bg-white p-1.5 shadow-lg rounded-sm rotate-6 border border-stone-200 cursor-pointer"
              >
                <div className="w-full h-full overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={groomAvatar} alt="Groom" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>

            {/* Thân phong bì màu xanh rêu */}
            <div className="w-full aspect-[5/3] bg-[#3B5E43] rounded-2xl shadow-md relative flex items-center justify-center border border-[#2D4A34]">
              <div className="w-9 h-9 rounded-full bg-amber-100/30 border border-amber-200 flex items-center justify-center text-amber-100 text-xs shadow-inner">
                🌿
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-1">
            <h2 className="text-2xl font-serif italic text-[#25432C]">
              {groomShort} <span className="text-amber-700">&amp;</span> {brideShort}
            </h2>
            <p className="text-sm font-mono tracking-widest text-[#3B5E43]">02·08·2026</p>
          </div>
        </section>

        {/* 2. THẺ POLAROID MY LOVE & LỊCH THÁNG 8 TRỰC QUAN */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-6 bg-[#FCFAF7] border-b border-[#E3ECE5]"
        >
          <div className="rounded-3xl bg-[#3D4A34] text-white p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center gap-4">
            {/* Polaroid My Love */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              onClick={() => onSelectPhoto(coverPhoto)}
              className="w-36 bg-white p-2 pb-5 rounded-sm shadow-md text-center text-stone-900 shrink-0 cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden bg-stone-100 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPhoto} alt="My Love" className="w-full h-full object-cover transition duration-300" />
              </div>
              <span className="text-xs font-serif italic text-stone-600">My Love</span>
            </motion.div>

            {/* Lưới lịch tháng 8 */}
            <div className="flex-1 w-full text-center sm:text-left space-y-1">
              <span className="text-xs font-mono font-bold text-amber-200 block text-right pr-2">
                Tháng 08.2026
              </span>
              <div className="grid grid-cols-7 gap-1 text-[10px] font-mono text-stone-300 pb-1 text-center">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs font-mono text-white">
                <span></span><span></span><span></span><span></span><span></span><span>1</span>
                {/* Ngày 2 khoanh trái tim */}
                <span className="relative font-bold text-amber-300 flex items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 border border-amber-300 rounded-full w-5 h-5 m-auto"
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

        {/* 3. TRÂN TRỌNG KÍNH MỜI & CẶP ẢNH CÔ DÂU CHÚ RỂ KÈM THƠ TÌNH */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-white border-b border-[#E3ECE5] text-center space-y-5"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              TRÂN TRỌNG KÍNH MỜI
            </span>
            <h3 className="text-2xl font-serif italic text-[#3B5E43] font-bold">
              Quý Khách
            </h3>
            <p className="text-xs text-stone-600">
              THAM DỰ TIỆC MỪNG LỄ THÀNH HÔN CỦA
            </p>
            <h4 className="text-2xl font-serif font-bold text-[#1E3823] pt-1">
              {brideShort} <span className="text-amber-600 font-normal">&amp;</span> {groomShort}
            </h4>
          </div>

          {/* 2 Ảnh dọc và câu đối thơ ở giữa */}
          <div className="grid grid-cols-7 gap-2 items-center">
            {/* Ảnh cô dâu bên trái */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(brideAvatar)}
              className="col-span-3 aspect-[9/16] rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brideAvatar} alt="Cô Dâu Mai Lan" className="w-full h-full object-cover transition duration-300" />
            </motion.div>

            {/* Thơ đối ở giữa màu xanh rêu */}
            <div className="col-span-1 py-4 px-1 rounded-xl bg-[#3D4A34] text-white text-[9px] font-serif writing-vertical flex items-center justify-center h-full min-h-[140px] shadow-xs">
              <span className="leading-relaxed">Em là tình yêu anh muốn giữ — Anh là hạnh phúc em muốn trao</span>
            </div>

            {/* Ảnh chú rể bên phải */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectPhoto(groomAvatar)}
              className="col-span-3 aspect-[9/16] rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={groomAvatar} alt="Chú Rể Tuấn Minh" className="w-full h-full object-cover transition duration-300" />
            </motion.div>
          </div>

          {/* Thông tin song thân hai họ */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-[#E3ECE5]">
            <div className="space-y-0.5 text-stone-700">
              <span className="font-bold text-[#3B5E43] block uppercase text-[11px]">NHÀ GÁI</span>
              <p className="font-semibold">{data.bride?.parents?.fatherName || "ÔNG NGUYỄN TRÍ THANH"}</p>
              <p className="font-semibold">{data.bride?.parents?.motherName || "BÀ LÊ THỊ HẢI"}</p>
            </div>
            <div className="space-y-0.5 text-stone-700">
              <span className="font-bold text-[#3B5E43] block uppercase text-[11px]">NHÀ TRAI</span>
              <p className="font-semibold">{data.groom?.parents?.fatherName || "ÔNG NGUYỄN VĂN TƯ"}</p>
              <p className="font-semibold">{data.groom?.parents?.motherName || "BÀ LÊ THỊ MAI"}</p>
            </div>
          </div>
        </motion.section>

        {/* 4. LONG FOREST GREEN EVENT CARD (BỮA CƠM THÂN MẬT & HÔN LỄ) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-[#FCFAF7] border-b border-[#E3ECE5] space-y-4"
        >
          <div className="rounded-3xl bg-[#3D4A34] text-white p-6 shadow-xl text-center space-y-6">
            {/* TIỆC 1: NHÀ GÁI */}
            <div className="space-y-1.5">
              <span className="text-xs font-serif font-bold tracking-wider text-amber-200 uppercase block">
                DỰ BỮA CƠM THÂN MẬT
              </span>
              <p className="text-xs text-stone-300 font-sans">VÀO HỒI 10:30, CHỦ NHẬT</p>
              <p className="text-3xl font-serif font-bold tracking-wider text-white">
                02 . 08 . 2026
              </p>
              <p className="text-[11px] text-stone-300 italic font-serif">
                Tức: Ngày 20 Tháng 07 Năm Bính Ngọ
              </p>
              <h5 className="font-serif font-bold text-sm uppercase text-amber-200 pt-1">
                TẠI TƯ GIA NHÀ GÁI
              </h5>
              <p className="text-xs text-stone-300">
                Xóm 5, Xã Phú Cát, Quốc Oai, Hà Nội
              </p>
              <div className="pt-2">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-1.5 rounded-full bg-white text-[#3D4A34] text-xs font-bold shadow hover:bg-stone-100 transition cursor-pointer"
                >
                  XEM CHỈ ĐƯỜNG
                </motion.a>
              </div>
            </div>

            <div className="w-3/4 mx-auto h-px bg-white/20" />

            {/* TIỆC 2: NHÀ TRAI */}
            <div className="space-y-1.5">
              <span className="text-xs font-serif font-bold tracking-wider text-amber-200 uppercase block">
                THAM DỰ HÔN LỄ
              </span>
              <p className="text-xs text-stone-300 font-sans">VÀO HỒI 12:30, CHỦ NHẬT</p>
              <p className="text-3xl font-serif font-bold tracking-wider text-white">
                02 . 08 . 2026
              </p>
              <p className="text-[11px] text-stone-300 italic font-serif">
                Tức: Ngày 20 Tháng 07 Năm Bính Ngọ
              </p>
              <h5 className="font-serif font-bold text-sm uppercase text-amber-200 pt-1">
                TẠI TƯ GIA NHÀ TRAI
              </h5>
              <p className="text-xs text-stone-300">
                Hoàng Mai, Hà Nội
              </p>
              <div className="pt-2">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-1.5 rounded-full bg-white text-[#3D4A34] text-xs font-bold shadow hover:bg-stone-100 transition cursor-pointer"
                >
                  XEM CHỈ ĐƯỜNG
                </a>
              </div>
            </div>
          </div>

          {/* 4 Khối countdown xanh rêu */}
          <div className="pt-2">
            <CountdownUnits targetDate={targetDate} style="boxes-forest" showCalendarButton={false} />
          </div>
        </motion.section>

        {/* 5. ALBUM ẢNH CƯỚI 3-1-3 CHUẨN XÁC THEO ẢNH MẪU */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-white border-b border-[#E3ECE5] space-y-3"
        >
          {/* Hàng 1: 3 ảnh dọc */}
          <div className="grid grid-cols-3 gap-2">
            {card.photos.slice(0, 3).map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.04, y: -2 }}
                onClick={() => onSelectPhoto(p.url)}
                className="aspect-[3/4] rounded-xl overflow-hidden shadow-xs cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="Botanical Album" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
            ))}
          </div>

          {/* Hàng 2: 1 ảnh ngang khổ lớn cô dâu tung khăn voan trong rừng */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectPhoto(coverPhoto)}
            className="aspect-[16/9] rounded-2xl overflow-hidden shadow-md cursor-pointer bg-stone-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPhoto} alt="Forest Veil" className="w-full h-full object-cover transition duration-500" />
          </motion.div>

          {/* Hàng 3: 3 ảnh dọc */}
          <div className="grid grid-cols-3 gap-2">
            {card.photos.slice(1, 4).map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.04, y: -2 }}
                onClick={() => onSelectPhoto(p.url)}
                className="aspect-[3/4] rounded-xl overflow-hidden shadow-xs cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="Botanical Album 2" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 6. KHỐI RSVP VÀ HỘP QUÀ MỪNG XANH RÊU */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 bg-[#FCFAF7] border-b border-[#E3ECE5] text-center space-y-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">R.S.V.P.</span>
            <h4 className="text-base font-serif font-bold text-[#1E3823]">Xác nhận tham dự</h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Vui lòng điền xác nhận để chúng mình đón tiếp và chuẩn bị được chu đáo hơn. Trân trọng!
            </p>
          </div>

          <div className="pt-1">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenRsvp}
              className="px-8 py-2.5 rounded-full bg-[#3D4A34] text-white text-xs font-sans font-bold hover:bg-[#2D3826] transition shadow cursor-pointer"
            >
              ✍️ Gửi xác nhận
            </motion.button>
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenGift}
              className="px-8 py-3 rounded-2xl bg-[#3D4A34] text-white text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>💌</span>
              <span>Gửi Quà Mừng</span>
            </motion.button>
          </div>
        </motion.section>

        {/* 7. LỜI CẢM ƠN RỪNG SƯƠNG KHÓI */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative p-10 text-center bg-stone-900 text-white overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverPhoto} alt="Garden Fog" className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs" />
          <div className="relative z-10 space-y-2 max-w-xs mx-auto">
            <h3 className="text-2xl font-serif italic text-amber-200">Lời Cảm Ơn</h3>
            <p className="text-xs text-stone-200 leading-relaxed font-serif">
              “Trân trọng cảm ơn Quý Khách đã dành thời gian đến chung vui và chúc phúc cho chúng tôi. Sự hiện diện của Quý vị là niềm vinh hạnh và hạnh phúc lớn lao của gia đình chúng tôi.”
            </p>
          </div>
        </motion.section>

        {/* 8. BOTTOM DOCK CỐ ĐỊNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#3D4A34]/95 backdrop-blur-md border-t border-white/20 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-[#2D3826] text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
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
            <Gift className="w-4 h-4 text-amber-300" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
