"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEditor, CanvasElement } from "./EditorContext";
import { CanvasBoundingBox } from "./CanvasBoundingBox";
import { Check, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { BottomPhotoStrip } from "./BottomPhotoStrip";

interface CenterCanvasProps {
  children: React.ReactNode;
}

export function CenterCanvas({ children }: CenterCanvasProps) {
  const {
    saveState,
    zoomLevel,
    setZoomLevel,
    selectElement,
    selectedElementId,
    canvasElements,
    selectedCanvasElement,
    updateCanvasElement,
    removeCanvasElement,
    copySelectedElement,
    pasteElement,
    fieldOffsets,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

  // Capture click events inside the preview container to detect [data-editable-field] or deselect
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If clicked inside a canvas control (bounding box, menu, resize handles), do nothing
      if (target.closest("[data-canvas-control]") || target.closest("[data-canvas-element]")) {
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

  // Apply field offsets to template [data-editable-field]
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    Object.entries(fieldOffsets).forEach(([fieldId, offset]) => {
      const target = el.querySelector<HTMLElement>(`[data-editable-field="${fieldId}"]`);
      if (target) {
        target.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        target.style.transition = "transform 0.1s ease-out";
      }
    });
  }, [fieldOffsets]);

  // Keyboard shortcuts (Delete, Arrows, Ctrl+C, Ctrl+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (selectedCanvasElement) {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          removeCanvasElement(selectedCanvasElement.id);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, {
            x: selectedCanvasElement.x - (e.shiftKey ? 10 : 1),
          });
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, {
            x: selectedCanvasElement.x + (e.shiftKey ? 10 : 1),
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, {
            y: selectedCanvasElement.y - (e.shiftKey ? 10 : 1),
          });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          updateCanvasElement(selectedCanvasElement.id, {
            y: selectedCanvasElement.y + (e.shiftKey ? 10 : 1),
          });
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
          className="relative h-[680px] w-full max-w-[390px] overflow-hidden rounded-[40px] bg-white shadow-2xl border-4 border-stone-800 [transform:translateZ(0)] isolate shrink-0"
        >
          {/* Dynamic Island Header Mockup */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 items-center justify-end px-2 pointer-events-none hidden sm:flex">
            <div className="w-2 h-2 rounded-full bg-[#1c1c1e] border border-stone-700/50" />
          </div>

          {/* Scrolling Content */}
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto overflow-x-hidden relative editor-canvas-scroll"
          >
            {/* Template Card Content */}
            {children}

            {/* ── FREE CANVAS ELEMENTS LAYER ── */}
            {canvasElements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const isInlineEditing = inlineEditingId === el.id;

              return (
                <div
                  key={el.id}
                  data-canvas-element
                  onClick={(e) => {
                    e.stopPropagation();
                    selectElement(el.id, "canvas-element");
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    selectElement(el.id, "canvas-element");
                    setInlineEditingId(el.id);
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
                  className={`flex items-center justify-center p-1 cursor-pointer transition-colors ${
                    !isSelected ? "hover:outline hover:outline-1 hover:outline-blue-300" : ""
                  }`}
                >
                  {isInlineEditing ? (
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
                  ) : (
                    <span className="w-full break-words select-none pointer-events-none leading-tight">
                      {el.content}
                    </span>
                  )}
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
