"use client";

import React, { useRef, useState, useEffect } from "react";
import { PenTool, CheckCircle2, Loader2, RotateCcw, X, Eye, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import type { CanvasWidgetConfig } from "@/types/canvas.types";

interface Props {
  config: CanvasWidgetConfig;
  cardId?: string;
  elementId?: string;
  isEditor?: boolean;
}

interface SignatureItem {
  id: string;
  signerName: string;
  message?: string;
  signatureUrl: string;
  createdAt: string;
}

export function GuestSignatureWidget({ config, cardId, elementId, isEditor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const title = config.signatureTitle || config.title || "Sổ Lưu Bút Ký Tên";
  const subtitle = config.signatureSubtitle || config.description || "Hãy để lại chữ ký và lời chúc kỷ niệm cho đôi uyên ương!";
  const instructions = config.signatureInstructions || "Dùng ngón tay hoặc chuột vẽ chữ ký vào khung bên dưới";
  const penColor = config.signaturePenColor || "#2C1810";
  const canvasBg = config.signatureCanvasColor || "#FFFDF9";
  const penWidth = config.signaturePenWidth || 3;
  const buttonText = config.signatureButtonText || "Ký Tên Ngay";
  const submitText = config.signatureSubmitText || "Lưu Chữ Ký";
  const clearText = config.signatureClearText || "Xoá Vẽ Lại";
  const showGallery = config.signatureShowGallery !== false;

  // Initialize canvas context
  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    return ctx;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = getContext();
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setHasDrawn(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = getContext();
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditor) {
      alert("Đang ở chế độ chỉnh sửa thiệp. Tính năng ký tên hoạt động khi khách xem thiệp thực tế.");
      return;
    }
    if (!signerName.trim()) {
      setError("Vui lòng nhập họ tên của bạn");
      return;
    }
    if (!hasDrawn || !canvasRef.current) {
      setError("Vui lòng vẽ chữ ký của bạn trước khi lưu");
      return;
    }
    if (!cardId || !elementId) {
      setError("Không tìm thấy thông tin thiệp để lưu chữ ký");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const res = await fetch(`/api/cards/${cardId}/signature/${elementId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signatureDataUrl: dataUrl,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Lưu chữ ký thất bại");
      }

      setSubmitted(true);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    if (!cardId || !elementId) return;
    setLoadingGallery(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/signature/${elementId}/gallery?limit=30`);
      const data = await res.json();
      if (data.success && Array.isArray(data.signatures)) {
        setSignatures(data.signatures);
      }
    } catch {
      // ignore
    } finally {
      setLoadingGallery(false);
    }
  };

  const openGalleryModal = () => {
    setIsGalleryOpen(true);
    fetchGallery();
  };

  return (
    <div className="flex size-full flex-col items-center justify-center p-3 text-center">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200/80 bg-gradient-to-b from-white via-amber-50/10 to-stone-50 p-4 shadow-sm">
        <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 mb-2">
          <PenTool className="size-5" />
        </div>
        <h3 className="text-sm font-bold text-stone-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 mb-3">{subtitle}</p>}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setSubmitted(false);
              setTimeout(() => handleClear(), 100);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-950 active:scale-98 cursor-pointer"
          >
            <PenTool className="size-4 text-amber-300" />
            <span>{buttonText}</span>
          </button>

          {showGallery && (
            <button
              type="button"
              onClick={openGalleryModal}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2 text-[11px] font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 transition cursor-pointer"
            >
              <Eye className="size-3.5 text-stone-500" />
              <span>Xem Sổ Lưu Bút ({signatures.length > 0 ? signatures.length : "Đã có chữ ký"})</span>
            </button>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl border border-amber-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>

            {submitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-8" />
                </div>
                <h4 className="text-base font-bold text-stone-900 mb-1">Chữ Ký Đã Được Lưu!</h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Cảm ơn bạn đã để lại nét bút và lời chúc yêu thương cho cô dâu chú rể! ✨
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      openGalleryModal();
                    }}
                    className="rounded-xl bg-amber-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-950 transition cursor-pointer"
                  >
                    Xem Sổ Lưu Bút
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="text-center pr-6">
                  <h4 className="text-sm font-bold text-stone-900">Ký Tên Lưu Niệm</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">{instructions}</p>
                </div>

                {/* Canvas Box */}
                <div className="relative rounded-2xl border-2 border-dashed border-amber-300/80 overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={150}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="w-full touch-none cursor-crosshair"
                    style={{ backgroundColor: canvasBg }}
                  />
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-stone-900/80 px-2 py-1 text-[10px] font-medium text-white shadow-xs hover:bg-stone-900 transition cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>{clearText}</span>
                  </button>
                </div>

                {/* Signer Name */}
                <input
                  type="text"
                  required
                  placeholder="Họ và tên của bạn *"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white transition placeholder:text-stone-400"
                />

                {/* Message */}
                <textarea
                  rows={2}
                  placeholder="Lời chúc ngắn gửi đôi uyên ương (tùy chọn)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white transition placeholder:text-stone-400"
                />

                {error && <p className="text-[11px] text-rose-600 text-center font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-950 active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <PenTool className="size-4" />}
                  <span>{submitText}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl border border-amber-200 bg-stone-50 p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                  <Sparkles className="size-4" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">Sổ Lưu Bút Kỷ Niệm</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="flex size-7 items-center justify-center rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300 transition cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {loadingGallery ? (
                <div className="flex size-full items-center justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-amber-800" />
                </div>
              ) : signatures.length === 0 ? (
                <div className="py-10 text-center text-stone-400">
                  <PenTool className="size-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-xs">Chưa có chữ ký nào. Hãy là người đầu tiên ký tên!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {signatures.map((sig) => (
                    <div
                      key={sig.id}
                      className="flex flex-col rounded-2xl border border-amber-200/60 bg-white p-2.5 shadow-2xs transition hover:shadow-xs"
                    >
                      <div className="relative mb-2 flex h-20 w-full items-center justify-center rounded-xl bg-amber-50/40 border border-amber-100/80 p-1">
                        <img
                          src={sig.signatureUrl}
                          alt={`Chữ ký của ${sig.signerName}`}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-800 truncate">{sig.signerName}</span>
                      {sig.message && (
                        <p className="text-[10px] text-stone-500 italic line-clamp-2 mt-0.5 leading-snug">
                          &ldquo;{sig.message}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-stone-800 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
