"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useEditor, CanvasElement } from "./EditorContext";
import { CanvasElementContent } from "@/components/card/CanvasElementContent";
import { canvasElementStyle } from "@/lib/editor/canvas-presentation";
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
import { CanvasPatternOverlay, CanvasFallingEffect } from "@/components/card/CanvasEffects";

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
      data-template-bounding-box
      onClick={(e) => e.stopPropagation()}
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
    addStockElement,
    addShapeElement,
    addPresetElement,
    canvasBackgroundColor,
    canvasBackgroundPattern,
    canvasFallingEffect,
    canvasHeight,
    beginInteraction,
    endInteraction,
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
        target.closest("[data-canvas-bounding-box]") ||
        target.closest("[data-template-control]") ||
        target.closest("[data-template-bounding-box]")
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

      if (data.type === "stock") {
        const itemW = data.width || (data.isWide ? 200 : 140);
        const itemH = data.height || (data.isWide ? 50 : 140);
        addStockElement(
          {
            id: data.stockId || data.id || "stock-item",
            icon: data.icon,
            title: data.title,
            color: data.color,
            imageUrl: data.imageUrl,
            svgContent: data.svgContent,
            svgType: data.svgType,
            width: itemW,
            height: itemH,
          },
          { x: Math.max(10, dropX - Math.round(itemW / 2)), y: Math.max(10, dropY - Math.round(itemH / 2)) }
        );
      } else if (data.type === "sticker") {
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
      beginInteraction();

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
        endInteraction();
        setActiveDraggingId(null);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    },
    [zoomLevel, selectElement, updateCanvasElement, beginInteraction, endInteraction]
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

  return (
    <section className="flex-1 min-w-0 bg-[#e9e9e9] p-3 sm:p-5 flex flex-col items-center justify-between overflow-hidden relative select-none">
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
      <div className="relative w-full min-h-0 flex-1 overflow-auto">
        <div className="relative mx-auto my-8" style={{ width: 390 * zoomLevel / 100, height: canvasHeight * zoomLevel / 100 }}>
        <div
          ref={containerRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top left",
            width: 390,
            height: canvasHeight,
          }}
          className={`absolute left-0 top-0 bg-white shadow-xl rounded-sm isolate ${
            isDragOver
                      ? "ring-2 ring-blue-400"
              : "border-stone-200/80"
          }`}
        >
          {/* Drop Overlay Hint */}
          {isDragOver && (
            <div className="absolute inset-0 bg-amber-500/15 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-amber-500 animate-in fade-in duration-100">
              <div className="bg-white/95 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-300">
                <Sparkles className="size-5 text-amber-600 animate-bounce" />
                <span className="text-sm font-bold text-amber-900 font-serif">
                  Thả phần tử vào vị trí này
                </span>
              </div>
            </div>
          )}

          {/* Canvas Sheet Artboard - 100% Free Movable Elements */}
          <div
            ref={scrollContainerRef}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                selectElement(null);
                setInlineEditingId(null);
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              backgroundColor:
                canvasBackgroundColor &&
                !canvasBackgroundColor.startsWith("http") &&
                !canvasBackgroundColor.startsWith("/") &&
                !canvasBackgroundColor.startsWith("data:")
                  ? canvasBackgroundColor
                  : ((draft as any)?.categoryData?.canvasDocument?.background?.color || "#FFFFFF"),
              backgroundImage:
                canvasBackgroundColor &&
                (canvasBackgroundColor.startsWith("http") ||
                  canvasBackgroundColor.startsWith("/") ||
                  canvasBackgroundColor.startsWith("data:"))
                  ? `url(${canvasBackgroundColor})`
                  : ((draft as any)?.categoryData?.canvasDocument?.background?.imageUrl
                      ? `url(${(draft as any)?.categoryData?.canvasDocument?.background?.imageUrl})`
                      : undefined),
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="w-full h-full relative overflow-hidden select-none"
          >
            {/* Background Pattern Overlay (Họa tiết nền) */}
            <CanvasPatternOverlay pattern={canvasBackgroundPattern} />

            {/* Falling Particles Effect (Hiệu ứng hoa lá tuyết rơi) */}
            <CanvasFallingEffect effect={canvasFallingEffect} />


            {/* ── TEMPLATE VIEW LAYER (Chỉ hiển thị cho mẫu Birthday, Newborn hoặc HTML legacy không dùng canvasDocument) ── */}
            <div
              className={`relative z-0 w-full overflow-hidden ${(draft as any)?.categoryData?.canvasDocument ? "hidden" : ""}`}
              style={{ pointerEvents: "none", minHeight: 0 }}
            >
              <div
                className="[&_a]:pointer-events-none [&_button]:pointer-events-none [&_[data-editable-field]]:pointer-events-auto [&_[data-editable-field]]:cursor-pointer"
                style={{ minHeight: 0 }}
              >
                {children}
              </div>
            </div>

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
                  onContextMenu={(e) => {
                    e.preventDefault();
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
                  style={canvasElementStyle(el)}
                  className={`flex touch-none items-center justify-center select-none transition-shadow ${
                    isCurrentlyDragging
                      ? "cursor-grabbing shadow-xl ring-2 ring-blue-400"
                      : isSelected
                      ? "cursor-move"
                      : "cursor-pointer hover:outline hover:outline-1 hover:outline-blue-300"
                  }`}
                >
                  {isInlineEditing ? (
                    <textarea aria-label="Nội dung văn bản" name="canvasText" autoFocus value={el.content}
                      onChange={(event) => updateCanvasElement(el.id, { content: event.target.value })}
                      onPointerDown={(event) => event.stopPropagation()}
                      onBlur={() => setInlineEditingId(null)}
                      onKeyDown={(event) => { if (event.key === "Escape" || (event.key === "Enter" && (event.ctrlKey || event.metaKey))) setInlineEditingId(null); }}
                      className="size-full resize-none bg-transparent p-0 outline-none [font:inherit] [text-align:inherit]" />
                  ) : <div className="size-full pointer-events-none flex items-center justify-center"><CanvasElementContent element={el} draft={draft} /></div>}
                </div>
              );
            })}

            {/* ── BOUNDING BOX OVERLAY FOR SELECTED CANVAS ELEMENT ── */}
            {selectedCanvasElement && !inlineEditingId && (
              <CanvasBoundingBox
                element={selectedCanvasElement}
                containerRef={scrollContainerRef}
                onStartInlineEdit={() => setInlineEditingId(selectedCanvasElement.id)}
              />
            )}

            {/* ── BOUNDING BOX OVERLAY FOR SELECTED TEMPLATE FIELD ── */}
            {selectedField && selectedElementId && selectedElementType !== "canvas-element" && (
              <TemplateFieldBoundingBox
                fieldId={selectedElementId}
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
          </div>
        </div>
        </div>

        {/* ── ZOOM CONTROLS PILL BÊN PHẢI (CHUẨN ẢNH MẪU NGAYCHUNGDOI) ── */}
        <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col items-center bg-white/95 backdrop-blur-md border border-stone-200 shadow-md rounded-2xl p-1 gap-1.5 z-30 pointer-events-auto">
          <button
            type="button"
            aria-label="Phóng to"
            onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="Phóng to (+10%)"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="text-[11px] font-sans font-bold text-stone-700 hover:text-amber-800 px-1 py-0.5 rounded transition cursor-pointer select-none"
            title="Đặt lại 100%"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            aria-label="Thu nhỏ"
            onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="Thu nhỏ (-10%)"
          >
            <ZoomOut className="size-4" />
          </button>
        </div>

        {/* ── FLOATING DARK CHAT BUTTON GÓC DƯỚI PHẢI (CHUẨN ẢNH MẪU) ── */}
        <button
          type="button"
          aria-label="Hỗ trợ trực tuyến"
          className="hidden sm:flex absolute right-5 bottom-5 size-12 rounded-full bg-stone-900 hover:bg-black text-white shadow-xl items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-30"
          title="Trò chuyện hỗ trợ"
        >
          <MessageCircle className="size-5.5 fill-white text-stone-900" />
        </button>
      </div>

      {/* ── BOTTOM PHOTO STRIP ── */}
      <BottomPhotoStrip />
    </section>
  );
}
