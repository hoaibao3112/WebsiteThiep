"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useEditor } from "../EditorContext";
import type { ShapeType } from "@/types/canvas.types";

export interface ShapeItemConfig {
  id: string;
  shapeType: ShapeType;
  title: string;
  category: "wedding" | "basic" | "lines";
  icon: React.ReactNode;
}

export const SHAPE_ITEMS: ShapeItemConfig[] = [
  // ── 1. ĐÁM CƯỚI & NGHỆ THUẬT ──
  {
    id: "arch",
    shapeType: "arch",
    title: "Cổng vòm Arch",
    category: "wedding",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="M 5 21 L 5 10 A 7 7 0 0 1 19 10 L 19 21" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "heart",
    shapeType: "heart",
    title: "Trái tim",
    category: "wedding",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M 12 7 C 12 4 9 2 6 2 C 3 2 1 4.5 1 7.5 C 1 13 8 18 12 22 C 16 18 23 13 23 7.5 C 23 4.5 21 2 18 2 C 15 2 12 4 12 7 Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    id: "star",
    shapeType: "star",
    title: "Ngôi sao lấp lánh",
    category: "wedding",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="M 12 2 Q 12 12 22 12 Q 12 12 12 22 Q 12 12 2 12 Q 12 12 12 2 Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "diamond",
    shapeType: "diamond",
    title: "Kim cương",
    category: "wedding",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "hexagon",
    shapeType: "hexagon",
    title: "Lục giác hoàng gia",
    category: "wedding",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <polygon points="6,3 18,3 23,12 18,21 6,21 1,12" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "ribbon",
    shapeType: "ribbon",
    title: "Dải ruy băng",
    category: "wedding",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="M 2 7 L 22 7 L 19 12 L 22 17 L 2 17 L 5 12 Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },

  // ── 2. ĐƯỜNG KẺ & PHÂN CÁCH ──
  {
    id: "flourish-line",
    shapeType: "flourish-line",
    title: "Hoa văn 2 đầu",
    category: "lines",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="M 2 12 C 5 7 7 17 10 12 M 14 12 C 17 17 19 7 22 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "wavy-line",
    shapeType: "wavy-line",
    title: "Đường kẻ lượn sóng",
    category: "lines",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="M 2 12 Q 5 6 8 12 T 14 12 T 20 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "dashed-line",
    shapeType: "dashed-line",
    title: "Đường đứt đoạn",
    category: "lines",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "line",
    shapeType: "line",
    title: "Đường kẻ thẳng",
    category: "lines",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  // ── 3. KHỐI CƠ BẢN ──
  {
    id: "square",
    shapeType: "square",
    title: "Hình vuông",
    category: "basic",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "rect",
    shapeType: "rect",
    title: "Hình chữ nhật",
    category: "basic",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <rect x="2" y="6" width="20" height="12" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "circle",
    shapeType: "circle",
    title: "Hình tròn",
    category: "basic",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "oval",
    shapeType: "oval",
    title: "Hình bầu dục",
    category: "basic",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "triangle",
    shapeType: "triangle",
    title: "Tam giác",
    category: "basic",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <polygon points="12,3 21,21 3,21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function ShapeTool() {
  const { addShapeElement } = useEditor();
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "wedding" | "lines" | "basic">("all");

  const handleAdd = (item: ShapeItemConfig) => {
    addShapeElement({ shapeType: item.shapeType, title: item.title });
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  const filteredItems = SHAPE_ITEMS.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Hình Dạng & Khung Viền
        </h3>
        <p className="text-[11px] text-stone-400">
          Chạm hoặc kéo thả hình khối, cổng vòm, đường phân cách vào thiệp.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "Tất cả" },
          { id: "wedding", label: "Cưới & Nghệ thuật" },
          { id: "lines", label: "Đường kẻ" },
          { id: "basic", label: "Cơ bản" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-2.5 py-1 rounded-full shrink-0 text-[11px] font-medium transition cursor-pointer ${
              selectedCategory === tab.id
                ? "bg-stone-900 text-white shadow-2xs font-semibold"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredItems.map((item) => {
          const isJustAdded = recentlyAddedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              draggable={true}
              onDragStart={(e) => {
                const payload = {
                  type: "shape",
                  shapeType: item.shapeType,
                  title: item.title,
                };
                if (typeof window !== "undefined") {
                  (window as any).__DRAGGED_STOCK_ITEM__ = payload;
                }
                try {
                  e.dataTransfer.setData("text/plain", JSON.stringify(payload));
                  e.dataTransfer.setData("application/json", JSON.stringify(payload));
                } catch {}
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => handleAdd(item)}
              className={`p-3 rounded-xl border transition cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-2 active:scale-98 shadow-2xs text-center group ${
                isJustAdded
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                  : "border-stone-200 bg-white hover:bg-stone-50 hover:border-amber-400"
              }`}
            >
              <div className="text-stone-700 group-hover:text-amber-700 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-[11px] font-medium text-stone-800 line-clamp-1">
                {item.title}
              </span>
              <span
                className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                  isJustAdded ? "text-emerald-700 font-bold" : "text-stone-400 group-hover:text-stone-600"
                }`}
              >
                {isJustAdded ? (
                  <>
                    <Check className="size-3" /> Đã thêm
                  </>
                ) : (
                  "+ Thêm"
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
