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
import { Navigation, MapPin, UserCheck, Gift } from "lucide-react";
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

  const defaultGalleryPhotos = [
    { url: coverPhoto, caption: "Thanh tao như hoa sen ngát hương" },
    { url: "/images/demo/couple-aodai.png", caption: "Áo dài truyền thống rạng rỡ duyên lành" },
    { url: "/images/demo/couple-kiss.png", caption: "Nụ hôn hẹn ước trăm năm viên mãn" },
    { url: "/images/demo/couple-sunset.png", caption: "Bên hồ sen chiều hoàng hôn yên bình" },
    { url: "/images/demo/gallery-rings.png", caption: "Kỷ vật trăm năm kết tóc xe duyên" },
    { url: "/images/demo/couple-studio.png", caption: "Nụ cười rạng rỡ của đôi uyên ương" },
  ];

  const galleryPhotos =
    card.photos && card.photos.length >= 4
      ? card.photos.map((p) => ({ url: p.url, caption: p.caption }))
      : [
          ...(card.photos || []).map((p) => ({ url: p.url, caption: p.caption })),
          ...defaultGalleryPhotos.slice(card.photos?.length || 0),
        ];

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
            <motion.div
              animate={{ rotate: [-1, 1, -1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-36 h-28 relative flex items-center justify-end"
            >
              <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-sm">
                <ellipse cx="60" cy="80" rx="45" ry="20" fill="#3B5E43" opacity="0.65" />
                <path d="M60 80 L30 70 M60 80 L90 70" stroke="#2C4733" strokeWidth="1.2" />
                {/* Cánh sen hồng nở bung */}
                <path d="M100 35 C85 50 90 75 100 80 C110 75 115 50 100 35 Z" fill="#E58A96" stroke="#D4AF37" strokeWidth="1" />
                <path d="M85 50 C70 65 80 80 95 80 C85 70 85 55 85 50 Z" fill="#F3B2BC" stroke="#D4AF37" strokeWidth="0.8" />
                <path d="M115 50 C130 65 120 80 105 80 C115 70 115 55 115 50 Z" fill="#F3B2BC" stroke="#D4AF37" strokeWidth="0.8" />
                <ellipse cx="100" cy="62" rx="6" ry="4" fill="#D4AF37" />
              </svg>
            </motion.div>
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
            <div className="absolute bottom-2 left-2 w-24 h-24 opacity-25 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 20 C40 35 45 55 50 60 C55 55 60 35 50 20 Z" fill="#D4AF37" opacity="0.7" />
                <path d="M38 32 C28 45 35 60 47 60" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
                <path d="M62 32 C72 45 65 60 53 60" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
              </svg>
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

        {/* 3.5. CHUYỆN TÌNH SEN NGỌC - LOVE STORY TIMELINE */}
        <section className="bg-white border-b border-[#DCE7DD]">
          <LoveStoryTimeline
            accentColor="#3B5E43"
            variant="lotus"
            onSelectPhoto={onSelectPhoto}
          />
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
            <div className="w-5 h-5 text-rose-400 inline-flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 3c-1.5 2-2 4-2 6 0 3 2 5 2 5s2-2 2-5c0-2-.5-4-2-6zM8 7c-2 1.5-3 3.5-3 5.5 0 2.5 1.5 4.5 3 5 0-2 .5-4 1.5-5.5-1-1.5-1.5-3.5-1.5-5zM16 7c0 1.5-.5 3.5-1.5 5 1 1.5 1.5 3.5 1.5 5.5 1.5-.5 3-2.5 3-5 0-2-1-4-3-5.5z" />
              </svg>
            </div>
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

        {/* 4.5. LỊCH TRÌNH HÔN LỄ SEN NGỌC - WEDDING ITINERARY */}
        <section className="bg-white border-b border-[#DCE7DD]">
          <WeddingItinerary
            accentColor="#3B5E43"
            weddingDate={new Date(targetDate)}
            coupleNames={`${groomShort} & ${brideShort}`}
            venueName={mainEvent?.venueName}
            venueAddress={mainEvent?.address}
          />
        </section>

        {/* 4.6. DRESS CODE SECTION KHUYẾN NGHỊ */}
        <section className="bg-[#F4F7F4] border-b border-[#DCE7DD]">
          <DressCodeSection
            accentColor="#3B5E43"
            dressCodeTitle="Gợi Ý Tone Màu Trang Phục Sen Ngọc"
          />
        </section>

        {/* 5. KHUNG LỊCH THÁNG 11 VIỀN XANH CHUẨN XÁC */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="px-5 py-4 relative"
        >
          {/* Brand watermark */}
          <div className="absolute right-1 top-8 writing-vertical text-[8px] font-sans tracking-widest text-stone-400 select-none pointer-events-none">
            Made with Ngày chung đôi
          </div>
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
            {/* Họa tiết hoa sen vàng nhạt chìm */}
            <div className="absolute -top-4 -left-4 w-24 h-24 text-[#D4AF37]/20 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 15 C40 35 45 60 50 65 C55 60 60 35 50 15 Z" />
                <path d="M40 30 C25 45 35 65 48 65 C38 55 38 40 40 30 Z" />
                <path d="M60 30 C75 45 65 65 52 65 C62 55 62 40 60 30 Z" />
              </svg>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 text-[#D4AF37]/20 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 15 C40 35 45 60 50 65 C55 60 60 35 50 15 Z" />
                <path d="M40 30 C25 45 35 65 48 65 C38 55 38 40 40 30 Z" />
                <path d="M60 30 C75 45 65 65 52 65 C62 55 62 40 60 30 Z" />
              </svg>
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
                <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
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

        {/* 8. ALBUM ẢNH CƯỚI HOA SEN LIGHTBOX */}
        <section className="bg-white border-b border-[#DCE7DD]">
          <PhotoGalleryLightbox
            photos={galleryPhotos}
            accentColor="#3B5E43"
            title="Album Ảnh Cưới Sen Ngọc"
            subtitle="Từng khoảnh khắc thanh tao, thuần khiết và ngập tràn hạnh phúc"
          />
        </section>

        {/* 9. FOOTER HOA SEN VÀ LỜI CHÀO ĐÓN TIẾP */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="pt-8 pb-10 px-6 text-center space-y-4 bg-gradient-to-b from-[#FCFDFC] to-[#EDF5EF]"
        >
          <div className="space-y-2">
            <span className="text-sm font-serif font-bold text-[#1E3823] tracking-widest uppercase block">
              HÂN HẠNH ĐƯỢC ĐÓN TIẾP!
            </span>
            <h4 className="text-2xl font-serif italic text-[#25432C]">
              {brideShort} &amp; {groomShort}
            </h4>
          </div>

          {/* Khối minh họa Đầm Sen Dát Vàng Hoàng Kim (Golden Lotus Pond Artwork) */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <div className="w-full max-w-[280px] h-28 relative flex items-center justify-center">
              <svg viewBox="0 0 300 120" className="w-full h-full drop-shadow-md">
                {/* Lá sen lớn */}
                <ellipse cx="70" cy="85" rx="55" ry="25" fill="#3B5E43" opacity="0.8" />
                <path d="M70 85 L35 70 M70 85 L105 70 M70 85 L70 60 M70 85 L50 95 M70 85 L90 95" stroke="#2C4733" strokeWidth="1.5" />
                <ellipse cx="230" cy="88" rx="50" ry="22" fill="#3B5E43" opacity="0.75" />
                <path d="M230 88 L195 75 M230 88 L265 75 M230 88 L230 68" stroke="#2C4733" strokeWidth="1.5" />
                {/* Cuống sen */}
                <path d="M150 110 Q145 70 150 45" stroke="#2C4733" strokeWidth="3" fill="none" />
                <path d="M110 110 Q105 80 115 65" stroke="#2C4733" strokeWidth="2" fill="none" />
                <path d="M190 110 Q195 80 185 65" stroke="#2C4733" strokeWidth="2" fill="none" />
                {/* Đóa sen hồng trung tâm nở rộ */}
                <path d="M150 25 C130 45 135 70 150 75 C165 70 170 45 150 25 Z" fill="#E58A96" stroke="#D4AF37" strokeWidth="1.5" />
                <path d="M135 40 C115 55 125 75 145 75 C130 65 130 50 135 40 Z" fill="#F3B2BC" stroke="#D4AF37" strokeWidth="1" />
                <path d="M165 40 C185 55 175 75 155 75 C170 65 170 50 165 40 Z" fill="#F3B2BC" stroke="#D4AF37" strokeWidth="1" />
                {/* Búp sen bên trái */}
                <path d="M115 50 C105 60 110 75 118 75 C125 75 125 60 115 50 Z" fill="#E58A96" stroke="#D4AF37" strokeWidth="1" />
                {/* Nhụy vàng */}
                <ellipse cx="150" cy="55" rx="8" ry="6" fill="#D4AF37" />
              </svg>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-[#3B5E43] uppercase pt-1">
              ❖ ĐẦM SEN HOÀNG KIM ❖
            </span>
          </div>
        </motion.section>

        {/* 9.5. NÚT THẢ TIM & DÒNG CHÚC PHÚC SEN NGỌC */}
        <section className="p-6 bg-[#FCFDFC] border-b border-[#DCE7DD] space-y-6">
          <div className="flex justify-center">
            <HeartBurstButton accentColor="#3B5E43" />
          </div>

          <div className="pt-2">
            <QuickWishWall
              cardId={card.id}
              accentColor="#3B5E43"
              guestName={guestName}
            />
          </div>
        </section>

        {/* 10. BOTTOM DOCK CỐ ĐỊNH CHÂN MÀN HÌNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FCFDFC]/95 backdrop-blur-md border-t border-[#DCE7DD] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-[#3B5E43] text-white text-xs font-sans font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-5 rounded-full bg-[#8E1C1F] text-white text-xs font-sans font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4" />
            <span>Mừng Cưới</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
