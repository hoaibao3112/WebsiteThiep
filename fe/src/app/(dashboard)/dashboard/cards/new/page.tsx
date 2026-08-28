"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardCategory, CardDetail } from "@/types/card.types";
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
  Save,
  Check,
  Plus,
  Trash2,
  Calendar,
  MapPin,
} from "lucide-react";

export default function NewCardBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-stone-500">Đang tải trình tạo thiệp...</div>}>
      <CardBuilderContent />
    </Suspense>
  );
}

function CardBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CardCategory) || "WEDDING";

  const [category, setCategory] = useState<CardCategory>(initialCategory);
  const [slug, setSlug] = useState(`thiep-${Date.now().toString().slice(-6)}`);
  const [primaryColor, setPrimaryColor] = useState("#D4AF37");
  const [openingEffect, setOpeningEffect] = useState<"WAX_SEAL" | "GATE_OPEN" | "NONE">("WAX_SEAL");
  const [fallingEffect, setFallingEffect] = useState<"PETAL" | "HEART" | "SNOW" | "CONFETTI" | "BALLOON">("PETAL");
  const [greetingMessage, setGreetingMessage] = useState("");

  // Wedding state
  const [groomName, setGroomName] = useState("Trần Minh Quân");
  const [groomShort, setGroomShort] = useState("Minh Quân");
  const [brideName, setBrideName] = useState("Nguyễn Thu Hà");
  const [brideShort, setBrideShort] = useState("Thu Hà");

  // Birthday state
  const [celebrantName, setCelebrantName] = useState("Hoàng Bảo Nam");
  const [age, setAge] = useState(25);

  // Newborn state
  const [babyName, setBabyName] = useState("Nguyễn Tuệ Nhi");
  const [nickname, setNickname] = useState("Bé Đậu");
  const [ceremonyType, setCeremonyType] = useState<"ANNOUNCEMENT_ONLY" | "FULL_MONTH" | "ONE_YEAR">("FULL_MONTH");
  const [weight, setWeight] = useState("3.4 kg");
  const [height, setHeight] = useState("51 cm");

  // Events
  const [events, setEvents] = useState([
    {
      eventName: category === "WEDDING" ? "Lễ Thành Hôn & Tiệc Cưới" : "Tiệc Mừng",
      eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      venueName: "Trung tâm Hội nghị Tiệc cưới GEM Center",
      address: "Số 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh",
      mapUrl: "https://maps.google.com",
    },
  ]);

  // Banking
  const [bankCode, setBankCode] = useState("MB");
  const [accountNumber, setAccountNumber] = useState("0988888888");
  const [accountName, setAccountName] = useState("NGUYEN VAN A");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Build live preview card object
  const previewCard: CardDetail = {
    id: "preview-card-id",
    slug,
    cardCategory: category,
    status: "ACTIVE",
    openingEffect: "NONE", // Tắt mở phong bì trong preview để xem trực tiếp
    fallingEffect,
    isAutoPlay: false,
    primaryColor,
    fontFamily: "Inter",
    greetingMessage,
    bankingPrimary: {
      bankCode,
      accountNumber,
      accountName,
    },
    events: events.map((e) => ({
      ...e,
      eventDate: new Date(e.eventDate),
    })),
    photos: [
      {
        url:
          category === "WEDDING"
            ? "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop"
            : category === "BIRTHDAY"
            ? "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop",
      },
    ],
    categoryData:
      category === "WEDDING"
        ? {
            cardCategory: "WEDDING",
            groom: { fullName: groomName, shortName: groomShort },
            bride: { fullName: brideName, shortName: brideShort },
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
    setErrorMsg("");

    const payload: any = {
      slug,
      templateId: "wedding-hong-xanh-luxury",
      planId: "free-plan-id",
      openingEffect,
      fallingEffect,
      primaryColor,
      greetingMessage,
      bankingPrimary: { bankCode, accountNumber, accountName },
      data: {
        cardCategory: category,
        events: events.map((e) => ({
          ...e,
          eventDate: new Date(e.eventDate),
        })),
        ...(category === "WEDDING"
          ? {
              groom: { fullName: groomName, shortName: groomShort },
              bride: { fullName: brideName, shortName: brideShort },
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

    const res = await ApiClient.request("/cards", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.success) {
      router.push(`/thiep/${slug}`);
    } else {
      // Nếu là chế độ demo chưa có token auth, chuyển thẳng xem thiệp
      router.push(`/thiep/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* BUILDER HEADER */}
      <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-800 text-lg font-serif">
            Trình Tạo Thiệp Trực Quan
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
            Live Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveCard}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Xuất Bản Thiệp"}</span>
          </button>
        </div>
      </header>

      {/* 2-COLUMN BUILDER WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="w-full lg:w-[480px] xl:w-[540px] bg-white border-r border-stone-200 p-6 overflow-y-auto max-h-[calc(100vh-64px)] space-y-6">
          {/* CHỌN DANH MỤC */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              1. Danh Mục Thiệp
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
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {c.icon}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ĐƯỜNG DẪN SLUG */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              2. Đường Dẫn Thiệp (Slug URL)
            </label>
            <div className="flex items-center text-xs rounded-xl border border-stone-200 bg-stone-50 overflow-hidden px-3 py-2">
              <span className="text-stone-400">cardvite.vn/thiep/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="font-bold text-stone-900 bg-transparent focus:outline-none flex-1 ml-1"
              />
            </div>
          </div>

          {/* FORM CHI TIẾT THEO DANH MỤC */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              3. Thông Tin Chi Tiết
            </h4>

            {category === "WEDDING" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tên Chú Rể
                    </label>
                    <input
                      type="text"
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tên Gọi Thân Mật
                    </label>
                    <input
                      type="text"
                      value={groomShort}
                      onChange={(e) => setGroomShort(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tên Cô Dâu
                    </label>
                    <input
                      type="text"
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tên Gọi Thân Mật
                    </label>
                    <input
                      type="text"
                      value={brideShort}
                      onChange={(e) => setBrideShort(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                    />
                  </div>
                </div>
              </>
            )}

            {category === "BIRTHDAY" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Tên Chủ Nhân Bữa Tiệc
                  </label>
                  <input
                    type="text"
                    value={celebrantName}
                    onChange={(e) => setCelebrantName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Tuổi Mới (Tuổi bước sang)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                  />
                </div>
              </div>
            )}

            {category === "NEWBORN" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tên Của Bé
                    </label>
                    <input
                      type="text"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tên Ở Nhà (Nickname)
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Loại Nghi Thức
                  </label>
                  <select
                    value={ceremonyType}
                    onChange={(e) => setCeremonyType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200"
                  >
                    <option value="ANNOUNCEMENT_ONLY">Chỉ Báo Tin Chào Đời (Không tiệc)</option>
                    <option value="FULL_MONTH">Lễ Đầy Tháng (Có tiệc mừng)</option>
                    <option value="ONE_YEAR">Lễ Thôi Nôi (Có tiệc & Bốc đồ)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* CẤU HÌNH HIỆU ỨNG & MÀU SẮC */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              4. Hiệu Ứng & Màu Sắc
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Màu Chủ Đạo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 p-0.5"
                  />
                  <span className="text-xs font-mono font-bold text-stone-700">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Hiệu Ứng Rơi</label>
                <select
                  value={fallingEffect}
                  onChange={(e) => setFallingEffect(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200"
                >
                  <option value="PETAL">Cánh Hoa Rơi</option>
                  <option value="HEART">Trái Tim Bay</option>
                  <option value="SNOW">Tuyết Rơi</option>
                  <option value="CONFETTI">Pháo Hoa</option>
                  <option value="BALLOON">Bóng Bay</option>
                  <option value="NONE">Không có</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: MÔ PHỎNG ĐIỆN THOẠI (LIVE MOBILE PREVIEW) */}
        <div className="flex-1 bg-stone-200/70 p-6 flex flex-col items-center justify-center overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
            <Smartphone className="w-4 h-4" />
            <span>Màn Hình Xem Trước Trực Quan</span>
          </div>

          {/* IPHONE MOCKUP FRAME */}
          <div className="relative w-full max-w-[390px] aspect-[9/19] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-stone-800">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40" />

            {/* SCREEN VIEWPORT */}
            <div className="w-full h-full bg-white rounded-[38px] overflow-y-auto overflow-x-hidden relative">
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
