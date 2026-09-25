"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, FilePlus2, LayoutTemplate, Check, ChevronRight, Palette, Eye } from "lucide-react";
import { MASTER_TEMPLATES } from "@/lib/templates-data";

interface CreateModeChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlank: () => void;
  onSelectPreset: (slug: string) => void;
  currentTemplateSlug?: string;
}

export function CreateModeChoiceModal({
  isOpen,
  onClose,
  onSelectBlank,
  onSelectPreset,
  currentTemplateSlug,
}: CreateModeChoiceModalProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "blank">("presets");

  if (!isOpen) return null;

  const weddingTemplates = MASTER_TEMPLATES.filter((t) => t.category === "WEDDING");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-white"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                  Visual Studio
                </span>
                <span className="text-xs text-stone-400">Chọn cách khởi tạo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Tạo Thiệp Mới Theo Ý Bạn
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher: Mẫu Có Sẵn vs Mẫu Trắng */}
          <div className="px-4 sm:px-6 pt-4 pb-2 bg-stone-950/60 border-b border-white/5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "presets"
                  ? "bg-gradient-to-r from-[#BE944E] to-[#9E7329] text-white shadow-lg shadow-amber-500/20 border border-amber-400/40"
                  : "bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              <LayoutTemplate className="w-4 h-4 text-amber-300" />
              <span>Chỉnh Sửa Từ 9 Mẫu Có Sẵn</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-bold">
                Hot
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("blank")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "blank"
                  ? "bg-gradient-to-r from-stone-700 to-stone-800 text-white shadow-lg border border-white/30"
                  : "bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              <FilePlus2 className="w-4 h-4 text-stone-300" />
              <span>Tạo Mẫu Trắng Tự Do</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeTab === "presets" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>9 Tuyệt Tác Thiệp Cưới cấu hình trực tiếp từ máy chủ</span>
                  <span className="text-amber-400 font-medium">Bấm vào mẫu để áp dụng ngay</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {weddingTemplates.map((template) => {
                    const isSelected = currentTemplateSlug === template.slug || currentTemplateSlug === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() => {
                          onSelectPreset(template.slug || template.id);
                          onClose();
                        }}
                        className={`relative rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex gap-3 group ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400"
                            : "bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-white/10"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-800 shrink-0 relative border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={template.imageUrl}
                            alt={template.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-500/40 flex items-center justify-center">
                              <Check className="w-6 h-6 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-medium truncate">
                                {template.style}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white font-serif mt-1 truncate group-hover:text-amber-300 transition">
                              {template.name}
                            </h4>
                            <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                              {template.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-amber-400 font-serif">
                              {template.price}
                            </span>
                            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                              <span>Chọn mẫu</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB BLANK CANVAS */
              <div className="py-6 px-4 text-center max-w-xl mx-auto space-y-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-stone-800 to-stone-900 border border-white/15 mx-auto flex items-center justify-center shadow-inner">
                  <FilePlus2 className="w-10 h-10 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-white">
                    Bắt Đầu Với Mẫu Trắng Sáng Tạo
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                    Hệ thống sẽ chuẩn bị cho bạn một không gian thiết kế trống tỷ lệ chuẩn di động (390px). Bạn toàn quyền thêm các khối Chữ nghệ thuật, Khung ảnh cưới, Lịch tháng, Đếm ngược ngày cưới, Bản đồ và Hộp mừng VietQR từ thanh công cụ bên trái.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-left pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-amber-400 text-xs font-bold">100% Tự Do</div>
                    <div className="text-[11px] text-stone-400 mt-1">Kéo thả phần tử tùy ý trên canvas</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-amber-400 text-xs font-bold">Chuẩn Mobile</div>
                    <div className="text-[11px] text-stone-400 mt-1">Tối ưu hoàn hảo cho màn hình điện thoại</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-amber-400 text-xs font-bold">Đầy Đủ Tiện Ích</div>
                    <div className="text-[11px] text-stone-400 mt-1">RSVP, Album, Đếm ngược, VietQR</div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBlank();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo Mẫu Trắng Ngay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
