"use client";

import React from "react";
import { useEditor } from "../EditorContext";
import { Sparkles, Check, Trash2, ShieldAlert } from "lucide-react";

const OPENING_EFFECTS = [
  {
    id: "NONE",
    title: "Không hiệu ứng",
    description: "Vào thẳng nội dung thiệp ngay lập tức",
    previewBg: "from-stone-100 to-stone-200",
    vipOnly: false,
  },
  {
    id: "WAX_SEAL",
    title: "Con dấu sáp hoàng gia",
    description: "Chạm phong bì cổ điển để đóng/mở thiệp",
    previewBg: "from-red-900 to-amber-900 text-amber-200",
    vipOnly: false,
  },
  {
    id: "GATE_OPEN",
    title: "Cổng hoa mở 2 cánh",
    description: "Cửa dinh thự / cổng hoa bung mở sang hai bên",
    previewBg: "from-amber-700 to-amber-950 text-amber-100",
    vipOnly: true,
  },
  {
    id: "GIFT_BOX",
    title: "Hộp quà tình yêu",
    description: "Hộp quà 3D mở nắp kèm pháo hoa rực rỡ",
    previewBg: "from-rose-600 to-pink-900 text-white",
    vipOnly: true,
  },
];

export function EffectTool() {
  const { fields, updateFieldById, getFieldValue, isVip } = useEditor();

  const openingEffectField = fields.find((f) => f.id === "opening-effect");
  const currentEffect = openingEffectField ? (getFieldValue(openingEffectField) as string) || "NONE" : "NONE";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-0.5">
            Hiệu Ứng Mở Màn
          </h3>
          <p className="text-[11px] text-stone-400">
            Tạo ấn tượng đầu tiên đặc biệt khi khách truy cập thiệp.
          </p>
        </div>

        {currentEffect !== "NONE" && (
          <button
            type="button"
            onClick={() => updateFieldById("opening-effect", "NONE")}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-200 cursor-pointer"
          >
            <Trash2 className="size-3" />
            <span>Xóa hiệu ứng</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {OPENING_EFFECTS.map((item) => {
          const isSelected = currentEffect === item.id;
          const isLocked = item.vipOnly && !isVip;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isLocked) {
                  updateFieldById("opening-effect", item.id);
                }
              }}
              className={`p-3 rounded-2xl border transition relative flex items-start gap-3 cursor-pointer ${
                isSelected
                  ? "bg-amber-50/70 border-amber-400 shadow-2xs ring-1 ring-amber-400"
                  : "bg-white border-stone-200 hover:bg-stone-50"
              } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.previewBg} shadow-inner flex items-center justify-center shrink-0 border border-white/20`}
              >
                <Sparkles className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                  {item.vipOnly && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="shrink-0 pt-0.5">
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-stone-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
