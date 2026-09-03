"use client";

import React, { useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CardCategory, CardDetail, WeddingDataPayload, BirthdayDataPayload, NewbornDataPayload } from "@/types/card.types";
import { WeddingView } from "@/components/wedding/WeddingView";
import { BirthdayView } from "@/components/birthday/BirthdayView";
import { NewbornView } from "@/components/newborn/NewbornView";
import { ApiClient } from "@/lib/api";
import { VisualCardEditor } from "@/components/editor/VisualCardEditor";
import { TEMPLATE_CONFIGS, getTemplateConfig } from "@/lib/editor/template-config";
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

  const initialCategory = (searchParams.get("category")?.toUpperCase() as CardCategory) || "WEDDING";
  const initialTemplate = searchParams.get("template") || "wedding-heritage-crimson-gold";

  const [category, setCategory] = useState<CardCategory>(initialCategory);
  const [templateSlug, setTemplateSlug] = useState<string>(initialTemplate);
  const [slug, setSlug] = useState(`thiep-${Math.floor(100000 + Math.random() * 900000)}`);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const templateConfig = getTemplateConfig(templateSlug, category);

  // State thiệp
  const [primaryColor, setPrimaryColor] = useState(templateConfig?.defaultPrimaryColor || "#8B1E2D");
  const [fontFamily, setFontFamily] = useState(templateConfig?.defaultFontFamily || "Playfair Display");
  const [openingEffect, setOpeningEffect] = useState<"NONE" | "WAX_SEAL" | "GATE_OPEN" | "GIFT_BOX">("WAX_SEAL");
  const [fallingEffect, setFallingEffect] = useState<"NONE" | "PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON">("PETAL");
  const [musicUrl, setMusicUrl] = useState("/music/le-duong.mp3");
  const [greetingMessage, setGreetingMessage] = useState(
    "“Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.” Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi!"
  );

  const [weddingData, setWeddingData] = useState<WeddingDataPayload>(DEFAULT_WEDDING_DATA);
  const [birthdayData, setBirthdayData] = useState<BirthdayDataPayload>(DEFAULT_BIRTHDAY_DATA);
  const [newbornData, setNewbornData] = useState<NewbornDataPayload>(DEFAULT_NEWBORN_DATA);

  // Chuyển Category
  const handleCategoryChange = (newCat: CardCategory) => {
    setCategory(newCat);
    if (newCat === "WEDDING") {
      setTemplateSlug("wedding-heritage-crimson-gold");
      setPrimaryColor("#8B1E2D");
      setFontFamily("Playfair Display");
      setFallingEffect("PETAL");
      setMusicUrl("/music/le-duong.mp3");
    } else if (newCat === "BIRTHDAY") {
      setTemplateSlug("birthday-glow-party");
      setPrimaryColor("#F97316");
      setFontFamily("Outfit");
      setFallingEffect("BALLOON");
      setMusicUrl("/music/everytime-we-touch.mp3");
    } else {
      setTemplateSlug("newborn-little-prince");
      setPrimaryColor("#4169A1");
      setFontFamily("Quicksand");
      setFallingEffect("BALLOON");
      setMusicUrl("/music/like-my-father.mp3");
    }
  };

  // Chuyển Template Slug
  const handleTemplateChange = (slugKey: string) => {
    setTemplateSlug(slugKey);
    const cfg = TEMPLATE_CONFIGS[slugKey];
    if (cfg) {
      setPrimaryColor(cfg.defaultPrimaryColor);
      setFontFamily(cfg.defaultFontFamily);
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
    photos: [
      { id: "p-1", url: "/images/demo/couple-cover.png", caption: "Khoảnh khắc hạnh phúc", isCover: true },
      { id: "p-2", url: "/images/demo/couple-studio.png", caption: "Nguyện cùng nhau đi hết thanh xuân" },
      { id: "p-3", url: "/images/demo/couple-aodai.png", caption: "Lễ Gia Tiên truyền thống" },
    ],
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
    setSaving(true);
    setErrorMsg("");

    try {
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
        data:
          category === "WEDDING"
            ? weddingData
            : category === "BIRTHDAY"
            ? birthdayData
            : newbornData,
      };

      const res = await ApiClient.request<{ id: string; slug: string }>("/cards", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSaving(false);

      if (res.success && res.data) {
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
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP COMPACT HEADER BAR                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cards"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
              <span>Trình Tạo Thiệp Trực Quan</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-sans font-bold border border-amber-200/80">
                Visual Studio
              </span>
            </h1>
            <p className="text-[11px] text-stone-400">
              Chỉnh sửa thông số trực tiếp và xem thay đổi ngay lập tức
            </p>
          </div>
        </div>

        {/* CATEGORY SELECTOR TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => handleCategoryChange("WEDDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              category === "WEDDING"
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>Thiệp Cưới</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("BIRTHDAY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              category === "BIRTHDAY"
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Cake className="w-3.5 h-3.5 text-amber-500" />
            <span>Sinh Nhật</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("NEWBORN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              category === "NEWBORN"
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-blue-500" />
            <span>Thôi Nôi / Báo Hỷ</span>
          </button>
        </div>

        {/* TEMPLATE PRESET SELECTOR & ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-xl py-1 no-scrollbar">
            <span className="text-[11px] text-stone-400 font-medium mr-1 shrink-0">Mẫu:</span>
            {templatesForCategory.map((tpl) => (
              <button
                key={tpl.slug}
                type="button"
                onClick={() => handleTemplateChange(tpl.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border shrink-0 ${
                  templateSlug === tpl.slug
                    ? "bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-2xs"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || saveSuccess}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#D4AF37] hover:from-[#A88240] hover:to-[#BE944E] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Khởi Tạo...</span>
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
            <WeddingView card={previewCard} templateSlug={templateSlug} />
          )}
          {category === "BIRTHDAY" && (
            <BirthdayView card={previewCard} templateSlug={templateSlug} />
          )}
          {category === "NEWBORN" && (
            <NewbornView card={previewCard} templateSlug={templateSlug} />
          )}
        </VisualCardEditor>
      </main>
    </div>
  );
}
