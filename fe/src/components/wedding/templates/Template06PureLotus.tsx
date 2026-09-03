"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import { Navigation, MapPin } from "lucide-react";
import { KineticText, LivingPhoto, MarqueeRibbon } from "../effects/MotionElements";

export const Template06PureLotus: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-11-29T15:00:00Z");

  const groomName = data.groom?.fullName || "Trần Đức Hiển";
  const groomShort = data.groom?.shortName || "Đức Hiển";
  const brideName = data.bride?.fullName || "Nguyễn Minh Hằng";
  const brideShort = data.bride?.shortName || "Minh Hằng";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/templates/template-06-lotus.png";

  return (
    <div className="relative min-h-screen bg-[#F4F7F4] text-[#1E3823] font-serif pb-28 sm:pb-32 overflow-x-hidden selection:bg-rose-200">
      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-[#FCFDFC] shadow-[0_15px_60px_rgba(46,125,50,0.1)] sm:border-x border-[#DCE7DD] relative">

        {/* 1. TOP WATERCOLOR LOTUS BANNER */}
        <section className="relative pt-12 pb-14 px-6 text-center overflow-hidden bg-gradient-to-b from-[#F2F7F3] via-[#FCFDFC] to-[#FCFDFC]">
          {/* Cành sen màu nước góc trên trái */}
          <div className="absolute top-0 left-0 w-36 h-36 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,#81C784,transparent_70%)]" />
          {/* Cánh sen hồng bay lượn */}
          <div className="absolute top-8 right-6 w-3 h-5 bg-rose-300/60 rounded-full rotate-45 filter blur-[0.3px]" />
          <div className="absolute top-24 left-10 w-2.5 h-4 bg-rose-200/70 rounded-full -rotate-12 filter blur-[0.3px]" />

          <div className="space-y-3 relative z-10">
            <KineticText
              text="THIỆP BÁO HỶ"
              className="text-xl sm:text-2xl font-serif tracking-[0.25em] text-[#334E38] font-normal uppercase block"
            />
            <h1 className="text-3xl sm:text-4xl font-serif italic text-[#25432C] font-light leading-tight animate-shimmer-text">
              {brideShort} <span className="text-rose-400 font-normal">&amp;</span> {groomShort}
            </h1>
            <p className="text-lg font-serif tracking-widest text-[#3B5E43] pt-1">
              29.11.2026
            </p>
          </div>

          {/* Đóa sen hồng màu nước nở rộ góc phải dưới */}
          <div className="mt-8 flex justify-end pr-2">
            <div className="relative w-44 h-36 flex items-end justify-end">
              <motion.div
                animate={{ rotate: [-1, 1, -1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="text-right"
              >
                <span className="text-6xl filter drop-shadow-sm select-none">🪷</span>
                <span className="text-4xl -ml-4 filter drop-shadow-sm select-none">🌸</span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* KINETIC MARQUEE RIBBON */}
        <MarqueeRibbon
          text="THIỆP BÁO HỶ • MINH HẰNG & ĐỨC HIỂN • 29.11.2026 • TRỌN VẸN YÊU THƯƠNG"
          bgClass="bg-[#25432C] text-emerald-100"
        />

        {/* 2. KHUNG THIỆP BO TRÒN VIỀN XANH LỤC ĐẬM (NHÀ TRAI & NHÀ GÁI) */}
        <section className="px-5 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-[28px] border-2 border-[#3B5E43] bg-white p-6 sm:p-8 shadow-sm text-center relative overflow-hidden space-y-5"
          >
            {/* Hoa sen vàng nét mảnh góc card */}
            <div className="absolute bottom-1 left-2 text-amber-200/40 text-7xl select-none pointer-events-none">
              🪷
            </div>

            {/* Song Hỷ son đỏ hình học tròn ở đỉnh */}
            <div className="w-14 h-14 mx-auto rounded-full bg-[#8E1C1F] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              囍
            </div>

            {/* Thông tin song thân đối xứng */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-0.5 text-stone-700">
                <span className="font-bold text-[#1E3823] tracking-wider uppercase block text-[11px]">NHÀ TRAI</span>
                <p className="font-semibold">{data.groom?.parents?.fatherName || "ÔNG: TRẦN VĂN ĐẠT"}</p>
                <p className="font-semibold">{data.groom?.parents?.motherName || "BÀ: LÊ NHƯ HÀ"}</p>
                <p className="text-[10px] text-stone-500 italic pt-0.5">Tam Trinh, Hà Nội</p>
              </div>

              <div className="space-y-0.5 text-stone-700">
                <span className="font-bold text-[#1E3823] tracking-wider uppercase block text-[11px]">NHÀ GÁI</span>
                <p className="font-semibold">{data.bride?.parents?.fatherName || "ÔNG: LÊ VĂN ĐỨC"}</p>
                <p className="font-semibold">{data.bride?.parents?.motherName || "BÀ: LÊ THỊ HẠNH"}</p>
                <p className="text-[10px] text-stone-500 italic pt-0.5">Phố Huế, Hà Nội</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E3ECE5] space-y-2">
              <p className="text-xs font-serif text-stone-600 italic">
                Trân Trọng Báo Tin Lễ Thành Hôn Của
              </p>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-serif italic text-[#25432C]">
                  {brideName}
                </h3>
                <span className="text-rose-400 font-serif text-lg block">&amp;</span>
                <h3 className="text-2xl sm:text-3xl font-serif italic text-[#25432C]">
                  {groomName}
                </h3>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3. ẢNH CƯỚI NGANG CHUYỂN TIẾP MỜ ẢO */}
        <section className="pt-4 pb-2">
          <div
            onClick={() => onSelectPhoto(coverPhoto)}
            className="relative w-full aspect-[16/10] overflow-hidden cursor-pointer group"
          >
            <motion.img
              src={coverPhoto}
              alt="Lotus Wedding Moment"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full object-cover"
            />
            {/* Gradient mờ ảo chuyển tiếp vào nền trắng bên dưới */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FCFDFC]" />
          </div>
        </section>

        {/* 4. THƯ MỜI THAM DỰ TIỆC CƯỚI (LỄ THÀNH HÔN & LỄ VU QUY) */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-5 py-6 text-center space-y-6"
        >
          <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#334E38] font-bold block">
            THƯ MỜI THAM DỰ TIỆC CƯỚI
          </span>

          {/* LỄ THÀNH HÔN */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="space-y-1.5 p-4 rounded-2xl bg-white/70 border border-[#DCE7DD] shadow-2xs"
          >
            <h4 className="text-lg font-serif font-bold text-[#1E3823] tracking-wide uppercase">
              LỄ THÀNH HÔN
            </h4>
            <p className="text-xs text-stone-600 font-sans">15:00 - Chủ Nhật</p>
            <p className="text-2xl font-serif font-bold text-[#25432C] tracking-wider">
              29.11.2026
            </p>
            <p className="text-xs text-stone-500 italic font-serif">
              (Tức Ngày 15 Tháng 10 Năm Bính Ngọ)
            </p>
            <p className="text-sm font-semibold text-stone-800 pt-1">
              Tại Tư Gia Nhà Gái
            </p>
          </motion.div>

          {/* Dấu phân cách hoa văn hoàng gia */}
          <div className="flex items-center justify-center gap-3 text-amber-700/60 text-xs">
            <span>—————</span>
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-base inline-block"
            >
              🌸
            </motion.span>
            <span>—————</span>
          </div>

          {/* TIỆC MỪNG LỄ VU QUY */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="space-y-1.5 p-4 rounded-2xl bg-white/70 border border-[#DCE7DD] shadow-2xs"
          >
            <h4 className="text-lg font-serif font-bold text-[#1E3823] tracking-wide uppercase">
              TIỆC MỪNG LỄ VU QUY
            </h4>
            <p className="text-xs text-stone-600 font-sans">16:00 - Chủ Nhật</p>
            <p className="text-2xl font-serif font-bold text-[#25432C] tracking-wider">
              29.11.2026
            </p>
            <p className="text-xs text-stone-500 italic font-serif">
              (Tức Ngày 15 Tháng 11 Năm Bính Ngọ)
            </p>
            <p className="text-sm font-bold text-[#1E3823] uppercase tracking-wider pt-1">
              khách sạn CINELOVE
            </p>
          </motion.div>

          {/* EMBEDDED GOOGLE MAPS PREVIEW */}
          <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-[#3B5E43] shadow-sm bg-white p-2">
            <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-stone-100 flex items-center justify-center">
              <iframe
                title="Bản đồ sự kiện"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.8504!3d21.0288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAxJzQzLjciTiAxMDXCsDUxJzAxLjQiRQ!5e0!3m2!1svi!2s!4v1620000000000"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />
            </div>
            <div className="pt-2 text-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-2 rounded-full bg-[#3B5E43] text-white text-xs font-sans font-bold tracking-wider uppercase hover:bg-[#2A4430] transition shadow cursor-pointer"
              >
                CHỈ ĐƯỜNG
              </motion.a>
            </div>
          </div>
        </motion.section>

        {/* 5. KHUNG LỊCH THÁNG 11 VIỀN XANH CHUẨN XÁC */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-5 py-4"
        >
          <div className="rounded-[24px] border-2 border-[#3B5E43] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#1E3823] px-2 font-serif font-bold">
              <span className="text-xl">11</span>
              <span className="text-base font-sans tracking-wider">2026</span>
            </div>

            {/* Thanh header ngày trong tuần màu xanh rêu */}
            <div className="grid grid-cols-7 gap-1 py-1.5 px-2 rounded-lg bg-[#3B5E43] text-white text-[11px] font-sans font-semibold text-center">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

            {/* Lưới ngày tháng với trái tim trên ngày 29 */}
            <div className="grid grid-cols-7 gap-y-2.5 text-center text-xs text-stone-700 font-sans py-2">
              <span className="text-stone-300"></span>
              <span className="text-stone-300"></span>
              <span className="text-stone-300"></span>
              <span className="text-stone-300"></span>
              <span className="text-stone-300"></span>
              <span className="text-stone-300"></span>
              <span>1</span>

              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>

              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>

              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
              <span>22</span>

              <span>23</span>
              <span>24</span>
              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
              {/* Ngày cưới 29 có trái tim khoanh tròn nhịp đập */}
              <div className="relative flex items-center justify-center font-bold text-[#8E1C1F]">
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 border-2 border-rose-500 rounded-full w-7 h-7 m-auto flex items-center justify-center bg-rose-50"
                />
                <span className="relative z-10">29</span>
              </div>

              <span>30</span>
            </div>
          </div>
        </motion.section>

        {/* 6. KHUNG XÁC NHẬN THAM DỰ RSVP */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-5 py-4"
        >
          <div className="rounded-[28px] border-2 border-[#3B5E43] bg-white p-6 shadow-sm text-center relative overflow-hidden space-y-3">
            {/* Họa tiết hoa sen vàng nhạt */}
            <div className="absolute top-2 left-2 text-amber-200/30 text-5xl select-none pointer-events-none">
              🪷
            </div>
            <div className="absolute bottom-2 right-2 text-amber-200/30 text-5xl select-none pointer-events-none">
              🌸
            </div>

            <h4 className="text-lg font-serif font-bold text-[#1E3823] uppercase tracking-wider">
              XÁC NHẬN THAM DỰ
            </h4>
            <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase block">
              R.S.V.P.
            </span>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
              Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
            </p>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={onOpenRsvp}
                className="px-6 py-2.5 rounded-full bg-[#3B5E43] text-white text-xs font-sans font-bold hover:bg-[#2A4430] transition shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>✍️</span>
                <span>Gửi xác nhận</span>
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* 7. KHỐI GỬI QUÀ MỪNG VỚI SONG HỶ ĐỎ KHỔ LỚN */}
        <section className="py-8 px-5 text-center space-y-4">
          <h4 className="text-base font-serif font-bold text-[#1E3823] tracking-widest uppercase">
            GỬI QUÀ MỪNG
          </h4>

          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenGift}
            className="cursor-pointer inline-block"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-[#8E1C1F] text-white flex items-center justify-center text-5xl sm:text-6xl font-bold shadow-xl border-4 border-amber-100"
            >
              囍
            </motion.div>
            <span className="text-xs font-serif italic text-stone-500 block mt-2">
              Chạm vào biểu tượng Song Hỷ để gửi quà mừng
            </span>
          </motion.div>
        </section>

        {/* 8. BỐ CỤC ALBUM ẢNH CƯỚI BẤT ĐỐI XỨNG */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-5 py-6 space-y-4"
        >
          <div className="text-center space-y-1">
            <span className="text-2xl font-serif italic text-[#25432C] block">
              Album
            </span>
            <span className="text-xs font-serif tracking-widest text-stone-500 uppercase block">
              Ảnh cưới
            </span>
          </div>

          {/* Lưới ảnh so le chuẩn xác theo ảnh mẫu 06 */}
          <div className="space-y-2.5">
            {/* Hàng 1: 1 ảnh nhỏ bên trái + khoảng trống */}
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                onClick={() => onSelectPhoto(coverPhoto)}
                className="aspect-[3/4] rounded-lg overflow-hidden shadow-xs cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPhoto} alt="Album 1" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
              <div className="col-span-2 flex items-center justify-center">
                <motion.span
                  animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl opacity-40 select-none inline-block"
                >
                  🪷
                </motion.span>
              </div>
            </div>

            {/* Hàng 2: 1 ảnh dọc trung tâm khổ lớn + 2 ảnh polaroid nhỏ hai bên */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => onSelectPhoto(card.photos[1]?.url || coverPhoto)}
                className="aspect-[3/4] rounded-md overflow-hidden shadow-2xs cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.photos[1]?.url || coverPhoto} alt="Mini 1" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                onClick={() => onSelectPhoto(card.photos[2]?.url || coverPhoto)}
                className="col-span-2 aspect-[3/4] rounded-xl overflow-hidden shadow-md cursor-pointer bg-stone-100 ring-2 ring-emerald-600/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.photos[2]?.url || coverPhoto} alt="Center Couple" className="w-full h-full object-cover transition duration-500" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={() => onSelectPhoto(card.photos[3]?.url || coverPhoto)}
                className="aspect-[3/4] rounded-md overflow-hidden shadow-2xs cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.photos[3]?.url || coverPhoto} alt="Mini 2" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
            </div>

            {/* Hàng 3: 2 ảnh vuông cân xứng */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => onSelectPhoto(card.photos[4]?.url || coverPhoto)}
                className="aspect-square rounded-xl overflow-hidden shadow-xs cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.photos[4]?.url || coverPhoto} alt="Square 1" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => onSelectPhoto(card.photos[0]?.url || coverPhoto)}
                className="aspect-square rounded-xl overflow-hidden shadow-xs cursor-pointer bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.photos[0]?.url || coverPhoto} alt="Square 2" className="w-full h-full object-cover transition duration-300" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 9. FOOTER HOA SEN VÀ LỜI CHÀO ĐÓN TIẾP */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="pt-8 pb-12 px-6 text-center space-y-4 bg-gradient-to-b from-[#FCFDFC] to-[#EDF5EF]"
        >
          <div className="space-y-2">
            <span className="text-sm font-serif font-bold text-[#1E3823] tracking-widest uppercase block">
              HÂN HẠNH ĐƯỢC ĐÓN TIẾP!
            </span>
            <h4 className="text-2xl font-serif italic text-[#25432C]">
              {brideShort} &amp; {groomShort}
            </h4>
          </div>

          <div className="pt-4 flex justify-center">
            <motion.div
              animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl opacity-80 select-none"
            >
              🪷 🌸 🪷
            </motion.div>
          </div>
        </motion.section>

        {/* 10. BOTTOM DOCK CỐ ĐỊNH CHÂN MÀN HÌNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FCFDFC]/95 backdrop-blur-md border-t border-[#DCE7DD] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-[#3B5E43] text-white text-xs font-sans font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <span>✍️ Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-5 rounded-full bg-[#8E1C1F] text-white text-xs font-sans font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <span>🎁 Mừng Cưới</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
