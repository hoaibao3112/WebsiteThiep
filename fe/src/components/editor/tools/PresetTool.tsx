"use client";

import React, { useState } from "react";
import { Sparkles, Check, Plus } from "lucide-react";
import { useEditor } from "../EditorContext";

const PRESETS = [
  { id: "p1", title: "Khung Ảnh Cổng Vòm", cat: "photo", desc: "Ảnh chân dung vòm cong hoàng gia Á Đông" },
  { id: "p2", title: "Khung Ảnh Polaroids 3 Tấm", cat: "photo", desc: "Hiệu ứng ảnh dán sổ tay lãng mạn" },
  { id: "p3", title: "Khối Lịch Trình Tiệc Đầy Đủ", cat: "info", desc: "Lễ đón khách, làm lễ, khai tiệc, chụp hình" },
  { id: "p4", title: "Thẻ Song Thân 2 Cột Cân Đối", cat: "info", desc: "Thông tin nhà trai và nhà gái trang trọng" },
  { id: "p5", title: "Khối Lời Ngỏ Cổ Điển", cat: "invite", desc: "Trích dẫn câu đối và lời nhắn gửi song ngữ" },
];

export function PresetTool() {
  const [tab, setTab] = useState<"all" | "photo" | "info" | "invite">("all");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const { addPresetElement } = useEditor();

  const filtered = PRESETS.filter((p) => tab === "all" || p.cat === tab);

  const handleAdd = (item: (typeof PRESETS)[number]) => {
    addPresetElement({ id: item.id, title: item.title, cat: item.cat });
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Thiết Kế Sẵn (Presets)
        </h3>
        <p className="text-[11px] text-stone-400">
          Các khối thành phần dựng sẵn giúp bố cục thiệp thêm phần sinh động.
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto">
        {[
          { id: "all", label: "Tất cả" },
          { id: "photo", label: "Ảnh" },
          { id: "info", label: "Thông tin" },
          { id: "invite", label: "Lời mời" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTab(c.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              tab === c.id ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item) => {
          const isJustAdded = recentlyAddedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              draggable={true}
              onDragStart={(e) => {
                const payload = {
                  type: "preset",
                  id: item.id,
                  title: item.title,
                  cat: item.cat,
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
              className={`w-full text-left p-3 rounded-xl border transition cursor-grab active:cursor-grabbing space-y-1 shadow-2xs active:scale-[0.99] relative ${
                isJustAdded
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                  : "border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-600" />
                  <h4 className="text-xs font-bold text-stone-800">{item.title}</h4>
                </div>
                <span
                  className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                    isJustAdded ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="size-3" /> Đã thêm
                    </>
                  ) : (
                    <>
                      <Plus className="size-3" /> Chèn khối
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-1">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
