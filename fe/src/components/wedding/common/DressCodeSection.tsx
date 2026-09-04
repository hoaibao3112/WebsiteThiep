"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Info } from "lucide-react";

export interface ColorSwatch {
  name: string;
  hex: string;
  textColor?: string;
}

interface DressCodeSectionProps {
  swatches?: ColorSwatch[];
  dressCodeTitle?: string;
  note?: string;
  accentColor?: string;
}

const DEFAULT_SWATCHES: ColorSwatch[] = [
  { name: "Beige Cát", hex: "#E8D8C8" },
  { name: "Trắng Kem", hex: "#FAF6EE" },
  { name: "Hồng Khói", hex: "#D9A5A9" },
  { name: "Nâu Đất", hex: "#6E473B", textColor: "#FFF" },
  { name: "Đỏ Rượu", hex: "#7E1925", textColor: "#FFF" },
];

export const DressCodeSection: React.FC<DressCodeSectionProps> = ({
  swatches = DEFAULT_SWATCHES,
  dressCodeTitle = "Semi-Formal & Sang Trọng",
  note = "Để khung hình kỷ niệm thêm phần đồng điệu và ấm cúng, quý khách có thể ưu tiên trang phục theo bảng màu này nhé!",
  accentColor = "#B84A39",
}) => {
  return (
    <div className="py-6 px-4 space-y-4 text-center">
      <div className="space-y-1">
        <span
          className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold block"
          style={{ color: accentColor }}
        >
          DRESS CODE
        </span>
        <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-stone-900">
          Trang Phục Gợi Ý
        </h3>
        <p className="text-xs text-stone-500 italic max-w-xs mx-auto">
          {dressCodeTitle}
        </p>
      </div>

      {/* Bảng màu trang phục hình tròn */}
      <div className="max-w-xs mx-auto p-4 rounded-3xl bg-white/80 border border-stone-200/80 shadow-xs backdrop-blur-xs space-y-3">
        <div className="flex items-center justify-center gap-3">
          {swatches.map((color, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.15, y: -3 }}
              className="text-center group cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-full shadow-sm border-2 border-white ring-1 ring-stone-200 mx-auto transition flex items-center justify-center text-[9px] font-bold"
                style={{
                  backgroundColor: color.hex,
                  color: color.textColor || "#4A2E24",
                }}
              >
                <span className="opacity-0 group-hover:opacity-100 transition text-[8px]">
                  ✓
                </span>
              </div>
              <span className="text-[10px] text-stone-600 block mt-1 font-serif">
                {color.name}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-start gap-2 text-left">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-stone-500 italic leading-relaxed">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
};
