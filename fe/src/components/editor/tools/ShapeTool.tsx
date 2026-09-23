"use client";

import React, { useState } from "react";
import { Shapes, Minus, Square, Circle, Check } from "lucide-react";
import { useEditor } from "../EditorContext";

const SHAPES = [
  { id: "line", title: "Đường kẻ vàng", shapeType: "line" as const, icon: Minus },
  { id: "rect", title: "Khung viền vuông", shapeType: "rect" as const, icon: Square },
  { id: "circle", title: "Khung tròn cổ điển", shapeType: "circle" as const, icon: Circle },
  { id: "corner", title: "Hoa văn góc", shapeType: "corner" as const, icon: Shapes },
];

export function ShapeTool() {
  const { addShapeElement } = useEditor();
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const handleAdd = (item: (typeof SHAPES)[number]) => {
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
          Thêm các đường kẻ phân cách, khung ảnh hoa văn và hình khối trang trí.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SHAPES.map((item) => {
          const Icon = item.icon;
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
                    type: "shape",
                    shapeType: item.shapeType,
                    title: item.title,
                  })
                );
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => handleAdd(item)}
              className={`p-3 rounded-xl border text-center transition cursor-grab active:cursor-grabbing flex flex-col items-center justify-center active:scale-95 shadow-2xs ${
                isJustAdded
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                  : "border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300"
              }`}
            >
              <Icon className="size-6 mx-auto text-amber-700 mb-1" />
              <span className="text-xs font-semibold text-stone-700">{item.title}</span>
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
