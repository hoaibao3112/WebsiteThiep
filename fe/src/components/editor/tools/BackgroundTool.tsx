"use client";

import React, { useState } from "react";
import { useEditor } from "../EditorContext";
import { Palette, Sparkles, Check } from "lucide-react";

const PRESET_COLORS = [
  "#BE944E", // Hoàng gia vàng
  "#8B1E2D", // Đỏ son truyền thống
  "#B76E79", // Hồng gold lãng mạn
  "#751624", // Rượu vang Crimson
  "#2D5A27", // Xanh rừng Botanical
  "#1A4850", // Xanh ngọc lục bảo
  "#4169A1", // Xanh sapphire cổ điển
  "#800020", // Burgundy
  "#D4AF37", // Vàng kim metallic
  "#E8CCA2", // Kem champagne
  "#F5EBE6", // Hồng phấn pastel
  "#2C3E50", // Midnight navy
  "#1F2937", // Than chì hiện đại
  "#9333EA", // Tím hoàng gia
  "#EA580C", // Cam đất terracotta
  "#0D9488", // Teal đại dương
];

const FALLING_EFFECTS = [
  { id: "NONE", label: "Không" },
  { id: "PETAL", label: "Hoa anh đào" },
  { id: "HEART", label: "Trái tim tình yêu" },
  { id: "SNOW", label: "Tuyết rơi" },
  { id: "CONFETTI", label: "Kim tuyến / Pháo giấy" },
  { id: "BALLOON", label: "Bóng bay" },
];

export function BackgroundTool() {
  const { fields, updateFieldById, getFieldValue, isVip } = useEditor();
  const [subTab, setSubTab] = useState<"color" | "image">("color");

  const primaryColorField = fields.find((f) => f.id === "primary-color");
  const fallingEffectField = fields.find((f) => f.id === "falling-effect");

  const currentColor = primaryColorField ? (getFieldValue(primaryColorField) as string) || "#BE944E" : "#BE944E";
  const currentEffect = fallingEffectField ? (getFieldValue(fallingEffectField) as string) || "NONE" : "NONE";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Nền & Màu Sắc
        </h3>
        <p className="text-[11px] text-stone-400">
          Tùy chỉnh màu sắc chủ đạo và hiệu ứng rơi trên thiệp.
        </p>
      </div>

      {/* SUB TABS: Màu sắc / Ảnh */}
      <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
        <button
          type="button"
          onClick={() => setSubTab("color")}
          className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
            subTab === "color" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Màu Sắc
        </button>
        <button
          type="button"
          onClick={() => setSubTab("image")}
          className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
            subTab === "image" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Ảnh Nền
        </button>
      </div>

      {subTab === "color" ? (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-2">
              Bảng Màu Đề Xuất
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((c) => {
                const isActive = currentColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateFieldById("primary-color", c)}
                    className="h-9 rounded-xl border border-black/10 shadow-2xs transition hover:scale-105 flex items-center justify-center cursor-pointer relative"
                    style={{ backgroundColor: c }}
                    title={c}
                  >
                    {isActive && <Check className="size-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
              Màu Tự Chọn (Hex Code)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => updateFieldById("primary-color", e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 p-0.5 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={currentColor}
                onChange={(e) => updateFieldById("primary-color", e.target.value)}
                className="flex-1 h-10 rounded-xl border border-stone-300 px-3 text-xs font-mono font-bold uppercase text-stone-800"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center space-y-2 bg-stone-50">
          <Palette className="size-6 text-stone-400 mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Hoa văn & Ảnh nền mẫu</p>
          <p className="text-[11px] text-stone-400">
            Họa tiết giấy hoa dập nổi và thủy ấn được tự động tối ưu theo từng mẫu thiệp độc bản.
          </p>
        </div>
      )}

      {/* HIỆU ỨNG RƠI NỀN */}
      <div className="pt-3 border-t border-stone-200/80 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-600" />
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
            Hiệu Ứng Rơi Tương Tác
          </label>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {FALLING_EFFECTS.map((item) => {
            const isSelected = currentEffect === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateFieldById("falling-effect", item.id)}
                className={`p-2 rounded-xl text-xs font-medium border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-amber-50 border-amber-400 font-bold text-amber-950 shadow-2xs"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="truncate">{item.label}</span>
                {isSelected && <Check className="size-3.5 text-amber-600 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
