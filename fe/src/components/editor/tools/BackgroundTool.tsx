"use client";

import React, { useState, useRef } from "react";
import { useEditor } from "../EditorContext";
import { Pipette, Check } from "lucide-react";

// Dải màu Pastel chuẩn theo ảnh chụp thực tế ngaychungdoi
const PASTEL_PALETTE = [
  { id: "white", color: "#FFFFFF", label: "Trắng tinh khôi" },
  { id: "blush", color: "#F9ECEC", label: "Hồng pastel" },
  { id: "ivory", color: "#FBF7EE", label: "Kem champagne" },
  { id: "mint", color: "#EDF5F0", label: "Xanh bạc hà" },
  { id: "lavender", color: "#F3EEF9", label: "Tím oải hương" },
  { id: "ice-blue", color: "#ECF2F8", label: "Xanh băng" },
  { id: "warm-sand", color: "#F5EFE6", label: "Cát ấm" },
  { id: "rose-tint", color: "#FCE7EC", label: "Hồng đào" },
];

const PATTERNS = [
  { id: "none", label: "Không" },
  { id: "flower-small", label: "Hoa nhỏ" },
  { id: "flower-large", label: "Hoa lớn" },
] as const;

const FALLING_EFFECTS = [
  { id: "none", label: "Không" },
  { id: "cherry-blossom", label: "Hoa anh đào" },
  { id: "snow", label: "Tuyết" },
  { id: "falling-leaves", label: "Lá rụng" },
  { id: "apricot", label: "Hoa mai" },
  { id: "hydrangea", label: "Hoa tú cầu" },
] as const;

export function BackgroundTool() {
  const {
    canvasBackgroundColor,
    setCanvasBackgroundColor,
    canvasBackgroundPattern,
    setCanvasBackgroundPattern,
    canvasFallingEffect,
    setCanvasFallingEffect,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<"color" | "image">("color");
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5 select-none text-stone-800">
      {/* 1. TABS: Màu sắc / Ảnh (Khớp thanh tab pill trong ảnh mẫu) */}
      <div className="grid grid-cols-2 p-1 bg-stone-100/90 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("color")}
          className={`py-2 rounded-lg transition cursor-pointer text-center ${
            activeTab === "color"
              ? "bg-white text-stone-900 shadow-2xs font-bold"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Màu sắc
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("image")}
          className={`py-2 rounded-lg transition cursor-pointer text-center ${
            activeTab === "image"
              ? "bg-white text-stone-900 shadow-2xs font-bold"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Ảnh
        </button>
      </div>

      {activeTab === "color" ? (
        <div className="space-y-5">
          {/* 2. CHỌN MÀU NỀN ĐỒNG NHẤT CHO TOÀN THIỆP */}
          <div className="space-y-2.5">
            <span className="text-xs text-stone-600 block">
              Chọn màu nền đồng nhất cho toàn thiệp
            </span>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {PASTEL_PALETTE.map((item) => {
                const isSelected =
                  canvasBackgroundColor.toLowerCase() === item.color.toLowerCase();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCanvasBackgroundColor(item.color)}
                    style={{ backgroundColor: item.color }}
                    className={`size-8 rounded-full border transition cursor-pointer relative shadow-2xs flex items-center justify-center hover:scale-105 ${
                      isSelected
                        ? "border-stone-900 ring-2 ring-stone-900 ring-offset-2"
                        : "border-stone-300"
                    }`}
                    title={item.label}
                  >
                    {isSelected && (
                      <span className="size-1.5 rounded-full bg-stone-900" />
                    )}
                  </button>
                );
              })}

              {/* Pipette Eye Dropper for custom color */}
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className="size-8 rounded-full border border-stone-300 bg-white hover:bg-stone-50 transition cursor-pointer flex items-center justify-center shadow-2xs text-stone-600 hover:text-stone-900 hover:scale-105"
                title="Chọn màu khác (Pipette)"
              >
                <Pipette className="size-3.5" />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={canvasBackgroundColor}
                  onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                  className="sr-only"
                />
              </button>
            </div>
          </div>

          {/* 3. HỌA TIẾT NỀN */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-700 block">
              Họa tiết nền
            </span>
            <div className="flex gap-2">
              {PATTERNS.map((p) => {
                const isActive = canvasBackgroundPattern === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCanvasBackgroundPattern(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      isActive
                        ? "border-stone-900 bg-white text-stone-900 font-bold shadow-2xs"
                        : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. HIỆU ỨNG NỀN */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-700 block">
              Hiệu ứng nền
            </span>
            <div className="grid grid-cols-3 gap-2">
              {FALLING_EFFECTS.map((eff) => {
                const isActive =
                  canvasFallingEffect === eff.id ||
                  (eff.id === "none" && (!canvasFallingEffect || canvasFallingEffect === "NONE"));

                return (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => setCanvasFallingEffect(eff.id)}
                    className={`py-2 px-1 rounded-lg text-[11px] text-center border transition cursor-pointer truncate ${
                      isActive
                        ? "border-stone-900 bg-white text-stone-900 font-bold shadow-2xs"
                        : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                    }`}
                    title={eff.label}
                  >
                    {eff.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* TAB ẢNH NỀN */
        <div className="space-y-3">
          <p className="text-xs text-stone-500">
            Tải lên hoặc chọn ảnh nền cho thiệp của bạn.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: "bg-paper-1",
                label: "Giấy mỹ thuật ngà",
                url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=80",
              },
              {
                id: "bg-paper-2",
                label: "Vân lụa ánh kim",
                url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80",
              },
            ].map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => setCanvasBackgroundColor(bg.url)}
                className="group rounded-xl border border-stone-200 overflow-hidden relative aspect-3/4 hover:border-stone-900 transition cursor-pointer"
              >
                <img
                  src={bg.url}
                  alt={bg.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute inset-x-0 bottom-0 bg-stone-900/70 text-white text-[10px] p-1 text-center font-medium truncate">
                  {bg.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
