"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  Crown,
  Check,
  Sparkle,
  Star,
  Layers,
  Wand2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { Footer } from "@/components/shared/Footer";
import { useAuth } from "@/context/AuthContext";
import { TemplateDetailModal, TemplateModalData } from "@/components/shared/TemplateDetailModal";

interface TemplateItem extends TemplateModalData {
  originalPrice?: string;
  rating?: number;
  salesCount?: number;
}

// Interactive 3D Tilt Card Component
function LuxuryTemplateCard({
  template,
  onOpenDemo,
  onUseTemplate,
  isFavorite,
  onToggleFavorite,
}: {
  template: TemplateItem;
  onOpenDemo: (t: TemplateItem) => void;
  onUseTemplate: (t: TemplateItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="relative rounded-[28px] p-2.5 sm:p-3 bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EC] to-[#F3EAD9] border border-[#E7D6BE] shadow-[0_10px_28px_rgba(180,140,70,0.08),0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(190,148,78,0.22)] transition-all duration-300 flex flex-col justify-between group cursor-pointer"
    >
      {/* SHINING GOLD FOIL CORNER ORNAMENTS */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#BE944E]/40 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#BE944E]/40 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#BE944E]/40 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#BE944E]/40 rounded-br-lg pointer-events-none" />

      {/* CARD IMAGE CONTAINER */}
      <div
        className="relative w-full aspect-[9/13.5] rounded-[22px] overflow-hidden bg-stone-100 mb-3 shadow-inner"
        style={{ transform: "translateZ(18px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.imageUrl}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
        />

        {/* GOLD LUXURY LIGHT SHEEN ON HOVER */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 pointer-events-none" />

        {/* NEW / HOT BADGE */}
        {template.isNew && (
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 border border-white/40">
            <Sparkle className="w-2.5 h-2.5 fill-white" />
            <span>Mới Ra Mắt</span>
          </span>
        )}

        {/* CATEGORY TAG (TOP RIGHT) */}
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[9px] font-semibold tracking-wider uppercase border border-white/20">
          {template.category === "WEDDING"
            ? "Cưới"
            : template.category === "NEWBORN"
            ? "Thôi Nôi"
            : template.category === "BIRTHDAY"
            ? "Sinh Nhật"
            : "Sự Kiện"}
        </span>

        {/* INTERACTIVE HOVER GLASS OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDemo(template);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-bold shadow-lg hover:scale-102 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Xem Bản Thử Nghiệm</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#9E7329] hover:from-[#9E7329] hover:to-[#825B1D] text-white text-xs font-bold shadow-lg hover:scale-102 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dùng Mẫu Này</span>
          </button>
        </div>
      </div>

      {/* CARD METADATA (BOTTOM BAR) */}
      <div className="px-1.5 pb-1 space-y-1" style={{ transform: "translateZ(12px)" }}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-serif font-bold text-[#2A231C] group-hover:text-[#BE944E] transition truncate">
            {template.name}
          </h3>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(template.id);
            }}
            className={`p-1 rounded-full transition-transform active:scale-125 cursor-pointer ${
              isFavorite
                ? "text-rose-500 fill-rose-500"
                : "text-stone-300 hover:text-rose-400"
            }`}
            title="Lưu vào yêu thích"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="text-[11px] text-stone-500 font-medium">
            {template.style}
          </span>
          <span className="font-serif font-bold text-[#BE944E] text-xs sm:text-[13px]">
            {template.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CollectionsPage() {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const [selectedCat, setSelectedCat] = useState("ALL");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedModalTemplate, setSelectedModalTemplate] = useState<TemplateModalData | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [displayedCount, setDisplayedCount] = useState(8);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const styleScrollRef = useRef<HTMLDivElement>(null);

  const pricePrefix = t("priceFromPrefix") || "Từ";

  const TEMPLATES: TemplateItem[] = [
    {
      id: "1",
      name: t("template1Name") || "Minimalism Nâu",
      category: "WEDDING",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=700&auto=format&fit=crop",
      isNew: true,
    },
    {
      id: "2",
      name: t("template2Name") || "Hoa Mộc Hồng",
      category: "WEDDING",
      style: "Floral Romance",
      price: `${pricePrefix} 249.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=700&auto=format&fit=crop",
    },
    {
      id: "3",
      name: t("template3Name") || "Cổ Điển Hoàng Gia",
      category: "WEDDING",
      style: "Cổ Điển Hoàng Gia",
      price: `${pricePrefix} 299.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=700&auto=format&fit=crop",
    },
    {
      id: "4",
      name: t("template4Name") || "Mộc Nhi Nhi",
      category: "NEWBORN",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=700&auto=format&fit=crop",
    },
    {
      id: "5",
      name: t("template5Name") || "Cyber Neon",
      category: "BIRTHDAY",
      style: "Cyber Neon",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700&auto=format&fit=crop",
    },
    {
      id: "6",
      name: t("template6Name") || "Terracotta Arch",
      category: "WEDDING",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 249.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=700&auto=format&fit=crop",
    },
    {
      id: "7",
      name: t("template7Name") || "Classic Ivory",
      category: "WEDDING",
      style: "Cổ Điển Hoàng Gia",
      price: `${pricePrefix} 299.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=700&auto=format&fit=crop",
    },
    {
      id: "8",
      name: t("template8Name") || "Bold Asymmetry",
      category: "EVENT",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&auto=format&fit=crop",
    },
    {
      id: "9",
      name: "Hoa Lụa Hoàng Gia",
      category: "WEDDING",
      style: "Floral Romance",
      price: `${pricePrefix} 269.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=700&auto=format&fit=crop",
    },
    {
      id: "10",
      name: "Vườn Ngọc Romance",
      category: "WEDDING",
      style: "Cổ Điển Hoàng Gia",
      price: `${pricePrefix} 299.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=700&auto=format&fit=crop",
    },
    {
      id: "11",
      name: "Bé Cưng Baby Cloud",
      category: "NEWBORN",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 199.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=700&auto=format&fit=crop",
    },
    {
      id: "12",
      name: "Gala Tiệc Tối Sang Trọng",
      category: "EVENT",
      style: "Minimalist Luxury",
      price: `${pricePrefix} 249.000đ`,
      imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=700&auto=format&fit=crop",
    },
  ];

  const categories = [
    { id: "ALL", label: t("filterAll") || "Tất Cả" },
    { id: "WEDDING", label: t("filterWedding") || "Đám Cưới" },
    { id: "NEWBORN", label: t("filterNewborn") || "Đầy Tháng & Thôi Nôi" },
    { id: "BIRTHDAY", label: t("filterBirthday") || "Sinh Nhật" },
    { id: "EVENT", label: t("filterEvent") || "Sự Kiện" },
  ];

  const styles = [
    { id: "ALL", label: t("styleAll") || "Tất Cả Phong Cách" },
    { id: "Minimalist Luxury", label: t("styleMinimalistLuxury") || "Tối Giản Sang Trọng" },
    { id: "Floral Romance", label: t("styleFloralRomance") || "Hoa Cỏ Lãng Mạn" },
    { id: "Cổ Điển Hoàng Gia", label: t("styleRoyalClassic") || "Cổ Điển Hoàng Gia" },
  ];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchCat = selectedCat === "ALL" || tpl.category === selectedCat;
    const matchStyle = selectedStyle === "ALL" || tpl.style === selectedStyle;
    return matchCat && matchStyle;
  });

  const visibleTemplates = filteredTemplates.slice(0, displayedCount);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.7 },
      colors: ["#FF6B8B", "#FF8E53", "#BE944E"],
    });
  };

  const handleUseTemplate = (template: TemplateItem) => {
    if (user) {
      router.push(`/dashboard/cards/new?templateId=${template.id}`);
    } else {
      openAuthModal("login");
    }
  };

  const handleScrollCategories = (direction: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    const amount = direction === "left" ? -180 : 180;
    categoryScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleScrollStyles = (direction: "left" | "right") => {
    if (!styleScrollRef.current) return;
    const amount = direction === "left" ? -180 : 180;
    styleScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + 4, TEMPLATES.length));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#BE944E", "#D4AF37", "#FFFFFF"],
    });
  };

  const FAQS = [
    {
      q: t("faq1Q") || "Tôi có thể tùy chỉnh mẫu thiệp đến mức nào?",
      a: t("faq1A") || "Bạn có thể tự do thay đổi toàn bộ họ tên, ảnh bìa, album gallery, danh sách sự kiện, bản đồ Google Maps, lời ngỏ, bài hát MP3 nền và màu sắc chủ đạo theo sở thích.",
    },
    {
      q: t("faq2Q") || "Mẫu thiệp này hiển thị trên điện thoại như thế nào?",
      a: t("faq2A") || "100% mẫu thiệp tại CardVite được tối ưu hoá chuẩn hiển thị cho màn hình di động (iOS & Android) với tỷ lệ 9:16, tải trang siêu tốc và mượt mà.",
    },
    {
      q: t("faq3Q") || "Khách mời ở nước ngoài có thể mở thiệp và nghe nhạc được không?",
      a: t("faq3A") || "Có, hệ thống máy chủ đặt tại CDN toàn cầu giúp khách mời từ bất kỳ quốc gia nào cũng truy cập với tốc độ cực nhanh, hỗ trợ đa ngôn ngữ và nghe nhạc ổn định.",
    },
    {
      q: t("faq4Q") || "Tôi có thể xuất danh sách khách mời xác nhận tham dự (RSVP) không?",
      a: t("faq4A") || "Hoàn toàn được! Bạn có thể xem danh sách trực tiếp trên bảng điều khiển hoặc xuất ra file Excel chuẩn để bàn giao số lượng bàn tiệc cho nhà hàng.",
    },
    {
      q: t("faq5Q") || "Thời gian hoàn thiện và nhận link thiệp là bao lâu?",
      a: t("faq5A") || "Chỉ từ 5 đến 10 phút tự thiết kế trên hệ thống, bạn sẽ có ngay đường link thiệp cưới cá nhân hóa riêng để gửi tới bạn bè và người thân.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden relative selection:bg-[#BE944E]/20">
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND FLOATING PETALS & PARTICLES */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft radial glow centers */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-rose-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-amber-100/25 rounded-full blur-3xl" />

        {/* Decorative corner floral SVGs */}
        <div className="absolute top-24 -left-12 opacity-40">
          <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
            <circle cx="60" cy="100" r="45" fill="#FAF3E6" stroke="#E8DCB8" strokeWidth="1.5" />
            <path d="M40 90C50 70 80 70 90 90C80 110 50 110 40 90Z" fill="#F4EADB" />
            <circle cx="60" cy="100" r="20" fill="#EBDDC7" />
            <path d="M20 70C15 40 45 40 50 60C55 80 30 90 20 70Z" fill="#A4B59D" fillOpacity="0.3" />
          </svg>
        </div>

        <div className="absolute top-1/2 -right-16 opacity-40">
          <svg width="260" height="260" viewBox="0 0 200 200" fill="none">
            <circle cx="120" cy="80" r="50" fill="#FAF5ED" stroke="#E8DCB8" strokeWidth="1.5" />
            <circle cx="120" cy="80" r="22" fill="#F2E6D5" />
            <path d="M70 50C60 20 95 20 105 45C115 70 85 80 70 50Z" fill="#A4B59D" fillOpacity="0.35" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVBAR */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#EFE9E1]/80 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo CardVite" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#181716] group-hover:text-[#BE944E] transition">
              CardVite
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link href="/collections" className="text-[#BE944E] border-b-2 border-[#BE944E] pb-0.5">
              {t("homeNavCollections")}
            </Link>
            <Link href="/journal" className="hover:text-[#BE944E] transition">
              {t("homeNavJournal")}
            </Link>
            <Link href="/pricing" className="hover:text-[#BE944E] transition">
              {t("homeNavPricing")}
            </Link>
            <Link href="/concierge" className="hover:text-[#BE944E] transition">
              {t("homeNavConcierge")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <Link
                href="/dashboard/cards"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 text-xs font-semibold hover:border-[#BE944E] transition shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#BE944E] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="px-4 py-2 rounded-full text-[11px] font-bold text-stone-700 hover:text-stone-900 border border-stone-300 hover:bg-white transition cursor-pointer"
              >
                {t("navLogin") || "Đăng Nhập"}
              </button>
            )}

            <button
              onClick={() => {
                if (user) router.push("/dashboard/cards/new");
                else openAuthModal("login");
              }}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-[#BE944E] to-[#9E7329] hover:from-[#9E7329] hover:to-[#825B1D] text-white text-[11px] font-bold tracking-widest uppercase shadow-md transition cursor-pointer"
            >
              {t("homeCreateBtn")}
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO TITLE SECTION (Matching Image Reference) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-6 text-center space-y-4">
        {/* GOLD BADGE */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#F5EEDF] border border-[#D9C4A1] text-[#8C6424] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] shadow-2xs"
        >
          <Sparkle className="w-3 h-3 fill-[#8C6424]" />
          <span>BỘ SƯU TẬP CAO CẤP</span>
          <Sparkle className="w-3 h-3 fill-[#8C6424]" />
        </motion.div>

        {/* LUXURY TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-[54px] font-serif font-bold text-[#2A231C] tracking-tight leading-tight"
        >
          Kho Mẫu Thiệp Đa Danh Mục
        </motion.h1>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed"
        >
          Khám phá hàng trăm thiết kế thiệp cưới, đầy tháng, sinh nhật và sự kiện độc quyền.
          Được chế tác với sự tinh tế trong từng pixel, tối giản nhưng đậm chất nghệ thuật, hoàn hảo để lưu giữ khoảnh khắc của bạn.
        </motion.p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. ELEGANT & COMPACT FILTER SYSTEM */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 my-6">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-[#EBE3D3] shadow-[0_8px_30px_rgba(180,140,70,0.06)] space-y-3">
          {/* TIER 1: CATEGORIES PILL TABS */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            {categories.map((cat) => {
              const isActive = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#8C6424] to-[#6E4E18] text-white shadow-md scale-102 ring-2 ring-[#BE944E]/30"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 hover:border-[#BE944E]/40"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* TIER 2: STYLES SUB-FILTER CHIPS */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-stone-100 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1 hidden sm:inline">
              Phong cách:
            </span>
            {styles.map((s) => {
              const isActive = selectedStyle === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-amber-100/90 text-[#8C6424] font-bold border border-[#BE944E]/50 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-100/60"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. TEMPLATES 8-CARD LUXURY GRID (4 Columns x 2 Rows) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 my-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {visibleTemplates.map((tItem) => (
            <LuxuryTemplateCard
              key={tItem.id}
              template={tItem}
              onOpenDemo={(t) => setSelectedModalTemplate(t)}
              onUseTemplate={handleUseTemplate}
              isFavorite={!!favorites[tItem.id]}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>

        {/* LOAD MORE BUTTON WITH GLOW EFFECT */}
        {displayedCount < filteredTemplates.length && (
          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLoadMore}
              className="relative group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FFFBF2] to-[#FAF3E3] border border-[#D9C4A1] text-xs font-bold uppercase tracking-[0.2em] text-[#8C6424] shadow-[0_4px_16px_rgba(190,148,78,0.15)] hover:shadow-[0_8px_24px_rgba(190,148,78,0.25)] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#BE944E] group-hover:rotate-12 transition-transform" />
              <span>XEM THÊM 240+ MẪU</span>
              <ChevronDown className="w-4 h-4 text-[#BE944E] group-hover:translate-y-0.5 transition-transform" />

              {/* Glowing aura */}
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. FAQ ACCORDION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 my-20">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {t("faqSubheading") || "Giải Đáp Thắc Mắc"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#181716] mt-1">
            {t("faqHeading") || "Câu Hỏi Thường Gặp"}
          </h2>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-[#EFE9E1] shadow-2xs divide-y divide-stone-100">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-stone-800 hover:text-[#BE944E] transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
                )}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed pr-4">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. BOTTOM BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-16">
        <div className="rounded-[36px] bg-gradient-to-br from-[#1C1A17] via-[#2D261E] to-[#1C1A17] text-white p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden border border-[#D4AF37]/30">
          {/* Glowing backlight */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5 max-w-lg mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
              Thiết Kế Độc Bản
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-100">
              {t("ctaBannerTitle") || "Bắt đầu tạo thiệp ngay hôm nay"}
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Trải nghiệm phong bì sáp 3D, album ảnh cưới và quản lý RSVP chuyên nghiệp cho sự kiện của bạn.
            </p>
            <div>
              <button
                onClick={() => {
                  if (user) router.push("/dashboard/cards/new");
                  else openAuthModal("login");
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#BE944E] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#BE944E] text-stone-950 text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-amber-500/20 hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t("ctaBannerBtn") || "Tạo Thiệp Ngay"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <Footer />

      {/* QUICK VIEW TEMPLATE DETAIL MODAL */}
      <TemplateDetailModal
        isOpen={!!selectedModalTemplate}
        onClose={() => setSelectedModalTemplate(null)}
        template={selectedModalTemplate}
      />
    </div>
  );
}
