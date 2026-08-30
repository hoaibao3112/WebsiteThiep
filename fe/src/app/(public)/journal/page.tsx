"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Palette,
  BookOpen,
  Heart,
  Lock,
  Sparkles,
  ChevronRight,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/shared/Footer";

interface Article {
  id: string;
  category: "all" | "wedding" | "ritual" | "invite" | "compare";
  tag: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  imageUrl: string;
}

const ARTICLES: Article[] = [
  {
    id: "1",
    category: "wedding",
    tag: "XU HƯỚNG",
    date: "15 THG 10, 2024",
    readTime: "4 PHÚT ĐỌC",
    title: "Top 5 Màu Sắc Chủ Đạo Cho Mùa Cưới 2026",
    excerpt:
      "Từ sắc Nude ấm áp đến Xanh Sage tinh tế, sự chuyển dịch của bảng màu phản ánh cá tính và kỉ niệm của bạn.",
    imageUrl: "/images/journal-card-balloon.jpg",
  },
  {
    id: "2",
    category: "compare",
    tag: "SO SÁNH",
    date: "12 THG 10, 2024",
    readTime: "6 PHÚT ĐỌC",
    title: "Thiệp Kỹ Thuật Số và Thiệp Giấy Truyền Thống",
    excerpt:
      "Phân tích chi tiết ưu và nhược điểm, giúp bạn đưa ra lựa chọn phù hợp nhất cho ngày trọng đại của mình.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    category: "invite",
    tag: "LỜI MỜI",
    date: "08 THG 10, 2024",
    readTime: "5 PHÚT ĐỌC",
    title: "Nghệ Thuật Viết Lời Mời: Từ Trưởng Bối Đến Bạn Bè",
    excerpt:
      "Làm sao để lời mời vừa trang trọng, vừa gần gũi và truyền tải trọn vẹn ý nghĩa ngày cưới?",
    imageUrl: "/images/journal-card-beach.jpg",
  },
];

export default function JournalPage() {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const categories = [
    { id: "all", label: t("journalCatAll") || "Tất cả" },
    { id: "wedding", label: t("journalCatWedding") || "Xu hướng cưới" },
    { id: "ritual", label: t("journalCatRitual") || "Nghi thức tinh hoa" },
    { id: "invite", label: t("journalCatInvite") || "Lời mời chuẩn" },
    { id: "compare", label: t("journalCatCompare") || "So sánh thiệp số" },
  ];

  const articles: Article[] = [
    {
      id: "1",
      category: "wedding",
      tag: t("journalArticle1Tag") || "XU HƯỚNG",
      date: t("journalArticle1Date") || "15 THG 10, 2024",
      readTime: t("journalArticle1ReadTime") || "4 PHÚT ĐỌC",
      title: t("journalArticle1Title") || "Top 5 Màu Sắc Chủ Đạo Cho Mùa Cưới 2026",
      excerpt:
        t("journalArticle1Excerpt") ||
        "Từ sắc Nude ấm áp đến Xanh Sage tinh tế, sự chuyển dịch của bảng màu phản ánh cá tính và kỉ niệm của bạn.",
      imageUrl: "/images/journal-card-balloon.jpg",
    },
    {
      id: "2",
      category: "compare",
      tag: t("journalArticle2Tag") || "SO SÁNH",
      date: t("journalArticle2Date") || "12 THG 10, 2024",
      readTime: t("journalArticle2ReadTime") || "6 PHÚT ĐỌC",
      title: t("journalArticle2Title") || "Thiệp Kỹ Thuật Số và Thiệp Giấy Truyền Thống",
      excerpt:
        t("journalArticle2Excerpt") ||
        "Phân tích chi tiết ưu và nhược điểm, giúp bạn đưa ra lựa chọn phù hợp nhất cho ngày trọng đại của mình.",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    },
    {
      id: "3",
      category: "invite",
      tag: t("journalArticle3Tag") || "LỜI MỜI",
      date: t("journalArticle3Date") || "08 THG 10, 2024",
      readTime: t("journalArticle3ReadTime") || "5 PHÚT ĐỌC",
      title: t("journalArticle3Title") || "Nghệ Thuật Viết Lời Mời: Từ Trưởng Bối Đến Bạn Bè",
      excerpt:
        t("journalArticle3Excerpt") ||
        "Làm sao để lời mời vừa trang trọng, vừa gần gũi và truyền tải trọn vẹn ý nghĩa ngày cưới?",
      imageUrl: "/images/journal-card-beach.jpg",
    },
  ];

  const filteredArticles = articles.filter((art) => {
    return selectedCategory === "all" || art.category === selectedCategory;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmailInput("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVBAR (GLOBAL SHARED HEADER) */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-4 md:px-12 lg:px-20 bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#EFE9E1]/80 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center group" title="Trang Chủ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-12 sm:h-14 md:h-15 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link href="/collections" className="hover:text-[#BE944E] transition">
              {t("homeNavCollections")}
            </Link>
            <Link href="/journal" className="text-[#BE944E] border-b-2 border-[#BE944E] pb-0.5">
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
                  {user.name?.charAt(0).toUpperCase() || "U"}
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
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-[11px] font-bold tracking-widest uppercase shadow-sm hover:scale-105 transition cursor-pointer"
            >
              {t("homeCreateBtn")}
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SPLIT SECTION (CẨM NANG & CẢM HỨNG TỔ CHỨC TIỆC) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-16 md:px-12 lg:px-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT BANNER CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Top Category Tag */}
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6B38]">
              {t("journalHeroTag") || "KHÁM PHÁ & CẢM HỨNG"}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-bold text-[#181716] tracking-tight leading-[1.15]">
              {t("journalHeroTitle1") || "Cẩm Nang &"} <br />
              {t("journalHeroTitle2") || "Cảm Hứng"} <br />
              <span className="italic font-normal font-serif text-[#C4974E]">
                {t("journalHeroTitleEm") || "Tổ Chức Tiệc"}
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-sm text-stone-600/90 max-w-md leading-relaxed">
              {t("journalHeroDesc") || "Khám phá xu hướng thiết kế thiệp mời mới nhất, nghệ thuật viết lời mời tinh tế và cẩm nang toàn diện cho những sự kiện trọng đại của bạn."}
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <a
                  href="#articles"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-[0_8px_25px_rgba(190,148,78,0.38)] transition"
                >
                  <span>{t("journalHeroBtn") || "Khám phá ngay"}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT BANNER: LUXURY BRIDAL BOUQUET IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative flex justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[16/10] sm:aspect-[16/11] rounded-[36px] sm:rounded-[44px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-[#EFE8DC]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/journal-hero-bouquet.jpg"
                alt="Bó hoa cưới sang trọng"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* 4 FEATURE PILLARS (FLOATING GLASS BAR) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 border border-[#EFE8DC] shadow-xs mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
        >
          {/* Pillar 1 */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E] shrink-0 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-800 font-sans">
                {t("journalPillar1Title") || "Cập nhật mỗi tuần"}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {t("journalPillar1Desc") || "Xu hướng mới nhất"}
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E] shrink-0 shadow-2xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-800 font-sans">
                {t("journalPillar2Title") || "Nội dung chọn lọc"}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {t("journalPillar2Desc") || "Đẹp & chuyên sâu"}
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E] shrink-0 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-800 font-sans">
                {t("journalPillar3Title") || "Dễ đọc – Dễ áp dụng"}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {t("journalPillar3Desc") || "Thực tế & hữu ích"}
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E] shrink-0 shadow-2xs">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-800 font-sans">
                {t("journalPillar4Title") || "Truyền cảm hứng"}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {t("journalPillar4Desc") || "Cho ngày trọng đại"}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. CATEGORY FILTER PILL TABS */}
      {/* ------------------------------------------------------------- */}
      <section id="articles" className="max-w-7xl mx-auto px-6 mb-10 md:px-12 lg:px-20">
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#A87B32] text-white shadow-sm hover:bg-[#966C2A]"
                    : "bg-white text-stone-700 border border-[#EAE0CD] hover:bg-[#FAF5EE]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. ARTICLES 3-COLUMN GRID */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 mb-14 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {filteredArticles.map((art) => (
            <motion.div
              key={art.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] sm:rounded-[32px] overflow-hidden border border-[#EFE9E1] shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[16/11] overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                />
                {/* Tag Badge */}
                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[9px] font-bold uppercase tracking-wider text-stone-800 shadow-2xs">
                  {art.tag}
                </span>
              </div>

              {/* Text Content */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-semibold tracking-wider uppercase mb-2">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#181716] leading-snug group-hover:text-[#BE944E] transition">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-2.5 leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                {/* Read Link */}
                <div className="pt-4 mt-auto">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#BE944E] group-hover:text-[#966C2A] transition">
                    <span>{t("readArticleBtn") || "ĐỌC BÀI VIẾT"}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. FEATURED HORIZONTAL ARTICLE CARD (LỄ THÔI NÔI) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 mb-16 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[32px] sm:rounded-[40px] overflow-hidden border border-[#EFE9E1] shadow-2xs hover:shadow-lg transition-all grid grid-cols-1 lg:grid-cols-12 items-center group text-left"
        >
          {/* Photo Left */}
          <div className="lg:col-span-5 relative aspect-[16/11] lg:aspect-auto lg:h-full overflow-hidden bg-stone-100 min-h-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/journal-featured-ritual.jpg"
              alt="Ý nghĩa sâu sắc của 12 vật phẩm trong lễ thôi nôi"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-stone-800 shadow-2xs">
              {t("journalFeaturedTag") || "NGHI THỨC"}
            </span>
          </div>

          {/* Content Right */}
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-semibold tracking-wider uppercase">
              <span>{t("journalFeaturedDate") || "01 THG 10, 2024"}</span>
              <span>•</span>
              <span>{t("journalFeaturedReadTime") || "8 PHÚT ĐỌC"}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#181716] leading-snug group-hover:text-[#BE944E] transition">
              {t("journalFeaturedTitle") || "Ý Nghĩa Sâu Sắc Của 12 Vật Phẩm Trong Lễ Thôi Nôi"}
            </h3>

            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xl">
              {t("journalFeaturedDesc") || "Khám phá nguồn gốc và hàm ý ý nghĩa tâm linh đằng sau mỗi món đồ truyền thống, giúp bạn chuẩn bị lễ thôi nôi cho bé một cách chu đáo và trọn vẹn."}
            </p>

            <div className="pt-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(190,148,78,0.35)] transition"
                >
                  <span>{t("readArticleBtn") || "ĐỌC BÀI VIẾT"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. NEWSLETTER SUBSCRIPTION BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 mb-20 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[32px] sm:rounded-[38px] bg-gradient-to-r from-[#FAF3E8] via-[#FAF7F2] to-[#F5EFE4] border border-[#EAE0CD] overflow-hidden p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs"
        >
          {/* Left Decorative Wax Seal Envelope */}
          <div className="hidden md:block w-36 lg:w-48 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop"
              alt="Phong bì thiệp cưới sáp niêm phong"
              className="w-full h-auto rounded-2xl object-cover shadow-sm opacity-90 rotate-[-4deg]"
            />
          </div>

          {/* Center Newsletter Form */}
          <div className="flex-1 max-w-xl text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#181716]">
              {t("journalNewsletterTitle") || "Không bỏ lỡ những xu hướng cưới mới nhất"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
              {t("journalNewsletterDesc") || "Đăng ký nhận bản tin để cập nhật bài viết mới, mẹo hay và ưu đãi độc quyền."}
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-1">
              <input
                type="email"
                required
                placeholder={t("journalNewsletterPlaceholder") || "Nhập email của bạn..."}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full sm:flex-1 px-5 py-2.5 rounded-full bg-white border border-[#EAE0CD] text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#BE944E]/30 shadow-2xs"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#C4974E] hover:bg-[#A87B32] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                {t("journalNewsletterBtn") || "ĐĂNG KÝ NGAY"}
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t("journalNewsletterSuccess") || "Cảm ơn bạn đã đăng ký nhận bản tin CardVite Journal!"}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1 font-medium">
              <Lock className="w-3 h-3 text-[#BE944E]" />
              <span>{t("journalNewsletterPrivacy") || "Chúng tôi tôn trọng quyền riêng tư của bạn."}</span>
            </div>
          </div>

          {/* Right Decorative Wedding Rings */}
          <div className="hidden md:block w-36 lg:w-48 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop"
              alt="Nhẫn cưới vàng"
              className="w-full h-auto rounded-2xl object-cover shadow-sm opacity-90 rotate-[4deg]"
            />
          </div>
        </motion.div>
      </section>


      {/* ------------------------------------------------------------- */}
      {/* 7. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <Footer />
    </div>
  );
}
