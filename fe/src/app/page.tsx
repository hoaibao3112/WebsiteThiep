"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Menu,
  X,
  CalendarCheck2,
  Gift,
  Gamepad2,
  Image as ImageIcon,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit3,
  Send,
  Play,
  Pause,
  Music,
  Heart,
  QrCode,
  CheckCircle2,
  Stamp,
  Disc,
  Check,
  Star,
  Flower2,
  Package,
  Volume2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const CAROUSEL_CARDS = [
  {
    id: 1,
    title: "Vườn Ngọc",
    couple: "Minh Khôi & Ngọc Hân",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop",
    tag: "Sang Trọng",
  },
  {
    id: 2,
    title: "Hoa Lụa Nâu",
    couple: "Văn Long & Thu Hà",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop",
    tag: "Tối Giản",
  },
  {
    id: 3,
    title: "Hoa Mộc Hồng",
    couple: "Tuấn Anh & Mai Phương",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=500&auto=format&fit=crop",
    tag: "Romance",
  },
  {
    id: 4,
    title: "Hồng Xanh",
    couple: "Minh Đức & Thu Hà",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&auto=format&fit=crop",
    tag: "Cổ Điển",
  },
  {
    id: 5,
    title: "Minimalism Nâu",
    couple: "Hoàng Nam & Thảo Vy",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&auto=format&fit=crop",
    tag: "Modern",
  },
];

const TRACKS = [
  { id: 1, title: "Until I Found You", artist: "Stephen Sanchez", duration: "2:57" },
  { id: 2, title: "I Do", artist: "911 Band", duration: "3:24" },
  { id: 3, title: "A Thousand Years", artist: "Christina Perri", duration: "4:45" },
  { id: 4, title: "Perfect", artist: "Ed Sheeran", duration: "4:23" },
];

const SAMPLE_WISHES_1 = [
  { name: "Lan Anh", relation: "Bạn Đại Học", wish: "Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long! ❤️", time: "2 phút trước" },
  { name: "Hoàng Minh", relation: "Đồng Nghiệp", wish: "Mãi mãi ngọt ngào và thấu hiểu nhau như ngày đầu nhé! ✨", time: "5 phút trước" },
  { name: "Bác Sáu", relation: "Gia Đình", wish: "Chúc hai cháu xây dựng tổ ấm viên mãn, phát tài phát lộc!", time: "12 phút trước" },
  { name: "Jessica Nguyen", relation: "Best Friend", wish: "Wishing you both a lifetime of unconditional love & joy! 🥂", time: "15 phút trước" },
];

const SAMPLE_WISHES_2 = [
  { name: "Đức Trọng", relation: "Bạn Thân Chú Rể", wish: "Cuối cùng anh bạn thân cũng có người rước! Mừng cho 2 đứa! 🎉", time: "18 phút trước" },
  { name: "Phương Thảo", relation: "Em Gái", wish: "Chị gái xinh đẹp nhất của em hôm nay rạng rỡ quá chừng! 💖", time: "25 phút trước" },
  { name: "Quốc Bảo", relation: "Anh Họ", wish: "Chúc mừng tân lang tân nương, sớm sinh quý tử nhé!", time: "30 phút trước" },
  { name: "David Chen", relation: "Colleague", wish: "Congratulations! Best wishes on your wonderful journey ahead! 🌟", time: "42 phút trước" },
];

const BILINGUAL_SAMPLES: Record<string, { groom: string; bride: string; invite: string }> = {
  "Tiếng Việt": { groom: "Chú Rể", bride: "Cô Dâu", invite: "Trân trọng kính mời" },
  "English": { groom: "The Groom", bride: "The Bride", invite: "Cordially Invites You" },
  "简体中文": { groom: "新郎", bride: "新娘", invite: "谨呈 • 诚挚邀请" },
  "한국어": { groom: "신랑", bride: "신부", invite: "초대합니다" },
  "Español": { groom: "El Novio", bride: "La Novia", invite: "Tienen el honor de invitarle" },
  "Français": { groom: "Le Marié", bride: "La Mariée", invite: "Vous prient d'honorer de votre présence" },
  "Русский": { groom: "Жених", bride: "Невеста", invite: "Искренне приглашаем вас" },
  "Deutsch": { groom: "Der Bräutigam", bride: "Die Braut", invite: "Laden herzlich ein" },
};

const COUPLES_STORIES = [
  {
    id: 1,
    couple: "Hoàng Nam & Thảo Vy",
    location: "GEM Center, TP. Hồ Chí Minh",
    date: "Tháng 12, 2024",
    photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
    quote: "Khách mời ai cũng bất ngờ khi nhận thiệp có đúng tên mình. Tính năng RSVP giúp tụi mình chốt bàn tiệc với nhà hàng chỉ trong 1 nốt nhạc!",
    stars: 5,
  },
  {
    id: 2,
    couple: "Minh Quân & Thu Hà",
    location: "JW Marriott Hotel, Hà Nội",
    date: "Tháng 10, 2024",
    photo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
    quote: "Hiệu ứng mở con dấu sáp 3D và nhạc nền du dương khiến tấm thiệp sang trọng vượt ngoài mong đợi. Bạn bè quốc tế xem bản song ngữ khen nức nở!",
    stars: 5,
  },
  {
    id: 3,
    couple: "Tuấn Anh & Mai Phương",
    location: "InterContinental Danang Sun Peninsula",
    date: "Tháng 11, 2024",
    photo: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop",
    quote: "Hộp mừng cưới VietQR cực kỳ tiện lợi cho các bạn ở xa không về kịp. Hệ thống thống kê RSVP tự động xuất file Excel siêu chuyên nghiệp.",
    stars: 5,
  },
];

export default function CardViteHomePage() {
  const { t } = useLanguage();
  const { user, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bộ điều khiển Simulator Hero
  const [names, setNames] = useState("Sarah & James");
  const [selectedEffect, setSelectedEffect] = useState<"Wax Seal" | "Flower Gate" | "Gift Box">("Wax Seal");
  const [sealOpened, setSealOpened] = useState(false);

  // 3D Parallax Mouse Physics cho Hero Phone
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-12, 12]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // State cho 3D Carousel
  const [carouselIndex, setCarouselIndex] = useState(2);

  // Active step trong quy trình 3 bước
  const [activeStep, setActiveStep] = useState(1);

  // State cho Audio Visualizer
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);

  // State cho Wax Seal Studio
  const [waxColor, setWaxColor] = useState<"gold" | "wine" | "emerald" | "rose">("gold");
  const [isStamping, setIsStamping] = useState(false);
  const [stampedCount, setStampedCount] = useState(128);

  // State cho Live Wishes Wall
  const [userWish, setUserWish] = useState("");
  const [wishesList, setWishesList] = useState(SAMPLE_WISHES_1);

  // State cho VietQR Simulator
  const [qrAmount, setQrAmount] = useState("500.000đ");
  const [qrSuccess, setQrSuccess] = useState(false);

  // State cho Mời Đích Danh Mockup
  const [guestAttending, setGuestAttending] = useState<boolean | null>(true);
  const [guestCompanion, setGuestCompanion] = useState(2);

  // State cho Đa Ngôn Ngữ Song Ngữ
  const [activeLangTag, setActiveLangTag] = useState("한국어");

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % CAROUSEL_CARDS.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + CAROUSEL_CARDS.length) % CAROUSEL_CARDS.length);
  };

  const handleHeroCardClick = () => {
    setSealOpened(!sealOpened);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#BE944E", "#D4AF37", "#FFFFFF", "#E08269", "#10B981"],
    });
  };

  const handleStampWax = () => {
    setIsStamping(true);
    setTimeout(() => {
      setIsStamping(false);
      setStampedCount((prev) => prev + 1);
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: waxColor === "gold" ? ["#D4AF37", "#FFD700"] : waxColor === "wine" ? ["#8B0000", "#DC143C"] : waxColor === "emerald" ? ["#2E8B57", "#3CB371"] : ["#FF69B4", "#FFB6C1"],
      });
    }, 450);
  };

  const handleSendTrialWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userWish.trim()) return;
    const newEntry = {
      name: "Bạn (Vừa Gửi)",
      relation: "Khách Quý",
      wish: userWish.trim(),
      time: "Vừa xong",
    };
    setWishesList([newEntry, ...wishesList]);
    setUserWish("");
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ["#E08269", "#FF69B4", "#BE944E"],
    });
  };

  const handleSimulatePayment = () => {
    setQrSuccess(true);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#10B981", "#34D399", "#BE944E"],
    });
    setTimeout(() => setQrSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden selection:bg-[#BE944E]/20">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER & NAVBAR */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2] sticky top-0 z-40 backdrop-blur-md bg-[#FAF7F2]/90 border-b border-[#EFE9E1]/60 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="group flex items-center">
            <span className="text-3xl font-serif font-bold tracking-tight text-[#181716] group-hover:text-[#BE944E] transition duration-300">
              CardVite
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link
              href="/collections"
              className="hover:text-[#BE944E] transition relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#BE944E] after:transition-all"
            >
              {t("homeNavCollections")}
            </Link>
            <Link
              href="/journal"
              className="hover:text-[#BE944E] transition relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#BE944E] after:transition-all"
            >
              {t("homeNavJournal")}
            </Link>
            <Link
              href="/pricing"
              className="hover:text-[#BE944E] transition relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#BE944E] after:transition-all"
            >
              {t("homeNavPricing")}
            </Link>
            <Link
              href="/concierge"
              className="hover:text-[#BE944E] transition relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#BE944E] after:transition-all"
            >
              {t("homeNavConcierge")}
            </Link>
          </nav>

          {/* RIGHT ACTION */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/cards"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 text-xs font-semibold hover:border-[#BE944E] transition shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#BE944E] text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-[11px] font-bold text-stone-500 hover:text-stone-900 transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="px-4 py-2 rounded-full text-[11px] font-bold text-stone-700 hover:text-stone-900 border border-stone-300 hover:bg-white transition cursor-pointer"
              >
                Đăng Nhập
              </button>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard/cards/new"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#C19A5B] hover:bg-[#b0894a] text-white text-[11px] font-bold tracking-widest uppercase shadow-md transition cursor-pointer"
              >
                {t("homeCreateBtn")}
              </Link>
            </motion.div>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#181716]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-[#FAF7F2]/98 backdrop-blur-xl flex flex-col justify-center px-8 md:hidden"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#181716]"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="space-y-6 text-center">
              <Link
                href="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-2xl font-serif font-bold text-[#181716]"
              >
                {t("homeNavCollections")}
              </Link>
              <Link
                href="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-2xl font-serif font-bold text-[#181716]"
              >
                {t("homeNavJournal")}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-2xl font-serif font-bold text-[#181716]"
              >
                {t("homeNavPricing")}
              </Link>
              <Link
                href="/concierge"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-2xl font-serif font-bold text-[#181716]"
              >
                {t("homeNavConcierge")}
              </Link>
              <div className="pt-6 flex flex-col items-center gap-4">
                <LanguageSwitcher />
                <Link
                  href="/dashboard/cards/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full max-w-xs py-3.5 rounded-full bg-[#C19A5B] text-white text-xs font-bold uppercase tracking-widest shadow-md"
                >
                  {t("homeCreateBtn")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION VỚI NHIỀU HIỆU ỨNG ANIMATION VÀ 3D PARALLAX */}
      {/* ------------------------------------------------------------- */}
      <section
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="max-w-6xl mx-auto px-6 pt-6 pb-20 md:px-12 lg:px-20 relative"
      >
        {/* BACKGROUND FLOATING GOLD DUST PARTICLES */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -120, 0],
                x: [0, (i % 2 === 0 ? 30 : -30), 0],
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 6 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7,
              }}
              className="absolute w-2 h-2 rounded-full bg-[#BE944E]/30 blur-[1px]"
              style={{
                left: `${15 + i * 11}%`,
                top: `${40 + (i % 4) * 15}%`,
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* CỘT TRÁI: TIÊU ĐỀ & FORM */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            {/* LIVE PULSE STATS BADGE */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8ECE5] text-[#556353]">
                  {t("homeTagWedding")}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCECE7] text-[#A66353]">
                  {t("homeTagGala")}
                </span>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-stone-200 text-[10px] text-stone-600 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>1,248 thiệp gửi hôm nay</span>
              </motion.div>
            </div>

            {/* HEADLINE */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#181716] leading-[1.12]">
              {t("homeHeroTitle1")} <br />
              {t("homeHeroTitle2") && <>{t("homeHeroTitle2")} <br /></>}
              <span className="italic font-normal text-[#BE944E]">
                {t("homeHeroTitleEm1")}
              </span> <br />
              {t("homeHeroTitle3")}{" "}
              <span className="italic font-normal text-[#BE944E]">
                {t("homeHeroTitleEm2")}
              </span>
            </h1>

            {/* FORM SIMULATOR CÓ HIỆU ỨNG REALTIME */}
            <div className="p-6 bg-white/85 backdrop-blur-md rounded-3xl border border-[#EFE9E1] shadow-lg space-y-4 max-w-md">
              <div>
                <label className="block text-[11px] font-semibold text-[#181716]/60 mb-1.5">
                  {t("homeFieldCoupleName")}
                </label>
                <input
                  type="text"
                  value={names}
                  onChange={(e) => setNames(e.target.value)}
                  placeholder="Sarah & James"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F0EAE1]/70 border border-[#E2DBD0] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-[#181716] font-medium transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#181716]/60 mb-1.5">
                  {t("homeFieldEffect")}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "Wax Seal", label: t("homeEffectWaxSeal"), icon: Stamp },
                    { id: "Flower Gate", label: t("homeEffectFlowerGate"), icon: Flower2 },
                    { id: "Gift Box", label: t("homeEffectGiftBox"), icon: Gift },
                  ].map((eff) => (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      key={eff.id}
                      type="button"
                      onClick={() => {
                        setSelectedEffect(eff.id as any);
                        setSealOpened(false);
                      }}
                      className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer text-[11px] font-medium ${
                        selectedEffect === eff.id
                          ? "bg-[#FAF2E4] border-[#BE944E] text-[#8C6424] font-bold shadow-xs ring-1 ring-[#BE944E]/30"
                          : "bg-white border-[#E8E2D8] text-[#181716]/70 hover:bg-[#FAF7F2]"
                      }`}
                    >
                      {eff.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/dashboard/cards/new"
                  className="w-full py-3 rounded-xl bg-[#181716] hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>{t("homeBtnPreview")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* CỘT PHẢI: SLEEK STANDING PHONE MOCKUP - DEDICATED FULL-SCREEN VERTICAL VIDEO SHOWCASE */}
          <div className="lg:col-span-5 flex flex-col items-center relative">
            {/* 3 TABS CHUYỂN ĐỔI VIDEO MẪU THIỆP */}
            <div className="flex items-center gap-2 mb-4 z-20">
              {[
                {
                  id: "video1",
                  title: "Mẫu Vườn Ngọc",
                  url: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-walking-in-a-field-41484-large.mp4",
                },
                {
                  id: "video2",
                  title: "Mẫu Hoa Lụa",
                  url: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-posing-for-the-camera-41584-large.mp4",
                },
                {
                  id: "video3",
                  title: "Mẫu Cổ Điển",
                  url: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-holding-hands-in-a-forest-41480-large.mp4",
                },
              ].map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    const videoEl = document.getElementById("hero-wedding-video") as HTMLVideoElement;
                    if (videoEl) {
                      videoEl.src = v.url;
                      videoEl.play().catch(() => {});
                    }
                  }}
                  className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition cursor-pointer border bg-white/80 hover:bg-white text-stone-700 border-[#E8E2D8] shadow-2xs hover:border-[#BE944E]"
                >
                  {v.title}
                </button>
              ))}
            </div>

            {/* MAIN 3D PARALLAX PHONE CONTAINER WITH DEDICATED VIDEO PLAYER */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ scale: 1.02 }}
              className="relative w-64 sm:w-72 aspect-[9/18.5] rounded-[44px] bg-gradient-to-b from-stone-200 via-stone-300 to-stone-400 p-3 shadow-2xl border-2 border-stone-300 group overflow-hidden"
            >
              {/* GLOSSY SCREEN REFLECTION */}
              <div className="absolute inset-0 rounded-[44px] bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-30" />

              {/* MÀN HÌNH BÊN TRONG PHÁT VIDEO THIỆP CƯỚI FULL HD */}
              <div className="w-full h-full bg-black rounded-[36px] overflow-hidden relative shadow-inner flex flex-col justify-between">
                {/* 1. THE VIDEO ELEMENT */}
                <video
                  id="hero-wedding-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-10"
                >
                  <source
                    src="https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-walking-in-a-field-41484-large.mp4"
                    type="video/mp4"
                  />
                </video>

                {/* 2. DYNAMIC ISLAND TOP BAR */}
                <div className="relative z-20 pt-3 px-6 flex items-center justify-between">
                  <div className="w-16 h-4 bg-black/90 rounded-full mx-auto shadow-md border border-white/20 flex items-center justify-end pr-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>

                {/* 3. FLOATING LUXURY VIDEO CONTROLS OVERLAY (BOTTOM) */}
                <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent space-y-2">
                  <div className="flex items-center justify-between text-white text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#BE944E] block">
                        CARDVITE VIDEO SHOWCASE
                      </span>
                      <h4 className="text-sm font-serif font-bold text-white tracking-wide">
                        {names || "Sarah & James"}
                      </h4>
                    </div>

                    {/* NÚT MUTE / UNMUTE TƯƠNG TÁC */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const videoEl = document.getElementById("hero-wedding-video") as HTMLVideoElement;
                        if (videoEl) {
                          videoEl.muted = !videoEl.muted;
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer border border-white/30"
                      title="Bật/Tắt âm thanh"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* PROGRESS BAR ANIMATION */}
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="h-full bg-[#BE944E] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* HINT CHÚ THÍCH PHÍA DƯỚI */}
            <p className="text-[10px] text-stone-400 mt-3 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#BE944E]" />
              <span>Video mẫu thiệp chuyển động sắc nét chuẩn 4K 60fps</span>
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. MỤC: MỜI ĐÍCH DANH TỪNG KHÁCH, BIẾT AI SẼ ĐẾN */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:px-12 lg:px-20 border-t border-[#EFE9E1]/60">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#181716] tracking-tight">
            {t("homeNamedTitle1")}{" "}
            <span className="italic font-normal text-[#BE944E]">
              {t("homeNamedTitleEm")}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#181716]/65 mt-3 leading-relaxed">
            {t("homeNamedSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* CỘT TRÁI: 2 THẺ FLOATING MOCKUP TƯƠNG TÁC */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* THẺ 1: LINK RIÊNG CỦA KHÁCH */}
            <motion.div
              whileHover={{ y: -4 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-xl relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-stone-400">
                <span>LINK RIÊNG CỦA KHÁCH</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <div>
                <span className="text-[11px] text-stone-500">Kính mời</span>
                <h4 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                  Ngọc Trâm & Hoàng Long
                </h4>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setGuestAttending(true)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    guestAttending === true
                      ? "bg-[#7D6331] text-white shadow-md"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tôi sẽ đến</span>
                </button>
                <button
                  onClick={() => setGuestAttending(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    guestAttending === false
                      ? "bg-stone-800 text-white shadow-md"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Bận mất rồi
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>Số người đi cùng:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGuestCompanion(Math.max(1, guestCompanion - 1))}
                    className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-stone-900">{guestCompanion}</span>
                  <button
                    onClick={() => setGuestCompanion(guestCompanion + 1)}
                    className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>

            {/* THẺ 2: NOTIFICATION & CIRCULAR PROGRESS TRACKER (STACK LỆCH NỔI BẬT) */}
            <motion.div
              whileHover={{ y: -4 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-full max-w-xs bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#EFE9E1] shadow-2xl mt-[-24px] sm:ml-20 relative z-20 space-y-3"
            >
              <div className="flex items-center gap-2 text-[10px] text-stone-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-[#BE944E]">Phương Linh</span> vừa xác nhận • 2 phút trước
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-3xl font-serif font-bold text-stone-900">86%</span>
                  <p className="text-[10px] text-stone-400">42 khách đã xác nhận</p>
                </div>

                {/* MINI STATS BADGES */}
                <div className="space-y-1 text-[9px] font-bold">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mr-1">
                    32 Có đến
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 mr-1">
                    4 Bận
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    6 Chờ trả lời
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CỘT PHẢI: 4 BULLET POINTS CHUẨN XÁC */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-5">
              {/* ITEM 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#FAF2E4] text-[#8C6424] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-[#181716]">
                    {t("homeNamedFeat1Title")}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t("homeNamedFeat1Desc")}
                  </p>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#FAF2E4] text-[#8C6424] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-[#181716]">
                    {t("homeNamedFeat2Title")}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t("homeNamedFeat2Desc")}
                  </p>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#FAF2E4] text-[#8C6424] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-[#181716]">
                    {t("homeNamedFeat3Title")}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t("homeNamedFeat3Desc")}
                  </p>
                </div>
              </div>

              {/* ITEM 4 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#FAF2E4] text-[#8C6424] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-[#181716]">
                    {t("homeNamedFeat4Title")}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t("homeNamedFeat4Desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. MỤC: HỖ TRỢ ĐA NGÔN NGỮ (BILINGUAL & 3D GLOBE) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:px-12 lg:px-20 relative overflow-hidden">
        {/* CONTINUOUS ROTATING 3D WIREFRAME GLOBE ANIMATION */}
        <div className="absolute right-[-140px] sm:right-[-80px] top-1/2 -translate-y-1/2 w-[480px] sm:w-[600px] h-[480px] sm:h-[600px] pointer-events-none z-0 flex items-center justify-center opacity-25 overflow-visible">
          {/* LỚP 1: VÒNG TRÒN CHÍNH XOAY THUẬN CHIỀU KIM ĐỒNG HỒ */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full stroke-[#BE944E] fill-none">
              {/* Vành ngoài */}
              <circle cx="100" cy="100" r="95" strokeWidth="0.75" strokeDasharray="4 2" />
              <circle cx="100" cy="100" r="90" strokeWidth="1" opacity="0.6" />

              {/* Các đường kinh tuyến dọc */}
              <ellipse cx="100" cy="100" rx="90" ry="38" strokeWidth="0.8" opacity="0.8" />
              <ellipse cx="100" cy="100" rx="90" ry="68" strokeWidth="0.6" opacity="0.6" />
              <ellipse cx="100" cy="100" rx="38" ry="90" strokeWidth="0.8" opacity="0.8" />
              <ellipse cx="100" cy="100" rx="68" ry="90" strokeWidth="0.6" opacity="0.6" />

              {/* Đường xích đạo ngang & trục dọc */}
              <line x1="10" y1="100" x2="190" y2="100" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="100" y1="10" x2="100" y2="190" strokeWidth="0.8" strokeDasharray="3 3" />
            </svg>
          </motion.div>

          {/* LỚP 2: VÒNG KINH TUYẾN NGHIÊNG XOAY NGƯỢC CHIỀU KIM ĐỒNG HỒ */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 flex items-center justify-center rotate-45"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full stroke-stone-700 fill-none">
              <ellipse cx="100" cy="100" rx="85" ry="40" strokeWidth="0.75" strokeDasharray="6 3" opacity="0.7" />
              <ellipse cx="100" cy="100" rx="40" ry="85" strokeWidth="0.75" opacity="0.5" />

              {/* Vệ tinh phát sáng bay quanh quỹ đạo */}
              <motion.circle
                animate={{ cx: [100, 185, 100, 15, 100], cy: [60, 100, 140, 100, 60] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                r="3"
                fill="#BE944E"
              />
              <motion.circle
                animate={{ cx: [15, 100, 185, 100, 15], cy: [100, 60, 100, 140, 100] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                r="2.5"
                fill="#7D6331"
              />
            </svg>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* CỘT TRÁI: THIỆP MẪU SONG NGỮ THAY ĐỔI THEO NÚT BẤM */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              key={activeLangTag}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -6 }}
              className="w-64 sm:w-72 bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xl text-center space-y-4"
            >
              <div className="w-8 h-px bg-[#BE944E] mx-auto mb-2" />

              <div>
                <h4 className="text-xl font-serif font-bold text-stone-900">
                  {BILINGUAL_SAMPLES[activeLangTag]?.groom || "Chú Rể"}
                </h4>
                <span className="text-[10px] uppercase tracking-widest text-[#BE944E] font-semibold block mt-0.5">
                  Chú Rể
                </span>
              </div>

              <div className="text-stone-300 text-xs">♥</div>

              <div>
                <h4 className="text-xl font-serif font-bold text-stone-900">
                  {BILINGUAL_SAMPLES[activeLangTag]?.bride || "Cô Dâu"}
                </h4>
                <span className="text-[10px] uppercase tracking-widest text-[#BE944E] font-semibold block mt-0.5">
                  Cô Dâu
                </span>
              </div>

              <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-600 leading-relaxed font-serif">
                {BILINGUAL_SAMPLES[activeLangTag]?.invite} <br />
                <span className="text-[9px] text-stone-400 font-sans block mt-1">
                  Trân trọng kính mời
                </span>
              </div>
            </motion.div>
          </div>

          {/* CỘT PHẢI: TIÊU ĐỀ, CHECKMARKS & BẢNG NÚT NGÔN NGỮ */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#181716] tracking-tight">
                {t("homeBilingualTitle1")}{" "}
                <span className="italic font-normal text-[#BE944E]">
                  {t("homeBilingualTitleEm")}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#181716]/65 mt-3 leading-relaxed max-w-lg">
                {t("homeBilingualSub")}
              </p>
            </div>

            {/* 4 CHECKMARKS */}
            <div className="space-y-2.5 text-xs text-stone-700 font-medium">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#BE944E] shrink-0" />
                <span>{t("homeBilingualFeat1")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#BE944E] shrink-0" />
                <span>{t("homeBilingualFeat2")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#BE944E] shrink-0" />
                <span>{t("homeBilingualFeat3")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#BE944E] shrink-0" />
                <span>{t("homeBilingualFeat4")}</span>
              </div>
            </div>

            {/* 8 NÚT CHỌN NGÔN NGỮ TƯƠNG TÁC */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "Tiếng Việt",
                "English",
                "简体中文",
                "한국어",
                "Español",
                "Français",
                "Русский",
                "Deutsch",
              ].map((lang) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={lang}
                  type="button"
                  onClick={() => setActiveLangTag(lang)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                    activeLangTag === lang
                      ? "bg-[#7D6331] text-white border-[#7D6331] shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {lang}
                </motion.button>
              ))}
            </div>

            {/* CTA BUTTON */}
            <div className="pt-2">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                <Link
                  href="/dashboard/cards/new"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#7D6331] hover:bg-[#685226] text-white text-xs font-bold uppercase tracking-widest shadow-md transition"
                >
                  <span>{t("homeBilingualBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. MỤC: CẢM HỨNG TỪ NHỮNG CẶP ĐÔI (STORIES & TESTIMONIALS) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:px-12 lg:px-20 border-t border-[#EFE9E1]/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#181716] tracking-tight">
            {t("homeCouplesTitle1")}{" "}
            <span className="italic font-normal text-[#BE944E]">
              {t("homeCouplesTitleEm")}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#181716]/65 mt-3">
            {t("homeCouplesSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COUPLES_STORIES.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-2xs hover:shadow-xl transition flex flex-col justify-between group"
            >
              <div>
                {/* PHOTO */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.photo}
                    alt={story.couple}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[9px] font-bold uppercase text-stone-700 shadow-2xs">
                    {story.date}
                  </div>
                </div>

                {/* RATING STARS */}
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(story.stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                {/* QUOTE */}
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              {/* AUTHOR */}
              <div className="mt-4 pt-3 border-t border-stone-100">
                <h4 className="text-sm font-serif font-bold text-stone-900">
                  {story.couple}
                </h4>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {story.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. SECTION: AUDIO EQUALIZER & MUSIC STUDIO */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:px-12 lg:px-20">
        <div className="bg-[#242322] rounded-[36px] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#BE944E]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* CỘT TRÁI: ĐĨA VINYL XOAY 360 & SÓNG ÂM EQUALIZER */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-stone-900 via-stone-800 to-black p-2 border-2 border-stone-700 shadow-2xl flex items-center justify-center relative shrink-0"
              >
                <div className="w-full h-full rounded-full border border-stone-600/50 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#BE944E] flex items-center justify-center shadow-inner">
                    <Disc className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#BE944E] font-bold block">
                  {t("homeMusicNowPlaying")}
                </span>
                <h4 className="text-lg font-serif font-bold text-white tracking-wide">
                  {activeTrack.title}
                </h4>
                <p className="text-xs text-stone-400">{activeTrack.artist} • {activeTrack.duration}</p>

                {/* SÓNG ÂM EQUALIZER ANIMATION (10 BARS) */}
                <div className="flex items-end gap-1 h-7 pt-2 justify-center sm:justify-start">
                  {[12, 24, 16, 28, 20, 14, 26, 18, 22, 12].map((height, i) => (
                    <motion.span
                      key={i}
                      animate={isPlaying ? { height: [height * 0.4, height, height * 0.3] } : { height: 4 }}
                      transition={{ duration: 0.6 + (i % 3) * 0.2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-1 rounded-full bg-[#BE944E]"
                      style={{ minHeight: "4px" }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: BỘ CHỌN DANH SÁCH BÀI HÁT */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    {t("homeMusicTitle")}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    {t("homeMusicSub")}
                  </p>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label="Toggle playback"
                  className="w-12 h-12 rounded-full bg-[#BE944E] hover:bg-[#a67e3a] text-white flex items-center justify-center shadow-lg transition hover:scale-105 shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>

              {/* TRACKS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {TRACKS.map((track) => (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTrack(track);
                      setIsPlaying(true);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      activeTrack.id === track.id
                        ? "bg-white/15 border-[#BE944E] text-white shadow-md ring-1 ring-[#BE944E]"
                        : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Music className="w-4 h-4 text-[#BE944E] shrink-0" />
                      <div>
                        <span className="text-xs font-semibold block">{track.title}</span>
                        <span className="text-[10px] text-stone-400">{track.artist}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400">{track.duration}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. SECTION: 3D WAX SEAL STUDIO INTERACTIVE */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20 text-center">
        <div className="max-w-2xl mx-auto mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FAF2E4] text-[#8C6424] text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#E8DBD0]">
            INTERACTIVE 3D STUDIO
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
            {t("homeWaxStudioTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-[#181716]/65 mt-2">
            {t("homeWaxStudioSub")}
          </p>
        </div>

        {/* WORKSHOP DESK */}
        <div className="max-w-3xl mx-auto bg-white rounded-[36px] p-8 sm:p-12 border border-[#EFE9E1] shadow-xl flex flex-col items-center">
          {/* COLOR SWATCHES */}
          <div className="flex items-center gap-4 mb-8">
            {[
              { id: "gold", name: t("homeWaxColorGold"), bg: "bg-[#C19A5B]", border: "border-[#8C6424]" },
              { id: "wine", name: t("homeWaxColorWine"), bg: "bg-[#7A1F2D]", border: "border-[#520B16]" },
              { id: "emerald", name: t("homeWaxColorEmerald"), bg: "bg-[#2D4530]", border: "border-[#1E2E20]" },
              { id: "rose", name: t("homeWaxColorRose"), bg: "bg-[#D98A8A]", border: "border-[#A65B5B]" },
            ].map((col) => (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                key={col.id}
                onClick={() => setWaxColor(col.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                  waxColor === col.id
                    ? "bg-[#FAF7F2] border-stone-800 text-stone-900 shadow-sm"
                    : "bg-white border-stone-200 text-stone-500 hover:text-stone-800"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${col.bg} border ${col.border}`} />
                <span className="text-[11px]">{col.name}</span>
              </motion.button>
            ))}
          </div>

          {/* 3D ENVELOPE WITH STAMP ACTION */}
          <div className="relative w-72 sm:w-80 aspect-[16/11] bg-[#F2ECE4] rounded-2xl p-4 shadow-lg border border-[#E0D8CE] flex flex-col justify-center items-center overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1/2 border-b border-stone-300/80 bg-gradient-to-b from-[#EAE2D8] to-[#DFD6CB] clip-path-triangle opacity-90" />

            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-serif mb-4 z-10">
              INVITATION TO CELEBRATE
            </span>

            {/* THE WAX SEAL BUTTON */}
            <motion.button
              onClick={handleStampWax}
              animate={isStamping ? { scale: [1, 0.82, 1.15, 1], rotate: [0, -6, 6, 0] } : { scale: 1 }}
              transition={{ duration: 0.45 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className={`z-20 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-2 transition-colors ${
                waxColor === "gold"
                  ? "bg-gradient-to-tr from-[#94702D] via-[#C19A5B] to-[#E5C384] border-[#7D5A1A] text-amber-950"
                  : waxColor === "wine"
                  ? "bg-gradient-to-tr from-[#520B16] via-[#7A1F2D] to-[#A33D4D] border-[#3B060E] text-rose-100"
                  : waxColor === "emerald"
                  ? "bg-gradient-to-tr from-[#172619] via-[#2D4530] to-[#476B4B] border-[#0E1A10] text-emerald-100"
                  : "bg-gradient-to-tr from-[#8E4444] via-[#D98A8A] to-[#F2B6B6] border-[#692C2C] text-pink-950"
              }`}
            >
              <Stamp className="w-7 h-7 stroke-[1.75]" />
            </motion.button>

            <span className="text-[10px] text-stone-400 mt-4 z-10 font-medium">
              {t("homeWaxTapPrompt")}
            </span>
          </div>

          <div className="mt-6 text-xs text-stone-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#BE944E]" />
            <span>Đã có <strong>{stampedCount}</strong> bức thiệp được niêm phong sáp hôm nay</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. 3D COVERFLOW CAROUSEL (MẪU THIỆP ĐẸP NHẤT) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
            {t("homeCarouselTitle1")}{" "}
            <span className="italic font-normal text-[#BE944E]">
              {t("homeCarouselTitleEm")}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#181716]/65 mt-2">
            {t("homeCarouselSub")}
          </p>
        </motion.div>

        {/* 3D COVERFLOW CONTAINER */}
        <div className="relative py-6 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
          {/* NÚT PREV */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            aria-label="Previous Template"
            className="absolute left-2 sm:left-6 z-30 w-11 h-11 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-700 hover:text-[#BE944E] transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* 5 CARDS IN 3D PERSPECTIVE */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full">
            {CAROUSEL_CARDS.map((card, idx) => {
              const offset = (idx - carouselIndex + CAROUSEL_CARDS.length) % CAROUSEL_CARDS.length;
              const isCenter = offset === 0;
              const isLeft1 = offset === CAROUSEL_CARDS.length - 1;
              const isRight1 = offset === 1;
              const isHidden = !isCenter && !isLeft1 && !isRight1;

              return (
                <motion.div
                  key={card.id}
                  layout
                  onClick={() => setCarouselIndex(idx)}
                  whileHover={{ y: isCenter ? -6 : -2 }}
                  className={`transition-all duration-500 transform cursor-pointer rounded-3xl overflow-hidden border shadow-md flex flex-col justify-between ${
                    isHidden
                      ? "hidden md:block opacity-20 scale-75 blur-[2px] pointer-events-none"
                      : isCenter
                      ? "z-20 scale-105 sm:scale-110 shadow-2xl border-[#BE944E] w-56 sm:w-64 aspect-[9/16] bg-white ring-4 ring-[#BE944E]/25"
                      : isLeft1
                      ? "z-10 opacity-70 scale-90 -rotate-y-12 w-44 sm:w-52 aspect-[9/16] bg-white/80 border-stone-200"
                      : "z-10 opacity-70 scale-90 rotate-y-12 w-44 sm:w-52 aspect-[9/16] bg-white/80 border-stone-200"
                  }`}
                >
                  <div className="relative w-full h-full p-4 flex flex-col justify-between text-center overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-90 transition duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    <div className="relative z-10 text-[9px] uppercase tracking-widest text-white/90 font-medium">
                      THE WEDDING OF
                    </div>

                    <div className="relative z-10 space-y-1 text-white">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-xs text-[8px] uppercase tracking-wider text-white mb-1">
                        {card.tag}
                      </span>
                      <h4 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                        {card.title}
                      </h4>
                      <p className="text-[10px] text-white/80">{card.couple}</p>
                      {isCenter && (
                        <div className="pt-2">
                          <Link
                            href="/collections"
                            className="inline-block px-3.5 py-1 rounded-full bg-[#BE944E] hover:bg-[#a67e3a] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm transition"
                          >
                            XEM MẪU NÀY
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* NÚT NEXT */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            aria-label="Next Template"
            className="absolute right-2 sm:right-6 z-30 w-11 h-11 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-700 hover:text-[#BE944E] transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* DOTS PAGINATION */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {CAROUSEL_CARDS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                carouselIndex === idx ? "w-7 bg-[#BE944E]" : "w-2 bg-stone-300"
              }`}
            />
          ))}
        </div>

        {/* NÚT XEM TẤT CẢ MẪU THIỆP */}
        <div className="mt-8">
          <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition"
            >
              <span>{t("homeViewAllTemplates")}</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. SECTION: BỨC TƯỜNG LỜI CHÚC FLOATING WISHES */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
            {t("homeWishesTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-[#181716]/65 mt-2">
            {t("homeWishesSub")}
          </p>
        </div>

        {/* DẢI LỜI CHÚC TRÔI DẠNG MARQUEE 1 */}
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {wishesList.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-white rounded-2xl p-4 border border-[#EFE9E1] shadow-2xs shrink-0 w-72 sm:w-80 flex flex-col justify-between"
              >
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  &ldquo;{item.wish}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-[10px]">
                  <span className="font-bold text-[#BE944E]">{item.name} • {item.relation}</span>
                  <span className="text-stone-400">{item.time}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* DẢI LỜI CHÚC TRÔI DẠNG MARQUEE 2 */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {SAMPLE_WISHES_2.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-white rounded-2xl p-4 border border-[#EFE9E1] shadow-2xs shrink-0 w-72 sm:w-80 flex flex-col justify-between"
              >
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  &ldquo;{item.wish}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100 text-[10px]">
                  <span className="font-bold text-[#BE944E]">{item.name} • {item.relation}</span>
                  <span className="text-stone-400">{item.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FORM THỬ GỬI LỜI CHÚC */}
        <div className="max-w-xl mx-auto mt-8">
          <form onSubmit={handleSendTrialWish} className="flex gap-2">
            <input
              type="text"
              value={userWish}
              onChange={(e) => setUserWish(e.target.value)}
              placeholder={t("homeWishInputPlaceholder")}
              className="flex-1 px-4 py-3 text-xs rounded-xl bg-white border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-800 shadow-2xs"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-5 py-3 rounded-xl bg-[#BE944E] hover:bg-[#a67e3a] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{t("homeSendWishBtn")}</span>
            </motion.button>
          </form>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. SECTION: VIETQR BOX MỪNG CƯỚI SIMULATOR */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20">
        <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F0EAE1] rounded-[36px] p-8 sm:p-12 border border-[#EFE9E1] shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* CỘT TRÁI: THÔNG TIN & CHỌN MỨC TIỀN */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-[#E8ECE5] text-[#556353] text-[10px] font-bold uppercase tracking-widest">
              VIETQR NAPAS247 INTEGRATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
              {t("homeQrTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-[#181716]/65 leading-relaxed">
              {t("homeQrSub")}
            </p>

            {/* CHỌN SỐ TIỀN */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-600 block">
                {t("homeQrSelectAmount")}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {["200.000đ", "500.000đ", "1.000.000đ", "2.000.000đ"].map((amt) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={amt}
                    type="button"
                    onClick={() => {
                      setQrAmount(amt);
                      setQrSuccess(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      qrAmount === amt
                        ? "bg-[#7D6331] text-white border-[#7D6331] shadow-md"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {amt}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSimulatePayment}
                className="px-7 py-3.5 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#BE944E]" />
                <span>MÔ PHỎNG QUÉT MÃ MỪNG CƯỚI</span>
              </motion.button>
            </div>

            {qrSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t("homeQrSuccessToast")}</span>
              </motion.div>
            )}
          </div>

          {/* CỘT PHẢI: THẺ QR BANKING NỔI BẬT */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              whileHover={{ y: -6 }}
              className="w-64 sm:w-72 bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-xl text-center space-y-3"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#BE944E] block">
                MỪNG CƯỚI TÂN LANG & TÂN NƯƠNG
              </span>
              <div className="w-36 h-36 mx-auto bg-stone-100 rounded-2xl p-2.5 border border-stone-200 flex items-center justify-center relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CardVite-Wedding-Gift-${qrAmount}`}
                  alt="VietQR Demo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs">
                <span className="font-bold text-stone-900 text-base">{qrAmount}</span>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {t("homeQrScanHint")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. SECTION: 3 BƯỚC TẠO THIỆP (INTERACTIVE STEPS) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* CỘT TRÁI: 3 BƯỚC CÓ THỂ CLICK CHUYỂN TRẠNG THÁI */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#181716] tracking-tight leading-tight">
              {t("homeStepsTitle1")} <br />
              <span className="italic font-normal text-[#BE944E]">
                {t("homeStepsTitleEm")}
              </span>
            </h2>

            {/* 3 STEPS INTERACTIVE TABS */}
            <div className="space-y-4 max-w-lg">
              {/* STEP 1 */}
              <motion.div
                onClick={() => setActiveStep(1)}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  activeStep === 1
                    ? "bg-white border-[#BE944E] shadow-md ring-2 ring-[#BE944E]/20"
                    : "bg-white/50 border-[#EFE9E1] hover:bg-white"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                    activeStep === 1
                      ? "bg-[#BE944E] text-white border-[#BE944E]"
                      : "bg-[#FAF2E4] text-[#8C6424] border-[#E8DBD0]"
                  }`}
                >
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-[#181716] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{t("homeStep1Title")}</span>
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t("homeStep1Desc")}
                  </p>
                </div>
              </motion.div>

              {/* STEP 2 */}
              <motion.div
                onClick={() => setActiveStep(2)}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  activeStep === 2
                    ? "bg-white border-[#BE944E] shadow-md ring-2 ring-[#BE944E]/20"
                    : "bg-white/50 border-[#EFE9E1] hover:bg-white"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                    activeStep === 2
                      ? "bg-[#BE944E] text-white border-[#BE944E]"
                      : "bg-[#FAF2E4] text-[#8C6424] border-[#E8DBD0]"
                  }`}
                >
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-[#181716] flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{t("homeStep2Title")}</span>
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t("homeStep2Desc")}
                  </p>
                </div>
              </motion.div>

              {/* STEP 3 */}
              <motion.div
                onClick={() => setActiveStep(3)}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  activeStep === 3
                    ? "bg-white border-[#BE944E] shadow-md ring-2 ring-[#BE944E]/20"
                    : "bg-white/50 border-[#EFE9E1] hover:bg-white"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                    activeStep === 3
                      ? "bg-[#BE944E] text-white border-[#BE944E]"
                      : "bg-[#FAF2E4] text-[#8C6424] border-[#E8DBD0]"
                  }`}
                >
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-[#181716] flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{t("homeStep3Title")}</span>
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t("homeStep3Desc")}
                  </p>
                </div>
              </motion.div>
            </div>

            <div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link
                  href="/dashboard/cards/new"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#7D6331] hover:bg-[#685226] text-white text-xs font-bold uppercase tracking-widest shadow-md transition"
                >
                  <span>{t("homeStepsBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* CỘT PHẢI: PHONE MOCKUP ĐỔI GIAO DIỆN THEO BƯỚC ĐANG CHỌN */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-64 sm:w-72 aspect-[9/18.5] rounded-[42px] bg-[#1E2E20] p-3 shadow-2xl border-4 border-[#2D4530]"
            >
              <div className="w-full h-full bg-[#243627] rounded-[34px] overflow-hidden flex flex-col justify-between p-6 text-center text-white relative shadow-inner">
                {/* Dynamic island bar */}
                <div className="w-16 h-3.5 bg-[#142016] rounded-full mx-auto mb-4" />

                {activeStep === 1 && (
                  <div className="my-auto space-y-4">
                    <span className="text-[10px] text-emerald-300 uppercase tracking-widest">
                      BƯỚC 1: CHỌN MẪU
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-700/60 mx-auto flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-emerald-200" />
                    </div>
                    <h4 className="text-lg font-serif font-bold text-white">
                      Floral Emerald
                    </h4>
                    <p className="text-[10px] text-emerald-100/70">
                      Tông xanh rêu hoàng gia sang trọng
                    </p>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="my-auto space-y-3">
                    <span className="text-[10px] text-emerald-300 uppercase tracking-widest">
                      BƯỚC 2: ĐIỀN THÔNG TIN
                    </span>
                    <div className="space-y-1">
                      <span className="text-sm font-serif tracking-widest text-emerald-200 block">
                        THU HÀ
                      </span>
                      <span className="text-[10px] text-white/60 block">&</span>
                      <span className="text-sm font-serif tracking-widest text-emerald-200 block">
                        MINH QUÂN
                      </span>
                    </div>
                    <div className="text-[10px] text-white/70 pt-1 tracking-wider">
                      20 . 10 . 2026 • GEM Center
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="my-auto space-y-3">
                    <span className="text-[10px] text-emerald-300 uppercase tracking-widest">
                      BƯỚC 3: GỬI THIỆP ĐÍCH DANH
                    </span>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/30 text-emerald-300 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-emerald-100/90 leading-relaxed">
                      Link riêng cho từng khách: <br />
                      <code className="text-[9px] bg-black/40 px-2 py-0.5 rounded text-amber-200">
                        cardvite.vn/thiep/g-8a9x
                      </code>
                    </p>
                    <div className="pt-2">
                      <span className="inline-block px-5 py-1.5 rounded-full bg-[#4E7252] text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        MỞ THIỆP
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-[8px] uppercase tracking-widest text-white/40 pb-1">
                  CardVite Realtime Demo
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 12. SECTION: TRẢI NGHIỆM THƯỢNG LƯU SỐ (BENTO GRID CÓ HOVER) */}
      {/* ------------------------------------------------------------- */}
      <section id="custom" className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
            {t("homeSectionExperienceTitle")}{" "}
            <span className="italic font-normal text-[#BE944E]">
              {t("homeSectionExperienceEm")}
            </span>{" "}
            {t("homeSectionExperienceSuffix")}
          </h2>
          <p className="text-xs text-[#181716]/65 mt-2">
            {t("homeSectionExperienceSub")}
          </p>
        </motion.div>

        {/* BENTO GRID EXACT 3 TIERS VỚI MOTION HOVER */}
        <div className="space-y-5">
          {/* HÀNG 1: THIỆP GỬI ĐÍCH DANH (LEFT 60%) + 2 THẺ CỘT PHẢI STACK (RIGHT 40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* THẺ LỚN TRÁI: THIỆP GỬI ĐÍCH DANH */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xs relative overflow-hidden flex flex-col justify-end min-h-[340px] group hover:shadow-xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="relative z-10 text-white">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {t("homeCard1Title")}
                </h3>
                <p className="text-xs text-white/80 mt-1.5 max-w-md leading-relaxed">
                  {t("homeCard1Desc")}
                </p>
              </div>
            </motion.div>

            {/* CỘT PHẢI: 2 THẺ STACK NHỎ */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* THẺ 1: QUẢN LÝ RSVP */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="flex-1 bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-2xs flex flex-col justify-center hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-[#5C7658]/10 text-[#5C7658] flex items-center justify-center mb-3">
                  <CalendarCheck2 className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard2Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard2Desc")}
                </p>
              </motion.div>

              {/* THẺ 2: HỘP MỪNG CƯỚI VIETQR */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="flex-1 bg-white rounded-3xl p-6 border border-[#EFE9E1] shadow-2xs flex flex-col justify-center hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-[#BE944E]/15 text-[#BE944E] flex items-center justify-center mb-3">
                  <Gift className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard3Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard3Desc")}
                </p>
              </motion.div>
            </div>
          </div>

          {/* HÀNG 2: 2 THẺ BẰNG NHAU (50% - 50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* THẺ 3: MINI-GAME TƯƠNG TÁC */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between hover:shadow-md"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#E08269]/15 text-[#E08269] flex items-center justify-center mb-3">
                  <Gamepad2 className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard4Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard4Desc")}
                </p>
              </div>
            </motion.div>

            {/* THẺ 4: ALBUM ẢNH 3D & NHẠC */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between hover:shadow-md"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#BE944E]/15 text-[#BE944E] flex items-center justify-center mb-3">
                  <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#181716]">
                  {t("homeCard5Title")}
                </h3>
                <p className="text-xs text-[#181716]/65 mt-1 leading-relaxed">
                  {t("homeCard5Desc")}
                </p>
              </div>
            </motion.div>
          </div>

          {/* HÀNG 3: THẺ ĐA NGÔN NGỮ TOÀN CẦU TRÀN HÀNG + VÒNG CUNG QUỸ ĐẠO THIÊN HÀ */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative"
          >
            <div className="max-w-lg z-10">
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
                <Globe2 className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#181716]">
                {t("homeCard6Title")}
              </h3>
              <p className="text-xs text-[#181716]/65 mt-1.5 leading-relaxed">
                {t("homeCard6Desc")}
              </p>
            </div>

            {/* SƠ ĐỒ VÒNG CUNG QUỸ ĐẠO THIÊN HÀ CÓ CHUYỂN ĐỘNG XOAY */}
            <div className="relative w-44 h-28 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 160 100" className="w-full h-full">
                <path
                  d="M 10 90 A 70 70 0 0 1 150 90"
                  fill="none"
                  stroke="#BE944E"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <motion.circle
                  animate={{ cx: [105, 145, 105], cy: [22, 62, 22] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  r="4.5"
                  fill="#BE944E"
                />
                <circle cx="145" cy="62" r="3.5" fill="#8C6424" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 13. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#EFE9E1] bg-white py-10 px-6 md:px-12 lg:px-20 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#181716]/65">
          <div className="flex items-center">
            <span className="text-2xl font-serif font-bold text-[#181716]">
              CardVite
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="#" className="hover:text-[#181716]">{t("footerPrivacy")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerTerms")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerSustainability")}</Link>
            <Link href="#" className="hover:text-[#181716]">{t("footerAccessibility")}</Link>
          </div>

          <div>
            <span>{t("footerCopyright")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
