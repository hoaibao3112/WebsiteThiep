"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ChevronDown,
  Heart,
  ChevronUp,
  Sparkles,
  Eye,
  Check,
  Sparkle,
  Layers,
  Search,
  X,
  SlidersHorizontal,
  Baby,
  Cake,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { Footer } from "@/components/shared/Footer";
import { useAuth } from "@/context/AuthContext";
import { TemplateDetailModal, TemplateModalData } from "@/components/shared/TemplateDetailModal";
import { MASTER_TEMPLATES, MasterTemplateItem } from "@/lib/templates-data";

type TemplateItem = MasterTemplateItem;
type CategoryFilter = "ALL" | "WEDDING" | "BIRTHDAY" | "NEWBORN";
type SortOption = "popular" | "newest" | "price-asc" | "price-desc";

const CATEGORY_LABELS: Record<string, string> = {
  WEDDING: "Thiệp Cưới",
  BIRTHDAY: "Sinh Nhật",
  NEWBORN: "Thôi Nôi",
};

function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, "") || "0", 10);
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
      onClick={() => window.open(`/thiep/${template.demoSlug || template.slug}`, "_blank")}
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

        {/* HAS LIVE DEMO BADGE */}
        {template.hasLiveDemo && (
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[9.5px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 border border-emerald-300/40 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" />
            <span>Đã Có Bản Mẫu</span>
          </span>
        )}

        {/* CATEGORY TAG (TOP RIGHT) — dynamic */}
        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-amber-200 text-[9px] font-bold tracking-wider uppercase border border-amber-300/30">
          {CATEGORY_LABELS[template.category] || "Thiệp Cưới"}
        </span>

        {/* INTERACTIVE HOVER GLASS OVERLAY (DESKTOP) */}
        <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex-col items-center justify-end p-4 gap-2.5 z-20">
          <Link
            href={`/thiep/${template.demoSlug || template.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg hover:scale-102 transition flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>Xem Mẫu Thực Tế</span>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#9E7329] hover:from-[#9E7329] hover:to-[#825B1D] text-white text-xs font-bold shadow-md hover:scale-102 transition flex items-center justify-center gap-1.5 cursor-pointer"
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

        {template.tags && template.tags.length > 0 && (
          <div className="flex items-center gap-1 pt-1 overflow-hidden">
            {template.tags.slice(0, 3).map((t, idx) => (
              <span key={idx} className="text-[9px] px-2 py-0.5 rounded-md bg-[#FAF0DE] text-[#8C6424] font-medium border border-[#E7D6BE] whitespace-nowrap">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* NÚT THAO TÁC RÕ RÀNG TRÊN ĐIỆN THOẠI (KHÔNG CẦN RÊ CHUỘT) */}
        <div className="flex sm:hidden items-center gap-1.5 pt-2 mt-1 border-t border-[#EFE5D5]">
          <Link
            href={`/thiep/${template.demoSlug || template.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1 active:opacity-90 cursor-pointer pointer-events-auto"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>Xem Mẫu Thật</span>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template);
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#9E7329] text-white text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1 active:opacity-90 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dùng Mẫu</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CollectionsPage() {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("WEDDING");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedModalTemplate, setSelectedModalTemplate] = useState<TemplateModalData | null>(null);
  const [displayedCount, setDisplayedCount] = useState(12);

  // Persist favorites to localStorage
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("template-favorites");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const TEMPLATES = MASTER_TEMPLATES;

  const categoryTabs: { id: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { id: "ALL", label: `Tất Cả (${TEMPLATES.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "WEDDING", label: `Thiệp Cưới (${TEMPLATES.filter((t) => t.category === "WEDDING").length})`, icon: <Heart className="w-3.5 h-3.5" /> },
    { id: "BIRTHDAY", label: `Sinh Nhật (${TEMPLATES.filter((t) => t.category === "BIRTHDAY").length})`, icon: <Cake className="w-3.5 h-3.5" /> },
    { id: "NEWBORN", label: `Thôi Nôi (${TEMPLATES.filter((t) => t.category === "NEWBORN").length})`, icon: <Baby className="w-3.5 h-3.5" /> },
  ];

  const stylesForCategory = [
    "ALL",
    ...Array.from(
      new Set(
        TEMPLATES
          .filter((tpl) => selectedCategory === "ALL" || tpl.category === selectedCategory)
          .map((tpl) => tpl.style)
          .filter(Boolean)
      )
    ),
  ];

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: "popular", label: "Phổ biến nhất" },
    { id: "newest", label: "Mới nhất" },
    { id: "price-asc", label: "Giá thấp → cao" },
    { id: "price-desc", label: "Giá cao → thấp" },
  ];

  const filteredTemplates = TEMPLATES
    .filter((tpl) => {
      const matchCategory = selectedCategory === "ALL" || tpl.category === selectedCategory;
      const matchStyle = selectedStyle === "ALL" || tpl.style === selectedStyle;
      const matchSearch =
        !searchQuery ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tpl.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tpl.style || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchStyle && matchSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case "price-asc": return parsePrice(a.price) - parsePrice(b.price);
        case "price-desc": return parsePrice(b.price) - parsePrice(a.price);
        default: return (b.salesCount || 0) - (a.salesCount || 0);
      }
    });

  const visibleTemplates = filteredTemplates.slice(0, displayedCount);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem("template-favorites", JSON.stringify(next)); } catch {}
      return next;
    });
    confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 }, colors: ["#FF6B8B", "#FF8E53", "#BE944E"] });
  };

  const handleUseTemplate = (template: TemplateItem) => {
    const templateParam = template.slug || template.id;
    if (user) {
      router.push(`/dashboard/cards/new?category=${template.category}&template=${templateParam}`);
    } else {
      openAuthModal("login");
    }
  };

  const handleCategoryChange = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    setSelectedStyle("ALL");
    setDisplayedCount(12);
  };

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + 4, filteredTemplates.length));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ["#BE944E", "#D4AF37", "#FFFFFF"] });
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
      <header className="w-full px-6 py-4 md:px-12 lg:px-20 bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#EFE9E1]/80 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center group" title="Trang Chủ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo" className="h-12 sm:h-14 md:h-15 w-auto object-contain transition-transform group-hover:scale-105" />
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
          <span>{t("collectionsBadge") || "BỘ SƯU TẬP THIỆP CƯỚI CAO CẤP"}</span>
          <Sparkle className="w-3 h-3 fill-[#8C6424]" />
        </motion.div>

        {/* LUXURY TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-[54px] font-serif font-bold text-[#2A231C] tracking-tight leading-tight"
        >
          {t("collectionsTitle") || "Bộ Sưu Tập Mẫu Thiệp Cưới Sang Trọng"}
        </motion.h1>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed"
        >
          {t("collectionsDesc") || "Khám phá các thiết kế thiệp cưới trực tuyến độc quyền, từ nét đẹp Á Đông hoàng gia đến phong cách phương Tây tối giản tinh tế. Trải nghiệm phong bì sáp 3D, album ảnh cưới và xác nhận tham dự (RSVP) chuyên nghiệp."}
        </motion.p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. CATEGORY TABS + SEARCH + SORT TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-4">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3 border border-[#EBE3D3] shadow-[0_8px_30px_rgba(180,140,70,0.06)] space-y-3">

          {/* Row 1: Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categoryTabs.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-[#8C6424] to-[#6E4E18] text-white shadow-md ring-2 ring-[#BE944E]/30"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 hover:border-[#BE944E]/40"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Style filter + Search + Sort */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Style Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {stylesForCategory.map((s) => {
                const isActive = selectedStyle === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-[#BE944E]/15 text-[#8C6424] border border-[#BE944E]/50 font-bold"
                        : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                    }`}
                  >
                    {s === "ALL" ? "Tất Cả Phong Cách" : s}
                  </button>
                );
              })}
            </div>

            {/* Spacer */}
            <div className="flex-1 hidden sm:block" />

            {/* Search input */}
            <div className="relative w-full sm:w-52 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm mẫu..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setDisplayedCount(12); }}
                className="w-full pl-8 pr-8 py-2 rounded-xl border border-stone-200 bg-stone-50/80 text-xs focus:outline-none focus:border-[#BE944E] transition text-stone-800 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">{sortOptions.find((o) => o.id === sortBy)?.label}</span>
                <span className="sm:hidden">Sắp xếp</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-stone-200 shadow-xl z-30 overflow-hidden"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortBy(opt.id); setShowSortMenu(false); }}
                        className={`w-full px-4 py-2.5 text-xs text-left font-medium transition cursor-pointer flex items-center justify-between ${
                          sortBy === opt.id ? "bg-amber-50 text-[#8C6424] font-bold" : "text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-[#BE944E]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Close sort menu backdrop */}
      {showSortMenu && <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />}

      {/* ------------------------------------------------------------- */}
      {/* 4. TEMPLATES GRID */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 my-8">
        {/* Result count */}
        <div className="text-xs text-stone-500 mb-4 font-medium">
          {searchQuery ? (
            <span>Tìm thấy <span className="font-bold text-stone-800">{filteredTemplates.length}</span> mẫu cho &ldquo;{searchQuery}&rdquo;</span>
          ) : (
            <span>Hiển thị <span className="font-bold text-stone-800">{Math.min(displayedCount, filteredTemplates.length)}</span>/{filteredTemplates.length} mẫu</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {visibleTemplates.length > 0 ? (
            visibleTemplates.map((tItem) => (
              <LuxuryTemplateCard
                key={tItem.id}
                template={tItem}
                onOpenDemo={(t) => setSelectedModalTemplate(t)}
                onUseTemplate={handleUseTemplate}
                isFavorite={!!favorites[tItem.id]}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-stone-500 font-semibold text-sm">Không tìm thấy mẫu phù hợp</p>
              <p className="text-stone-400 text-xs mt-1">Thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedStyle("ALL"); }}
                className="mt-4 px-5 py-2 rounded-full bg-[#BE944E] text-white text-xs font-bold cursor-pointer hover:bg-[#9E7329] transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* LOAD MORE BUTTON */}
        {displayedCount < filteredTemplates.length && (
          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLoadMore}
              className="relative group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FFFBF2] to-[#FAF3E3] border border-[#D9C4A1] text-xs font-bold uppercase tracking-[0.2em] text-[#8C6424] shadow-[0_4px_16px_rgba(190,148,78,0.15)] hover:shadow-[0_8px_24px_rgba(190,148,78,0.25)] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#BE944E] group-hover:rotate-12 transition-transform" />
              <span>XEM THÊM {filteredTemplates.length - displayedCount} MẪU</span>
              <ChevronDown className="w-4 h-4 text-[#BE944E] group-hover:translate-y-0.5 transition-transform" />
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
      {/* 6. BOTTOM BANNER (Light Luxury 3D Paper-Cut Sculptural Design) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        <div className="relative rounded-[36px] sm:rounded-[44px] overflow-hidden p-4 sm:p-7 md:p-12 bg-gradient-to-b from-[#F2ECE1] via-[#EBE2D5] to-[#E5DACB] border border-[#E3D6C4] shadow-[0_20px_50px_rgba(180,140,80,0.08)]">
          {/* 3D Sculptural Paper Cut Relief Layers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Top Wave Layer 1 */}
            <svg
              className="absolute -top-10 left-0 w-full h-44 sm:h-52 opacity-75"
              viewBox="0 0 1200 300"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M0 0 L1200 0 L1200 70 C1000 150 850 40 600 100 C350 160 200 80 0 140 Z"
                fill="#F7F1E7"
              />
              <path
                d="M0 0 L1200 0 L1200 30 C950 110 750 25 500 70 C250 120 150 60 0 95 Z"
                fill="#FAF6EE"
              />
            </svg>

            {/* Concentric Circles Art (Left Edge) */}
            <svg
              className="absolute -left-16 sm:-left-12 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-56 opacity-45"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle cx="50" cy="100" r="85" stroke="#BEA992" strokeWidth="1.5" />
              <circle cx="50" cy="100" r="55" stroke="#BEA992" strokeWidth="1.2" />
              <circle cx="50" cy="100" r="28" fill="#E2D4C1" />
            </svg>

            {/* Soft Organic Circles Art (Right Edge) */}
            <svg
              className="absolute -right-14 sm:-right-10 top-1/3 w-52 sm:w-64 h-52 sm:h-64 opacity-40"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle cx="145" cy="90" r="75" fill="#E0D2C0" />
              <circle cx="145" cy="90" r="45" stroke="#BEA992" strokeWidth="1.5" />
              <circle cx="145" cy="90" r="22" fill="#D7C5B0" />
            </svg>

            {/* Bottom Right 4-Point Sparkle */}
            <div className="absolute bottom-5 sm:bottom-7 right-7 sm:right-12 text-[#D2C0AB] opacity-80">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0 L14.2 9.2 L24 12 L14.2 14.8 L12 24 L9.8 14.8 L0 12 L9.8 9.2 Z" />
              </svg>
            </div>
          </div>

          {/* Main Ivory Card */}
          <div className="relative z-10 w-full rounded-[28px] sm:rounded-[36px] bg-[#FAF3E7] border border-[#EADBCA] shadow-[0_12px_36px_rgba(180,140,80,0.06),0_2px_8px_rgba(0,0,0,0.02)] py-12 sm:py-16 md:py-20 px-6 sm:px-12 text-center flex flex-col items-center justify-center space-y-4 sm:space-y-5">
            {/* Tag Badge */}
            <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1 sm:py-1.5 rounded-full bg-[#E5D7C3] border border-[#D5C2AA]/80 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#6E4F32]">
                {t("badgeUniqueDesign") || "THIẾT KẾ ĐỘC BẢN"}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-[34px] lg:text-[36px] font-serif font-bold text-[#1E1B18] tracking-tight leading-[1.28] max-w-xl mx-auto">
              {t("ctaBannerTitle") || "Sẵn sàng tạo tấm thiệp độc bản của bạn?"}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] md:text-sm text-[#685F55] leading-relaxed max-w-lg sm:max-w-xl mx-auto">
              {t("ctaBannerSubtitle") || "Trải nghiệm phong bì sáp 3D, album ảnh cưới và quản lý RSVP chuyên nghiệp cho sự kiện của bạn."}
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (user) router.push("/dashboard/cards/new");
                  else openAuthModal("login");
                }}
                className="group inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-[#8E5323] hover:bg-[#7D451B] active:scale-95 text-white text-xs sm:text-[12.5px] font-bold uppercase tracking-[0.16em] transition-all duration-300 shadow-[0_8px_22px_rgba(142,83,35,0.35)] hover:shadow-[0_12px_28px_rgba(142,83,35,0.45)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFDE9E] fill-[#FFDE9E] transition-transform duration-300 group-hover:rotate-12" />
                <span>{t("ctaBannerBtn") || "BẮT ĐẦU THIẾT KẾ"}</span>
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
