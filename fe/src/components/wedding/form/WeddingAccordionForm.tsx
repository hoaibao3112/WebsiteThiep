"use client";

import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Heart,
  Image as ImageIcon,
  BookOpen,
  Users,
  MessageSquare,
  Clock,
  Calendar,
  FileText,
  Clock3,
  Shirt,
  MapPin,
  Video,
  Phone,
  Gift,
  Music,
  CheckCircle2,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Share2,
  HelpCircle,
  Eye,
  Sliders,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import { PhotoItem, EventItem } from "@/types/card.types";

interface WeddingAccordionFormProps {
  // Theme & Opening
  templateSlug: string;
  onSelectTemplate?: (slug: string) => void;
  primaryColor: string;
  onColorChange: (color: string) => void;
  openingEffect: "WAX_SEAL" | "GATE_OPEN" | "GIFT_BOX" | "NONE";
  onOpeningEffectChange: (effect: "WAX_SEAL" | "GATE_OPEN" | "GIFT_BOX" | "NONE") => void;

  // Couple & Parents
  groomName: string;
  onGroomNameChange: (val: string) => void;
  groomShort: string;
  onGroomShortChange: (val: string) => void;
  groomBirthOrder: string;
  onGroomBirthOrderChange: (val: string) => void;
  groomFather: string;
  onGroomFatherChange: (val: string) => void;
  groomMother: string;
  onGroomMotherChange: (val: string) => void;
  groomPhone?: string;
  onGroomPhoneChange?: (val: string) => void;
  groomAddress?: string;
  onGroomAddressChange?: (val: string) => void;

  brideName: string;
  onBrideNameChange: (val: string) => void;
  brideShort: string;
  onBrideShortChange: (val: string) => void;
  brideBirthOrder: string;
  onBrideBirthOrderChange: (val: string) => void;
  brideFather: string;
  onBrideFatherChange: (val: string) => void;
  brideMother: string;
  onBrideMotherChange: (val: string) => void;
  bridePhone?: string;
  onBridePhoneChange?: (val: string) => void;
  brideAddress?: string;
  onBrideAddressChange?: (val: string) => void;

  isReverseOrder?: boolean;
  onReverseOrderChange?: (val: boolean) => void;

  // Greeting & Love story
  greetingMessage: string;
  onGreetingChange: (val: string) => void;
  loveStory: { title: string; date: string; description?: string; imageUrl?: string }[];
  onLoveStoryChange: (story: { title: string; date: string; description?: string; imageUrl?: string }[]) => void;

  // Events & Schedule
  events: EventItem[];
  onEventsChange: (events: EventItem[]) => void;

  // Gallery
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  onUploadPhotos: () => void;

  // Banking
  bankCodeGroom: string;
  onBankCodeGroomChange: (val: string) => void;
  accNumGroom: string;
  onAccNumGroomChange: (val: string) => void;
  accNameGroom: string;
  onAccNameGroomChange: (val: string) => void;

  bankCodeBride: string;
  onBankCodeBrideChange: (val: string) => void;
  accNumBride: string;
  onAccNumBrideChange: (val: string) => void;
  accNameBride: string;
  onAccNameBrideChange: (val: string) => void;

  // Music
  selectedMusicSrc: string;
  onMusicChange: (src: string) => void;

  // Video
  videoUrl?: string;
  onVideoUrlChange?: (url: string) => void;

  // RSVP
  isRsvpEnabled?: boolean;
  onRsvpToggle?: (enabled: boolean) => void;

  // Profile Integration
  onOpenApplyProfile?: () => void;
  onSaveToProfile?: () => void;
  isSavingProfile?: boolean;
  saveProfileSuccess?: boolean;
}

export function WeddingAccordionForm(props: WeddingAccordionFormProps) {
  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    theme: false,
    opening: false,
    basic: true, // Open by default
    hero: false,
    greeting: false,
    couple: false,
    interview: false,
    timeline: false,
    announcement: false,
    invitation: false,
    datetime: false,
    schedule: false,
    dresscode: false,
    location: false,
    video: false,
    gallery: false,
    ending: false,
    contact: false,
    banking: false,
    music: false,
    rsvp: false,
    guestbook: false,
    advanced: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Section Header Component
  const AccordionItem = ({
    id,
    title,
    isComplete,
    badge,
    children,
  }: {
    id: string;
    title: string;
    isComplete?: boolean;
    badge?: string;
    children: React.ReactNode;
  }) => {
    const isOpen = !!openSections[id];

    return (
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs transition">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full p-4 bg-white hover:bg-stone-50/70 flex items-center justify-between transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-stone-300 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold text-stone-900">{title}</span>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {badge}
              </span>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {isOpen && <div className="p-4 sm:p-5 border-t border-stone-100 bg-[#FCFBF9]/60 space-y-4 text-xs">{children}</div>}
      </div>
    );
  };

  // Padding Selector helper
  const PaddingSelector = () => (
    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
      <span className="text-[11px] font-semibold text-stone-500">Khoảng đệm</span>
      <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white text-[11px]">
        <span className="px-2.5 py-1 font-bold bg-stone-900 text-white">Mặc định (60px · 32px)</span>
        <span className="px-2.5 py-1 text-stone-500 hover:bg-stone-100 cursor-pointer">Không padding</span>
        <span className="px-2.5 py-1 text-stone-500 hover:bg-stone-100 cursor-pointer">Tùy chỉnh</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 pb-24">
      {/* ── PROFILE INTEGRATION HERO BANNER ── */}
      {(props.onOpenApplyProfile || props.onSaveToProfile) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-200/90 p-3.5 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-stone-900 text-sm font-serif">Hồ Sơ Cưới Tài Khoản</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    Tùy chọn mục áp dụng
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Điền sẵn hồ sơ tài khoản và tích chọn từng phần muốn áp dụng vào thiệp cưới này.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {props.onOpenApplyProfile && (
                <button
                  type="button"
                  onClick={props.onOpenApplyProfile}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="Chọn các mục từ hồ sơ để điền vào thiệp"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Áp Dụng Từ Hồ Sơ</span>
                </button>
              )}
              {props.onSaveToProfile && (
                <button
                  type="button"
                  onClick={props.onSaveToProfile}
                  disabled={props.isSavingProfile}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Lưu tất cả thông tin hiện tại vào hồ sơ tài khoản để tái sử dụng"
                >
                  {props.isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Đang lưu...</span>
                    </>
                  ) : props.saveProfileSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã lưu hồ sơ!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>Lưu Vào Hồ Sơ</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. GIAO DIỆN */}
      <AccordionItem id="theme" title="Giao diện" isComplete={!!props.templateSlug}>
        <div>
          <label className="font-bold text-stone-700 block mb-1.5">Mẫu giao diện đang dùng</label>
          <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
            <span className="font-semibold text-stone-900 uppercase font-mono">{props.templateSlug}</span>
            <span className="text-[11px] font-bold text-[#BE944E]">Đang kích hoạt</span>
          </div>
        </div>
      </AccordionItem>

      {/* 2. HIỆU ỨNG MỞ MÀN */}
      <AccordionItem id="opening" title="Hiệu ứng mở màn" isComplete={props.openingEffect !== "NONE"}>
        <div className="space-y-3">
          <label className="font-bold text-stone-700 block">Chọn phong cách mở màn</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "WAX_SEAL", name: "Sáp Niêm Phong" },
              { id: "GATE_OPEN", name: "Cổng Hoa Mở" },
              { id: "GIFT_BOX", name: "Hộp Quà Sang Trọng" },
              { id: "NONE", name: "Vào Thẳng Thiệp" },
            ].map((eff) => (
              <button
                key={eff.id}
                type="button"
                onClick={() => props.onOpeningEffectChange(eff.id as any)}
                className={`p-3 rounded-xl border text-center transition font-bold text-xs ${
                  props.openingEffect === eff.id
                    ? "bg-amber-50 border-amber-500 text-amber-950 shadow-2xs"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {eff.name}
              </button>
            ))}
          </div>
        </div>
      </AccordionItem>

      {/* 3. THÔNG TIN CƠ BẢN */}
      <AccordionItem
        id="basic"
        title="Thông tin cơ bản"
        isComplete={!!(props.groomName && props.brideName)}
      >
        <div className="space-y-4">
          {/* Chú rể */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-800 font-bold">
              <span>🤵 Chú rể</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Họ và tên chú rể"
                value={props.groomName}
                onChange={(e) => props.onGroomNameChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
              <input
                type="text"
                placeholder="Tên gọi thân mật / Thứ bậc (Trưởng nam...)"
                value={props.groomBirthOrder}
                onChange={(e) => props.onGroomBirthOrderChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
              <input
                type="text"
                placeholder="Họ tên Bố chú rể"
                value={props.groomFather}
                onChange={(e) => props.onGroomFatherChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
              <input
                type="text"
                placeholder="Họ tên Mẹ chú rể"
                value={props.groomMother}
                onChange={(e) => props.onGroomMotherChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
            </div>
            <input
              type="text"
              placeholder="Địa chỉ nhà trai"
              value={props.groomAddress || ""}
              onChange={(e) => props.onGroomAddressChange?.(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
            />
          </div>

          {/* Cô dâu */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-800 font-bold">
              <span>👰 Cô dâu</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Họ và tên cô dâu"
                value={props.brideName}
                onChange={(e) => props.onBrideNameChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
              <input
                type="text"
                placeholder="Tên gọi thân mật / Thứ bậc (Út nữ...)"
                value={props.brideBirthOrder}
                onChange={(e) => props.onBrideBirthOrderChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
              <input
                type="text"
                placeholder="Họ tên Bố cô dâu"
                value={props.brideFather}
                onChange={(e) => props.onBrideFatherChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
              <input
                type="text"
                placeholder="Họ tên Mẹ cô dâu"
                value={props.brideMother}
                onChange={(e) => props.onBrideMotherChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
            </div>
            <input
              type="text"
              placeholder="Địa chỉ nhà gái"
              value={props.brideAddress || ""}
              onChange={(e) => props.onBrideAddressChange?.(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
            />
          </div>

          {/* Toggle thứ tự */}
          <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
            <span className="font-semibold text-stone-700">Hiển thị phía nhà gái trước</span>
            <input
              type="checkbox"
              checked={props.isReverseOrder || false}
              onChange={(e) => props.onReverseOrderChange?.(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </AccordionItem>

      {/* 4. MÀN HÌNH CHÍNH */}
      <AccordionItem id="hero" title="Màn hình chính" isComplete={props.photos.length > 0}>
        <div className="space-y-3">
          <label className="font-bold text-stone-700 block">Kiểu khung ảnh chính</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center">
            {["Cơ bản", "Lấp đầy", "Vòm", "Bầu dục", "Khung ảnh"].map((k) => (
              <button
                key={k}
                type="button"
                className="p-2 rounded-xl border border-stone-200 bg-white hover:border-amber-400 font-medium text-[11px]"
              >
                {k}
              </button>
            ))}
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 5. LỜI NGỎ */}
      <AccordionItem id="greeting" title="Lời ngỏ" isComplete={!!props.greetingMessage}>
        <div className="space-y-3">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Tiêu đề lời ngỏ</label>
            <input
              type="text"
              defaultValue="Trân trọng kính mời"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-700">Nội dung lời ngỏ</label>
              <button
                type="button"
                onClick={() =>
                  props.onGreetingChange(
                    "Cuộc gặp gỡ nhỏ bé của hai chúng con đã nở thành trái ngọt tình yêu, và chúng con sẽ cử hành hôn lễ thiêng liêng. Trân trọng kính mời quý khách đến chung vui và chúc phúc cùng gia đình chúng tôi!"
                  )
                }
                className="text-[10px] font-bold text-amber-700 hover:underline"
              >
                Xem cụm mẫu hay
              </button>
            </div>
            <textarea
              rows={4}
              value={props.greetingMessage}
              onChange={(e) => props.onGreetingChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 bg-white text-xs font-sans leading-relaxed"
            />
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 6. GIỚI THIỆU HAI BÊN */}
      <AccordionItem id="couple" title="Giới thiệu hai bên" isComplete={true}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">Bố cục:</span>
            {["Ngang", "Trái", "Phải", "Dọc"].map((b) => (
              <span key={b} className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-[11px] font-semibold cursor-pointer">
                {b}
              </span>
            ))}
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 7. PHỎNG VẤN */}
      <AccordionItem id="interview" title="Phỏng vấn (Q&A)" isComplete={false}>
        <div className="space-y-3">
          <input
            type="text"
            defaultValue="Câu chuyện của chúng mình"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold"
          />
          <button
            type="button"
            className="w-full py-2 rounded-xl border border-dashed border-stone-300 hover:border-amber-400 bg-white text-stone-600 font-bold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm câu hỏi phỏng vấn</span>
          </button>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 8. DÒNG THỜI GIAN */}
      <AccordionItem id="timeline" title="Dòng thời gian" isComplete={props.loveStory.length > 0}>
        <div className="space-y-3">
          {props.loveStory.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
              <input
                type="text"
                placeholder="Tiêu đề cột mốc"
                value={item.title}
                onChange={(e) => {
                  const copy = [...props.loveStory];
                  copy[idx].title = e.target.value;
                  props.onLoveStoryChange(copy);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold"
              />
              <input
                type="text"
                placeholder="Thời gian (VD: 14.02.2023)"
                value={item.date}
                onChange={(e) => {
                  const copy = [...props.loveStory];
                  copy[idx].date = e.target.value;
                  props.onLoveStoryChange(copy);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              props.onLoveStoryChange([
                ...props.loveStory,
                { title: "Kỷ Niệm Đẹp", date: "2024", description: "" },
              ])
            }
            className="w-full py-2 rounded-xl border border-dashed border-stone-300 bg-white font-bold flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm câu chuyện tình yêu</span>
          </button>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 9. THÔNG TIN LỄ CƯỚI */}
      <AccordionItem id="announcement" title="Thông tin lễ cưới" isComplete={true}>
        <div className="space-y-3">
          <input
            type="text"
            defaultValue="THÔNG TIN LỄ CƯỚI"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nhà trai: Ông Bà"
              defaultValue="Ông Bà"
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
            />
            <input
              type="text"
              placeholder="Nhà gái: Ông Bà"
              defaultValue="Ông Bà"
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
            />
          </div>
          <input
            type="text"
            defaultValue="TRÂN TRỌNG BÁO TIN"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
          />
          <input
            type="text"
            defaultValue="LỄ THÀNH HÔN CỦA CON CHÚNG TÔI"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold"
          />
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 10. THƯ MỜI LỄ CƯỚI */}
      <AccordionItem id="invitation" title="Thư mời lễ cưới" isComplete={props.events.length > 0}>
        <div className="space-y-3">
          <input
            type="text"
            defaultValue="THƯ MỜI THAM DỰ TIỆC CƯỚI"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold"
          />
          {props.events.map((evt, idx) => (
            <div key={evt.id || idx} className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
              <span className="font-bold text-stone-700 block">Lễ {idx + 1}</span>
              <input
                type="text"
                value={evt.eventName}
                onChange={(e) => {
                  const copy = [...props.events];
                  copy[idx].eventName = e.target.value;
                  props.onEventsChange(copy);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold"
              />
              <input
                type="datetime-local"
                value={typeof evt.eventDate === "string" ? evt.eventDate.slice(0, 16) : ""}
                onChange={(e) => {
                  const copy = [...props.events];
                  copy[idx].eventDate = e.target.value;
                  props.onEventsChange(copy);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              props.onEventsChange([
                ...props.events,
                {
                  id: `evt-${Date.now()}`,
                  eventName: "LỄ THÀNH HÔN",
                  eventDate: new Date().toISOString().slice(0, 16),
                  venueName: "Nhà Hàng Tiệc Cưới",
                  address: "Chưa cập nhật",
                },
              ])
            }
            className="w-full py-2 rounded-xl border border-dashed border-stone-300 bg-white font-bold flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm lễ</span>
          </button>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 11. NGÀY GIỜ TỔ CHỨC */}
      <AccordionItem id="datetime" title="Ngày giờ tổ chức" isComplete={true}>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
            <label className="flex items-center gap-2 font-bold text-stone-800">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-600 rounded" />
              <span>Hiển thị lịch tháng</span>
            </label>
            <label className="flex items-center gap-2 font-bold text-stone-800">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-600 rounded" />
              <span>Đếm ngược đến ngày cưới (D-Day)</span>
            </label>
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 12. LỊCH TRÌNH NGÀY CƯỚI */}
      <AccordionItem id="schedule" title="Lịch trình ngày cưới" isComplete={false}>
        <div className="space-y-3">
          <div className="flex gap-2">
            {["Sơ đồ dọc", "Sơ đồ sole", "Sơ đồ ngang 4 điểm", "Dạng thẻ"].map((s, idx) => (
              <span key={s} className="flex-1 p-2 rounded-xl border border-stone-200 bg-white text-center text-[10px] font-bold">
                {s}
              </span>
            ))}
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 13. TRANG PHỤC (DRESS CODE) */}
      <AccordionItem id="dresscode" title="Trang phục (Dress code)" isComplete={false}>
        <div className="space-y-3">
          <input
            type="text"
            defaultValue="Trang phục gợi ý: Trắng, Kem, Be hoặc Pastel"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
          />
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">Tông màu:</span>
            {["#FFFFFF", "#F5EBE0", "#D5BDAF", "#E3D5CA"].map((c) => (
              <span key={c} className="w-6 h-6 rounded-full border border-black/15 shadow-2xs" style={{ backgroundColor: c }} />
            ))}
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 14. ĐỊA ĐIỂM TỔ CHỨC */}
      <AccordionItem id="location" title="Địa điểm tổ chức" isComplete={true}>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Địa chỉ chi tiết trung tâm tiệc cưới"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
          />
          <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
            <label className="flex items-center gap-2 font-bold text-stone-800">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-600 rounded" />
              <span>Hiển thị bản đồ Google Maps trên thiệp</span>
            </label>
            <label className="flex items-center gap-2 font-bold text-stone-800">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-600 rounded" />
              <span>Hiển thị nút mở ứng dụng chỉ đường</span>
            </label>
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 15. VIDEO */}
      <AccordionItem id="video" title="Video" isComplete={!!props.videoUrl}>
        <div className="space-y-3">
          <label className="font-bold text-stone-700 block">Đường dẫn Video YouTube</label>
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={props.videoUrl || ""}
            onChange={(e) => props.onVideoUrlChange?.(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
          />
          <p className="text-[11px] text-stone-400">
            Dán đường dẫn video clip cưới từ YouTube. Hãy đảm bảo video đã bật chế độ &quot;Cho phép nhúng&quot;.
          </p>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 16. THƯ VIỆN ẢNH */}
      <AccordionItem id="gallery" title="Thư viện ảnh" isComplete={props.photos.length > 0}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-700">Album cưới ({props.photos.length} ảnh)</span>
            <button
              type="button"
              onClick={props.onUploadPhotos}
              className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tải thêm ảnh</span>
            </button>
          </div>
          <div className="flex gap-2">
            {["Vuốt toàn ảnh", "Ảnh nhỏ + vuốt", "Dạng lưới"].map((style, idx) => (
              <span key={style} className={`p-2 rounded-xl border text-center text-[10px] font-bold ${idx === 0 ? "bg-amber-50 border-amber-400" : "bg-white"}`}>
                {style}
              </span>
            ))}
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 17. ẢNH VÀ LỜI KẾT */}
      <AccordionItem id="ending" title="Ảnh và lời kết" badge="Rất khuyến khích 🥰" isComplete={true}>
        <div className="space-y-3">
          <textarea
            rows={3}
            defaultValue="Xin cam đoan, dù cả thế giới là mùa đông&#10;Tình yêu của chúng con vẫn ấm như mùa xuân&#10;Và đôi khi, nồng nàn như mùa hè."
            className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-serif italic text-stone-700"
          />
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 18. LIÊN HỆ */}
      <AccordionItem id="contact" title="Liên hệ" isComplete={!!props.groomPhone}>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-semibold text-stone-600 block mb-1">SĐT Chú rể</label>
              <input
                type="text"
                placeholder="0988 888 888"
                value={props.groomPhone || ""}
                onChange={(e) => props.onGroomPhoneChange?.(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-600 block mb-1">SĐT Cô dâu</label>
              <input
                type="text"
                placeholder="0977 777 777"
                value={props.bridePhone || ""}
                onChange={(e) => props.onBridePhoneChange?.(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
              />
            </div>
          </div>
        </div>
      </AccordionItem>

      {/* 19. SỐ TÀI KHOẢN */}
      <AccordionItem
        id="banking"
        title="Số tài khoản (Mừng cưới VietQR)"
        isComplete={!!(props.accNumGroom || props.accNumBride)}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2.5">
            <span className="font-bold text-stone-800 block">Nhà Trai (Mừng Chú Rể)</span>
            <input
              type="text"
              placeholder="Ngân hàng (MB, VCB, ACB...)"
              value={props.bankCodeGroom}
              onChange={(e) => props.onBankCodeGroomChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50"
            />
            <input
              type="text"
              placeholder="Số tài khoản"
              value={props.accNumGroom}
              onChange={(e) => props.onAccNumGroomChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 font-mono"
            />
            <input
              type="text"
              placeholder="Chủ tài khoản"
              value={props.accNameGroom}
              onChange={(e) => props.onAccNameGroomChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 uppercase"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2.5">
            <span className="font-bold text-stone-800 block">Nhà Gái (Mừng Cô Dâu)</span>
            <input
              type="text"
              placeholder="Ngân hàng (VCB, MB...)"
              value={props.bankCodeBride}
              onChange={(e) => props.onBankCodeBrideChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50"
            />
            <input
              type="text"
              placeholder="Số tài khoản"
              value={props.accNumBride}
              onChange={(e) => props.onAccNumBrideChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 font-mono"
            />
            <input
              type="text"
              placeholder="Chủ tài khoản"
              value={props.accNameBride}
              onChange={(e) => props.onAccNameBrideChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/50 uppercase"
            />
          </div>
        </div>
      </AccordionItem>

      {/* 20. NHẠC NỀN */}
      <AccordionItem id="music" title="Nhạc nền" isComplete={!!props.selectedMusicSrc}>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-stone-800 truncate">{props.selectedMusicSrc || "A Thousand Years"}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Đang phát</span>
          </div>
        </div>
      </AccordionItem>

      {/* 21. XÁC NHẬN THAM DỰ - RSVP */}
      <AccordionItem id="rsvp" title="Xác nhận tham dự - RSVP" isComplete={props.isRsvpEnabled}>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
            <span className="font-bold text-stone-800 block">Các thông tin cần thu thập:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {["Số người tham dự", "Số liên hệ", "Nhà trai / Nhà gái", "Ghi chú khác", "Xe đưa đón"].map((item) => (
                <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-amber-600 rounded" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 22. SỔ LƯU BÚT */}
      <AccordionItem id="guestbook" title="Sổ lưu bút" isComplete={true}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <span className="flex-1 p-2 rounded-xl border border-amber-400 bg-amber-50 text-center font-bold text-[11px]">Công khai</span>
            <span className="flex-1 p-2 rounded-xl border border-stone-200 bg-white text-center font-bold text-[11px]">Riêng tư</span>
          </div>
          <div className="flex gap-2">
            {["Mặc định", "Post-it", "Popup dạng nút", "Lời chúc nổi"].map((k, idx) => (
              <span key={k} className={`flex-1 p-1.5 rounded-lg border text-center text-[10px] ${idx === 1 ? "bg-amber-100/70 border-amber-400 font-bold" : "bg-white"}`}>
                {k}
              </span>
            ))}
          </div>
          <PaddingSelector />
        </div>
      </AccordionItem>

      {/* 23. CẤU HÌNH NÂNG CAO */}
      <AccordionItem id="advanced" title="Cấu hình nâng cao & Ảnh chia sẻ Zalo / FB" isComplete={true}>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
            <span className="font-bold text-stone-800 block">Ảnh thu nhỏ chia sẻ URL</span>
            <p className="text-[11px] text-stone-500">
              Ảnh hiển thị khi bạn gửi link thiệp qua Facebook, Zalo, Messenger (Tỷ lệ 3:2 hoặc 16:9).
            </p>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}
