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
import { formatDate } from "@/lib/utils";
import { MapPin, Navigation, UserCheck, Gift, Calendar, Heart } from "lucide-react";
import { KineticText, LivingPhoto, MarqueeRibbon, FloatingQuote } from "../effects/MotionElements";

export const Template08AlpineLake: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor,
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
}) => {
  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-12-10T12:00:00Z");

  const groomName = data.groom?.fullName || "Nguyễn Dương";
  const groomShort = data.groom?.shortName || "Nguyễn Dương";
  const brideName = data.bride?.fullName || "Khánh Thy";
  const brideShort = data.bride?.shortName || "Khánh Thy";

  const coverPhoto =
    data.coverPhotoUrl ||
    card.photos[0]?.url ||
    "/images/templates/template-08-alpine.png";

  const groomAvatar = data.groom?.avatarUrl || "/images/demo/groom-avatar.png";
  const brideAvatar = data.bride?.avatarUrl || "/images/demo/bride-avatar.png";

  const defaultGalleryPhotos = [
    { url: coverPhoto, caption: "Hồ nước biếc và hàng thông xanh ngắt" },
    { url: "/images/demo/couple-sunset.png", caption: "Chiều hoàng hôn soi bóng hồ phẳng lặng" },
    { url: "/images/demo/couple-kiss.png", caption: "Lời thề ước trăm năm bên làn nước trong xanh" },
    { url: "/images/demo/couple-street.png", caption: "Bên nhau thong dong qua bốn mùa" },
    { url: groomAvatar, caption: "Chú rể Nguyễn Dương" },
    { url: brideAvatar, caption: "Cô dâu Khánh Thy" },
  ];

  const galleryPhotos =
    card.photos && card.photos.length >= 4
      ? card.photos.map((p) => ({ url: p.url, caption: p.caption }))
      : [
          ...(card.photos || []).map((p) => ({ url: p.url, caption: p.caption })),
          ...defaultGalleryPhotos.slice(card.photos?.length || 0),
        ];

  return (
    <div className="relative min-h-screen bg-[#F4F7F7] text-[#1E3E40] font-sans pb-28 sm:pb-32 overflow-x-hidden selection:bg-teal-200">
      <main className="w-full max-w-md sm:max-w-lg mx-auto bg-white shadow-[0_15px_60px_rgba(43,107,109,0.12)] sm:border-x border-[#D5E5E6] relative">

        {/* 1. HEADER SAVE THE DATE & ẢNH ĐI DẠO BÊN HỒ */}
        <section className="p-5 sm:p-7 bg-white text-center space-y-4">
          <div className="space-y-1.5">
            <KineticText
              text="SAVE THE DATE"
              className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-wider block"
            />
            <p className="text-[10px] font-mono text-stone-400 tracking-widest uppercase">
              Wedding Invitation · 10/12/2026 · 12:00
            </p>
            <h3 className="text-base font-serif italic font-bold animate-shimmer-text text-[#2B6B6D] pt-1">
              {groomName} &amp; {brideName}
            </h3>
          </div>

          {/* LivingPhoto ảnh đi dạo bên hồ: lượn sóng nhẹ + vệt sáng phản chiếu + số 10/12 */}
          <div className="relative">
            <LivingPhoto
              src={coverPhoto}
              alt="Alpine Lake Couple"
              enableGleam={true}
              enableFloat={true}
              badgeText="10 / 12"
              onClick={() => onSelectPhoto(coverPhoto)}
            />
            <div className="absolute top-4 right-4 text-right pointer-events-none z-20">
              <span className="text-3xl font-serif font-bold text-[#C92A2A] block leading-none drop-shadow">10</span>
              <span className="text-xl font-serif text-[#C92A2A] block leading-none -my-1 drop-shadow">/</span>
              <span className="text-3xl font-serif font-bold text-[#C92A2A] block leading-none drop-shadow">12</span>
            </div>
          </div>
        </section>

        {/* KINETIC MARQUEE RIBBON */}
        <MarqueeRibbon
          text="ALPINE LAKE WEDDING • NGUYỄN DƯƠNG & KHÁNH THY • 10.12.2026 • TRỌN ĐỜI BÊN NHAU"
          bgClass="bg-[#1E3E40] text-teal-200"
        />

        {/* 2. SONG HỶ ĐỎ, THÔNG TIN HAI HỌ & NGÀY CƯỚI */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="p-5 sm:p-7 bg-[#F7FAFA] border-y border-[#D5E5E6] text-center space-y-5"
        >
          <div className="w-9 h-9 mx-auto rounded-full bg-[#8E1C1F] text-white flex items-center justify-center text-base font-bold shadow-xs">
            囍
          </div>
          <span className="text-xs uppercase font-mono tracking-[0.3em] text-stone-400 block -mt-2">
            I N V I T A T I O N
          </span>

          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-0.5 text-stone-700">
              <span className="font-bold text-[#1E3E40] block uppercase text-[11px]">Nhà Trai</span>
              <p className="font-semibold">{data.groom?.parents?.fatherName || "Ông: Nguyễn Văn Thắng"}</p>
              <p className="font-semibold">{data.groom?.parents?.motherName || "Bà: Trần Thị Ánh"}</p>
            </div>
            <div className="space-y-0.5 text-stone-700">
              <span className="font-bold text-[#1E3E40] block uppercase text-[11px]">Nhà Gái</span>
              <p className="font-semibold">{data.bride?.parents?.fatherName || "Ông: Lê Hữu Đạt"}</p>
              <p className="font-semibold">{data.bride?.parents?.motherName || "Bà: Phạm Hồng Vân"}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
              TRÂN TRỌNG THÔNG BÁO LỄ THÀNH HÔN CỦA 2 CON CHÚNG TÔI
            </span>
            <div className="flex items-center justify-center gap-4 my-1">
              <span className="text-sm font-bold text-stone-700">THÁNG 12</span>
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl font-serif font-bold text-[#C92A2A] inline-block"
              >
                10
              </motion.span>
              <span className="text-sm font-bold text-stone-700">NĂM 2025</span>
            </div>
            <p className="text-[11px] text-stone-400 italic">nhằm ngày 15 tháng 11 năm Bính Ngọ</p>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-stone-400 uppercase">TẠI</span>
            <h4 className="text-base font-serif font-bold text-[#1E3E40]">TƯ GIA NHÀ TRAI</h4>
            <p className="text-xs text-stone-500 italic">Số nhà 28 Phường Vĩnh Phúc — Ba Đình — Hà Nội</p>

            <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border border-[#D5E5E6] shadow-sm bg-white p-2 mt-2">
              <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-stone-100">
                <iframe
                  title="Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.864!2d105.81!3d21.038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAyJzE2LjgiTiAxMDXCsDQ4JzM2LjAiRQ!5e0!3m2!1svi!2s!4v1620000000000"
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
                className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-teal-50 rounded-xl border border-teal-200 text-xs font-bold text-[#2B6B6D] hover:bg-teal-100 transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ đường trên Google Maps</span>
              </motion.a>
            </div>
          </div>

          {/* Thư ngỏ chạm đến cảm xúc theo ảnh mẫu Part 1 */}
          <div className="p-4 rounded-2xl bg-white border border-[#D5E5E6] text-center space-y-1.5 text-xs text-stone-600 italic font-serif leading-relaxed max-w-sm mx-auto shadow-2xs">
            <p className="font-sans font-bold text-[#1E3E40] not-italic text-sm">Hi bạn thân mến —</p>
            <p>ngày cưới của chúng mình đã bước vào đếm ngược rồi —</p>
            <p>Từng nghĩ hôn lễ chỉ là một thông báo, nhưng giờ mới hiểu,</p>
            <p>đó là dịp hiếm hoi được gặp nhau, là sự ủng hộ và yêu thương không tính toán.</p>
            <p>Cuộc đời có hơn ba vạn ngày, thật hạnh phúc khi trong một ngày như thế, bạn đến vì chúng mình.</p>
            <p className="font-bold text-[#C92A2A] not-italic pt-1 font-sans">
              Đã lâu không gặp, hẹn nhau trong ngày cưới nhé! <span className="text-rose-500">♥</span>
            </p>
          </div>
        </motion.section>

        {/* 2.5. CHUYỆN TÌNH BÊN HỒ BIẾC - LOVE STORY TIMELINE */}
        <section className="bg-white border-b border-[#D5E5E6]">
          <LoveStoryTimeline
            accentColor="#1E3E40"
            variant="alpine"
            onSelectPhoto={onSelectPhoto}
          />
        </section>

        {/* 3. LỊCH THÁNG NHÚNG TRÊN ẢNH RỪNG THÔNG VÀ HỒ NƯỚC */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[9/16] overflow-hidden bg-stone-900 text-white flex flex-col justify-between p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={coverPhoto}
            alt="Alpine Lake Calendar"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />

          {/* Lưới lịch tháng 12 nhúng trên cây thông */}
          <div className="relative z-10 max-w-xs mx-auto w-full pt-8 text-center drop-shadow-md">
            <div className="grid grid-cols-7 gap-1 text-[11px] font-mono text-white/80 pb-2">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-xs font-mono text-white">
              <span>8</span><span>9</span>
              {/* Ngày 10 khoanh trái tim */}
              <span className="relative font-bold text-rose-300 flex items-center justify-center">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 border-2 border-rose-300 rounded-full w-6 h-6 m-auto"
                />
                <span className="relative z-10">10</span>
              </span>
              <span>11</span><span>12</span><span>13</span><span>14</span>
              <span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span>
              <span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span>
              <span>29</span><span>30</span><span>31</span>
            </div>
          </div>

          <div className="relative z-10 text-center pb-4">
            <p className="text-xs font-serif italic text-white/90 drop-shadow">
              Hai ta bên mặt hồ trong vắt của mùa đông
            </p>
          </div>
        </motion.section>

        {/* 4. CHÙM ẢNH BÊN HỒ, 3 TRÁI TIM & THƠ DÁN BĂNG KEO WASHI */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-7 bg-white space-y-6"
        >
          <div className="flex justify-center gap-2 text-rose-500 text-sm">
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>♡</motion.span>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>♡</motion.span>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}>♡</motion.span>
          </div>

          <p className="text-center font-serif italic text-sm text-[#C92A2A]">
            My heart belongs to you
          </p>

          <div className="grid grid-cols-2 gap-3 items-center">
            <LivingPhoto
              src={brideAvatar}
              alt="Cô dâu Khánh Thy"
              badgeText="CÔ DÂU"
              enableGleam={true}
              onClick={() => onSelectPhoto(brideAvatar)}
            />
            <LivingPhoto
              src={groomAvatar}
              alt="Chú rể Nguyễn Dương"
              badgeText="CHÚ RỂ"
              enableGleam={true}
              onClick={() => onSelectPhoto(groomAvatar)}
            />
          </div>

          {/* Thơ lãng mạn theo ảnh mẫu */}
          <div className="text-center text-xs font-serif italic text-stone-600 leading-relaxed max-w-xs mx-auto">
            <p>Tình yêu chúng mình như suối nguồn qua bốn mùa,</p>
            <p>lắng đọng thành lời thề đi cùng nhau suốt đời <span className="text-amber-600">✦</span></p>
          </div>

          {/* 4 Khối countdown đỏ rượu vang trên nền trắng */}
          <div className="pt-2 text-center">
            <CountdownUnits targetDate={targetDate} style="boxes-burgundy" showCalendarButton={false} />
          </div>

          {/* THƠ DÁN BĂNG KEO WASHI TAPE XANH BƠ CHUẨN XÁC THEO ẢNH MẪU PART 2 */}
          <div className="relative p-5 rounded-2xl bg-[#FCFAF7] border border-[#E7ECE9] shadow-xs text-left space-y-2 overflow-hidden max-w-sm mx-auto">
            {/* Miếng băng dính washi dán góc */}
            <div className="absolute top-0 right-8 w-16 h-4 bg-[#A3B899]/70 -rotate-3 shadow-xs border-y border-white/40" />
            
            <p className="text-xs font-serif italic text-stone-700 leading-relaxed pt-2">
              “Anh sẽ luôn yêu em, điều này — em có thể hỏi lại anh bao nhiêu lần cũng được.<br />
              Em không thuộc về bất kỳ ai khác, vì em chính là duy nhất của anh <span className="text-rose-500">♥</span>”
            </p>
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-stone-400">
              <span>❖ Wild Botanical</span>
              <span>— Nguyễn Dương</span>
            </div>
          </div>

          {/* TRÍCH ĐOẠN TRIẾT LÝ HÔN NHÂN THEO ẢNH MẪU PART 3 */}
          <div className="p-4 rounded-2xl bg-[#F4F7F7] border border-[#D5E5E6] text-center text-xs font-serif italic text-stone-600 leading-relaxed max-w-sm mx-auto space-y-1">
            <p>Trong đời mỗi người, sẽ luôn có một khoảnh khắc cần kiên định với lựa chọn của chính mình</p>
            <p>một giây phút để nói rằng: &ldquo;Đây là tôi, và đây là quyết định của tôi.&rdquo;</p>
            <p className="font-semibold text-[#1E3E40] not-italic font-sans pt-1">
              Khoảnh khắc ấy, chính là hiện tại có bạn bên cạnh. <span className="text-rose-500">♥</span>
            </p>
          </div>
        </motion.section>

        {/* 4.5. LỊCH TRÌNH HÔN LỄ HỒ NÚI - WEDDING ITINERARY */}
        <section className="bg-white border-b border-[#D5E5E6]">
          <WeddingItinerary
            accentColor="#1E3E40"
            weddingDate={new Date(targetDate)}
            coupleNames={`${groomShort} & ${brideShort}`}
            venueName={mainEvent?.venueName || "Tư Gia Nhà Trai"}
            venueAddress={mainEvent?.address || "Số 28 Phường Vĩnh Phúc, Ba Đình, Hà Nội"}
          />
        </section>

        {/* 4.6. DRESS CODE SECTION */}
        <section className="bg-[#F4F7F7] border-b border-[#D5E5E6]">
          <DressCodeSection
            accentColor="#1E3E40"
            dressCodeTitle="Gợi Ý Tone Màu Trang Phục Alpine Lake"
          />
        </section>

        {/* 4.7. ALBUM ẢNH CƯỚI LIGHTBOX */}
        <section className="bg-white border-b border-[#D5E5E6]">
          <PhotoGalleryLightbox
            photos={galleryPhotos}
            accentColor="#1E3E40"
            title="Album Ảnh Kỷ Niệm"
            subtitle="Khoảnh khắc lắng đọng bên hồ biếc và rặng thông xanh ngắt"
          />
        </section>

        {/* 5. KHỐI RSVP VÀ HỘP QUÀ MỪNG TRÁI TIM */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 bg-[#F7FAFA] border-b border-[#D5E5E6] text-center space-y-4 relative"
        >
          {/* Brand watermark */}
          <div className="absolute right-2 top-8 writing-vertical text-[8px] font-sans tracking-widest text-stone-400 select-none pointer-events-none">
            Made with Ngày chung đôi
          </div>

          <div className="max-w-xs mx-auto p-5 rounded-3xl bg-white shadow-sm border border-[#D5E5E6] space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">R.S.V.P.</span>
            <h4 className="text-sm font-serif font-bold text-stone-900">Xác nhận tham dự</h4>
            <p className="text-[11px] text-stone-500">
              Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
            </p>
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={onOpenRsvp}
                className="px-6 py-2 rounded-full bg-[#E03131] text-white text-xs font-bold shadow hover:bg-[#C92A2A] transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-white" />
                <span>Gửi xác nhận</span>
              </motion.button>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenGift}
              className="px-8 py-3 rounded-2xl bg-white border-2 border-[#D5E5E6] text-stone-800 text-xs font-bold shadow-sm flex flex-col items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              {/* Hộp quà màu hồng nơ vàng chuẩn theo mẫu 08 Part 3 */}
              <div className="w-14 h-12 relative flex items-center justify-center">
                <svg viewBox="0 0 60 50" className="w-full h-full drop-shadow-2xs">
                  {/* Nơ trái tim vàng */}
                  <path d="M30 14 C24 4 14 10 20 18 C25 22 30 18 30 18 C30 18 35 22 40 18 C46 10 36 4 30 14 Z" fill="#F6C56F" />
                  {/* Nắp hộp */}
                  <rect x="8" y="16" width="44" height="8" rx="2" fill="#F48B96" stroke="#E26D7B" strokeWidth="1" />
                  {/* Thân hộp */}
                  <rect x="12" y="24" width="36" height="22" rx="2" fill="#F8A5AE" stroke="#E26D7B" strokeWidth="1" />
                  {/* Ruy băng dọc */}
                  <rect x="27" y="16" width="6" height="30" fill="#F6C56F" />
                </svg>
              </div>
              <span className="font-serif tracking-wider text-[11px] uppercase text-[#1E3E40]">GỬI QUÀ MỪNG CÔ DÂU — CHÚ RỂ</span>
            </motion.button>
          </div>

          {/* Minh họa cổng cưới Song Hỷ đỏ truyền thống với cặp đôi uyên ương đứng bên dưới từ mẫu 08 Part 3 */}
          <div className="pt-6 text-center space-y-2">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-28 mx-auto relative flex items-center justify-center"
            >
              <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
                {/* Cổng tam quan đỏ Song Hỷ hình học */}
                <rect x="15" y="10" width="70" height="70" fill="#B72B2B" rx="4" />
                <rect x="22" y="18" width="56" height="54" fill="#8C1C1C" rx="2" />
                <text x="50" y="55" fill="#FFF" fontSize="32" fontWeight="bold" textAnchor="middle" fontFamily="serif">囍</text>
                {/* Cột trụ hai bên */}
                <rect x="10" y="10" width="6" height="90" fill="#8C1C1C" />
                <rect x="84" y="10" width="6" height="90" fill="#8C1C1C" />
                {/* Cặp đôi đứng dưới cổng */}
                {/* Chú rể bên phải áo vest đen */}
                <circle cx="58" cy="74" r="6" fill="#FFE5D4" />
                <rect x="53" y="80" width="10" height="24" fill="#2B1810" rx="2" />
                {/* Cô dâu bên trái váy trắng cưới xoè */}
                <circle cx="42" cy="75" r="5.5" fill="#FFF0E6" />
                <path d="M38 80 L46 80 L52 104 L32 104 Z" fill="#FFF" stroke="#E2E8F0" strokeWidth="0.8" />
                {/* Bó hoa cưới nhỏ */}
                <circle cx="47" cy="85" r="2.5" fill="#A3B899" />
              </svg>
            </motion.div>
            <h5 className="text-2xl font-serif italic text-stone-800 tracking-wide pt-1">
              THANK YOU
            </h5>
            <p className="text-[11px] text-stone-400 font-sans tracking-widest">
              FOR SHARING OUR SPECIAL DAY
            </p>
          </div>
        </motion.section>

        {/* 5.5. NÚT THẢ TIM & DÒNG LỜI CHÚC ALPS */}
        <section className="p-6 bg-white border-b border-[#D5E5E6] space-y-6">
          <div className="flex justify-center">
            <HeartBurstButton accentColor="#1E3E40" />
          </div>

          <div className="pt-2">
            <QuickWishWall
              cardId={card.id}
              accentColor="#1E3E40"
              guestName={guestName}
            />
          </div>
        </section>

        {/* 6. BOTTOM DOCK CỐ ĐỊNH */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D5E5E6] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl flex items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenRsvp}
            className="flex-1 py-3 px-3 rounded-full bg-[#1E3E40] text-white text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xác Nhận Tham Dự</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenGift}
            className="py-3 px-5 rounded-full bg-[#E03131] text-white text-xs font-bold uppercase tracking-wider shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shrink-0"
          >
            <Gift className="w-4 h-4" />
            <span>Gửi Quà Mừng</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};
