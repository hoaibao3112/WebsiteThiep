"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditor } from "../EditorContext";
import {
  Pipette,
  Check,
  UploadCloud,
  ImagePlus,
  Trash2,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { uploadSingleImage } from "@/lib/image-upload";

// Dải màu Pastel chuẩn theo ảnh chụp thực tế ngaychungdoi
const PASTEL_PALETTE = [
  { id: "white", color: "#FFFFFF", label: "Trắng tinh khôi" },
  { id: "blush", color: "#F9ECEC", label: "Hồng pastel" },
  { id: "ivory", color: "#FBF7EE", label: "Kem champagne" },
  { id: "mint", color: "#EDF5F0", label: "Xanh bạc hà" },
  { id: "lavender", color: "#F3EEF9", label: "Tím oải hương" },
  { id: "ice-blue", color: "#ECF2F8", label: "Xanh băng" },
  { id: "warm-sand", color: "#F5EFE6", label: "Cát ấm" },
  { id: "rose-tint", color: "#FCE7EC", label: "Hồng đào" },
];

const PATTERNS = [
  { id: "none", label: "Không" },
  { id: "flower-small", label: "Hoa nhỏ" },
  { id: "flower-large", label: "Hoa lớn" },
] as const;

const FALLING_EFFECTS = [
  { id: "none", label: "Tắt", icon: "🚫", desc: "Không dùng hiệu ứng" },
  { id: "rose-petals", label: "Hoa hồng", icon: "🌹", desc: "Cánh hoa hồng đỏ lãng mạn" },
  { id: "cherry-blossom", label: "Anh đào", icon: "🌸", desc: "Hoa anh đào bay nhẹ nhàng" },
  { id: "gold-sparkle", label: "Kim tuyến", icon: "✨", desc: "Kim tuyến vàng lấp lánh" },
  { id: "floating-hearts", label: "Trái tim", icon: "💖", desc: "Trái tim hồng bay bổng" },
  { id: "snow", label: "Tuyết rơi", icon: "❄️", desc: "Bông tuyết trắng tinh khôi" },
  { id: "dandelion", label: "Bồ công anh", icon: "🌾", desc: "Cánh bồ công anh trong gió" },
  { id: "fireflies", label: "Đom đóm", icon: "🌟", desc: "Đom đóm đêm lung linh" },
  { id: "confetti", label: "Pháo hoa", icon: "🎉", desc: "Pháo hoa giấy lễ đường" },
  { id: "apricot", label: "Hoa mai", icon: "🌼", desc: "Hoa mai vàng ngày cưới" },
  { id: "falling-leaves", label: "Lá thu", icon: "🍂", desc: "Lá phong vàng mùa thu" },
  { id: "hydrangea", label: "Hoa tú cầu", icon: "🪻", desc: "Cánh hoa tú cầu tím biếc" },
] as const;

// Thư viện ảnh nền có sẵn tuyển chọn tối ưu dung lượng và trang nhã
const PRESET_BACKGROUND_IMAGES = [
  {
    id: "bg-paper-1",
    label: "Giấy mỹ thuật ngà",
    url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "bg-paper-2",
    label: "Vân lụa ánh kim",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "bg-paper-3",
    label: "Vân đá cẩm thạch trắng",
    url: "https://images.unsplash.com/photo-1590402494587-44b71d7772f6?w=800&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1590402494587-44b71d7772f6?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "bg-paper-4",
    label: "Hoa văn vintage chìm",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "bg-paper-5",
    label: "Giấy Kraft mộc",
    url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "bg-paper-6",
    label: "Vân nước lụa hồng",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=80",
  },
];

const STORAGE_CUSTOM_BG_KEY = "wedding_custom_bg_list";

export function BackgroundTool() {
  const {
    canvasBackgroundColor,
    setCanvasBackgroundColor,
    canvasBackgroundPattern,
    setCanvasBackgroundPattern,
    canvasFallingEffect,
    setCanvasFallingEffect,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<"color" | "image">("color");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [customBgs, setCustomBgs] = useState<string[]>([]);

  // Load ảnh nền đã tải từ localStorage khi khởi tạo
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_BG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomBgs(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load custom backgrounds from localStorage", e);
    }
  }, []);

  // Kiểm tra nền hiện tại có phải là ảnh hay không
  const isCurrentImageBg = Boolean(
    canvasBackgroundColor &&
      (canvasBackgroundColor.startsWith("http://") ||
        canvasBackgroundColor.startsWith("https://") ||
        canvasBackgroundColor.startsWith("/") ||
        canvasBackgroundColor.startsWith("data:image/"))
  );

  // Xử lý nén & tải ảnh nền
  const handleUploadBackground = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadFeedback("Vui lòng chọn file hình ảnh (JPG, PNG, WebP)!");
      setTimeout(() => setUploadFeedback(null), 3000);
      return;
    }

    setIsUploading(true);
    setUploadFeedback("Đang tối ưu & nén ảnh thông minh...");

    try {
      // Tối ưu hoá & upload ảnh (HTML5 Canvas WebP nén tự động)
      const optimizedUrl = await uploadSingleImage(file);

      // Cập nhật nền canvas
      setCanvasBackgroundColor(optimizedUrl);

      // Cập nhật danh sách ảnh đã tải
      setCustomBgs((prev) => {
        const updated = [optimizedUrl, ...prev.filter((item) => item !== optimizedUrl)].slice(0, 12);
        try {
          localStorage.setItem(STORAGE_CUSTOM_BG_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage quota error
        }
        return updated;
      });

      setUploadFeedback("Đã áp dụng ảnh nền thành công! ⚡");
      setTimeout(() => setUploadFeedback(null), 3000);
    } catch (error) {
      console.error("Lỗi khi tải ảnh nền:", error);
      setUploadFeedback("Không thể xử lý ảnh, vui lòng thử lại!");
      setTimeout(() => setUploadFeedback(null), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadBackground(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadBackground(file);
    }
  };

  const handleRemoveCustomBg = (e: React.MouseEvent, urlToRemove: string) => {
    e.stopPropagation();
    setCustomBgs((prev) => {
      const updated = prev.filter((u) => u !== urlToRemove);
      try {
        localStorage.setItem(STORAGE_CUSTOM_BG_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (canvasBackgroundColor === urlToRemove) {
      setCanvasBackgroundColor("#FFFFFF");
    }
  };

  return (
    <div className="space-y-5 select-none text-stone-800">
      {/* 1. TABS: Màu sắc / Ảnh (Khớp thanh tab pill trong ảnh mẫu) */}
      <div className="grid grid-cols-2 p-1 bg-stone-100/90 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("color")}
          className={`py-2 rounded-lg transition cursor-pointer text-center ${
            activeTab === "color"
              ? "bg-white text-stone-900 shadow-2xs font-bold"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Màu sắc
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("image")}
          className={`py-2 rounded-lg transition cursor-pointer text-center ${
            activeTab === "image"
              ? "bg-white text-stone-900 shadow-2xs font-bold"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Ảnh
        </button>
      </div>

      {activeTab === "color" ? (
        <div className="space-y-5">
          {/* 2. CHỌN MÀU NỀN ĐỒNG NHẤT CHO TOÀN THIỆP */}
          <div className="space-y-2.5">
            <span className="text-xs text-stone-600 block">
              Chọn màu nền đồng nhất cho toàn thiệp
            </span>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {PASTEL_PALETTE.map((item) => {
                const isSelected =
                  canvasBackgroundColor.toLowerCase() === item.color.toLowerCase();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCanvasBackgroundColor(item.color)}
                    style={{ backgroundColor: item.color }}
                    className={`size-8 rounded-full border transition cursor-pointer relative shadow-2xs flex items-center justify-center hover:scale-105 ${
                      isSelected
                        ? "border-stone-900 ring-2 ring-stone-900 ring-offset-2"
                        : "border-stone-300"
                    }`}
                    title={item.label}
                  >
                    {isSelected && (
                      <span className="size-1.5 rounded-full bg-stone-900" />
                    )}
                  </button>
                );
              })}

              {/* Pipette Eye Dropper for custom color */}
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className="size-8 rounded-full border border-stone-300 bg-white hover:bg-stone-50 transition cursor-pointer flex items-center justify-center shadow-2xs text-stone-600 hover:text-stone-900 hover:scale-105"
                title="Chọn màu khác (Pipette)"
              >
                <Pipette className="size-3.5" />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={canvasBackgroundColor.startsWith("#") ? canvasBackgroundColor : "#FFFFFF"}
                  onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                  className="sr-only"
                />
              </button>
            </div>
          </div>

          {/* 3. HỌA TIẾT NỀN */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-700 block">
              Họa tiết nền
            </span>
            <div className="flex gap-2">
              {PATTERNS.map((p) => {
                const isActive = canvasBackgroundPattern === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCanvasBackgroundPattern(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      isActive
                        ? "border-stone-900 bg-white text-stone-900 font-bold shadow-2xs"
                        : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. HIỆU ỨNG NỀN (RƠI HOA, TRÁI TIM, KIM TUYẾN) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 block">
                Hiệu ứng rơi lãng mạn
              </span>
              {canvasFallingEffect && canvasFallingEffect !== "none" && canvasFallingEffect !== "NONE" && (
                <button
                  type="button"
                  onClick={() => setCanvasFallingEffect("none")}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-medium hover:underline cursor-pointer"
                >
                  Tắt hiệu ứng
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {FALLING_EFFECTS.map((eff) => {
                const isActive =
                  canvasFallingEffect === eff.id ||
                  (eff.id === "none" && (!canvasFallingEffect || canvasFallingEffect === "NONE"));

                return (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => setCanvasFallingEffect(eff.id)}
                    className={`py-2 px-2 rounded-xl text-center border transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isActive
                        ? "border-stone-900 bg-stone-900 text-white font-bold shadow-xs scale-[1.02]"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                    title={eff.desc}
                  >
                    <span className="text-base leading-none">{eff.icon}</span>
                    <span className="text-[11px] font-medium truncate w-full">
                      {eff.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* TAB ẢNH NỀN */
        <div className="space-y-4">
          {/* Nút gỡ ảnh nền khi đang dùng ảnh */}
          {isCurrentImageBg && (
            <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl">
              <span className="text-xs text-rose-800 font-medium">Đang dùng ảnh nền</span>
              <button
                type="button"
                onClick={() => setCanvasBackgroundColor("#FFFFFF")}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Gỡ ảnh nền
              </button>
            </div>
          )}

          {/* KHUNG TẢI ẢNH LÊN (CÓ NÉN & TỐI ƯU DUNG LƯỢNG) */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragging
                  ? "border-stone-900 bg-stone-50"
                  : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50/60"
              } ${isUploading ? "opacity-70 pointer-events-none" : ""}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-1">
                  <Loader2 className="size-6 text-stone-800 animate-spin" />
                  <span className="text-xs font-medium text-stone-700">Đang tối ưu & nén ảnh...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="size-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 mb-0.5">
                    <UploadCloud className="size-5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">
                    Tải ảnh nền từ thiết bị
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Kéo thả hoặc bấm để chọn ảnh (JPG, PNG, WebP)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 font-medium border border-emerald-100">
                    <Sparkles className="size-3" /> Tự động nén tối ưu hiển thị nhanh
                  </span>
                </div>
              )}
            </div>

            {uploadFeedback && (
              <p className="text-[11px] text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-lg text-center font-medium animate-fade-in">
                {uploadFeedback}
              </p>
            )}
          </div>

          {/* ẢNH ĐÃ TẢI LÊN CỦA BẠN (NẾU CÓ) */}
          {customBgs.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700 block">
                Ảnh bạn đã tải lên ({customBgs.length})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {customBgs.map((url, idx) => {
                  const isSelected = canvasBackgroundColor === url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setCanvasBackgroundColor(url)}
                      className={`group rounded-xl border overflow-hidden relative aspect-3/4 hover:border-stone-900 transition cursor-pointer ${
                        isSelected
                          ? "border-stone-900 ring-2 ring-stone-900 shadow-sm"
                          : "border-stone-200"
                      }`}
                    >
                      <img
                        src={url}
                        alt="Ảnh nền tự tải"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveCustomBg(e, url)}
                        className="absolute top-1.5 left-1.5 size-5 rounded-full bg-white/90 text-stone-700 hover:text-rose-600 hover:bg-white flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Xóa khỏi danh sách"
                      >
                        <Trash2 className="size-3" />
                      </button>
                      <span className="absolute inset-x-0 bottom-0 bg-stone-900/70 text-white text-[10px] p-1 text-center font-medium truncate">
                        Ảnh của bạn #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ẢNH NỀN MẪU SẴN CÓ */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-700 block">
              Mẫu nền có sẵn
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BACKGROUND_IMAGES.map((bg) => {
                const isSelected = canvasBackgroundColor === bg.url;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setCanvasBackgroundColor(bg.url)}
                    className={`group rounded-xl border overflow-hidden relative aspect-3/4 hover:border-stone-900 transition cursor-pointer text-left ${
                      isSelected
                        ? "border-stone-900 ring-2 ring-stone-900 shadow-sm"
                        : "border-stone-200"
                    }`}
                  >
                    <img
                      src={bg.thumb}
                      alt={bg.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-stone-900/70 text-white text-[10px] p-1 text-center font-medium truncate">
                      {bg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

