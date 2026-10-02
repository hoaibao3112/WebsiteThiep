"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Upload, Sparkles, Check, Heart, RefreshCw, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { ApiClient } from "@/lib/api";
import { MemoryFrameType, WeddingMemory } from "@/types/wedding-memory.types";

interface PhotoboothModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  coupleName: string;
  weddingDate?: string;
  monogram?: string;
  defaultGuestName?: string;
  onSuccess?: (newMemory: WeddingMemory) => void;
}

const FRAMES: { id: MemoryFrameType; name: string; desc: string; previewColor: string }[] = [
  { id: "polaroid", name: "Polaroid Cổ Điển", desc: "Giấy ảnh kỷ niệm chân thực", previewColor: "#F5F5F0" },
  { id: "golden-monogram", name: "Chữ Lồng Mạ Vàng", desc: "Viền vàng hoàng gia sang trọng", previewColor: "#D4AF37" },
  { id: "floral", name: "Hoa Lá Tinh Khôi", desc: "Cành lá hoa cưới lãng mạn", previewColor: "#7A9E7E" },
  { id: "classic", name: "Cổ Điển Tinh Tế", desc: "Viền chỉ vàng kép thanh lịch", previewColor: "#2A2A2A" },
];

const QUICK_WISHES = [
  "Chúc hai bạn trăm năm hạnh phúc! 🥂",
  "Mãi mãi viên mãn, đầu bạc răng long! ❤️",
  "Đám cưới đẹp nhất năm! Chúc mừng tân lang tân nương 🎉",
  "Hạnh phúc ngọt ngào mỗi ngày nhé! 💐",
];

export function PhotoboothModal({
  isOpen,
  onClose,
  slug,
  coupleName,
  weddingDate = "2026",
  monogram = "♥",
  defaultGuestName = "",
  onSuccess,
}: PhotoboothModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [frameType, setFrameType] = useState<MemoryFrameType>("polaroid");
  const [senderName, setSenderName] = useState(defaultGuestName);
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset state khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (defaultGuestName) setSenderName(defaultGuestName);
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, defaultGuestName]);

  // Xử lý chọn ảnh từ máy/camera
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng chọn tệp hình ảnh hợp lệ");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Render ảnh lồng khung nghệ thuật lên Canvas để xuất ra Blob WebP đã nén
  const renderFramedImageToBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!selectedImage) return reject(new Error("Chưa chọn ảnh"));

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Không tạo được context canvas"));

        // Kích thước chuẩn khung ảnh (1080 x 1350 tỉ lệ 4:5 hoặc vuông)
        const targetW = 1080;
        const targetH = frameType === "polaroid" ? 1350 : 1080;
        canvas.width = targetW;
        canvas.height = targetH;

        if (frameType === "polaroid") {
          // 1. KHUNG POLAROID CỔ ĐIỂN
          ctx.fillStyle = "#FAF8F5";
          ctx.fillRect(0, 0, targetW, targetH);

          // Đường viền nổi nhẹ
          ctx.strokeStyle = "#E8E4DC";
          ctx.lineWidth = 4;
          ctx.strokeRect(2, 2, targetW - 4, targetH - 4);

          // Khu vực ảnh (Lề 60px 2 bên & trên, đáy 270px)
          const photoX = 60;
          const photoY = 60;
          const photoW = targetW - 120;
          const photoH = 980;

          // Vẽ ảnh (Cover crop)
          drawImageProp(ctx, img, photoX, photoY, photoW, photoH);

          // Text viết tay chân polaroid
          ctx.fillStyle = "#3A3530";
          ctx.font = "italic 44px 'Playfair Display', serif";
          ctx.textAlign = "center";
          ctx.fillText(coupleName, targetW / 2, 1140);

          ctx.fillStyle = "#8C7A6B";
          ctx.font = "26px sans-serif";
          ctx.fillText(`Wedding Day • ${weddingDate}`, targetW / 2, 1200);

          ctx.fillStyle = "#D4AF37";
          ctx.font = "32px sans-serif";
          ctx.fillText("♥", targetW / 2, 1260);
        } else if (frameType === "golden-monogram") {
          // 2. KHUNG CHỮ LỒNG MẠ VÀNG (LUXURY GOLD)
          const borderW = 40;
          drawImageProp(ctx, img, 0, 0, targetW, targetH);

          // Viền vàng kim tuyến bo quanh
          ctx.strokeStyle = "#D4AF37";
          ctx.lineWidth = borderW;
          ctx.strokeRect(borderW / 2, borderW / 2, targetW - borderW, targetH - borderW);

          // Chỉ phụ bên trong
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 4;
          ctx.strokeRect(borderW + 16, borderW + 16, targetW - (borderW + 16) * 2, targetH - (borderW + 16) * 2);

          // Monogram vàng ở góc trên bên phải
          const monoX = targetW - 120;
          const monoY = 120;
          ctx.beginPath();
          ctx.arc(monoX, monoY, 50, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(20, 20, 20, 0.85)";
          ctx.fill();
          ctx.strokeStyle = "#D4AF37";
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.fillStyle = "#D4AF37";
          ctx.font = "bold italic 36px 'Playfair Display', serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(monogram, monoX, monoY);

          // Tên góc dưới
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.fillRect(0, targetH - 100, targetW, 100);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 32px 'Playfair Display', serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(`${coupleName} • Happy Wedding`, targetW / 2, targetH - 40);
        } else if (frameType === "floral") {
          // 3. KHUNG HOA LÁ TINH KHÔI
          drawImageProp(ctx, img, 0, 0, targetW, targetH);

          // Viền hoa lá lãng mạn
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 30;
          ctx.strokeRect(15, 15, targetW - 30, targetH - 30);

          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fillRect(targetW / 2 - 250, targetH - 90, 500, 65);
          ctx.strokeStyle = "#7A9E7E";
          ctx.lineWidth = 2;
          ctx.strokeRect(targetW / 2 - 250, targetH - 90, 500, 65);

          ctx.fillStyle = "#2D4436";
          ctx.font = "bold 26px 'Playfair Display', serif";
          ctx.textAlign = "center";
          ctx.fillText(`🌿 ${coupleName} 🌿`, targetW / 2, targetH - 48);
        } else {
          // 4. CLASSIC
          drawImageProp(ctx, img, 0, 0, targetW, targetH);
          ctx.strokeStyle = "#C5A059";
          ctx.lineWidth = 16;
          ctx.strokeRect(8, 8, targetW - 16, targetH - 16);
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          ctx.strokeRect(28, 28, targetW - 56, targetH - 56);
        }

        // Xuất ra Blob WebP nén chất lượng cao (~300KB)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Lỗi nén ảnh"));
            }
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Lỗi tải ảnh để xử lý khung"));
      img.src = selectedImage;
    });
  };

  // Helper căn tỷ lệ vẽ ảnh Cover vào Canvas
  function drawImageProp(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sWidth = img.width;
    let sHeight = img.height;
    let sx = 0;
    let sy = 0;

    if (imgRatio > targetRatio) {
      sWidth = img.height * targetRatio;
      sx = (img.width - sWidth) / 2;
    } else {
      sHeight = img.width / targetRatio;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  }

  // Submit gửi ảnh lên Màn hình LED & Thiệp cưới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setErrorMessage("Vui lòng chụp ảnh hoặc tải ảnh lên");
      return;
    }
    if (!senderName.trim()) {
      setErrorMessage("Vui lòng nhập tên của bạn");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Tạo ảnh lồng khung chất lượng cao dạng Blob đã nén (~1600px, ~300KB)
      const photoBlob = await renderFramedImageToBlob();

      // 2. Gửi multipart FormData lên Backend API
      const formData = new FormData();
      formData.append("photo", photoBlob, "memory.webp");
      formData.append("senderName", senderName.trim());
      if (relationship.trim()) formData.append("relationship", relationship.trim());
      if (message.trim()) formData.append("message", message.trim());
      formData.append("frameType", frameType);

      const res = await ApiClient.createWeddingMemory(slug, formData);

      if (!res.success || !res.data) {
        if (res.status === 429) {
          throw new Error("Bạn đã gửi quá nhiều ảnh. Vui lòng đợi 5 phút trước khi gửi tiếp!");
        }
        throw new Error(res.error || "Không thể gửi ảnh lúc này. Vui lòng thử lại!");
      }

      // 3. Nổ pháo hoa chúc mừng
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#FFDF73", "#FF69B4", "#FFFFFF"],
      });

      setIsSuccess(true);
      onSuccess?.(res.data);

      setTimeout(() => {
        onClose();
        setSelectedImage(null);
        setMessage("");
      }, 2500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
                Chụp Ảnh Kỷ Niệm &amp; Photobooth
              </h3>
              <p className="text-[11px] text-stone-500">
                Gửi ảnh &amp; lời chúc lên Màn hình LED sân khấu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR / SUCCESS BANNER */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce shadow-md">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">
              Gửi Ảnh Lên Màn Hình Thành Công! 🎉
            </h4>
            <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
              Ảnh của bạn đang được chiếu lên màn hình LED sân khấu tiệc cưới và lưu vào album kỷ niệm của cô dâu chú rể.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* 1. KHU VỰC CHỌN ẢNH HOẶC CHỤP SELFIE */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleImageChange}
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-4/3 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/70 transition flex flex-col items-center justify-center gap-2.5 p-6 text-center cursor-pointer group shadow-2xs"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                      Chạm để Chụp Ảnh hoặc Tải Ảnh Lên
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Selfie tại bàn tiệc hoặc ảnh chụp cùng cô dâu chú rể
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-100 flex items-center justify-center">
                  {/* PREVIEW ẢNH KÈM KHUNG NGHỆ THUẬT */}
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* OVERLAY MÔ PHỎNG KHUNG ĐANG CHỌN */}
                  {frameType === "polaroid" && (
                    <div className="absolute inset-0 border-8 sm:border-12 border-white pb-14 bg-transparent flex flex-col justify-end pointer-events-none">
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-white flex flex-col items-center justify-center">
                        <span className="text-xs font-serif italic text-stone-800 truncate px-2">{coupleName}</span>
                        <span className="text-[9px] text-stone-500">{weddingDate}</span>
                      </div>
                    </div>
                  )}

                  {frameType === "golden-monogram" && (
                    <div className="absolute inset-0 border-4 sm:border-8 border-[#D4AF37] pointer-events-none">
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 border border-[#D4AF37] flex items-center justify-center text-[10px] font-bold text-[#D4AF37]">
                        {monogram}
                      </div>
                    </div>
                  )}

                  {frameType === "floral" && (
                    <div className="absolute inset-0 border-6 border-white/90 pointer-events-none">
                      <div className="absolute bottom-2 inset-x-0 text-center">
                        <span className="text-[10px] bg-white/90 px-3 py-0.5 rounded-full border border-emerald-300 font-serif text-emerald-900">
                          🌿 {coupleName} 🌿
                        </span>
                      </div>
                    </div>
                  )}

                  {/* NÚT CHỤP LẠI ẢNH */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-[11px] font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Đổi ảnh</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. CHỌN KHUNG ẢNH CƯỚI NGHỆ THUẬT */}
            {selectedImage && (
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center justify-between">
                  <span>Chọn Khung Ảnh Cưới:</span>
                  <span className="text-[11px] font-normal text-amber-700">Tự động gắn tên cặp đôi</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FRAMES.map((f) => {
                    const isSelected = frameType === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrameType(f.id)}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-50 border-amber-500 ring-2 ring-amber-400/20 shadow-xs"
                            : "bg-white border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: f.previewColor }}
                          />
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] font-bold text-stone-800 block truncate">
                          {f.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. THÔNG TIN KHÁCH GỬI & LỜI CHÚC */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="VD: Bạn Hoàng &amp; Người thương"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Mối quan hệ
                  </label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="VD: Bạn cấp 3 Chú rể, Đồng nghiệp..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Lời chúc gửi đến Cô dâu &amp; Chú rể
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Gửi lời chúc phúc ngọt ngào xuất hiện cùng bức ảnh trên màn hình LED..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50 resize-none"
                />

                {/* GỢI Ý LỜI CHÚC NHANH */}
                <div className="flex gap-1.5 flex-wrap mt-1.5">
                  {QUICK_WISHES.map((w, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(w)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-900 border border-stone-200 transition cursor-pointer"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. NÚT SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedImage}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi ảnh lên màn hình...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gửi Lên Màn Hình Tiệc Cưới 🎉</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
