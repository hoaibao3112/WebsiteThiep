"use client";

import React from "react";
import { useEditor } from "../EditorContext";
import { Check, Sparkles } from "lucide-react";

const TEMPLATES = [
  { slug: "wedding-heritage-crimson-gold", name: "Thiệp 01 — Heritage Sơn Mài", color: "#8B1E2D", tag: "Cung Đình" },
  { slug: "wedding-modern-editorial-magazine", name: "Thiệp 02 — Modern Magazine", color: "#2B2A27", tag: "Tạp Chí" },
  { slug: "wedding-sweet-editorial-romance", name: "Thiệp 03 — Sweet Romance", color: "#B76E79", tag: "Lãng Mạn" },
  { slug: "wedding-crimson-wine-marsala", name: "Thiệp 04 — Crimson Marsala", color: "#751624", tag: "Rượu Vang" },
  { slug: "wedding-forest-green-botanical", name: "Thiệp 05 — Forest Botanical", color: "#2D5A27", tag: "Rừng Xanh" },
  { slug: "wedding-pure-lotus-heritage", name: "Thiệp 06 — Pure Lotus", color: "#1A4850", tag: "Hoa Sen" },
  { slug: "wedding-cinematic-editorial", name: "Thiệp 07 — Cinematic Movie", color: "#1F2937", tag: "Điện Ảnh" },
  { slug: "wedding-alpine-lake-romance", name: "Thiệp 08 — Alpine Lake", color: "#4169A1", tag: "Hồ Núi" },
  { slug: "wedding-imperial-dragon-crimson", name: "Thiệp 09 — Imperial Dragon", color: "#60101C", tag: "Long Phụng" },
];

export function ColorTool() {
  const { templateSlug, draft, updateFieldById } = useEditor();

  const handleSelectTemplate = (slug: string) => {
    // In our app, template slug is updated on draft / state
    updateFieldById("templateSlug", slug);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Chọn Mẫu Thiết Kế
        </h3>
        <p className="text-[11px] text-stone-400">
          Chuyển đổi giao diện mẫu thiệp mà vẫn giữ nguyên thông tin bạn đã nhập.
        </p>
      </div>

      <div className="space-y-2.5">
        {TEMPLATES.map((tmpl) => {
          const isSelected = templateSlug === tmpl.slug;

          return (
            <div
              key={tmpl.slug}
              onClick={() => handleSelectTemplate(tmpl.slug)}
              className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? "bg-amber-50/70 border-amber-400 shadow-2xs ring-1 ring-amber-400"
                  : "bg-white border-stone-200 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl shadow-xs border border-white/20 flex items-center justify-center text-white shrink-0 font-serif font-bold text-xs"
                  style={{ backgroundColor: tmpl.color }}
                >
                  {tmpl.name.slice(6, 8)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{tmpl.name}</h4>
                  </div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                    {tmpl.tag}
                  </span>
                </div>
              </div>

              {isSelected ? (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Check className="size-3 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-stone-300 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
