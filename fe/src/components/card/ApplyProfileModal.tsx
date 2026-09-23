"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Check,
  Loader2,
  Heart,
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  Gift,
  Music,
  Users,
  BookOpen,
  Palette,
  Shirt,
  CheckSquare,
  Square,
  ExternalLink,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import Link from "next/link";

export type WeddingSectionKey =
  | "couple"
  | "parents"
  | "datetime_venue"
  | "schedule"
  | "greeting"
  | "loveStory"
  | "photos"
  | "banking"
  | "music"
  | "theme";

interface SectionOption {
  key: WeddingSectionKey;
  title: string;
  desc: string;
  icon: React.ElementType;
  previewVal?: (profile: any) => string | null;
}

const SECTION_OPTIONS: SectionOption[] = [
  {
    key: "couple",
    title: "Thông tin Cô dâu & Chú rể",
    desc: "Tên đầy đủ, tên gọi, thứ bậc, số điện thoại & địa chỉ",
    icon: Heart,
    previewVal: (p) => {
      const g = p.groomName || "";
      const b = p.brideName || "";
      return g || b ? `${g || "Chú rể"} & ${b || "Cô dâu"}` : null;
    },
  },
  {
    key: "parents",
    title: "Thông tin Phụ mẫu hai bên",
    desc: "Họ tên bố mẹ nhà trai & bố mẹ nhà gái",
    icon: Users,
    previewVal: (p) => {
      const gParents = [p.groomFather, p.groomMother].filter(Boolean).join(" - ");
      const bParents = [p.brideFather, p.brideMother].filter(Boolean).join(" - ");
      return gParents || bParents ? `Nhà trai: ${gParents || "Chưa có"} | Nhà gái: ${bParents || "Chưa có"}` : null;
    },
  },
  {
    key: "datetime_venue",
    title: "Ngày giờ & Địa điểm tổ chức",
    desc: "Ngày cưới, giờ đón khách, tên nhà hàng & địa chỉ",
    icon: Calendar,
    previewVal: (p) => {
      const d = p.eventDate || p.events?.[0]?.eventDate;
      const addr = p.address || p.events?.[0]?.address;
      return d || addr ? `${d ? new Date(d).toLocaleDateString("vi-VN") : ""} ${addr ? `• ${addr}` : ""}` : null;
    },
  },
  {
    key: "schedule",
    title: "Lịch trình chi tiết ngày cưới",
    desc: "Các khung giờ đón khách, làm lễ, khai tiệc, chụp ảnh",
    icon: Clock,
    previewVal: (p) => {
      return p.events && p.events.length > 0 ? `${p.events.length} sự kiện/lễ cưới đã lên lịch` : null;
    },
  },
  {
    key: "greeting",
    title: "Lời ngỏ & Châm ngôn tình yêu",
    desc: "Nội dung lời ngỏ gửi đến quan khách",
    icon: BookOpen,
    previewVal: (p) => (p.greetingMessage ? p.greetingMessage.slice(0, 60) + "..." : null),
  },
  {
    key: "loveStory",
    title: "Câu chuyện tình yêu (Timeline)",
    desc: "Các cột mốc ngày gặp gỡ, lời cầu hôn và kỷ niệm",
    icon: Sparkles,
    previewVal: (p) => (p.loveStory?.length ? `${p.loveStory.length} kỷ niệm đã lưu` : null),
  },
  {
    key: "photos",
    title: "Album ảnh cưới",
    desc: "Toàn bộ danh sách ảnh cưới đã tải lên hồ sơ",
    icon: ImageIcon,
    previewVal: (p) => (p.photos?.length ? `${p.photos.length} ảnh trong album` : null),
  },
  {
    key: "banking",
    title: "Tài khoản mừng cưới (VietQR)",
    desc: "Số tài khoản và ngân hàng nhà trai & nhà gái",
    icon: Gift,
    previewVal: (p) => {
      const g = p.accNumGroom || p.bankGroom?.accountNumber;
      const b = p.accNumBride || p.bankBride?.accountNumber;
      return g || b ? `TK Chú rể: ${g || "Trống"} | TK Cô dâu: ${b || "Trống"}` : null;
    },
  },
  {
    key: "music",
    title: "Nhạc nền & Video cưới",
    desc: "Bài hát nền MP3 và link video kỷ niệm",
    icon: Music,
    previewVal: (p) => (p.selectedMusicSrc || p.musicUrl ? "Đã chọn nhạc nền" : null),
  },
  {
    key: "theme",
    title: "Phong cách giao diện & Hiệu ứng",
    desc: "Tông màu chủ đạo và hiệu ứng mở phong bì",
    icon: Palette,
    previewVal: (p) => (p.templateSlug ? `Mẫu: ${p.templateSlug}` : null),
  },
];

interface ApplyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (profileData: any, selectedKeys: WeddingSectionKey[]) => void;
}

export function ApplyProfileModal({ isOpen, onClose, onApply }: ApplyProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Record<WeddingSectionKey, boolean>>({
    couple: true,
    parents: true,
    datetime_venue: true,
    schedule: true,
    greeting: true,
    loveStory: true,
    photos: true,
    banking: true,
    music: true,
    theme: false, // Don't overwrite card theme by default unless user checks it
  });

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    ApiClient.request<any>("/user/wedding-profile")
      .then((res) => {
        if (res.success && res.data) {
          setProfile(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleKey = (key: WeddingSectionKey) => {
    setSelectedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (select: boolean) => {
    const updated: Record<WeddingSectionKey, boolean> = {} as any;
    SECTION_OPTIONS.forEach((opt) => {
      updated[opt.key] = select;
    });
    setSelectedKeys(updated);
  };

  const selectedCount = Object.values(selectedKeys).filter(Boolean).length;

  const handleConfirm = () => {
    if (!profile) return;
    const activeKeys = Object.entries(selectedKeys)
      .filter(([_, active]) => active)
      .map(([k]) => k as WeddingSectionKey);
    onApply(profile, activeKeys);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 font-sans text-stone-900">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-100 flex items-start justify-between shrink-0 bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                Áp Dụng Dữ Liệu Từ Hồ Sơ Tài Khoản
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Chọn các phần bạn muốn sao chép từ hồ sơ tài khoản vào thiệp này.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Control Bar */}
        <div className="px-6 py-2.5 bg-amber-50/60 border-b border-amber-100/80 flex items-center justify-between text-xs shrink-0">
          <span className="font-semibold text-amber-950">
            Đã chọn: <strong className="text-amber-800">{selectedCount}</strong> / {SECTION_OPTIONS.length} mục
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer"
            >
              Chọn tất cả
            </button>
            <span className="text-amber-300">|</span>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="text-stone-500 hover:text-stone-800 font-medium hover:underline cursor-pointer"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        {/* Body (Scrollable List of Sections) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              <span>Đang tải hồ sơ cưới của bạn...</span>
            </div>
          ) : !profile ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800">Chưa có thông tin hồ sơ cưới</h4>
                <p className="text-[11px] text-stone-500 mt-1 max-w-sm mx-auto">
                  Bạn chưa lưu hồ sơ cưới nào trong tài khoản. Hãy vào trang Hồ sơ cưới để điền 1 lần và dùng mãi mãi.
                </p>
              </div>
              <Link
                href="/dashboard/profile/wedding"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm transition"
              >
                <span>Đến Trang Hồ Sơ Cưới</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            SECTION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isChecked = !!selectedKeys[opt.key];
              const preview = opt.previewVal ? opt.previewVal(profile) : null;

              return (
                <div
                  key={opt.key}
                  onClick={() => toggleKey(opt.key)}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? "bg-amber-50/50 border-amber-300 shadow-2xs"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-amber-600">
                    {isChecked ? (
                      <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-stone-300 bg-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-stone-600 shrink-0" />
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                        {opt.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{opt.desc}</p>
                    {preview ? (
                      <div className="mt-1.5 px-2 py-1 rounded-lg bg-stone-100/80 text-[11px] font-mono text-stone-700 truncate">
                        ↳ Dữ liệu: {preview}
                      </div>
                    ) : (
                      <div className="mt-1 text-[10px] text-stone-400 italic">
                        (Mục này trong hồ sơ đang để trống)
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-3 shrink-0 bg-stone-50/60">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition text-center cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!profile || selectedCount === 0}
            className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-stone-950 text-xs font-extrabold shadow-sm transition text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Áp Dụng Vào Thiệp ({selectedCount} mục)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
