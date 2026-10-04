"use client";

import React, { useState, useEffect } from "react";
import { PenTool, CheckCircle2, Loader2, RotateCcw, X, Eye, Sparkles, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import type { CanvasWidgetConfig } from "@/types/canvas.types";
import { SignatureDrawingModal } from "./SignatureDrawingModal";

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
  const [signerName, setSignerName] = useState("");
  const [message, setMessage] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawingPadOpen, setIsDrawingPadOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const title = config.signatureTitle || config.title || "Sổ Lưu Bút Ký Tên";
  const subtitle = config.signatureSubtitle || config.description || "Hãy để lại chữ ký và lời chúc kỷ niệm cho đôi uyên ương!";
  const penColor = config.signaturePenColor || "#18181b";
  const penWidth = config.signaturePenWidth || 2.8;
  const buttonText = config.signatureButtonText || "Ký Tên Ngay";
  const submitText = config.signatureSubmitText || "Lưu Chữ Ký";
  const showGallery = config.signatureShowGallery !== false;

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
    if (!signatureDataUrl) {
      setError("Vui lòng nhấn để vẽ chữ ký của bạn trước khi lưu");
      return;
    }
    if (!cardId || !elementId) {
      setError("Không tìm thấy thông tin thiệp để lưu chữ ký");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${cardId}/signature/${elementId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signatureDataUrl: signatureDataUrl,
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
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer"
            >
              <Eye className="size-3.5 text-stone-500" />
              <span>Xem Sổ Chữ Ký Khách Mời</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Signing Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-stone-100 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3.5 top-3.5 size-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
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
                  <p className="text-[11px] text-stone-500 mt-0.5">Nhập họ tên và tự tay vẽ chữ ký kỷ niệm</p>
                </div>

                {/* Signer Name */}
                <div className="text-left">
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên của bạn..."
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white transition placeholder:text-stone-400"
                  />
                </div>

                {/* Signature Trigger & Preview Box */}
                <div className="text-left">
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Chữ ký tự vẽ <span className="text-rose-500">*</span>
                  </label>

                  {signatureDataUrl ? (
                    <div className="relative w-full rounded-2xl border-2 border-stone-200 bg-white p-3 flex flex-col items-center shadow-xs">
                      <img
                        src={signatureDataUrl}
                        alt="Chữ ký của bạn"
                        className="max-h-24 object-contain"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setIsDrawingPadOpen(true)}
                          className="px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="size-3" />
                          <span>Ký lại</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureDataUrl(null)}
                          className="px-2.5 py-1 rounded-full border border-stone-200 text-stone-500 hover:text-rose-600 text-[11px] hover:bg-stone-50 transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="size-3" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex justify-center py-2">
                      <button
                        type="button"
                        onClick={() => setIsDrawingPadOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-bold shadow-md bg-rose-500 hover:bg-rose-600 transition active:scale-95 cursor-pointer"
                      >
                        <PenTool className="size-3.5" />
                        <span>Nhấn để ký tên</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="text-left">
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Lời chúc ngắn (tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Gửi gắm lời chúc ngọt ngào đến cô dâu chú rể..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white transition placeholder:text-stone-400"
                  />
                </div>

                {error && <p className="text-[11px] text-rose-600 text-center font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-950 active:scale-98 disabled:opacity-60 cursor-pointer mt-1"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <PenTool className="size-4" />}
                  <span>{submitText}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* POPUP DRAWING PAD MODAL */}
      <SignatureDrawingModal
        isOpen={isDrawingPadOpen}
        onClose={() => setIsDrawingPadOpen(false)}
        onConfirm={(dataUrl) => {
          setSignatureDataUrl(dataUrl);
          setIsDrawingPadOpen(false);
        }}
        penColor={penColor}
        penWidth={penWidth}
      />

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg max-h-[85vh] rounded-3xl bg-white p-5 shadow-2xl border border-stone-100 flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-600" />
                <h4 className="text-sm font-bold text-stone-900">Sổ Lưu Bút Ký Tên Khách Mời</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="size-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {loadingGallery ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-400">
                  <Loader2 className="size-6 animate-spin text-amber-600" />
                  <span className="text-xs">Đang tải chữ ký khách mời...</span>
                </div>
              ) : signatures.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  Chưa có chữ ký nào. Hãy là người đầu tiên ký tặng cô dâu chú rể nhé! ✨
                </div>
              ) : (
                signatures.map((sig) => (
                  <div
                    key={sig.id}
                    className="rounded-2xl border border-amber-100 bg-amber-50/30 p-3.5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{sig.signerName}</span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(sig.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="rounded-xl border border-stone-200/80 bg-white p-2 flex items-center justify-center max-h-24">
                      <img
                        src={sig.signatureUrl}
                        alt={`Chữ ký của ${sig.signerName}`}
                        className="max-h-20 object-contain"
                      />
                    </div>

                    {sig.message && (
                      <p className="text-xs text-stone-600 italic bg-white/60 p-2 rounded-lg border border-amber-100/50">
                        "{sig.message}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
