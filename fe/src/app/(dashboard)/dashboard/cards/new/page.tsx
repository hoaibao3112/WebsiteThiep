"use client";

import React, { useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CardCategory, CardDetail, WeddingDataPayload, BirthdayDataPayload, NewbornDataPayload, PhotoItem } from "@/types/card.types";
import { WeddingView } from "@/components/wedding/WeddingView";
import { BirthdayView } from "@/components/birthday/BirthdayView";
import { NewbornView } from "@/components/newborn/NewbornView";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { VisualCardEditor } from "@/components/editor/VisualCardEditor";
import { QuickFillModal, QuickFillData } from "@/components/card/QuickFillModal";
import { TEMPLATE_CONFIGS, getTemplateConfig } from "@/lib/editor/template-config";
import { DEMO_TEMPLATES_MAP } from "@/app/(public)/thiep/[slug]/demo-templates-data";
import {
  Heart,
  Cake,
  Baby,
  Sparkles,
  ArrowLeft,
  Save,
  Check,
  Loader2,
  Sparkle,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function NewCardBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-12 text-center text-sm text-stone-500 font-serif">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
          Đang khởi tạo Visual Studio...
        </div>
      }
    >
      <CardBuilderContent />
    </Suspense>
  );
}

const DEFAULT_WEDDING_DATA: WeddingDataPayload = {
  cardCategory: "WEDDING",
  heroSubtitle: "SAVE OUR SPECIAL DAY",
  invitationTitle: "Thư Mời Thành Hôn",
  coverPhotoUrl: "/images/demo/couple-cover.png",
  groom: {
    fullName: "Nguyễn Minh Khôi",
    shortName: "Minh Khôi",
    avatarUrl: "/images/demo/groom-avatar.png",
    birthOrder: "Trưởng Nam",
    parents: { fatherName: "Nguyễn Văn Hùng", motherName: "Trần Thị Mai" },
  },
  bride: {
    fullName: "Lê Ngọc Hân",
    shortName: "Ngọc Hân",
    avatarUrl: "/images/demo/bride-avatar.png",
    birthOrder: "Út Nữ",
    parents: { fatherName: "Lê Quốc Bảo", motherName: "Phạm Thu Cúc" },
  },
  greeting: "Tình yêu là khi hai trái tim cùng chung một nhịp đập. Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi!",
  loveStory: [
    { title: "Lần Đầu Gặp Gỡ", date: "14/02/2020", description: "Tại quán cà phê nhỏ vào chiều mưa Hà Nội.", imageUrl: "/images/demo/couple-cover.png" },
    { title: "Lời Cầu Hôn", date: "25/12/2023", description: "Dưới ánh hoàng hôn bên bờ biển, em đã nói đồng ý!", imageUrl: "/images/demo/couple-studio.png" },
  ],
  events: [
    { id: "ev-1", eventName: "Lễ Vu Quy (Nhà Gái)", eventDate: new Date("2026-11-20T09:00:00Z"), venueName: "Tư Gia Nhà Gái", address: "123 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. HCM" },
    { id: "ev-2", eventName: "Tiệc Cưới Chính Thức", eventDate: new Date("2026-11-20T18:00:00Z"), venueName: "White Palace Convention", address: "194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. HCM" },
  ],
};

const DEFAULT_BIRTHDAY_DATA: BirthdayDataPayload = {
  cardCategory: "BIRTHDAY",
  celebrantName: "Khánh Linh",
  age: 18,
  birthDate: new Date("2008-09-15"),
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
  greeting: "Hãy cùng đến chung vui và quẩy hết mình trong bữa tiệc sinh nhật đặc biệt này nhé!",
  events: [
    { id: "b-ev-1", eventName: "Đêm Tiệc Glow Party", eventDate: new Date(Date.now() + 7 * 86400000), venueName: "The Rooftop Lounge", address: "Tầng 19, Tòa nhà Bitexco, Q.1, TP. HCM" },
  ],
};

const DEFAULT_NEWBORN_DATA: NewbornDataPayload = {
  cardCategory: "NEWBORN",
  babyName: "Nguyễn Minh Khang",
  nickname: "Bé Bơ",
  gender: "BOY",
  birthDate: new Date(),
  weight: "3.5",
  height: "50",
  ceremonyType: "FULL_MONTH",
  avatarUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&auto=format&fit=crop",
  events: [
    { id: "nb-ev-1", eventName: "Tiệc Mừng Đầy Tháng", eventDate: new Date(Date.now() + 10 * 86400000), venueName: "Nhà Hàng Cơm Quê", address: "78 Nguyễn Trãi, Quận 5, TP. HCM" },
  ],
};

function CardBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();

  const initialCategory = (searchParams.get("category")?.toUpperCase() as CardCategory) || "WEDDING";
  const initialTemplate = searchParams.get("template") || "wedding-heritage-crimson-gold";

  // Lấy dữ liệu mẫu khởi tạo dựa theo template được chọn
  const initialDemoCard = DEMO_TEMPLATES_MAP[initialTemplate];
  const initialTemplateConfig = getTemplateConfig(initialTemplate, initialCategory);

  const [category, setCategory] = useState<CardCategory>(initialCategory);
  const [templateSlug, setTemplateSlug] = useState<string>(initialTemplate);
  const [slug, setSlug] = useState(`thiep-${Math.floor(100000 + Math.random() * 900000)}`);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // State thiệp đồng bộ theo mẫu đã chọn
  const [primaryColor, setPrimaryColor] = useState(
    initialDemoCard?.primaryColor || initialTemplateConfig?.defaultPrimaryColor || "#8B1E2D"
  );
  const [fontFamily, setFontFamily] = useState(
    initialDemoCard?.fontFamily || initialTemplateConfig?.defaultFontFamily || "Playfair Display"
  );
  const [openingEffect, setOpeningEffect] = useState<"NONE" | "WAX_SEAL" | "GATE_OPEN" | "GIFT_BOX">(
    initialDemoCard?.openingEffect || "WAX_SEAL"
  );
  const [fallingEffect, setFallingEffect] = useState<"NONE" | "PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON">(
    initialDemoCard?.fallingEffect || "PETAL"
  );
  const [musicUrl, setMusicUrl] = useState(
    initialDemoCard?.musicUrl || "/music/le-duong.mp3"
  );
  const [greetingMessage, setGreetingMessage] = useState(
    initialDemoCard?.greetingMessage ||
      "“Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.” Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi!"
  );

  const [weddingData, setWeddingData] = useState<WeddingDataPayload>(
    initialDemoCard && initialDemoCard.cardCategory === "WEDDING"
      ? (initialDemoCard.categoryData as WeddingDataPayload)
      : DEFAULT_WEDDING_DATA
  );
  const [birthdayData, setBirthdayData] = useState<BirthdayDataPayload>(
    initialDemoCard && initialDemoCard.cardCategory === "BIRTHDAY"
      ? (initialDemoCard.categoryData as BirthdayDataPayload)
      : DEFAULT_BIRTHDAY_DATA
  );
  const [newbornData, setNewbornData] = useState<NewbornDataPayload>(
    initialDemoCard && initialDemoCard.cardCategory === "NEWBORN"
      ? (initialDemoCard.categoryData as NewbornDataPayload)
      : DEFAULT_NEWBORN_DATA
  );

  const [customPhotos, setCustomPhotos] = useState<PhotoItem[]>(
    initialDemoCard?.photos && initialDemoCard.photos.length > 0
      ? initialDemoCard.photos
      : [
          { id: "p-1", url: "/images/demo/couple-cover.png", caption: "Khoảnh khắc hạnh phúc", isCover: true },
          { id: "p-2", url: "/images/demo/couple-studio.png", caption: "Nguyện cùng nhau đi hết thanh xuân" },
          { id: "p-3", url: "/images/demo/couple-aodai.png", caption: "Lễ Gia Tiên truyền thống" },
        ]
  );
  const [showQuickFill, setShowQuickFill] = useState(false);

  const handleApplyQuickFill = useCallback((data: QuickFillData) => {
    setWeddingData((prev) => ({
      ...prev,
      groom: {
        ...prev.groom,
        fullName: data.groomName || prev.groom.fullName,
        parents: {
          fatherName: data.groomFather || prev.groom.parents?.fatherName,
          motherName: data.groomMother || prev.groom.parents?.motherName,
        },
      },
      bride: {
        ...prev.bride,
        fullName: data.brideName || prev.bride.fullName,
        parents: {
          fatherName: data.brideFather || prev.bride.parents?.fatherName,
          motherName: data.brideMother || prev.bride.parents?.motherName,
        },
      },
      coverPhotoUrl: data.photos && data.photos[0] ? data.photos[0].url : prev.coverPhotoUrl,
      events: data.eventDate
        ? [
            {
              id: "ev-main",
              eventName: "Lễ Thành Hôn",
              eventDate: new Date(`${data.eventDate}T${String(data.eventHour || "10").padStart(2, "0")}:${String(data.eventMinute || "0").padStart(2, "0")}`),
              venueName: "Trung tâm tiệc cưới",
              address: data.address || "Tư gia",
            },
          ]
        : prev.events,
    }));

    if (data.photos && data.photos.length > 0) {
      setCustomPhotos(
        data.photos.map((p, idx) => ({
          id: p.id || `photo-${idx}`,
          url: p.url,
          caption: p.caption,
          isCover: idx === 0,
        }))
      );
    }
  }, []);

  // Chuyển Category
  const handleCategoryChange = (newCat: CardCategory) => {
    setCategory(newCat);
    if (newCat === "WEDDING") {
      handleTemplateChange("wedding-heritage-crimson-gold");
    } else if (newCat === "BIRTHDAY") {
      handleTemplateChange("birthday-glow-party");
    } else {
      handleTemplateChange("newborn-little-prince");
    }
  };

  // Chuyển Template Slug: Tự động đổ dữ liệu chữ, ảnh, nhạc, màu sắc của mẫu đó
  const handleTemplateChange = (slugKey: string) => {
    setTemplateSlug(slugKey);
    const demoCard = DEMO_TEMPLATES_MAP[slugKey];
    if (demoCard) {
      setPrimaryColor(demoCard.primaryColor || "#8B1E2D");
      setFontFamily(demoCard.fontFamily || "Playfair Display");
      setMusicUrl(demoCard.musicUrl || "/music/le-duong.mp3");
      setGreetingMessage(demoCard.greetingMessage || "");
      if (demoCard.fallingEffect) setFallingEffect(demoCard.fallingEffect);
      if (demoCard.cardCategory === "WEDDING") {
        setWeddingData(demoCard.categoryData as WeddingDataPayload);
      } else if (demoCard.cardCategory === "BIRTHDAY") {
        setBirthdayData(demoCard.categoryData as BirthdayDataPayload);
      } else if (demoCard.cardCategory === "NEWBORN") {
        setNewbornData(demoCard.categoryData as NewbornDataPayload);
      }
      if (demoCard.photos && demoCard.photos.length > 0) {
        setCustomPhotos(demoCard.photos);
      }
    } else {
      const cfg = TEMPLATE_CONFIGS[slugKey];
      if (cfg) {
        setPrimaryColor(cfg.defaultPrimaryColor);
        setFontFamily(cfg.defaultFontFamily);
      }
    }
  };

  // Construct draft preview object
  const previewCard: CardDetail = {
    id: "draft-new-card",
    slug,
    cardCategory: category,
    status: "ACTIVE",
    openingEffect: "NONE", // Tắt mở phong bì trong preview để xem trực tiếp
    fallingEffect,
    isAutoPlay: true,
    primaryColor,
    fontFamily,
    musicUrl,
    greetingMessage,
    events:
      category === "WEDDING"
        ? (weddingData.events || []).map((e) => ({ ...e, eventDate: new Date(e.eventDate) }))
        : category === "BIRTHDAY"
        ? (birthdayData.events || []).map((e) => ({ ...e, eventDate: new Date(e.eventDate) }))
        : (newbornData.events || []).map((e) => ({ ...e, eventDate: new Date(e.eventDate) })),
    photos: customPhotos,
    categoryData:
      category === "WEDDING"
        ? weddingData
        : category === "BIRTHDAY"
        ? birthdayData
        : newbornData,
  };

  // Xử lý khi người dùng chỉnh sửa trên Visual Card Editor
  const handleVisualDraftChange = (next: CardDetail) => {
    setPrimaryColor(next.primaryColor);
    setFontFamily(next.fontFamily);
    setGreetingMessage(next.greetingMessage || "");
    setOpeningEffect(next.openingEffect);
    setFallingEffect(next.fallingEffect);
    setMusicUrl(next.musicUrl || "");
    if (next.photos) setCustomPhotos(next.photos);

    if (category === "WEDDING" && next.categoryData.cardCategory === "WEDDING") {
      setWeddingData(next.categoryData as WeddingDataPayload);
    } else if (category === "BIRTHDAY" && next.categoryData.cardCategory === "BIRTHDAY") {
      setBirthdayData(next.categoryData as BirthdayDataPayload);
    } else if (category === "NEWBORN" && next.categoryData.cardCategory === "NEWBORN") {
      setNewbornData(next.categoryData as NewbornDataPayload);
    }
  };

  // Lưu và Xuất Bản Thiệp
  const handlePublish = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const activeEvents =
        category === "WEDDING"
          ? (weddingData.events || []).map((e) => ({
              eventName: e.eventName,
              eventDate: new Date(e.eventDate).toISOString(),
              venueName: e.venueName,
              address: e.address,
            }))
          : category === "BIRTHDAY"
          ? (birthdayData.events || []).map((e) => ({
              eventName: e.eventName,
              eventDate: new Date(e.eventDate).toISOString(),
              venueName: e.venueName,
              address: e.address,
            }))
          : (newbornData.events || []).map((e) => ({
              eventName: e.eventName,
              eventDate: new Date(e.eventDate).toISOString(),
              venueName: e.venueName,
              address: e.address,
            }));

      const activePhotos = customPhotos
        .filter((p) => Boolean(p.url && !p.url.startsWith("blob:")))
        .map((p, idx) => ({
          id: p.id?.startsWith("local-") || p.id?.startsWith("photo-") ? undefined : p.id || undefined,
          url: p.url,
          thumbUrl: p.thumbUrl || undefined,
          caption: p.caption?.trim() || undefined,
          isCover: p.isCover ?? idx === 0,
        }));

      const payload = {
        slug,
        templateSlug,
        openingEffect,
        fallingEffect,
        primaryColor,
        fontFamily,
        musicUrl,
        isAutoPlay: true,
        greetingMessage,
        photos: activePhotos,
        events: activeEvents,
        data:
          category === "WEDDING"
            ? weddingData
            : category === "BIRTHDAY"
            ? birthdayData
            : newbornData,
      };

      const res = await ApiClient.request<{ id: string; slug: string }>("/cards", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(payload),
      });

      setSaving(false);

      if (res.success && res.data) {
        // Tự động kích hoạt xuất bản thiệp ngay khi tạo thành công
        await ApiClient.request(`/cards/${res.data.id}/publish`, {
          method: "PATCH",
        });

        setSaveSuccess(true);
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 }, colors: ["#BE944E", "#D4AF37", "#FFFFFF"] });
        setTimeout(() => {
          router.push(`/dashboard/cards/${res.data!.id}/guests`);
        }, 1200);
      } else {
        setErrorMsg(res.error || "Không thể khởi tạo thiệp. Vui lòng thử lại!");
      }
    } catch (err: any) {
      setSaving(false);
      setErrorMsg(err.message || "Đã xảy ra lỗi kết nối");
    }
  };

  const templatesForCategory = Object.values(TEMPLATE_CONFIGS).filter(
    (t) => t.category === category && !t.label.includes("(Legacy)")
  );

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP COMPACT HEADER BAR                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP RESPONSIVE HEADER BAR (OPTIMIZED FOR MOBILE & DESKTOP)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="bg-white/95 border-b border-stone-200 sticky top-0 z-40 backdrop-blur-md shadow-2xs">
        {/* ROW 1: BRAND TITLE & PRIMARY ACTION */}
        <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/dashboard/cards"
              className="p-2 -ml-1 rounded-xl text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition cursor-pointer shrink-0"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold font-serif text-stone-900 flex items-center gap-1.5 truncate">
                <span className="truncate">Trình Tạo Thiệp</span>
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-sans font-bold border border-amber-200/80">
                  Visual Studio
                </span>
              </h1>
            </div>
          </div>

          {category === "WEDDING" && (
            <button
              type="button"
              onClick={() => setShowQuickFill(true)}
              className="min-h-10 px-3.5 sm:px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Điền Nhanh</span>
            </button>
          )}

          {/* PRIMARY ACTION: XUẤT BẢN THIỆP */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || saveSuccess}
            className="min-h-10 px-3.5 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#D4AF37] hover:from-[#A88240] hover:to-[#BE944E] text-white text-xs font-bold shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden xs:inline">Đang Khởi Tạo...</span>
                <span className="xs:hidden">Lưu...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Đã Xuất Bản!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Xuất Bản Thiệp</span>
              </>
            )}
          </button>
        </div>

        {/* ROW 2: HORIZONTAL SWIPEABLE BAR (CATEGORIES + TEMPLATES) */}
        <div className="px-3 sm:px-6 py-1.5 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* CATEGORY SELECTOR PILLS */}
          <div className="flex items-center gap-1 shrink-0 p-0.5 bg-stone-100 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => handleCategoryChange("WEDDING")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                category === "WEDDING"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
              <span>Cưới</span>
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange("BIRTHDAY")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                category === "BIRTHDAY"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Cake className="w-3 h-3 text-amber-500" />
              <span>Sinh Nhật</span>
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange("NEWBORN")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                category === "NEWBORN"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Baby className="w-3 h-3 text-blue-500" />
              <span>Thôi Nôi</span>
            </button>
          </div>

          <div className="h-5 w-px bg-stone-200 shrink-0" />

          {/* TEMPLATE PRESET SELECTOR (TOUCH HORIZONTAL SCROLL) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-stone-400 font-medium shrink-0">Mẫu:</span>
            {templatesForCategory.map((tpl) => (
              <button
                key={tpl.slug}
                type="button"
                onClick={() => handleTemplateChange(tpl.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border shrink-0 min-h-[34px] flex items-center ${
                  templateSlug === tpl.slug
                    ? "bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-2xs"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-center text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN FULL-WIDTH VISUAL CARD EDITOR WORKSPACE                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        <VisualCardEditor
          templateSlug={templateSlug}
          draft={previewCard}
          onDraftChange={handleVisualDraftChange}
          onSave={handlePublish}
          isVip={false}
        >
          {category === "WEDDING" && (
            <WeddingView card={previewCard} templateSlug={templateSlug} isPreview={true} />
          )}
          {category === "BIRTHDAY" && (
            <BirthdayView card={previewCard} templateSlug={templateSlug} isPreview={true} />
          )}
          {category === "NEWBORN" && (
            <NewbornView card={previewCard} templateSlug={templateSlug} isPreview={true} />
          )}
        </VisualCardEditor>
      </main>

      {/* ── QUICK FILL MODAL ── */}
      <QuickFillModal
        isOpen={showQuickFill}
        onClose={() => setShowQuickFill(false)}
        onApply={handleApplyQuickFill}
        initialData={{
          groomName: weddingData.groom.fullName,
          groomFather: weddingData.groom.parents?.fatherName,
          groomMother: weddingData.groom.parents?.motherName,
          brideName: weddingData.bride.fullName,
          brideFather: weddingData.bride.parents?.fatherName,
          brideMother: weddingData.bride.parents?.motherName,
          eventDate: weddingData.events?.[0]?.eventDate
            ? new Date(weddingData.events[0].eventDate).toISOString().slice(0, 10)
            : "",
          address: weddingData.events?.[0]?.address || "",
          photos: customPhotos.map((p, idx) => ({ id: p.id || `photo-${idx}`, url: p.url, caption: p.caption })),
        }}
      />
    </div>
  );
}
