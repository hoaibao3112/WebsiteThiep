"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  ArrowUp,
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
  SlidersHorizontal,
  MapPin,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Mail,
  ShieldCheck,
  Users,
  Store,
  Clock,
  Award,
  XCircle,
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Headphones,
  Smartphone,
  Palette,
  Gem,
  Eye,
  BookOpen,
  Tag,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { Footer } from "@/components/shared/Footer";
import { useAuth } from "@/context/AuthContext";
import { TemplateDetailModal, TemplateModalData } from "@/components/shared/TemplateDetailModal";
import { MASTER_TEMPLATES, MasterTemplateItem } from "@/lib/templates-data";

const TRACKS = [
  { id: 1, title: "Until I Found You", artist: "Stephen Sanchez", duration: "2:57" },
  { id: 2, title: "I Do", artist: "911 Band", duration: "3:24" },
  { id: 3, title: "A Thousand Years", artist: "Christina Perri", duration: "4:45" },
  { id: 4, title: "Perfect", artist: "Ed Sheeran", duration: "4:23" },
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

const WEDDING_TRACKS = [
  {
    id: 1,
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    duration: "2:57",
    cover: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&auto=format&fit=crop",
    audioSrc: "/music/until-i-found-you.mp3",
  },
  {
    id: 2,
    title: "I Do",
    artist: "911 Band",
    duration: "3:24",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop",
    audioSrc: "/music/i-do.mp3",
  },
  {
    id: 3,
    title: "A Thousand Years",
    artist: "Christina Perri",
    duration: "4:45",
    cover: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&auto=format&fit=crop",
    audioSrc: "/music/a-thousand-years.mp3",
  },
  {
    id: 4,
    title: "Perfect",
    artist: "Ed Sheeran",
    duration: "4:23",
    cover: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&auto=format&fit=crop",
    audioSrc: "/music/perfect.mp3",
  },
];

function AuthQueryHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();

  // Tự động mở modal đăng nhập nếu có query ?auth=login VÀ người dùng chưa đăng nhập
  useEffect(() => {
    if (searchParams.get("auth") === "login") {
      if (!user) {
        openAuthModal("login");
      } else {
        const redirectPath = searchParams.get("redirect") || "/dashboard/cards";
        router.push(redirectPath);
      }
    }
  }, [searchParams, openAuthModal, user, router]);

  return null;
}

export default function CardViteHomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedModalTemplate, setSelectedModalTemplate] = useState<TemplateModalData | null>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<"ALL" | "WEDDING" | "BIRTHDAY" | "NEWBORN">("ALL");

  // Khóa cuộn trang khi menu mobile mở để tránh giật lag
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleCreateCardClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (user) {
      router.push("/dashboard/cards/new");
    } else {
      openAuthModal("login");
    }
  };

  const displayedTemplates = MASTER_TEMPLATES.filter((tpl) => {
    if (activeTemplateTab === "ALL") return true;
    return tpl.category === activeTemplateTab;
  });

  const SAMPLE_WISHES_1 = [
    { name: "Lan Anh", relation: t("relationCollegeFriend") || "Bạn Đại Học", wish: t("wish1Text") || "Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long! ❤️", time: t("wish1Time") || "2 phút trước" },
    { name: "Hoàng Minh", relation: t("relationColleague") || "Đồng Nghiệp", wish: t("wish2Text") || "Mãi mãi ngọt ngào và thấu hiểu nhau như ngày đầu nhé! ✨", time: t("wish2Time") || "5 phút trước" },
    { name: "Bác Sáu", relation: t("relationFamily") || "Gia Đình", wish: t("wish3Text") || "Chúc hai cháu xây dựng tổ ấm viên mãn, phát tài phát lộc!", time: t("wish3Time") || "12 phút trước" },
    { name: "Jessica Nguyen", relation: t("relationBestFriend") || "Best Friend", wish: t("wish4Text") || "Wishing you both a lifetime of unconditional love & joy! 🥂", time: t("wish4Time") || "15 phút trước" },
  ];

  const SAMPLE_WISHES_2 = [
    { name: "Đức Trọng", relation: t("relationGroomFriend") || "Bạn Thân Chú Rể", wish: t("wish5Text") || "Cuối cùng anh bạn thân cũng có người rước! Mừng cho 2 đứa! 🎉", time: t("wish5Time") || "18 phút trước" },
    { name: "Phương Thảo", relation: t("relationSister") || "Em Gái", wish: t("wish6Text") || "Chị gái xinh đẹp nhất của em hôm nay rạng rỡ quá chừng! 💖", time: t("wish6Time") || "25 phút trước" },
    { name: "Quốc Bảo", relation: t("relationCousin") || "Anh Họ", wish: t("wish7Text") || "Chúc mừng tân lang tân nương, sớm sinh quý tử nhé!", time: t("wish7Time") || "30 phút trước" },
    { name: "David Chen", relation: t("relationColleague") || "Colleague", wish: t("wish8Text") || "Congratulations! Best wishes on your wonderful journey ahead! 🌟", time: t("wish8Time") || "42 phút trước" },
  ];

  const COUPLES_STORIES = [
    {
      id: 1,
      couple: t("story1Couple") || "Hoàng Nam & Thảo Vy",
      location: t("story1Location") || "GEM Center, TP. Hồ Chí Minh",
      date: t("story1Date") || "THÁNG 12, 2024",
      photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
      quote: t("story1Quote") || "Khách mời ai cũng bất ngờ khi nhận thiệp có đúng tên mình. Tính năng RSVP giúp tụi mình chốt bàn tiệc với nhà hàng chỉ trong 1 nốt nhạc!",
      stars: 5,
    },
    {
      id: 2,
      couple: t("story2Couple") || "Minh Quân & Thu Hà",
      location: t("story2Location") || "JW Marriott Hotel, Hà Nội",
      date: t("story2Date") || "THÁNG 10, 2024",
      photo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
      quote: t("story2Quote") || "Hiệu ứng mở con dấu sáp 3D và nhạc nền du dương khiến tấm thiệp sang trọng vượt ngoài mong đợi. Bạn bè quốc tế xem bản song ngữ khen nức nở!",
      stars: 5,
    },
    {
      id: 3,
      couple: t("story3Couple") || "Tuấn Anh & Mai Phương",
      location: t("story3Location") || "InterContinental Danang Sun Peninsula",
      date: t("story3Date") || "THÁNG 11, 2024",
      photo: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop",
      quote: t("story3Quote") || "Hộp mừng cưới VietQR cực kỳ tiện lợi cho các bạn ở xa không về kịp. Hệ thống thống kê RSVP tự động xuất file Excel siêu chuyên nghiệp.",
      stars: 5,
    },
  ];

  const MAIN_HERO_COUPLE = {
    id: "hero-couple",
    title: t("heroCoupleTitle") || "Khoảnh Khắc Trao Lời Thề Nguyện",
    subtitle: t("heroCoupleSubtitle") || "Sarah & James • Hôn lễ lãng mạn bên bờ biển",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop",
    badgeLabel: t("heroCoupleBadge") || "👰🤵 Cặp Đôi",
    type: "photo" as const,
  };

  const ORBIT_ITEMS = [
    {
      id: "rings",
      title: t("orbitRingsTitle") || "Nhẫn Cưới Kim Cương",
      subtitle: t("orbitRingsSubtitle") || "Biểu tượng gắn kết tình yêu vĩnh cửu",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop",
      preview: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&auto=format&fit=crop",
      type: "photo" as const,
      badgeLabel: t("orbitRingsBadge") || "💍 Nhẫn Cưới",
    },
    {
      id: "banquet",
      title: t("orbitBanquetTitle") || "Không Gian Tiệc Cưới Hoàng Gia",
      subtitle: t("orbitBanquetSubtitle") || "Ánh nến lung linh & dạ tiệc sang trọng ấm cúng",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop",
      preview: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&auto=format&fit=crop",
      type: "photo" as const,
      badgeLabel: t("orbitBanquetBadge") || "🍽️ Dạ Tiệc",
    },
    {
      id: "bouquet",
      title: t("orbitBouquetTitle") || "Hoa Cầm Tay Cô Dâu",
      subtitle: t("orbitBouquetSubtitle") || "Bó hoa mẫu đơn & hồng Ecuador tinh khôi",
      image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&auto=format&fit=crop",
      preview: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300&auto=format&fit=crop",
      type: "photo" as const,
      badgeLabel: t("orbitBouquetBadge") || "💐 Hoa Cưới",
    },
    {
      id: "seal",
      title: t("orbitSealTitle") || "Dấu Sáp Hoàng Gia 3D",
      subtitle: t("orbitSealSubtitle") || "Khắc con dấu trái tim tình yêu độc bản mạ vàng",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
      type: "seal" as const,
      badgeLabel: t("orbitSealBadge") || "💛 Dấu Sáp",
    },
  ];

  const SHOWCASE_ITEMS = [
    MAIN_HERO_COUPLE,
    ...ORBIT_ITEMS,
  ];

  // Bộ điều khiển Simulator Hero
  const [names, setNames] = useState("Sarah & James");
  const [selectedEffect, setSelectedEffect] = useState<"Wax Seal" | "Flower Gate" | "Gift Box">("Wax Seal");
  const [selectedHeroTemplate, setSelectedHeroTemplate] = useState<"vuon-ngoc" | "hoa-lua" | "co-dien">("vuon-ngoc");
  const [sealOpened, setSealOpened] = useState(false);
  const [isHeroMusicPlaying, setIsHeroMusicPlaying] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const heroAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleHeroSeal = () => {
    if (heroAudioRef.current) {
      if (isHeroMusicPlaying) {
        heroAudioRef.current.pause();
        setIsHeroMusicPlaying(false);
        setShowHeartAnimation(false);
      } else {
        heroAudioRef.current.currentTime = 0;
        heroAudioRef.current.play().catch(() => {});
        setIsHeroMusicPlaying(true);
        setShowHeartAnimation(true);
      }
    } else {
      setIsHeroMusicPlaying(!isHeroMusicPlaying);
      setShowHeartAnimation(!isHeroMusicPlaying);
    }
  };

  const [activeStoryIdx, setActiveStoryIdx] = useState(1);

  // State điều khiển Orbiting, Tự Động Chuyển Cảnh & Zoom Mục Cặp Đôi
  const [showcaseIdx, setShowcaseIdx] = useState(0);
  const [isAutoTransition, setIsAutoTransition] = useState(true);
  const [isOrbitHovered, setIsOrbitHovered] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isOrbiting, setIsOrbiting] = useState(true);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredOrbitId, setHoveredOrbitId] = useState<string | null>(null);

  // Tự động chuyển đổi cảnh mượt mà mỗi 3.8 giây với hiệu ứng tiến trình
  useEffect(() => {
    if (!isAutoTransition || isOrbitHovered || zoomModalOpen) return;

    const DURATION = 3800; // 3.8s mỗi cảnh
    const INTERVAL = 40;
    const step = (INTERVAL / DURATION) * 100;

    const timer = setInterval(() => {
      setTransitionProgress((prev) => {
        if (prev >= 100) {
          setShowcaseIdx((curr) => (curr + 1) % SHOWCASE_ITEMS.length);
          return 0;
        }
        return prev + step;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoTransition, isOrbitHovered, zoomModalOpen]);

  const currentShowcase = SHOWCASE_ITEMS[showcaseIdx];

  const handleSelectShowcase = (index: number) => {
    setShowcaseIdx(index);
    setTransitionProgress(0);
  };

  // 3D Parallax Mouse Physics cho Hero Phone
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), springConfig);

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

  // State & Auto-play cho Coverflow Carousel (Mẫu thiệp đẹp nhất)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    if (isCarouselHovered || displayedTemplates.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % displayedTemplates.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCarouselHovered, displayedTemplates.length]);

  // Active step trong quy trình 3 bước
  const [activeStep, setActiveStep] = useState(1);

  // State cho Audio Visualizer & Real Music Player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(WEDDING_TRACKS[0]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Helper format time m:ss
  const formatAudioTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const togglePlayMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Audio playback error:", err);
      });
    }
  };

  const handleSelectTrack = (track: typeof WEDDING_TRACKS[0]) => {
    const isSameTrack = activeTrack.id === track.id;
    if (isSameTrack) {
      togglePlayMusic();
      return;
    }
    setActiveTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.audioSrc;
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Audio playback error:", err);
      });
    }
  };

  const handleNextTrack = () => {
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * WEDDING_TRACKS.length);
    } else {
      nextIndex = activeTrack.id % WEDDING_TRACKS.length;
    }
    const nextTrack = WEDDING_TRACKS[nextIndex];
    setActiveTrack(nextTrack);
    if (audioRef.current) {
      audioRef.current.src = nextTrack.audioSrc;
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log("Play error:", err));
      }
    }
  };

  const handlePrevTrack = () => {
    const prevIndex = (activeTrack.id - 2 + WEDDING_TRACKS.length) % WEDDING_TRACKS.length;
    const prevTrack = WEDDING_TRACKS[prevIndex];
    setActiveTrack(prevTrack);
    if (audioRef.current) {
      audioRef.current.src = prevTrack.audioSrc;
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log("Play error:", err));
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.log("Play error:", err));
      }
    } else {
      handleNextTrack();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = percent * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

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
    if (displayedTemplates.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % displayedTemplates.length);
  };

  const prevSlide = () => {
    if (displayedTemplates.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + displayedTemplates.length) % displayedTemplates.length);
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

  // Smart Sticky / Reveal Header States
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if page scrolled past initial threshold
      setIsScrolled(currentScrollY > 20);
      setShowBackToTop(currentScrollY > 400);

      // Smart Hide/Reveal:
      // 1. Khi ở gần đầu trang (<= 20px) -> luôn hiện
      if (currentScrollY <= 20) {
        setShowHeader(true);
      }
      // 2. Khi cuộn xuống và đã qua 80px -> tự động ẩn nhẹ nhàng để thoáng trang
      else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowHeader(false);
      }
      // 3. Khi cuộn nhẹ lên ở BẤT KỲ ĐÂU trên trang -> trượt xuống hiện ngay lập tức
      else if (currentScrollY < lastScrollY.current) {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-clip selection:bg-[#BE944E]/20">
      <Suspense fallback={null}>
        <AuthQueryHandler />
      </Suspense>
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER & NAVBAR (TỐI ƯU HÓA HOÀN HẢO CHO ĐIỆN THOẠI & DESKTOP) */}
      {/* ------------------------------------------------------------- */}
      <header
        className={`w-full px-4 sm:px-6 py-2.5 md:py-3.5 md:px-12 lg:px-20 sticky top-0 z-40 transition-all duration-300 ${
          showHeader
            ? "translate-y-0"
            : "max-md:translate-y-0 md:-translate-y-full md:shadow-none md:pointer-events-none"
        } ${
          isScrolled
            ? "bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#EFE9E1]"
            : "bg-[#FAF7F2]/90 backdrop-blur-xs border-b border-[#EFE9E1]/60"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="group flex items-center" title="Trang Chủ CardVite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="CardVite Logo"
              className="h-9 sm:h-11 md:h-15 w-auto object-contain transition-transform group-hover:scale-105"
            />
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

          {/* DESKTOP RIGHT ACTION */}
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
                  {t("navLogout") || "Đăng xuất"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="px-4 py-2 rounded-full text-[11px] font-bold text-stone-700 hover:text-stone-900 border border-stone-300 hover:bg-white transition cursor-pointer"
              >
                {t("navLogin") || "Đăng Nhập"}
              </button>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleCreateCardClick}
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#C19A5B] hover:bg-[#b0894a] text-white text-[11px] font-bold tracking-widest uppercase shadow-md transition cursor-pointer"
              >
                {t("homeCreateBtn")}
              </button>
            </motion.div>
          </div>

          {/* MOBILE RIGHT ACTION BAR (DỄ SỬ DỤNG TRÊN ĐIỆN THOẠI) */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <Link
                href="/dashboard/cards"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px] font-semibold shadow-2xs"
              >
                <div className="w-4.5 h-4.5 rounded-full bg-[#BE944E] text-white flex items-center justify-center text-[9px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[65px] truncate text-[11px]">{user.name}</span>
              </Link>
            ) : (
              <button
                onClick={handleCreateCardClick}
                className="px-3 py-1.5 rounded-full bg-[#C19A5B] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs active:scale-95 transition"
              >
                {t("homeCreateBtn") || "Tạo thiệp"}
              </button>
            )}

            {/* HAMBURGER BUTTON VỚI MIN 44X44PX TOUCH AREA */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-[#181716] transition cursor-pointer"
              aria-label="Mở Menu Điều Hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE LUXURY NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop làm mờ mượt mà */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[88vw] max-w-sm bg-[#FAF7F2] border-l border-[#EAE2D5] shadow-2xl flex flex-col justify-between p-6 overflow-y-auto md:hidden"
            >
              <div className="space-y-6">
                {/* TOP ROW: LOGO & NÚT ĐÓNG */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EFE9E1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo.png" alt="CardVite" className="h-8 w-auto object-contain" />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition cursor-pointer"
                    aria-label="Đóng Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* USER PROFILE / AUTH CARD TRÊN MOBILE */}
                {user ? (
                  <div className="p-4 rounded-2xl bg-white border border-[#E7D7C1] shadow-2xs space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#BE944E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{user.name}</h4>
                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/dashboard/cards"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-2.5 rounded-xl bg-[#F5EFE6] text-[#7A5A27] text-[11px] font-bold text-center hover:bg-[#ECE3D4] transition"
                      >
                        Quản Lý Thiệp
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/dashboard/cards/new");
                        }}
                        className="py-2 px-2.5 rounded-xl bg-[#BE944E] text-white text-[11px] font-bold text-center hover:bg-[#AA8240] transition shadow-xs"
                      >
                        + Tạo Mới
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-center text-[11px] text-stone-400 hover:text-rose-600 transition pt-1 font-medium cursor-pointer"
                    >
                      {t("navLogout") || "Đăng xuất tài khoản"}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-[#E7D7C1] shadow-2xs space-y-2.5">
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Đăng nhập để lưu thiệp cưới trực tuyến và theo dõi khách mời xác nhận RSVP dễ dàng.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthModal("login");
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-[#C5A059] text-[#8C6424] text-xs font-bold text-center hover:bg-[#FAF6F0] transition cursor-pointer"
                      >
                        {t("navLogin") || "Đăng Nhập"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          handleCreateCardClick(e);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#BE944E] text-white text-xs font-bold text-center hover:bg-[#AA8240] transition shadow-xs cursor-pointer"
                      >
                        {t("homeCreateBtn") || "Tạo Thiệp"}
                      </button>
                    </div>
                  </div>
                )}

                {/* DANH SÁCH ĐIỀU HƯỚNG CHÍNH */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 block mb-1">
                    Danh Mục Điều Hướng
                  </span>
                  {[
                    { href: "/collections", label: t("homeNavCollections") || "Bộ Sưu Tập Mẫu Thiệp", icon: Sparkles, badge: "Hot" },
                    { href: "/journal", label: t("homeNavJournal") || "Cẩm Nang & Ý Tưởng Cưới", icon: BookOpen },
                    { href: "/pricing", label: t("homeNavPricing") || "Bảng Giá Dịch Vụ", icon: Gift },
                    { href: "/concierge", label: t("homeNavConcierge") || "Thiết Kế Riêng Concierge", icon: Flower2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-stone-200/50 text-stone-800 font-medium text-sm transition group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-[#BE944E]" />
                          <span className="group-hover:text-[#BE944E] transition-colors">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* CHÂN MENU MOBILE: ĐỔI NGÔN NGỮ & BẢN QUYỀN */}
              <div className="pt-6 border-t border-[#EAE2D5] space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-stone-500 font-medium">Ngôn ngữ:</span>
                  <LanguageSwitcher />
                </div>
                <p className="text-[11px] text-stone-400 text-center">
                  CardVite • Nền tảng thiệp điện tử cao cấp hàng đầu
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION - LUXURY WEDDING INVITATION MASTERPIECE */}
      {/* ------------------------------------------------------------- */}
      <section
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full relative overflow-hidden bg-[#FAF6F0] pt-4 pb-20 px-6 md:px-12 lg:px-20 selection:bg-[#BE944E]/20"
      >
        {/* LUXURY SILK DRAPE & AMBIENT SOFT LIGHTING BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Soft Silk Waves SVG / Gradient */}
          <div className="absolute -top-24 -right-24 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-white/90 via-[#F7EFE3]/60 to-transparent blur-3xl opacity-80" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#F5ECE0]/70 via-white/40 to-transparent blur-2xl opacity-70" />

          {/* Floating Gold Dust Particles */}
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -90, 0],
                x: [0, i % 2 === 0 ? 25 : -25, 0],
                opacity: [0.2, 0.75, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 6 + i * 1.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              className="absolute w-2 h-2 rounded-full bg-[#C59E58]/35 blur-[1px]"
              style={{
                left: `${12 + i * 10}%`,
                top: `${30 + (i % 4) * 16}%`,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* TOP RIGHT: TEMPLATE SWITCHER PILLS (MẪU VƯỜN NGỌC, MẪU HOA LỤA, MẪU CỔ ĐIỂN) */}
          <div className="flex justify-end items-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-stone-200/50 shadow-2xs">
              {[
                { id: "vuon-ngoc", label: "MẪU VƯỜN NGỌC" },
                { id: "hoa-lua", label: "MẪU HOA LỤA" },
                { id: "co-dien", label: "MẪU CỔ ĐIỂN" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedHeroTemplate(t.id as any);
                    confetti({
                      particleCount: 25,
                      spread: 45,
                      origin: { y: 0.2, x: 0.8 },
                      colors: ["#C59E58", "#FAF6F0", "#BE944E"],
                    });
                  }}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    selectedHeroTemplate === t.id
                      ? "bg-[#FCFAF6] border border-[#C59E58] text-[#8C6424] shadow-xs ring-2 ring-[#C59E58]/20"
                      : "bg-white/80 hover:bg-white text-stone-600 border border-transparent shadow-2xs"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* ------------------------------------------------------------- */}
            {/* CỘT TRÁI: HEADLINE, LỢI ÍCH & FORM TẠO BẢN XEM TRƯỚC */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6"
            >
              {/* TAGS & STATS BADGES */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#E4EAE2] text-[#4F634B]">
                  {t("homeTagWedding") || "WEDDING"}
                </span>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FCECE7] text-[#A66353]">
                  {t("homeTagGala") || "GALA"}
                </span>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-stone-200/80 text-[11px] text-stone-600 shadow-2xs font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C59E58]" />
                  <span>1,248 {t("cardsSentToday") || "thiệp gửi hôm nay"}</span>
                </motion.div>
              </div>

              {/* LUXURY HEADLINE */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-bold tracking-tight text-[#181716] leading-[1.14]">
                {t("homeHeroTitle1") || "Trao thiệp trang"} <br />
                {t("homeHeroTitle2") || "trọng —"} <br />
                <span className="italic font-normal text-[#C59E58] font-serif">
                  {t("homeHeroTitleEm1") || "Chạm vạn cảm xúc"} <br />
                  {t("homeHeroTitle3") || "chỉ trong"} {t("homeHeroTitleEm2") || "5 phút."}
                </span>
              </h1>

              {/* 3 LỢI ÍCH NỔI BẬT VỚI ICON */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-[13px] font-medium text-stone-600 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#C59E58] font-bold">✏️</span>
                  <span>{t("homeCarouselPillar1Title") || "Thiết kế tinh tế"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C59E58] font-bold">🎛️</span>
                  <span>{t("homeCarouselPillar2Title") || "Dễ dàng tùy chỉnh"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C59E58] font-bold">🚀</span>
                  <span>{t("homeFastSend") || "Gửi nhanh mọi lúc"}</span>
                </div>
              </div>

              {/* FORM CARD SIMULATOR */}
              <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-[#EFE9E1] shadow-[0_20px_50px_rgba(197,158,88,0.08),0_8px_20px_rgba(0,0,0,0.03)] space-y-4 max-w-[430px]">
                {/* TÊN CÔ DÂU & CHÚ RỂ */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                    {t("homeFieldCoupleName") || "Tên Cô Dâu & Chú Rể"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={names}
                      onChange={(e) => setNames(e.target.value)}
                      placeholder="Sarah & James"
                      className="w-full px-4 py-2.5 pr-10 text-xs rounded-xl bg-[#F8F5F0] border border-[#E6DDD1] focus:outline-none focus:ring-2 focus:ring-[#C59E58]/40 text-[#181716] font-medium transition"
                    />
                    <Heart className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* HIỆU ỨNG THIỆP */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                    {t("homeFieldEffect") || "Hiệu Ứng Thiệp"}
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: "Wax Seal", label: t("homeEffectWaxSeal") || "Wax Seal" },
                      { id: "Flower Gate", label: t("homeEffectFlowerGate") || "Flower Gate" },
                      { id: "Gift Box", label: t("homeEffectGiftBox") || "Gift Box" },
                    ].map((eff) => (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        key={eff.id}
                        type="button"
                        onClick={() => {
                          setSelectedEffect(eff.id as any);
                          setSealOpened(false);
                        }}
                        className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer text-[11px] ${
                          selectedEffect === eff.id
                            ? "bg-[#FFFDF9] border-[#C59E58] text-[#8C6424] font-bold shadow-xs ring-1 ring-[#C59E58]/30"
                            : "bg-white border-[#E8E2D8] text-stone-600 hover:bg-[#FAF7F2]"
                        }`}
                      >
                        {eff.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* NÚT TẠO BẢN XEM TRƯỚC */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={handleCreateCardClick}
                    className="w-full py-3.5 rounded-xl bg-[#181716] hover:bg-black text-[#F4ECE1] text-[11px] font-bold uppercase tracking-widest shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2 group"
                  >
                    <span>{t("homeBtnPreview") || "TẠO BẢN XEM TRƯỚC"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CỘT PHẢI: MOCKUP 3D ĐIỆN THOẠI TRÊN BỤC CẨM THẠCH & NHẪN CƯỚI & HOA LỤA */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col items-center relative select-none">
              {/* CỤM HOA HỒNG KEM & LÁ VINTAGE GÓC TRÁI DƯỚI */}
              <div className="absolute -bottom-6 -left-12 z-20 pointer-events-none opacity-90 hidden sm:block">
                <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Soft White Roses Embellishment */}
                  <circle cx="50" cy="90" r="32" fill="#FAF5ED" stroke="#E6DDD1" strokeWidth="1.5" />
                  <path d="M35 85C40 75 60 75 65 85C60 95 40 95 35 85Z" fill="#F4ECE1" />
                  <circle cx="50" cy="90" r="16" fill="#EDE4D6" />
                  <circle cx="32" cy="115" r="22" fill="#FAF6F0" stroke="#E8E0D5" strokeWidth="1" />
                  {/* Leaves */}
                  <path d="M20 70C15 50 35 45 40 60C45 75 25 80 20 70Z" fill="#8C9E89" fillOpacity="0.4" />
                  <path d="M75 110C90 120 85 140 70 135C55 130 65 105 75 110Z" fill="#8C9E89" fillOpacity="0.35" />
                </svg>
              </div>

              {/* CỤM HOA HỒNG KEM GÓC PHẢI SAU ĐIỆN THOẠI */}
              <div className="absolute top-24 -right-10 z-0 pointer-events-none opacity-85 hidden sm:block">
                <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="85" cy="60" r="34" fill="#FAF6EE" stroke="#E6DDD1" strokeWidth="1.5" />
                  <circle cx="85" cy="60" r="18" fill="#F0E8DC" />
                  <circle cx="110" cy="90" r="20" fill="#FAF5ED" stroke="#E8E0D5" strokeWidth="1" />
                  <path d="M60 40C50 25 70 20 80 30C90 40 75 50 60 40Z" fill="#8C9E89" fillOpacity="0.4" />
                </svg>
              </div>

              {/* PARALLAX 3D PHONE WRAPPER */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                className="relative z-10 flex items-center justify-center pt-2 pb-6"
              >
                {/* 1. IPHONE PHÍA SAU (GOLD TITANIUM BACK CHASSIS) */}
                <div
                  className="absolute w-56 sm:w-64 aspect-[9/18.5] rounded-[42px] bg-gradient-to-tr from-[#D6C4A5] via-[#F0E5D1] to-[#DBC9AA] p-2.5 shadow-2xl border-[3px] border-[#E8DCC6] transform -rotate-12 -translate-x-14 -translate-y-2 opacity-95 pointer-events-none hidden sm:block"
                  style={{ transformStyle: "preserve-3d", transform: "rotate(-10deg) translate(-50px, -10px) scale(0.96)" }}
                >
                  {/* Camera Island Matrix (3 Mắt Vàng Gold Titan) */}
                  <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#E2D2B8] to-[#CBB99B] p-2 shadow-md border border-[#F4EADA] flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 rounded-full bg-[#181716] border-2 border-[#D8C7AA] shadow-inner flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#181716] border-2 border-[#D8C7AA] shadow-inner flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-6 h-6 rounded-full bg-[#181716] border-2 border-[#D8C7AA] shadow-inner flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                      </div>
                      <div className="w-3 h-3 rounded-full bg-[#FAF3E7] shadow-sm border border-[#C5B393]" />
                    </div>
                  </div>
                </div>

                {/* 2. IPHONE CHÍNH DIỆN (CHÂN THẬT, SANG TRỌNG, HIỂN THỊ THIỆP CƯỚI WAX SEAL) */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative w-64 sm:w-72 aspect-[9/18.5] rounded-[44px] bg-gradient-to-b from-[#F2E5D0] via-[#E4D1B5] to-[#CBB594] p-3 shadow-[0_30px_70px_rgba(180,140,70,0.22),0_15px_35px_rgba(0,0,0,0.12)] border-2 border-[#FAF4E8] group overflow-hidden z-20"
                >
                  {/* Glossy Screen Reflection */}
                  <div className="absolute inset-0 rounded-[44px] bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none z-30" />

                  {/* SCREEN DISPLAY - PHONE SHOWCASE WITH USER VIDEO */}
                  <div className="w-full h-full bg-[#181716] rounded-[36px] overflow-hidden relative shadow-inner flex flex-col justify-between border border-[#F0EAE1]">
                    {/* HIDDEN HERO AUDIO ELEMENT */}
                    <audio ref={heroAudioRef} src="/music/beautiful-in-white.mp3" loop preload="auto" />

                    {/* FULLSCREEN USER MP4 VIDEO (MUTED & AUTOPLAY) */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover"
                      >
                        <source src="/wedding-showcase.mp4" type="video/mp4" />
                      </video>
                      {/* Very soft gradient vignette so video stays vibrant and clearly visible */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
                    </div>

                    {/* DYNAMIC ISLAND */}
                    <div className="relative z-20 pt-2.5 px-6 flex items-center justify-center">
                      <div className="w-18 h-4 bg-black rounded-full mx-auto shadow-sm flex items-center justify-end pr-1.5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </div>

                    {/* VINTAGE FLORAL ACCENT (TOP RIGHT) */}
                    <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-40 z-10">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 0C80 20 60 5 40 25C20 45 35 65 15 85C5 95 0 100 0 100" stroke="#F3E5C8" strokeWidth="1.2" />
                        <circle cx="70" cy="20" r="10" fill="#FAF4E8" fillOpacity="0.2" stroke="#F3E5C8" strokeWidth="0.8" />
                        <circle cx="45" cy="40" r="8" fill="#FAF4E8" fillOpacity="0.2" stroke="#F3E5C8" strokeWidth="0.8" />
                      </svg>
                    </div>

                    {/* HIỆU ỨNG TRÁI TIM TO MÀU ĐỎ PHÁT SÁNG KHI ẤN NÚT SÁP */}
                    <AnimatePresence>
                      {showHeartAnimation && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]"
                        >
                          {/* Pulsing Giant Red Glowing Heart */}
                          <motion.div
                            animate={{
                              scale: [1, 1.15, 1, 1.12, 1],
                              rotate: [0, -2, 2, -1, 0],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.4,
                              ease: "easeInOut",
                            }}
                            className="relative flex flex-col items-center"
                          >
                            <svg
                              className="w-28 h-28 drop-shadow-[0_0_25px_rgba(239,68,68,0.95)]"
                              viewBox="0 0 24 24"
                              fill="url(#redHeartGradient)"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <defs>
                                <linearGradient id="redHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#FF1E56" />
                                  <stop offset="50%" stopColor="#FF4B4B" />
                                  <stop offset="100%" stopColor="#D90429" />
                                </linearGradient>
                              </defs>
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>

                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="mt-2 px-3 py-1 rounded-full bg-red-600/90 text-white font-bold text-xs tracking-wider shadow-lg border border-red-300/40 flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" />
                              <span>Đang phát: Beautiful In White</span>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* NỘI DUNG TẤM THIỆP MỜ MỜ (TRANSLUCENT FROSTED GLASS) THẤY RÕ VIDEO */}
                    <div className="relative z-10 px-3 pt-2 pb-2 text-center flex-1 flex flex-col justify-center items-center">
                      <div className="w-full bg-black/25 backdrop-blur-[2.5px] rounded-2xl py-3 px-2 border border-white/20 shadow-2xl flex flex-col items-center">
                        {/* HEADER TEXT */}
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#F5E6C8] font-bold mb-1 font-sans drop-shadow-md">
                          THE WEDDING OF
                        </p>

                        {/* TÊN CÔ DÂU & CHÚ RỂ */}
                        <div className="my-0.5">
                          <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                            {names.split("&")[0]?.trim() || "Sarah"}
                          </h2>
                          <span className="font-serif italic text-base text-[#F5D77F] block my-0.5 drop-shadow-md">&</span>
                          <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                            {names.split("&")[1]?.trim() || "James"}
                          </h2>
                        </div>

                        {/* SAVE THE DATE & NGÀY CƯỚI */}
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[8px] uppercase tracking-[0.25em] text-[#EAD8B8] font-bold drop-shadow-sm">
                            SAVE THE DATE
                          </p>
                          <p className="text-xs font-serif font-bold text-white tracking-wider drop-shadow-md">
                            20 . 10 . 2025
                          </p>
                        </div>
                      </div>

                      {/* WHITE SILK RIBBON THẮT NƠ NGANG VỚI GOLD WAX SEAL */}
                      <div className="relative w-full my-2.5 flex items-center justify-center">
                        {/* Silk Ribbon Band */}
                        <div className="w-full h-8 bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-xs flex items-center justify-center relative">
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
                          
                          {/* Ribbon Fold / Drapes */}
                          <div className="absolute inset-x-8 top-0 bottom-0 bg-white/30 backdrop-blur-2xs shadow-2xs border-y border-white/30" />
                        </div>

                        {/* 3D GOLD METALLIC WAX SEAL STAMP (BẤM ĐỂ PHÁT NHẠC VÀ VẼ TRÁI TIM ĐỎ) */}
                        <motion.button
                          whileHover={{ scale: 1.12, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleToggleHeroSeal}
                          title={isHeroMusicPlaying ? "Bấm để tắt nhạc & ẩn trái tim" : "Bấm để vẽ trái tim đỏ & phát bài hát Beautiful In White"}
                          className={`absolute z-20 w-13 h-13 rounded-full bg-gradient-to-br from-[#F5D77F] via-[#D4A038] to-[#996F20] shadow-[0_6px_18px_rgba(212,160,56,0.6),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.3)] border-2 border-[#FFF2D0] flex items-center justify-center cursor-pointer transition-all ${
                            isHeroMusicPlaying ? "ring-4 ring-red-500/80 animate-pulse" : ""
                          }`}
                        >
                          {/* Wax Edge Imperfection Detail */}
                          <div className="w-9 h-9 rounded-full border border-[#FAF1DA]/60 flex items-center justify-center shadow-inner">
                            {/* Heart / Olive Botanical Emblem */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FFEFC7" fillOpacity="0.95" />
                            </svg>
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    {/* VINTAGE FLORAL ACCENT (BOTTOM LEFT) */}
                    <div className="absolute bottom-12 left-0 w-24 h-24 pointer-events-none opacity-40">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 100C20 80 5 60 25 40C45 20 65 35 85 15C95 5 100 0 100 0" stroke="#F3E5C8" strokeWidth="1.2" />
                        <circle cx="30" cy="80" r="10" fill="#FAF4E8" fillOpacity="0.2" stroke="#F3E5C8" strokeWidth="0.8" />
                        <circle cx="55" cy="60" r="8" fill="#FAF4E8" fillOpacity="0.2" stroke="#F3E5C8" strokeWidth="0.8" />
                      </svg>
                    </div>

                    {/* BOTTOM BAR: CARDVITE VIDEO SHOWCASE & MUSIC BUTTON */}
                    <div className="relative z-20 px-4 py-2.5 bg-black/40 backdrop-blur-md border-t border-white/20 flex items-center justify-between shadow-xs">
                      <div className="text-left">
                        <span className="text-[8px] uppercase font-bold tracking-widest text-[#F5D77F] block">
                          CARDVITE VIDEO SHOWCASE
                        </span>
                        <h4 className="text-xs font-serif font-bold text-white tracking-wide drop-shadow-sm">
                          {names || "Sarah & James"}
                        </h4>
                      </div>

                      {/* AUDIO TOGGLE BUTTON */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggleHeroSeal}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                          isHeroMusicPlaying
                            ? "bg-red-500 text-white animate-spin ring-2 ring-red-300"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                        title={isHeroMusicPlaying ? "Tắt nhạc" : "Bật nhạc"}
                      >
                        <Music className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* 3. BỤC ĐÁ CẨM THẠCH TRẮNG VIỀN VÀNG (MARBLE PODIUM WITH GOLD RIM) */}
              <div className="relative w-72 sm:w-88 -mt-16 z-0 flex flex-col items-center pointer-events-none">
                {/* Marble Podium Top Surface (Oval) */}
                <div className="w-full h-24 rounded-[100%] bg-gradient-to-b from-[#FAF8F5] via-[#EFEBE4] to-[#E3DCD1] border-[3px] border-[#D8C7A8] shadow-[0_20px_40px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.9)] relative overflow-hidden">
                  {/* Subtle Marble Veins */}
                  <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <path d="M0 20 C50 10, 100 40, 200 25" stroke="#C9BFB0" strokeWidth="1.2" fill="none" />
                    <path d="M20 50 C80 30, 140 45, 200 35" stroke="#C9BFB0" strokeWidth="0.8" fill="none" />
                  </svg>
                </div>
                {/* Marble Podium Base Depth / Gold Ring Base */}
                <div className="w-[96%] h-6 -mt-18 rounded-[100%] bg-gradient-to-b from-[#C49B55] to-[#8C6826] shadow-xl" />
              </div>

              {/* 4. ĐÔI NHẪN CƯỚI VÀNG 18K (TWIN GOLD WEDDING RINGS) GÓC PHẢI */}
              <div className="absolute bottom-8 right-4 sm:right-8 z-20 pointer-events-none">
                <svg width="68" height="42" viewBox="0 0 68 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left Ring */}
                  <ellipse cx="24" cy="22" rx="16" ry="12" fill="none" stroke="url(#goldGrad1)" strokeWidth="4" />
                  <ellipse cx="24" cy="22" rx="16" ry="12" fill="none" stroke="#FFF7E6" strokeWidth="1" strokeDasharray="3 9" />
                  {/* Right Ring (Intersecting) */}
                  <ellipse cx="44" cy="20" rx="15" ry="11" fill="none" stroke="url(#goldGrad2)" strokeWidth="3.5" />
                  <ellipse cx="44" cy="20" rx="15" ry="11" fill="none" stroke="#FFF7E6" strokeWidth="0.8" strokeDasharray="2 8" />
                  <defs>
                    <linearGradient id="goldGrad1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F9E2AF" />
                      <stop offset="50%" stopColor="#C49B55" />
                      <stop offset="100%" stopColor="#7E5C20" />
                    </linearGradient>
                    <linearGradient id="goldGrad2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFF2D4" />
                      <stop offset="50%" stopColor="#D4AB63" />
                      <stop offset="100%" stopColor="#8C6524" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* 5. HUY HIỆU DƯỚI BỤC: VIDEO CHUYỂN ĐỘNG SẮC NÉT 4K 60FPS */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mt-6 z-20 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 text-xs text-stone-700 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#C59E58]" />
                <span className="font-medium">{t("homeVideoBadge") || "Video mẫu thiệp chuyển động sắc nét chuẩn 4K 60fps"}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. MỤC: MỜI ĐÍCH DANH TỪNG KHÁCH, BIẾT AI SẼ ĐẾN */}
      {/* ------------------------------------------------------------- */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 md:px-12 lg:px-16 overflow-hidden">
        {/* Background Decorative Accents */}
        {/* Top-Left Botanical Leaf & Grid Accent */}
        <div className="absolute top-2 left-2 sm:top-6 sm:left-6 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none opacity-40 -z-10">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#BE944E] fill-[#BE944E]/15">
            <path d="M10,80 Q30,40 70,20 Q60,60 10,80 Z" strokeWidth="1" />
            <path d="M30,55 Q50,45 85,35" strokeWidth="0.75" strokeDasharray="2 2" fill="none" />
            <path d="M40,65 Q25,45 20,25 Q45,35 40,65 Z" strokeWidth="0.8" />
            <path d="M55,45 Q75,30 90,10 Q65,35 55,45 Z" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Faint Dot Matrix */}
        <div className="absolute top-12 left-28 hidden sm:grid grid-cols-6 gap-2 opacity-25 pointer-events-none -z-10">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-[#BE944E]" />
          ))}
        </div>

        {/* Ambient Soft Glows */}
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-[#BE944E]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FAF0E1]/80 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Sparkles */}
        <span className="absolute top-1/2 left-8 text-[#DDB866] text-sm animate-pulse select-none">✦</span>
        <span className="absolute top-2/3 right-6 text-[#DDB866] text-xs animate-pulse select-none">✦</span>

        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-bold text-[#181716] tracking-tight leading-[1.15]"
          >
            <span className="block">{t("homeNamedTitle1")}</span>
            <span className="italic font-normal font-serif text-[#C4974E] inline-flex items-center justify-center gap-2 mt-1">
              <span>{t("homeNamedTitleEm")}</span>
              <span className="text-2xl sm:text-3xl not-italic text-[#DDB866]">✦</span>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm text-stone-600/85 mt-3.5 max-w-xl mx-auto leading-relaxed"
          >
            {t("homeNamedSub")}
          </motion.p>
        </div>

        {/* MAIN 2-COLUMN SHOWCASE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* CỘT TRÁI: 2 THẺ MOCKUP TƯƠNG TÁC XÁC NHẬN */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* Glowing Backdrop Aura */}
            <div className="absolute inset-0 m-auto w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-[#BE944E]/20 via-[#F7EBD9]/60 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

            {/* THẺ 1: LINK RIÊNG CỦA KHÁCH */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[28px] p-6 sm:p-7 border border-[#EFE8DC] shadow-[0_15px_40px_rgba(190,148,78,0.12)] relative z-10 space-y-4"
            >
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#BE944E] uppercase">
                <span>LINK RIÊNG CỦA KHÁCH</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>

              <div>
                <span className="text-[11px] text-stone-500 font-medium">Kính mời:</span>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-0.5">
                  Ngọc Trâm & Hoàng Long
                </h4>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setGuestAttending(true)}
                  className={`flex-1 py-3 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    guestAttending === true
                      ? "bg-[#332E1E] text-[#EFE7D8] shadow-md ring-2 ring-[#BE944E]/30"
                      : "bg-[#F7F4EE] text-stone-600 hover:bg-[#EFEAE0]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tôi sẽ đến</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuestAttending(false)}
                  className={`flex-1 py-3 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    guestAttending === false
                      ? "bg-stone-800 text-white shadow-md"
                      : "bg-[#FAF3E8] text-[#8C6B38] hover:bg-[#F5ECD8]"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-[#BE944E]" />
                  <span>Bận mất rồi</span>
                </button>
              </div>

              {/* STAT FOOTER: 56 người đã đồng ý + Avatar stack */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
                <span className="text-[11px] sm:text-xs">56 người đã đồng ý</span>
                <div className="flex items-center">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Guest 1"
                      className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Guest 2"
                      className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="Guest 3"
                      className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                      alt="Guest 4"
                      className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover"
                    />
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] text-[9px] font-bold text-stone-600 ml-1.5">
                    + 3
                  </span>
                </div>
              </div>
            </motion.div>

            {/* THẺ 2: NOTIFICATION & LIVE RSVP COUNTER (STACK LỆCH SANG PHẢI) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-full max-w-sm bg-white/98 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#EFE8DC] shadow-[0_16px_45px_rgba(0,0,0,0.08)] -mt-6 sm:-mt-8 ml-auto sm:mr-[-10px] relative z-20 space-y-3"
            >
              <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#BE944E]" />
                <span>
                  <strong className="text-[#BE944E] font-bold">Phương Linh</strong> vừa xác nhận • 2 phút trước
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-3xl font-serif font-bold text-stone-900 leading-none">86%</span>
                  <p className="text-[10px] text-stone-400 mt-1">42 khách đã xác nhận</p>
                </div>

                {/* 3 MINI STATS BADGES */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className="px-2.5 py-1 rounded-full bg-[#E8F8EE] text-[#1E7E34] font-bold text-[11px]">
                    36 Có đến
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#FDECEE] text-[#D9384E] font-bold text-[11px]">
                    4 Bận
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F2ECE4] text-[#7A6D5E] font-medium text-[11px]">
                    6 Có thể tới
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CỘT PHẢI: 4 FEATURE CAPSULE CARDS (01, 02, 03, 04) */}
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
            {/* CARD 01 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-[22px] p-4 sm:p-5 border border-[#EFE8DC] shadow-2xs hover:shadow-md hover:border-[#BE944E]/40 transition flex items-center gap-4 relative group"
            >
              {/* Left Circular Medallion */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#FAF6F0] to-[#F3ECE0] border-2 border-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <div className="relative flex items-center justify-center">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#BE944E]" />
                  <Heart className="w-2.5 h-2.5 fill-[#BE944E] text-[#BE944E] absolute -top-1 -right-1" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-stone-900 font-sans tracking-tight">
                  {t("homeNamedFeat1Title")}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {t("homeNamedFeat1Desc")}
                </p>
              </div>

              {/* Number Badge */}
              <span className="text-[#C4974E] font-mono font-bold text-xs bg-[#FAF5EE] px-2.5 py-1 rounded-full shrink-0 border border-[#EAE0CD]/60">
                01
              </span>
            </motion.div>

            {/* CARD 02 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-[22px] p-4 sm:p-5 border border-[#EFE8DC] shadow-2xs hover:shadow-md hover:border-[#BE944E]/40 transition flex items-center gap-4 relative group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#FAF6F0] to-[#F3ECE0] border-2 border-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#BE944E]" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-stone-900 font-sans tracking-tight">
                  {t("homeNamedFeat2Title")}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {t("homeNamedFeat2Desc")}
                </p>
              </div>

              <span className="text-[#C4974E] font-mono font-bold text-xs bg-[#FAF5EE] px-2.5 py-1 rounded-full shrink-0 border border-[#EAE0CD]/60">
                02
              </span>
            </motion.div>

            {/* CARD 03 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-[22px] p-4 sm:p-5 border border-[#EFE8DC] shadow-2xs hover:shadow-md hover:border-[#BE944E]/40 transition flex items-center gap-4 relative group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#FAF6F0] to-[#F3ECE0] border-2 border-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#BE944E]" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-stone-900 font-sans tracking-tight">
                  {t("homeNamedFeat3Title")}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {t("homeNamedFeat3Desc")}
                </p>
              </div>

              <span className="text-[#C4974E] font-mono font-bold text-xs bg-[#FAF5EE] px-2.5 py-1 rounded-full shrink-0 border border-[#EAE0CD]/60">
                03
              </span>
            </motion.div>

            {/* CARD 04 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-[22px] p-4 sm:p-5 border border-[#EFE8DC] shadow-2xs hover:shadow-md hover:border-[#BE944E]/40 transition flex items-center gap-4 relative group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#FAF6F0] to-[#F3ECE0] border-2 border-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-[#BE944E]" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-stone-900 font-sans tracking-tight">
                  {t("homeNamedFeat4Title")}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {t("homeNamedFeat4Desc")}
                </p>
              </div>

              <span className="text-[#C4974E] font-mono font-bold text-xs bg-[#FAF5EE] px-2.5 py-1 rounded-full shrink-0 border border-[#EAE0CD]/60">
                04
              </span>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM 4 TRUST PILLARS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-10 border-t border-[#EFE8DC]/80">
          {/* Pillar 1: Tối ưu thời gian */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5 text-[#C4974E]" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeNamedPillar1Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeNamedPillar1Desc")}
              </p>
            </div>
          </div>

          {/* Pillar 2: Chính xác, rõ ràng */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-5 h-5 text-[#C4974E]" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeNamedPillar2Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeNamedPillar2Desc")}
              </p>
            </div>
          </div>

          {/* Pillar 3: Trải nghiệm tinh tế */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <Heart className="w-5 h-5 text-[#C4974E] fill-[#C4974E]/20" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeNamedPillar3Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeNamedPillar3Desc")}
              </p>
            </div>
          </div>

          {/* Pillar 4: Bảo mật thông tin */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#C4974E]" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeNamedPillar4Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeNamedPillar4Desc")}
              </p>
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
              <motion.g
                animate={{ x: [0, 85, 0, -85, 0], y: [0, 40, 80, 40, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              >
                <circle cx="100" cy="60" r="3" fill="#BE944E" />
              </motion.g>
              <motion.g
                animate={{ x: [0, 85, 170, 85, 0], y: [0, -40, 0, 40, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              >
                <circle cx="15" cy="100" r="2.5" fill="#7D6331" />
              </motion.g>
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
      <section className="relative max-w-7xl mx-auto px-6 py-20 md:px-12 lg:px-16 overflow-hidden">
        {/* Soft background glow & silk wave accents */}
        <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-[#BE944E]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FAF0E1]/80 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* TOP HERO ROW: Left Content & Right Floating Circle Orbit System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* CỘT TRÁI: TIÊU ĐỀ & MÔ TẢ */}
          <div className="lg:col-span-6 space-y-5">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E9E1D5] shadow-xs text-xs font-medium text-stone-700"
            >
              <Heart className="w-3.5 h-3.5 text-[#BE944E]" />
              <span>{t("homeCouplesBadge")}</span>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#181716] tracking-tight leading-[1.15]">
                <span className="block whitespace-nowrap">{t("homeCouplesTitle1")}</span>
                <span className="italic font-normal font-serif text-[#C4974E] block mt-1">
                  {t("homeCouplesTitleEm")}
                </span>
              </h2>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed"
            >
              {t("homeCouplesSub")}
            </motion.p>

            {/* Ornament Line */}
            <div className="flex items-center gap-2 py-1">
              <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#BE944E]/50" />
              <div className="w-1.5 h-1.5 rotate-45 border border-[#BE944E]/70 bg-[#FAF7F2]" />
              <span className="w-16 h-[1px] bg-gradient-to-r from-[#BE944E]/50 to-transparent" />
            </div>

            {/* CTA Button & Interactive Hint */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <Link
                href="/collections"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/90 hover:bg-[#BE944E] hover:text-white border border-[#D8C7B0] text-[#7A5B2B] font-bold text-xs tracking-wider uppercase shadow-xs hover:shadow-md transition-all duration-300 group"
              >
                <Heart className="w-3.5 h-3.5 fill-[#BE944E] text-[#BE944E] group-hover:fill-white group-hover:text-white transition" />
                <span>{t("homeCouplesExploreBtn")}</span>
              </Link>

              <button
                type="button"
                onClick={() => setZoomModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-stone-100/80 hover:bg-stone-200/80 text-stone-700 font-medium text-xs shadow-2xs hover:shadow-xs transition cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#BE944E]" />
                <span>Phóng to xem chi tiết</span>
              </button>
            </motion.div>
          </div>

          {/* CỘT PHẢI: COMPOSITION HÌNH TRÒN VỚI HỆ THỐNG QUỸ ĐẠO XOAY & TỰ ĐỘNG CHUYỂN CẢNH (CINEMATIC AUTO-TRANSITION) */}
          <div
            className="lg:col-span-6 flex flex-col items-center justify-center lg:items-end"
            onMouseEnter={() => setIsOrbitHovered(true)}
            onMouseLeave={() => setIsOrbitHovered(false)}
          >
            <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[450px] lg:h-[450px] flex items-center justify-center">
              {/* Outer Faint Rings & Dashed Orbit Track */}
              <div className="absolute inset-0 rounded-full border border-white/70 pointer-events-none scale-100" />
              <div className="absolute inset-2 rounded-full border border-dashed border-[#BE944E]/25 pointer-events-none scale-105" />

              {/* Sparkles */}
              <span className="absolute top-10 left-6 text-[#DDB866] text-xs animate-pulse select-none">✦</span>
              <span className="absolute bottom-14 -left-2 text-[#DDB866] text-sm animate-pulse select-none">✦</span>
              <span className="absolute top-6 right-20 text-[#DDB866] text-xs animate-pulse select-none">✦</span>

              {/* Main Center Circular Display (Automated Transition & Click to Zoom) */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[350px] lg:h-[350px] flex items-center justify-center z-10">
                {/* Glowing Countdown Progress Ring Around Center Photo */}
                <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none z-20" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-[#BE944E]/15"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="301.6"
                    strokeDashoffset={301.6 - (301.6 * transitionProgress) / 100}
                    strokeLinecap="round"
                    className="text-[#BE944E] drop-shadow-[0_0_6px_rgba(190,148,78,0.8)] transition-[stroke-dashoffset] duration-75"
                  />
                </svg>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  onClick={() => setZoomModalOpen(true)}
                  className="w-full h-full rounded-full overflow-hidden border-[6px] sm:border-8 border-white shadow-[0_20px_50px_rgba(190,148,78,0.25)] relative bg-stone-100 group cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentShowcase.id + currentShowcase.image}
                      initial={{ opacity: 0, scale: 1.15, filter: "blur(6px) brightness(1.1)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" }}
                      exit={{ opacity: 0, scale: 0.92, filter: "blur(4px) brightness(0.9)" }}
                      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentShowcase.image}
                        alt={currentShowcase.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Luxury dark gradient at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Floating Caption on Center Photo */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="absolute bottom-4 inset-x-0 text-center px-4 z-20 pointer-events-none"
                      >
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-[11px] font-bold text-amber-200 shadow-xl">
                          <span>{currentShowcase.badgeLabel}</span>
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          <span className="text-white/95 font-medium truncate max-w-[190px]">{currentShowcase.title}</span>
                        </span>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Hover overlay hint with magnifying glass */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-center p-4 backdrop-blur-[2px] z-30">
                    <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center mb-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                      <ZoomIn className="w-5 h-5 text-white drop-shadow-sm" />
                    </div>
                    <span className="text-xs font-bold tracking-wide text-white drop-shadow-md">
                      Nhấp để phóng to chi tiết
                    </span>
                    <span className="text-[10px] text-amber-200 mt-0.5">
                      {currentShowcase.title}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* HỆ THỐNG XOAY TỰ ĐỘNG 360° (ORBITING WHEEL WITH COUNTER-ROTATION) */}
              <motion.div
                animate={isOrbiting ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 m-auto w-full h-full pointer-events-none"
              >
                {/* 1. Orbiting Badge: Top-Left (Nhẫn cưới) */}
                <div className="absolute top-2 left-6 sm:left-10 lg:left-12 pointer-events-auto">
                  <motion.div
                    animate={isOrbiting ? { rotate: -360 } : { rotate: 0 }}
                    transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectShowcase(1)}
                      onMouseEnter={() => setHoveredOrbitId("rings")}
                      onMouseLeave={() => setHoveredOrbitId(null)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 backdrop-blur-md p-1 border-2 shadow-xl z-20 overflow-hidden cursor-pointer transition-all duration-300 ${
                        currentShowcase.id === "rings"
                          ? "border-[#BE944E] ring-4 ring-[#BE944E] scale-125 shadow-[0_0_25px_rgba(190,148,78,0.7)]"
                          : "border-white hover:scale-125 hover:border-[#BE944E]/60"
                      }`}
                      aria-label="Xem nhẫn cưới"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ORBIT_ITEMS[0].preview}
                        alt={ORBIT_ITEMS[0].title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </button>
                    {/* Tooltip on hover */}
                    {hoveredOrbitId === "rings" && (
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stone-900/90 backdrop-blur-md text-[10px] text-amber-200 font-bold whitespace-nowrap shadow-lg border border-amber-400/30 z-30 pointer-events-none">
                        💍 {ORBIT_ITEMS[0].title}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* 2. Orbiting Badge: Top-Right (Không gian tiệc cưới) */}
                <div className="absolute top-10 -right-2 sm:right-2 lg:right-4 pointer-events-auto">
                  <motion.div
                    animate={isOrbiting ? { rotate: -360 } : { rotate: 0 }}
                    transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectShowcase(2)}
                      onMouseEnter={() => setHoveredOrbitId("banquet")}
                      onMouseLeave={() => setHoveredOrbitId(null)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 backdrop-blur-md p-1 border-2 shadow-xl z-20 overflow-hidden cursor-pointer transition-all duration-300 ${
                        currentShowcase.id === "banquet"
                          ? "border-[#BE944E] ring-4 ring-[#BE944E] scale-125 shadow-[0_0_25px_rgba(190,148,78,0.7)]"
                          : "border-white hover:scale-125 hover:border-[#BE944E]/60"
                      }`}
                      aria-label="Xem không gian tiệc"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ORBIT_ITEMS[1].preview}
                        alt={ORBIT_ITEMS[1].title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </button>
                    {/* Tooltip on hover */}
                    {hoveredOrbitId === "banquet" && (
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stone-900/90 backdrop-blur-md text-[10px] text-amber-200 font-bold whitespace-nowrap shadow-lg border border-amber-400/30 z-30 pointer-events-none">
                        🍽️ {ORBIT_ITEMS[1].title}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* 3. Orbiting Badge: Bottom-Left (Bó hoa cưới) */}
                <div className="absolute bottom-6 left-2 sm:left-6 lg:left-8 pointer-events-auto">
                  <motion.div
                    animate={isOrbiting ? { rotate: -360 } : { rotate: 0 }}
                    transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectShowcase(3)}
                      onMouseEnter={() => setHoveredOrbitId("bouquet")}
                      onMouseLeave={() => setHoveredOrbitId(null)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 backdrop-blur-md p-1 border-2 shadow-xl z-20 overflow-hidden cursor-pointer transition-all duration-300 ${
                        currentShowcase.id === "bouquet"
                          ? "border-[#BE944E] ring-4 ring-[#BE944E] scale-125 shadow-[0_0_25px_rgba(190,148,78,0.7)]"
                          : "border-white hover:scale-125 hover:border-[#BE944E]/60"
                      }`}
                      aria-label="Xem hoa cưới"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ORBIT_ITEMS[2].preview}
                        alt={ORBIT_ITEMS[2].title}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </button>
                    {/* Tooltip on hover */}
                    {hoveredOrbitId === "bouquet" && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stone-900/90 backdrop-blur-md text-[10px] text-amber-200 font-bold whitespace-nowrap shadow-lg border border-amber-400/30 z-30 pointer-events-none">
                        💐 {ORBIT_ITEMS[2].title}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* 4. Orbiting Badge: Bottom-Right (Dấu sáp vàng) */}
                <div className="absolute -bottom-2 right-4 sm:right-8 lg:right-10 pointer-events-auto">
                  <motion.div
                    animate={isOrbiting ? { rotate: -360 } : { rotate: 0 }}
                    transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectShowcase(4)}
                      onMouseEnter={() => setHoveredOrbitId("seal")}
                      onMouseLeave={() => setHoveredOrbitId(null)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#B68B3E] via-[#E2BC6A] to-[#966F26] p-[2.5px] shadow-2xl z-20 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        currentShowcase.id === "seal"
                          ? "ring-4 ring-[#BE944E] scale-125 shadow-[0_0_25px_rgba(190,148,78,0.7)]"
                          : "hover:scale-125"
                      }`}
                      aria-label="Xem con dấu sáp"
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-b from-[#D4A64E] to-[#AB7F2E] border border-[#FFF2D0]/60 flex items-center justify-center shadow-inner">
                        <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-white/95 fill-white/90 drop-shadow-sm" />
                      </div>
                    </button>
                    {/* Tooltip on hover */}
                    {hoveredOrbitId === "seal" && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stone-900/90 backdrop-blur-md text-[10px] text-amber-200 font-bold whitespace-nowrap shadow-lg border border-amber-400/30 z-30 pointer-events-none">
                        💛 {ORBIT_ITEMS[3].title}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* MINI TOOLBAR ĐIỀU KHIỂN TỰ ĐỘNG CHUYỂN CẢNH & PHÓNG TO */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#EAE2D5] shadow-xs text-xs">
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={() => setIsAutoTransition(!isAutoTransition)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-stone-100 text-stone-700 font-medium transition cursor-pointer"
                title={isAutoTransition ? "Tạm dừng tự động chuyển ảnh" : "Bật tự động chuyển ảnh"}
              >
                {isAutoTransition ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span className="text-[11px]">Tự động chuyển (3.8s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span className="text-[11px]">Bật tự động</span>
                  </>
                )}
              </button>

              <span className="w-[1px] h-3.5 bg-stone-200" />

              {/* 5 Story Segment Buttons */}
              <div className="flex items-center gap-1">
                {SHOWCASE_ITEMS.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectShowcase(idx)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                      showcaseIdx === idx
                        ? "bg-[#BE944E] text-white shadow-xs"
                        : "hover:bg-stone-100 text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {item.badgeLabel}
                  </button>
                ))}
              </div>

              <span className="w-[1px] h-3.5 bg-stone-200" />

              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => setZoomModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-stone-100 text-stone-700 text-[11px] font-medium transition cursor-pointer"
              >
                <Maximize2 className="w-3 h-3 text-[#BE944E]" />
                <span>Phóng to</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 3 TESTIMONIAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 mt-16 sm:mt-20">
          {COUPLES_STORIES.map((story, index) => {
            const isActive = activeStoryIdx === index;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                onClick={() => {
                  setActiveStoryIdx(index);
                }}
                className={`bg-white/95 backdrop-blur-md rounded-[32px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 relative group ${
                  isActive
                    ? "border-2 border-[#BE944E]/60 shadow-[0_16px_40px_rgba(190,148,78,0.16)] -translate-y-1.5"
                    : "border border-[#EFE8DC] shadow-2xs hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div>
                  {/* Card Header: Circular Avatar & Right Details */}
                  <div className="flex items-start gap-4">
                    {/* Circular Avatar + Quote Badge */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-white shadow-md bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={story.photo}
                          alt={story.couple}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      {/* Floating Quote Icon */}
                      <div className="absolute -bottom-1 -left-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF5EE] border border-[#E6DCBF] text-[#BE944E] flex items-center justify-center text-sm font-serif shadow-xs font-bold z-10 select-none">
                        ❝
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 min-w-0">
                      {/* Date Badge */}
                      <div className="flex justify-end mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F7F2EA] text-[9px] sm:text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                          {story.date}
                        </span>
                      </div>

                      {/* 5 Gold Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                        {[...Array(story.stars)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Quote Text */}
                      <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed italic line-clamp-4">
                        &ldquo;{story.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Author Name & Venue */}
                <div className="mt-5 pt-3.5 border-t border-[#F2ECE3]">
                  <h4 className="text-sm sm:text-base font-serif font-bold text-[#181716] tracking-tight">
                    {story.couple}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span className="truncate">{story.location}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* BOTTOM SLIDER CONTROLS CAPSULE */}
        <div className="flex items-center justify-center mt-10">
          <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#EAE2D5] shadow-xs">
            <button
              onClick={() => {
                const nextIdx = activeStoryIdx > 0 ? activeStoryIdx - 1 : COUPLES_STORIES.length - 1;
                setActiveStoryIdx(nextIdx);
              }}
              className="text-stone-400 hover:text-[#BE944E] transition p-1 cursor-pointer"
              aria-label="Previous story"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5">
              {COUPLES_STORIES.map((story, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveStoryIdx(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeStoryIdx === i ? "w-5 bg-[#BE944E]" : "w-1.5 bg-[#D8D1C7] hover:bg-stone-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                const nextIdx = activeStoryIdx < COUPLES_STORIES.length - 1 ? activeStoryIdx + 1 : 0;
                setActiveStoryIdx(nextIdx);
              }}
              className="text-stone-400 hover:text-[#BE944E] transition p-1 cursor-pointer"
              aria-label="Next story"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================= */}
        {/* INTERACTIVE LIGHTBOX & ZOOM MODAL (PHÓNG TO NHỎ ẢNH) */}
        {/* ============================================================= */}
        <AnimatePresence>
          {zoomModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#1A1918] border border-[#BE944E]/40 rounded-3xl p-5 sm:p-7 max-w-3xl w-full text-white shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#BE944E]/20 text-[#DDB866] text-[11px] font-bold">
                        {currentShowcase.badgeLabel}
                      </span>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                        {currentShowcase.title}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {currentShowcase.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setZoomModalOpen(false);
                      setZoomLevel(1);
                    }}
                    className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    aria-label="Đóng"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Zoom Viewport */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black/60 rounded-2xl overflow-hidden mt-4 flex items-center justify-center border border-stone-800/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    src={currentShowcase.image}
                    alt={currentShowcase.title}
                    animate={{ scale: zoomLevel }}
                    transition={{ type: "spring", damping: 20 }}
                    className="max-h-full max-w-full object-contain rounded-lg select-none"
                  />

                  {/* Zoom Controls Bar Overlaid on Image */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-stone-700/80 text-white text-xs shadow-xl">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.25))}
                      className="p-1.5 rounded-full hover:bg-stone-700 transition cursor-pointer"
                      title="Thu nhỏ"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>

                    <span className="text-[11px] font-mono font-bold text-amber-300 px-1 min-w-[40px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>

                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.25))}
                      className="p-1.5 rounded-full hover:bg-stone-700 transition cursor-pointer"
                      title="Phóng to"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    <span className="w-[1px] h-3 bg-stone-700 mx-0.5" />

                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="text-[10px] uppercase font-bold text-stone-400 hover:text-white px-2 py-0.5 rounded transition cursor-pointer"
                    >
                      Mặc định
                    </button>
                  </div>
                </div>

                {/* Quick Picker at bottom of modal */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {SHOWCASE_ITEMS.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleSelectShowcase(idx);
                          setZoomLevel(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                          showcaseIdx === idx
                            ? "bg-[#BE944E] text-white font-bold"
                            : "bg-stone-800 hover:bg-stone-700 text-stone-300"
                        }`}
                      >
                        {item.badgeLabel}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setZoomModalOpen(false);
                      setZoomLevel(1);
                    }}
                    className="px-4 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. SECTION: AUDIO EQUALIZER & MUSIC STUDIO (IVORY LUXURY THEME) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:px-10 lg:px-16">
        {/* Hidden Real HTML5 Audio Element */}
        <audio
          ref={audioRef}
          src={activeTrack.audioSrc}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioLoadedMetadata}
          onEnded={handleAudioEnded}
          preload="metadata"
        />

        <div className="bg-[#FAF7F2]/95 backdrop-blur-md rounded-[36px] sm:rounded-[44px] p-6 sm:p-10 lg:p-12 border border-[#EAE1D3] shadow-[0_20px_50px_rgba(190,148,78,0.12)] relative overflow-hidden">
          {/* Ambient Background Glows & Sparkles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#BE944E]/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FAF0E1]/80 rounded-full blur-3xl pointer-events-none -z-10" />
          <span className="absolute top-8 left-10 text-[#DDB866] text-xs animate-pulse select-none">✦</span>
          <span className="absolute top-1/2 left-6 text-[#DDB866] text-sm animate-pulse select-none">✦</span>

          {/* MAIN 2-COLUMN PLAYER GRID */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* CỘT TRÁI: ĐĨA VINYL XOAY 360, INFO BÀI HÁT & CONTROLS BAR */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              {/* TOP: VINYL + ACTIVE SONG INFO */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* ĐĨA VINYL 360 VỚI CÀNH LÁ VÀNG TRANG TRÍ */}
                <div className="relative shrink-0">
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-stone-900 via-stone-800 to-black p-2.5 border-[3px] border-stone-800 shadow-[0_15px_35px_rgba(0,0,0,0.25)] flex items-center justify-center relative select-none"
                  >
                    {/* Concentric Vinyl Grooves */}
                    <div className="w-full h-full rounded-full border border-stone-700/60 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border border-stone-600/40 flex items-center justify-center">
                        {/* Center Gold Medallion with Music Icon */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#B68837] to-[#E2BC6A] flex items-center justify-center shadow-inner border border-amber-200/50">
                          <Music className="w-5 h-5 text-white drop-shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Golden Botanical Leaf Accent on Vinyl Corner */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 pointer-events-none opacity-85">
                    <svg viewBox="0 0 50 50" className="w-full h-full fill-[#BE944E]/30 stroke-[#BE944E]">
                      <path d="M10,40 Q25,20 45,10 Q35,30 10,40 Z" strokeWidth="1" />
                      <path d="M20,30 Q35,25 45,10" strokeWidth="0.75" strokeDasharray="1 1" fill="none" />
                      <path d="M15,45 Q20,32 30,30 Q22,42 15,45 Z" strokeWidth="0.8" />
                    </svg>
                  </div>
                </div>

                {/* ACTIVE SONG INFO */}
                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF3E8] text-[#BE944E] text-[10px] font-bold border border-[#EAE0CD]">
                    <span className={`w-1.5 h-1.5 rounded-full bg-[#BE944E] ${isPlaying ? "animate-ping" : ""}`} />
                    {t("homeMusicNowPlaying")}
                  </span>

                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight truncate mt-1">
                    {activeTrack.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    {activeTrack.artist} • {activeTrack.duration}
                  </p>

                  {/* SÓNG ÂM EQUALIZER ANIMATION (12 BARS GOLD) */}
                  <div className="flex items-end gap-1 h-6 pt-2 justify-center sm:justify-start">
                    {[10, 22, 14, 26, 18, 12, 24, 16, 20, 14, 22, 10].map((height, i) => (
                      <motion.span
                        key={i}
                        animate={isPlaying ? { height: [height * 0.35, height, height * 0.3] } : { height: 4 }}
                        transition={{ duration: 0.5 + (i % 4) * 0.15, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1 rounded-full bg-[#C4974E]"
                        style={{ minHeight: "3px" }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CONTROLS BUTTONS BAR (SHUFFLE, PREV, PLAY/PAUSE, NEXT, REPEAT) */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                    isShuffle ? "bg-[#BE944E] text-white shadow-xs" : "bg-[#FAF5EE] hover:bg-[#F2ECE0] text-stone-600 border border-[#EAE0CD]"
                  }`}
                  title="Xáo trộn bài hát"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handlePrevTrack}
                  className="w-9 h-9 rounded-full bg-[#FAF5EE] hover:bg-[#F2ECE0] text-stone-700 border border-[#EAE0CD] flex items-center justify-center transition cursor-pointer"
                  title="Bài trước"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* PLAY / PAUSE BUTTON */}
                <button
                  type="button"
                  onClick={togglePlayMusic}
                  aria-label="Toggle playback"
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#B68837] via-[#D8B062] to-[#A2772A] text-white flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 fill-white" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  className="w-9 h-9 rounded-full bg-[#FAF5EE] hover:bg-[#F2ECE0] text-stone-700 border border-[#EAE0CD] flex items-center justify-center transition cursor-pointer"
                  title="Bài tiếp theo"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                    isRepeat ? "bg-[#BE944E] text-white shadow-xs" : "bg-[#FAF5EE] hover:bg-[#F2ECE0] text-stone-600 border border-[#EAE0CD]"
                  }`}
                  title="Lặp lại bài hát"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* SEEKBAR PROGRESS LINE */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400">
                <span>{formatAudioTime(currentTime)}</span>
                <div
                  className="flex-1 h-2 rounded-full bg-stone-200 relative cursor-pointer overflow-hidden group"
                  onClick={handleSeek}
                  title="Tua bài hát"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#B68837] to-[#D8B062] rounded-full relative transition-[width] duration-100"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span>{formatAudioTime(duration || 177)}</span>
              </div>
            </div>

            {/* CỘT PHẢI: HEADER & LƯỚI 4 THẺ BÀI HÁT */}
            <div className="lg:col-span-7 space-y-4">
              {/* HEADER: TITLE + MASTER TOGGLE */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                    <span>{t("homeMusicTitle")}</span>
                    <span className="text-[#DDB866] text-xl not-italic">✦</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md leading-relaxed">
                    {t("homeMusicSub")}
                  </p>
                </div>

                {/* Top-Right Master Pause/Play Indicator */}
                <button
                  type="button"
                  onClick={togglePlayMusic}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#B68837] via-[#D8B062] to-[#A2772A] text-white flex items-center justify-center shadow-md hover:scale-105 transition shrink-0 cursor-pointer"
                  title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  )}
                </button>
              </div>

              {/* 2X2 TRACKS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {WEDDING_TRACKS.map((track, idx) => {
                  const isActive = activeTrack.id === track.id;
                  const stepNum = String(idx + 1).padStart(2, "0");
                  return (
                    <motion.div
                      key={track.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectTrack(track)}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative shadow-2xs ${
                        isActive
                          ? "bg-white/98 border-2 border-[#BE944E] ring-2 ring-[#BE944E]/20 shadow-md"
                          : "bg-white/80 hover:bg-white border-[#EFE8DC] hover:border-[#BE944E]/50 hover:shadow-xs"
                      }`}
                    >
                      {/* Left: Thumbnail & Play Indicator */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden relative shrink-0 border border-stone-200/80 shadow-2xs group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.cover}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-[#BE944E] flex items-center justify-center text-white shadow-sm">
                              {isPlaying ? (
                                <Pause className="w-3 h-3 fill-white" />
                              ) : (
                                <Play className="w-3 h-3 ml-0.5 fill-white" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Center: Track Title & Artist */}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 block truncate">
                          {track.title}
                        </span>
                        <span className="text-[11px] text-stone-500 block truncate mt-0.5">
                          {track.artist}
                        </span>

                        {/* Mini Sound Wave Bars */}
                        <div className="flex items-end gap-0.5 h-3 pt-1">
                          {[6, 12, 8, 14, 7].map((barH, bIdx) => (
                            <span
                              key={bIdx}
                              className={`w-0.5 rounded-full transition-all ${
                                isActive && isPlaying ? "bg-[#BE944E]" : "bg-stone-300"
                              }`}
                              style={{ height: isActive && isPlaying ? `${barH}px` : "3px" }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Right: Step Number Badge & Duration */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        <span className="text-[#C4974E] font-mono font-bold text-[10px] bg-[#FAF5EE] px-1.5 py-0.5 rounded-full border border-[#EAE0CD]/60">
                          {stepNum}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400">
                          {track.duration}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM 4 TRUST PILLARS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10 pt-8 border-t border-[#EFE8DC]/90">
            {/* Pillar 1: Giai điệu lãng mạn */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
                <Heart className="w-5 h-5 text-[#C4974E] fill-[#C4974E]/20" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                  {t("homeMusicPillar1Title")}
                </h5>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  {t("homeMusicPillar1Desc")}
                </p>
              </div>
            </div>

            {/* Pillar 2: Không gian tinh tế */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5 text-[#C4974E]" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                  {t("homeMusicPillar2Title")}
                </h5>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  {t("homeMusicPillar2Desc")}
                </p>
              </div>
            </div>

            {/* Pillar 3: Chất lượng cao */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
                <Headphones className="w-5 h-5 text-[#C4974E]" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                  {t("homeMusicPillar3Title")}
                </h5>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  {t("homeMusicPillar3Desc")}
                </p>
              </div>
            </div>

            {/* Pillar 4: Dành riêng cho bạn */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
                <Gift className="w-5 h-5 text-[#C4974E]" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                  {t("homeMusicPillar4Title")}
                </h5>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  {t("homeMusicPillar4Desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ------------------------------------------------------------- */}
      {/* 8. 3D COVERFLOW CAROUSEL (MẪU THIỆP ĐẸP NHẤT) */}
      {/* ------------------------------------------------------------- */}
      <section 
        className="relative max-w-7xl mx-auto px-6 py-20 text-center overflow-hidden"
        onMouseEnter={() => setIsCarouselHovered(true)}
        onMouseLeave={() => setIsCarouselHovered(false)}
      >
        {/* Background Ambient Glows & Sparkles */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-1/4 w-96 h-96 bg-[#BE944E]/20 rounded-full blur-3xl pointer-events-none -z-10" 
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#FAF0E1]/90 rounded-full blur-3xl pointer-events-none -z-10" 
        />
        
        {/* Floating Sparkles with gentle floating motion */}
        <motion.span 
          animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4], rotate: [0, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 left-12 text-[#DDB866] text-base select-none pointer-events-none"
        >
          ✦
        </motion.span>
        <motion.span 
          animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5], rotate: [0, -20, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-20 right-16 text-[#DDB866] text-lg select-none pointer-events-none"
        >
          ✦
        </motion.span>
        <motion.span 
          animate={{ y: [0, -6, 0], opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-24 left-16 text-[#DDB866] text-sm select-none pointer-events-none"
        >
          ✦
        </motion.span>
        <motion.span 
          animate={{ y: [0, -10, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-28 right-24 text-[#C4974E] text-xs select-none pointer-events-none"
        >
          ✨
        </motion.span>

        {/* Botanical Foliage Corner Accents */}
        <motion.div 
          animate={{ rotate: [0, 3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-4 right-2 w-48 h-48 pointer-events-none opacity-35 -z-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#BE944E]/20 stroke-[#BE944E]">
            <path d="M10,90 Q40,50 85,20 Q65,70 10,90 Z" strokeWidth="1" />
            <path d="M40,65 Q60,50 90,30" strokeWidth="0.75" strokeDasharray="2 2" fill="none" />
            <circle cx="85" cy="20" r="4" fill="#DDB866" />
            <circle cx="70" cy="40" r="3" fill="#DDB866" />
          </svg>
        </motion.div>

        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-12 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#181716] tracking-tight leading-tight">
            <span>{t("homeCarouselTitle1")}</span>{" "}
            <span className="italic font-normal font-serif text-[#C4974E] inline-flex items-center gap-2">
              <span>{t("homeCarouselTitleEm")}</span>
              <motion.span 
                animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl sm:text-3xl not-italic text-[#DDB866] inline-block"
              >
                ✦
              </motion.span>
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600/85 mt-3 max-w-xl mx-auto leading-relaxed">
            {t("homeCarouselSub")}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-[#BE944E]/70 text-xs">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ♥
            </motion.span>
          </div>
        </motion.div>

        {/* TABS LỌC DANH MỤC THIỆP MẪU */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar px-2 py-1 max-w-xl mx-auto">
          {[
            { id: "ALL", label: "Tất Cả Mẫu" },
            { id: "WEDDING", label: "Thiệp Cưới Hoàng Gia" },
            { id: "BIRTHDAY", label: "Sinh Nhật" },
            { id: "NEWBORN", label: "Thôi Nôi & Đầy Tháng" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTemplateTab(tab.id as any);
                setCarouselIndex(0);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeTemplateTab === tab.id
                  ? "bg-gradient-to-r from-[#8C6424] to-[#6E4E18] text-white shadow-md scale-102 ring-2 ring-[#BE944E]/30"
                  : "bg-white/80 hover:bg-white text-stone-700 border border-stone-200/80 hover:border-[#BE944E]/40 shadow-2xs"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MOBILE VIEW: TOUCH-FRIENDLY HORIZONTAL SNAP CAROUSEL (DỄ DÙNG 100% TRÊN ĐIỆN THOẠI) */}
        {/* ------------------------------------------------------------- */}
        <div className="block md:hidden w-full px-2 py-2">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-1 px-4 -mx-6">
            {displayedTemplates.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedModalTemplate(card)}
                className="w-[78vw] max-w-[285px] shrink-0 snap-center rounded-[26px] p-3 bg-gradient-to-b from-[#FFFDF8] via-[#FAF5EC] to-[#F3EAD9] border border-[#E7D6BE] shadow-[0_10px_25px_rgba(180,140,70,0.12)] flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-transform text-left"
              >
                {/* Card Image Container */}
                <div className="relative w-full aspect-[9/13.5] rounded-[20px] overflow-hidden bg-stone-100 shadow-inner mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    {card.isNew ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 border border-white/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Mới</span>
                      </span>
                    ) : <span />}
                    <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-white text-[9px] font-semibold tracking-wider uppercase border border-white/20">
                      {card.category === "WEDDING" ? "Cưới" : card.category === "BIRTHDAY" ? "Sinh Nhật" : "Thôi Nôi"}
                    </span>
                  </div>

                  {/* Couple / Host overlay */}
                  {card.coupleText && (
                    <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-amber-200 truncate">
                        {card.coupleText}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Info & Mobile Action Buttons */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-1">
                    <h3 className="font-serif font-bold text-sm text-[#2A231C] truncate">{card.name}</h3>
                    <span className="font-serif font-bold text-[#BE944E] text-xs shrink-0">{card.price}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">{card.style}</p>

                  {/* NÚT THAO TÁC RÕ RÀNG TRÊN ĐIỆN THOẠI */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#EFE5D5]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalTemplate(card);
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-white border border-[#D9C4A1] text-stone-900 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 active:bg-stone-50 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>Xem Mẫu</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user) {
                          router.push(`/dashboard/cards/new?category=${card.category}&template=${card.slug}`);
                        } else {
                          openAuthModal("login");
                        }
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#9E7329] text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 active:opacity-90 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dùng Mẫu</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-stone-400 mt-2 flex items-center justify-center gap-1 font-medium">
            <span>←</span> <span>Vuốt sang ngang hoặc chạm vào thẻ để xem chi tiết</span> <span>→</span>
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DESKTOP VIEW: 3D COVERFLOW CONTAINER VỚI TEMPLATE DETAILS */}
        {/* ------------------------------------------------------------- */}
        <div 
          className="hidden md:flex relative py-6 max-w-6xl mx-auto items-center justify-center min-h-[480px] sm:min-h-[550px] select-none cursor-grab active:cursor-grabbing overflow-visible"
          style={{ perspective: "1400px", touchAction: "pan-y" }}
          onMouseMove={(e) => {
            if (displayedTemplates.length === 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relativeX = (e.clientX - rect.left) / rect.width; // 0 to 1
            const clamped = Math.max(0, Math.min(1, relativeX));
            const targetIdx = Math.min(
              displayedTemplates.length - 1,
              Math.max(0, Math.floor(clamped * displayedTemplates.length))
            );
            if (targetIdx !== carouselIndex) {
              setCarouselIndex(targetIdx);
            }
          }}
        >
          {/* Ambient Spotlight Behind Center Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] h-[500px] bg-radial from-[#F5D899]/40 via-[#E8C576]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* CARDS IN CONTINUOUS 3D COVERFLOW SPACE */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {displayedTemplates.map((card, idx) => {
              const offset = idx - carouselIndex;
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

              // X position relative to center
              let xPos = 0;
              if (offset === -1) xPos = -225;
              else if (offset === 1) xPos = 225;
              else if (offset === -2) xPos = -410;
              else if (offset === 2) xPos = 410;
              else if (offset < -2) xPos = -560;
              else if (offset > 2) xPos = 560;

              const scaleVal = isCenter ? 1.05 : absOffset === 1 ? 0.91 : absOffset === 2 ? 0.78 : 0.65;
              const rotateYVal = isCenter ? 0 : offset < 0 ? 26 : -26;
              const zIndexVal = 30 - absOffset * 6;
              const opacityVal = absOffset > 2 ? 0 : isCenter ? 1 : absOffset === 1 ? 0.88 : 0.45;
              const pointerEvents = absOffset > 2 ? "none" : "auto";

              return (
                <motion.div
                  key={card.id}
                  onClick={() => {
                    if (isCenter) {
                      setSelectedModalTemplate(card);
                    } else {
                      setCarouselIndex(idx);
                    }
                  }}
                  onMouseEnter={() => setCarouselIndex(idx)}
                  animate={{
                    x: xPos,
                    scale: scaleVal,
                    rotateY: rotateYVal,
                    opacity: opacityVal,
                    zIndex: zIndexVal,
                    y: isCenter ? 0 : 8,
                  }}
                  whileHover={{ 
                    y: isCenter ? -6 : 0,
                    scale: isCenter ? 1.07 : scaleVal * 1.03,
                    opacity: 1,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 24,
                    mass: 0.7
                  }}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer shrink-0 transition-shadow ${
                    isCenter
                      ? "w-60 sm:w-72 lg:w-[315px] aspect-[9/13.5] rounded-[32px] sm:rounded-[38px] border-[3px] border-[#E5C175] ring-4 ring-[#BE944E]/30 shadow-[0_25px_65px_rgba(190,148,78,0.45)] overflow-hidden"
                      : absOffset === 1
                      ? "w-52 sm:w-60 lg:w-68 aspect-[9/13.5] rounded-[26px] sm:rounded-[32px] border border-[#EFE8DC] shadow-xl overflow-hidden"
                      : "hidden md:block w-40 sm:w-48 lg:w-56 aspect-[9/13.5] rounded-[22px] sm:rounded-[26px] border border-stone-200 shadow-md blur-[0.5px] overflow-hidden"
                  }`}
                  style={{ 
                    transformStyle: "preserve-3d",
                    pointerEvents: pointerEvents as any,
                  }}
                >
                  {/* Active Floating Breathing Wrapper */}
                  <motion.div
                    animate={isCenter ? { y: [-3, 3, -3] } : { y: 0 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full h-full p-4 sm:p-5 flex flex-col justify-between text-center overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-white group"
                  >
                    {/* Background Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />

                    {/* Shimmer Light Sweep on Center Card */}
                    {isCenter && (
                      <motion.div
                        animate={{ x: ["-150%", "200%"] }}
                        transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none z-15"
                      />
                    )}

                    {/* Gradient Overlays for High Contrast Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/35 pointer-events-none" />

                    {/* Top Header Tag */}
                    <div className="relative z-10 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-white/90 font-medium drop-shadow-sm flex items-center justify-center gap-1.5">
                      <span>{card.category === "WEDDING" ? "THE WEDDING OF" : "CARDVITE EXCLUSIVE"}</span>
                    </div>

                    {/* Bottom Card Content */}
                    <div className="relative z-10 space-y-1 sm:space-y-1.5 text-white">
                      {/* Tag Badge */}
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="inline-block px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white mb-1 shadow-sm"
                      >
                        {card.tags?.[0] || card.style}
                      </motion.span>

                      {/* Card Title */}
                      <h4 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                        {card.name}
                      </h4>

                      {/* Couple Names */}
                      <p className="text-xs sm:text-sm font-serif italic text-amber-200/95 drop-shadow-sm">
                        {card.coupleText || card.style}
                      </p>

                      {/* Center Card CTA Buttons */}
                      {isCenter ? (
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModalTemplate(card);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-stone-900 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>Xem Thử</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (user) {
                                router.push(`/dashboard/cards/new?category=${card.category}&template=${card.slug}`);
                              } else {
                                openAuthModal("login");
                              }
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Dùng Mẫu</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center pt-1 text-white/60 text-xs">
                          <span>♥</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* DESKTOP CONTROLS & PAGINATION */}
        <div className="hidden md:flex flex-col items-center justify-center gap-3 mt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-2xs hover:border-[#BE944E] text-stone-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-stone-500 font-medium select-none">
              Rê chuột hoặc chọn thẻ để khám phá các mẫu thiệp độc bản
            </p>
            <button
              type="button"
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-2xs hover:border-[#BE944E] text-stone-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* DOTS PAGINATION */}
          <div className="flex items-center justify-center gap-2">
            {displayedTemplates.map((_, idx) => {
              const isActive = carouselIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden flex items-center"
                  style={{ width: isActive ? "28px" : "8px" }}
                >
                  <div 
                    className={`w-full h-full rounded-full transition-colors duration-300 ${
                      isActive ? "bg-[#BE944E] shadow-sm" : "bg-stone-300 hover:bg-stone-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* NÚT XEM TẤT CẢ MẪU THIỆP */}
        <div className="mt-8">
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[#D9C4A1] bg-white/95 hover:bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider text-[#8C6424] shadow-md hover:shadow-lg transition"
            >
              <Sparkles className="w-4 h-4 text-[#BE944E]" />
              <span>{t("homeViewAllTemplates") || "Khám Phá Toàn Bộ 100+ Mẫu Thiệp"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#BE944E]" />
            </Link>
          </motion.div>
        </div>

        {/* 4 FEATURE TRUST PILLARS BAR (MẪU THIỆP) */}
        <div className="bg-white/90 backdrop-blur-md rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-[#EFE8DC] shadow-xs mt-12 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Pillar 1: Thiết kế tinh tế */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <Gem className="w-5 h-5 text-[#C4974E]" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeCarouselPillar1Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeCarouselPillar1Desc")}
              </p>
            </div>
          </div>

          {/* Pillar 2: Dễ dàng tùy chỉnh */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <Palette className="w-5 h-5 text-[#C4974E]" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeCarouselPillar2Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeCarouselPillar2Desc")}
              </p>
            </div>
          </div>

          {/* Pillar 3: Tối ưu mọi thiết bị */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <Smartphone className="w-5 h-5 text-[#C4974E]" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeCarouselPillar3Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeCarouselPillar3Desc")}
              </p>
            </div>
          </div>

          {/* Pillar 4: Lưu giữ khoảnh khắc */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center shrink-0 shadow-2xs">
              <Heart className="w-5 h-5 text-[#C4974E] fill-[#C4974E]/20" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                {t("homeCarouselPillar4Title")}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {t("homeCarouselPillar4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. SECTION: BỨC TƯỜNG LỜI CHÚC FLOATING WISHES (AUTO MARQUEE) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:px-12 lg:px-20 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#BE944E]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716] tracking-tight">
            {t("homeWishesTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600/85 mt-2.5 leading-relaxed">
            {t("homeWishesSub")}
          </p>
        </motion.div>

        {/* DẢI LỜI CHÚC TRÔI TỰ ĐỘNG DẠNG MARQUEE 1 (TRÁI SANG PHẢI) */}
        <div className="space-y-4 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            whileHover={{ transition: { duration: 0 } }}
            className="flex gap-4 w-max py-2"
          >
            {[...wishesList, ...wishesList, ...wishesList].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[#EFE9E1] shadow-2xs hover:shadow-lg hover:border-[#BE944E]/50 shrink-0 w-72 sm:w-80 flex flex-col justify-between cursor-pointer group"
              >
                <p className="text-xs text-stone-700 leading-relaxed font-medium group-hover:text-stone-900 transition">
                  &ldquo;{item.wish}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-[10px]">
                  <span className="font-bold text-[#BE944E] flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-[#BE944E]" />
                    <span>{item.name} • {item.relation}</span>
                  </span>
                  <span className="text-stone-400">{item.time}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* DẢI LỜI CHÚC TRÔI TỰ ĐỘNG DẠNG MARQUEE 2 (PHẢI SANG TRÁI) */}
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 w-max py-2"
          >
            {[...SAMPLE_WISHES_2, ...SAMPLE_WISHES_2, ...SAMPLE_WISHES_2].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[#EFE9E1] shadow-2xs hover:shadow-lg hover:border-[#BE944E]/50 shrink-0 w-72 sm:w-80 flex flex-col justify-between cursor-pointer group"
              >
                <p className="text-xs text-stone-700 leading-relaxed font-medium group-hover:text-stone-900 transition">
                  &ldquo;{item.wish}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-[10px]">
                  <span className="font-bold text-[#BE944E] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#BE944E]" />
                    <span>{item.name} • {item.relation}</span>
                  </span>
                  <span className="text-stone-400">{item.time}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* FORM THỬ GỬI LỜI CHÚC */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mt-10"
        >
          <form onSubmit={handleSendTrialWish} className="flex gap-2 bg-white/90 p-2 rounded-2xl border border-[#E8E2D8] shadow-sm">
            <input
              type="text"
              value={userWish}
              onChange={(e) => setUserWish(e.target.value)}
              placeholder={t("homeWishInputPlaceholder")}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-transparent focus:outline-none text-stone-800 font-medium"
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{t("homeSendWishBtn")}</span>
            </motion.button>
          </form>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. SECTION: VIETQR BOX MỪNG CƯỚI SIMULATOR */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#FAF7F2] via-[#FAF4EA] to-[#F0EAE1] rounded-[36px] p-8 sm:p-12 border border-[#EFE9E1] shadow-[0_20px_50px_rgba(190,148,78,0.1)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#BE944E]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* CỘT TRÁI: THÔNG TIN & CHỌN MỨC TIỀN */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8ECE5] text-[#556353] text-[10px] font-bold uppercase tracking-widest border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>VIETQR NAPAS247 INTEGRATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716] tracking-tight">
              {t("homeQrTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-[#181716]/65 leading-relaxed">
              {t("homeQrSub")}
            </p>

            {/* CHỌN SỐ TIỀN */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-stone-600 block">
                {t("homeQrSelectAmount")}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {["200.000đ", "500.000đ", "1.000.000đ", "2.000.000đ"].map((amt) => (
                  <motion.button
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    key={amt}
                    type="button"
                    onClick={() => {
                      setQrAmount(amt);
                      setQrSuccess(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      qrAmount === amt
                        ? "bg-[#7D6331] text-white border-[#7D6331] shadow-md ring-2 ring-[#BE944E]/30"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-[#BE944E]/40"
                    }`}
                  >
                    {amt}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSimulatePayment}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-black hover:to-stone-800 text-white text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2.5 cursor-pointer transition-all"
              >
                <QrCode className="w-4 h-4 text-[#DDB866]" />
                <span>MÔ PHỎNG QUÉT MÃ MỪNG CƯỚI</span>
              </motion.button>
            </div>

            {qrSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-md"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
                <span>{t("homeQrSuccessToast")}</span>
              </motion.div>
            )}
          </div>

          {/* CỘT PHẢI: THẺ QR BANKING NỔI BẬT */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-72 sm:w-80 bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D8] shadow-2xl text-center space-y-3.5 relative group"
            >
              {/* Header Ngân Hàng */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#BE944E]">
                  MỪNG CƯỚI VIETQR
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Vietcombank
                </span>
              </div>

              {/* KHUNG HIỂN THỊ MÃ QR THẬT CỦA BẠN */}
              <div className="w-48 h-48 mx-auto bg-[#FDFBF7] rounded-2xl p-2 border-2 border-[#E8E2D8] flex items-center justify-center relative overflow-hidden group-hover:border-[#BE944E]/80 transition shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/vietqr-tran-hoai-bao.png"
                  alt="VietQR Vietcombank TRAN HOAI BAO"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                />
              </div>

              {/* THÔNG TIN CHỦ TÀI KHOẢN */}
              <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70 text-left space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 text-[11px]">Chủ tài khoản:</span>
                  <span className="font-bold text-stone-900">TRAN HOAI BAO</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 text-[11px]">Số tài khoản:</span>
                  <span className="font-mono font-bold text-emerald-800 tracking-wider">1034829596</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-stone-200/50">
                  <span className="text-stone-500 text-[11px]">Mừng chúc:</span>
                  <span className="font-bold text-[#BE944E]">{qrAmount}</span>
                </div>
              </div>

              <p className="text-[10px] text-stone-500 leading-tight">
                {t("homeQrScanHint")}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. SECTION: 3 BƯỚC TẠO THIỆP (INTERACTIVE STEPS) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:px-12 lg:px-20 relative">
        {/* TOP STATS FEATURE ROW */}
        <div className="flex flex-wrap items-center justify-end gap-6 sm:gap-10 mb-10 text-stone-700 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800">10 phút</div>
              <div className="text-[11px] text-stone-500">Siêu nhanh</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800">100+ mẫu</div>
              <div className="text-[11px] text-stone-500">Đẹp & đa dạng</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-800">Tối ưu</div>
              <div className="text-[11px] text-stone-500">Mọi thiết bị</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* CỘT TRÁI: TIÊU ĐỀ & 3 BƯỚC CÓ THỂ CLICK CHUYỂN TRẠNG THÁI */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-7"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-bold text-[#181716] tracking-tight leading-[1.15]">
                <span>{t("homeStepsTitle1")}</span> <br />
                <span className="italic font-normal font-serif text-[#C4974E] inline-flex items-center gap-2">
                  <span>{t("homeStepsTitleEm")}</span>
                  <span className="not-italic text-2xl sm:text-3xl font-light text-[#C4974E]/80">♡</span>
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-2 font-medium">
                Đơn giản – Nhanh chóng – Đẹp tinh tế
              </p>
            </div>

            {/* 3 STEPS INTERACTIVE TABS */}
            <div className="space-y-3.5 max-w-lg">
              {/* STEP 1 */}
              <motion.div
                onClick={() => setActiveStep(1)}
                whileHover={{ x: 4, scale: 1.01 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  activeStep === 1
                    ? "bg-white border-[#E5C175] shadow-[0_6px_24px_rgba(190,148,78,0.14)] ring-1 ring-[#BE944E]/30"
                    : "bg-white/70 border-[#EFE9E1] hover:bg-white"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                    activeStep === 1
                      ? "bg-gradient-to-br from-[#BE944E] to-[#9C7636] text-white border-[#BE944E] shadow-xs"
                      : "bg-[#FAF2E4] text-[#8C6424] border-[#E8DBD0]"
                  }`}
                >
                  1
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#181716]">
                    {t("homeStep1Title")}
                  </h3>
                  <p className="text-xs text-stone-500 leading-snug">
                    {t("homeStep1Desc")}
                  </p>
                </div>
              </motion.div>

              {/* STEP 2 */}
              <motion.div
                onClick={() => setActiveStep(2)}
                whileHover={{ x: 4, scale: 1.01 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  activeStep === 2
                    ? "bg-white border-[#E5C175] shadow-[0_6px_24px_rgba(190,148,78,0.14)] ring-1 ring-[#BE944E]/30"
                    : "bg-white/70 border-[#EFE9E1] hover:bg-white"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                    activeStep === 2
                      ? "bg-gradient-to-br from-[#BE944E] to-[#9C7636] text-white border-[#BE944E] shadow-xs"
                      : "bg-[#EAE5DE] text-[#6E645A] border-[#E2DBD0]"
                  }`}
                >
                  2
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E] shrink-0">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#181716]">
                    {t("homeStep2Title")}
                  </h3>
                  <p className="text-xs text-stone-500 leading-snug">
                    {t("homeStep2Desc")}
                  </p>
                </div>
              </motion.div>

              {/* STEP 3 */}
              <motion.div
                onClick={() => setActiveStep(3)}
                whileHover={{ x: 4, scale: 1.01 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  activeStep === 3
                    ? "bg-white border-[#E5C175] shadow-[0_6px_24px_rgba(190,148,78,0.14)] ring-1 ring-[#BE944E]/30"
                    : "bg-white/70 border-[#EFE9E1] hover:bg-white"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                    activeStep === 3
                      ? "bg-gradient-to-br from-[#BE944E] to-[#9C7636] text-white border-[#BE944E] shadow-xs"
                      : "bg-[#EAE5DE] text-[#6E645A] border-[#E2DBD0]"
                  }`}
                >
                  3
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EAE0CD] flex items-center justify-center text-[#BE944E] shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#181716]">
                    {t("homeStep3Title")}
                  </h3>
                  <p className="text-xs text-stone-500 leading-snug">
                    {t("homeStep3Desc")}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CTA BUTTON & SUB-NOTE */}
            <div className="pt-2">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Link
                  href="/dashboard/cards/new"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-[0_8px_25px_rgba(190,148,78,0.38)] transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{t("homeStepsBtn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-3 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#BE944E]" />
                <span>Không cần đăng ký • Hoàn toàn miễn phí</span>
              </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI: GIAO DIỆN THIỆP HOA THỦY MẶC ARCH SANG TRỌNG (NHƯ ẢNH 1) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-[36px] sm:rounded-[42px] p-2.5 sm:p-3 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.12)] border border-[#EFE8DC]"
            >
              {/* CARD FRAME */}
              <div className="relative w-full aspect-[9/13.8] rounded-[28px] sm:rounded-[34px] overflow-hidden bg-[#F4F7F3] flex flex-col items-center justify-between p-6 sm:p-7 text-center shadow-inner">
                {/* Background Watercolor Floral Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/wedding_card_sample.jpg"
                  alt="Mẫu thiệp hoa thủy mặc sang trọng"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 transition-transform duration-700 hover:scale-105"
                />

                {/* Soft Ivory Tint for High Contrast Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/65 to-[#FAF8F5]/90 pointer-events-none" />

                {/* Gold Arch Decorative Inner Border */}
                <div className="absolute inset-3 sm:inset-4 rounded-[22px] sm:rounded-[26px] border border-[#C4974E]/40 pointer-events-none" />

                {/* Top Label */}
                <div className="relative z-10 pt-2 sm:pt-3">
                  <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.25em] text-stone-700 uppercase">
                    LỄ THÀNH HÔN
                  </span>
                </div>

                {/* Couple Names in Romantic Italic Calligraphy */}
                <div className="relative z-10 my-auto py-2">
                  <h3 className="font-serif italic text-2xl sm:text-3xl text-[#1E3A2B] font-normal leading-tight">
                    Minh Khoa
                  </h3>
                  <div className="font-serif italic text-lg sm:text-xl text-[#1E3A2B] my-0.5">
                    &
                  </div>
                  <h3 className="font-serif italic text-2xl sm:text-3xl text-[#1E3A2B] font-normal leading-tight">
                    Thu Hương
                  </h3>

                  {/* Wedding Date */}
                  <div className="font-serif font-bold text-[#C4974E] text-base sm:text-lg tracking-[0.18em] mt-3">
                    20 . 06 . 2025
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.18em] text-stone-500 uppercase mt-0.5">
                    17:00 | THỨ SÁU
                  </div>

                  {/* Location */}
                  <div className="mt-3.5">
                    <div className="text-xs sm:text-[13px] font-sans font-bold tracking-wider text-stone-800 uppercase">
                      GEM CENTER
                    </div>
                    <div className="text-[9.5px] sm:text-[10.5px] text-stone-500 mt-0.5 font-sans">
                      08 Nguyễn Bỉnh Khiêm, Q.1, TP. HCM
                    </div>
                  </div>
                </div>

                {/* Action Button on the Card */}
                <div className="relative z-10 pb-1 sm:pb-2">
                  <Link
                    href="/collections"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#132317] hover:bg-[#1E3A2B] text-white text-[11px] sm:text-xs font-semibold shadow-md hover:scale-105 transition"
                  >
                    <span>Xem thiệp mẫu</span>
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* 3 PAGINATION DOTS (CENTER ONE ACTIVE GOLD) */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <span className="w-3 h-3 rounded-full bg-[#BE944E] shadow-xs" />
              <span className="w-2 h-2 rounded-full bg-stone-300" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 12. SECTION: TRẢI NGHIỆM THƯỢNG LƯU SỐ (BENTO GRID CÓ HOVER) */}
      {/* ------------------------------------------------------------- */}
      <section id="custom" className="max-w-6xl mx-auto px-6 py-20 md:px-12 lg:px-20 relative">
        {/* HEADER SECTION WITH BOTANICAL ORNAMENT */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          {/* Top Leaf & Heart Ornament */}
          <div className="flex items-center justify-center gap-2.5 text-[#C4974E] mb-3 select-none">
            <span className="text-sm">🌿</span>
            <span className="text-xs">♥</span>
            <span className="text-sm scale-x-[-1] inline-block">🌿</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#181716] tracking-tight leading-tight">
            <span>{t("homeSectionExperienceTitle") || "Trải Nghiệm"}</span>{" "}
            <span className="italic font-normal font-serif text-[#C4974E]">
              {t("homeSectionExperienceEm") || "Thượng Lưu Số"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600/90 mt-3 leading-relaxed max-w-xl mx-auto">
            {t("homeSectionExperienceSub") ||
              "Kết hợp nghệ thuật thiệp giấy truyền thống với công nghệ hiện đại, mang đến trải nghiệm hoàn hảo cho ngày trọng đại."}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-[#BE944E]/70 text-xs">
            <span>♥</span>
          </div>
        </motion.div>

        {/* BENTO GRID EXACT 3 TIERS VỚI MOTION HOVER */}
        <div className="space-y-5">
          {/* HÀNG 1: THIỆP GỬI ĐÍCH DANH (LEFT 60%) + 2 THẺ CỘT PHẢI STACK (RIGHT 40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* THẺ LỚN TRÁI: THIỆP GỬI ĐÍCH DANH TỪNG KHÁCH MỜI */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-7 bg-white rounded-[32px] sm:rounded-[36px] p-7 sm:p-9 border border-[#EFE9E1] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[340px] group hover:shadow-xl hover:border-[#BE944E]/40"
            >
              {/* Background Photo */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('/images/journal-card-balloon.jpg')`,
                }}
              />
              {/* Dark Gradient Overlay for Crisp Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />

              {/* Top Left Diamond Badge */}
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 text-[#BE944E] flex items-center justify-center shadow-xs">
                  <Gem className="w-5 h-5" />
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="relative z-10 text-white space-y-2 max-w-md pt-12">
                <div className="text-[11px] font-sans font-semibold tracking-wider text-amber-200/90 uppercase flex items-center gap-2">
                  <span>Tính năng nổi bật</span>
                  <span className="w-6 h-[1px] bg-amber-200/60 inline-block" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-snug">
                  {t("homeCard1Title") || "Thiệp Gửi Đích Danh Từng Khách Mời"}
                </h3>
                <p className="text-xs text-white/85 leading-relaxed">
                  {t("homeCard1Desc") ||
                    "Cá nhân hóa thiệp lời mời với tên khách được in trang trọng, tạo cảm giác được trân trọng tuyệt đối."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/collections"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold shadow-md hover:scale-105 transition"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* CỘT PHẢI: 2 THẺ STACK NHỎ (RSVP & VIETQR) */}
            <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
              {/* THẺ 1: QUẢN LÝ RSVP & CHỐT BÀN */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="flex-1 bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-[#EFE9E1] shadow-2xs flex items-center justify-between gap-4 hover:shadow-md hover:border-[#BE944E]/40 transition group relative overflow-hidden cursor-pointer"
              >
                {/* Background 3D Banquet Corner Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/bento-banquet.jpg"
                  alt="Banquet"
                  className="absolute right-8 bottom-[-10px] w-28 h-28 object-cover rounded-2xl opacity-40 pointer-events-none transition-transform duration-500 group-hover:scale-105"
                />

                <div className="flex items-start gap-4 z-10 max-w-[260px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3EA] text-[#4A724E] flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                    <CalendarCheck2 className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#181716] group-hover:text-[#BE944E] transition">
                      {t("homeCard2Title") || "Quản Lý RSVP & Chốt Bàn"}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {t("homeCard2Desc") ||
                        "Tự động hóa việc xác nhận tham dự và sắp xếp chỗ ngồi thông minh."}
                    </p>
                  </div>
                </div>

                <div className="text-stone-400 group-hover:text-[#BE944E] group-hover:translate-x-1 transition z-10 shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>

              {/* THẺ 2: HỘP MỪNG CƯỚI VIETQR */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="flex-1 bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-[#EFE9E1] shadow-2xs flex items-center justify-between gap-4 hover:shadow-md hover:border-[#BE944E]/40 transition group relative overflow-hidden cursor-pointer"
              >
                {/* Background 3D Gift Box Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/bento-gift-box.jpg"
                  alt="3D Gift Box"
                  className="absolute right-8 bottom-[-10px] w-24 h-24 object-cover rounded-2xl opacity-60 pointer-events-none transition-transform duration-500 group-hover:scale-105"
                />

                <div className="flex items-start gap-4 z-10 max-w-[260px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF2E4] text-[#8C6424] flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                    <Gift className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#181716] group-hover:text-[#BE944E] transition">
                      {t("homeCard3Title") || "Hộp Mừng Cưới VietQR"}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {t("homeCard3Desc") ||
                        "Tích hợp mã QR thanh toán tinh tế, tiện lợi cho khách mời từ xa."}
                    </p>
                  </div>
                </div>

                <div className="text-stone-400 group-hover:text-[#BE944E] group-hover:translate-x-1 transition z-10 shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* HÀNG 2: 2 THẺ BẰNG NHAU (MINI-GAME & ALBUM ẢNH 3D) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* THẺ 3: MINI-GAME TƯƠNG TÁC */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-[#EFE9E1] shadow-2xs flex items-center justify-between gap-4 hover:shadow-md hover:border-[#BE944E]/40 transition group relative overflow-hidden cursor-pointer"
            >
              {/* Background 3D Gamepad Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/bento-gamepad.jpg"
                alt="3D Gamepad"
                className="absolute right-8 bottom-[-10px] w-24 h-24 object-cover rounded-2xl opacity-60 pointer-events-none transition-transform duration-500 group-hover:scale-105"
              />

              <div className="flex items-start gap-4 z-10 max-w-[260px]">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF0EC] text-[#D96B4F] flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <Gamepad2 className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#181716] group-hover:text-[#BE944E] transition">
                    {t("homeCard4Title") || "Mini-Game Tương Tác"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t("homeCard4Desc") ||
                      "Gắn kết khách mời trước sự kiện với các trò chơi nhỏ thú vị."}
                  </p>
                </div>
              </div>

              <div className="text-stone-400 group-hover:text-[#BE944E] group-hover:translate-x-1 transition z-10 shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>

            {/* THẺ 4: ALBUM ẢNH 3D & NHẠC */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-[#EFE9E1] shadow-2xs flex items-center justify-between gap-4 hover:shadow-md hover:border-[#BE944E]/40 transition group relative overflow-hidden cursor-pointer"
            >
              {/* Background 3D Photo Frame Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/bento-photo-music.jpg"
                alt="3D Photo Frame"
                className="absolute right-8 bottom-[-10px] w-24 h-24 object-cover rounded-2xl opacity-60 pointer-events-none transition-transform duration-500 group-hover:scale-105"
              />

              <div className="flex items-start gap-4 z-10 max-w-[260px]">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF3E8] text-[#BE944E] flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform shadow-2xs">
                  <ImageIcon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#181716] group-hover:text-[#BE944E] transition">
                    {t("homeCard5Title") || "Album Ảnh 3D & Nhạc"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t("homeCard5Desc") ||
                      "Trình diễn bộ ảnh cưới ấn tượng trên nền nhạc yêu thích."}
                  </p>
                </div>
              </div>

              <div className="text-stone-400 group-hover:text-[#BE944E] group-hover:translate-x-1 transition z-10 shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          </div>

          {/* HÀNG 3: THẺ ĐA NGÔN NGỮ TOÀN CẦU TRÀN HÀNG + BẢN ĐỒ VÀNG */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, scale: 1.008 }}
            transition={{ duration: 0.3 }}
            className="bg-[#FAF7F0] rounded-[32px] sm:rounded-[36px] p-7 sm:p-9 border border-[#EAE0CD] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group hover:shadow-md hover:border-[#BE944E]/40"
          >
            {/* Left Content */}
            <div className="max-w-lg z-10 flex items-start gap-5">
              <div className="w-14 h-14 rounded-full bg-[#FAF0E1] border border-[#EAE0CD] text-[#BE944E] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-108 transition-transform">
                <Globe2 className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-[#181716]">
                  {t("homeCard6Title") || "Đa Ngôn Ngữ Toàn Cầu"}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-md">
                  {t("homeCard6Desc") ||
                    "Tự động dịch nội dung thiệp dựa trên ngôn ngữ trình duyệt của khách mời, xóa nhòa khoảng cách địa lý."}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 border border-[#EAE0CD] text-xs font-semibold text-stone-700 shadow-2xs group-hover:bg-white transition">
                    <span>Hỗ trợ nhiều ngôn ngữ</span>
                    <Globe2 className="w-3.5 h-3.5 text-[#BE944E]" />
                  </span>
                </div>
              </div>
            </div>

            {/* Right Graphic: Golden Dotted Globe & Network Paths */}
            <div className="relative w-72 h-36 flex items-center justify-center shrink-0 opacity-85 pointer-events-none">
              <svg viewBox="0 0 280 140" className="w-full h-full">
                {/* World map stylized continents */}
                <path
                  d="M30 40 Q45 25 70 35 T100 55 T80 85 T40 70 Z M130 30 Q160 20 190 35 T220 50 T200 80 T150 70 Z M190 90 Q220 85 240 100 T230 125 T190 115 Z"
                  fill="#BE944E"
                  fillOpacity="0.12"
                />
                {/* Orbital connecting golden arc line */}
                <path
                  d="M 30 70 Q 140 10 250 70"
                  fill="none"
                  stroke="#BE944E"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <path
                  d="M 50 85 Q 150 120 230 60"
                  fill="none"
                  stroke="#BE944E"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                {/* Animated Glowing Connection Nodes */}
                <circle
                  cx="50"
                  cy="70"
                  r="4"
                  fill="#BE944E"
                  className="animate-pulse"
                  opacity="0.8"
                />
                <circle
                  cx="140"
                  cy="40"
                  r="5"
                  fill="#D8B062"
                  className="animate-pulse"
                  opacity="0.9"
                />
                <circle
                  cx="230"
                  cy="65"
                  r="4"
                  fill="#BE944E"
                  className="animate-pulse"
                  opacity="0.8"
                />
              </svg>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 13. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <Footer />

      {/* FLOATING QUICK ACTION: BACK TO TOP */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#181716] text-[#BE944E] hover:text-white hover:bg-[#BE944E] shadow-xl border border-[#BE944E]/30 backdrop-blur-md transition-colors cursor-pointer flex items-center justify-center group"
          >
            <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* QUICK VIEW TEMPLATE DETAIL MODAL TRÊN TRANG CHỦ */}
      <TemplateDetailModal
        isOpen={!!selectedModalTemplate}
        onClose={() => setSelectedModalTemplate(null)}
        template={selectedModalTemplate}
      />
    </div>
  );
}
