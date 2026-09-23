"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useEditor, CanvasElement } from "./EditorContext";
import { CanvasBoundingBox } from "./CanvasBoundingBox";
import {
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Minus,
  X,
  Sparkles,
  Layers,
} from "lucide-react";
import { BottomPhotoStrip } from "./BottomPhotoStrip";

interface CenterCanvasProps {
  children: React.ReactNode;
}

// Bounding Box for Selected Template Fields (Names, Dates, Photos, Quotes)
function TemplateFieldBoundingBox({
  fieldId,
  label,
  containerRef,
  scrollContainerRef,
  zoomLevel,
  fieldOffsets,
  fieldScales,
  updateFieldPositionOffset,
  resetFieldPositionOffset,
  updateFieldScale,
  resetFieldScale,
  onDeselect,
}: {
  fieldId: string;
  label: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  zoomLevel: number;
  fieldOffsets: Record<string, { x: number; y: number }>;
  fieldScales: Record<string, number>;
  updateFieldPositionOffset: (id: string, dx: number, dy: number) => void;
  resetFieldPositionOffset: (id: string) => void;
  updateFieldScale: (id: string, scale: number) => void;
  resetFieldScale: (id: string) => void;
  onDeselect: () => void;
}) {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentScale = fieldScales[fieldId] ?? 1;

  const updateRect = useCallback(() => {
    if (!scrollContainerRef.current || !containerRef.current) return;
    const domNode = containerRef.current.querySelector<HTMLElement>(`[data-editable-field="${fieldId}"]`);
    if (!domNode) {
      setRect(null);
      return;
    }
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const nodeRect = domNode.getBoundingClientRect();
    const zoomFactor = Math.max(0.5, zoomLevel / 100);

    const left = (nodeRect.left - containerRect.left) / zoomFactor + scrollContainerRef.current.scrollLeft;
    const top = (nodeRect.top - containerRect.top) / zoomFactor + scrollContainerRef.current.scrollTop;
    const width = nodeRect.width / zoomFactor;
    const height = nodeRect.height / zoomFactor;

    setRect({ left, top, width, height });
  }, [fieldId, containerRef, scrollContainerRef, zoomLevel]);

  useEffect(() => {
    updateRect();
    const timer = setTimeout(updateRect, 60);
    window.addEventListener("resize", updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
    };
  }, [updateRect, fieldOffsets, fieldScales]);

  // Pointer Down Drag to move template element directly
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-template-control]")) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const zoomFactor = Math.max(0.5, zoomLevel / 100);
    let prevDeltaX = 0;
    let prevDeltaY = 0;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const curDeltaX = (moveEvt.clientX - startX) / zoomFactor;
      const curDeltaY = (moveEvt.clientY - startY) / zoomFactor;
      const stepX = curDeltaX - prevDeltaX;
      const stepY = curDeltaY - prevDeltaY;
      prevDeltaX = curDeltaX;
      prevDeltaY = curDeltaY;
      updateFieldPositionOffset(fieldId, stepX, stepY);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Corner resize handles for scaling
  const handleResizePointerDown = (corner: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = currentScale;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const delta = moveEvt.clientX - startX + (moveEvt.clientY - startY);
      const factor = corner.includes("w") || corner.includes("n") ? -delta : delta;
      const nextScale = Math.max(0.4, Math.min(2.5, startScale + factor * 0.005));
      updateFieldScale(fieldId, nextScale);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  if (!rect) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: 50,
      }}
      onPointerDown={handlePointerDown}
      className={`border-2 border-dashed border-[#BE944E] rounded-lg select-none transition-shadow ${
        isDragging ? "cursor-grabbing shadow-lg bg-amber-500/10" : "cursor-move hover:bg-amber-500/5"
      }`}
    >
      {/* Floating Action Pill above template element */}
      <div
        data-template-control
        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-amber-300 px-2 py-1 flex items-center gap-1.5 z-50 text-xs font-sans whitespace-nowrap"
      >
        <span className="text-[10px] font-bold text-amber-900 max-w-[110px] truncate">{label}</span>
        <div className="h-3 w-px bg-stone-200" />
        {/* Scale Down */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            updateFieldScale(fieldId, Math.max(0.4, currentScale - 0.1));
          }}
          className="p-1 hover:bg-amber-50 text-stone-700 hover:text-amber-800 rounded transition cursor-pointer"
          title="Thu nhỏ (-10%)"
        >
          <Minus className="size-3" />
        </button>
        <span className="text-[10px] font-mono text-stone-500 min-w-[32px] text-center font-bold">
          {Math.round(currentScale * 100)}%
        </span>
        {/* Scale Up */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            updateFieldScale(fieldId, Math.min(2.5, currentScale + 0.1));
          }}
          className="p-1 hover:bg-amber-50 text-stone-700 hover:text-amber-800 rounded transition cursor-pointer"
          title="Phóng to (+10%)"
        >
          <Plus className="size-3" />
        </button>
        <div className="h-3 w-px bg-stone-200" />
        {/* Reset */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetFieldPositionOffset(fieldId);
            resetFieldScale(fieldId);
          }}
          className="p-1 hover:bg-amber-50 text-amber-700 rounded transition cursor-pointer"
          title="Đặt lại vị trí & cỡ ban đầu"
        >
          <RotateCcw className="size-3" />
        </button>
        {/* Deselect */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeselect();
          }}
          className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded transition cursor-pointer"
          title="Đóng chọn"
        >
          <X className="size-3" />
        </button>
      </div>

      {/* 4 Corner Resize Handles to scale element */}
      <div
        data-template-control
        onPointerDown={(e) => handleResizePointerDown("nw", e)}
        className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#BE944E] border-2 border-white shadow-xs cursor-nwse-resize hover:scale-125 transition-transform"
      />
      <div
        data-template-control
        onPointerDown={(e) => handleResizePointerDown("ne", e)}
        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#BE944E] border-2 border-white shadow-xs cursor-nesw-resize hover:scale-125 transition-transform"
      />
      <div
        data-template-control
        onPointerDown={(e) => handleResizePointerDown("sw", e)}
        className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#BE944E] border-2 border-white shadow-xs cursor-nesw-resize hover:scale-125 transition-transform"
      />
      <div
        data-template-control
        onPointerDown={(e) => handleResizePointerDown("se", e)}
        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#BE944E] border-2 border-white shadow-xs cursor-nwse-resize hover:scale-125 transition-transform"
      />
    </div>
  );
}

export function CenterCanvas({ children }: CenterCanvasProps) {
  const {
    saveState,
    zoomLevel,
    setZoomLevel,
    selectElement,
    selectedElementId,
    selectedElementType,
    selectedField,
    canvasElements,
    selectedCanvasElement,
    updateCanvasElement,
    removeCanvasElement,
    copySelectedElement,
    pasteElement,
    fieldOffsets,
    fieldScales,
    updateFieldPositionOffset,
    resetFieldPositionOffset,
    updateFieldScale,
    resetFieldScale,
    addStickerElement,
    addShapeElement,
    addPresetElement,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Capture click events inside preview container to detect [data-editable-field] or deselect
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If clicked inside a canvas control (bounding box, menu, resize handles, template pill), do nothing
      if (
        target.closest("[data-canvas-control]") ||
        target.closest("[data-canvas-element]") ||
        target.closest("[data-template-control]")
      ) {
        return;
      }

      const editable = target.closest<HTMLElement>("[data-editable-field]");
      if (editable) {
        e.preventDefault();
        e.stopPropagation();
        const fieldId = editable.getAttribute("data-editable-field");
        const fieldType = (editable.getAttribute("data-editable-type") || "text") as any;
        if (fieldId) {
          selectElement(fieldId, fieldType);
        }
      } else {
        // Clicked outside any editable -> deselect
        selectElement(null);
        setInlineEditingId(null);
      }
    };

    el.addEventListener("click", handleClick, true);
    return () => {
      el.removeEventListener("click", handleClick, true);
    };
  }, [selectElement]);

  // Apply field offsets & scales to template [data-editable-field]
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const allKeys = new Set([...Object.keys(fieldOffsets), ...Object.keys(fieldScales)]);
    allKeys.forEach((fieldId) => {
      const target = el.querySelector<HTMLElement>(`[data-editable-field="${fieldId}"]`);
      if (target) {
        const offset = fieldOffsets[fieldId] || { x: 0, y: 0 };
        const scale = fieldScales[fieldId] ?? 1;
        target.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${scale})`;
        target.style.transformOrigin = "center center";
        target.style.transition = "transform 0.08s ease-out";
      }
    });
  }, [fieldOffsets, fieldScales]);

  // HTML5 Drag & Drop from Sidebar onto Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only leave if exiting the scroll container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      const rect = scrollContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const zoomFactor = Math.max(0.5, zoomLevel / 100);
      const scrollTop = scrollContainerRef.current?.scrollTop || 0;
      const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;

      const dropX = Math.round((e.clientX - rect.left) / zoomFactor + scrollLeft);
      const dropY = Math.round((e.clientY - rect.top) / zoomFactor + scrollTop);

      if (data.type === "sticker") {
        addStickerElement({ icon: data.icon, title: data.title }, { x: dropX - 50, y: dropY - 50 });
      } else if (data.type === "shape") {
        addShapeElement({ shapeType: data.shapeType, title: data.title }, { x: dropX - 100, y: dropY - 20 });
      } else if (data.type === "preset") {
        addPresetElement({ id: data.id, title: data.title, cat: data.cat }, { x: dropX - 150, y: dropY - 80 });
      }
    } catch (err) {
      console.error("Drop JSON error:", err);
    }
  };

  // Direct Drag Handler for Canvas Elements
  const handleElementPointerDown = useCallback(
    (el: CanvasElement, e: React.PointerEvent) => {
      if (el.isLocked) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.closest("[data-canvas-control]")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      selectElement(el.id, "canvas-element");
      setActiveDraggingId(el.id);

      const zoomFactor = Math.max(0.5, zoomLevel / 100);
      const startX = e.clientX;
      const startY = e.clientY;
      const initialElX = el.x;
      const initialElY = el.y;

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const deltaX = (moveEvt.clientX - startX) / zoomFactor;
        const deltaY = (moveEvt.clientY - startY) / zoomFactor;
        const newX = Math.round(initialElX + deltaX);
        const newY = Math.round(initialElY + deltaY);
        updateCanvasElement(el.id, { x: newX, y: newY });
      };

      const handlePointerUp = () => {
        setActiveDraggingId(null);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [zoomLevel, selectElement, updateCanvasElement]
  );

  // Keyboard shortcuts (Delete, Arrows, Ctrl+C, Ctrl+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (selectedCanvasElement) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          removeCanvasElement(selectedCanvasElement.id);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, { x: selectedCanvasElement.x - step });
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, { x: selectedCanvasElement.x + step });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, { y: selectedCanvasElement.y - step });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, { y: selectedCanvasElement.y + step });
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
          copySelectedElement();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
          pasteElement();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCanvasElement, removeCanvasElement, updateCanvasElement, copySelectedElement, pasteElement]);

  // Render content according to element type
  const renderElementContent = (el: CanvasElement, isInlineEditing: boolean) => {
    if (el.type === "sticker") {
      return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
          <span
            style={{
              fontSize: `${el.fontSize || Math.round(el.height * 0.75)}px`,
              lineHeight: 1,
            }}
            className="filter drop-shadow-md select-none transform transition-transform"
          >
            {el.content}
          </span>
        </div>
      );
    }

    if (el.type === "shape") {
      if (el.shapeType === "line") {
        return (
          <div className="w-full h-full flex items-center justify-center px-2 pointer-events-none select-none">
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#BE944E] to-[#BE944E]" />
              <span className="text-[#BE944E] text-xs font-serif">✦</span>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#BE944E] via-[#BE944E] to-transparent" />
            </div>
          </div>
        );
      }
      if (el.shapeType === "rect") {
        return (
          <div className="w-full h-full rounded-[inherit] border-2 border-[#BE944E] p-1.5 pointer-events-none select-none relative shadow-sm">
            <div className="w-full h-full border border-dashed border-[#BE944E]/60 rounded-[calc(inherit-4px)] flex items-center justify-center">
              <span className="text-[10px] text-amber-800/60 font-serif italic tracking-wider">Khung Hoàng Gia</span>
            </div>
          </div>
        );
      }
      if (el.shapeType === "circle") {
        return (
          <div className="w-full h-full rounded-full border-2 border-[#BE944E] p-1.5 pointer-events-none select-none relative shadow-sm">
            <div className="w-full h-full rounded-full border border-dashed border-[#BE944E]/60 flex items-center justify-center">
              <span className="text-[#BE944E] text-sm font-serif">❦</span>
            </div>
          </div>
        );
      }
      if (el.shapeType === "corner") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none text-amber-700/80">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M10,10 L90,10 L90,25 L25,25 L25,90 L10,90 Z" opacity="0.85" />
              <circle cx="55" cy="55" r="8" opacity="0.6" />
            </svg>
          </div>
        );
      }
    }

    if (el.type === "preset") {
      if (el.presetId === "p1") {
        return (
          <div className="w-full h-full rounded-t-[140px] rounded-b-2xl border-4 border-[#BE944E] overflow-hidden shadow-md bg-stone-100 relative pointer-events-none select-none">
            <img
              src={el.content || "/images/demo/couple-cover.png"}
              alt="Cổng vòm"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end justify-center pb-3">
              <span className="text-white text-xs font-serif tracking-widest drop-shadow">HOÀNG GIA Á ĐÔNG</span>
            </div>
          </div>
        );
      }
      if (el.presetId === "p2") {
        return (
          <div className="w-full h-full flex items-center justify-center gap-1.5 p-2 pointer-events-none select-none">
            <div className="w-24 bg-white p-1.5 pb-4 shadow-md rounded -rotate-6 border border-stone-200">
              <div className="w-full h-20 bg-stone-200 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&auto=format&fit=crop&q=80"
                  alt="p1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[8px] text-center font-serif text-stone-600 mt-1 font-semibold">Tình Đầu</div>
            </div>
            <div className="w-24 bg-white p-1.5 pb-4 shadow-lg rounded z-10 border border-stone-200">
              <div className="w-full h-20 bg-stone-200 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80"
                  alt="p2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[8px] text-center font-serif text-amber-700 mt-1 font-bold">Hẹn Ước</div>
            </div>
            <div className="w-24 bg-white p-1.5 pb-4 shadow-md rounded rotate-6 border border-stone-200">
              <div className="w-full h-20 bg-stone-200 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&auto=format&fit=crop&q=80"
                  alt="p3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[8px] text-center font-serif text-stone-600 mt-1 font-semibold">Trọn Đời</div>
            </div>
          </div>
        );
      }
      if (el.presetId === "p3") {
        return (
          <div className="w-full h-full p-3.5 bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D4AF37]/50 shadow-md flex flex-col justify-between pointer-events-none select-none text-left">
            <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
              <span className="text-[11px] font-bold text-amber-900 tracking-wider font-serif uppercase">
                Lịch Trình Hôn Lễ
              </span>
              <span className="text-[9px] text-stone-400 font-sans">WEDDING TIMELINE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-700 mt-1">
              <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">17:30</span>
                <span className="font-medium text-stone-700">Đón Khách</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">18:00</span>
                <span className="font-medium text-stone-700">Làm Lễ</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">18:30</span>
                <span className="font-medium text-stone-700">Khai Tiệc</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">19:30</span>
                <span className="font-medium text-stone-700">Chụp Hình</span>
              </div>
            </div>
          </div>
        );
      }
      if (el.presetId === "p4") {
        return (
          <div className="w-full h-full p-3.5 bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200 shadow-md flex flex-col justify-between pointer-events-none select-none text-center">
            <div className="text-[11px] font-bold text-amber-900 tracking-wider font-serif uppercase border-b border-stone-100 pb-1">
              Hôn Phối Hai Họ
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="border-r border-stone-100 pr-2">
                <p className="font-bold text-stone-800 font-serif text-[10px]">NHÀ TRAI</p>
                <p className="text-stone-500 text-[9px] mt-0.5">Ông: Nguyễn Văn A</p>
                <p className="text-stone-500 text-[9px]">Bà: Trần Thị B</p>
              </div>
              <div className="pl-1">
                <p className="font-bold text-stone-800 font-serif text-[10px]">NHÀ GÁI</p>
                <p className="text-stone-500 text-[9px] mt-0.5">Ông: Lê Văn C</p>
                <p className="text-stone-500 text-[9px]">Bà: Phạm Thị D</p>
              </div>
            </div>
          </div>
        );
      }
      if (el.presetId === "p5") {
        return (
          <div className="w-full h-full p-3.5 bg-gradient-to-br from-amber-50/90 to-stone-50/90 backdrop-blur-xs rounded-2xl border border-amber-200/80 shadow-md flex flex-col items-center justify-center pointer-events-none select-none text-center">
            <span className="text-amber-600 text-lg leading-none font-serif">“</span>
            <p className="text-[11px] font-serif italic text-stone-800 font-medium px-2 leading-relaxed">
              Trăm năm tình viên mãn, bạc đầu nghĩa phu thê.
            </p>
            <p className="text-[9px] text-amber-800/80 mt-1 font-sans">
              Sự hiện diện của quý khách là niềm vinh hạnh cho chúng tôi.
            </p>
          </div>
        );
      }
    }

    if (el.type === "image") {
      return (
        <div className="w-full h-full rounded-[inherit] overflow-hidden pointer-events-none select-none">
          <img
            src={el.imageUrl || el.content}
            alt={el.title || "Ảnh"}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // Default: text element
    if (isInlineEditing) {
      return (
        <input
          type="text"
          autoFocus
          value={el.content}
          onChange={(e) => updateCanvasElement(el.id, { content: e.target.value })}
          onBlur={() => setInlineEditingId(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setInlineEditingId(null);
          }}
          className="w-full h-full bg-transparent border-none outline-none text-inherit font-inherit text-center p-0 m-0"
        />
      );
    }

    return (
      <span className="w-full break-words select-none pointer-events-none leading-tight">
        {el.content}
      </span>
    );
  };

  return (
    <section className="flex-1 min-w-0 bg-[#F4F1EA] p-3 sm:p-5 flex flex-col items-center justify-between overflow-hidden relative select-none">
      {/* ── TOP STATUS BAR ── */}
      <div className="w-full max-w-[390px] mb-2 flex items-center justify-between text-xs text-stone-500 shrink-0">
        <span className="font-semibold flex items-center gap-1.5 text-stone-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Kéo thả và chỉnh sửa trực tiếp trên thiệp
        </span>
        <span aria-live="polite" className="inline-flex items-center gap-1 text-emerald-700 font-medium">
          <Check className="size-3" />
          {saveState === "saving" ? "Đang lưu..." : saveState === "dirty" ? "Chưa lưu" : "Đã lưu"}
        </span>
      </div>

      {/* ── CANVAS VIEWPORT WITH ZOOM TRANSFORM ── */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-0 overflow-auto">
        <div
          ref={containerRef}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
          className={`relative h-[680px] w-full max-w-[390px] overflow-hidden rounded-[40px] bg-white shadow-2xl border-4 transition-all duration-150 [transform:translateZ(0)] isolate shrink-0 ${
            isDragOver
              ? "border-amber-500 ring-4 ring-amber-300 ring-offset-2 scale-[1.01]"
              : "border-stone-800"
          }`}
        >
          {/* Drop Overlay Hint */}
          {isDragOver && (
            <div className="absolute inset-0 bg-amber-500/15 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center pointer-events-none border-4 border-dashed border-amber-500 rounded-[36px] animate-in fade-in duration-100">
              <div className="bg-white/95 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-300">
                <Sparkles className="size-5 text-amber-600 animate-bounce" />
                <span className="text-sm font-bold text-amber-900 font-serif">
                  Thả phần tử vào vị trí này
                </span>
              </div>
            </div>
          )}

          {/* Dynamic Island Header Mockup */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 items-center justify-end px-2 pointer-events-none hidden sm:flex">
            <div className="w-2 h-2 rounded-full bg-[#1c1c1e] border border-stone-700/50" />
          </div>

          {/* Scrolling Content */}
          <div
            ref={scrollContainerRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="h-full overflow-y-auto overflow-x-hidden relative editor-canvas-scroll"
          >
            {/* Template Card Content */}
            {children}

            {/* ── BOUNDING BOX OVERLAY FOR SELECTED TEMPLATE FIELD ── */}
            {selectedField && selectedElementType !== "canvas-element" && (
              <TemplateFieldBoundingBox
                fieldId={selectedField.id}
                label={selectedField.label}
                containerRef={containerRef}
                scrollContainerRef={scrollContainerRef}
                zoomLevel={zoomLevel}
                fieldOffsets={fieldOffsets}
                fieldScales={fieldScales}
                updateFieldPositionOffset={updateFieldPositionOffset}
                resetFieldPositionOffset={resetFieldPositionOffset}
                updateFieldScale={updateFieldScale}
                resetFieldScale={resetFieldScale}
                onDeselect={() => selectElement(null)}
              />
            )}

            {/* ── FREE CANVAS ELEMENTS LAYER ── */}
            {canvasElements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const isInlineEditing = inlineEditingId === el.id;
              const isCurrentlyDragging = activeDraggingId === el.id;

              return (
                <div
                  key={el.id}
                  data-canvas-element
                  onPointerDown={(e) => handleElementPointerDown(el, e)}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectElement(el.id, "canvas-element");
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (el.type === "text") {
                      selectElement(el.id, "canvas-element");
                      setInlineEditingId(el.id);
                    }
                  }}
                  style={{
                    position: "absolute",
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    zIndex: el.zIndex || 10,
                    opacity: el.opacity ?? 1,
                    fontFamily: el.fontFamily,
                    fontSize: `${el.fontSize || 28}px`,
                    color: el.color || "#000000",
                    backgroundColor: el.backgroundColor || "transparent",
                    textAlign: el.textAlign || "center",
                    fontWeight: el.isBold ? "bold" : "normal",
                    fontStyle: el.isItalic ? "italic" : "normal",
                    textDecoration: [
                      el.isUnderline ? "underline" : "",
                      el.isStrike ? "line-through" : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || "none",
                    textTransform: el.isUppercase ? "uppercase" : "none",
                    borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                    borderWidth: el.borderWidth ? `${el.borderWidth}px` : undefined,
                    borderColor: el.borderColor || undefined,
                    borderStyle: el.borderWidth ? "solid" : undefined,
                    boxShadow: el.shadow || undefined,
                  }}
                  className={`flex items-center justify-center p-1 select-none transition-shadow ${
                    isCurrentlyDragging
                      ? "cursor-grabbing shadow-xl ring-2 ring-blue-400"
                      : isSelected
                      ? "cursor-move"
                      : "cursor-pointer hover:outline hover:outline-1 hover:outline-blue-300"
                  }`}
                >
                  {renderElementContent(el, isInlineEditing)}
                </div>
              );
            })}

            {/* ── BOUNDING BOX OVERLAY FOR SELECTED CANVAS ELEMENT ── */}
            {selectedCanvasElement && (
              <CanvasBoundingBox
                element={selectedCanvasElement}
                containerRef={scrollContainerRef}
              />
            )}
          </div>
        </div>

        {/* ── ZOOM CONTROLS (FLOATING ON RIGHT) ── */}
        <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col items-center bg-white/95 backdrop-blur-md border border-stone-200 shadow-md rounded-2xl p-1 gap-1 z-20">
          <button
            type="button"
            aria-label="Phóng to"
            onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="Phóng to (+10%)"
          >
            <ZoomIn className="size-4" />
          </button>
          <span className="text-[10px] font-mono font-bold text-stone-500 px-1 select-none">
            {zoomLevel}%
          </span>
          <button
            type="button"
            aria-label="Thu nhỏ"
            onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="Thu nhỏ (-10%)"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Đặt lại cỡ"
            onClick={() => setZoomLevel(100)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="Đặt lại 100%"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM PHOTO STRIP ── */}
      <BottomPhotoStrip />
    </section>
  );
}
