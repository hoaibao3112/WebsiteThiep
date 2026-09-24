"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useEditor } from "../EditorContext";

export const SHAPE_ITEMS = [
  {
    id: "line",
    shapeType: "line" as const,
    title: "Đường kẻ",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "square",
    shapeType: "square" as const,
    title: "Hình vuông",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "rect",
    shapeType: "rect" as const,
    title: "Hình chữ nhật",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <rect x="2" y="6" width="20" height="12" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "circle",
    shapeType: "circle" as const,
    title: "Hình tròn",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "triangle",
    shapeType: "triangle" as const,
    title: "Tam giác",
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

  const handleAdd = (item: (typeof SHAPE_ITEMS)[number]) => {
    addShapeElement({ shapeType: item.shapeType, title: item.title });
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Hình Dạng & Khung Viền
        </h3>
        <p className="text-[11px] text-stone-400">
          Chạm hoặc kéo thả các hình khối và đường kẻ vào thiệp.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {SHAPE_ITEMS.map((item) => {
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
              className={`px-3 py-2.5 rounded-xl border transition cursor-grab active:cursor-grabbing flex items-center justify-between active:scale-98 shadow-2xs ${
                isJustAdded
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                  : "border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-stone-800">{item.icon}</div>
                <span className="text-xs font-medium text-stone-800">{item.title}</span>
              </div>
              <span
                className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                  isJustAdded ? "text-emerald-700 font-bold" : "text-stone-400"
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
