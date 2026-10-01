"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Film, Image as ImageIcon, Waves, Heart, Smartphone, Check } from "lucide-react";
import type { CardElementAnimationsConfig } from "@/types/card.types";

interface ElementAnimationsStudioProps {
  value: CardElementAnimationsConfig;
  onChange: (val: CardElementAnimationsConfig) => void;
  primaryColor?: string;
}

export function ElementAnimationsStudio({
  value,
  onChange,
  primaryColor = "#BE944E",
}: ElementAnimationsStudioProps) {
  const current: CardElementAnimationsConfig = {
    headerTitleMotion: value?.headerTitleMotion || "shimmer",
    photoMotion: value?.photoMotion || "living-kenburns",
    scrollRevealStyle: value?.scrollRevealStyle || "staggered-fade-up",
    quoteBoxStyle: value?.quoteBoxStyle || "floating-glow",
    reduceMotionOnMobile: value?.reduceMotionOnMobile ?? true,
  };

  const update = (patch: Partial<CardElementAnimationsConfig>) => {
    onChange({ ...current, ...patch });
  };

  const TITLE_OPTIONS = [
    {
      id: "shimmer",
      label: "Ánh Kim Quét Ngang",
      sub: "Vệt sáng hoàng gia lướt qua tên lấp lánh",
      badge: "VIP Khuyên Dùng",
      previewClass: "animate-shimmer-text font-serif italic text-amber-700 font-bold",
      sample: "Quân & Hà",
    },
    {
      id: "kinetic",
      label: "Hiện Từng Ký Tự",
      sub: "Từng từ ngữ nổi lên nhịp nhàng cảm xúc",
      badge: "Lãng Mạn",
      previewClass: "font-serif italic text-stone-800 font-bold",
      sample: "Minh Quân & Thu Hà",
    },
    {
      id: "fade-up",
      label: "Bay Lên Mềm Mại",
      sub: "Trồi lên từ dưới thanh lịch, trang nhã",
      badge: "Thanh Lịch",
      previewClass: "font-serif text-stone-700 font-semibold",
      sample: "Wedding Invitation",
    },
    {
      id: "zoom-gentle",
      label: "Phóng To Nhẹ Nhàng",
      sub: "Nở từ giữa tạo điểm nhấn thu hút",
      badge: "Ấn Tượng",
      previewClass: "font-serif text-amber-900 font-bold",
      sample: "Save The Date",
    },
    {
      id: "none",
      label: "Tĩnh (Cổ Điển)",
      sub: "Không hoạt ảnh, hiển thị trang nghiêm",
      badge: "Tối Giản",
      previewClass: "font-serif text-stone-600",
      sample: "Thiệp Báo Hỷ",
    },
  ] as const;

  const PHOTO_OPTIONS = [
    {
      id: "living-kenburns",
      label: "Ảnh Sống Điện Ảnh (Ken Burns)",
      sub: "Ảnh tự zoom chậm rãi êm ái như thước phim điện ảnh",
      badge: "VIP Đỉnh Cao",
      icon: "🎬",
    },
    {
      id: "float-gentle",
      label: "Bồng Bềnh Tự Nhiên (Photo Float)",
      sub: "Khẽ trôi bập bềnh nhấp nhô nhẹ nhàng trong gió",
      badge: "Bay Bổng",
      icon: "🎈",
    },
    {
      id: "gleam-shine",
      label: "Vệt Sáng Pha Lê (Gleam Ray)",
      sub: "Ánh sáng quét qua bề mặt ảnh như mặt kính gương",
      badge: "Sang Trọng",
      icon: "✨",
    },
    {
      id: "zoom-hover",
      label: "Phóng To Khi Chạm / Rê Chuột",
      sub: "Nổi khối 3D sống động khi khách mời chạm vào",
      badge: "Tương Tác",
      icon: "🔍",
    },
    {
      id: "static",
      label: "Ảnh Cố Định",
      sub: "Không chuyển động",
      badge: "Cổ Điển",
      icon: "🖼️",
    },
  ] as const;

  const SCROLL_OPTIONS = [
    {
      id: "staggered-fade-up",
      label: "Gợn Sóng Nối Tiếp (Staggered)",
      sub: "Các khối thông tin, lịch trình lần lượt trồi lên theo nhịp",
      badge: "Khuyên Dùng",
    },
    {
      id: "smooth-unfurl",
      label: "Mở Cuộn Thư Hoàng Gia (Unfurl)",
      sub: "Khung thông tin mở bung mượt mà từ giữa",
      badge: "Quý Tộc",
    },
    {
      id: "scale-reveal",
      label: "Nở Rộ Mềm Mại (Scale Up)",
      sub: "Khối xuất hiện phóng to nhẹ nhàng từ tâm",
      badge: "Hiện Đại",
    },
    {
      id: "none",
      label: "Hiển Thị Bình Thường",
      sub: "Hiện trực tiếp không hiệu ứng",
      badge: "Tối Giản",
    },
  ] as const;

  const QUOTE_OPTIONS = [
    {
      id: "floating-glow",
      label: "Danh Ngôn Nhịp Thở (Glowing Quote)",
      sub: "Dấu ngoặc kép lơ lửng, viền nhịp thở nhẹ lãng mạn",
    },
    {
      id: "scroll-unfurl",
      label: "Cuộn Thư Hoàng Gia Á Đông",
      sub: "Hai đầu trục dát vàng, cuộn thư mở ra trang trọng",
    },
    {
      id: "classic-fade",
      label: "Khung Cổ Điển Nhẹ Nhàng",
      sub: "Thiết kế viền chỉ vàng tinh tế",
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/40 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B68837] to-[#E2BC6A] text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 animate-spin [animation-duration:8s]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Studio Hoạt Ảnh Thành Phần (Elements Motion)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#BE944E]/15 text-[#BE944E] uppercase">
                VIP Studio
              </span>
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Tùy biến chuyển động mượt mà cho <strong>Tên Cặp Đôi</strong>, <strong>Ảnh Cưới</strong> và{" "}
              <strong>Các Khối Thông Tin</strong> khi khách mời mở thiệp.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: HOẠT ẢNH TÊN & TIÊU ĐỀ ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#BE944E]" />
            <span>1. Hoạt Ảnh Tên Cặp Đôi & Tiêu Đề</span>
          </label>
          <span className="text-[11px] text-stone-400">Chọn 1 kiểu chuyển động</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TITLE_OPTIONS.map((opt) => {
            const isSelected = current.headerTitleMotion === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ headerTitleMotion: opt.id })}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? "border-2 border-[#BE944E] bg-amber-50/50 shadow-sm ring-2 ring-[#BE944E]/20"
                    : "border-stone-200 hover:border-amber-300 bg-white hover:bg-stone-50/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">{opt.label}</span>
                    <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">{opt.sub}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                      isSelected ? "bg-[#BE944E] text-white" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>

                {/* Mini Preview Box */}
                <div className="mt-2 py-2 px-3 rounded-xl bg-stone-100/80 border border-stone-200/60 flex items-center justify-between">
                  <span className={`text-xs truncate ${opt.previewClass}`}>{opt.sample}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#BE944E] shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: CHUYỂN ĐỘNG ẢNH CƯỚI ── */}
      <div className="space-y-3 pt-2 border-t border-stone-200/70">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#BE944E]" />
            <span>2. Chuyển Động Ảnh Cưới (Living Photo Studio)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PHOTO_OPTIONS.map((opt) => {
            const isSelected = current.photoMotion === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ photoMotion: opt.id })}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden flex items-start gap-3 ${
                  isSelected
                    ? "border-2 border-[#BE944E] bg-amber-50/50 shadow-sm ring-2 ring-[#BE944E]/20"
                    : "border-stone-200 hover:border-amber-300 bg-white hover:bg-stone-50/60"
                }`}
              >
                <div className="text-2xl shrink-0 p-1.5 rounded-xl bg-stone-100">{opt.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-800">{opt.label}</span>
                    <span
                      className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                        isSelected ? "bg-[#BE944E] text-white" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{opt.sub}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#BE944E] shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: HOẠT ẢNH CUỘN TRANG (SCROLL REVEAL) ── */}
      <div className="space-y-3 pt-2 border-t border-stone-200/70">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-[#BE944E]" />
            <span>3. Hiệu Ứng Xuất Hiện Khi Khách Cuộn Trang (Scroll In-View)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SCROLL_OPTIONS.map((opt) => {
            const isSelected = current.scrollRevealStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ scrollRevealStyle: opt.id })}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "border-2 border-[#BE944E] bg-amber-50/50 shadow-sm ring-2 ring-[#BE944E]/20"
                    : "border-stone-200 hover:border-amber-300 bg-white hover:bg-stone-50/60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800">{opt.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isSelected ? "bg-[#BE944E] text-white" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">{opt.sub}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#BE944E] shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 4: KHUNG LỜI NGỎ & DANH NGÔN ── */}
      <div className="space-y-3 pt-2 border-t border-stone-200/70">
        <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[#BE944E]" />
          <span>4. Khung Lời Ngỏ & Thông Điệp Tình Yêu</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {QUOTE_OPTIONS.map((opt) => {
            const isSelected = current.quoteBoxStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ quoteBoxStyle: opt.id })}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-2 border-[#BE944E] bg-amber-50/50 shadow-sm ring-2 ring-[#BE944E]/20"
                    : "border-stone-200 hover:border-amber-300 bg-white hover:bg-stone-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#BE944E]" />}
                </div>
                <p className="text-[10px] text-stone-500 leading-tight">{opt.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 5: TỐI ƯU DI ĐỘNG (MOBILE PERFORMANCE) ── */}
      <div className="pt-2 border-t border-stone-200/70">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-200/70 flex items-center justify-center text-stone-700">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block">Tự Động Tối Ưu Cho Điện Thoại Yếu</span>
              <span className="text-[11px] text-stone-500 block">
                Tự động giảm bớt chuyển động nặng trên máy cấu hình thấp để đảm bảo mượt mà 60fps & tiết kiệm pin
              </span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={current.reduceMotionOnMobile}
            onClick={() => update({ reduceMotionOnMobile: !current.reduceMotionOnMobile })}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              current.reduceMotionOnMobile ? "bg-[#BE944E]" : "bg-stone-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                current.reduceMotionOnMobile ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
