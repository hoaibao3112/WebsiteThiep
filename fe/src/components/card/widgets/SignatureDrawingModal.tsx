"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { XCircle, RotateCcw, CheckCircle2, PenTool } from "lucide-react";

interface SignatureDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
  title?: string;
  penColor?: string;
  penWidth?: number;
}

export function SignatureDrawingModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Vẽ chữ ký của bạn",
  penColor = "#000000",
  penWidth = 2.8,
}: SignatureDrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize and resize canvas with High-DPI support
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height, 220);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  useEffect(() => {
    if (!isOpen) return;

    // Wait for modal transition to render DOM
    const timer = setTimeout(() => {
      initCanvas();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, initCanvas]);

  // Pointer down (Touch / Mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setHasDrawn(true);

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y); // Draw a dot in case of single tap
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  // Pointer move with quadratic curve interpolation for smooth calligraphy
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (lastPointRef.current) {
      const midX = (lastPointRef.current.x + currentX) / 2;
      const midY = (lastPointRef.current.y + currentY) / 2;

      ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
      ctx.stroke();
    }

    lastPointRef.current = { x: currentX, y: currentY };
  };

  // Pointer up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Action: Clear canvas (Ký lại)
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    setHasDrawn(false);
    lastPointRef.current = null;
  };

  // Action: Confirm signature (Xác nhận)
  const handleConfirm = () => {
    if (!hasDrawn || !canvasRef.current) {
      alert("Vui lòng vẽ chữ ký của bạn trước khi xác nhận");
      return;
    }

    // Export trimmed/clean transparent PNG
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onConfirm(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      {/* MODAL CARD (MATCHING 100% USER'S SCREENSHOT 2) */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-200/80 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        {/* CANVAS DRAWING AREA */}
        <div
          ref={containerRef}
          className="relative w-full h-[240px] sm:h-[260px] rounded-2xl border-2 border-stone-300 bg-white overflow-hidden shadow-inner flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="touch-none cursor-crosshair block"
            style={{ touchAction: "none" }}
          />

          {!hasDrawn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-stone-300">
              <PenTool className="size-8 stroke-1 mb-1 opacity-40 animate-pulse" />
              <span className="text-xs text-stone-400 font-medium tracking-wide">
                Ký tên vào khung này
              </span>
            </div>
          )}
        </div>

        {/* 3 ACTION BUTTONS (MATCHING 100% USER'S SCREENSHOT 2) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          {/* 1. HỦY */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <XCircle className="size-4 text-stone-500" />
            <span>Hủy</span>
          </button>

          {/* 2. KÝ LẠI */}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-amber-300 bg-white hover:bg-amber-50/60 text-amber-600 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="size-4 text-amber-500" />
            <span>Ký lại</span>
          </button>

          {/* 3. XÁC NHẬN */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="size-4" />
            <span>Xác nhận</span>
          </button>
        </div>
      </div>
    </div>
  );
}
