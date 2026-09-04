"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Check, ChevronLeft, ChevronRight, Layers, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface TemplateModalData {
  id: string;
  name: string;
  category: string;
  style: string;
  price: string;
  imageUrl: string;
  isNew?: boolean;
  description?: string;
  tags?: string[];
  demoSlug?: string;
  coupleText?: string;
  features?: string[];
  colorPalette?: string[];
  envelopeColor?: string;
  musicTitle?: string;
  eventDateText?: string;
  venueText?: string;
}

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateModalData | null;
}

// MAPPING 9 MẪU VỚI CÁC PHÂN ĐOẠN ẢNH THAM KHẢO VÀ THÔNG TIN CẶP ĐÔI THỰC TẾ
const TEMPLATE_REFERENCE_PARTS: Record<
  string,
  {
    groom: string;
    bride: string;
    date: string;
    venue: string;
    parts: { label: string; url: string; desc: string }[];
  }
> = {
  "wedding-heritage-crimson-gold": {
    groom: "Minh Khôi",
    bride: "Ngọc Hân",
    date: "20.11.2026",
    venue: "Trung Tâm Tiệc Cưới Hoàng Gia",
    parts: [
      {
        label: "Phần 1: Toàn Cảnh",
        url: "/images/templates/references/mau-01-oriental-heritage-crimson-gold.png",
        desc: "Phù hiệu sơn mài đỉnh thiệp, cửa sổ vòm cung đình, 3 huy hiệu âm dương và sớ lưu bút hoàng gia.",
      },
    ],
  },
  "wedding-modern-editorial-magazine": {
    groom: "Công Vinh",
    bride: "Hải Yến",
    date: "28.12.2026",
    venue: "Tư Gia Nhà Trai - Hà Nội",
    parts: [
      {
        label: "Phần 1: Hero & Bố Cục Zigzag",
        url: "/images/templates/references/mau-02b-cong-vinh-hai-yen-editorial-zigzag-01.png",
        desc: "Bố cục đối xứng Zigzag song thân cô dâu & chú rể, bộ 3 ảnh kể chuyện Triptych.",
      },
      {
        label: "Phần 2: Lịch Tháng & RSVP Phong Bì",
        url: "/images/templates/references/mau-02b-cong-vinh-hai-yen-editorial-zigzag-02.png",
        desc: "Lịch tháng 12 nhúng trực quan khoanh trái tim ngày 27, phong bì rút thẻ RSVP và hộp quà.",
      },
    ],
  },
  "wedding-sweet-editorial-romance": {
    groom: "Quốc Huy",
    bride: "Mai Anh",
    date: "24.12.2026",
    venue: "Trống Đồng Palace, Hà Nội",
    parts: [
      {
        label: "Phần 1: Mở Thiệp & Lễ Thành Hôn",
        url: "/images/templates/references/mau-03-sweet-romantic-pink-part-01.png",
        desc: "Phong bì sáp đỏ 3D chạm mở thiệp, 4 ô đếm ngược đất nung, khối ngày nghệ thuật to bản 24/12.",
      },
      {
        label: "Phần 2: Bản Đồ & Profile Cô Dâu",
        url: "/images/templates/references/mau-03-sweet-romantic-pink-part-02.png",
        desc: "Bản đồ Google Maps nhúng trực tiếp, Sweet Wedding collage và profile About Us cô dâu.",
      },
      {
        label: "Phần 3: Profile Chú Rể & Timeline",
        url: "/images/templates/references/mau-03-sweet-romantic-pink-part-03.png",
        desc: "Profile chú rể, Save The Date lịch tháng 12 nhúng trên ảnh cưới, timeline dọc mốc giờ trái tim.",
      },
      {
        label: "Phần 4: Hộp Vòm RSVP & VietQR Đôi",
        url: "/images/templates/references/mau-03-sweet-romantic-pink-part-04.png",
        desc: "Hộp vòm RSVP màu hồng đất nung, cặp thẻ đôi VietQR riêng biệt cho Cô dâu và Chú rể.",
      },
    ],
  },
  "wedding-crimson-wine-marsala": {
    groom: "Nguyễn Minh",
    bride: "Bùi Phương",
    date: "20.12.2026",
    venue: "Quảng Vinh, Sầm Sơn, Thanh Hóa",
    parts: [
      {
        label: "Phần 1: Cổng Vòm & Lịch Tròn Kính",
        url: "/images/templates/references/mau-04-red-wine-marsala-arch-part-01.png",
        desc: "Cổng vòm Roman Arch uốn cong chữ Welcome, thấu kính lịch tròn trong suốt trên tà váy cưới.",
      },
      {
        label: "Phần 2: Lễ Thành Hôn & Vu Quy So Le",
        url: "/images/templates/references/mau-04-red-wine-marsala-arch-part-02.png",
        desc: "Hai khối tiệc so le đảo chiều kèm bộ đếm ngược kép riêng cho từng sự kiện và thơ tình lãng mạn.",
      },
      {
        label: "Phần 3: RSVP & Poster Thanks",
        url: "/images/templates/references/mau-04-red-wine-marsala-arch-part-03.png",
        desc: "Hộp RSVP đỏ rượu, hộp quà trái tim 3D nở hoa và ảnh kết thúc chữ THANKS dập nổi kiểu Vogue.",
      },
    ],
  },
  "wedding-forest-green-botanical": {
    groom: "Tuấn Minh",
    bride: "Mai Lan",
    date: "02.08.2026",
    venue: "Tư Gia Nhà Gái (Quốc Oai) & Nhà Trai",
    parts: [
      {
        label: "Phần 1: Phong Bì Xanh & Lịch Polaroid",
        url: "/images/templates/references/mau-05-rustic-forest-green-part-01.png",
        desc: "Phong bì xanh rêu hoa dại, thẻ lịch My Love, bố cục ảnh đôi đối diện lồng cột thơ tình.",
      },
      {
        label: "Phần 2: Thẻ Sự Kiện Liền Khối & Album",
        url: "/images/templates/references/mau-05-rustic-forest-green-part-02.png",
        desc: "Thẻ sự kiện xanh rêu liền khối bao trọn 2 tiệc, đếm ngược xanh rêu và album sân vườn ngoài trời.",
      },
      {
        label: "Phần 3: Hộp RSVP & Lời Cảm Ơn Sương Khói",
        url: "/images/templates/references/mau-05-rustic-forest-green-part-03.png",
        desc: "Hộp RSVP xanh rêu, thẻ gửi quà mừng và lời cảm ơn kết thiệp trên ảnh cưới phủ sương khói.",
      },
    ],
  },
  "wedding-pure-lotus-heritage": {
    groom: "Đức Hiển",
    bride: "Minh Hằng",
    date: "29.11.2026",
    venue: "Khách Sạn CINELOVE, Hà Nội",
    parts: [
      {
        label: "Phần 1: Thiệp Báo Hỷ & Thư Mời",
        url: "/images/templates/references/mau-06-pure-lotus-heritage-part-01.png",
        desc: "Thiệp Báo Hỷ hoa sen màu nước, biểu tượng Song Hỷ son tròn, thông tin thành hôn và Google Maps.",
      },
      {
        label: "Phần 2: Lịch Tháng 11 & Đầm Sen Hoàng Kim",
        url: "/images/templates/references/mau-06-pure-lotus-heritage-part-02.png",
        desc: "Lịch cành sen tháng 11, hộp RSVP sen vàng, quà mừng Song Hỷ và tác phẩm Đầm Sen Dát Vàng.",
      },
    ],
  },
  "wedding-cinematic-editorial": {
    groom: "Quang Huy",
    bride: "Thuỳ Linh",
    date: "19.12.2026",
    venue: "Promex Center, Cầu Giấy, Hà Nội",
    parts: [
      {
        label: "Phần 1: Poster Đồi Thông & Our Love Story",
        url: "/images/templates/references/mau-07-cinematic-editorial-part-01.png",
        desc: "Poster cinematic toàn trang, trích dẫn tiếng Anh, thanh header tạp chí và chuyên mục Our Love Story.",
      },
      {
        label: "Phần 2: Fall In Love & Lịch Nụ Hôn",
        url: "/images/templates/references/mau-07-cinematic-editorial-part-02.png",
        desc: "Bài thơ rừng xanh, ảnh nụ hôn nhúng lịch tháng 12 ngày 19 và bộ đếm ngược đỏ rượu vang.",
      },
      {
        label: "Phần 3: Promex Center & You Are My Sunshine",
        url: "/images/templates/references/mau-07-cinematic-editorial-part-03.png",
        desc: "Địa điểm Promex Center, Google Maps, poster phát sáng You are my Sunshine và RSVP đen than chì.",
      },
    ],
  },
  "wedding-alpine-lake-romance": {
    groom: "Nguyễn Dương",
    bride: "Khánh Thy",
    date: "10.12.2026",
    venue: "Tư Gia Nhà Trai - Ba Đình, Hà Nội",
    parts: [
      {
        label: "Phần 1: Hồ Ngọc Bích & Lịch Tán Thông",
        url: "/images/templates/references/mau-08-alpine-lake-romance-part-01.png",
        desc: "Hero bờ hồ Thụy Sĩ, số ngày 10/12 to bản, lịch tháng 12 nhúng đè trên tán thông cổ thụ bên hồ.",
      },
      {
        label: "Phần 2: Thơ Suối Nguồn & Washi Tape",
        url: "/images/templates/references/mau-08-alpine-lake-romance-part-02.png",
        desc: "Bộ 3 trái tim đỏ, thơ suối nguồn 4 mùa, đếm ngược đỏ và cành hoa khô dán băng dính Washi Tape xanh bơ.",
      },
      {
        label: "Phần 3: Triết Lý Tình Yêu & Cổng Song Hỷ",
        url: "/images/templates/references/mau-08-alpine-lake-romance-part-03.png",
        desc: "Đoạn văn triết lý tình yêu, hộp quà pastel trái tim và tranh minh họa Cổng cưới Song Hỷ đỏ.",
      },
    ],
  },
  "wedding-imperial-dragon-crimson": {
    groom: "Anh Tuấn",
    bride: "Thu Trang",
    date: "19.12.2025",
    venue: "Promex Center - Cầu Giấy, Hà Nội",
    parts: [
      {
        label: "Phần 1: Long Phụng Chìm & Cổng Song Hỷ 3D",
        url: "/images/templates/references/mau-09-imperial-dragon-crimson-part-01.png",
        desc: "Nền gấm đỏ đô in chìm Long Phụng, tranh chibi uyên ương tựa cổng 3D Song Hỷ, giá vẽ hoa cưới và đồng hồ cổ.",
      },
      {
        label: "Phần 2: Hộp Mừng Cưới 2 Thẻ QR Vàng Cát",
        url: "/images/templates/references/mau-09-imperial-dragon-crimson-part-02.png",
        desc: "Hai thẻ VietQR độc lập viền kép màu vàng cát, con dấu triện đồng Song Hỷ dát vàng kết thiệp.",
      },
    ],
  },
};

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const { t } = useLanguage();
  const [activePartIndex, setActivePartIndex] = useState(0);

  // Reset tab khi đổi template
  useEffect(() => {
    setActivePartIndex(0);
  }, [template?.id]);

  // Đóng modal khi bấm phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  const refData = TEMPLATE_REFERENCE_PARTS[template.id] || TEMPLATE_REFERENCE_PARTS[template.demoSlug || ""];
  const parts = refData?.parts || [
    {
      label: "Phân Đoạn Chính",
      url: template.imageUrl,
      desc: template.description || "Giao diện mẫu thiệp điện tử cao cấp.",
    },
  ];

  const currentPart = parts[Math.min(activePartIndex, parts.length - 1)];

  const groomName = refData?.groom || "Minh Khôi";
  const brideName = refData?.bride || "Ngọc Hân";
  const weddingDate = refData?.date || "20.12.2026";
  const venueName = refData?.venue || "Trung Tâm Tiệc Cưới";

  const leftFeatures = [
    t("modalFeatCustom") || "Tùy chỉnh toàn bộ thông tin hai họ & sự kiện",
    t("modalFeatGallery") || "Album ảnh cưới tương tác đa góc nhìn",
    t("modalFeatWishes") || "Sổ lưu bút & lời chúc thời gian thực",
    t("modalFeatReminder") || "Nhắc hẹn ngày cưới qua Lịch thông minh",
    t("modalFeatTimeline") || "Dòng thời gian mốc giờ chi tiết",
  ];

  const rightFeatures = [
    t("modalFeatMaps") || "Bản đồ Google Maps nhúng trực tiếp & chỉ đường",
    t("modalFeatRsvp") || "Biểu mẫu xác nhận tham dự (RSVP) xuất Excel",
    t("modalFeatQr") || "Mã VietQR chuyển khoản mừng cưới tiện lợi",
    t("modalFeatCountdown") || "Bộ đếm ngược thời gian cát tường",
    t("modalFeatMusic") || "Phát nhạc nền lãng mạn bản quyền cao cấp",
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* BACKDROP BLUR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-all"
        />

        {/* MODAL MAIN CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[1040px] max-h-[92vh] flex flex-col rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl z-10 my-auto border border-white/20 bg-stone-900"
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition hover:rotate-90 duration-300 cursor-pointer shadow-md border border-white/20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden flex-1">
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: MULTI-PART VISUAL PREVIEW SLIDER */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-6 bg-gradient-to-b from-[#1C1A18] via-[#24211D] to-[#181614] p-5 sm:p-7 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10">
              {/* TOP INFO BADGE */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#BE944E]/20 border border-[#BE944E]/40 text-[#E5B869] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{template.style}</span>
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {weddingDate}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#E5B869] uppercase tracking-wider font-serif">
                  {groomName} &amp; {brideName}
                </span>
              </div>

              {/* PART TABS SELECTOR (NẾU MẪU CÓ NHIỀU PHÂN ĐOẠN) */}
              {parts.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5">
                  {parts.map((part, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePartIndex(idx)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        activePartIndex === idx
                          ? "bg-[#BE944E] text-stone-950 font-bold shadow-sm"
                          : "bg-white/10 text-stone-300 hover:bg-white/20"
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>{part.label.split(":")[0]}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* MAIN IMAGE PREVIEW CONTAINER */}
              <div className="relative my-2 w-full aspect-[9/13.5] max-h-[460px] rounded-2xl overflow-hidden bg-stone-950 border border-white/10 shadow-2xl flex items-center justify-center group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPart.url}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentPart.url}
                      alt={currentPart.label}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* PREV / NEXT BUTTONS */}
                {parts.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActivePartIndex((prev) => (prev > 0 ? prev - 1 : parts.length - 1))
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20 shadow-md"
                      aria-label="Phân đoạn trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActivePartIndex((prev) => (prev < parts.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20 shadow-md"
                      aria-label="Phân đoạn sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* PART CAPTION & DESCRIPTION */}
              <div className="pt-2 px-1 text-center sm:text-left">
                <p className="text-xs font-bold text-[#E5B869] font-serif">
                  {currentPart.label}
                </p>
                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed mt-0.5">
                  {currentPart.desc}
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: DETAILED SPECIFICATIONS & ACTIONS */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-6 bg-gradient-to-b from-[#221B14] via-[#1F1710] to-[#18110B] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative">
              <div className="space-y-4 sm:space-y-5">
                {/* TEMPLATE TITLE & PRICE */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[11px] uppercase tracking-widest text-[#BE944E] font-bold">
                      {template.category === "WEDDING" ? "MẪU THIỆP CƯỚI ĐỘC BẢN" : template.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-amber-300 font-mono">
                      {template.price}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-tight">
                    {template.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mt-2 font-light">
                    {template.description ||
                      "Thiết kế thiệp cưới độc bản tối ưu hiển thị 100% trên điện thoại di động với âm thanh sống động và hiệu ứng tương tác cao cấp."}
                  </p>
                </div>

                {/* VENUE & TAGS */}
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-stone-300">
                    <span className="text-stone-400 font-medium">Địa điểm mẫu:</span>
                    <span className="font-semibold text-white">{venueName}</span>
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {template.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-0.5 rounded-full bg-white/10 text-stone-200 text-[10px] font-medium border border-white/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* FEATURES CHECKLIST SECTION */}
                <div className="pt-2 border-t border-white/10">
                  <h3 className="text-xs sm:text-sm font-serif font-bold text-[#E5B869] uppercase tracking-wider mb-2.5">
                    Tính Năng Cao Cấp Tích Hợp Sẵn
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-stone-300">
                    <div className="space-y-2">
                      {leftFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#BE944E] shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="text-[11.5px] leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {rightFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#BE944E] shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="text-[11.5px] leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* BOTTOM CTAS (BUTTONS) */}
              {/* ------------------------------------------------------------- */}
              <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                {/* PRIMARY BUTTON: TẠO THIỆP */}
                <Link
                  href={`/dashboard/cards/new?category=${template.category}&template=${template.demoSlug || template.id}`}
                  className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#BE944E] to-[#9E7329] hover:from-[#A87F39] hover:to-[#875E19] active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-amber-300/30"
                >
                  <span>✨ Sử Dụng Mẫu Này</span>
                </Link>

                {/* SECONDARY BUTTON: XEM DEMO TRỰC TIẾP */}
                <Link
                  href={`/thiep/${template.demoSlug || template.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/30 text-white font-bold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Eye className="w-4 h-4 text-amber-300" />
                  <span>Xem Demo Trực Tiếp</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
