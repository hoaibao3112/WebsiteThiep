"use client";

import React, { useMemo } from "react";
import { useEditor } from "../EditorContext";
import { Type, ChevronRight, Plus, Heading1, Heading2, AlignLeft } from "lucide-react";
import { EditorField } from "@/lib/editor/template-registry";

export function TextTool() {
  const { fields, selectedField, selectField, getFieldValue, addTextElement } = useEditor();

  const textFields = useMemo(() => {
    return fields.filter((f) => f.type === "text");
  }, [fields]);

  // Group text fields
  const grouped = useMemo(() => {
    const groups: Record<string, EditorField[]> = {};
    for (const f of textFields) {
      const g = f.group || "Khác";
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    }
    return groups;
  }, [textFields]);

  return (
    <div className="space-y-5">
      {/* ── ADD NEW FREE TEXT BUTTON & PRESETS ── */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => addTextElement({ text: "Văn bản mới", fontSize: 28 })}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#BE944E] to-[#966E29] hover:opacity-95 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Văn Bản Mới</span>
        </button>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => addTextElement({ text: "TIÊU ĐỀ LỚN", fontSize: 36, isBold: true })}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition flex flex-col items-center gap-1 text-center"
          >
            <Heading1 className="w-4 h-4 text-stone-700" />
            <span className="text-[10px] font-bold text-stone-700">Tiêu đề lớn</span>
          </button>

          <button
            type="button"
            onClick={() => addTextElement({ text: "Tiêu Đề Phụ", fontSize: 24, isBold: false })}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition flex flex-col items-center gap-1 text-center"
          >
            <Heading2 className="w-4 h-4 text-stone-700" />
            <span className="text-[10px] font-bold text-stone-700">Tiêu đề phụ</span>
          </button>

          <button
            type="button"
            onClick={() => addTextElement({ text: "Nội dung văn bản thiệp...", fontSize: 16, isBold: false })}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition flex flex-col items-center gap-1 text-center"
          >
            <AlignLeft className="w-4 h-4 text-stone-700" />
            <span className="text-[10px] font-bold text-stone-700">Đoạn văn</span>
          </button>
        </div>
      </div>

      {/* ── NGHỆ THUẬT CHỮ CƯỚI (TYPOGRAPHY PRESETS) ── */}
      <div className="space-y-2 border-t border-stone-200 pt-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Chữ nghệ thuật phối sẵn
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { text: "Save The Date", font: "Playfair Display", size: 26, isBold: true, color: "#BE944E" },
            { text: "Thư Mời Tiệc Cưới", font: "Great Vibes", size: 32, isBold: false, color: "#8B1E2D" },
            { text: "Lễ Thành Hôn", font: "Cinzel", size: 24, isBold: true, color: "#6B1724" },
            { text: "Trân Trọng Kính Mời", font: "Playfair Display", size: 20, isBold: false, color: "#333333" },
            { text: "Forever & Always", font: "Alex Brush", size: 30, isBold: false, color: "#B84A39" },
            { text: "Trăm Năm Hạnh Phúc", font: "Great Vibes", size: 28, isBold: false, color: "#8B1E2D" },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                addTextElement({
                  text: item.text,
                  fontSize: item.size,
                  isBold: item.isBold,
                })
              }
              className="p-2.5 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 text-center transition flex flex-col items-center justify-center cursor-pointer shadow-2xs group"
            >
              <span
                style={{ fontFamily: item.font, color: item.color }}
                className="text-sm truncate max-w-full group-hover:scale-105 transition-transform"
              >
                {item.text}
              </span>
              <span className="text-[8px] text-stone-400 mt-0.5 font-mono">{item.font}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-200 pt-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Văn Bản Có Sẵn Theo Mẫu
        </h3>
        <p className="text-[11px] text-stone-400 mb-3">
          Chạm vào mục dưới hoặc trực tiếp trên thiệp để sửa nội dung và kiểu chữ.
        </p>

        <div className="space-y-4">
          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block px-1">
                {groupName}
              </span>
              <div className="space-y-1">
                {items.map((field) => {
                  const val = getFieldValue(field);
                  const isSelected = selectedField?.id === field.id;
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => selectField(field)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-amber-50 border-amber-400 shadow-2xs text-stone-900"
                          : "bg-white border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Type className="size-3 text-stone-400 shrink-0" />
                          <span className="text-xs font-semibold truncate">{field.label}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5 font-sans">
                          {String(val || "Chưa nhập")}
                        </p>
                      </div>
                      <ChevronRight className="size-3 text-stone-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
