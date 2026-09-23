"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useEditor, CanvasElement } from "./EditorContext";
import { CanvasBoundingBox } from "./CanvasBoundingBox";
import {
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  Sparkles,
} from "lucide-react";
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
    selectedElementType,
    selectedField,
    canvasElements,
    selectedCanvasElement,
    updateCanvasElement,
    removeCanvasElement,
    copySelectedElement,
    pasteElement,
    fieldOffsets,
    updateFieldPositionOffset,
    resetFieldPositionOffset,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);

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
        target.style.transition = "transform 0.08s ease-out";
      }
    });
  }, [fieldOffsets]);

  // Direct Drag Handler for Canvas Elements
  const handleElementPointerDown = useCallback(
    (el: CanvasElement, e: React.PointerEvent) => {
      if (el.isLocked) return;
      // If clicked inside inline input or a control button, don't drag
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
      } else if (selectedField) {
        // Nudge template field with arrow keys
        const step = e.shiftKey ? 10 : 2;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          updateFieldPositionOffset(selectedField.id, -step, 0);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          updateFieldPositionOffset(selectedField.id, step, 0);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          updateFieldPositionOffset(selectedField.id, 0, -step);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          updateFieldPositionOffset(selectedField.id, 0, step);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCanvasElement,
    selectedField,
    removeCanvasElement,
    updateCanvasElement,
    updateFieldPositionOffset,
    copySelectedElement,
    pasteElement,
  ]);

  // Render content according to element type
  const renderElementContent = (el: CanvasElement, isInlineEditing: boolean) => {
    if (el.type === "sticker") {
      return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
          <span className="text-4xl sm:text-5xl filter drop-shadow-md select-none transform transition-transform hover:scale-105">
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

        {/* ── FLOATING POSITION / NUDGE CONTROLLER FOR TEMPLATE FIELDS OR CANVAS ELEMENTS ── */}
        {(selectedField || selectedCanvasElement) && (
          <div
            data-canvas-control
            className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl rounded-2xl p-2 z-30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex flex-col text-[10px] pr-1 border-r border-stone-200">
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Move className="size-3 text-amber-600" />
                {selectedField ? "Dời vị trí" : "Di chuyển"}
              </span>
              <span className="text-stone-400 max-w-[90px] truncate">
                {selectedField?.label || selectedCanvasElement?.title || "Phần tử"}
              </span>
            </div>

            {/* Direction Arrows */}
            <div className="grid grid-cols-3 gap-1">
              <span />
              <button
                type="button"
                onClick={() => {
                  if (selectedField) updateFieldPositionOffset(selectedField.id, 0, -5);
                  else if (selectedCanvasElement) updateCanvasElement(selectedCanvasElement.id, { y: selectedCanvasElement.y - 5 });
                }}
                className="p-1 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
                title="Lên trên (-5px)"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <span />
              <button
                type="button"
                onClick={() => {
                  if (selectedField) updateFieldPositionOffset(selectedField.id, -5, 0);
                  else if (selectedCanvasElement) updateCanvasElement(selectedCanvasElement.id, { x: selectedCanvasElement.x - 5 });
                }}
                className="p-1 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
                title="Sang trái (-5px)"
              >
                <ArrowLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedField) resetFieldPositionOffset(selectedField.id);
                  else if (selectedCanvasElement) updateCanvasElement(selectedCanvasElement.id, { x: 45, y: 240 });
                }}
                className="p-1 hover:bg-amber-50 text-amber-700 rounded transition cursor-pointer"
                title="Đặt lại vị trí gốc"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedField) updateFieldPositionOffset(selectedField.id, 5, 0);
                  else if (selectedCanvasElement) updateCanvasElement(selectedCanvasElement.id, { x: selectedCanvasElement.x + 5 });
                }}
                className="p-1 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
                title="Sang phải (+5px)"
              >
                <ArrowRight className="size-3.5" />
              </button>
              <span />
              <button
                type="button"
                onClick={() => {
                  if (selectedField) updateFieldPositionOffset(selectedField.id, 0, 5);
                  else if (selectedCanvasElement) updateCanvasElement(selectedCanvasElement.id, { y: selectedCanvasElement.y + 5 });
                }}
                className="p-1 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
                title="Xuống dưới (+5px)"
              >
                <ArrowDown className="size-3.5" />
              </button>
              <span />
            </div>
          </div>
        )}

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
