"use client";

import React, { useEffect, useRef } from "react";
import { useEditor } from "../EditorContext";
import { SHAPE_ITEMS } from "./ShapeTool";

interface ShapePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  topOffset: number;
}

export function ShapePopover({ isOpen, onClose, topOffset }: ShapePopoverProps) {
  const { addShapeElement } = useEditor();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      style={{ top: Math.max(10, topOffset - 40) }}
      className="absolute left-[76px] z-50 w-52 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 px-1.5 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      <div className="flex flex-col gap-0.5">
        {SHAPE_ITEMS.map((item) => (
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
            onClick={() => {
              addShapeElement({ shapeType: item.shapeType, title: item.title });
              onClose();
            }}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 transition cursor-grab active:cursor-grabbing text-left group"
          >
            <div className="text-stone-700 group-hover:text-stone-900 group-hover:scale-105 transition-transform shrink-0">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
