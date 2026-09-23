"use client";

import React, { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { useEditor } from "../EditorContext";

const STOCK_ITEMS = [
  { id: "s1", title: "Chữ Hỷ Song Hỷ Đỏ", cat: "wedding", icon: "囍" },
  { id: "s2", title: "Cặp Nhẫn Cưới Vàng Kim", cat: "wedding", icon: "💍" },
  { id: "s3", title: "Bó Hoa Cưới Cầm Tay", cat: "wedding", icon: "💐" },
  { id: "s4", title: "Trái Tim Pha Lê", cat: "wedding", icon: "💖" },
  { id: "s5", title: "Chú Rể Chibi Áo Dài", cat: "chibi", icon: "🤵" },
  { id: "s6", title: "Cô Dâu Chibi Đội Khăn Đóng", cat: "chibi", icon: "👰" },
  { id: "s7", title: "Ly Rượu Mừng", cat: "wedding", icon: "🥂" },
  { id: "s8", title: "Bồ Câu Hòa Bình", cat: "wedding", icon: "🕊️" },
];

export function StockTool() {
  const [filter, setFilter] = useState<"all" | "wedding" | "chibi">("all");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const { addStickerElement } = useEditor();

  const filtered = STOCK_ITEMS.filter((item) => filter === "all" || item.cat === filter);

  const handleAdd = (item: { icon: string; title: string; id: string }) => {
    addStickerElement({ icon: item.icon, title: item.title });
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Kho Ảnh Minh Họa Cưới (Stock)
        </h3>
        <p className="text-[11px] text-stone-400">
          Chèn thêm họa tiết truyền thống, chữ Hỷ hoặc chibi vui nhộn vào thiệp.
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
        {[
          { id: "all", label: "Tất cả" },
          { id: "wedding", label: "Yếu tố cưới" },
          { id: "chibi", label: "Chibi" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id as any)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === c.id ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((item) => {
          const isJustAdded = recentlyAddedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({
                    type: "sticker",
                    icon: item.icon,
                    title: item.title,
                  })
                );
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => handleAdd(item)}
              className={`p-3 rounded-xl border text-center transition cursor-grab active:cursor-grabbing group shadow-2xs relative flex flex-col items-center justify-center active:scale-95 ${
                isJustAdded
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                  : "border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300"
              }`}
            >
              <div className="text-3xl mb-1 group-hover:scale-110 transition drop-shadow-sm">{item.icon}</div>
              <p className="text-[11px] font-bold text-stone-700 leading-tight">{item.title}</p>
              <span
                className={`text-[9px] mt-1 font-semibold flex items-center gap-0.5 ${
                  isJustAdded ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {isJustAdded ? (
                  <>
                    <Check className="size-2.5" /> Đã thêm vào thiệp
                  </>
                ) : (
                  "+ Chạm để thêm"
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
