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
  onStartInlineEdit?: () => void;
}

export function CanvasBoundingBox({ element, containerRef, onStartInlineEdit }: CanvasBoundingBoxProps) {
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
    beginInteraction,
    endInteraction,
    selectElement,
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

      e.stopPropagation();

      selectElement(element.id, "canvas-element");
      beginInteraction();
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
        endInteraction();
        selectElement(element.id, "canvas-element");
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    },
    [element.id, element.isLocked, element.x, element.y, zoomLevel, updateCanvasElement, beginInteraction, endInteraction]
  );

  // Handle Resize Handles with Natural Proportional & Edge Scaling
  const handlePointerDownResize = useCallback(
    (handle: string, e: React.PointerEvent) => {
      if (element.isLocked) return;
      e.preventDefault();
      e.stopPropagation();

      selectElement(element.id, "canvas-element");
      beginInteraction();
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
        const aspectRatio = startWidth / Math.max(1, startHeight);

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startElX;
        let newY = startElY;

        switch (handle) {
          case "se": { // Bottom-Right corner
            const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;
            newWidth = Math.max(20, Math.round(startWidth + delta));
            newHeight = Math.max(20, Math.round(newWidth / aspectRatio));
            break;
          }
          case "nw": { // Top-Left corner
            const delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : -deltaY * aspectRatio;
            newWidth = Math.max(20, Math.round(startWidth + delta));
            newHeight = Math.max(20, Math.round(newWidth / aspectRatio));
            newX = startElX + (startWidth - newWidth);
            newY = startElY + (startHeight - newHeight);
            break;
          }
          case "ne": { // Top-Right corner
            const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : -deltaY * aspectRatio;
            newWidth = Math.max(20, Math.round(startWidth + delta));
            newHeight = Math.max(20, Math.round(newWidth / aspectRatio));
            newY = startElY + (startHeight - newHeight);
            break;
          }
          case "sw": { // Bottom-Left corner
            const delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY * aspectRatio;
            newWidth = Math.max(20, Math.round(startWidth + delta));
            newHeight = Math.max(20, Math.round(newWidth / aspectRatio));
            newX = startElX + (startWidth - newWidth);
            break;
          }
          case "e": { // Right edge
            newWidth = Math.max(20, Math.round(startWidth + deltaX));
            break;
          }
          case "w": { // Left edge
            newWidth = Math.max(20, Math.round(startWidth - deltaX));
            newX = startElX + (startWidth - newWidth);
            break;
          }
          case "s": { // Bottom edge
            newHeight = Math.max(20, Math.round(startHeight + deltaY));
            break;
          }
          case "n": { // Top edge
            newHeight = Math.max(20, Math.round(startHeight - deltaY));
            newY = startElY + (startHeight - newHeight);
            break;
          }
        }

        const patch: Partial<CanvasElement> = {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        };

        // Proportionally scale fontSize for stickers, stock items and text
        if (element.type === "sticker" || element.type === "text" || element.type === "stock") {
          const ratio = newWidth / Math.max(20, startWidth);
          const defaultBase =
            element.type === "text"
              ? 28
              : element.content && element.content.length > 2
              ? 26
              : 60;
          const baseSize = element.fontSize || defaultBase;
          patch.fontSize = Math.max(10, Math.min(260, Math.round(baseSize * ratio)));
        }

        updateCanvasElement(element.id, patch);
      };

      const handlePointerUp = () => {
        setIsResizing(null);
        endInteraction();
        selectElement(element.id, "canvas-element");
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    },
    [element.id, element.isLocked, element.width, element.height, element.x, element.y, element.type, element.fontSize, element.content, zoomLevel, selectElement, updateCanvasElement, beginInteraction, endInteraction]
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
      data-canvas-bounding-box
      onClick={(e) => {
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (element.type === "text" && onStartInlineEdit) {
          onStartInlineEdit();
        }
      }}
      style={{
        position: "absolute",
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        zIndex: (element.zIndex || 10) + 100,
        pointerEvents: "none",
      }}
      className={`border-2 border-[#0091FF] select-none transition-shadow ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* ── FLOATING TOP ACTION BAR ── */}
      <div
        data-canvas-control
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg border border-stone-200/90 px-2 py-1 flex items-center gap-1.5 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Duplicate Button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            duplicateCanvasElement(element.id);
          }}
          className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
          title="Tạo bản sao (Nhân bản)"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removeCanvasElement(element.id);
          }}
          className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          title="Xóa phần tử"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* More Options (...) Button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className={`p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer ${
              showMenu ? "bg-stone-200/70 text-stone-900" : ""
            }`}
            title="Tùy chọn khác"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Context Dropdown Menu matching screenshot */}
          {showMenu && (
            <div
              data-canvas-control
              className="absolute right-0 top-full mt-2 w-60 rounded-2xl shadow-2xl border border-stone-200/90 bg-white py-1.5 text-xs text-stone-700 z-50 divide-y divide-stone-100 font-sans animate-in fade-in zoom-in-95 pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()}
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
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Copy className="w-4 h-4 text-stone-600" />
                    <span className="text-xs text-stone-800 font-medium">Sao chép</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">Ctrl+C</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    cutSelectedElement();
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-stone-600" />
                    <span className="text-xs text-stone-800 font-medium">Cắt</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">Ctrl+X</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    pasteElement();
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Clipboard className="w-4 h-4 text-stone-600" />
                    <span className="text-xs text-stone-800 font-medium">Dán</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">Ctrl+V</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    duplicateCanvasElement(element.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-800 font-medium">Tạo bản sao</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    removeCanvasElement(element.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-stone-50 text-stone-800 transition text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-800 font-medium">Xóa phần tử</span>
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
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-800 font-medium">Đưa lên trên cùng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reorderElementLayer(element.id, "bottom");
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-800 font-medium">Đưa xuống dưới cùng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reorderElementLayer(element.id, "up");
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-800 font-medium">Đưa lên một lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reorderElementLayer(element.id, "down");
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-800 font-medium">Đưa xuống một lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleLockElement(element.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-stone-50 transition text-left cursor-pointer"
                >
                  {element.isLocked ? (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-medium">Mở khóa vị trí</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-stone-600" />
                      <span className="text-xs text-stone-800 font-medium">Khóa vị trí</span>
                    </>
                  )}
                </button>
              </div>

              {/* Layer Info */}
              <div className="px-3.5 py-2 text-xs text-stone-400 font-medium">
                Lớp hiện tại: {element.zIndex || 1}
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
            className="absolute -top-1 -left-1 size-7 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-nwse-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi kích thước"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>
          {/* Top-Center */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("n", e)}
            className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 size-7 flex items-center justify-center cursor-ns-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi chiều cao"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>
          {/* Top-Right */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("ne", e)}
            className="absolute -top-1 -right-1 translate-x-1/2 -translate-y-1/2 size-7 flex items-center justify-center cursor-nesw-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi kích thước"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>
          {/* Middle-Left */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("w", e)}
            className="absolute top-1/2 -left-1 -translate-x-1/2 -translate-y-1/2 size-7 flex items-center justify-center cursor-ew-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi chiều rộng"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>
          {/* Middle-Right */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("e", e)}
            className="absolute top-1/2 -right-1 translate-x-1/2 -translate-y-1/2 size-7 flex items-center justify-center cursor-ew-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi chiều rộng"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>
          {/* Bottom-Left */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("sw", e)}
            className="absolute -bottom-1 -left-1 -translate-x-1/2 translate-y-1/2 size-7 flex items-center justify-center cursor-nesw-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi kích thước"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>
          {/* Bottom-Center */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("s", e)}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2 size-7 flex items-center justify-center cursor-ns-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi chiều cao"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>
          {/* Bottom-Right */}
          <div
            data-canvas-control
            onPointerDown={(e) => handlePointerDownResize("se", e)}
            className="absolute -bottom-1 -right-1 translate-x-1/2 translate-y-1/2 size-7 flex items-center justify-center cursor-nwse-resize touch-none select-none z-30 group pointer-events-auto"
            title="Kéo để thay đổi kích thước"
          >
            <div className="size-3.5 rounded-full bg-[#0091FF] border-2 border-white shadow-md group-hover:scale-125 transition-transform pointer-events-none" />
          </div>

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
