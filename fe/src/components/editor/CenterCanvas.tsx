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
  MessageCircle,
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
    draft,
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
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    let data: any = typeof window !== "undefined" ? (window as any).__DRAGGED_STOCK_ITEM__ : null;
    if (!data) {
      const raw =
        e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text/plain") ||
        e.dataTransfer.getData("text");
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {}
      }
    }

    if (!data) {
      console.warn("No drag data found on drop");
      return;
    }

    try {
      const rect =
        scrollContainerRef.current?.getBoundingClientRect() ||
        containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const zoomFactor = Math.max(0.5, zoomLevel / 100);
      const scrollTop = scrollContainerRef.current?.scrollTop || 0;
      const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;

      const dropX = Math.round((e.clientX - rect.left) / zoomFactor + scrollLeft);
      const dropY = Math.round((e.clientY - rect.top) / zoomFactor + scrollTop);

      if (data.type === "sticker") {
        addStickerElement(
          {
            icon: data.icon,
            title: data.title,
            color: data.color,
            imageUrl: data.imageUrl,
            width: data.width || (data.isWide ? 150 : 100),
            height: data.height || (data.isWide ? 80 : 100),
          },
          { x: Math.max(10, dropX - 50), y: Math.max(10, dropY - 50) }
        );
      } else if (data.type === "shape") {
        addShapeElement(
          { shapeType: data.shapeType, title: data.title },
          { x: Math.max(10, dropX - 100), y: Math.max(10, dropY - 20) }
        );
      } else if (data.type === "preset") {
        addPresetElement(
          { id: data.id, title: data.title, cat: data.cat },
          { x: Math.max(10, dropX - 150), y: Math.max(10, dropY - 80) }
        );
      }
    } catch (err) {
      console.error("Drop JSON error:", err);
    } finally {
      if (typeof window !== "undefined") {
        (window as any).__DRAGGED_STOCK_ITEM__ = null;
      }
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
      const isImg = Boolean(
        el.imageUrl ||
          (typeof el.content === "string" &&
            (el.content.startsWith("http") ||
              el.content.startsWith("/images") ||
              el.content.startsWith("data:image")))
      );
      return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
          {isImg ? (
            <img
              src={el.imageUrl || el.content}
              alt={el.title || "Sticker"}
              className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          ) : (
            <span
              style={{
                fontSize: `${el.fontSize || Math.round(el.height * 0.75)}px`,
                color: el.color || undefined,
                lineHeight: 1,
              }}
              className="filter drop-shadow-md select-none transform transition-transform"
            >
              {el.content}
            </span>
          )}
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
      // 1. Phong bì hồng mở có thiệp & ảnh cưới (như trong ảnh mẫu ngaychungdoi)
      if (el.presetId === "p-envelope-pink" || el.presetId === "p1") {
        const photoUrl = el.imageUrl || (draft as any)?.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80";
        return (
          <div className="w-full h-full relative overflow-visible flex items-center justify-center pointer-events-none select-none">
            {/* Open Flap Behind (chóp nắp phong bì mở ngược lên) */}
            <div className="absolute -top-7 w-[84%] h-24 bg-[#EFA0AF] shadow-xs [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm" />
            
            {/* Sliding Photo Card inside */}
            <div className="w-[78%] h-[82%] -top-4 absolute bg-white rounded-lg shadow-lg border border-pink-100 overflow-hidden flex flex-col items-center p-1.5 z-10">
              <div className="w-full flex-1 bg-stone-100 rounded overflow-hidden relative">
                <img
                  src={photoUrl}
                  alt="Wedding Photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pt-1 text-center">
                <span className="text-[10px] font-serif tracking-[0.2em] font-bold text-pink-700 uppercase block">Save The Date</span>
                <span className="text-[8px] font-mono text-stone-500 block truncate max-w-[200px]">
                  {(draft as any)?.groom?.fullName ? `${(draft as any)?.groom?.fullName} & ${(draft as any)?.bride?.fullName}` : "Văn Anh & Minh Thơ"}
                </span>
              </div>
            </div>

            {/* Pink Envelope Front Pocket */}
            <div className="absolute inset-x-0 bottom-0 h-[68%] bg-[#F294A6] rounded-b-2xl z-20 shadow-md [clip-path:polygon(0%_25%,50%_65%,100%_25%,100%_100%,0%_100%)] border-t border-pink-200/50" />
            <div className="absolute inset-x-0 bottom-0 h-[68%] rounded-b-2xl z-20 pointer-events-none border-b-2 border-pink-400/40" />

            {/* Pink Monogram Wax Seal */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 size-9 rounded-full bg-gradient-to-br from-[#F48197] to-[#DF5C75] border-2 border-pink-200 shadow-lg flex items-center justify-center text-[10px] font-serif font-bold text-white tracking-widest drop-shadow-sm">
              ML
            </div>
          </div>
        );
      }

      // 2. We got married - Phong bì sáp xanh
      if (el.presetId === "p-envelope-green") {
        const photoUrl = el.imageUrl || (draft as any)?.coverPhotoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80";
        return (
          <div className="w-full h-full relative overflow-visible flex items-center justify-center pointer-events-none select-none">
            <div className="absolute -top-6 w-[84%] h-22 bg-[#2D3E31] shadow-xs [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm" />
            <div className="w-[78%] h-[80%] -top-3 absolute bg-[#FDFBF7] rounded-lg shadow-lg border border-stone-200 overflow-hidden flex flex-col items-center p-2 z-10 text-center">
              <span className="text-[10px] font-serif italic text-stone-700">We got married</span>
              <div className="w-full flex-1 bg-stone-100 rounded overflow-hidden my-1">
                <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[68%] bg-[#3E5343] rounded-b-2xl z-20 shadow-md [clip-path:polygon(0%_25%,50%_65%,100%_25%,100%_100%,0%_100%)]" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 size-9 rounded-full bg-[#BE944E] border-2 border-amber-200 shadow-lg flex items-center justify-center text-xs font-bold text-amber-950">
              💍
            </div>
          </div>
        );
      }

      // 3. Thư mời WEDDING typography
      if (el.presetId === "p-wedding-typography") {
        const groom = (draft as any)?.groom?.fullName || "Văn Anh";
        const bride = (draft as any)?.bride?.fullName || "Minh Thơ";
        return (
          <div className="w-full h-full p-5 bg-[#FCFBF8] rounded-2xl border border-amber-200/80 shadow-md flex flex-col items-center justify-between text-center pointer-events-none select-none">
            <div className="w-full flex items-center justify-center gap-2">
              <div className="h-[1px] flex-1 bg-amber-300/70" />
              <span className="text-[11px] font-serif tracking-[0.25em] text-amber-800 uppercase font-bold">WEDDING</span>
              <div className="h-[1px] flex-1 bg-amber-300/70" />
            </div>
            <div className="my-auto py-2">
              <h3 className="font-serif text-lg font-bold text-stone-800 leading-tight">
                {groom} <span className="text-amber-600 font-normal font-sans">&</span> {bride}
              </h3>
              <p className="text-[10px] font-serif uppercase tracking-widest text-amber-900/80 mt-1">THƯ MỜI TIỆC CƯỚI</p>
            </div>
            <div className="w-full pt-2 border-t border-amber-100 flex items-center justify-between text-[9px] text-stone-500 font-mono">
              <span>HÔN LỄ TRANG TRỌNG</span>
              <span>2026</span>
            </div>
          </div>
        );
      }

      // 4. Lịch ngày cưới khoanh tròn
      if (el.presetId === "p-calendar-countdown") {
        return (
          <div className="w-full h-full p-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200 shadow-md flex flex-col items-center justify-between pointer-events-none select-none">
            <div className="text-center w-full pb-1 border-b border-stone-100">
              <span className="text-[10px] font-serif tracking-widest uppercase text-stone-500 block font-semibold">WELCOME TO OUR WEDDING</span>
              <span className="text-[11px] font-serif font-bold text-stone-800">Tháng 12 / 2026</span>
            </div>
            <div className="w-full my-auto">
              <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-stone-400 text-center font-bold pb-1">
                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span className="text-rose-400">CN</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-stone-700 text-center">
                <span className="text-stone-300">30</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span className="text-rose-500">6</span>
                <span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span className="relative font-bold text-rose-600"><span className="absolute -inset-1 rounded-full border-2 border-rose-500 bg-rose-50 -z-10 animate-pulse" />12</span><span className="text-rose-500">13</span>
                <span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span className="text-rose-500">20</span>
                <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span className="text-rose-500">27</span>
              </div>
            </div>
            <span className="text-[9px] font-serif italic text-amber-700 font-medium">Hẹn gặp bạn vào ngày hạnh phúc nhất!</span>
          </div>
        );
      }

      // 5. Hôn phối hai họ
      if (el.presetId === "p-parents-info" || el.presetId === "p4") {
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

      // 6. Khung ảnh vòm
      if (el.presetId === "p-arch-portrait" || el.presetId === "p1-arch") {
        return (
          <div className="w-full h-full rounded-t-[140px] rounded-b-2xl border-4 border-[#BE944E] overflow-hidden shadow-md bg-stone-100 relative pointer-events-none select-none">
            <img
              src={el.content || el.imageUrl || "/images/demo/couple-cover.png"}
              alt="Cổng vòm"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end justify-center pb-3">
              <span className="text-white text-xs font-serif tracking-widest drop-shadow uppercase">HOÀNG GIA Á ĐÔNG</span>
            </div>
          </div>
        );
      }

      // 7. Groom & Bride Duo
      if (el.presetId === "p-groom-bride-duo") {
        const groom = (draft as any)?.groom?.fullName || "Chú Rể";
        const bride = (draft as any)?.bride?.fullName || "Cô Dâu";
        return (
          <div className="w-full h-full p-3 bg-white/95 rounded-2xl border border-stone-200 shadow-md flex items-center justify-around gap-2 pointer-events-none select-none">
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full h-32 rounded-t-full rounded-b-md overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                  alt="Groom"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[9px] font-serif font-bold text-stone-800 uppercase tracking-wider mt-1.5">GROOM</span>
              <span className="text-[8px] text-stone-500 truncate max-w-[100px]">{groom}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full h-32 rounded-t-full rounded-b-md overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                  alt="Bride"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[9px] font-serif font-bold text-pink-700 uppercase tracking-wider mt-1.5">BRIDE</span>
              <span className="text-[8px] text-stone-500 truncate max-w-[100px]">{bride}</span>
            </div>
          </div>
        );
      }

      // 8. Lịch trình tiệc cưới
      if (el.presetId === "p-timeline-flow" || el.presetId === "p3") {
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

      // 9. Hộp mừng cưới & QR
      if (el.presetId === "p-banking-qr") {
        return (
          <div className="w-full h-full p-4 bg-[#FFFDF9] rounded-2xl border border-amber-300/80 shadow-md flex items-center justify-around gap-3 pointer-events-none select-none">
            <div className="size-24 bg-white border border-stone-300 rounded-xl p-1.5 shadow-xs flex flex-col items-center justify-center shrink-0">
              <img
                src="https://api.vietqr.io/image/970422-0988888888-compact2.jpg?amount=0&addInfo=MungCuoi"
                alt="QR"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/demo/qr-demo.png";
                }}
              />
            </div>
            <div className="flex-1 text-left space-y-1">
              <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">MỪNG CƯỚI ONLINE</span>
              <h4 className="text-xs font-serif font-bold text-stone-900 leading-tight">Gửi Lời Chúc & Hồng Bao</h4>
              <p className="text-[9px] text-stone-500 leading-tight">Quý khách có thể mừng cưới từ xa qua mã QR tiện ích.</p>
            </div>
          </div>
        );
      }

      // 10. Polaroids 3 tấm
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

      // 11. Cành cẩm chướng nơ đỏ
      if (el.presetId === "p-carnation-bouquet" || el.content === "carnation") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 120 180" className="w-full h-full drop-shadow-md">
              <path d="M 60 160 Q 55 110 40 70 M 60 160 Q 65 120 75 80" stroke="#4D7C0F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 52 130 Q 35 125 38 115 Q 48 120 52 130 Z" fill="#65A30D" />
              <path d="M 62 110 Q 78 105 76 95 Q 66 100 62 110 Z" fill="#65A30D" />
              <g transform="translate(38, 55)">
                <ellipse cx="0" cy="10" rx="7" ry="9" fill="#4D7C0F" />
                <path d="M -22 -5 C -30 -18 -12 -30 0 -26 C 12 -30 30 -18 22 -5 C 26 10 10 20 0 18 C -10 20 -26 10 -22 -5 Z" fill="#F43F5E" opacity="0.95" />
                <path d="M -16 -10 C -22 -22 -6 -28 0 -24 C 6 -28 22 -22 16 -10 C 20 5 6 12 0 10 C -6 12 -20 5 -16 -10 Z" fill="#FB7185" />
                <path d="M -10 -12 C -15 -18 0 -24 0 -20 C 0 -24 15 -18 10 -12 C 10 0 3 6 0 5 C -3 6 -10 0 -10 -12 Z" fill="#FECDD3" />
              </g>
              <g transform="translate(76, 75) scale(0.85)">
                <ellipse cx="0" cy="10" rx="7" ry="9" fill="#4D7C0F" />
                <path d="M -22 -5 C -30 -18 -12 -30 0 -26 C 12 -30 30 -18 22 -5 C 26 10 10 20 0 18 C -10 20 -26 10 -22 -5 Z" fill="#E11D48" opacity="0.95" />
                <path d="M -16 -10 C -22 -22 -6 -28 0 -24 C 6 -28 22 -22 16 -10 C 20 5 6 12 0 10 C -6 12 -20 5 -16 -10 Z" fill="#FB7185" />
                <path d="M -10 -12 C -15 -18 0 -24 0 -20 C 0 -24 15 -18 10 -12 C 10 0 3 6 0 5 C -3 6 -10 0 -10 -12 Z" fill="#FFE4E6" />
              </g>
              <g transform="translate(58, 140)">
                <circle cx="0" cy="0" r="5" fill="#B91C1C" />
                <path d="M 0 0 C -18 -12 -24 10 0 4 Z" fill="#DC2626" />
                <path d="M 0 0 C 18 -12 24 10 0 4 Z" fill="#DC2626" />
                <path d="M -3 3 Q -10 22 -14 30" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 3 3 Q 10 22 16 30" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        );
      }

      // 12. Con dấu sáp hồng niêm phong thiệp
      if (el.presetId === "p-wax-seal" || el.content === "wax-seal") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <path d="M 50 4 C 64 2 73 9 84 18 C 95 28 98 42 96 55 C 94 69 88 80 77 88 C 65 96 48 98 35 94 C 20 90 9 79 5 65 C 2 50 6 36 15 24 C 24 12 36 6 50 4 Z" fill="#F47291" />
              <circle cx="50" cy="51" r="32" fill="none" stroke="#E11D48" strokeWidth="2" strokeOpacity="0.3" />
              <circle cx="50" cy="51" r="28" fill="#FB7185" />
              <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fillOpacity="0.95" fontFamily="serif" fontStyle="italic" fontWeight="bold" fontSize="22">ML</text>
            </svg>
          </div>
        );
      }

      // 13. Bó hoa cưới mini pastel
      if (el.presetId === "p-mini-bouquet" || el.content === "mini-bouquet") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
              <path d="M 50 115 L 25 65 L 75 65 Z" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1" />
              <path d="M 30 65 Q 50 78 70 65 L 50 115 Z" fill="#FDF2F8" />
              <circle cx="40" cy="50" r="14" fill="#F43F5E" />
              <circle cx="60" cy="48" r="13" fill="#FB7185" />
              <circle cx="50" cy="35" r="15" fill="#FDA4AF" />
              <circle cx="35" cy="36" r="10" fill="#C084FC" />
              <circle cx="65" cy="35" r="11" fill="#A855F7" />
              <circle cx="50" cy="52" r="8" fill="#FBBF24" />
              <ellipse cx="50" cy="85" rx="8" ry="4" fill="#EC4899" />
              <path d="M 45 87 Q 40 102 38 110" stroke="#EC4899" strokeWidth="2.5" fill="none" />
              <path d="M 55 87 Q 60 102 62 110" stroke="#EC4899" strokeWidth="2.5" fill="none" />
            </svg>
          </div>
        );
      }

      // 14. Thanh chỉ vàng kim loại
      if (el.presetId === "p-gold-divider" || el.content === "gold-divider") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-xs" />
          </div>
        );
      }

      // Default: Quote
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
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

        {/* ── ZOOM & FLOATING CHAT CONTROLS (CHUẨN NGAYCHUNGDOI.COM) ── */}
        <div className="hidden sm:flex absolute right-5 bottom-8 flex-col items-center gap-3 z-30 pointer-events-auto">
          {/* Zoom Controls Pill */}
          <div className="flex flex-col items-center bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-lg rounded-2xl p-1 gap-1">
            <button
              type="button"
              aria-label="Phóng to"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              title="Phóng to (+10%)"
            >
              <ZoomIn className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="text-[11px] font-sans font-bold text-stone-600 hover:text-amber-800 px-1.5 py-0.5 rounded transition cursor-pointer select-none"
              title="Đặt lại 100%"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              aria-label="Thu nhỏ"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              title="Thu nhỏ (-10%)"
            >
              <ZoomOut className="size-4" />
            </button>
          </div>

          {/* Floating Dark Chat Button */}
          <button
            type="button"
            aria-label="Hỗ trợ trực tuyến"
            className="size-11 rounded-full bg-stone-900 hover:bg-black text-white shadow-xl flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer border border-stone-700"
            title="Trò chuyện hỗ trợ"
          >
            <MessageCircle className="size-5 fill-white text-stone-900" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM PHOTO STRIP ── */}
      <BottomPhotoStrip />
    </section>
  );
}
