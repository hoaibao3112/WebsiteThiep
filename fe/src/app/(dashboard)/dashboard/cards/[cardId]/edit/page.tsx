"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CardCategory, CardDetail, EventItem, PhotoItem } from "@/types/card.types";
import { WeddingView } from "@/components/wedding/WeddingView";
import { BirthdayView } from "@/components/birthday/BirthdayView";
import { NewbornView } from "@/components/newborn/NewbornView";
import { VisualCardEditor } from "@/components/editor/VisualCardEditor";
import { ApiClient } from "@/lib/api";
import { uploadSingleImage } from "@/lib/image-upload";
import { QuickFillModal, QuickFillData } from "@/components/card/QuickFillModal";
import { ApplyProfileModal, WeddingSectionKey } from "@/components/card/ApplyProfileModal";
import { WeddingAccordionForm } from "@/components/wedding/form/WeddingAccordionForm";
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
  ArrowLeft,
  BookOpen,
  QrCode,
  Sparkle,
  Upload,
  X,
  Star,
  FileMusic,
  Volume2,
  RefreshCw,
  Loader2,
  Pencil,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function EditCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#BE944E] animate-spin" />
            <p className="text-sm text-stone-500 font-serif">Đang tải thiệp...</p>
          </div>
        </div>
      }
    >
      <EditCardContent />
    </Suspense>
  );
}

// ────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────

const TEMPLATE_PRESETS = [
  {
    id: "wedding-heritage-crimson-gold",
    name: "Á Đông Cung Đình",
    category: "WEDDING",
    tag: "TRADITION",
    color: "#8B1E2D",
    font: "Playfair Display",
    bg: "/images/demo/couple-cover.png",
  },
  {
    id: "wedding-modern-editorial-magazine",
    name: "Tạp Chí Hàn Quốc",
    category: "WEDDING",
    tag: "EDITORIAL",
    color: "#543A2C",
    font: "Inter",
    bg: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-sweet-editorial-romance",
    name: "Sweet Pink Lãng Mạn",
    category: "WEDDING",
    tag: "ROMANCE",
    color: "#B84A39",
    font: "Great Vibes",
    bg: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-crimson-wine-marsala",
    name: "Đỏ Rượu Marsala",
    category: "WEDDING",
    tag: "CLASSIC",
    color: "#6B1724",
    font: "Playfair Display",
    bg: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-forest-green-botanical",
    name: "Rustic Xanh Rêu",
    category: "WEDDING",
    tag: "BOTANICAL",
    color: "#3D4A34",
    font: "Outfit",
    bg: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-pure-lotus-heritage",
    name: "Hoa Sen Báo Hỷ",
    category: "WEDDING",
    tag: "HERITAGE",
    color: "#3B5E43",
    font: "Playfair Display",
    bg: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-cinematic-editorial",
    name: "Điện Ảnh Lookbook",
    category: "WEDDING",
    tag: "CINEMATIC",
    color: "#1C1C1C",
    font: "Cinzel",
    bg: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-alpine-lake-romance",
    name: "Suối Nguồn Hồ Ngọc",
    category: "WEDDING",
    tag: "ALPINE",
    color: "#2B6B6D",
    font: "Playfair Display",
    bg: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop",
  },
  {
    id: "wedding-imperial-dragon-crimson",
    name: "Long Phụng Đỏ Đô",
    category: "WEDDING",
    tag: "ROYAL",
    color: "#6E1719",
    font: "Playfair Display",
    bg: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop",
  },
];

const MUSIC_OPTIONS = [
  // NHẠC CƯỚI VIỆT NAM
  { title: "Ngày Đầu Tiên", artist: "Đức Phúc", duration: "3:40", category: "VN", badge: "Hot Nhất", src: "/music/ngay-dau-tien.mp3" },
  { title: "Lễ Đường (Wedding Anthem)", artist: "Nhạc Cưới Tình Yêu", duration: "3:45", category: "VN", badge: "Yêu Thích", src: "/music/le-duong.mp3" },
  { title: "Xin Má Rước Dâu", artist: "Diệu Kiên", duration: "3:16", category: "VN", badge: "Rộn Ràng", src: "/music/xin-ma-ruoc-dau.mp3" },
  { title: "Hơn Cả Yêu", artist: "Đức Phúc", duration: "4:05", category: "VN", badge: "Ngọt Ngào", src: "/music/hon-ca-yeu.mp3" },
  { title: "Một Nhà", artist: "Da LAB", duration: "3:18", category: "VN", badge: "Vui Tươi", src: "/music/mot-nha.mp3" },
  // NHẠC CƯỚI QUỐC TẾ
  { title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", duration: "4:11", category: "INT", badge: "Siêu Hit", src: "/music/die-with-a-smile.mp3" },
  { title: "Beautiful In White", artist: "Shane Filan (Westlife)", duration: "3:30", category: "INT", badge: "Hoàng Gia", src: "/music/beautiful-in-white.mp3" },
  { title: "Marry You", artist: "Bruno Mars", duration: "3:50", category: "INT", badge: "Rộn Ràng", src: "/music/marry-you.mp3" },
  { title: "Everytime We Touch (Slow Acoustic)", artist: "Cascada Acoustic", duration: "3:16", category: "INT", badge: "Lãng Mạn", src: "/music/everytime-we-touch.mp3" },
  { title: "Like My Father", artist: "Jax", duration: "3:02", category: "INT", badge: "Ý Nghĩa", src: "/music/like-my-father.mp3" },
  { title: "Until I Found You", artist: "Stephen Sanchez", duration: "2:57", category: "INT", badge: "Trending", src: "/music/until-i-found-you.mp3" },
  { title: "I Do", artist: "911 Band", duration: "3:24", category: "INT", badge: "Kinh Điển", src: "/music/i-do.mp3" },
  { title: "A Thousand Years", artist: "Christina Perri", duration: "4:45", category: "INT", badge: "Bất Hủ", src: "/music/a-thousand-years.mp3" },
  { title: "Perfect", artist: "Ed Sheeran", duration: "4:23", category: "INT", badge: "Du Dương", src: "/music/perfect.mp3" },
];

const COLOR_PRESETS = [
  { name: "Gold Hoàng Gia", hex: "#BE944E" },
  { name: "Emerald Xanh Rêu", hex: "#2D5A3B" },
  { name: "Ruby Đỏ Rượu", hex: "#8B1E2F" },
  { name: "Midnight Xanh Đêm", hex: "#1A2E40" },
  { name: "Rose Gold Hồng Cam", hex: "#D48B77" },
  { name: "Plum Tím Quý Phái", hex: "#6B3074" },
];

const EDIT_TABS = [
  { key: "theme", label: "Giao Diện", icon: Palette },
  { key: "couple", label: "Cặp Đôi", icon: Heart },
  { key: "story", label: "Câu Chuyện", icon: BookOpen },
  { key: "events", label: "Lịch Trình", icon: Calendar },
  { key: "gallery", label: "Album Ảnh", icon: ImageIcon },
  { key: "music", label: "Nhạc Nền", icon: Music },
  { key: "banking", label: "Mừng Cưới", icon: Gift },
  { key: "rsvp", label: "RSVP", icon: Users },
] as const;

// ────────────────────────────────────────────────────────────────
// DEMO FALLBACK DATA
// ────────────────────────────────────────────────────────────────

const DEMO_CARD: CardDetail = {
  id: "demo-card-1",
  slug: "quan-va-ha-wedding",
  cardCategory: "WEDDING",
  status: "ACTIVE",
  openingEffect: "WAX_SEAL",
  fallingEffect: "PETAL",
  musicUrl: "/music/a-thousand-years.mp3",
  isAutoPlay: true,
  primaryColor: "#BE944E",
  fontFamily: "Playfair Display",
  greetingMessage:
    "Tình yêu không phải là nhìn nhau, mà là cùng nhìn về một hướng. Trân trọng kính mời bạn đến chung vui cùng chúng tôi.",
  categoryData: {
    cardCategory: "WEDDING",
    groom: {
      fullName: "Trần Minh Quân",
      shortName: "Minh Quân",
      birthOrder: "Trưởng Nam",
      parents: { fatherName: "Trần Văn Hùng", motherName: "Lê Thị Mai" },
    },
    bride: {
      fullName: "Nguyễn Thu Hà",
      shortName: "Thu Hà",
      birthOrder: "Út Nữ",
      parents: { fatherName: "Nguyễn Văn Dũng", motherName: "Phạm Thu Cúc" },
    },
    loveStory: [
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
    ],
    events: [],
  },
  bankingPrimary: { bankCode: "MB", accountNumber: "0988888888", accountName: "TRAN MINH QUAN" },
  bankingSecondary: { bankCode: "VCB", accountNumber: "9988776655", accountName: "NGUYEN THU HA" },
  events: [
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
      venueName: "GEM Center - Sảnh Grand Ballroom",
      address: "Số 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh",
      mapUrl: "https://maps.google.com",
    },
  ],
  photos: [
    { id: "p-1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop", caption: "Khoảnh khắc lãng mạn", isCover: true },
    { id: "p-2", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop", caption: "Nụ cười hạnh phúc" },
    { id: "p-3", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop", caption: "Ánh nhìn yêu thương" },
  ],
};

// ────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────

interface UploadedMusic {
  name: string;
  src: string; // objectURL or real URL
  duration?: string;
  isLocal?: boolean; // true = objectURL, not yet saved to server
}

// ────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────

function EditCardContent() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.cardId as string;

  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Active tab & device preview
  const [activeTab, setActiveTab] = useState<
    "theme" | "couple" | "story" | "events" | "gallery" | "music" | "banking" | "rsvp"
  >("theme");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [mobileViewMode, setMobileViewMode] = useState<"edit" | "preview">("edit");
  const currentTabIndex = EDIT_TABS.findIndex((t) => t.key === activeTab);

  // ── Base config ──
  const [category, setCategory] = useState<CardCategory>("WEDDING");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_PRESETS[0].id);
  const [slug, setSlug] = useState("");
  const [templateSlug, setTemplateSlug] = useState("wedding-minimalist-gold");
  const [isVipExperience, setIsVipExperience] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#BE944E");
  const [fontFamily, setFontFamily] = useState("Playfair Display");
  const [openingEffect, setOpeningEffect] = useState<"WAX_SEAL" | "GATE_OPEN" | "NONE">("WAX_SEAL");
  const [fallingEffect, setFallingEffect] = useState<"PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON" | "NONE">(
    "PETAL"
  );
  const [greetingMessage, setGreetingMessage] = useState("");

  // ── Wedding couple ──
  const [groomName, setGroomName] = useState("");
  const [groomShort, setGroomShort] = useState("");
  const [groomFather, setGroomFather] = useState("");
  const [groomMother, setGroomMother] = useState("");
  const [groomBirthOrder, setGroomBirthOrder] = useState("");
  const [groomAvatar, setGroomAvatar] = useState("");
  const [brideName, setBrideName] = useState("");
  const [brideShort, setBrideShort] = useState("");
  const [brideFather, setBrideFather] = useState("");
  const [brideMother, setBrideMother] = useState("");
  const [brideBirthOrder, setBrideBirthOrder] = useState("");
  const [brideAvatar, setBrideAvatar] = useState("");
  const [bridePhone, setBridePhone] = useState("");
  const [brideAddress, setBrideAddress] = useState("");
  const [groomPhone, setGroomPhone] = useState("");
  const [groomAddress, setGroomAddress] = useState("");
  const [isReverseOrder, setIsReverseOrder] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [showQuickFill, setShowQuickFill] = useState(false);

  // ── Editor Mode ("canvas" = WYSIWYG Studio, "form" = Accordion Form) ──
  const [editorMode, setEditorMode] = useState<"canvas" | "form">("canvas");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ── Love story ──
  const [loveStory, setLoveStory] = useState<
    { title: string; date: string; description?: string; imageUrl?: string }[]
  >([]);

  // ── Birthday / Newborn ──
  const [celebrantName, setCelebrantName] = useState("");
  const [age, setAge] = useState(25);
  const [babyName, setBabyName] = useState("");
  const [nickname, setNickname] = useState("");
  const [ceremonyType, setCeremonyType] = useState<"ANNOUNCEMENT_ONLY" | "FULL_MONTH" | "ONE_YEAR">("FULL_MONTH");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // ── Events ──
  const [events, setEvents] = useState<EventItem[]>([]);

  // ── Gallery ──
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null); // photo id being edited

  // ── Music ──
  const [musicTab, setMusicTab] = useState<"library" | "upload">("library");
  const [selectedMusicSrc, setSelectedMusicSrc] = useState(MUSIC_OPTIONS[0].src);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [testPlayingSrc, setTestPlayingSrc] = useState<string | null>(null);
  const [uploadedMusic, setUploadedMusic] = useState<UploadedMusic | null>(null);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Banking ──
  const [bankCodeGroom, setBankCodeGroom] = useState("MB");
  const [accNumGroom, setAccNumGroom] = useState("");
  const [accNameGroom, setAccNameGroom] = useState("");
  const [bankCodeBride, setBankCodeBride] = useState("VCB");
  const [accNumBride, setAccNumBride] = useState("");
  const [accNameBride, setAccNameBride] = useState("");

  // ── RSVP ──
  const [isRsvpEnabled, setIsRsvpEnabled] = useState(true);
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [rsvpCustomNote, setRsvpCustomNote] = useState("");

  // ── Save state ──
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  // ────────────────────────────────────────────────────────────────
  // LOAD DATA FROM API
  // ────────────────────────────────────────────────────────────────

  const populateFromCard = useCallback((card: CardDetail) => {
    setCategory(card.cardCategory);
    setSlug(card.slug);
    if (card.template?.slug) setTemplateSlug(card.template.slug);
    setIsVipExperience(Boolean((card as CardDetail & { plan?: { code?: string } }).plan?.code === "VIP"));
    setPrimaryColor(card.primaryColor);
    setFontFamily(card.fontFamily);
    setOpeningEffect((card.openingEffect as "WAX_SEAL" | "GATE_OPEN" | "NONE") || "WAX_SEAL");
    setFallingEffect(
      (card.fallingEffect as "PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON" | "NONE") || "PETAL"
    );
    setGreetingMessage(card.greetingMessage || "");
    setIsAutoPlay(card.isAutoPlay);
    setSelectedMusicSrc(card.musicUrl || MUSIC_OPTIONS[0].src);
    setEvents(
      (card.events || []).map((e) => ({
        ...e,
        eventDate: typeof e.eventDate === "string" ? e.eventDate : new Date(e.eventDate).toISOString().slice(0, 16),
      }))
    );
    setPhotos(card.photos || []);

    if (card.bankingPrimary) {
      setBankCodeGroom(card.bankingPrimary.bankCode);
      setAccNumGroom(card.bankingPrimary.accountNumber);
      setAccNameGroom(card.bankingPrimary.accountName);
    }
    if (card.bankingSecondary) {
      setBankCodeBride(card.bankingSecondary.bankCode);
      setAccNumBride(card.bankingSecondary.accountNumber);
      setAccNameBride(card.bankingSecondary.accountName);
    }

    if (card.cardCategory === "WEDDING" && card.categoryData.cardCategory === "WEDDING") {
      const { groom, bride, loveStory: ls } = card.categoryData;
      setGroomName(groom.fullName);
      setGroomShort(groom.shortName || "");
      setGroomBirthOrder(groom.birthOrder || "");
      setGroomAvatar(groom.avatarUrl || "");
      setGroomFather(groom.parents?.fatherName || "");
      setGroomMother(groom.parents?.motherName || "");
      if ((groom as any).phone) setGroomPhone((groom as any).phone);
      if ((groom as any).address) setGroomAddress((groom as any).address);
      setBrideName(bride.fullName);
      setBrideShort(bride.shortName || "");
      setBrideBirthOrder(bride.birthOrder || "");
      setBrideAvatar(bride.avatarUrl || "");
      setBrideFather(bride.parents?.fatherName || "");
      setBrideMother(bride.parents?.motherName || "");
      if ((bride as any).phone) setBridePhone((bride as any).phone);
      if ((bride as any).address) setBrideAddress((bride as any).address);
      setCoverPhotoUrl((card.categoryData as any).coverPhotoUrl || "");
      setLoveStory(ls || []);
      if ((card.categoryData as any).videoUrl) setVideoUrl((card.categoryData as any).videoUrl);
      if ((card.categoryData as any).isReverseOrder !== undefined) setIsReverseOrder((card.categoryData as any).isReverseOrder);
    } else if (card.cardCategory === "BIRTHDAY" && card.categoryData.cardCategory === "BIRTHDAY") {
      setCelebrantName(card.categoryData.celebrantName);
      setAge(card.categoryData.age || 25);
    } else if (card.cardCategory === "NEWBORN" && card.categoryData.cardCategory === "NEWBORN") {
      setBabyName(card.categoryData.babyName);
      setNickname(card.categoryData.nickname || "");
      setWeight(card.categoryData.weight || "");
      setHeight(card.categoryData.height || "");
      setCeremonyType(card.categoryData.ceremonyType);
    }
  }, []);

  const handleApplyQuickFill = useCallback((data: QuickFillData) => {
    if (data.groomName) setGroomName(data.groomName);
    if (data.groomFather) setGroomFather(data.groomFather);
    if (data.groomMother) setGroomMother(data.groomMother);
    if (data.brideName) setBrideName(data.brideName);
    if (data.brideFather) setBrideFather(data.brideFather);
    if (data.brideMother) setBrideMother(data.brideMother);

    if (data.eventDate) {
      const hour = parseInt(data.eventHour || "10", 10);
      const minute = parseInt(data.eventMinute || "0", 10);
      const dateStr = `${data.eventDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      setEvents((prev) => {
        if (prev.length > 0) {
          return [
            {
              ...prev[0],
              eventDate: dateStr,
              address: data.address || prev[0].address,
            },
            ...prev.slice(1),
          ];
        }
        return [
          {
            id: "event-main",
            eventName: "Lễ Thành Hôn",
            eventDate: dateStr,
            address: data.address || "Tư gia",
            venueName: "Trung tâm tiệc cưới",
          },
        ];
      });
    }

    if (data.photos && data.photos.length > 0) {
      setPhotos(
        data.photos.map((p, idx) => ({
          id: p.id || `photo-${idx}`,
          url: p.url,
          caption: p.caption,
          isCover: idx === 0,
        }))
      );
      if (data.photos[0]?.url) {
        setCoverPhotoUrl(data.photos[0].url);
      }
    }
  }, []);

  // ── WEDDING PROFILE INTEGRATION (TÙY CHỌN MỤC ÁP DỤNG) ──
  const [showApplyProfileModal, setShowApplyProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

  const handleApplyProfileSections = (profile: any, selectedKeys: WeddingSectionKey[]) => {
    if (!profile) return;

    if (selectedKeys.includes("couple")) {
      if (profile.groomName) setGroomName(profile.groomName);
      if (profile.groomShort !== undefined) setGroomShort(profile.groomShort);
      if (profile.groomBirthOrder !== undefined) setGroomBirthOrder(profile.groomBirthOrder);
      if (profile.groomPhone !== undefined) setGroomPhone(profile.groomPhone);
      if (profile.groomAddress !== undefined) setGroomAddress(profile.groomAddress);

      if (profile.brideName) setBrideName(profile.brideName);
      if (profile.brideShort !== undefined) setBrideShort(profile.brideShort);
      if (profile.brideBirthOrder !== undefined) setBrideBirthOrder(profile.brideBirthOrder);
      if (profile.bridePhone !== undefined) setBridePhone(profile.bridePhone);
      if (profile.brideAddress !== undefined) setBrideAddress(profile.brideAddress);

      if (profile.isReverseOrder !== undefined) setIsReverseOrder(profile.isReverseOrder);
    }

    if (selectedKeys.includes("parents")) {
      if (profile.groomFather !== undefined) setGroomFather(profile.groomFather);
      if (profile.groomMother !== undefined) setGroomMother(profile.groomMother);
      if (profile.brideFather !== undefined) setBrideFather(profile.brideFather);
      if (profile.brideMother !== undefined) setBrideMother(profile.brideMother);
    }

    if (selectedKeys.includes("datetime_venue") || selectedKeys.includes("schedule")) {
      if (profile.events && Array.isArray(profile.events) && profile.events.length > 0) {
        setEvents(profile.events);
      } else if (profile.eventDate) {
        setEvents([
          {
            id: "ev-main",
            eventName: "Lễ Thành Hôn",
            eventDate: profile.eventDate,
            venueName: "Trung tâm tiệc cưới",
            address: profile.address || "Tư gia",
          },
        ]);
      }
    }

    if (selectedKeys.includes("greeting")) {
      if (profile.greetingMessage) setGreetingMessage(profile.greetingMessage);
    }

    if (selectedKeys.includes("loveStory")) {
      if (profile.loveStory && Array.isArray(profile.loveStory)) {
        setLoveStory(profile.loveStory);
      }
    }

    if (selectedKeys.includes("photos")) {
      if (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0) {
        setPhotos(
          profile.photos.map((p: any, idx: number) => ({
            id: p.id || `ph-${idx}`,
            url: p.url,
            caption: p.caption,
            isCover: p.isCover || idx === 0,
          }))
        );
      }
    }

    if (selectedKeys.includes("banking")) {
      const gBank = profile.bankCodeGroom || profile.bankGroom?.bankCode;
      const gNum = profile.accNumGroom || profile.bankGroom?.accountNumber;
      const gName = profile.accNameGroom || profile.bankGroom?.accountName;
      const bBank = profile.bankCodeBride || profile.bankBride?.bankCode;
      const bNum = profile.accNumBride || profile.bankBride?.accountNumber;
      const bName = profile.accNameBride || profile.bankBride?.accountName;

      if (gBank) setBankCodeGroom(gBank);
      if (gNum !== undefined) setAccNumGroom(gNum);
      if (gName !== undefined) setAccNameGroom(gName);

      if (bBank) setBankCodeBride(bBank);
      if (bNum !== undefined) setAccNumBride(bNum);
      if (bName !== undefined) setAccNameBride(bName);
    }

    if (selectedKeys.includes("music")) {
      if (profile.selectedMusicSrc || profile.musicUrl) {
        setSelectedMusicSrc(profile.selectedMusicSrc || profile.musicUrl);
      }
      if (profile.videoUrl !== undefined) {
        setVideoUrl(profile.videoUrl);
      }
    }

    if (selectedKeys.includes("theme")) {
      if (profile.templateSlug) setTemplateSlug(profile.templateSlug);
      if (profile.primaryColor) setPrimaryColor(profile.primaryColor);
      if (profile.openingEffect) setOpeningEffect(profile.openingEffect);
    }

    confetti({ particleCount: 45, spread: 60, origin: { y: 0.3 } });
  };

  const handleSaveToProfile = async () => {
    setSavingProfile(true);
    setSaveProfileSuccess(false);
    try {
      const payload = {
        templateSlug: templateSlug || selectedTemplate,
        primaryColor,
        openingEffect,
        groomName,
        groomShort,
        groomBirthOrder,
        groomFather,
        groomMother,
        groomPhone,
        groomAddress,
        brideName,
        brideShort,
        brideBirthOrder,
        brideFather,
        brideMother,
        bridePhone,
        brideAddress,
        isReverseOrder,
        greetingMessage,
        loveStory,
        events,
        photos,
        bankCodeGroom,
        accNumGroom,
        accNameGroom,
        bankCodeBride,
        accNumBride,
        accNameBride,
        selectedMusicSrc,
        videoUrl,
      };

      const res = await ApiClient.request("/user/wedding-profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSaveProfileSuccess(true);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
        setTimeout(() => setSaveProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      const res = await ApiClient.request<CardDetail>(`/cards/${cardId}`);
      if (res.success && res.data) populateFromCard(res.data);
      else setLoadError(res.error || "Không thể tải dữ liệu thiệp.");
      setLoading(false);
    };
    load();
  }, [cardId, populateFromCard, loadAttempt]);

  // ────────────────────────────────────────────────────────────────
  // PHOTO UPLOAD HANDLERS
  // ────────────────────────────────────────────────────────────────

  const processImageFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (fileArr.length === 0) return;

      setUploadingPhotos(true);
      const newPhotos: PhotoItem[] = [];

      for (const file of fileArr) {
        const tempId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        try {
          // uploadSingleImage sẽ thử upload lên server, nếu server lỗi sẽ nén client-side ra Data URL base64 an toàn 100%
          const safeUrl = await uploadSingleImage(file);
          newPhotos.push({
            id: tempId,
            url: safeUrl,
            caption: file.name.replace(/\.[^.]+$/, ""),
            isCover: photos.length === 0 && newPhotos.length === 0,
          });
        } catch {
          // Fallback cuối cùng bằng FileReader base64
          const base64Url = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newPhotos.push({
            id: tempId,
            url: base64Url,
            caption: file.name.replace(/\.[^.]+$/, ""),
            isCover: photos.length === 0 && newPhotos.length === 0,
          });
        }
      }

      setPhotos((prev) => [...prev, ...newPhotos]);
      setUploadingPhotos(false);
    },
    [photos]
  );

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processImageFiles(e.target.files);
    e.target.value = "";
  };

  const handlePhotoDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      processImageFiles(e.dataTransfer.files);
    },
    [processImageFiles]
  );

  const handleSetCover = (id: string) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === id })));
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      // If deleted was cover, make first one cover
      if (filtered.length > 0 && !filtered.some((p) => p.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  // ────────────────────────────────────────────────────────────────
  // MUSIC UPLOAD HANDLERS
  // ────────────────────────────────────────────────────────────────

  const handleMusicFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploadingMusic(true);
    const localUrl = URL.createObjectURL(file);

    // Get duration via audio element
    const tempAudio = new Audio(localUrl);
    const duration = await new Promise<string>((resolve) => {
      tempAudio.addEventListener("loadedmetadata", () => {
        const s = Math.floor(tempAudio.duration);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        resolve(`${m}:${sec.toString().padStart(2, "0")}`);
      });
      setTimeout(() => resolve("?:??"), 3000);
    });

    const music: UploadedMusic = {
      name: file.name.replace(/\.[^.]+$/, ""),
      src: localUrl,
      duration,
      isLocal: true,
    };

    // Try upload to server
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await ApiClient.request<{ url: string }>("/upload/music", {
        method: "POST",
        body: formData,
      });
      if (res.success && res.data?.url) {
        URL.revokeObjectURL(localUrl);
        music.src = res.data.url;
        music.isLocal = false;
      }
    } catch {
      // Keep localUrl — preview still works
    }

    setUploadedMusic(music);
    setSelectedMusicSrc(music.src);
    setMusicTab("upload");
    setUploadingMusic(false);
  }, []);

  // ────────────────────────────────────────────────────────────────
  // AUDIO PREVIEW
  // ────────────────────────────────────────────────────────────────

  const handleToggleTestMusic = (src: string) => {
    if (!previewAudioRef.current) return;
    if (testPlayingSrc === src) {
      previewAudioRef.current.pause();
      setTestPlayingSrc(null);
    } else {
      previewAudioRef.current.src = src;
      previewAudioRef.current.play().catch(() => {});
      setTestPlayingSrc(src);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // BUILD LIVE PREVIEW CARD
  // ────────────────────────────────────────────────────────────────

  const previewCard: CardDetail = {
    id: cardId,
    slug,
    cardCategory: category,
    status: "ACTIVE",
    openingEffect: "NONE",
    fallingEffect: fallingEffect as any,
    isAutoPlay,
    primaryColor,
    fontFamily,
    musicUrl: selectedMusicSrc,
    greetingMessage,
    bankingPrimary: { bankCode: bankCodeGroom, accountNumber: accNumGroom, accountName: accNameGroom },
    bankingSecondary: { bankCode: bankCodeBride, accountNumber: accNumBride, accountName: accNameBride },
    events: events.map((e) => ({ ...e, eventDate: new Date(e.eventDate) })),
    photos,
    categoryData:
      category === "WEDDING"
        ? {
            cardCategory: "WEDDING",
            coverPhotoUrl: coverPhotoUrl || photos.find((p) => p.isCover)?.url || photos[0]?.url,
            groom: {
              fullName: groomName,
              shortName: groomShort,
              birthOrder: groomBirthOrder,
              avatarUrl: groomAvatar,
              parents: { fatherName: groomFather, motherName: groomMother },
            },
            bride: {
              fullName: brideName,
              shortName: brideShort,
              birthOrder: brideBirthOrder,
              avatarUrl: brideAvatar,
              parents: { fatherName: brideFather, motherName: brideMother },
            },
            loveStory,
            events: [],
          }
        : category === "BIRTHDAY"
        ? { cardCategory: "BIRTHDAY", celebrantName, age, events: [] }
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

  // Sync edits from VisualCardEditor back to local state hooks
  const handleDraftChange = useCallback((nextDraft: CardDetail) => {
    setHasUnsavedChanges(true);
    if (nextDraft.primaryColor) setPrimaryColor(nextDraft.primaryColor);
    if (nextDraft.fontFamily) setFontFamily(nextDraft.fontFamily);
    if (nextDraft.musicUrl !== undefined) setSelectedMusicSrc(nextDraft.musicUrl || "");
    if (nextDraft.greetingMessage !== undefined) setGreetingMessage(nextDraft.greetingMessage || "");
    if (nextDraft.fallingEffect) setFallingEffect(nextDraft.fallingEffect as any);
    if (nextDraft.openingEffect) setOpeningEffect(nextDraft.openingEffect as any);
    if ((nextDraft as any).templateSlug) setTemplateSlug((nextDraft as any).templateSlug);

    const catData = nextDraft.categoryData as any;
    if (catData) {
      if (catData.groom) {
        if (catData.groom.fullName !== undefined) setGroomName(catData.groom.fullName || "");
        if (catData.groom.shortName !== undefined) setGroomShort(catData.groom.shortName || "");
        if (catData.groom.birthOrder !== undefined) setGroomBirthOrder(catData.groom.birthOrder || "");
        if (catData.groom.avatarUrl !== undefined) setGroomAvatar(catData.groom.avatarUrl || "");
        if (catData.groom.parents) {
          if (catData.groom.parents.fatherName !== undefined) setGroomFather(catData.groom.parents.fatherName || "");
          if (catData.groom.parents.motherName !== undefined) setGroomMother(catData.groom.parents.motherName || "");
        }
      }
      if (catData.bride) {
        if (catData.bride.fullName !== undefined) setBrideName(catData.bride.fullName || "");
        if (catData.bride.shortName !== undefined) setBrideShort(catData.bride.shortName || "");
        if (catData.bride.birthOrder !== undefined) setBrideBirthOrder(catData.bride.birthOrder || "");
        if (catData.bride.avatarUrl !== undefined) setBrideAvatar(catData.bride.avatarUrl || "");
        if (catData.bride.parents) {
          if (catData.bride.parents.fatherName !== undefined) setBrideFather(catData.bride.parents.fatherName || "");
          if (catData.bride.parents.motherName !== undefined) setBrideMother(catData.bride.parents.motherName || "");
        }
      }
      if (catData.coverPhotoUrl) {
        setCoverPhotoUrl(catData.coverPhotoUrl);
        setPhotos((prev) => {
          const idx = prev.findIndex((p) => p.isCover);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], url: catData.coverPhotoUrl };
            return copy;
          }
          return [{ id: "cover", url: catData.coverPhotoUrl, isCover: true }, ...prev];
        });
      }
    }
  }, []);


  // ────────────────────────────────────────────────────────────────
  // SAVE (PUT)
  // ────────────────────────────────────────────────────────────────

  const handleSaveCard = async () => {
    setSaving(true);
    setSaveError(null);

    // 1. Chuẩn hóa hình ảnh: chuyển đổi mọi blob URL thành Base64 Data URL nếu có
    const safePhotos = await Promise.all(
      photos.map(async (p) => {
        let safeUrl = p.url;
        if (safeUrl.startsWith("blob:")) {
          try {
            const resp = await fetch(safeUrl);
            const blob = await resp.blob();
            safeUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch {
            safeUrl = "";
          }
        }
        return {
          id: p.id?.startsWith("local-") || p.id?.startsWith("photo-") ? undefined : p.id || undefined,
          url: safeUrl,
          thumbUrl: p.thumbUrl || undefined,
          caption: p.caption?.trim() || undefined,
          isCover: Boolean(p.isCover),
        };
      })
    );

    // Lọc các ảnh rỗng hoặc không hợp lệ, loại bỏ hoàn toàn các trường null
    const validPhotos = safePhotos
      .filter((p) => Boolean(p.url && !p.url.startsWith("blob:")))
      .map((p, idx) => ({
        id: p.id || undefined,
        url: p.url,
        thumbUrl: p.thumbUrl || undefined,
        caption: p.caption || undefined,
        isCover: p.isCover ?? idx === 0,
      }));

    // 2. Chuẩn hóa sự kiện: eventDate phải luôn là chuỗi ISO Date hợp lệ
    const formattedEvents = events.map((e) => {
      let isoDate: string;
      try {
        const d = e.eventDate ? new Date(e.eventDate) : new Date();
        isoDate = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      } catch {
        isoDate = new Date().toISOString();
      }
      return {
        id: e.id?.startsWith("local-") || e.id?.startsWith("event-") ? undefined : e.id,
        eventName: e.eventName?.trim() || "Lễ Cưới",
        eventDate: isoDate,
        lunarDate: e.lunarDate?.trim() || undefined,
        venueName: e.venueName?.trim() || "Chưa cập nhật",
        address: e.address?.trim() || "Chưa cập nhật",
        mapUrl: e.mapUrl?.trim() || undefined,
      };
    });

    // 3. Chuẩn hóa tài khoản mừng cưới: chỉ gửi khi có số tài khoản và tên chủ thẻ
    const hasGroomBank = Boolean(accNumGroom?.trim() && accNameGroom?.trim());
    const hasBrideBank = Boolean(accNumBride?.trim() && accNameBride?.trim());

    const bankingPrimary = hasGroomBank
      ? {
          bankCode: bankCodeGroom?.trim() || "MB",
          accountNumber: accNumGroom.trim(),
          accountName: accNameGroom.trim(),
        }
      : undefined;

    const bankingSecondary = hasBrideBank
      ? {
          bankCode: bankCodeBride?.trim() || "VCB",
          accountNumber: accNumBride.trim(),
          accountName: accNameBride.trim(),
        }
      : undefined;

    // 4. Chuẩn hóa slug và templateSlug
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "") || `thiep-${Date.now()}`;
    const cleanTemplateSlug = templateSlug || selectedTemplate || "wedding-heritage-crimson-gold";
    const cleanMusicUrl = selectedMusicSrc?.startsWith("blob:") ? undefined : (selectedMusicSrc?.trim() || undefined);

    // 5. Chuẩn hóa Category Data
    const categoryDataPayload = {
      cardCategory: category,
      events: formattedEvents,
      ...(category === "WEDDING"
        ? {
            groom: {
              fullName: groomName?.trim() || "Chú Rể",
              shortName: groomShort?.trim() || undefined,
              birthOrder: groomBirthOrder?.trim() || undefined,
              phone: groomPhone?.trim() || undefined,
              address: groomAddress?.trim() || undefined,
              parents: (groomFather?.trim() || groomMother?.trim())
                ? { fatherName: groomFather?.trim() || undefined, motherName: groomMother?.trim() || undefined }
                : undefined,
            },
            bride: {
              fullName: brideName?.trim() || "Cô Dâu",
              shortName: brideShort?.trim() || undefined,
              birthOrder: brideBirthOrder?.trim() || undefined,
              phone: bridePhone?.trim() || undefined,
              address: brideAddress?.trim() || undefined,
              parents: (brideFather?.trim() || brideMother?.trim())
                ? { fatherName: brideFather?.trim() || undefined, motherName: brideMother?.trim() || undefined }
                : undefined,
            },
            loveStory: loveStory.map((item) => ({
              title: item.title?.trim() || "Kỷ niệm",
              date: item.date?.trim() || "",
              description: item.description?.trim() || undefined,
              imageUrl: item.imageUrl?.startsWith("blob:") ? undefined : item.imageUrl || undefined,
            })),
            photos: validPhotos,
            videoUrl: videoUrl?.trim() || undefined,
            isReverseOrder,
          }
        : category === "BIRTHDAY"
        ? { celebrantName: celebrantName?.trim() || "Chủ Tiệc", age: Number(age) || 18, events: formattedEvents }
        : {
            babyName: babyName?.trim() || "Bé Yêu",
            nickname: nickname?.trim() || undefined,
            gender: "GIRL" as const,
            birthDate: new Date().toISOString(),
            weight: weight?.trim() || undefined,
            height: height?.trim() || undefined,
            ceremonyType,
            events: formattedEvents,
          }),
    };

    const payload = {
      slug: cleanSlug,
      templateSlug: cleanTemplateSlug,
      openingEffect,
      fallingEffect,
      primaryColor,
      fontFamily,
      musicUrl: cleanMusicUrl,
      isAutoPlay,
      greetingMessage: greetingMessage?.trim() || undefined,
      bankingPrimary,
      bankingSecondary,
      photos: validPhotos,
      events: formattedEvents,
      data: categoryDataPayload,
    };

    try {
      const res = await ApiClient.request<{ id: string; slug: string }>(`/cards/${cardId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSaving(false);

      if (!res.success) {
        const errorDetails = (res as any).fieldErrors
          ? Object.entries((res as any).fieldErrors)
              .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
              .join("; ")
          : "";
        setSaveError(
          res.error
            ? `${res.error}${errorDetails ? ` (${errorDetails})` : ""}`
            : "Không thể lưu thay đổi. Vui lòng kiểm tra lại thông tin."
        );
        return;
      }

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, colors: ["#BE944E", "#D4AF37", "#FFFFFF"] });
      setSaveError(null);
      setSuccessToast(true);
      setHasUnsavedChanges(false);
      setTimeout(() => {
        setSuccessToast(false);
        router.push(`/thiep/${cleanSlug}`);
      }, 1800);
    } catch {
      setSaving(false);
      setSaveError("Không thể kết nối máy chủ. Dữ liệu của bạn vẫn được giữ nguyên.");
    }
  };

  // ────────────────────────────────────────────────────────────────
  // LOADING SCREEN
  // ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#BE944E]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#BE944E] animate-spin" />
          </div>
          <p className="text-sm text-stone-600 font-serif">Đang tải dữ liệu thiệp...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-6">
        <div role="alert" className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <h1 className="font-serif text-xl font-bold text-stone-900">Không thể mở thiệp</h1>
          <p className="mt-2 text-sm text-rose-700">{loadError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/dashboard/cards" className="min-h-11 rounded-xl border px-4 py-2.5 text-sm font-semibold">Quay lại</Link>
            <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="min-h-11 rounded-xl bg-[#BE944E] px-4 py-2.5 text-sm font-bold text-white">Thử lại</button>
          </div>
        </div>
      </main>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col font-sans text-stone-900 selection:bg-amber-200">
      {/* Hidden audio element for previewing songs */}
      <audio ref={previewAudioRef} onEnded={() => setTestPlayingSrc(null)} />

      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a"
        className="hidden"
        onChange={handleMusicFileChange}
      />

      {/* ── TOP HEADER ── */}
      <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-[#E8E2D6] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        {editorMode === "canvas" ? (
          <>
            {/* LEFT: BACK + BRAND LOGO + MODE TOGGLE */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <Link
                href="/dashboard/cards"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition shrink-0"
                title="Quay lại danh sách thiệp"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              {/* LOGO "ngày chung đôi" KHỚP VỚI ẢNH CHỤP */}
              <div className="flex items-center gap-2 select-none">
                <div className="size-7 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-2xs">
                  <Heart className="size-4 fill-pink-500 text-pink-500" />
                </div>
                <span className="font-serif font-bold text-sm sm:text-base text-stone-900 tracking-tight hidden xs:inline">
                  ngày chung đôi
                </span>
              </div>

              {/* MODE SWITCHER */}
              <div className="flex items-center bg-stone-100 p-0.5 sm:p-1 rounded-xl border border-stone-200 gap-0.5">
                <button
                  type="button"
                  onClick={() => setEditorMode("canvas")}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-stone-900 shadow-2xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Studio</span>
                  <span>Canvas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("form")}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition"
                >
                  <Pencil className="w-3.5 h-3.5 text-stone-500" />
                  <span>Biểu Mẫu</span>
                </button>
              </div>
            </div>

            {/* CENTER: UNSAVED CHANGES STATUS */}
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/90 px-3 py-1 rounded-full shadow-2xs animate-in fade-in">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="hidden xs:inline">Có thay đổi chưa lưu</span>
                  <span className="xs:hidden">Chưa lưu</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/90 px-3 py-1 rounded-full shadow-2xs">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Đã lưu</span>
                </div>
              )}
            </div>

            {/* RIGHT: VIEW CARD & "LƯU THIỆP" BUTTON NỀN ĐEN KHỚP ẢNH MẪU */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href={`/thiep/${slug}`}
                target="_blank"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Thiệp</span>
              </Link>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveCard}
                disabled={saving}
                className="px-5 sm:px-6 py-2 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 cursor-pointer transition disabled:opacity-60 shrink-0"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-white/90" />
                )}
                <span>{saving ? "Đang lưu..." : "Lưu thiệp"}</span>
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <Link
                href="/dashboard/cards"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition shrink-0"
                title="Quay lại danh sách thiệp"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-sm sm:text-lg text-stone-900 tracking-tight flex items-center gap-1.5 truncate">
                    <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BE944E] shrink-0" />
                    <span className="truncate">Chỉnh Sửa Thiệp</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#BE944E]/15 text-[#966E29] text-[11px] font-bold shrink-0">
                    {category === "WEDDING" ? "Thiệp Cưới" : category === "BIRTHDAY" ? "Sinh Nhật" : "Thôi Nôi"}
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-stone-400 font-mono truncate">
                  /thiep/<span className="text-[#BE944E] font-bold">{slug}</span>
                </p>
              </div>
            </div>

            {/* CENTER: MODE SWITCHER & DEVICE TOGGLE */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-100 p-0.5 sm:p-1 rounded-xl border border-stone-200 gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => setEditorMode("canvas")}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden xs:inline">Studio</span>
                  <span>Trực Quan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("form")}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-stone-900 shadow-2xs flex items-center gap-1.5 transition"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#BE944E]" />
                  <span className="hidden xs:inline">Biểu</span>
                  <span>Mẫu</span>
                </button>
              </div>

              {/* Form mode only on mobile: Edit / Preview Switcher */}
              <div className="flex lg:hidden items-center bg-stone-100 p-0.5 sm:p-1 rounded-xl border border-stone-200 gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileViewMode("edit")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition ${
                    mobileViewMode === "edit"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <span>Nhập Liệu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode("preview")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition ${
                    mobileViewMode === "preview"
                      ? "bg-[#BE944E] text-white shadow-2xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Xem</span>
                </button>
              </div>

              {/* Form mode only on desktop: Device Preview Toggle */}
              <div className="hidden lg:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1">
                {[
                  { key: "mobile", icon: <Smartphone className="w-3.5 h-3.5" />, label: "Mobile" },
                  { key: "tablet", icon: <Tablet className="w-3.5 h-3.5" />, label: "Tablet" },
                  { key: "desktop", icon: <Laptop className="w-3.5 h-3.5" />, label: "Desktop" },
                ].map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setPreviewDevice(d.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      previewDevice === d.key ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {d.icon}
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: SAVE & PREVIEW */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href={`/thiep/${slug}`}
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition"
              >
                <span>Xem Thiệp</span>
              </Link>

              {/* QUICK FILL MODAL TRIGGER */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowApplyProfileModal(true)}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
                title="Lấy dữ liệu từ Hồ Sơ Cưới tài khoản đưa vào thiệp"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Áp Dụng Từ Hồ Sơ</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowQuickFill(true)}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer shadow-2xs shrink-0"
              >
                <span>Điền Nhanh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveCard}
                disabled={saving}
                className="px-3.5 sm:px-6 py-2 rounded-full bg-gradient-to-r from-[#B68837] via-[#D8B062] to-[#A2772A] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider sm:tracking-widest shadow-md flex items-center gap-1.5 sm:gap-2 cursor-pointer transition disabled:opacity-60 shrink-0"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
              </motion.button>
            </div>
          </>
        )}
      </header>

      {/* ── SUCCESS TOAST ── */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-xl"
          >
            {saveError}
          </motion.div>
        )}
        {successToast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Lưu thành công! Đang chuyển trang...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WORKSPACE (CANVAS STUDIO vs FORM) ── */}
      {editorMode === "canvas" ? (
        <VisualCardEditor
          draft={previewCard}
          templateSlug={templateSlug || selectedTemplate}
          onSave={handleSaveCard}
          isVip={isVipExperience}
          onDraftChange={handleDraftChange}
        >
          {category === "WEDDING" && (
            <WeddingView card={previewCard} templateSlug={templateSlug || selectedTemplate} isPreview={true} />
          )}
          {category === "BIRTHDAY" && (
            <BirthdayView card={previewCard} templateSlug={templateSlug || selectedTemplate} isPreview={true} />
          )}
          {category === "NEWBORN" && (
            <NewbornView card={previewCard} templateSlug={templateSlug || selectedTemplate} isPreview={true} />
          )}
        </VisualCardEditor>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row-reverse overflow-hidden">

        {/* ══════════════════════════════════════════════════ */}
        {/* CỘT PHẢI: FORM CHỈNH SỬA                         */}
        {/* ══════════════════════════════════════════════════ */}
        <div className={`w-full lg:w-[500px] xl:w-[580px] bg-white lg:border-l border-[#EAE2D6] flex flex-col h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] shadow-xs ${
          mobileViewMode === "preview" ? "hidden lg:flex" : "flex"
        }`}>
          {/* STICKY TOP TAB BAR */}
          <div className="border-b border-[#E8E2D6] bg-[#FAF8F5]/95 backdrop-blur-md px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 sticky top-0 z-30 shadow-2xs">
            {EDIT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition cursor-pointer min-h-[38px] ${
                    activeTab === tab.key
                      ? "bg-[#BE944E] text-white shadow-xs"
                      : "text-stone-600 bg-white hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* ══ TAB 1: GIAO DIỆN ══ */}
            {activeTab === "theme" && (
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Palette className="w-4 h-4 text-[#BE944E]" />
                    <span>Chọn Danh Mục & Phong Cách</span>
                  </h3>
                  <p className="text-xs text-stone-500">Tùy biến tông màu hoàng gia và hiệu ứng mở phong bì.</p>
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
                      className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer min-h-[52px] ${
                        category === c.key
                          ? "bg-gradient-to-tr from-[#B68837] to-[#E2BC6A] text-white border-amber-600 shadow-md"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {c.icon}
                      <span className="text-[11px] sm:text-xs text-center">{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mẫu thiệp preset */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                    Bộ Sưu Tập Mẫu Thiệp
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {TEMPLATE_PRESETS.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => { setSelectedTemplate(tpl.id); setTemplateSlug(tpl.id); setPrimaryColor(tpl.color); setFontFamily(tpl.font); }}
                        className={`rounded-2xl border p-3 cursor-pointer transition relative overflow-hidden flex flex-col justify-between h-28 sm:h-32 group ${
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-amber-200 uppercase">{tpl.tag}</span>
                          <span className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: tpl.color }} />
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-xs font-serif font-bold text-stone-900 leading-snug">{tpl.name}</h4>
                          <span className="text-[10px] text-stone-500 font-mono">{tpl.font}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Màu sắc */}
                <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Màu Chủ Đạo</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {COLOR_PRESETS.map((clr) => (
                      <button
                        key={clr.hex}
                        type="button"
                        onClick={() => setPrimaryColor(clr.hex)}
                        className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer min-h-[38px] ${
                          primaryColor === clr.hex
                            ? "bg-white border-stone-800 text-stone-900 shadow-sm"
                            : "bg-white/80 border-stone-200 text-stone-600 hover:bg-white"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border shrink-0" style={{ backgroundColor: clr.hex }} />
                        <span className="text-[11px] sm:text-xs">{clr.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-stone-200 p-0.5"
                    />
                    <span className="text-xs font-mono font-bold text-stone-700">Mã màu: {primaryColor}</span>
                  </div>
                </div>

                {/* Hiệu ứng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Hiệu Ứng Phong Bì</label>
                    <select
                      value={openingEffect}
                      onChange={(e) => setOpeningEffect(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-medium min-h-[44px] sm:min-h-[38px]"
                    >
                      <option value="WAX_SEAL">Sáp Niêm Phong Vàng</option>
                      <option value="GATE_OPEN">Cổng Hoa Mở</option>
                      <option value="NONE">Mở Trực Tiếp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Hiệu Ứng Rơi</label>
                    <select
                      value={fallingEffect}
                      onChange={(e) => setFallingEffect(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-medium min-h-[44px] sm:min-h-[38px]"
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

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Đường Dẫn Thiệp (Slug URL)
                  </label>
                  <div className="flex items-center text-xs rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 sm:py-2.5 min-h-[44px] sm:min-h-[38px]">
                    <span className="text-stone-400 font-mono shrink-0">cardvite.vn/thiep/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      className="font-bold font-mono text-base sm:text-xs text-[#BE944E] bg-transparent focus:outline-none flex-1 ml-1 py-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══ TAB 2: CẶP ĐÔI ══ */}
            {activeTab === "couple" && (
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-[#BE944E]" />
                    <span>Thông Tin Cô Dâu & Chú Rể</span>
                  </h3>
                  <p className="text-xs text-stone-500">Điền đầy đủ tên tuổi và thông tin phụ mẫu hai bên.</p>
                </div>

                {/* Chú Rể */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#BE944E]" />
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Nhà Trai • Chú Rể</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Đầy đủ</label>
                      <input type="text" value={groomName} onChange={(e) => setGroomName(e.target.value)} placeholder="Trần Minh Quân" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-semibold min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Thân Mật</label>
                      <input type="text" value={groomShort} onChange={(e) => setGroomShort(e.target.value)} placeholder="Minh Quân" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Thứ Bậc</label>
                      <input type="text" value={groomBirthOrder} onChange={(e) => setGroomBirthOrder(e.target.value)} placeholder="Trưởng Nam" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Cha</label>
                      <input type="text" value={groomFather} onChange={(e) => setGroomFather(e.target.value)} placeholder="Trần Văn Hùng" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Mẹ</label>
                      <input type="text" value={groomMother} onChange={(e) => setGroomMother(e.target.value)} placeholder="Lê Thị Mai" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                  </div>
                </div>

                {/* Cô Dâu */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-200/60 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Nhà Gái • Cô Dâu</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Đầy đủ</label>
                      <input type="text" value={brideName} onChange={(e) => setBrideName(e.target.value)} placeholder="Nguyễn Thu Hà" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-semibold min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Thân Mật</label>
                      <input type="text" value={brideShort} onChange={(e) => setBrideShort(e.target.value)} placeholder="Thu Hà" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Thứ Bậc</label>
                      <input type="text" value={brideBirthOrder} onChange={(e) => setBrideBirthOrder(e.target.value)} placeholder="Út Nữ" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Cha</label>
                      <input type="text" value={brideFather} onChange={(e) => setBrideFather(e.target.value)} placeholder="Nguyễn Văn Dũng" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">Họ Tên Mẹ</label>
                      <input type="text" value={brideMother} onChange={(e) => setBrideMother(e.target.value)} placeholder="Phạm Thu Cúc" className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                    </div>
                  </div>
                </div>

                {/* Lời ngỏ */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Lời Ngỏ & Trích Dẫn Yêu Thương</label>
                  <textarea
                    rows={3}
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    className="w-full p-3 text-base sm:text-xs rounded-xl bg-stone-50 border border-stone-200 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BE944E]/30 min-h-[88px]"
                  />
                </div>
              </div>
            )}

            {/* ══ TAB 3: CÂU CHUYỆN ══ */}
            {activeTab === "story" && (
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-[#BE944E]" />
                      <span>Love Story Timeline</span>
                    </h3>
                    <p className="text-xs text-stone-500">Ghi dấu những cột mốc ngọt ngào từ ngày đầu gặp gỡ.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLoveStory([...loveStory, { title: "Kỷ Niệm Mới", date: "20 . 10 . 2025", description: "Khoảnh khắc đáng nhớ cùng nhau sẻ chia." }])}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF5EE] text-[#BE944E] border border-[#EAE0CD] text-xs font-bold flex items-center gap-1.5 hover:bg-[#BE944E] hover:text-white transition cursor-pointer min-h-[40px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Mốc</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {loveStory.map((item, idx) => (
                    <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#BE944E] bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                          Cột mốc 0{idx + 1}
                        </span>
                        {loveStory.length > 1 && (
                          <button type="button" onClick={() => setLoveStory(loveStory.filter((_, i) => i !== idx))} className="text-stone-400 hover:text-rose-500 p-1.5 min-h-[36px] flex items-center justify-center">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">Tiêu Đề</label>
                          <input type="text" value={item.title} onChange={(e) => { const u = [...loveStory]; u[idx].title = e.target.value; setLoveStory(u); }} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-semibold min-h-[44px] sm:min-h-[38px]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">Thời Gian</label>
                          <input type="text" value={item.date} onChange={(e) => { const u = [...loveStory]; u[idx].date = e.target.value; setLoveStory(u); }} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Nội Dung</label>
                        <textarea rows={2} value={item.description} onChange={(e) => { const u = [...loveStory]; u[idx].description = e.target.value; setLoveStory(u); }} className="w-full p-2.5 sm:p-3 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[72px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ TAB 4: LỊCH TRÌNH ══ */}
            {activeTab === "events" && (
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#BE944E]" />
                      <span>Lịch Trình & Địa Điểm</span>
                    </h3>
                    <p className="text-xs text-stone-500">Cài đặt các buổi lễ và tích hợp Google Maps.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvents([...events, { id: `event-${Date.now()}`, eventName: "Tiệc Cưới Báo Hỷ", eventDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), venueName: "Trung tâm Tiệc Cưới", address: "Địa chỉ tổ chức", mapUrl: "https://maps.google.com" }])}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF5EE] text-[#BE944E] border border-[#EAE0CD] text-xs font-bold flex items-center gap-1.5 hover:bg-[#BE944E] hover:text-white transition cursor-pointer min-h-[40px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Buổi Lễ</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {events.map((ev, idx) => (
                    <div key={ev.id || idx} className="p-3.5 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#BE944E] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#BE944E]" />
                          <span>Buổi Lễ 0{idx + 1}</span>
                        </span>
                        {events.length > 1 && (
                          <button type="button" onClick={() => setEvents(events.filter((_, i) => i !== idx))} className="text-stone-400 hover:text-rose-500 p-1.5 min-h-[36px] flex items-center justify-center">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Sự Kiện</label>
                          <input type="text" value={ev.eventName} onChange={(e) => { const u = [...events]; u[idx].eventName = e.target.value; setEvents(u); }} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-semibold min-h-[44px] sm:min-h-[38px]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Thời Gian</label>
                          <input type="datetime-local" value={typeof ev.eventDate === "string" ? ev.eventDate : new Date(ev.eventDate).toISOString().slice(0, 16)} onChange={(e) => { const u = [...events]; u[idx].eventDate = e.target.value; setEvents(u); }} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-mono min-h-[44px] sm:min-h-[38px]" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Địa Điểm</label>
                          <input type="text" value={ev.venueName} onChange={(e) => { const u = [...events]; u[idx].venueName = e.target.value; setEvents(u); }} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Ngày Âm Lịch</label>
                          <input type="text" value={ev.lunarDate || ""} onChange={(e) => { const u = [...events]; u[idx].lunarDate = e.target.value; setEvents(u); }} placeholder="Ngày 16 Tháng 09 Năm..." className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Địa Chỉ Chi Tiết</label>
                        <input type="text" value={ev.address} onChange={(e) => { const u = [...events]; u[idx].address = e.target.value; setEvents(u); }} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[44px] sm:min-h-[38px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ TAB 5: ALBUM ẢNH (với Upload Thực) ══ */}
            {activeTab === "gallery" && (
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <ImageIcon className="w-4 h-4 text-[#BE944E]" />
                    <span>Album Ảnh Cưới</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Kéo thả hoặc chạm để chọn ảnh tải lên. Hỗ trợ JPG, PNG, WEBP — tối đa 5MB/ảnh.
                  </p>
                </div>

                {/* UPLOAD ZONE */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handlePhotoDrop}
                  onClick={() => photoInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    isDragOver
                      ? "border-[#BE944E] bg-amber-50/80 scale-[1.01]"
                      : "border-stone-300 bg-stone-50 hover:border-[#BE944E]/60 hover:bg-amber-50/30"
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${isDragOver ? "bg-[#BE944E] text-white" : "bg-white border border-stone-200 text-stone-400"}`}>
                    {uploadingPhotos ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#BE944E]" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-stone-700">
                      {uploadingPhotos ? "Đang tải ảnh lên..." : isDragOver ? "Thả ảnh vào đây!" : "Chạm để chọn ảnh từ máy"}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">hoặc kéo thả ảnh vào khung này</p>
                  </div>
                  {!uploadingPhotos && (
                    <span className="text-[11px] px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-500">
                      JPG · PNG · WEBP · Tối đa 5MB/ảnh
                    </span>
                  )}
                </div>

                {/* PHOTO GRID */}
                {photos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">{photos.length} Ảnh Đã Tải Lên</span>
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="text-xs text-[#BE944E] font-semibold hover:underline flex items-center gap-1 min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm ảnh
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {photos.map((photo, idx) => (
                        <div
                          key={photo.id || idx}
                          className="relative group rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs"
                        >
                          {/* Image */}
                          <div className="w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption || "Ảnh cưới"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Cover badge */}
                          {photo.isCover && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              Ảnh Bìa
                            </div>
                          )}

                          {/* Mobile Action Buttons (Visible for touch screens) */}
                          <div className="absolute top-2 right-2 flex items-center gap-1.5 sm:hidden">
                            <button
                              type="button"
                              onClick={() => handleSetCover(photo.id!)}
                              title="Đặt làm ảnh bìa"
                              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition ${
                                photo.isCover ? "bg-amber-500 text-white" : "bg-black/60 text-white"
                              }`}
                            >
                              <Star className="w-3.5 h-3.5 fill-white" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id!)}
                              title="Xóa ảnh"
                              className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Desktop Action Overlay (Hover) */}
                          <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleSetCover(photo.id!)}
                              title="Đặt làm ảnh bìa"
                              className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCaption(editingCaption === photo.id ? null : photo.id!)}
                              title="Chỉnh caption"
                              className="w-8 h-8 rounded-full bg-white/90 text-stone-700 flex items-center justify-center hover:bg-white transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id!)}
                              title="Xóa ảnh"
                              className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Caption editor */}
                          <div className="p-2">
                            {editingCaption === photo.id ? (
                              <input
                                autoFocus
                                type="text"
                                value={photo.caption || ""}
                                onChange={(e) => handleUpdateCaption(photo.id!, e.target.value)}
                                onBlur={() => setEditingCaption(null)}
                                onKeyDown={(e) => e.key === "Enter" && setEditingCaption(null)}
                                className="w-full text-base sm:text-[11px] px-2 py-1 rounded-lg border border-[#BE944E] focus:outline-none bg-amber-50 min-h-[36px]"
                              />
                            ) : (
                              <div
                                onClick={() => setEditingCaption(photo.id!)}
                                className="cursor-pointer hover:bg-stone-50 rounded px-1 py-0.5"
                              >
                                <p className="text-[11px] text-stone-500 truncate">
                                  {photo.caption || <span className="italic text-stone-300">Chạm để thêm caption</span>}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video URL */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Video Phim Cưới / Pre-Wedding (YouTube)
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-mono text-stone-700 min-h-[44px] sm:min-h-[38px]"
                  />
                </div>
              </div>
            )}

            {/* ══ TAB 6: NHẠC NỀN (với Upload MP3) ══ */}
            {activeTab === "music" && (
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-[#BE944E]" />
                    <span>Nhạc Nền Thiệp Cưới</span>
                  </h3>
                  <p className="text-xs text-stone-500">Chọn bài có sẵn hoặc tải nhạc MP3 của bạn lên.</p>
                </div>

                {/* MUSIC MODE TOGGLE */}
                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setMusicTab("library")}
                    className={`flex-1 py-2.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[40px] ${
                      musicTab === "library" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Kho Nhạc Có Sẵn
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusicTab("upload")}
                    className={`flex-1 py-2.5 sm:py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[40px] ${
                      musicTab === "upload" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tải Nhạc Lên
                  </button>
                </div>

                {/* LIBRARY TAB */}
                {musicTab === "library" && (
                  <div className="space-y-2.5 sm:space-y-3">
                    {MUSIC_OPTIONS.map((track) => {
                      const isSelected = selectedMusicSrc === track.src;
                      const isPlayingThis = testPlayingSrc === track.src;
                      return (
                        <div
                          key={track.src}
                          onClick={() => setSelectedMusicSrc(track.src)}
                          className={`p-3 sm:p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer min-h-[56px] ${
                            isSelected
                              ? "bg-amber-50/60 border-[#BE944E] ring-2 ring-[#BE944E]/20 shadow-xs"
                              : "bg-white border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleToggleTestMusic(track.src); }}
                              className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition shadow-xs shrink-0 ${
                                isPlayingThis ? "bg-[#BE944E] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                              }`}
                              title="Nghe thử"
                            >
                              {isPlayingThis ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-stone-900 truncate">{track.title}</h4>
                              <span className="text-[11px] text-stone-500 truncate block">{track.artist}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] font-mono text-stone-400">{track.duration}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-[#BE944E] bg-[#BE944E] text-white" : "border-stone-300"}`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* UPLOAD TAB */}
                {musicTab === "upload" && (
                  <div className="space-y-4">
                    {/* Upload Zone */}
                    {!uploadedMusic ? (
                      <div
                        onClick={() => musicInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#BE944E]/60 hover:bg-amber-50/30 transition"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-400">
                          {uploadingMusic ? (
                            <Loader2 className="w-6 h-6 animate-spin text-[#BE944E]" />
                          ) : (
                            <FileMusic className="w-6 h-6" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-stone-700">
                            {uploadingMusic ? "Đang xử lý nhạc..." : "Tải file nhạc của bạn lên"}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5">hoặc chạm để chọn từ máy</p>
                        </div>
                        <span className="text-[11px] px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-500">
                          MP3 · WAV · OGG · M4A — Tối đa 10MB
                        </span>
                      </div>
                    ) : (
                      /* Uploaded music card */
                      <div className={`p-4 rounded-2xl border-2 ${selectedMusicSrc === uploadedMusic.src ? "border-[#BE944E] bg-amber-50/60 ring-2 ring-[#BE944E]/20" : "border-stone-200 bg-white"}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTestMusic(uploadedMusic.src)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-xs shrink-0 ${
                                testPlayingSrc === uploadedMusic.src ? "bg-[#BE944E] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                              }`}
                            >
                              {testPlayingSrc === uploadedMusic.src ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-stone-900 truncate">{uploadedMusic.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono text-stone-400">{uploadedMusic.duration}</span>
                                {uploadedMusic.isLocal && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Preview local</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedMusicSrc(uploadedMusic.src)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition min-h-[38px] ${selectedMusicSrc === uploadedMusic.src ? "bg-[#BE944E] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
                            >
                              {selectedMusicSrc === uploadedMusic.src ? "✓ Đang dùng" : "Chọn bài này"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setUploadedMusic(null); setSelectedMusicSrc(MUSIC_OPTIONS[0].src); }}
                              className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Change music button */}
                        <button
                          type="button"
                          onClick={() => musicInputRef.current?.click()}
                          className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-xs text-stone-500 font-semibold hover:border-[#BE944E] hover:text-[#BE944E] transition flex items-center justify-center gap-1.5 min-h-[40px]"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Đổi File Nhạc Khác
                        </button>
                      </div>
                    )}

                    {/* Hint khi chưa có file */}
                    {!uploadedMusic && (
                      <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                        File nhạc của bạn sẽ được lưu và phát tự động khi khách mở thiệp.
                        <br />
                        Nếu chưa muốn tải lên, hãy dùng bài từ{" "}
                        <button onClick={() => setMusicTab("library")} className="text-[#BE944E] font-semibold hover:underline">
                          Kho Nhạc Có Sẵn
                        </button>
                      </p>
                    )}
                  </div>
                )}

                {/* Auto play toggle */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Tự Động Phát Nhạc (Auto Play)</span>
                    <span className="text-[11px] text-stone-500">Phát giai điệu khi khách mở phong bì</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isAutoPlay}
                      onChange={(e) => setIsAutoPlay(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6.5 sm:w-10 sm:h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#BE944E]"></div>
                  </label>
                </div>

                {/* Currently selected info */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#FAF5EE] border border-[#EAE0CD] flex items-center gap-3">
                  <Music className="w-4 h-4 text-[#BE944E] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-stone-500 block">Nhạc đang chọn:</span>
                    <span className="text-xs font-bold text-stone-800 truncate block">
                      {uploadedMusic && selectedMusicSrc === uploadedMusic.src
                        ? uploadedMusic.name
                        : MUSIC_OPTIONS.find((m) => m.src === selectedMusicSrc)?.title || "Chưa chọn"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ══ TAB 7: MỪNG CƯỚI VIETQR ══ */}
            {activeTab === "banking" && (
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-[#BE944E]" />
                    <span>Hộp Mừng Cưới VietQR</span>
                  </h3>
                  <p className="text-xs text-stone-500">Tích hợp QR mừng cưới tiện lợi cho khách ở xa.</p>
                </div>

                {/* Chú rể */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">1. Tài Khoản Chú Rể</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Ngân Hàng</label>
                      <input type="text" value={bankCodeGroom} onChange={(e) => setBankCodeGroom(e.target.value)} placeholder="MB, VCB, ACB..." className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-semibold min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Số Tài Khoản</label>
                      <input type="text" value={accNumGroom} onChange={(e) => setAccNumGroom(e.target.value)} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-mono font-bold min-h-[44px] sm:min-h-[38px]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Chủ TK (Không dấu)</label>
                    <input type="text" value={accNameGroom} onChange={(e) => setAccNameGroom(e.target.value.toUpperCase())} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-bold min-h-[44px] sm:min-h-[38px]" />
                  </div>
                </div>

                {/* Cô dâu */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">2. Tài Khoản Cô Dâu</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Ngân Hàng</label>
                      <input type="text" value={bankCodeBride} onChange={(e) => setBankCodeBride(e.target.value)} placeholder="VCB, Techcombank..." className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-semibold min-h-[44px] sm:min-h-[38px]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Số Tài Khoản</label>
                      <input type="text" value={accNumBride} onChange={(e) => setAccNumBride(e.target.value)} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-mono font-bold min-h-[44px] sm:min-h-[38px]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tên Chủ TK (Không dấu)</label>
                    <input type="text" value={accNameBride} onChange={(e) => setAccNameBride(e.target.value.toUpperCase())} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-bold min-h-[44px] sm:min-h-[38px]" />
                  </div>
                </div>
              </div>
            )}

            {/* ══ TAB 8: RSVP ══ */}
            {activeTab === "rsvp" && (
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#BE944E]" />
                    <span>Mời Đích Danh & Quản Lý RSVP</span>
                  </h3>
                  <p className="text-xs text-stone-500">Thu thập phản hồi số lượng khách để đặt bàn tiệc chính xác.</p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Kích Hoạt Form Xác Nhận RSVP</span>
                    <span className="text-[11px] text-stone-500">Cho phép khách bấm xác nhận & gửi lời chúc</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" checked={isRsvpEnabled} onChange={(e) => setIsRsvpEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6.5 sm:w-10 sm:h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-[#BE944E]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Hạn Chót Xác Nhận Tham Dự</label>
                    <input type="date" value={rsvpDeadline} onChange={(e) => setRsvpDeadline(e.target.value)} className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-xl bg-white border border-stone-200 font-mono min-h-[44px] sm:min-h-[38px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Ghi Chú Đón Tiếp</label>
                    <textarea rows={2} value={rsvpCustomNote} onChange={(e) => setRsvpCustomNote(e.target.value)} className="w-full p-3 text-base sm:text-xs rounded-xl bg-white border border-stone-200 min-h-[72px]" />
                  </div>
                </div>

                {/* Quick link to RSVP management */}
                <Link
                  href={`/dashboard/cards/${cardId}/rsvp`}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 transition min-h-[52px]"
                >
                  <div>
                    <span className="text-xs font-bold block">Quản Lý Danh Sách Khách RSVP</span>
                    <span className="text-[11px] text-stone-400">Xem và xuất danh sách khách xác nhận</span>
                  </div>
                  <Users className="w-5 h-5 text-stone-400 shrink-0" />
                </Link>
              </div>
            )}
            {/* STEP NAVIGATION FOOTER */}
            <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between gap-2">
              {currentTabIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(EDIT_TABS[currentTabIndex - 1].key as any)}
                  className="px-3 sm:px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition min-h-[42px]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quay lại:</span>
                  <span>{EDIT_TABS[currentTabIndex - 1].label}</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileViewMode("preview")}
                  className="lg:hidden px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[#966E29] text-xs font-bold flex items-center gap-1.5 shadow-2xs min-h-[42px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem thử</span>
                </button>

                {currentTabIndex < EDIT_TABS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(EDIT_TABS[currentTabIndex + 1].key as any)}
                    className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#BE944E] hover:bg-[#a8813f] text-white text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-xs transition min-h-[42px]"
                  >
                    <span>Tiếp: {EDIT_TABS[currentTabIndex + 1].label}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveCard}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl bg-[#BE944E] hover:bg-[#a8813f] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition min-h-[42px]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Đang lưu..." : "Lưu Thiệp"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* CỘT PHẢI: LIVE PREVIEW                          */}
        {/* ══════════════════════════════════════════════════ */}
        <div className={`flex-1 bg-gradient-to-br from-[#F5F2EB] to-[#ECE7DC] p-0 sm:p-4 lg:p-8 flex flex-col items-center justify-center overflow-y-auto relative h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] ${
          mobileViewMode === "edit" ? "hidden lg:flex" : "flex"
        }`}>
          {/* Status info bar */}
          <div className="hidden lg:flex items-center justify-between w-full max-w-[390px] mb-3 px-1 text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-semibold text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Xem trước trực tiếp (Live Preview)
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              {previewDevice === "mobile" ? "390 × 844" : previewDevice === "tablet" ? "768 × 1024" : "1024 × 768"}
            </span>
          </div>

          {/* Device Mockup: Edge-to-edge on mobile, sleek frame on desktop */}
          <div
            className={`transition-all duration-300 w-full h-full lg:h-auto ${
              previewDevice === "mobile"
                ? "lg:max-w-[390px] lg:h-[780px] lg:max-h-[82vh]"
                : previewDevice === "tablet"
                ? "lg:max-w-[640px] lg:h-[820px] lg:max-h-[85vh]"
                : "lg:max-w-[960px] lg:h-[720px] lg:max-h-[85vh]"
            } lg:bg-stone-900 lg:rounded-[44px] lg:p-3 lg:shadow-2xl lg:border-4 lg:border-stone-800 relative flex flex-col [transform:translateZ(0)] isolate overflow-hidden`}
          >
            {/* Dynamic Island / Notch for desktop mockup */}
            {previewDevice === "mobile" && (
              <div className="hidden lg:flex absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 items-center justify-end px-2.5 pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e] border border-stone-700/50" />
              </div>
            )}
            <div className="w-full h-full bg-[#FAF8F5] lg:rounded-[34px] overflow-y-auto overflow-x-hidden relative shadow-inner [transform:translateZ(0)] isolate pb-20 lg:pb-0">
              {category === "WEDDING" && <WeddingView card={previewCard} templateSlug={templateSlug || selectedTemplate} isPreview={true} />}
              {category === "BIRTHDAY" && <BirthdayView card={previewCard} templateSlug={templateSlug || selectedTemplate} isPreview={true} />}
              {category === "NEWBORN" && <NewbornView card={previewCard} templateSlug={templateSlug || selectedTemplate} isPreview={true} />}
            </div>
          </div>

          {/* Floating Return Button for Mobile Preview */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileViewMode("edit")}
              className="px-5 py-2.5 rounded-full bg-stone-900/90 text-white text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/20 active:scale-95 transition"
            >
              <Pencil className="w-3.5 h-3.5 text-[#BE944E]" />
              <span>Quay lại chỉnh sửa</span>
            </button>
          </div>

          {/* Bottom hint */}
          <p className="hidden lg:block mt-3 text-xs text-stone-400 text-center">
            Mọi chỉnh sửa bên trái sẽ cập nhật ngay lập tức vào thiệp xem trước
          </p>
        </div>
      </div>
      )}

      {/* ── QUICK FILL MODAL ── */}
      <QuickFillModal
        isOpen={showQuickFill}
        onClose={() => setShowQuickFill(false)}
        onApply={handleApplyQuickFill}
        initialData={{
          groomName,
          groomFather,
          groomMother,
          brideName,
          brideFather,
          brideMother,
          eventDate: events[0]?.eventDate ? new Date(events[0].eventDate).toISOString().slice(0, 10) : "",
          address: events[0]?.address || "",
          photos: photos.map((p, idx) => ({ id: p.id || `photo-${idx}`, url: p.url, caption: p.caption })),
        }}
      />

      {/* ── SELECTIVE WEDDING PROFILE MODAL (TÙY CHỌN MỤC ÁP DỤNG) ── */}
      <ApplyProfileModal
        isOpen={showApplyProfileModal}
        onClose={() => setShowApplyProfileModal(false)}
        onApply={handleApplyProfileSections}
      />
    </div>
  );
}
