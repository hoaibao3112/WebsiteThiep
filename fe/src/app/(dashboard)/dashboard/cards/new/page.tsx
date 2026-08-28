"use client";

import React, { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CardCategory, CardDetail, EventItem, PhotoItem } from "@/types/card.types";
import { WeddingView } from "@/components/wedding/WeddingView";
import { BirthdayView } from "@/components/birthday/BirthdayView";
import { NewbornView } from "@/components/newborn/NewbornView";
import { ApiClient } from "@/lib/api";
import {
  Heart,
  Cake,
  Baby,
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  Save,
  Check,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Music,
  Play,
  Pause,
  Image as ImageIcon,
  Gift,
  Users,
  Palette,
  Eye,
  ArrowLeft,
  Share2,
  Sliders,
  ChevronRight,
  BookOpen,
  HelpCircle,
  QrCode,
  Sparkle,
  Layers,
  Wand2,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function NewCardBuilderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500 font-serif">Đang khởi tạo Visual Studio Builder...</div>}>
      <CardBuilderContent />
    </Suspense>
  );
}

// Danh sách Preset Mẫu Thiệp
const TEMPLATE_PRESETS = [
  {
    id: "wedding-hong-xanh-luxury",
    name: "Hoa Mộc Hồng Luxury",
    category: "WEDDING",
    tag: "ROMANCE",
    color: "#BE944E",
    font: "Playfair Display",
    bg: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-emerald-royal",
    name: "Vườn Ngọc Hoàng Gia",
    category: "WEDDING",
    tag: "LUXURY",
    color: "#2D5A3B",
    font: "Playfair Display",
    bg: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-vintage-classic",
    name: "Cổ Điển Hoàng Triều",
    category: "WEDDING",
    tag: "VINTAGE",
    color: "#A2772A",
    font: "Cinzel",
    bg: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-ruby-passion",
    name: "Ruby Nhung Đỏ",
    category: "WEDDING",
    tag: "TRADITION",
    color: "#8B1E2F",
    font: "Playfair Display",
    bg: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop",
  },
];

// Danh sách Nhạc Nền Cưới Có Sẵn
const MUSIC_OPTIONS = [
  {
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    duration: "2:57",
    src: "/music/until-i-found-you.mp3",
  },
  {
    title: "I Do",
    artist: "911 Band",
    duration: "3:24",
    src: "/music/i-do.mp3",
  },
  {
    title: "A Thousand Years",
    artist: "Christina Perri",
    duration: "4:45",
    src: "/music/a-thousand-years.mp3",
  },
  {
    title: "Perfect",
    artist: "Ed Sheeran",
    duration: "4:23",
    src: "/music/perfect.mp3",
  },
];

// Bảng màu nhanh
const COLOR_PRESETS = [
  { name: "Gold Hoàng Gia", hex: "#BE944E" },
  { name: "Emerald Xanh Rêu", hex: "#2D5A3B" },
  { name: "Ruby Đỏ Rượu", hex: "#8B1E2F" },
  { name: "Midnight Xanh Đêm", hex: "#1A2E40" },
  { name: "Rose Gold Hồng Cam", hex: "#D48B77" },
  { name: "Plum Tím Quý Phái", hex: "#6B3074" },
];

function CardBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CardCategory) || "WEDDING";

  // Tab điều hướng chính trong studio builder
  const [activeTab, setActiveTab] = useState<"theme" | "couple" | "story" | "events" | "gallery" | "music" | "banking" | "rsvp">("theme");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");

  // State cấu hình cơ bản
  const [category, setCategory] = useState<CardCategory>(initialCategory);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_PRESETS[0].id);
  const [slug, setSlug] = useState(`thiep-${Date.now().toString().slice(-6)}`);
  const [primaryColor, setPrimaryColor] = useState("#BE944E");
  const [fontFamily, setFontFamily] = useState("Playfair Display");
  const [openingEffect, setOpeningEffect] = useState<"WAX_SEAL" | "GATE_OPEN" | "NONE">("WAX_SEAL");
  const [fallingEffect, setFallingEffect] = useState<"PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON">("PETAL");
  const [greetingMessage, setGreetingMessage] = useState(
    "Tình yêu không phải là nhìn nhau, mà là cùng nhìn về một hướng. Trân trọng kính mời bạn đến chung vui cùng chúng tôi."
  );

  // Wedding Couples & Family State
  const [groomName, setGroomName] = useState("Trần Minh Quân");
  const [groomShort, setGroomShort] = useState("Minh Quân");
  const [groomFather, setGroomFather] = useState("Trần Văn Hùng");
  const [groomMother, setGroomMother] = useState("Lê Thị Mai");
  const [groomBirthOrder, setGroomBirthOrder] = useState("Trưởng Nam");

  const [brideName, setBrideName] = useState("Nguyễn Thu Hà");
  const [brideShort, setBrideShort] = useState("Thu Hà");
  const [brideFather, setBrideFather] = useState("Nguyễn Văn Dũng");
  const [brideMother, setBrideMother] = useState("Phạm Thu Cúc");
  const [brideBirthOrder, setBrideBirthOrder] = useState("Út Nữ");

  // Love Story Timeline
  const [loveStory, setLoveStory] = useState([
    {
      title: "Lần Đầu Gặp Gỡ",
      date: "14 . 02 . 2022",
      description: "Một chiều mưa cà phê tại góc phố quen, ánh mắt chạm nhau mở đầu cho bản tình ca.",
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
    },
    {
      title: "Lời Hẹn Ước Dưới Hoàng Hôn",
      date: "24 . 12 . 2024",
      description: "Chuyến đi Đà Lạt mộng mơ và chiếc nhẫn cầu hôn đong đầy lời hứa trăm năm.",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
    },
  ]);

  // Birthday state
  const [celebrantName, setCelebrantName] = useState("Hoàng Bảo Nam");
  const [age, setAge] = useState(25);

  // Newborn state
  const [babyName, setBabyName] = useState("Nguyễn Tuệ Nhi");
  const [nickname, setNickname] = useState("Bé Đậu");
  const [ceremonyType, setCeremonyType] = useState<"ANNOUNCEMENT_ONLY" | "FULL_MONTH" | "ONE_YEAR">("FULL_MONTH");
  const [weight, setWeight] = useState("3.4 kg");
  const [height, setHeight] = useState("51 cm");

  // Events / Schedule
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "event-1",
      eventName: "Lễ Vu Quy (Nhà Gái)",
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      lunarDate: "Ngày 15 Tháng 09 Năm Bính Ngọ",
      venueName: "Tư Gia Nhà Gái",
      address: "123 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
      mapUrl: "https://maps.google.com",
    },
    {
      id: "event-2",
      eventName: "Lễ Thành Hôn & Tiệc Cưới",
      eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      lunarDate: "Ngày 16 Tháng 09 Năm Bính Ngọ",
      venueName: "Trung tâm Hội nghị Tiệc cưới GEM Center (Sảnh Grand Ballroom)",
      address: "Số 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh",
      mapUrl: "https://maps.google.com",
    },
  ]);

  // Photos Gallery
  const [photos, setPhotos] = useState<PhotoItem[]>([
    {
      id: "p-1",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
      caption: "Khoảnh khắc lãng mạn tại bãi biển",
    },
    {
      id: "p-2",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
      caption: "Nụ cười hạnh phúc ngày đính hôn",
    },
    {
      id: "p-3",
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop",
      caption: "Ánh nhìn đong đầy yêu thương",
    },
    {
      id: "p-4",
      url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop",
      caption: "Cùng nhau đi qua năm tháng",
    },
  ]);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  // Background Music Studio
  const [selectedMusicSrc, setSelectedMusicSrc] = useState(MUSIC_OPTIONS[0].src);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [testPlayingSrc, setTestPlayingSrc] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // VietQR Banking Box
  const [bankCodeGroom, setBankCodeGroom] = useState("MB");
  const [accNumGroom, setAccNumGroom] = useState("0988888888");
  const [accNameGroom, setAccNameGroom] = useState("TRAN MINH QUAN");

  const [bankCodeBride, setBankCodeBride] = useState("VCB");
  const [accNumBride, setAccNumBride] = useState("9988776655");
  const [accNameBride, setAccNameBride] = useState("NGUYEN THU HA");

  // RSVP Configuration
  const [isRsvpEnabled, setIsRsvpEnabled] = useState(true);
  const [rsvpDeadline, setRsvpDeadline] = useState("2026-10-10");
  const [rsvpCustomNote, setRsvpCustomNote] = useState("Sự hiện diện của bạn là niềm vinh hạnh lớn của gia đình chúng tôi.");

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Audio preview helper
  const handleToggleTestMusic = (src: string) => {
    if (!previewAudioRef.current) return;
    if (testPlayingSrc === src) {
      previewAudioRef.current.pause();
      setTestPlayingSrc(null);
    } else {
      previewAudioRef.current.src = src;
      previewAudioRef.current.play();
      setTestPlayingSrc(src);
    }
  };

  // Build live preview card object
  const previewCard: CardDetail = {
    id: "preview-card-id",
    slug,
    cardCategory: category,
    status: "ACTIVE",
    openingEffect: "NONE", // Tắt mở phong bì trong preview để xem trực tiếp các phần tử
    fallingEffect,
    isAutoPlay,
    primaryColor,
    fontFamily,
    musicUrl: selectedMusicSrc,
    greetingMessage,
    bankingPrimary: {
      bankCode: bankCodeGroom,
      accountNumber: accNumGroom,
      accountName: accNameGroom,
    },
    bankingSecondary: {
      bankCode: bankCodeBride,
      accountNumber: accNumBride,
      accountName: accNameBride,
    },
    events: events.map((e) => ({
      ...e,
      eventDate: new Date(e.eventDate),
    })),
    photos,
    categoryData:
      category === "WEDDING"
        ? {
            cardCategory: "WEDDING",
            groom: {
              fullName: groomName,
              shortName: groomShort,
              birthOrder: groomBirthOrder,
              parents: { fatherName: groomFather, motherName: groomMother },
            },
            bride: {
              fullName: brideName,
              shortName: brideShort,
              birthOrder: brideBirthOrder,
              parents: { fatherName: brideFather, motherName: brideMother },
            },
            loveStory,
            events: [],
          }
        : category === "BIRTHDAY"
        ? {
            cardCategory: "BIRTHDAY",
            celebrantName,
            age,
            events: [],
          }
        : {
            cardCategory: "NEWBORN",
            babyName,
            nickname,
            gender: "GIRL",
            birthDate: new Date(),
            weight,
            height,
            ceremonyType,
            events: [],
          },
  };

  const handleSaveCard = async () => {
    setSaving(true);
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#BE944E", "#D4AF37", "#FFFFFF", "#10B981"],
    });

    const payload: any = {
      slug,
      templateId: selectedTemplate,
      planId: "free-plan-id",
      openingEffect,
      fallingEffect,
      primaryColor,
      fontFamily,
      musicUrl: selectedMusicSrc,
      isAutoPlay,
      greetingMessage,
      bankingPrimary: { bankCode: bankCodeGroom, accountNumber: accNumGroom, accountName: accNameGroom },
      bankingSecondary: { bankCode: bankCodeBride, accountNumber: accNumBride, accountName: accNameBride },
      photos,
      data: {
        cardCategory: category,
        events: events.map((e) => ({
          ...e,
          eventDate: new Date(e.eventDate),
        })),
        ...(category === "WEDDING"
          ? {
              groom: {
                fullName: groomName,
                shortName: groomShort,
                birthOrder: groomBirthOrder,
                parents: { fatherName: groomFather, motherName: groomMother },
              },
              bride: {
                fullName: brideName,
                shortName: brideShort,
                birthOrder: brideBirthOrder,
                parents: { fatherName: brideFather, motherName: brideMother },
              },
              loveStory,
            }
          : category === "BIRTHDAY"
          ? { celebrantName, age }
          : {
              babyName,
              nickname,
              gender: "BOY",
              birthDate: new Date(),
              weight,
              height,
              ceremonyType,
            }),
      },
    };

    try {
      const res = await ApiClient.request("/cards", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSaving(false);
      setSuccessToast(true);
      setTimeout(() => {
        router.push(`/thiep/${slug}`);
      }, 1200);
    } catch {
      setSaving(false);
      // Mode demo
      router.push(`/thiep/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col font-sans text-stone-900 selection:bg-amber-200">
      {/* Hidden audio element for previewing songs */}
      <audio ref={previewAudioRef} onEnded={() => setTestPlayingSrc(null)} />

      {/* TOP STUDIO HEADER */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#E8E2D6] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/cards"
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition"
            title="Quay lại danh sách thiệp"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight flex items-center gap-1.5">
                <span>CardVite Visual Studio</span>
                <span className="text-amber-500 text-xs">✦</span>
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#BE944E]/15 text-[#966E29] text-[10px] font-bold uppercase tracking-wider">
                Luxury Edition
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: DEVICE PREVIEW TOGGLE */}
        <div className="hidden md:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1">
          <button
            type="button"
            onClick={() => setPreviewDevice("mobile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              previewDevice === "mobile" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("tablet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              previewDevice === "tablet" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              previewDevice === "desktop" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* RIGHT: PUBLISH & PREVIEW ACTIONS */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveCard}
            disabled={saving}
            className="px-5 sm:px-6 py-2 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 cursor-pointer transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{saving ? "Đang xuất bản..." : "Xuất Bản Thiệp ✨"}</span>
          </motion.button>
        </div>
      </header>

      {/* 2-COLUMN WORKSPACE: LEFT CONTROL TABS + RIGHT LIVE MOCKUP */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ======================================================== */}
        {/* CỘT TRÁI: THANH TÍNH NĂNG TABS + FORM CHỈNH SỬA CHI TIẾT */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[500px] xl:w-[560px] bg-white border-r border-[#EAE2D6] flex flex-col h-[calc(100vh-64px)] shadow-xs">
          {/* HORIZONTAL FEATURE TABS NAVIGATION */}
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-stone-100 overflow-x-auto no-scrollbar bg-[#FAF8F5]">
            {[
              { key: "theme", label: "Giao Diện", icon: <Palette className="w-3.5 h-3.5" /> },
              { key: "couple", label: "Cặp Đôi", icon: <Heart className="w-3.5 h-3.5" /> },
              { key: "story", label: "Câu Chuyện", icon: <BookOpen className="w-3.5 h-3.5" /> },
              { key: "events", label: "Lịch Trình", icon: <Calendar className="w-3.5 h-3.5" /> },
              { key: "gallery", label: "Album Ảnh", icon: <ImageIcon className="w-3.5 h-3.5" /> },
              { key: "music", label: "Nhạc Nền", icon: <Music className="w-3.5 h-3.5" /> },
              { key: "banking", label: "Mừng Cưới", icon: <Gift className="w-3.5 h-3.5" /> },
              { key: "rsvp", label: "RSVP", icon: <Users className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[#BE944E] text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT SCROLLABLE PANEL */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ---------------------------------------------------- */}
            {/* TAB 1: GIAO DIỆN, MÀU SẮC, HIỆU ỨNG */}
            {/* ---------------------------------------------------- */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Palette className="w-4 h-4 text-[#BE944E]" />
                    <span>Chọn Danh Mục & Phong Cách</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tùy biến bộ nhận diện, tông màu hoàng gia và hiệu ứng mở phong bì.
                  </p>
                </div>

                {/* Danh mục */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "WEDDING", label: "Thiệp Cưới", icon: <Heart className="w-4 h-4" /> },
                    { key: "BIRTHDAY", label: "Sinh Nhật", icon: <Cake className="w-4 h-4" /> },
                    { key: "NEWBORN", label: "Thôi Nôi / Báo Hỷ", icon: <Baby className="w-4 h-4" /> },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(c.key as CardCategory)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                        category === c.key
                          ? "bg-gradient-to-tr from-[#B68837] to-[#E2BC6A] text-white border-amber-600 shadow-md"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {c.icon}
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mẫu thiệp Preset */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                    Bộ Sưu Tập Mẫu Thiệp Đẹp Nhất
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATE_PRESETS.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          setSelectedTemplate(tpl.id);
                          setPrimaryColor(tpl.color);
                          setFontFamily(tpl.font);
                        }}
                        className={`rounded-2xl border p-3 cursor-pointer transition relative overflow-hidden flex flex-col justify-between h-28 group ${
                          selectedTemplate === tpl.id
                            ? "border-2 border-[#BE944E] ring-2 ring-[#BE944E]/30 bg-amber-50/40 shadow-md"
                            : "border-stone-200 hover:border-[#BE944E]/50 bg-white"
                        }`}
                      >
                        <div
                          className="absolute inset-0 opacity-15 bg-cover bg-center group-hover:scale-105 transition-transform"
                          style={{ backgroundImage: `url(${tpl.bg})` }}
                        />
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-amber-200 uppercase">
                            {tpl.tag}
                          </span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: tpl.color }}
                          />
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-xs font-serif font-bold text-stone-900">{tpl.name}</h4>
                          <span className="text-[10px] text-stone-500 font-mono">{tpl.font}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Màu chủ đạo & Preset */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Màu Sắc Hoàng Gia Chủ Đạo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((clr) => (
                      <button
                        key={clr.hex}
                        type="button"
                        onClick={() => setPrimaryColor(clr.hex)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                          primaryColor === clr.hex
                            ? "bg-white border-stone-800 text-stone-900 shadow-sm"
                            : "bg-white/80 border-stone-200 text-stone-600 hover:bg-white"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: clr.hex }} />
                        <span>{clr.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 p-0.5"
                    />
                    <span className="text-xs font-mono font-bold text-stone-700">Mã màu: {primaryColor}</span>
                  </div>
                </div>

                {/* Hiệu ứng Mở Phong Bì & Hiệu ứng Rơi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Hiệu Ứng Phong Bì</label>
                    <select
                      value={openingEffect}
                      onChange={(e) => setOpeningEffect(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-white border border-stone-200 font-medium"
                    >
                      <option value="WAX_SEAL">Sáp Niêm Phong Vàng (Wax Seal)</option>
                      <option value="GATE_OPEN">Cổng Hoa Mở (Flower Gate)</option>
                      <option value="NONE">Mở Trực Tiếp (Không nắp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Hiệu Ứng Rơi</label>
                    <select
                      value={fallingEffect}
                      onChange={(e) => setFallingEffect(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-white border border-stone-200 font-medium"
                    >
                      <option value="PETAL">Cánh Hoa Hồng Bay</option>
                      <option value="HEART">Trái Tim Tình Yêu</option>
                      <option value="SNOW">Tuyết Rơi Lãng Mạn</option>
                      <option value="CONFETTI">Kim Tuyến Pháo Hoa</option>
                      <option value="BALLOON">Bóng Bay Rực Rỡ</option>
                      <option value="NONE">Tắt Hiệu Ứng</option>
                    </select>
                  </div>
                </div>

                {/* Đường dẫn Slug */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Đường Dẫn Truy Cập Thiệp (Slug URL)
                  </label>
                  <div className="flex items-center text-xs rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5">
                    <span className="text-stone-400 font-mono">cardvite.vn/thiep/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      className="font-bold font-mono text-[#BE944E] bg-transparent focus:outline-none flex-1 ml-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: THÔNG TIN CẶP ĐÔI & GIA ĐÌNH HAI BÊN */}
            {/* ---------------------------------------------------- */}
            {activeTab === "couple" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-[#BE944E]" />
                    <span>Thông Tin Cô Dâu & Chú Rể</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Điền đầy đủ tên tuổi và thông tin phụ mẫu hai bên gia đình.
                  </p>
                </div>

                {/* THÔNG TIN NHÀ TRAI / CHÚ RỂ */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#BE944E]" />
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Nhà Trai • Chú Rể
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Chú Rể (Đầy đủ)</label>
                      <input
                        type="text"
                        value={groomName}
                        onChange={(e) => setGroomName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Thân Mật</label>
                      <input
                        type="text"
                        value={groomShort}
                        onChange={(e) => setGroomShort(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Thứ Bậc</label>
                      <input
                        type="text"
                        value={groomBirthOrder}
                        onChange={(e) => setGroomBirthOrder(e.target.value)}
                        placeholder="Trưởng Nam"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Cha</label>
                      <input
                        type="text"
                        value={groomFather}
                        onChange={(e) => setGroomFather(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Mẹ</label>
                      <input
                        type="text"
                        value={groomMother}
                        onChange={(e) => setGroomMother(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                  </div>
                </div>

                {/* THÔNG TIN NHÀ GÁI / CÔ DÂU */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-200/60 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Nhà Gái • Cô Dâu
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Cô Dâu (Đầy đủ)</label>
                      <input
                        type="text"
                        value={brideName}
                        onChange={(e) => setBrideName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Thân Mật</label>
                      <input
                        type="text"
                        value={brideShort}
                        onChange={(e) => setBrideShort(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Thứ Bậc</label>
                      <input
                        type="text"
                        value={brideBirthOrder}
                        onChange={(e) => setBrideBirthOrder(e.target.value)}
                        placeholder="Út Nữ"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Cha</label>
                      <input
                        type="text"
                        value={brideFather}
                        onChange={(e) => setBrideFather(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Mẹ</label>
                      <input
                        type="text"
                        value={brideMother}
                        onChange={(e) => setBrideMother(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                      />
                    </div>
                  </div>
                </div>

                {/* LỜI NGỎ / THÔNG ĐIỆP GỬI KHÁCH */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Lời Ngỏ & Trích Dẫn Yêu Thương
                  </label>
                  <textarea
                    rows={3}
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-stone-50 border border-stone-200 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BE944E]/30"
                  />
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: CÂU CHUYỆN TÌNH YÊU (LOVE STORY TIMELINE) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "story" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-[#BE944E]" />
                      <span>Love Story Timeline</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Ghi dấu những cột mốc ngọt ngào từ ngày đầu gặp gỡ đến ngày chung đôi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLoveStory([
                        ...loveStory,
                        {
                          title: "Kỷ Niệm Mới",
                          date: "20 . 10 . 2025",
                          description: "Khoảnh khắc đáng nhớ cùng nhau sẻ chia.",
                          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] text-[#BE944E] border border-[#EAE0CD] text-xs font-bold flex items-center gap-1 hover:bg-[#BE944E] hover:text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Mốc</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {loveStory.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#BE944E] bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                          Cột mốc 0{idx + 1}
                        </span>
                        {loveStory.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLoveStory(loveStory.filter((_, i) => i !== idx))}
                            className="text-stone-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">Tiêu Đề Kỷ Niệm</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...loveStory];
                              updated[idx].title = e.target.value;
                              setLoveStory(updated);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">Thời Gian</label>
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => {
                              const updated = [...loveStory];
                              updated[idx].date = e.target.value;
                              setLoveStory(updated);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Nội Dung Chia Sẻ</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...loveStory];
                            updated[idx].description = e.target.value;
                            setLoveStory(updated);
                          }}
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-stone-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 4: LỊCH TRÌNH & ĐỊA ĐIỂM (EVENTS & SCHEDULE) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#BE944E]" />
                      <span>Lịch Trình & Địa Điểm Tổ Chức</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Cài đặt các buổi lễ cưới, tiệc mừng và tích hợp chỉ đường Google Maps.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEvents([
                        ...events,
                        {
                          id: `event-${Date.now()}`,
                          eventName: "Tiệc Cưới Báo Hỷ",
                          eventDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                          lunarDate: "Ngày 17 Tháng 09 Năm Bính Ngọ",
                          venueName: "Trung tâm Hội nghị Tiệc Cưới",
                          address: "Địa chỉ tổ chức tiệc cưới",
                          mapUrl: "https://maps.google.com",
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] text-[#BE944E] border border-[#EAE0CD] text-xs font-bold flex items-center gap-1 hover:bg-[#BE944E] hover:text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Buổi Lễ</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {events.map((ev, idx) => (
                    <div key={ev.id || idx} className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#BE944E] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#BE944E]" />
                          <span>Buổi Lễ 0{idx + 1}</span>
                        </span>
                        {events.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setEvents(events.filter((_, i) => i !== idx))}
                            className="text-stone-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Sự Kiện / Buổi Lễ</label>
                          <input
                            type="text"
                            value={ev.eventName}
                            onChange={(e) => {
                              const updated = [...events];
                              updated[idx].eventName = e.target.value;
                              setEvents(updated);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Thời Gian (Dương Lịch)</label>
                          <input
                            type="datetime-local"
                            value={typeof ev.eventDate === "string" ? ev.eventDate : new Date(ev.eventDate).toISOString().slice(0, 16)}
                            onChange={(e) => {
                              const updated = [...events];
                              updated[idx].eventDate = e.target.value;
                              setEvents(updated);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Địa Điểm / Sảnh Cưới</label>
                          <input
                            type="text"
                            value={ev.venueName}
                            onChange={(e) => {
                              const updated = [...events];
                              updated[idx].venueName = e.target.value;
                              setEvents(updated);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Ngày Âm Lịch (Hiển thị thiệp)</label>
                          <input
                            type="text"
                            value={ev.lunarDate || ""}
                            onChange={(e) => {
                              const updated = [...events];
                              updated[idx].lunarDate = e.target.value;
                              setEvents(updated);
                            }}
                            placeholder="Ngày 16 Tháng 09 Năm Bính Ngọ"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Địa Chỉ Chi Tiết</label>
                        <input
                          type="text"
                          value={ev.address}
                          onChange={(e) => {
                            const updated = [...events];
                            updated[idx].address = e.target.value;
                            setEvents(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 5: ALBUM ẢNH CƯỚI & VIDEO */}
            {/* ---------------------------------------------------- */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <ImageIcon className="w-4 h-4 text-[#BE944E]" />
                      <span>Album Ảnh Cưới & Video Pre-Wedding</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Tải lên bộ sưu tập ảnh cưới sắc nét chất lượng cao 4K.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotos([
                        ...photos,
                        {
                          id: `p-${Date.now()}`,
                          url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
                          caption: "Khoảnh khắc hạnh phúc mới",
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF5EE] text-[#BE944E] border border-[#EAE0CD] text-xs font-bold flex items-center gap-1 hover:bg-[#BE944E] hover:text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Ảnh</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {photos.map((item, idx) => (
                    <div key={item.id || idx} className="rounded-2xl border border-stone-200 bg-white p-2.5 space-y-2 relative group shadow-2xs">
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt="Photo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...photos];
                          updated[idx].url = e.target.value;
                          setPhotos(updated);
                        }}
                        placeholder="Link ảnh URL"
                        className="w-full px-2 py-1 text-[11px] rounded-lg bg-stone-50 border border-stone-200 text-stone-600 truncate"
                      />
                    </div>
                  ))}
                </div>

                {/* Video Pre-Wedding */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Video Phim Cưới / Pre-Wedding (YouTube Link)
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-mono text-stone-700"
                  />
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 6: KHO NHẠC NỀN TUYỂN CHỌN */}
            {/* ---------------------------------------------------- */}
            {activeTab === "music" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-[#BE944E]" />
                    <span>Kho Nhạc Nền Cưới Tuyển Chọn</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Chọn bản tình ca lãng mạn phát khi khách mở thiệp cưới.
                  </p>
                </div>

                <div className="space-y-3">
                  {MUSIC_OPTIONS.map((track) => {
                    const isSelected = selectedMusicSrc === track.src;
                    const isPlayingThis = testPlayingSrc === track.src;
                    return (
                      <div
                        key={track.src}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-amber-50/60 border-[#BE944E] ring-2 ring-[#BE944E]/20 shadow-xs"
                            : "bg-white border-stone-200 hover:border-stone-300"
                        }`}
                        onClick={() => setSelectedMusicSrc(track.src)}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTestMusic(track.src);
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs ${
                              isPlayingThis ? "bg-[#BE944E] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            }`}
                            title="Nghe thử"
                          >
                            {isPlayingThis ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>

                          <div>
                            <h4 className="text-xs font-bold text-stone-900">{track.title}</h4>
                            <span className="text-[11px] text-stone-500">{track.artist}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-stone-400">{track.duration}</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-[#BE944E] bg-[#BE944E] text-white" : "border-stone-300"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tùy chọn tự động phát */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Tự Động Phát Nhạc (Auto Play)</span>
                    <span className="text-[11px] text-stone-500">Phát giai điệu khi khách mở phong bì</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAutoPlay}
                    onChange={(e) => setIsAutoPlay(e.target.checked)}
                    className="w-4 h-4 accent-[#BE944E] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 7: MỪNG CƯỚI VIETQR & QUÀ TẶNG */}
            {/* ---------------------------------------------------- */}
            {activeTab === "banking" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-[#BE944E]" />
                    <span>Hộp Mừng Cưới VietQR & Gửi Quà</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tích hợp mã QR Napas247 tiện lợi để khách ở xa có thể gửi lời chúc và quà mừng.
                  </p>
                </div>

                {/* TÀI KHOẢN NHÀ TRAI */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    1. Tài Khoản Chú Rể (Nhà Trai)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Ngân Hàng</label>
                      <input
                        type="text"
                        value={bankCodeGroom}
                        onChange={(e) => setBankCodeGroom(e.target.value)}
                        placeholder="MB, VCB, ACB, Techcombank..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Số Tài Khoản</label>
                      <input
                        type="text"
                        value={accNumGroom}
                        onChange={(e) => setAccNumGroom(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Chủ Tài Khoản (Không dấu)</label>
                    <input
                      type="text"
                      value={accNameGroom}
                      onChange={(e) => setAccNameGroom(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-bold"
                    />
                  </div>
                </div>

                {/* TÀI KHOẢN NHÀ GÁI */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    2. Tài Khoản Cô Dâu (Nhà Gái)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Ngân Hàng</label>
                      <input
                        type="text"
                        value={bankCodeBride}
                        onChange={(e) => setBankCodeBride(e.target.value)}
                        placeholder="VCB, Vietinbank, TPBank..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Số Tài Khoản</label>
                      <input
                        type="text"
                        value={accNumBride}
                        onChange={(e) => setAccNumBride(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Chủ Tài Khoản (Không dấu)</label>
                    <input
                      type="text"
                      value={accNameBride}
                      onChange={(e) => setAccNameBride(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 8: MỜI ĐÍCH DANH & RSVP */}
            {/* ---------------------------------------------------- */}
            {activeTab === "rsvp" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#BE944E]" />
                    <span>Mời Đích Danh & Quản Lý RSVP</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Thu thập phản hồi số lượng khách tham dự để đặt bàn tiệc chuẩn xác.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Kích Hoạt Form Xác Nhận RSVP</span>
                    <span className="text-[11px] text-stone-500">Cho phép khách bấm xác nhận & gửi lời chúc</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isRsvpEnabled}
                    onChange={(e) => setIsRsvpEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#BE944E] cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Hạn Chót Xác Nhận Tham Dự</label>
                    <input
                      type="date"
                      value={rsvpDeadline}
                      onChange={(e) => setRsvpDeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Ghi Chú Đón Tiếp</label>
                    <textarea
                      rows={2}
                      value={rsvpCustomNote}
                      onChange={(e) => setRsvpCustomNote(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl bg-white border border-stone-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CỘT PHẢI: MÔ PHỎNG WORKSPACE XEM TRƯỚC (LIVE INTERACTIVE) */}
        {/* ======================================================== */}
        <div className="flex-1 bg-[#EBE7DF] p-4 sm:p-8 flex flex-col items-center justify-center overflow-y-auto relative">
          {/* TOP HELPER BADGE */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3.5 py-1 rounded-full bg-white/90 text-stone-700 border border-stone-200/80 text-xs font-semibold shadow-2xs flex items-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5 text-[#BE944E]" />
              <span>Cập nhật trực quan theo thời gian thực (Live Preview)</span>
            </span>
          </div>

          {/* DEVICE MOCKUP WRAPPER */}
          <div
            className={`transition-all duration-300 ${
              previewDevice === "mobile"
                ? "w-full max-w-[390px] aspect-[9/19]"
                : previewDevice === "tablet"
                ? "w-full max-w-[640px] aspect-[4/5]"
                : "w-full max-w-[900px] aspect-[16/10]"
            } bg-black rounded-[48px] p-3 shadow-2xl border-4 border-stone-800 relative`}
          >
            {/* Dynamic Island / Camera Notch on Mobile */}
            {previewDevice === "mobile" && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40" />
            )}

            {/* SCREEN VIEWPORT */}
            <div className="w-full h-full bg-[#FAF8F5] rounded-[38px] overflow-y-auto overflow-x-hidden relative shadow-inner">
              {category === "WEDDING" && <WeddingView card={previewCard} />}
              {category === "BIRTHDAY" && <BirthdayView card={previewCard} />}
              {category === "NEWBORN" && <NewbornView card={previewCard} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
