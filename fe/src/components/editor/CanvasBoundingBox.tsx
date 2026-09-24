"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CanvasElement, useEditor } from "./EditorContext";
import {
  Copy,
  Trash2,
  MoreHorizontal,
  Scissors,
  Clipboard,
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  RotateCw,
} from "lucide-react";

interface CanvasBoundingBoxProps {
  element: CanvasElement;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function CanvasBoundingBox({ element, containerRef }: CanvasBoundingBoxProps) {
  const {
    zoomLevel,
    updateCanvasElement,
    removeCanvasElement,
    duplicateCanvasElement,
    reorderElementLayer,
    toggleLockElement,
    copySelectedElement,
    cutSelectedElement,
    pasteElement,
  } = useEditor();

  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; elX: number; elY: number }>({
    startX: 0,
    startY: 0,
    elX: 0,
    elY: 0,
  });

  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElX: number;
    startElY: number;
    handle: string;
  }>({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startElX: 0,
    startElY: 0,
    handle: "",
  });

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMenu]);

  // Handle Drag Move (pointer down on bounding box)
  const handlePointerDownDrag = useCallback(
    (e: React.PointerEvent) => {
      if (element.isLocked) return;
      // If clicked on resize handle or toolbar, don't initiate drag
      const target = e.target as HTMLElement;
      if (target.closest("[data-canvas-control]")) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        elX: element.x,
        elY: element.y,
      };

      const zoomFactor = Math.max(0.5, zoomLevel / 100);

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const deltaX = (moveEvt.clientX - dragStartRef.current.startX) / zoomFactor;
        const deltaY = (moveEvt.clientY - dragStartRef.current.startY) / zoomFactor;

        const newX = Math.round(dragStartRef.current.elX + deltaX);
        const newY = Math.round(dragStartRef.current.elY + deltaY);

        updateCanvasElement(element.id, { x: newX, y: newY });
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [element.id, element.isLocked, element.x, element.y, zoomLevel, updateCanvasElement]
  );

  // Handle Resize Handles
  const handlePointerDownResize = useCallback(
    (handle: string, e: React.PointerEvent) => {
      if (element.isLocked) return;
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(handle);
      resizeStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: element.width,
        startHeight: element.height,
        startElX: element.x,
        startElY: element.y,
        handle,
      };

      const zoomFactor = Math.max(0.5, zoomLevel / 100);

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const deltaX = (moveEvt.clientX - resizeStartRef.current.startX) / zoomFactor;
        const deltaY = (moveEvt.clientY - resizeStartRef.current.startY) / zoomFactor;
        const { startWidth, startHeight, startElX, startElY } = resizeStartRef.current;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startElX;
        let newY = startElY;

        if (handle.includes("e")) {
          newWidth = Math.max(30, startWidth + deltaX);
        }
        if (handle.includes("w")) {
          const w = Math.max(30, startWidth - deltaX);
          newWidth = w;
          newX = startElX + (startWidth - w);
        }
        if (handle.includes("s")) {
          newHeight = Math.max(20, startHeight + deltaY);
        }
        if (handle.includes("n")) {
          const h = Math.max(20, startHeight - deltaY);
          newHeight = h;
          newY = startElY + (startHeight - h);
        }

        const patch: Partial<CanvasElement> = {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        };

        // Proportionally scale fontSize for stickers and text so dragging larger makes them visibly bigger
        if (element.type === "sticker" || element.type === "text") {
          const scaleRatio = newHeight / Math.max(20, startHeight);
          const baseSize = element.fontSize || (element.type === "sticker" ? 60 : 28);
          patch.fontSize = Math.max(14, Math.min(240, Math.round(baseSize * scaleRatio)));
        }

        updateCanvasElement(element.id, patch);
      };

      const handlePointerUp = () => {
        setIsResizing(null);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [element.id, element.isLocked, element.width, element.height, element.x, element.y, element.type, element.fontSize, zoomLevel, updateCanvasElement]
  );

  const handlePointerDownRotate = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!containerRef.current || element.isLocked) return;

      const rect = containerRef.current.getBoundingClientRect();
      const zoomFactor = Math.max(0.5, zoomLevel / 100);
      const centerX = rect.left + (element.x + element.width / 2) * zoomFactor;
      const centerY = rect.top + (element.y + element.height / 2) * zoomFactor;

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const radians = Math.atan2(moveEvt.clientY - centerY, moveEvt.clientX - centerX);
        let degrees = Math.round(radians * (180 / Math.PI) - 90);
        if (degrees < 0) degrees += 360;
        if (Math.abs(degrees - 0) < 5 || Math.abs(degrees - 360) < 5) degrees = 0;
        if (Math.abs(degrees - 90) < 5) degrees = 90;
        if (Math.abs(degrees - 180) < 5) degrees = 180;
        if (Math.abs(degrees - 270) < 5) degrees = 270;

        updateCanvasElement(element.id, { rotation: degrees });
      };

      const handlePointerUp = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [element.id, element.isLocked, element.x, element.y, element.width, element.height, zoomLevel, containerRef, updateCanvasElement]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        zIndex: (element.zIndex || 10) + 100,
        pointerEvents: "auto",
      }}
      onPointerDown={handlePointerDownDrag}
      className={`border-2 border-[#0091FF] select-none transition-shadow ${
        isDragging ? "cursor-grabbing shadow-lg" : element.isLocked ? "cursor-not-allowed" : "cursor-move"
      }`}
    >
      {/* ── FLOATING TOP ACTION BAR ── */}
      <div
        data-canvas-control
        className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-200/90 px-1 py-1 flex items-center gap-1 z-50 animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Duplicate Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            duplicateCanvasElement(element.id);
          }}
          className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
          title="Tạo bản sao (Nhân bản)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeCanvasElement(element.id);
          }}
          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
          title="Xóa phần tử"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* More Options (...) Button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className={`p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition ${
              showMenu ? "bg-stone-200/70 text-stone-900" : ""
            }`}
            title="Tùy chọn khác"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Context Dropdown Menu matching ngaychungdoi.com */}
          {showMenu && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-2xl border border-stone-200 py-1.5 text-xs text-stone-700 z-50 divide-y divide-stone-100 font-sans animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clipboard Actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    copySelectedElement();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-stone-50 transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Sao chép</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Ctrl+C</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    cutSelectedElement();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-stone-50 transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-stone-500" />
                    <span>Cắt</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Ctrl+X</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    pasteElement();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-stone-50 transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <Clipboard className="w-3.5 h-3.5 text-stone-500" />
                    <span>Dán</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Ctrl+V</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    duplicateCanvasElement(element.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-stone-50 transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Tạo bản sao</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    removeCanvasElement(element.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-rose-50 text-rose-600 transition text-left font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa phần tử</span>
                  </span>
                </button>
              </div>

              {/* Layer Ordering Actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    reorderElementLayer(element.id, "top");
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-stone-50 transition text-left"
                >
                  <ChevronsUp className="w-3.5 h-3.5 text-stone-500" />
                  <span>Đưa lên trên cùng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reorderElementLayer(element.id, "bottom");
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-stone-50 transition text-left"
                >
                  <ChevronsDown className="w-3.5 h-3.5 text-stone-500" />
                  <span>Đưa xuống dưới cùng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reorderElementLayer(element.id, "up");
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-stone-50 transition text-left"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-stone-500" />
                  <span>Đưa lên một lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reorderElementLayer(element.id, "down");
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-stone-50 transition text-left"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-stone-500" />
                  <span>Đưa xuống một lớp</span>
                </button>
              </div>

              {/* Lock & Layer Info */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleLockElement(element.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-stone-50 transition text-left"
                >
                  {element.isLocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Mở khóa vị trí</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                      <span>Khóa vị trí</span>
                    </>
                  )}
                </button>

                <div className="px-3 py-1 text-[11px] text-stone-400 font-mono">
                  Lớp hiện tại: {element.zIndex || 1}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 8 RESIZE HANDLES (BLUE DOTS) ── */}
      {!element.isLocked && (
        <>
          {/* Top-Left */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("nw", e)}
            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-nwse-resize hover:scale-125 transition-transform"
          />
          {/* Top-Center */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("n", e)}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-ns-resize hover:scale-125 transition-transform"
          />
          {/* Top-Right */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("ne", e)}
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-nesw-resize hover:scale-125 transition-transform"
          />
          {/* Middle-Left */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("w", e)}
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-ew-resize hover:scale-125 transition-transform"
          />
          {/* Middle-Right */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("e", e)}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-ew-resize hover:scale-125 transition-transform"
          />
          {/* Bottom-Left */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("sw", e)}
            className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-nesw-resize hover:scale-125 transition-transform"
          />
          {/* Bottom-Center */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("s", e)}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-ns-resize hover:scale-125 transition-transform"
          />
          {/* Bottom-Right */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("se", e)}
            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-xs cursor-nwse-resize hover:scale-125 transition-transform"
          />

          {/* Rotation Handle (Khớp chuẩn giao diện ngaychungdoi) */}
          <div
            data-canvas-control
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
          >
            <div className="w-[1.5px] h-3.5 bg-[#0091FF]" />
            <div
              onPointerDown={handlePointerDownRotate}
              className="size-6 rounded-full bg-white border border-stone-300 shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-stone-50 hover:border-[#0091FF] transition-colors"
              title="Kéo để xoay phần tử"
            >
              <RotateCw className="size-3.5 text-stone-600" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
