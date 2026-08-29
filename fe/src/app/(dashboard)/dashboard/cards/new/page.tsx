"use client";

import React, { useState, Suspense, useRef, useEffect } from "react";
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
  ArrowRight,
  Sparkle,
  Layers,
  Wand2,
  BookOpen,
  CheckCircle2,
  CheckCircle,
  HelpCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function NewCardBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-stone-500 font-serif">
          Đang khởi tạo Visual Studio Builder...
        </div>
      }
    >
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

const WIZARD_STEPS = [
  {
    number: 1,
    title: "Thông Tin & Cặp Đôi",
    desc: "Loại thiệp & Nhân vật chính",
    icon: Heart,
  },
  {
    number: 2,
    title: "Mẫu & Phong Cách",
    desc: "Theme, Tông màu & Nhạc nền",
    icon: Palette,
  },
  {
    number: 3,
    title: "Chi Tiết Tiệc & Mừng Cưới",
    desc: "Lịch trình, Album ảnh, VietQR",
    icon: Calendar,
  },
  {
    number: 4,
    title: "Kiểm Tra & Xuất Bản",
    desc: "Tổng quan & Xuất bản thiệp",
    icon: Sparkles,
  },
];

function CardBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CardCategory) || "WEDDING";

  // WIZARD STEP STATE (1 -> 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");

  // State cấu hình cơ bản (Không set dữ liệu cứng)
  const [category, setCategory] = useState<CardCategory>(initialCategory);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_PRESETS[0].id);
  const [slug, setSlug] = useState(`thiep-${Date.now().toString().slice(-6)}`);
  const [primaryColor, setPrimaryColor] = useState("#BE944E");
  const [fontFamily, setFontFamily] = useState("Playfair Display");
  const [openingEffect, setOpeningEffect] = useState<"WAX_SEAL" | "GATE_OPEN" | "NONE">("WAX_SEAL");
  const [fallingEffect, setFallingEffect] = useState<"PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON">("PETAL");
  const [greetingMessage, setGreetingMessage] = useState("");

  // Wedding Couples & Family State (Ban đầu rỗng để người dùng tự nhập)
  const [groomName, setGroomName] = useState("");
  const [groomShort, setGroomShort] = useState("");
  const [groomFather, setGroomFather] = useState("");
  const [groomMother, setGroomMother] = useState("");
  const [groomBirthOrder, setGroomBirthOrder] = useState("");

  const [brideName, setBrideName] = useState("");
  const [brideShort, setBrideShort] = useState("");
  const [brideFather, setBrideFather] = useState("");
  const [brideMother, setBrideMother] = useState("");
  const [brideBirthOrder, setBrideBirthOrder] = useState("");

  // Love Story Timeline (Ban đầu rỗng)
  const [loveStory, setLoveStory] = useState<
    { title: string; date: string; description: string; imageUrl: string }[]
  >([]);

  // Birthday state (Ban đầu rỗng)
  const [celebrantName, setCelebrantName] = useState("");
  const [age, setAge] = useState<number | string>("");

  // Newborn state (Ban đầu rỗng)
  const [babyName, setBabyName] = useState("");
  const [nickname, setNickname] = useState("");
  const [ceremonyType, setCeremonyType] = useState<"ANNOUNCEMENT_ONLY" | "FULL_MONTH" | "ONE_YEAR">("FULL_MONTH");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Events / Schedule (1 mốc mặc định ban đầu để người dùng điền)
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "event-1",
      eventName: "",
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      lunarDate: "",
      venueName: "",
      address: "",
      mapUrl: "",
    },
  ]);

  // Photos Gallery (Ban đầu rỗng)
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Background Music Studio
  const [selectedMusicSrc, setSelectedMusicSrc] = useState(MUSIC_OPTIONS[0].src);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [testPlayingSrc, setTestPlayingSrc] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);

  // VietQR Banking Box (Ban đầu rỗng)
  const [bankCodeGroom, setBankCodeGroom] = useState("");
  const [accNumGroom, setAccNumGroom] = useState("");
  const [accNameGroom, setAccNameGroom] = useState("");

  const [bankCodeBride, setBankCodeBride] = useState("");
  const [accNumBride, setAccNumBride] = useState("");
  const [accNameBride, setAccNameBride] = useState("");

  // RSVP Configuration
  const [isRsvpEnabled, setIsRsvpEnabled] = useState(true);
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [rsvpCustomNote, setRsvpCustomNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Cuộn preview khi chuyển step
  useEffect(() => {
    if (!previewViewportRef.current) return;
    if (currentStep === 1) {
      previewViewportRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      previewViewportRef.current.scrollTo({ top: 200, behavior: "smooth" });
    } else if (currentStep === 3) {
      previewViewportRef.current.scrollTo({ top: 600, behavior: "smooth" });
    } else if (currentStep === 4) {
      previewViewportRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

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

  // Build live preview card object (Hiển thị mượt mà với placeholder nếu chưa điền)
  const validEvents = events.filter((e) => e.eventName || e.venueName || e.address);
  const effectiveEvents =
    validEvents.length > 0
      ? validEvents.map((e) => ({ ...e, eventDate: new Date(e.eventDate) }))
      : [
          {
            id: "preview-event-1",
            eventName: "Lễ Thành Hôn & Tiệc Cưới",
            eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            lunarDate: "Ngày 16 Tháng 09 Năm Bính Ngọ",
            venueName: "Trung Tâm Hội Nghị Tiệc Cưới",
            address: "Địa chỉ tổ chức sự kiện",
            mapUrl: "https://maps.google.com",
          },
        ];

  const effectivePhotos =
    photos.length > 0
      ? photos
      : [
          {
            id: "placeholder-p1",
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
            caption: "Khoảnh khắc hạnh phúc",
          },
        ];

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
    greetingMessage:
      greetingMessage.trim() ||
      "Tình yêu không phải là nhìn nhau, mà là cùng nhìn về một hướng. Trân trọng kính mời bạn đến chung vui cùng chúng tôi.",
    bankingPrimary:
      bankCodeGroom || accNumGroom
        ? {
            bankCode: bankCodeGroom || "MB",
            accountNumber: accNumGroom || "...",
            accountName: accNameGroom || "CHÚ RỂ",
          }
        : undefined,
    bankingSecondary:
      bankCodeBride || accNumBride
        ? {
            bankCode: bankCodeBride || "VCB",
            accountNumber: accNumBride || "...",
            accountName: accNameBride || "CÔ DÂU",
          }
        : undefined,
    events: effectiveEvents,
    photos: effectivePhotos,
    categoryData:
      category === "WEDDING"
        ? {
            cardCategory: "WEDDING",
            groom: {
              fullName: groomName.trim() || "Tên Chú Rể",
              shortName: groomShort.trim() || groomName.trim() || "Chú Rể",
              birthOrder: groomBirthOrder.trim() || "Trưởng Nam",
              parents: {
                fatherName: groomFather.trim() || "Họ Tên Cha",
                motherName: groomMother.trim() || "Họ Tên Mẹ",
              },
            },
            bride: {
              fullName: brideName.trim() || "Tên Cô Dâu",
              shortName: brideShort.trim() || brideName.trim() || "Cô Dâu",
              birthOrder: brideBirthOrder.trim() || "Út Nữ",
              parents: {
                fatherName: brideFather.trim() || "Họ Tên Cha",
                motherName: brideMother.trim() || "Họ Tên Mẹ",
              },
            },
            loveStory,
            events: [],
          }
        : category === "BIRTHDAY"
        ? {
            cardCategory: "BIRTHDAY",
            celebrantName: celebrantName.trim() || "Tên Chủ Tiệc",
            age: Number(age) || 18,
            events: [],
          }
        : {
            cardCategory: "NEWBORN",
            babyName: babyName.trim() || "Tên Bé Yêu",
            nickname: nickname.trim() || "Bé Cưng",
            gender: "GIRL",
            birthDate: new Date(),
            weight: weight.trim() || "3.2 kg",
            height: height.trim() || "50 cm",
            ceremonyType,
            events: [],
          },
  };

  const handleSaveCard = async () => {
    setSaving(true);
    confetti({
      particleCount: 100,
      spread: 90,
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
      greetingMessage: greetingMessage.trim(),
      bankingPrimary:
        bankCodeGroom || accNumGroom
          ? { bankCode: bankCodeGroom, accountNumber: accNumGroom, accountName: accNameGroom }
          : undefined,
      bankingSecondary:
        bankCodeBride || accNumBride
          ? { bankCode: bankCodeBride, accountNumber: accNumBride, accountName: accNameBride }
          : undefined,
      photos,
      data: {
        cardCategory: category,
        events: events
          .filter((e) => e.eventName.trim() !== "")
          .map((e) => ({
            ...e,
            eventDate: new Date(e.eventDate),
          })),
        ...(category === "WEDDING"
          ? {
              groom: {
                fullName: groomName.trim(),
                shortName: groomShort.trim(),
                birthOrder: groomBirthOrder.trim(),
                parents: { fatherName: groomFather.trim(), motherName: groomMother.trim() },
              },
              bride: {
                fullName: brideName.trim(),
                shortName: brideShort.trim(),
                birthOrder: brideBirthOrder.trim(),
                parents: { fatherName: brideFather.trim(), motherName: brideMother.trim() },
              },
              loveStory,
            }
          : category === "BIRTHDAY"
          ? { celebrantName: celebrantName.trim(), age: Number(age) || 18 }
          : {
              babyName: babyName.trim(),
              nickname: nickname.trim(),
              gender: "BOY",
              birthDate: new Date(),
              weight: weight.trim(),
              height: height.trim(),
              ceremonyType,
            }),
      },
    };

    try {
      await ApiClient.request("/cards", {
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
      // Fallback
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
                <span>Tạo Thiệp Mới (Studio Wizard)</span>
                <span className="text-amber-500 text-xs">✦</span>
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#BE944E]/15 text-[#966E29] text-[10px] font-bold uppercase tracking-wider">
                Bước {currentStep}/4
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
              previewDevice === "mobile"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("tablet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              previewDevice === "tablet"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              previewDevice === "desktop"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* RIGHT: SAVE & PUBLISH */}
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

      {/* STEP PROGRESS BAR */}
      <div className="bg-white border-b border-[#EAE2D6] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {WIZARD_STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setCurrentStep(step.number)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition text-left cursor-pointer shrink-0 ${
                  isCurrent
                    ? "bg-[#FAF5EE] border border-[#BE944E]/40 text-stone-900 shadow-2xs"
                    : isCompleted
                    ? "text-stone-700 hover:bg-stone-50"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                    isCurrent
                      ? "bg-[#BE944E] text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                </div>

                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1">
                    <span>{step.title}</span>
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#BE944E]" />}
                  </div>
                  <div className="text-[10px] text-stone-500 hidden sm:block">
                    {step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN WORKSPACE: LEFT WIZARD FORM + RIGHT LIVE MOCKUP */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ======================================================== */}
        {/* CỘT TRÁI: FORM ĐIỀN THEO BƯỚC (WIZARD STEP FORM) */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[500px] xl:w-[560px] bg-white border-r border-[#EAE2D6] flex flex-col h-[calc(100vh-128px)] shadow-xs">
          {/* SCROLLABLE STEP FORM */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ---------------------------------------------------- */}
            {/* BƯỚC 1: LOẠI THIỆP & THÔNG TIN CẶP ĐÔI / CHỦ TIỆC */}
            {/* ---------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] text-[#966E29] border border-[#EAE0CD] text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Bước 1: Loại thiệp & Cặp đôi</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Chọn loại thiệp & Nhập thông tin chính
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Điền các thông tin thực tế của bạn để hiển thị trực quan trên thiệp xem trước bên phải.
                  </p>
                </div>

                {/* Chọn danh mục */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    1. Danh mục sự kiện
                  </label>
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
                </div>

                {/* Đường dẫn Slug */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    2. Đường dẫn thiệp (Link Slug)
                  </label>
                  <div className="flex items-center text-xs rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5">
                    <span className="text-stone-400 font-mono">cardvite.vn/thiep/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      placeholder="VD: minh-quan-thu-ha-2026"
                      className="font-bold font-mono text-[#BE944E] bg-transparent focus:outline-none flex-1 ml-1"
                    />
                  </div>
                </div>

                {/* THÔNG TIN RIÊNG THEO DANH MỤC */}
                {category === "WEDDING" && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      3. Thông tin Cô Dâu, Chú Rể & Hai Bên Gia Đình
                    </label>

                    {/* NHÀ TRAI */}
                    <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#BE944E]" />
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                          Nhà Trai • Chú Rể
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Tên Chú Rể (Đầy đủ)
                          </label>
                          <input
                            type="text"
                            value={groomName}
                            onChange={(e) => setGroomName(e.target.value)}
                            placeholder="VD: Trần Minh Quân"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#BE944E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Tên Thân Mật (Gọi tắt)
                          </label>
                          <input
                            type="text"
                            value={groomShort}
                            onChange={(e) => setGroomShort(e.target.value)}
                            placeholder="VD: Minh Quân"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#BE944E]"
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
                            placeholder="VD: Trần Văn Hùng"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Mẹ</label>
                          <input
                            type="text"
                            value={groomMother}
                            onChange={(e) => setGroomMother(e.target.value)}
                            placeholder="VD: Lê Thị Mai"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* NHÀ GÁI */}
                    <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/60 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                          Nhà Gái • Cô Dâu
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Tên Cô Dâu (Đầy đủ)
                          </label>
                          <input
                            type="text"
                            value={brideName}
                            onChange={(e) => setBrideName(e.target.value)}
                            placeholder="VD: Nguyễn Thu Hà"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#BE944E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Tên Thân Mật (Gọi tắt)
                          </label>
                          <input
                            type="text"
                            value={brideShort}
                            onChange={(e) => setBrideShort(e.target.value)}
                            placeholder="VD: Thu Hà"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#BE944E]"
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
                            placeholder="VD: Nguyễn Văn Dũng"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Mẹ</label>
                          <input
                            type="text"
                            value={brideMother}
                            onChange={(e) => setBrideMother(e.target.value)}
                            placeholder="VD: Phạm Thu Cúc"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {category === "BIRTHDAY" && (
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Thông Tin Chủ Tiệc Sinh Nhật
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Họ và Tên</label>
                        <input
                          type="text"
                          value={celebrantName}
                          onChange={(e) => setCelebrantName(e.target.value)}
                          placeholder="VD: Hoàng Bảo Nam"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tuổi</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="VD: 25"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === "NEWBORN" && (
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Thông Tin Bé Yêu
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Bé</label>
                        <input
                          type="text"
                          value={babyName}
                          onChange={(e) => setBabyName(e.target.value)}
                          placeholder="VD: Nguyễn Tuệ Nhi"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Biệt danh ở nhà</label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="VD: Bé Đậu"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* LỜI NGỎ */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    4. Lời ngỏ & Thông điệp gửi khách mời
                  </label>
                  <textarea
                    rows={3}
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    placeholder="Nhập thông điệp gửi tới khách mời hoặc câu trích dẫn tình yêu..."
                    className="w-full p-3 text-xs rounded-xl bg-stone-50 border border-stone-200 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BE944E]/30"
                  />
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* BƯỚC 2: MẪU THIẾT KẾ, MÀU SẮC & NHẠC NỀN */}
            {/* ---------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] text-[#966E29] border border-[#EAE0CD] text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Bước 2: Mẫu & Phong Cách Nghệ Thuật</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Tùy biến Mẫu giao diện, Tone màu & Âm nhạc
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Chọn phong cách quý phái phù hợp với chủ đề hôn lễ của bạn.
                  </p>
                </div>

                {/* Mẫu thiệp Preset */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                    1. Bộ sưu tập mẫu thiệp cao cấp
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

                {/* Màu chủ đạo */}
                <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    2. Tone màu hoàng gia chủ đạo
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

                {/* Hiệu ứng Mở Phong Bì & Rơi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">3. Hiệu ứng mở phong bì</label>
                    <select
                      value={openingEffect}
                      onChange={(e) => setOpeningEffect(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-white border border-stone-200 font-medium"
                    >
                      <option value="WAX_SEAL">Sáp Niêm Phong Vàng (Wax Seal)</option>
                      <option value="GATE_OPEN">Cổng Hoa Mở (Flower Gate)</option>
                      <option value="NONE">Mở Trực Tiếp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">4. Hiệu ứng rơi lãng mạn</label>
                    <select
                      value={fallingEffect}
                      onChange={(e) => setFallingEffect(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-white border border-stone-200 font-medium"
                    >
                      <option value="PETAL">Cánh Hoa Hồng Bay</option>
                      <option value="HEART">Trái Tim Yêu Thương</option>
                      <option value="SNOW">Tuyết Rơi Lãng Mạn</option>
                      <option value="CONFETTI">Kim Tuyến Pháo Hoa</option>
                      <option value="BALLOON">Bóng Bay Rực Rỡ</option>
                      <option value="NONE">Tắt Hiệu Ứng</option>
                    </select>
                  </div>
                </div>

                {/* Nhạc nền */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      5. Kho nhạc nền tuyển chọn
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAutoPlay}
                        onChange={(e) => setIsAutoPlay(e.target.checked)}
                        className="accent-[#BE944E]"
                      />
                      <span>Tự động phát</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    {MUSIC_OPTIONS.map((track) => {
                      const isSelected = selectedMusicSrc === track.src;
                      const isPlayingThis = testPlayingSrc === track.src;
                      return (
                        <div
                          key={track.src}
                          className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
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
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                                isPlayingThis
                                  ? "bg-[#BE944E] text-white"
                                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                              }`}
                              title="Nghe thử"
                            >
                              {isPlayingThis ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                            </button>

                            <div>
                              <h4 className="text-xs font-bold text-stone-900">{track.title}</h4>
                              <span className="text-[10px] text-stone-500">{track.artist}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stone-400">{track.duration}</span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-[#BE944E] bg-[#BE944E] text-white" : "border-stone-300"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* BƯỚC 3: CHI TIẾT TIỆC, ALBUM & MỪNG CƯỚI VIETQR */}
            {/* ---------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] text-[#966E29] border border-[#EAE0CD] text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Bước 3: Chi Tiết Tiệc, Album & Hộp Mừng Cưới</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Lịch trình, Album ảnh cưới & VietQR Mừng Cưới
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Cung cấp đầy đủ thời gian, địa điểm, hình ảnh và tài khoản ngân hàng để khách tiện mừng cưới.
                  </p>
                </div>

                {/* 1. LỊCH TRÌNH TIỆC */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      1. Lịch trình các buổi lễ & Tiệc mừng
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEvents([
                          ...events,
                          {
                            id: `event-${Date.now()}`,
                            eventName: "",
                            eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                            lunarDate: "",
                            venueName: "",
                            address: "",
                            mapUrl: "",
                          },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-[#FAF5EE] text-[#BE944E] border border-[#EAE0CD] text-xs font-bold flex items-center gap-1 hover:bg-[#BE944E] hover:text-white transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm Buổi Lễ</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {events.map((ev, idx) => (
                      <div key={ev.id || idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
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
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Tên Sự Kiện</label>
                            <input
                              type="text"
                              value={ev.eventName}
                              onChange={(e) => {
                                const updated = [...events];
                                updated[idx].eventName = e.target.value;
                                setEvents(updated);
                              }}
                              placeholder="VD: Lễ Thành Hôn / Vu Quy"
                              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#BE944E]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Thời Gian (Dương Lịch)</label>
                            <input
                              type="datetime-local"
                              value={typeof ev.eventDate === "string" ? ev.eventDate : new Date(ev.eventDate).toISOString().slice(0, 16)}
                              onChange={(e) => {
                                const updated = [...events];
                                updated[idx].eventDate = e.target.value;
                                setEvents(updated);
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Tên Địa Điểm / Sảnh</label>
                            <input
                              type="text"
                              value={ev.venueName}
                              onChange={(e) => {
                                const updated = [...events];
                                updated[idx].venueName = e.target.value;
                                setEvents(updated);
                              }}
                              placeholder="VD: Trung tâm Tiệc Cưới GEM Center"
                              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#BE944E]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Ngày Âm Lịch (Hiển thị)</label>
                            <input
                              type="text"
                              value={ev.lunarDate || ""}
                              onChange={(e) => {
                                const updated = [...events];
                                updated[idx].lunarDate = e.target.value;
                                setEvents(updated);
                              }}
                              placeholder="VD: Ngày 16 Tháng 09 Năm Bính Ngọ"
                              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-stone-600 mb-1">Địa Chỉ Chi Tiết</label>
                          <input
                            type="text"
                            value={ev.address}
                            onChange={(e) => {
                              const updated = [...events];
                              updated[idx].address = e.target.value;
                              setEvents(updated);
                            }}
                            placeholder="VD: 123 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP.HCM"
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#BE944E]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. ALBUM ẢNH CƯỚI */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      2. Album ảnh cưới kỷ niệm
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotos([
                          ...photos,
                          {
                            id: `p-${Date.now()}`,
                            url: "",
                            caption: "",
                          },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-[#FAF5EE] text-[#BE944E] border border-[#EAE0CD] text-xs font-bold flex items-center gap-1 hover:bg-[#BE944E] hover:text-white transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm Ảnh</span>
                    </button>
                  </div>

                  {photos.length === 0 ? (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-stone-200 text-center space-y-1.5 bg-stone-50/50">
                      <ImageIcon className="w-6 h-6 text-stone-400 mx-auto" />
                      <p className="text-xs text-stone-500 font-medium">Chưa có ảnh nào trong album</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotos([
                            {
                              id: `p-${Date.now()}`,
                              url: "",
                              caption: "",
                            },
                          ]);
                        }}
                        className="text-xs text-[#BE944E] font-bold hover:underline"
                      >
                        + Bấm vào đây để thêm ảnh đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {photos.map((item, idx) => (
                        <div key={item.id || idx} className="rounded-2xl border border-stone-200 bg-white p-2 space-y-1.5 relative group shadow-2xs">
                          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 relative flex items-center justify-center">
                            {item.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.url} alt="Photo" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[11px] text-stone-400 font-mono">Dán link ảnh</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
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
                            placeholder="Dán đường dẫn ảnh URL..."
                            className="w-full px-2 py-1 text-[10px] rounded-lg bg-stone-50 border border-stone-200 text-stone-600 truncate"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. MỪNG CƯỚI VIETQR */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    3. Hộp Mừng Cưới VietQR Napas247
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nhà Trai */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <span className="text-[11px] font-bold text-stone-800 uppercase block">
                        Tài Khoản Chú Rể (Nhà Trai)
                      </span>
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Ngân hàng</label>
                        <input
                          type="text"
                          value={bankCodeGroom}
                          onChange={(e) => setBankCodeGroom(e.target.value)}
                          placeholder="VD: MB, VCB, ACB..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Số tài khoản</label>
                        <input
                          type="text"
                          value={accNumGroom}
                          onChange={(e) => setAccNumGroom(e.target.value)}
                          placeholder="VD: 0988888888"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Tên chủ TK</label>
                        <input
                          type="text"
                          value={accNameGroom}
                          onChange={(e) => setAccNameGroom(e.target.value.toUpperCase())}
                          placeholder="VD: TRAN MINH QUAN"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-bold"
                        />
                      </div>
                    </div>

                    {/* Nhà Gái */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <span className="text-[11px] font-bold text-stone-800 uppercase block">
                        Tài Khoản Cô Dâu (Nhà Gái)
                      </span>
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Ngân hàng</label>
                        <input
                          type="text"
                          value={bankCodeBride}
                          onChange={(e) => setBankCodeBride(e.target.value)}
                          placeholder="VD: VCB, Vietinbank..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Số tài khoản</label>
                        <input
                          type="text"
                          value={accNumBride}
                          onChange={(e) => setAccNumBride(e.target.value)}
                          placeholder="VD: 9988776655"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5">Tên chủ TK</label>
                        <input
                          type="text"
                          value={accNameBride}
                          onChange={(e) => setAccNameBride(e.target.value.toUpperCase())}
                          placeholder="VD: NGUYEN THU HA"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white border border-stone-200 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* BƯỚC 4: KIỂM TRA TOÀN DIỆN & XUẤT BẢN THIỆP */}
            {/* ---------------------------------------------------- */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bước 4: Kiểm Tra Toàn Diện & Xuất Bản</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Sẵn sàng chia sẻ thiệp cưới online
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kiểm tra checklist các mục dưới đây và xem lại giao diện bên phải trước khi xuất bản.
                  </p>
                </div>

                {/* CHECKLIST ĐỘ HOÀN THIỆN */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D6] space-y-3.5 shadow-2xs">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Checklist Các Mục Trên Thiệp</span>
                    <span className="text-emerald-600 font-mono font-bold text-xs">
                      {groomName && brideName ? "100% Hoàn Thiện" : "Đang Soạn Thảo"}
                    </span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 ${groomName || brideName ? "text-emerald-500" : "text-stone-300"}`}
                        />
                        <span className="font-semibold text-stone-800">1. Thông tin Cặp Đôi & Phụ Mẫu</span>
                      </div>
                      <span className="text-stone-500 text-[11px]">
                        {groomName ? groomName : "Chưa nhập"} & {brideName ? brideName : "Chưa nhập"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-stone-800">2. Mẫu Thiệp & Tông Màu</span>
                      </div>
                      <span className="text-stone-500 text-[11px] flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        {primaryColor}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 ${validEvents.length > 0 ? "text-emerald-500" : "text-stone-300"}`}
                        />
                        <span className="font-semibold text-stone-800">3. Lịch Trình & Địa Điểm Tiệc</span>
                      </div>
                      <span className="text-stone-500 text-[11px]">
                        {validEvents.length > 0 ? `${validEvents.length} buổi lễ` : "Chưa nhập"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 ${photos.length > 0 ? "text-emerald-500" : "text-stone-300"}`}
                        />
                        <span className="font-semibold text-stone-800">4. Album Ảnh Cưới 4K</span>
                      </div>
                      <span className="text-stone-500 text-[11px]">
                        {photos.length > 0 ? `${photos.length} bức ảnh` : "Chưa thêm"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 ${bankCodeGroom || bankCodeBride ? "text-emerald-500" : "text-stone-300"}`}
                        />
                        <span className="font-semibold text-stone-800">5. Hộp Mừng Cưới VietQR Napas247</span>
                      </div>
                      <span className="text-stone-500 text-[11px] font-mono">
                        {bankCodeGroom || bankCodeBride ? "Đã thiết lập" : "Chưa nhập"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-stone-800">6. Nhạc Nền Du Dương</span>
                      </div>
                      <span className="text-stone-500 text-[11px]">Auto play sẵn sàng</span>
                    </div>
                  </div>
                </div>

                {/* NÚT XUẤT BẢN LỚN */}
                <div className="space-y-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveCard}
                    disabled={saving}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white font-serif font-bold text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{saving ? "Đang xử lý xuất bản..." : "Xuất Bản Thiệp Ngay ✨"}</span>
                  </motion.button>
                  <p className="text-[11px] text-center text-stone-500">
                    Sau khi xuất bản, bạn sẽ nhận được đường dẫn riêng để gửi bạn bè và mã QR in ấn.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM STEP CONTROLS (QUAY LẠI / TIẾP THEO) */}
          <div className="p-4 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                currentStep === 1
                  ? "text-stone-300 cursor-not-allowed"
                  : "text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 cursor-pointer shadow-2xs"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>

            <div className="flex items-center gap-1 text-xs font-mono text-stone-400">
              <span>{currentStep}</span>
              <span>/</span>
              <span>4</span>
            </div>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                className="px-5 py-2 rounded-xl bg-[#BE944E] hover:bg-[#A9813E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span>Tiếp theo: Bước {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span>Hoàn tất & Xuất bản</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
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
            <div
              ref={previewViewportRef}
              className="w-full h-full bg-[#FAF8F5] rounded-[38px] overflow-y-auto overflow-x-hidden relative shadow-inner"
            >
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
