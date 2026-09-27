import React, { useState } from "react";
import { useEditor } from "../EditorContext";
import { Sparkles, Check, Trash2, Sliders, MailOpen } from "lucide-react";
import { EnvelopeConfigModal } from "../EnvelopeConfigModal";
import { EnvelopeConfig } from "@/types/card.types";

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
  const { draft, fields, updateFieldById, getFieldValue, isVip } = useEditor();
  const [isEnvelopeModalOpen, setIsEnvelopeModalOpen] = useState(false);

  const openingEffectField = fields.find((f) => f.id === "opening-effect");
  const currentEffect = openingEffectField ? (getFieldValue(openingEffectField) as string) || "NONE" : "NONE";

  const draftObj = (draft as Record<string, unknown>) || {};
  const cardId = (draftObj.id as string) || (draftObj._id as string) || undefined;
  const catData = ((draftObj.data || draftObj.categoryData) as Record<string, unknown>) || {};
  const groom = (catData.groom as Record<string, unknown>) || {};
  const bride = (catData.bride as Record<string, unknown>) || {};
  const groomName = (groom.fullName as string) || "";
  const brideName = (bride.fullName as string) || "";
  const currentEnvelopeConfig = (catData.envelopeConfig || draftObj.envelopeConfig) as EnvelopeConfig | undefined;

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
              className={`rounded-2xl border transition relative overflow-hidden ${
                isSelected
                  ? "bg-amber-50/70 border-amber-400 shadow-2xs ring-1 ring-amber-400"
                  : "bg-white border-stone-200 hover:bg-stone-50"
              } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div
                onClick={() => {
                  if (!isLocked) {
                    updateFieldById("opening-effect", item.id);
                    if (item.id === "WAX_SEAL") {
                      // Mở modal cấu hình phong bì khi click vào WAX_SEAL
                      setIsEnvelopeModalOpen(true);
                    }
                  }
                }}
                className="p-3 flex items-start gap-3 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.previewBg} shadow-inner flex items-center justify-center shrink-0 border border-white/20`}
                >
                  <Sparkles className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                      {item.vipOnly && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                          VIP
                        </span>
                      )}
                    </div>

                    {/* NÚT CẤU HÌNH NHANH CHO CON DẤU SÁP HOÀNG GIA - LUÔN HIỂN THỊ TẠI ĐÂY */}
                    {item.id === "WAX_SEAL" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateFieldById("opening-effect", "WAX_SEAL");
                          setIsEnvelopeModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 text-[10px] font-bold transition cursor-pointer shadow-2xs"
                        title="Tùy chỉnh kiểu dáng và nội dung phong bì"
                      >
                        <Sliders className="w-2.5 h-2.5 text-amber-700" />
                        <span>Cấu hình</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>

                  {/* THÔNG TIN MẪU PHONG BÌ ĐANG DÙNG */}
                  {item.id === "WAX_SEAL" && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 font-medium">
                      <MailOpen className="w-3 h-3 text-amber-600" />
                      <span>
                        Mẫu: <strong className="font-bold">{currentEnvelopeConfig?.styleName || "Kem cổ điển"}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 pt-0.5">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-stone-300" />
                  )}
                </div>
              </div>

              {/* KHUNG CẤU HÌNH MỞ RỘNG KHI ĐANG CHỌN WAX_SEAL */}
              {item.id === "WAX_SEAL" && isSelected && (
                <div className="px-3 pb-3 pt-2 border-t border-amber-200/70 bg-gradient-to-r from-amber-50/60 to-orange-50/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-900">
                    <span className="text-stone-600">Kiểu phong bì hiện tại:</span>
                    <span className="font-bold text-amber-950 px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200">
                      {currentEnvelopeConfig?.styleName || "Kem cổ điển"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEnvelopeModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Cấu hình phong bì mở đầu</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL CẤU HÌNH PHONG BÌ MỞ ĐẦU (BACKEND DATA DRIVEN) */}
      <EnvelopeConfigModal
        isOpen={isEnvelopeModalOpen}
        onClose={() => setIsEnvelopeModalOpen(false)}
        cardId={cardId}
        initialConfig={currentEnvelopeConfig}
        initialGroomName={groomName || "Mai Lan"}
        initialBrideName={brideName || "Tuấn Minh"}
        onSaveSuccess={(savedConfig) => {
          updateFieldById("opening-effect", "WAX_SEAL");
          // Đồng bộ vào draft data
          if (catData) {
            catData.envelopeConfig = savedConfig;
          }
          if (draftObj) {
            (draftObj as Record<string, unknown>).envelopeConfig = savedConfig;
          }
        }}
      />
    </div>
  );
}
