"use client";

import React from "react";
import { Shapes, Minus, Square, Circle } from "lucide-react";

export function ShapeTool() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Hình Dạng & Khung Viền
        </h3>
        <p className="text-[11px] text-stone-400">
          Thêm các đường kẻ phân cách, khung ảnh hoa văn và hình khối trang trí.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition text-center cursor-pointer">
          <Minus className="size-6 mx-auto text-amber-700 mb-1" />
          <span className="text-xs font-semibold text-stone-700">Đường kẻ vàng</span>
        </div>
        <div className="p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition text-center cursor-pointer">
          <Square className="size-6 mx-auto text-amber-700 mb-1" />
          <span className="text-xs font-semibold text-stone-700">Khung viền vuông</span>
        </div>
        <div className="p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition text-center cursor-pointer">
          <Circle className="size-6 mx-auto text-amber-700 mb-1" />
          <span className="text-xs font-semibold text-stone-700">Khung tròn cổ điển</span>
        </div>
        <div className="p-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition text-center cursor-pointer">
          <Shapes className="size-6 mx-auto text-amber-700 mb-1" />
          <span className="text-xs font-semibold text-stone-700">Hoa văn góc</span>
        </div>
      </div>
    </div>
  );
}
