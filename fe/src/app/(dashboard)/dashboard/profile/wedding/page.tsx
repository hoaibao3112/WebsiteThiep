"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Check, Loader2, Heart, Plus } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { CardDetail, EventItem, PhotoItem } from "@/types/card.types";
import { WeddingView } from "@/components/wedding/WeddingView";
import { WeddingAccordionForm } from "@/components/wedding/form/WeddingAccordionForm";
import { QuickFillModal, QuickFillData } from "@/components/card/QuickFillModal";
import confetti from "canvas-confetti";

export default function WeddingProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);

  // ── 23 SECTIONS STATE ──
  const [templateSlug, setTemplateSlug] = useState("wedding-heritage-crimson-gold");
  const [primaryColor, setPrimaryColor] = useState("#8B1E2D");
  const [openingEffect, setOpeningEffect] = useState<"WAX_SEAL" | "GATE_OPEN" | "GIFT_BOX" | "NONE">("WAX_SEAL");

  const [groomName, setGroomName] = useState("");
  const [groomShort, setGroomShort] = useState("");
  const [groomBirthOrder, setGroomBirthOrder] = useState("");
  const [groomFather, setGroomFather] = useState("");
  const [groomMother, setGroomMother] = useState("");
  const [groomPhone, setGroomPhone] = useState("");
  const [groomAddress, setGroomAddress] = useState("");

  const [brideName, setBrideName] = useState("");
  const [brideShort, setBrideShort] = useState("");
  const [brideBirthOrder, setBrideBirthOrder] = useState("");
  const [brideFather, setBrideFather] = useState("");
  const [brideMother, setBrideMother] = useState("");
  const [bridePhone, setBridePhone] = useState("");
  const [brideAddress, setBrideAddress] = useState("");

  const [isReverseOrder, setIsReverseOrder] = useState(false);

  const [greetingMessage, setGreetingMessage] = useState(
    "Tình yêu không phải là nhìn nhau, mà là cùng nhìn về một hướng. Trân trọng kính mời bạn đến chung vui cùng chúng tôi."
  );

  const [loveStory, setLoveStory] = useState<{ title: string; date: string; description?: string; imageUrl?: string }[]>([
    {
      title: "Lần Đầu Gặp Gỡ",
      date: "14/02/2022",
      description: "Một chiều mưa cà phê tại góc phố quen, ánh mắt chạm nhau mở đầu cho bản tình ca.",
      imageUrl: "/images/demo/couple-cover.png",
    },
    {
      title: "Lời Hẹn Ước Trăm Năm",
      date: "24/12/2024",
      description: "Chuyến đi Đà Lạt mộng mơ và chiếc nhẫn cầu hôn đong đầy lời hứa trăm năm.",
      imageUrl: "/images/demo/couple-studio.png",
    },
  ]);

  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "ev-vuquy",
      eventName: "LỄ VU QUY (NHÀ GÁI)",
      eventDate: "2026-11-20T09:00",
      venueName: "Tư gia nhà gái",
      address: "123 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. HCM",
    },
    {
      id: "ev-thanhhon",
      eventName: "TIỆC CƯỚI CHÍNH THỨC",
      eventDate: "2026-11-20T18:00",
      venueName: "Trung tâm tiệc cưới White Palace",
      address: "194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. HCM",
    },
  ]);

  const [photos, setPhotos] = useState<PhotoItem[]>([
    { id: "ph-1", url: "/images/demo/couple-cover.png", caption: "Khoảnh khắc hạnh phúc", isCover: true },
    { id: "ph-2", url: "/images/demo/couple-studio.png", caption: "Bên nhau trọn đời" },
    { id: "ph-3", url: "/images/demo/couple-aodai.png", caption: "Lễ thành hôn truyền thống" },
  ]);

  const [bankCodeGroom, setBankCodeGroom] = useState("MB");
  const [accNumGroom, setAccNumGroom] = useState("");
  const [accNameGroom, setAccNameGroom] = useState("");

  const [bankCodeBride, setBankCodeBride] = useState("VCB");
  const [accNumBride, setAccNumBride] = useState("");
  const [accNameBride, setAccNameBride] = useState("");

  const [selectedMusicSrc, setSelectedMusicSrc] = useState("/music/le-duong.mp3");
  const [videoUrl, setVideoUrl] = useState("");
  const [isRsvpEnabled, setIsRsvpEnabled] = useState(true);

  // ── LOAD USER WEDDING PROFILE FROM DATABASE ──
  useEffect(() => {
    let isMounted = true;
    ApiClient.request<any>("/user/wedding-profile")
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          const d = res.data;
          if (d.templateSlug) setTemplateSlug(d.templateSlug);
          if (d.primaryColor) setPrimaryColor(d.primaryColor);
          if (d.openingEffect) setOpeningEffect(d.openingEffect);

          if (d.groomName) setGroomName(d.groomName);
          if (d.groomShort) setGroomShort(d.groomShort);
          if (d.groomBirthOrder) setGroomBirthOrder(d.groomBirthOrder);
          if (d.groomFather) setGroomFather(d.groomFather);
          if (d.groomMother) setGroomMother(d.groomMother);
          if (d.groomPhone) setGroomPhone(d.groomPhone);
          if (d.groomAddress) setGroomAddress(d.groomAddress);

          if (d.brideName) setBrideName(d.brideName);
          if (d.brideShort) setBrideShort(d.brideShort);
          if (d.brideBirthOrder) setBrideBirthOrder(d.brideBirthOrder);
          if (d.brideFather) setBrideFather(d.brideFather);
          if (d.brideMother) setBrideMother(d.brideMother);
          if (d.bridePhone) setBridePhone(d.bridePhone);
          if (d.brideAddress) setBrideAddress(d.brideAddress);

          if (d.isReverseOrder !== undefined) setIsReverseOrder(d.isReverseOrder);
          if (d.greetingMessage) setGreetingMessage(d.greetingMessage);
          if (d.loveStory && Array.isArray(d.loveStory) && d.loveStory.length > 0) setLoveStory(d.loveStory);
          if (d.events && Array.isArray(d.events) && d.events.length > 0) setEvents(d.events);
          if (d.photos && Array.isArray(d.photos) && d.photos.length > 0) setPhotos(d.photos);

          if (d.bankCodeGroom) setBankCodeGroom(d.bankCodeGroom);
          if (d.accNumGroom) setAccNumGroom(d.accNumGroom);
          if (d.accNameGroom) setAccNameGroom(d.accNameGroom);

          if (d.bankCodeBride) setBankCodeBride(d.bankCodeBride);
          if (d.accNumBride) setAccNumBride(d.accNumBride);
          if (d.accNameBride) setAccNameBride(d.accNameBride);

          if (d.bankGroom) {
            setBankCodeGroom(d.bankGroom.bankCode || "MB");
            setAccNumGroom(d.bankGroom.accountNumber || "");
            setAccNameGroom(d.bankGroom.accountName || "");
          }
          if (d.bankBride) {
            setBankCodeBride(d.bankBride.bankCode || "VCB");
            setAccNumBride(d.bankBride.accountNumber || "");
            setAccNameBride(d.bankBride.accountName || "");
          }

          if (d.selectedMusicSrc) setSelectedMusicSrc(d.selectedMusicSrc);
          if (d.videoUrl) setVideoUrl(d.videoUrl);
          if (d.isRsvpEnabled !== undefined) setIsRsvpEnabled(d.isRsvpEnabled);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ── QUICK FILL HANDLER ──
  const handleApplyQuickFill = (data: QuickFillData) => {
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
          return [{ ...prev[0], eventDate: dateStr, address: data.address || prev[0].address }, ...prev.slice(1)];
        }
        return [
          {
            id: "ev-main",
            eventName: "LỄ THÀNH HÔN",
            eventDate: dateStr,
            venueName: "Trung tâm tiệc cưới",
            address: data.address || "Tư gia",
          },
        ];
      });
    }

    if (data.photos && data.photos.length > 0) {
      setPhotos(
        data.photos.map((p, idx) => ({
          id: p.id || `ph-${idx}`,
          url: p.url,
          caption: p.caption,
          isCover: idx === 0,
        }))
      );
    }
    setShowQuickFill(false);
  };

  // ── LIVE PREVIEW DATA ──
  const previewCard: CardDetail = {
    id: "profile-preview",
    slug: "ho-so-cuoi-preview",
    cardCategory: "WEDDING",
    status: "ACTIVE",
    openingEffect,
    fallingEffect: "PETAL",
    primaryColor,
    fontFamily: "Playfair Display",
    musicUrl: selectedMusicSrc,
    greetingMessage,
    isAutoPlay: true,
    bankingPrimary: { bankCode: bankCodeGroom, accountNumber: accNumGroom, accountName: accNameGroom },
    bankingSecondary: { bankCode: bankCodeBride, accountNumber: accNumBride, accountName: accNameBride },
    events: events.map((e) => ({
      ...e,
      eventDate: new Date(e.eventDate),
    })),
    photos,
    categoryData: {
      cardCategory: "WEDDING",
      coverPhotoUrl: photos.find((p) => p.isCover)?.url || photos[0]?.url || "/images/demo/couple-cover.png",
      groom: {
        fullName: groomName || "Chú Rể",
        shortName: groomShort,
        birthOrder: groomBirthOrder,
        parents: { fatherName: groomFather, motherName: groomMother },
      },
      bride: {
        fullName: brideName || "Cô Dâu",
        shortName: brideShort,
        birthOrder: brideBirthOrder,
        parents: { fatherName: brideFather, motherName: brideMother },
      },
      loveStory,
      events: [],
    },
  };

  // ── SAVE FULL 23 SECTIONS TO PROFILE ──
  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {
        templateSlug,
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
        isRsvpEnabled,
        // Legacy compatibility
        eventDate: events[0]?.eventDate ? new Date(events[0].eventDate).toISOString().slice(0, 10) : "",
        address: events[0]?.address || "",
        bankGroom: { bankCode: bankCodeGroom, accountNumber: accNumGroom, accountName: accNameGroom },
        bankBride: { bankCode: bankCodeBride, accountNumber: accNumBride, accountName: accNameBride },
      };

      const res = await ApiClient.request("/user/wedding-profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess(true);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
        setTimeout(() => setSuccess(false), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── CREATE NEW CARD FROM PROFILE ──
  const handleCreateCardFromProfile = async () => {
    setCreatingCard(true);
    try {
      // First save current profile
      await handleSaveProfile();

      const newSlug = `thiep-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        slug: newSlug,
        cardCategory: "WEDDING",
        templateSlug,
        primaryColor,
        fontFamily: "Playfair Display",
        openingEffect,
        fallingEffect: "PETAL",
        musicUrl: selectedMusicSrc,
        isAutoPlay: true,
        greetingMessage,
        bankingPrimary: accNumGroom ? { bankCode: bankCodeGroom, accountNumber: accNumGroom, accountName: accNameGroom } : undefined,
        bankingSecondary: accNumBride ? { bankCode: bankCodeBride, accountNumber: accNumBride, accountName: accNameBride } : undefined,
        events: events.map((e) => ({
          eventName: e.eventName,
          eventDate: new Date(e.eventDate).toISOString(),
          venueName: e.venueName,
          address: e.address,
        })),
        photos,
        categoryData: {
          cardCategory: "WEDDING",
          coverPhotoUrl: photos[0]?.url || "/images/demo/couple-cover.png",
          groom: {
            fullName: groomName || "Chú Rể",
            shortName: groomShort,
            birthOrder: groomBirthOrder,
            phone: groomPhone,
            address: groomAddress,
            parents: { fatherName: groomFather, motherName: groomMother },
          },
          bride: {
            fullName: brideName || "Cô Dâu",
            shortName: brideShort,
            birthOrder: brideBirthOrder,
            phone: bridePhone,
            address: brideAddress,
            parents: { fatherName: brideFather, motherName: brideMother },
          },
          loveStory,
          events: [],
          videoUrl,
          isReverseOrder,
        },
      };

      const res = await ApiClient.request<{ id: string; slug: string }>("/cards", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        await ApiClient.request(`/cards/${res.data.id}/publish`, { method: "PATCH" });
        router.push(`/dashboard/cards/${res.data.id}/edit`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#BE944E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECEEF1] font-sans text-stone-900 flex flex-col">
      {/* ── HEADER BAR ── */}
      <header className="bg-white/95 border-b border-stone-200 sticky top-0 z-40 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/cards"
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition"
              title="Quay lại danh sách thiệp"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-bold font-serif text-stone-900 flex items-center gap-1.5">
                <span>Hồ Sơ Cưới Của Tôi (23 Mục Đầy Đủ)</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </h1>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Lưu 1 lần vào tài khoản — Tự động điền đầy đủ mọi mục khi tạo thiệp cưới.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowQuickFill(true)}
              className="px-3 sm:px-4 py-2 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>⚡ Điền Nhanh</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 sm:px-6 py-2 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Đang lưu..." : "Lưu Hồ Sơ"}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateCardFromProfile}
              disabled={creatingCard}
              className="hidden md:flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {creatingCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
              <span>Tạo Thiệp Ngay</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Đã lưu thành công toàn bộ 23 mục vào hồ sơ tài khoản!</span>
        </div>
      )}

      {/* ── MAIN 2-COLUMN WORKSPACE (LIVE PREVIEW TRÁI + 23 ACCORDIONS PHẢI) ── */}
      <main className="flex-1 w-full p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* CỘT TRÁI: LIVE PREVIEW (STICKY) */}
          <div className="w-full lg:w-[410px] xl:w-[430px] shrink-0 lg:sticky lg:top-20">
            <div className="bg-white rounded-3xl p-3 shadow-md border border-stone-200/90 overflow-hidden">
              <div className="h-[760px] max-h-[82vh] overflow-y-auto overflow-x-hidden rounded-2xl relative bg-[#FAF8F5]">
                <WeddingView card={previewCard} templateSlug={templateSlug} isPreview={true} />
              </div>
            </div>
            <p className="text-center text-[11px] text-stone-500 mt-2">
              Khung xem trước thiệp cưới thực tế theo thời gian thực
            </p>
          </div>

          {/* CỘT PHẢI: 23 ACCORDION ITEMS ĐẦY ĐỦ */}
          <div className="flex-1 w-full min-w-0">
            <WeddingAccordionForm
              templateSlug={templateSlug}
              onSelectTemplate={(s) => setTemplateSlug(s)}
              primaryColor={primaryColor}
              onColorChange={setPrimaryColor}
              openingEffect={openingEffect}
              onOpeningEffectChange={setOpeningEffect}
              groomName={groomName}
              onGroomNameChange={setGroomName}
              groomShort={groomShort}
              onGroomShortChange={setGroomShort}
              groomBirthOrder={groomBirthOrder}
              onGroomBirthOrderChange={setGroomBirthOrder}
              groomFather={groomFather}
              onGroomFatherChange={setGroomFather}
              groomMother={groomMother}
              onGroomMotherChange={setGroomMother}
              groomPhone={groomPhone}
              onGroomPhoneChange={setGroomPhone}
              groomAddress={groomAddress}
              onGroomAddressChange={setGroomAddress}

              brideName={brideName}
              onBrideNameChange={setBrideName}
              brideShort={brideShort}
              onBrideShortChange={setBrideShort}
              brideBirthOrder={brideBirthOrder}
              onBrideBirthOrderChange={setBrideBirthOrder}
              brideFather={brideFather}
              onBrideFatherChange={setBrideFather}
              brideMother={brideMother}
              onBrideMotherChange={setBrideMother}
              bridePhone={bridePhone}
              onBridePhoneChange={setBridePhone}
              brideAddress={brideAddress}
              onBrideAddressChange={setBrideAddress}

              isReverseOrder={isReverseOrder}
              onReverseOrderChange={setIsReverseOrder}

              greetingMessage={greetingMessage}
              onGreetingChange={setGreetingMessage}
              loveStory={loveStory}
              onLoveStoryChange={setLoveStory}

              events={events}
              onEventsChange={setEvents}

              photos={photos}
              onPhotosChange={setPhotos}
              onUploadPhotos={() => setShowQuickFill(true)}

              bankCodeGroom={bankCodeGroom}
              onBankCodeGroomChange={setBankCodeGroom}
              accNumGroom={accNumGroom}
              onAccNumGroomChange={setAccNumGroom}
              accNameGroom={accNameGroom}
              onAccNameGroomChange={setAccNameGroom}

              bankCodeBride={bankCodeBride}
              onBankCodeBrideChange={setBankCodeBride}
              accNumBride={accNumBride}
              onAccNumBrideChange={setAccNumBride}
              accNameBride={accNameBride}
              onAccNameBrideChange={setAccNameBride}

              selectedMusicSrc={selectedMusicSrc}
              onMusicChange={setSelectedMusicSrc}
              videoUrl={videoUrl}
              onVideoUrlChange={setVideoUrl}
              isRsvpEnabled={isRsvpEnabled}
              onRsvpToggle={setIsRsvpEnabled}
            />
          </div>
        </div>
      </main>

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
          photos: photos.map((p, idx) => ({ id: p.id || `ph-${idx}`, url: p.url, caption: p.caption })),
        }}
      />
    </div>
  );
}
