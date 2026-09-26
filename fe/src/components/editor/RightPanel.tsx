"use client";

import React, { useState, useRef } from "react";
import { useEditor, CanvasElement } from "./EditorContext";
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Share2,
  Check,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  Trash2,
  Palette,
  Sparkles,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Lock,
  Unlock,
  Plus,
  Minus,
  QrCode,
} from "lucide-react";
import { uploadSingleImage } from "@/lib/image-upload";
import { EditorField } from "@/lib/editor/template-registry";
import { WidgetInspector } from "./WidgetInspector";

export function RightPanel() {
  const {
    selectedField,
    selectField,
    getFieldValue,
    updateFieldValue,
    isVip,
    selectedCanvasElement,
    triggerSave,
    saveState,
    showBottomToolbar,
    setShowBottomToolbar,
    showWishButton,
    setShowWishButton,
    showGiftQR,
    setShowGiftQR,
    showRSVP,
    setShowRSVP,
    draft,
  } = useEditor();

  if (selectedCanvasElement) {
    return <CanvasElementInspector element={selectedCanvasElement} />;
  }

  if (!selectedField) {
    return <DefaultInspector />;
  }

  const val = getFieldValue(selectedField);

  return (
    <aside className="w-72 sm:w-80 bg-white border-l border-stone-200 flex flex-col justify-between h-full select-none shrink-0 shadow-xs z-20">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Thuộc Tính
            </span>
            <h3 className="text-sm font-bold text-stone-900 truncate max-w-[200px]">
              {selectedField.label}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Đóng thuộc tính"
            onClick={() => selectField(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content based on field type */}
        {selectedField.type === "text" && (
          <TextInspector field={selectedField} value={val} onChange={(next) => updateFieldValue(selectedField, next)} />
        )}

        {selectedField.type === "image" && (
          <ImageInspector field={selectedField} value={val} onChange={(next) => updateFieldValue(selectedField, next)} />
        )}

        {selectedField.type === "color" && (
          <ColorInspector field={selectedField} value={val} onChange={(next) => updateFieldValue(selectedField, next)} />
        )}

        {(selectedField.type === "font" || selectedField.type === "effect") && (
          <SelectInspector
            field={selectedField}
            value={val}
            onChange={(next) => updateFieldValue(selectedField, next)}
            isVip={isVip}
          />
        )}
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <button
          type="button"
          onClick={triggerSave}
          disabled={saveState === "saving"}
          className="w-full min-h-11 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {saveState === "saving" ? "Đang lưu..." : "Lưu Bản Nháp"}
        </button>
      </div>
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────
// 1. DEFAULT INSPECTOR (When no element is selected)
// ────────────────────────────────────────────────────────────────

function DefaultInspector() {
  const {
    showBottomToolbar,
    setShowBottomToolbar,
    showWishButton,
    setShowWishButton,
    showGiftQR,
    setShowGiftQR,
    showRSVP,
    setShowRSVP,
    triggerSave,
    saveState,
    draft,
    updateFieldById,
  } = useEditor();

  const [wishTab, setWishTab] = useState<"content" | "public" | "private">("content");
  const [expandWish, setExpandWish] = useState(true);
  const [expandColor, setExpandColor] = useState(false);

  const cardSlug = (draft as any).slug || "";

  return (
    <aside className="w-72 sm:w-80 bg-white border-l border-stone-200 flex flex-col justify-between h-full select-none shrink-0 shadow-xs z-20">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
            Thuộc Tính Thiệp
          </span>
          <p className="text-xs text-stone-500 mt-0.5">
            Kích đúp vào văn bản hoặc ảnh trên thiệp để chỉnh sửa nhanh.
          </p>
        </div>

        {/* Share Link */}
        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-amber-700" />
            <span className="text-xs font-bold text-amber-950">Thiệp cưới online</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Khách mời có thể xem trên điện thoại và gửi lời chúc trực tiếp:
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-800 bg-white px-2 py-1.5 rounded-lg border border-amber-200 truncate">
            /thiep/{cardSlug || "..."}
          </div>
        </div>

        {/* Bottom Toolbar Toggles */}
        <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">Thanh công cụ dưới</span>
            <button
              type="button"
              onClick={() => setShowBottomToolbar((v) => !v)}
              className="text-stone-700 cursor-pointer"
            >
              {showBottomToolbar ? (
                <ToggleRight className="size-6 text-amber-600" />
              ) : (
                <ToggleLeft className="size-6 text-stone-300" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-stone-400">
            Hiển thị thanh công cụ tiện ích ở góc dưới màn hình khi khách xem thiệp.
          </p>

          {showBottomToolbar && (
            <div className="space-y-2 pt-2 border-t border-stone-200/80">
              {/* Lời chúc */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-stone-700">Lời chúc</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWishButton((v) => !v)}
                  className="cursor-pointer"
                >
                  {showWishButton ? (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">BẬT</span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">TẮT</span>
                  )}
                </button>
              </div>

              {/* Hộp quà / QR */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-semibold text-stone-700">Hộp quà / QR</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGiftQR((v) => !v)}
                  className="cursor-pointer"
                >
                  {showGiftQR ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">BẬT</span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">TẮT</span>
                  )}
                </button>
              </div>

              {/* RSVP */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-stone-700">RSVP Tham dự</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRSVP((v) => !v)}
                  className="cursor-pointer"
                >
                  {showRSVP ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">BẬT</span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">TẮT</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cài đặt lời chúc */}
        <div className="rounded-2xl border border-stone-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandWish((v) => !v)}
            className="w-full p-3 bg-stone-50 flex items-center justify-between text-xs font-bold text-stone-800 cursor-pointer"
          >
            <span>Cài đặt lời chúc</span>
            {expandWish ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {expandWish && (
            <div className="p-3 space-y-2 bg-white">
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-stone-100 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setWishTab("content")}
                  className={`py-1 rounded cursor-pointer ${
                    wishTab === "content" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"
                  }`}
                >
                  Nội dung
                </button>
                <button
                  type="button"
                  onClick={() => setWishTab("public")}
                  className={`py-1 rounded cursor-pointer ${
                    wishTab === "public" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"
                  }`}
                >
                  Công khai
                </button>
                <button
                  type="button"
                  onClick={() => setWishTab("private")}
                  className={`py-1 rounded cursor-pointer ${
                    wishTab === "private" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"
                  }`}
                >
                  Kiểm duyệt
                </button>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                {wishTab === "content" && "Cho phép khách mời để lại lời chúc mừng và gửi ảnh trực tiếp trên thiệp."}
                {wishTab === "public" && "Tất cả khách mời đều nhìn thấy lời chúc của nhau trên sổ lưu bút."}
                {wishTab === "private" && "Chỉ hiển thị lời chúc sau khi được cô dâu chú rể duyệt."}
              </p>
            </div>
          )}
        </div>

        {/* Tùy chỉnh màu sắc nhanh */}
        <div className="rounded-2xl border border-stone-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandColor((v) => !v)}
            className="w-full p-3 bg-stone-50 flex items-center justify-between text-xs font-bold text-stone-800 cursor-pointer"
          >
            <span>Tùy chỉnh màu sắc</span>
            {expandColor ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {expandColor && (
            <div className="p-3 space-y-2 bg-white">
              <div className="grid grid-cols-6 gap-1.5">
                {["#BE944E", "#8B1E2D", "#B76E79", "#2D5A27", "#4169A1", "#1F2937"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateFieldById("primary-color", c)}
                    className="w-8 h-8 rounded-full border border-black/10 shadow-2xs transition hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <button
          type="button"
          onClick={triggerSave}
          disabled={saveState === "saving"}
          className="w-full min-h-11 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {saveState === "saving" ? "Đang lưu..." : "Lưu Bản Nháp"}
        </button>
      </div>
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────
// 2. TEXT INSPECTOR
// ────────────────────────────────────────────────────────────────

function TextInspector({
  field,
  value,
  onChange,
}: {
  field: EditorField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right" | "justify">("center");
  const [fontSize, setFontSize] = useState<number>(field.defaultFontSize || 16);
  const [opacity, setOpacity] = useState<number>(1);

  const textVal = typeof value === "string" ? value : "";

  return (
    <div className="space-y-4">
      {/* Kiểu chữ */}
      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-1.5">Kiểu chữ</label>
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setIsBold((v) => !v)}
            className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              isBold ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
            }`}
            title="Đậm"
          >
            <Bold className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsItalic((v) => !v)}
            className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              isItalic ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
            }`}
            title="Nghiêng"
          >
            <Italic className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsUnderline((v) => !v)}
            className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              isUnderline ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
            }`}
            title="Gạch chân"
          >
            <Underline className="size-4" />
          </button>
        </div>
      </div>

      {/* Căn chỉnh */}
      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-1.5">Căn chỉnh</label>
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setAlign("left")}
            className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition cursor-pointer ${
              align === "left" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"
            }`}
          >
            <AlignLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setAlign("center")}
            className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition cursor-pointer ${
              align === "center" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"
            }`}
          >
            <AlignCenter className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setAlign("right")}
            className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition cursor-pointer ${
              align === "right" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"
            }`}
          >
            <AlignRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setAlign("justify")}
            className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition cursor-pointer ${
              align === "justify" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500"
            }`}
          >
            <AlignJustify className="size-4" />
          </button>
        </div>
      </div>

      {/* Cỡ chữ */}
      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-1.5">Cỡ chữ (px)</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            className="w-9 h-9 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          >
            -
          </button>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="flex-1 h-9 rounded-xl border border-stone-200 text-center font-bold text-xs"
          />
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(72, s + 1))}
            className="w-9 h-9 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Độ trong suốt (Opacity) */}
      <div>
        <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1.5">
          <span>Trong suốt</span>
          <span className="font-mono text-stone-500">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer"
        />
      </div>

      {/* Nội dung text */}
      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
          Nội dung văn bản:
        </label>
        <textarea
          value={textVal}
          maxLength={field.maxLength}
          onChange={(e) => onChange(e.target.value)}
          rows={field.maxLength && field.maxLength > 150 ? 4 : 2}
          className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none leading-relaxed shadow-2xs"
          placeholder={`Nhập ${field.label.toLowerCase()}...`}
        />
        {field.maxLength && (
          <div className="text-right text-[10px] text-stone-400 mt-1">
            {textVal.length}/{field.maxLength} ký tự
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 3. IMAGE INSPECTOR
// ────────────────────────────────────────────────────────────────

function ImageInspector({
  field,
  value,
  onChange,
}: {
  field: EditorField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [opacity, setOpacity] = useState(1);

  const imgUrl = typeof value === "string" ? value : "";

  const handleChoose = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Dung lượng ảnh tối đa 10MB");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const url = await uploadSingleImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner flex items-center justify-center relative">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={field.label}
            className="w-full h-full object-cover"
            style={{ opacity }}
          />
        ) : (
          <div className="text-center p-4 text-stone-400 space-y-1">
            <ImageIcon className="size-8 mx-auto stroke-1" />
            <p className="text-xs">Chưa có ảnh</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          void handleChoose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1 min-h-10 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-stone-800 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <UploadCloud className="size-4" />
          <span>{uploading ? "Đang tải..." : "Thay Ảnh Mới"}</span>
        </button>

        {imgUrl && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-10 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
            title="Xóa ảnh"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      {/* Opacity slider */}
      <div>
        <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1.5">
          <span>Trong suốt</span>
          <span className="font-mono text-stone-500">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer"
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 4. COLOR INSPECTOR
// ────────────────────────────────────────────────────────────────

function ColorInspector({
  field,
  value,
  onChange,
}: {
  field: EditorField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const current = typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : "#BE944E";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-2">Bảng màu nhanh</label>
        <div className="grid grid-cols-4 gap-2">
          {["#BE944E", "#8B1E2D", "#B76E79", "#751624", "#2D5A27", "#4169A1", "#1F2937", "#D4AF37"].map(
            (c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                className="h-10 rounded-xl border border-black/10 shadow-2xs transition hover:scale-105 flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: c }}
              >
                {current.toLowerCase() === c.toLowerCase() && (
                  <Check className="size-4 text-white drop-shadow" />
                )}
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold text-stone-600 block mb-1.5">Chọn màu tùy ý</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl border border-stone-300 p-0.5 cursor-pointer bg-white"
          />
          <input
            type="text"
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 h-10 rounded-xl border border-stone-300 px-3 text-xs font-mono font-bold uppercase text-stone-800"
          />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 5. SELECT INSPECTOR (Font / Effect)
// ────────────────────────────────────────────────────────────────

function SelectInspector({
  field,
  value,
  onChange,
  isVip,
}: {
  field: EditorField;
  value: unknown;
  onChange: (value: unknown) => void;
  isVip: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-stone-600 block">Lựa chọn kiểu:</label>
      <select
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-800 focus:border-amber-500 focus:outline-none cursor-pointer"
      >
        <option value="">Mặc định của mẫu thiệp</option>
        {field.allowedValues
          ?.filter((option) => isVip || !["GATE_OPEN", "GIFT_BOX", "BALLOON"].includes(option))
          .map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 6. CANVAS ELEMENT INSPECTOR (WYSIWYG Free Drag Elements)
// ────────────────────────────────────────────────────────────────

function PresetImageUploader({
  label,
  currentUrl,
  onImageChange,
  isCircular = false,
}: {
  label: string;
  currentUrl?: string;
  onImageChange: (url: string) => void;
  isCircular?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadSingleImage(file);
      if (url) onImageChange(url);
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl border border-stone-200 shadow-2xs">
      <div className={`size-12 overflow-hidden bg-white border border-stone-200 shrink-0 flex items-center justify-center ${isCircular ? "rounded-full" : "rounded-lg"}`}>
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="size-5 text-stone-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-bold text-stone-700 block truncate">{label}</span>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-[10px] font-semibold text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 shadow-2xs"
        >
          <UploadCloud className="size-3 text-amber-700" />
          {isUploading ? "Đang tải..." : "Đổi ảnh"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

function CanvasElementInspector({ element }: { element: CanvasElement }) {
  const {
    updateCanvasElement,
    selectElement,
    setActiveTool,
    triggerSave,
    saveState,
    draft,
    reorderElementLayer,
    duplicateCanvasElement,
    removeCanvasElement,
  } = useEditor();
  const [expandColor, setExpandColor] = useState(true);
  const [expandPadding, setExpandPadding] = useState(false);
  const [expandFlip, setExpandFlip] = useState(false);
  const [expandBorder, setExpandBorder] = useState(false);
  const [expandShadow, setExpandShadow] = useState(false);
  const [expandLink, setExpandLink] = useState(false);
  const [expandMotion, setExpandMotion] = useState(false);
  const [expandLoopMotion, setExpandLoopMotion] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const handleWidthChange = (newWidth: number) => {
    const clampedW = Math.max(20, Math.min(390, Math.round(newWidth)));
    const ratio = clampedW / Math.max(1, element.width);
    const newHeight = keepAspectRatio ? Math.max(10, Math.round(element.height * ratio)) : element.height;
    const patch: Partial<CanvasElement> = { width: clampedW, height: newHeight };
    if (element.type === "sticker" || element.type === "stock" || element.type === "text") {
      patch.fontSize = Math.max(10, Math.min(260, Math.round((element.fontSize || 40) * ratio)));
    }
    updateCanvasElement(element.id, patch);
  };

  const handleHeightChange = (newHeight: number) => {
    const clampedH = Math.max(10, Math.min(1200, Math.round(newHeight)));
    const ratio = clampedH / Math.max(1, element.height);
    const newWidth = keepAspectRatio ? Math.max(20, Math.min(390, Math.round(element.width * ratio))) : element.width;
    const patch: Partial<CanvasElement> = { width: newWidth, height: clampedH };
    if (element.type === "sticker" || element.type === "stock" || element.type === "text") {
      patch.fontSize = Math.max(10, Math.min(260, Math.round((element.fontSize || 40) * ratio)));
    }
    updateCanvasElement(element.id, patch);
  };

  const handleScaleMultiplier = (multiplier: number) => {
    const newW = Math.max(20, Math.min(390, Math.round(element.width * multiplier)));
    const newH = Math.max(10, Math.min(1200, Math.round(element.height * multiplier)));
    const patch: Partial<CanvasElement> = { width: newW, height: newH };
    if (element.type === "sticker" || element.type === "stock" || element.type === "text") {
      patch.fontSize = Math.max(10, Math.min(260, Math.round((element.fontSize || 40) * multiplier)));
    }
    updateCanvasElement(element.id, patch);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  const updateCustomData = (patch: Record<string, any>) => {
    updateCanvasElement(element.id, {
      customData: {
        ...(element.customData || {}),
        ...patch,
      },
    });
  };

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadSingleImage(file);
      if (url) {
        updateCustomData({ qrUrl: url });
      }
    } catch (err) {
      console.error("Lỗi tải mã QR:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadSingleImage(file);
      if (url) {
        updateCanvasElement(element.id, { imageUrl: url, content: url });
      }
    } catch (err) {
      console.error("Lỗi đổi ảnh:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const FONT_OPTIONS = [
    { label: "Playfair Display", value: "Playfair Display" },
    { label: "Great Vibes", value: "Great Vibes" },
    { label: "Cormorant Garamond", value: "Cormorant Garamond" },
    { label: "Montserrat", value: "Montserrat" },
    { label: "Cinzel", value: "Cinzel" },
    { label: "Dancing Script", value: "Dancing Script" },
    { label: "Alex Brush", value: "Alex Brush" },
    { label: "Be Vietnam Pro", value: "Be Vietnam Pro" },
  ];

  const previewThumbnail =
    element.presetId === "p-envelope-pink" || element.presetId === "p1"
      ? "/images/demo/envelope-pink-thumb.png"
      : element.imageUrl || element.content;

  const isTextElement = element.type === "text";
  const isStockElement = element.type === "stock" || element.type === "sticker";

  return (
    <aside className="w-72 sm:w-80 bg-white border-l border-stone-200 flex flex-col justify-between h-full select-none shrink-0 shadow-xs z-20">
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Header chuẩn ảnh mẫu: THUỘC TÍNH */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              THUỘC TÍNH
            </h3>
            <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
              {element.title || (isTextElement ? "Văn bản" : "Thành phần thiết kế")}
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng thuộc tính"
            onClick={() => selectElement(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── THUMBNAIL PREVIEW & NÚT ĐỔI STOCK / ĐỔI ẢNH (KHỚP 100% ẢNH MẪU) ── */}
        {element.type === "widget" && <WidgetInspector element={element} />}
        {!isTextElement && element.type !== "widget" && (
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            {/* Visual Thumbnail */}
            <div className="w-full h-28 rounded-xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center relative shadow-xs p-2">
              {element.presetId === "p-envelope-pink" || element.presetId === "p1" ? (
                <div className="w-20 h-14 bg-[#F294A6] rounded-md relative shadow-sm flex items-center justify-center border border-pink-300">
                  <div className="absolute -top-3 w-16 h-8 bg-[#EFA0AF] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
                  <div className="size-3.5 rounded-full bg-pink-600 border border-white text-[5px] text-white flex items-center justify-center font-bold">ML</div>
                </div>
              ) : element.stockId === "w1" || element.title?.includes("nến") ? (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 100 120" className="h-full object-contain drop-shadow">
                    <ellipse cx="50" cy="112" rx="20" ry="5" fill="#8BB8D4" />
                    <rect x="47" y="55" width="6" height="57" rx="3" fill="#8BB8D4" />
                    <path d="M 25 70 Q 25 90 50 90 Q 75 90 75 70" stroke="#8BB8D4" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <rect x="22" y="45" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1.5" />
                    <rect x="47" y="32" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1.5" />
                    <rect x="72" y="45" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1.5" />
                    <ellipse cx="25" cy="38" rx="3" ry="6" fill="#F59E0B" />
                    <ellipse cx="50" cy="25" rx="3.5" ry="7" fill="#F59E0B" />
                    <ellipse cx="75" cy="38" rx="3" ry="6" fill="#F59E0B" />
                  </svg>
                </div>
              ) : element.svgContent ? (
                <div
                  className="w-full h-full flex items-center justify-center p-2"
                  style={{ color: element.color || "#BE944E" }}
                  dangerouslySetInnerHTML={{ __html: element.svgContent }}
                />
              ) : previewThumbnail && (previewThumbnail.startsWith("http") || previewThumbnail.startsWith("/")) ? (
                <img
                  src={previewThumbnail}
                  alt={element.title || "Phần tử"}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-3xl">{element.content || "✨"}</span>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Action Buttons */}
            {isStockElement ? (
              <button
                type="button"
                onClick={() => setActiveTool("stock")}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-2xs transition cursor-pointer text-center"
              >
                Đổi stock
              </button>
            ) : (element.type === "image" || Boolean(element.imageUrl)) ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowCropModal(true)}
                  className="py-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-2xs transition cursor-pointer text-center"
                >
                  Cắt ảnh
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-amber-800 text-xs font-semibold shadow-2xs transition cursor-pointer text-center disabled:opacity-50"
                >
                  {isUploading ? "Đang tải..." : "Đổi ảnh"}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA THÔNG TIN CHO PRESET MỪNG CƯỚI & QR (p-wedding-gift-luxury) ── */}
        {element.presetId === "p-wedding-gift-luxury" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-stone-200">
              <QrCode className="size-4 text-amber-700" />
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Cài đặt Mừng Cưới & Mã QR
              </span>
            </div>

            {/* Chú rể */}
            <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                🤵 Tài khoản Chú Rể
              </span>
              <input
                type="text"
                placeholder="Tên chú rể (VD: Minh Khôi)"
                value={element.customData?.groomName ?? ""}
                onChange={(e) => updateCustomData({ groomName: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Ngân hàng (Vietcombank...)"
                  value={element.customData?.groomBank ?? ""}
                  onChange={(e) => updateCustomData({ groomBank: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50"
                />
                <input
                  type="text"
                  placeholder="Số tài khoản"
                  value={element.customData?.groomAccount ?? ""}
                  onChange={(e) => updateCustomData({ groomAccount: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50 font-mono font-medium"
                />
              </div>
            </div>

            {/* Cô dâu */}
            <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                👰 Tài khoản Cô Dâu
              </span>
              <input
                type="text"
                placeholder="Tên cô dâu (VD: Ngọc Hân)"
                value={element.customData?.brideName ?? ""}
                onChange={(e) => updateCustomData({ brideName: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Ngân hàng (Techcombank...)"
                  value={element.customData?.brideBank ?? ""}
                  onChange={(e) => updateCustomData({ brideBank: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50"
                />
                <input
                  type="text"
                  placeholder="Số tài khoản"
                  value={element.customData?.brideAccount ?? ""}
                  onChange={(e) => updateCustomData({ brideAccount: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50 font-mono font-medium"
                />
              </div>
            </div>

            {/* Ảnh QR Tùy chỉnh */}
            <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-700 block">
                📷 Ảnh Mã QR (Tùy chọn)
              </span>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                Hệ thống tự động sinh mã VietQR theo số tài khoản ở trên. Nếu muốn dùng mã QR riêng (MoMo, ZaloPay, QR ngân hàng có logo), bạn hãy tải ảnh lên:
              </p>
              <input
                type="file"
                ref={qrFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleQrImageUpload}
              />
              <div className="flex gap-2 items-center pt-1">
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  {isUploading ? "Đang tải..." : "Tải ảnh QR lên"}
                </button>
                {element.customData?.qrUrl && (
                  <button
                    type="button"
                    onClick={() => updateCustomData({ qrUrl: undefined })}
                    className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Dùng lại VietQR tự động
                  </button>
                )}
              </div>
            </div>

            {/* Lời nhắn mừng cưới */}
            <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-700 block">
                ✍️ Lời mời mừng cưới
              </span>
              <input
                type="text"
                placeholder="Tiêu đề (MỪNG CƯỚI)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50"
              />
              <textarea
                rows={3}
                placeholder="Lời nhắn gửi khách mời"
                value={element.customData?.message ?? ""}
                onChange={(e) => updateCustomData({ message: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 bg-stone-50/50"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA THÔNG TIN CHO PHONG BÌ SÁP SONG HỶ (p-envelope-songhy) ── */}
        {element.presetId === "p-envelope-songhy" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              💌 Chữ trên thiệp phong bì
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Tên Chú Rể"
                  value={element.customData?.groomName ?? ""}
                  onChange={(e) => updateCustomData({ groomName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tên Cô Dâu"
                  value={element.customData?.brideName ?? ""}
                  onChange={(e) => updateCustomData({ brideName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
              </div>
              <input
                type="text"
                placeholder="Ngày cưới (VD: 28 • 12 • 2026)"
                value={element.customData?.dateStr ?? ""}
                onChange={(e) => updateCustomData({ dateStr: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono"
              />
              <input
                type="text"
                placeholder="Tiêu đề (Save Our Date / THIỆP MỜI)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA THÔNG TIN CHO LỄ THÀNH HÔN (p-le-thanh-hon) ── */}
        {element.presetId === "p-le-thanh-hon" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              💒 Thông tin Lễ Thành Hôn
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Tiêu đề (LỄ THÀNH HÔN & NHẬP TIỆC)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <input
                type="text"
                placeholder="Thời gian (VD: 11:00 • 18 Tháng 12, 2026)"
                value={element.customData?.timeStr ?? ""}
                onChange={(e) => updateCustomData({ timeStr: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <input
                type="text"
                placeholder="Ngày âm lịch (VD: Nhằm ngày 10 tháng 11 năm Bính Ngọ)"
                value={element.customData?.lunarStr ?? ""}
                onChange={(e) => updateCustomData({ lunarStr: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <input
                type="text"
                placeholder="Địa điểm (VD: Tại Tư gia Nhà Trai / Khách sạn Melia)"
                value={element.customData?.venueStr ?? ""}
                onChange={(e) => updateCustomData({ venueStr: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <input
                type="text"
                placeholder="Lời cảm ơn chân trang (Hân hạnh được đón tiếp quý khách!)"
                value={element.customData?.footerNote ?? ""}
                onChange={(e) => updateCustomData({ footerNote: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO CHÂN DUNG ĐÔI (p-groom-bride-duo) ── */}
        {element.presetId === "p-groom-bride-duo" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              👥 Chân dung Chú Rể & Cô Dâu
            </span>

            {/* Chú rể */}
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-700 block">🤵 Chú Rể</span>
              <PresetImageUploader
                label="Ảnh Chú Rể"
                currentUrl={element.customData?.groomPhoto || element.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"}
                onImageChange={(url) => updateCustomData({ groomPhoto: url })}
                isCircular
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Nhãn (GROOM)"
                  value={element.customData?.groomLabel ?? "GROOM"}
                  onChange={(e) => updateCustomData({ groomLabel: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Tên Chú Rể"
                  value={element.customData?.groomName ?? ""}
                  onChange={(e) => updateCustomData({ groomName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
                />
              </div>
            </div>

            {/* Cô dâu */}
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-pink-700 block">👰 Cô Dâu</span>
              <PresetImageUploader
                label="Ảnh Cô Dâu"
                currentUrl={element.customData?.bridePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                onImageChange={(url) => updateCustomData({ bridePhoto: url })}
                isCircular
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Nhãn (BRIDE)"
                  value={element.customData?.brideLabel ?? "BRIDE"}
                  onChange={(e) => updateCustomData({ brideLabel: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Tên Cô Dâu"
                  value={element.customData?.brideName ?? ""}
                  onChange={(e) => updateCustomData({ brideName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO THƯ MỜI WEDDING TYPOGRAPHY (p-wedding-typography) ── */}
        {element.presetId === "p-wedding-typography" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              ✍️ Thư Mời Typography
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Nhãn tiêu đề (WEDDING)"
                value={element.customData?.tag ?? ""}
                onChange={(e) => updateCustomData({ tag: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Tên Chú Rể"
                  value={element.customData?.groomName ?? ""}
                  onChange={(e) => updateCustomData({ groomName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tên Cô Dâu"
                  value={element.customData?.brideName ?? ""}
                  onChange={(e) => updateCustomData({ brideName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
              </div>
              <input
                type="text"
                placeholder="Tiêu đề chính (THƯ MỜI TIỆC CƯỚI)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Phụ đề (HÔN LỄ TRANG TRỌNG)"
                  value={element.customData?.subtitle ?? ""}
                  onChange={(e) => updateCustomData({ subtitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
                <input
                  type="text"
                  placeholder="Năm (VD: 2026)"
                  value={element.customData?.yearStr ?? ""}
                  onChange={(e) => updateCustomData({ yearStr: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO THIỆP SONG HỶ ĐỎ (p-song-hy-red) ── */}
        {element.presetId === "p-song-hy-red" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              囍 Thiệp Song Hỷ Đỏ Á Đông
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Thẻ đầu (LỄ THÀNH HÔN)"
                value={element.customData?.tag ?? ""}
                onChange={(e) => updateCustomData({ tag: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Tên Chú Rể"
                  value={element.customData?.groomName ?? ""}
                  onChange={(e) => updateCustomData({ groomName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tên Cô Dâu"
                  value={element.customData?.brideName ?? ""}
                  onChange={(e) => updateCustomData({ brideName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
              </div>
              <input
                type="text"
                placeholder="Câu đề chúc (TRĂM NĂM TÌNH VIÊN MÃN)"
                value={element.customData?.subtitle ?? ""}
                onChange={(e) => updateCustomData({ subtitle: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif font-bold"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Câu đối trái (DUYÊN NỢ BA SINH)"
                  value={element.customData?.leftFooter ?? ""}
                  onChange={(e) => updateCustomData({ leftFooter: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Câu đối phải (HẠNH PHÚC TRỌN ĐỜI)"
                  value={element.customData?.rightFooter ?? ""}
                  onChange={(e) => updateCustomData({ rightFooter: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO HÔN PHỐI HAI HỌ (p-parents-info / p4) ── */}
        {(element.presetId === "p-parents-info" || element.presetId === "p4") && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              👨‍👩‍👧‍👦 Hôn Phối Hai Họ
            </span>
            <div className="space-y-2.5 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Tiêu đề khối (Hôn Phối Hai Họ)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              {/* Nhà Trai */}
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-700 block">NHÀ TRAI</span>
                <input
                  type="text"
                  placeholder="Thân phụ (Ông: Nguyễn Văn A)"
                  value={element.customData?.gFather ?? ""}
                  onChange={(e) => updateCustomData({ gFather: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-blue-500"
                />
                <input
                  type="text"
                  placeholder="Thân mẫu (Bà: Trần Thị B)"
                  value={element.customData?.gMother ?? ""}
                  onChange={(e) => updateCustomData({ gMother: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-blue-500"
                />
              </div>
              {/* Nhà Gái */}
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/70 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-700 block">NHÀ GÁI</span>
                <input
                  type="text"
                  placeholder="Thân phụ (Ông: Lê Văn C)"
                  value={element.customData?.bFather ?? ""}
                  onChange={(e) => updateCustomData({ bFather: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-blue-500"
                />
                <input
                  type="text"
                  placeholder="Thân mẫu (Bà: Phạm Thị D)"
                  value={element.customData?.bMother ?? ""}
                  onChange={(e) => updateCustomData({ bMother: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-stone-200 bg-white focus:outline-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO ĐỊA ĐIỂM & BẢN ĐỒ (p-venue-map) ── */}
        {element.presetId === "p-venue-map" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              📍 Địa Điểm Tiệc Cưới & Bản Đồ
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Thẻ (ĐỊA ĐIỂM TỔ CHỨC)"
                value={element.customData?.tag ?? ""}
                onChange={(e) => updateCustomData({ tag: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <input
                type="text"
                placeholder="Tên địa điểm (White Palace Convention Center)"
                value={element.customData?.venueName ?? ""}
                onChange={(e) => updateCustomData({ venueName: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <input
                type="text"
                placeholder="Sảnh tiệc (Sảnh Grand Hall • Tầng 2)"
                value={element.customData?.hallName ?? ""}
                onChange={(e) => updateCustomData({ hallName: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <textarea
                rows={2}
                placeholder="Địa chỉ chi tiết"
                value={element.customData?.address ?? ""}
                onChange={(e) => updateCustomData({ address: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <PresetImageUploader
                label="Mã QR Chỉ Đường Google Maps"
                currentUrl={element.customData?.qrUrl || "https://api.vietqr.io/image/970422-0988888888-compact2.jpg?amount=0&addInfo=ChiDuong"}
                onImageChange={(url) => updateCustomData({ qrUrl: url })}
              />
              <input
                type="text"
                placeholder="Ghi chú dưới QR (QUÉT MỞ MAPS)"
                value={element.customData?.qrNote ?? ""}
                onChange={(e) => updateCustomData({ qrNote: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO THỰC ĐƠN TIỆC CƯỚI (p-wedding-menu) ── */}
        {element.presetId === "p-wedding-menu" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              🍽️ Thực Đơn Bàn Tiệc
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Tiêu đề (THỰC ĐƠN TIỆC CƯỚI)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <input
                type="text"
                placeholder="Tiêu đề phụ (WEDDING BANQUET MENU)"
                value={element.customData?.subtitle ?? ""}
                onChange={(e) => updateCustomData({ subtitle: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
              />
              <div className="space-y-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Món ${i}...`}
                    value={element.customData?.[`dish${i}`] ?? ""}
                    onChange={(e) => updateCustomData({ [`dish${i}`]: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                  />
                ))}
              </div>
              <input
                type="text"
                placeholder="Lời chúc cuối (Chúc quý khách ngon miệng!)"
                value={element.customData?.footerNote ?? ""}
                onChange={(e) => updateCustomData({ footerNote: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO LỊCH KHOANH TRÒN (p-calendar-countdown) ── */}
        {element.presetId === "p-calendar-countdown" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              📅 Lịch Ngày Cưới
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Dòng chữ chào mừng"
                value={element.customData?.header ?? ""}
                onChange={(e) => updateCustomData({ header: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif"
              />
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Ngày khoanh</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={element.customData?.selectedDay ?? 12}
                    onChange={(e) => updateCustomData({ selectedDay: Number(e.target.value) || 1 })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Tháng</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={element.customData?.month ?? 12}
                    onChange={(e) => updateCustomData({ month: Number(e.target.value) || 1 })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Năm</label>
                  <input
                    type="number"
                    value={element.customData?.year ?? 2026}
                    onChange={(e) => updateCustomData({ year: Number(e.target.value) || 2026 })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono font-bold"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Lời nhắn dưới lịch"
                value={element.customData?.note ?? ""}
                onChange={(e) => updateCustomData({ note: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO ĐẾM NGƯỢC (p-wedding-countdown) ── */}
        {element.presetId === "p-wedding-countdown" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              ⏳ Đếm Ngược Ngày Cưới
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Tiêu đề (CÙNG ĐẾM NGƯỢC THỜI GIAN)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <input
                type="text"
                placeholder="Lời dẫn"
                value={element.customData?.subtitle ?? ""}
                onChange={(e) => updateCustomData({ subtitle: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="text-[9px] text-stone-400 block">Ngày</label>
                  <input
                    type="text"
                    value={element.customData?.days ?? "28"}
                    onChange={(e) => updateCustomData({ days: e.target.value })}
                    className="w-full px-2 py-1 text-xs text-center rounded border border-stone-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-stone-400 block">Giờ</label>
                  <input
                    type="text"
                    value={element.customData?.hours ?? "14"}
                    onChange={(e) => updateCustomData({ hours: e.target.value })}
                    className="w-full px-2 py-1 text-xs text-center rounded border border-stone-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-stone-400 block">Phút</label>
                  <input
                    type="text"
                    value={element.customData?.mins ?? "35"}
                    onChange={(e) => updateCustomData({ mins: e.target.value })}
                    className="w-full px-2 py-1 text-xs text-center rounded border border-stone-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-stone-400 block">Giây</label>
                  <input
                    type="text"
                    value={element.customData?.secs ?? "59"}
                    onChange={(e) => updateCustomData({ secs: e.target.value })}
                    className="w-full px-2 py-1 text-xs text-center rounded border border-stone-200 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Lời nhắn kết"
                value={element.customData?.footerNote ?? ""}
                onChange={(e) => updateCustomData({ footerNote: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO LỊCH TRÌNH TIỆC (p-timeline-flow / p3) ── */}
        {(element.presetId === "p-timeline-flow" || element.presetId === "p3") && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              🕒 Lịch Trình Hôn Lễ
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={element.customData?.title ?? ""}
                  onChange={(e) => updateCustomData({ title: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
                />
                <input
                  type="text"
                  placeholder="Phụ đề"
                  value={element.customData?.subtitle ?? ""}
                  onChange={(e) => updateCustomData({ subtitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
                />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-1.5">
                  <input
                    type="text"
                    placeholder="Giờ"
                    value={element.customData?.[`item${i}Time`] ?? (i === 1 ? "17:30" : i === 2 ? "18:00" : i === 3 ? "18:30" : "19:30")}
                    onChange={(e) => updateCustomData({ [`item${i}Time`]: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-stone-200 focus:outline-blue-500 font-mono font-bold text-amber-800"
                  />
                  <input
                    type="text"
                    placeholder={`Hoạt động ${i}`}
                    value={element.customData?.[`item${i}Label`] ?? (i === 1 ? "Đón Khách" : i === 2 ? "Làm Lễ" : i === 3 ? "Khai Tiệc" : "Chụp Hình")}
                    onChange={(e) => updateCustomData({ [`item${i}Label`]: e.target.value })}
                    className="col-span-2 w-full px-2 py-1 text-xs rounded border border-stone-200 focus:outline-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO DRESS CODE (p-dress-code) ── */}
        {element.presetId === "p-dress-code" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              👗 Quy Định Trang Phục (Dress Code)
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Tiêu đề"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <textarea
                rows={2}
                placeholder="Lời dẫn hướng dẫn trang phục"
                value={element.customData?.desc ?? ""}
                onChange={(e) => updateCustomData({ desc: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-stone-500 block">5 Tông màu trang phục:</span>
                {[
                  { id: "c1", defName: "Trắng", defColor: "#FFFFFF" },
                  { id: "c2", defName: "Kem Be", defColor: "#F5E6D3" },
                  { id: "c3", defName: "Pastel", defColor: "#FCE7F3" },
                  { id: "c4", defName: "Xanh Mint", defColor: "#D1FAE5" },
                  { id: "c5", defName: "Nâu ấm", defColor: "#5C3D2E" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={element.customData?.[`${item.id}Color`] ?? item.defColor}
                      onChange={(e) => updateCustomData({ [`${item.id}Color`]: e.target.value })}
                      className="size-7 rounded-lg border border-stone-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      placeholder="Tên màu"
                      value={element.customData?.[`${item.id}Name`] ?? item.defName}
                      onChange={(e) => updateCustomData({ [`${item.id}Name`]: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs rounded border border-stone-200 focus:outline-blue-500"
                    />
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Lời cảm ơn chân trang"
                value={element.customData?.footerNote ?? ""}
                onChange={(e) => updateCustomData({ footerNote: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO POLAROID WASHI (p-polaroid-washi) ── */}
        {element.presetId === "p-polaroid-washi" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              📸 Ảnh Polaroid Kỷ Niệm
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <PresetImageUploader
                label="Ảnh Polaroid"
                currentUrl={element.customData?.photoUrl || element.imageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80"}
                onImageChange={(url) => {
                  updateCustomData({ photoUrl: url });
                  updateCanvasElement(element.id, { imageUrl: url, content: url });
                }}
              />
              <input
                type="text"
                placeholder="Tiêu đề ảnh (Khoảnh Khắc Hạnh Phúc)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif font-bold"
              />
              <input
                type="text"
                placeholder="Phụ đề (Sweet Memories)"
                value={element.customData?.subtitle ?? ""}
                onChange={(e) => updateCustomData({ subtitle: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO POLAROIDS 3 TẤM (p2) ── */}
        {element.presetId === "p2" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              🎞️ Bộ 3 Tấm Ảnh Polaroid
            </span>
            <div className="space-y-2.5">
              {[
                { id: "1", defCaption: "Tình Đầu", defUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&auto=format&fit=crop&q=80" },
                { id: "2", defCaption: "Hẹn Ước", defUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80" },
                { id: "3", defCaption: "Trọn Đời", defUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&auto=format&fit=crop&q=80" },
              ].map((p) => (
                <div key={p.id} className="p-2.5 bg-white rounded-xl border border-stone-200 space-y-1.5">
                  <PresetImageUploader
                    label={`Ảnh ${p.id}`}
                    currentUrl={element.customData?.[`photo${p.id}`] || p.defUrl}
                    onImageChange={(url) => updateCustomData({ [`photo${p.id}`]: url })}
                  />
                  <input
                    type="text"
                    placeholder={`Chú thích ảnh ${p.id}`}
                    value={element.customData?.[`caption${p.id}`] ?? p.defCaption}
                    onChange={(e) => updateCustomData({ [`caption${p.id}`]: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-stone-200 focus:outline-blue-500 font-serif"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO CỔNG VÒM HOÀNG GIA (p-arch-portrait / p1-arch) ── */}
        {(element.presetId === "p-arch-portrait" || element.presetId === "p1-arch") && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              🏛️ Cổng Vòm Chân Dung Hoàng Gia
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <PresetImageUploader
                label="Ảnh Cưới Khung Vòm"
                currentUrl={element.customData?.photoUrl || element.imageUrl || element.content || "/images/demo/couple-cover.png"}
                onImageChange={(url) => {
                  updateCustomData({ photoUrl: url });
                  updateCanvasElement(element.id, { imageUrl: url, content: url });
                }}
              />
              <input
                type="text"
                placeholder="Dòng chữ trên ảnh (HOÀNG GIA Á ĐÔNG)"
                value={element.customData?.caption ?? ""}
                onChange={(e) => updateCustomData({ caption: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO KHUNG VÒM HOA LAN (p-orchid-arch) ── */}
        {element.presetId === "p-orchid-arch" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              🌸 Khung Vòm Hoa Lan Hoàng Gia
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <PresetImageUploader
                label="Ảnh cưới bên trong vòm lan"
                currentUrl={element.imageUrl || element.customData?.photoUrl || "/images/presets/arch-orchid-sample.jpg"}
                onImageChange={(url) => {
                  updateCustomData({ photoUrl: url });
                  updateCanvasElement(element.id, { imageUrl: url, content: url });
                }}
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO PHONG BÌ HỒNG (p-envelope-pink / p-envelope-sweet / p1) ── */}
        {(element.presetId === "p-envelope-pink" || element.presetId === "p-envelope-sweet" || element.presetId === "p1") && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              💌 Phong Bì Hồng Mở Có Thiệp
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <PresetImageUploader
                label="Ảnh Cưới Trong Thiệp"
                currentUrl={element.customData?.photoUrl || element.imageUrl || "/images/demo/templates/t03-sweet-pink/cover.jpg"}
                onImageChange={(url) => {
                  updateCustomData({ photoUrl: url });
                  updateCanvasElement(element.id, { imageUrl: url, content: url });
                }}
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Tên Chú Rể"
                  value={element.customData?.groomName ?? ""}
                  onChange={(e) => updateCustomData({ groomName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tên Cô Dâu"
                  value={element.customData?.brideName ?? ""}
                  onChange={(e) => updateCustomData({ brideName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
                />
              </div>
              <input
                type="text"
                placeholder="Tiêu đề (THIỆP MỜI CƯỚI)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <input
                type="text"
                placeholder="Tiêu đề phụ (WEDDING INVITATION)"
                value={element.customData?.subtitle ?? ""}
                onChange={(e) => updateCustomData({ subtitle: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
              />
              <input
                type="text"
                placeholder="Dòng chạm mở (Chạm để mở thiệp)"
                value={element.customData?.note ?? ""}
                onChange={(e) => updateCustomData({ note: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO PHONG BÌ XANH (p-envelope-green) ── */}
        {element.presetId === "p-envelope-green" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              🌿 Phong Bì Xanh Sáp
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <PresetImageUploader
                label="Ảnh Cưới Trong Phong Bì"
                currentUrl={element.customData?.photoUrl || element.imageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80"}
                onImageChange={(url) => {
                  updateCustomData({ photoUrl: url });
                  updateCanvasElement(element.id, { imageUrl: url, content: url });
                }}
              />
              <input
                type="text"
                placeholder="Tiêu đề (We got married)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif italic"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO NHẪN CƯỚI & LỜI HẸN ƯỚC (p-rings-vow) ── */}
        {element.presetId === "p-rings-vow" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              💍 Cặp Nhẫn Cưới & Lời Thề Nguyện
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Tiêu đề (Lời Thề Nguyện Trăm Năm)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <textarea
                rows={3}
                placeholder="Lời thề ước trăm năm"
                value={element.customData?.vowText ?? ""}
                onChange={(e) => updateCustomData({ vowText: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif italic"
              />
              <input
                type="text"
                placeholder="Dòng kết (FOREVER & ALWAYS)"
                value={element.customData?.footerNote ?? ""}
                onChange={(e) => updateCustomData({ footerNote: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO THƯ CẢM ƠN (p-thank-you-note / p-thank-you-chibi) ── */}
        {(element.presetId === "p-thank-you-note" || element.presetId === "p-thank-you-chibi") && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              💌 Thư Cảm Ơn Quan Khách
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <input
                type="text"
                placeholder="Tiêu đề (THANK YOU FOR COMING)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <textarea
                rows={3}
                placeholder="Lời cảm ơn chân thành"
                value={element.customData?.message ?? ""}
                onChange={(e) => updateCustomData({ message: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
              <input
                type="text"
                placeholder="Ký tên (With Love • Dâu & Rể)"
                value={element.customData?.sign ?? ""}
                onChange={(e) => updateCustomData({ sign: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif italic"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO HỘP MỪNG CƯỚI & QR (p-banking-qr) ── */}
        {element.presetId === "p-banking-qr" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              🎁 Hộp Mừng Cưới & Mã QR
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <PresetImageUploader
                label="Mã QR Mừng Cưới"
                currentUrl={element.customData?.qrUrl || element.imageUrl || "https://api.vietqr.io/image/970422-0988888888-compact2.jpg?amount=0&addInfo=MungCuoi"}
                onImageChange={(url) => {
                  updateCustomData({ qrUrl: url });
                  updateCanvasElement(element.id, { imageUrl: url, content: url });
                }}
              />
              <input
                type="text"
                placeholder="Thẻ (MỪNG CƯỚI ONLINE)"
                value={element.customData?.tag ?? ""}
                onChange={(e) => updateCustomData({ tag: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-mono text-[11px]"
              />
              <input
                type="text"
                placeholder="Tiêu đề (Gửi Lời Chúc & Hồng Bao)"
                value={element.customData?.title ?? ""}
                onChange={(e) => updateCustomData({ title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-bold"
              />
              <textarea
                rows={2}
                placeholder="Lời dẫn hướng dẫn chuyển khoản"
                value={element.customData?.desc ?? ""}
                onChange={(e) => updateCustomData({ desc: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO LỜI NGỎ TRĂM NĂM (p-love-quote) ── */}
        {(element.presetId === "p-love-quote" || (!element.presetId && element.type === "preset")) && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              💬 Lời Ngỏ & Trích Dẫn Yêu Thương
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <textarea
                rows={2}
                placeholder="Câu nói ý nghĩa trăm năm"
                value={element.customData?.quote ?? ""}
                onChange={(e) => updateCustomData({ quote: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500 font-serif italic"
              />
              <input
                type="text"
                placeholder="Lời nhắn kèm theo"
                value={element.customData?.note ?? ""}
                onChange={(e) => updateCustomData({ note: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-blue-500"
              />
            </div>
          </div>
        )}

        {/* ── BỘ CHỈNH SỬA CHO CON DẤU SÁP (p-wax-seal) ── */}
        {element.presetId === "p-wax-seal" && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block pb-1 border-b border-stone-200">
              💮 Ký Tự Con Dấu Sáp
            </span>
            <div className="space-y-2 p-2.5 bg-white rounded-xl border border-stone-200">
              <div>
                <label className="text-[10px] text-stone-500 block mb-1">Chữ cái lồng (Monogram - tối đa 3 ký tự)</label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="ML"
                  value={element.customData?.monogram ?? "ML"}
                  onChange={(e) => updateCustomData({ monogram: e.target.value.toUpperCase() })}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-stone-200 focus:outline-blue-500 font-serif italic font-bold text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BỘ ĐIỀU KHIỂN KÍCH THƯỚC & THU PHÓNG (SIZE & SCALE CONTROLS) ── */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Maximize2 className="size-3.5 text-blue-600" />
              Kích thước & Thu phóng
            </span>
            <button
              type="button"
              onClick={() => setKeepAspectRatio((v) => !v)}
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 transition ${
                keepAspectRatio
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                  : "bg-white border-stone-200 text-stone-500 hover:bg-stone-100"
              }`}
              title="Khóa giữ nguyên tỷ lệ rộng / cao khi co giãn"
            >
              {keepAspectRatio ? <Lock className="size-2.5" /> : <Unlock className="size-2.5" />}
              {keepAspectRatio ? "Khóa tỷ lệ" : "Tự do"}
            </button>
          </div>

          {/* Ô nhập Rộng (W) và Cao (H) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-stone-500 font-medium block mb-1">Rộng (px)</span>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleWidthChange(element.width - 15)}
                  className="px-2 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                  title="Giảm 15px"
                >
                  <Minus className="size-3" />
                </button>
                <input
                  type="number"
                  value={element.width}
                  onChange={(e) => handleWidthChange(Number(e.target.value) || 30)}
                  className="w-full text-center text-xs font-bold font-mono py-1.5 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleWidthChange(element.width + 15)}
                  className="px-2 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                  title="Tăng 15px"
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-stone-500 font-medium block mb-1">Cao (px)</span>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleHeightChange(element.height - 15)}
                  className="px-2 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                  title="Giảm 15px"
                >
                  <Minus className="size-3" />
                </button>
                <input
                  type="number"
                  value={element.height}
                  onChange={(e) => handleHeightChange(Number(e.target.value) || 20)}
                  className="w-full text-center text-xs font-bold font-mono py-1.5 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleHeightChange(element.height + 15)}
                  className="px-2 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                  title="Tăng 15px"
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Nút thu phóng nhanh theo % */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium mb-1.5">
              <span>Thu phóng nhanh:</span>
              <span className="text-blue-600 font-semibold">{element.width} × {element.height} px</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-[11px]">
              {[
                { label: "−25%", ratio: 0.75 },
                { label: "−10%", ratio: 0.9 },
                { label: "100%", ratio: 1.0 },
                { label: "+10%", ratio: 1.1 },
                { label: "+25%", ratio: 1.25 },
              ].map((scaleOpt) => (
                <button
                  key={scaleOpt.label}
                  type="button"
                  onClick={() => handleScaleMultiplier(scaleOpt.ratio)}
                  className="py-1 rounded-lg border border-stone-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-stone-700 font-semibold text-center transition cursor-pointer text-[10px]"
                >
                  {scaleOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TEXT EDITING CONTROLS (NẾU LÀ VĂN BẢN) ── */}
        {isTextElement && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Nội dung văn bản</label>
              <textarea
                rows={2}
                value={element.content}
                onChange={(e) => updateCanvasElement(element.id, { content: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 resize-none font-sans"
                placeholder="Nhập nội dung chữ..."
              />
            </div>

            {/* Kiểu chữ */}
            <div>
              <span className="text-[11px] font-bold text-stone-600 block mb-1">Kiểu chữ & Căn lề</span>
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { isBold: !element.isBold })}
                  className={`p-1.5 rounded-lg text-xs font-bold transition ${
                    element.isBold ? "bg-white text-stone-900 shadow-2xs font-extrabold" : "text-stone-500 hover:text-stone-900"
                  }`}
                  title="In đậm (B)"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { isItalic: !element.isItalic })}
                  className={`p-1.5 rounded-lg text-xs font-serif italic transition ${
                    element.isItalic ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
                  }`}
                  title="In nghiêng (I)"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { isUnderline: !element.isUnderline })}
                  className={`p-1.5 rounded-lg text-xs underline transition ${
                    element.isUnderline ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
                  }`}
                  title="Gạch chân (U)"
                >
                  U
                </button>
                <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { textAlign: "left" })}
                  className={`p-1.5 rounded-lg transition ${
                    element.textAlign === "left" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { textAlign: "center" })}
                  className={`p-1.5 rounded-lg transition ${
                    element.textAlign === "center" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { textAlign: "right" })}
                  className={`p-1.5 rounded-lg transition ${
                    element.textAlign === "right" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Cỡ chữ & Font */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] font-bold text-stone-600 block mb-1">Cỡ chữ</span>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    type="button"
                    onClick={() => updateCanvasElement(element.id, { fontSize: Math.max(10, (element.fontSize || 28) - 2) })}
                    className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={element.fontSize || 28}
                    onChange={(e) => updateCanvasElement(element.id, { fontSize: Number(e.target.value) || 28 })}
                    className="w-10 text-center text-xs font-bold bg-transparent outline-none py-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateCanvasElement(element.id, { fontSize: Math.min(120, (element.fontSize || 28) + 2) })}
                    className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-600 block mb-1">Font</span>
                <select
                  value={element.fontFamily || "Playfair Display"}
                  onChange={(e) => updateCanvasElement(element.id, { fontFamily: e.target.value })}
                  className="w-full text-xs font-medium py-1.5 px-2 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-amber-400"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Màu chữ */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-600 block">Màu chữ</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.color || "#000000"}
                  onChange={(e) => updateCanvasElement(element.id, { color: e.target.value })}
                  className="size-8 rounded-lg cursor-pointer border border-stone-300 p-0 overflow-hidden shrink-0"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["#000000", "#BE944E", "#8B1E2D", "#3E5343", "#C084FC", "#FFFFFF"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateCanvasElement(element.id, { color: c })}
                      className={`size-6 rounded-full border transition hover:scale-110 cursor-pointer shadow-2xs ${
                        element.color === c ? "ring-2 ring-blue-500 ring-offset-1 border-white" : "border-stone-300"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BỘ ACCORDION CHUẨN (KHỚP HOÀN TOÀN VỚI NGAYCHUNGDOI) ── */}
        <div className="space-y-1.5 pt-1 border-t border-stone-200">
          {/* 1. Màu sắc */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandColor((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Màu sắc</span>
              <span className="text-stone-400 font-bold">{expandColor ? "−" : "+"}</span>
            </button>
            {expandColor && (
              <div className="p-3 bg-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Màu viền / Chi tiết</span>
                  <input
                    type="color"
                    value={element.color || element.borderColor || "#BE944E"}
                    onChange={(e) => updateCanvasElement(element.id, { color: e.target.value, borderColor: e.target.value })}
                    className="size-7 rounded-lg cursor-pointer border border-stone-300 p-0 overflow-hidden"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Màu nền</span>
                  <input
                    type="color"
                    value={element.backgroundColor && element.backgroundColor !== "transparent" ? element.backgroundColor : "#ffffff"}
                    onChange={(e) => updateCanvasElement(element.id, { backgroundColor: e.target.value })}
                    className="size-7 rounded-lg cursor-pointer border border-stone-300 p-0 overflow-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">Trong suốt</span>
                    <span className="w-12 text-center text-xs border border-stone-200 rounded-lg py-0.5 font-mono text-stone-700 bg-stone-50">
                      {element.opacity ?? 1}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={element.opacity ?? 1}
                    onChange={(e) => updateCanvasElement(element.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-[#0091FF] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Đối xứng (Flip) */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandFlip((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Đối xứng</span>
              <span className="text-stone-400 font-bold">{expandFlip ? "−" : "+"}</span>
            </button>
            {expandFlip && (
              <div className="p-3 bg-white grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { flipX: !element.flipX })}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    element.flipX ? "border-[#0091FF] bg-blue-50 text-[#0091FF] font-bold" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <FlipHorizontal className="size-4" />
                  <span>Lật ngang</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateCanvasElement(element.id, { flipY: !element.flipY })}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    element.flipY ? "border-[#0091FF] bg-blue-50 text-[#0091FF] font-bold" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <FlipVertical className="size-4" />
                  <span>Lật dọc</span>
                </button>
              </div>
            )}
          </div>

          {/* Khoảng đệm (Padding) - Khớp 100% Screenshot 1 */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandPadding((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Khoảng đệm</span>
              <span className="text-stone-400 font-bold">{expandPadding ? "−" : "+"}</span>
            </button>
            {expandPadding && (
              <div className="p-3 bg-white space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between text-stone-600 mb-1">
                    <span>Đệm bên trong</span>
                    <span className="font-mono text-stone-700 font-semibold">{element.padding || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    value={element.padding || 0}
                    onChange={(e) => updateCanvasElement(element.id, { padding: Number(e.target.value) })}
                    className="w-full accent-[#0091FF] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 8, 16, 24].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateCanvasElement(element.id, { padding: p })}
                      className={`py-1 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
                        (element.padding || 0) === p
                          ? "border-[#0091FF] bg-blue-50 text-[#0091FF]"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {p === 0 ? "0px" : `${p}px`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Đường viền & Bo góc */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandBorder((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Đường viền & Bo góc</span>
              <span className="text-stone-400 font-bold">{expandBorder ? "−" : "+"}</span>
            </button>
            {expandBorder && (
              <div className="p-3 bg-white space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between text-stone-600 mb-1">
                    <span>Bo góc</span>
                    <span className="font-mono text-stone-700 font-semibold">{element.borderRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={element.borderRadius || 0}
                    onChange={(e) => updateCanvasElement(element.id, { borderRadius: Number(e.target.value) })}
                    className="w-full accent-[#0091FF] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-stone-600 mb-1">
                    <span>Độ dày viền</span>
                    <span className="font-mono text-stone-700 font-semibold">{element.borderWidth || 0}px</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 1, 2, 4].map((bw) => (
                      <button
                        key={bw}
                        type="button"
                        onClick={() => updateCanvasElement(element.id, { borderWidth: bw })}
                        className={`py-1 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
                          (element.borderWidth || 0) === bw
                            ? "border-[#0091FF] bg-blue-50 text-[#0091FF]"
                            : "border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        {bw === 0 ? "Không" : `${bw}px`}
                      </button>
                    ))}
                  </div>
                </div>
                {(element.borderWidth || 0) > 0 && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-600">Màu viền</span>
                    <input
                      type="color"
                      value={element.borderColor || "#BE944E"}
                      onChange={(e) => updateCanvasElement(element.id, { borderColor: e.target.value })}
                      className="size-7 rounded-lg cursor-pointer border border-stone-300 p-0 overflow-hidden"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Đổ bóng */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandShadow((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Đổ bóng</span>
              <span className="text-stone-400 font-bold">{expandShadow ? "−" : "+"}</span>
            </button>
            {expandShadow && (
              <div className="p-2.5 bg-white grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { label: "Không", val: "none" },
                  { label: "Nhẹ", val: "0 2px 8px rgba(0,0,0,0.1)" },
                  { label: "Vừa", val: "0 6px 16px rgba(0,0,0,0.18)" },
                  { label: "Nổi khối", val: "0 12px 28px rgba(0,0,0,0.22)" },
                  { label: "Ánh Kim", val: "0 4px 14px rgba(190,148,78,0.4)" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => updateCanvasElement(element.id, { shadow: s.val })}
                    className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                      element.shadow === s.val ? "border-amber-500 bg-amber-50 font-bold text-amber-900" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Liên kết */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandLink((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Liên kết</span>
              <span className="text-stone-400 font-bold">{expandLink ? "−" : "+"}</span>
            </button>
            {expandLink && (
              <div className="p-3 bg-white space-y-2">
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={element.linkUrl || ""}
                  onChange={(e) => updateCanvasElement(element.id, { linkUrl: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-stone-50/50 outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-stone-400">Khách bấm vào phần tử sẽ mở liên kết này.</p>
              </div>
            )}
          </div>

          {/* 6. Hiệu ứng chuyển động */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandMotion((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Hiệu ứng chuyển động</span>
              <span className="text-stone-400 font-bold">{expandMotion ? "−" : "+"}</span>
            </button>
            {expandMotion && (
              <div className="p-2.5 bg-white grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { label: "Không", val: "none" },
                  { label: "Mờ dần (Fade)", val: "fade-in" },
                  { label: "Bay lên (Slide Up)", val: "slide-up" },
                  { label: "Phóng to (Zoom)", val: "zoom-in" },
                  { label: "Nhảy nhẹ (Bounce)", val: "bounce-in" },
                ].map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => updateCanvasElement(element.id, { animation: m.val })}
                    className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                      element.animation === m.val ? "border-amber-500 bg-amber-50 font-bold text-amber-900" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 7. Chuyển động liên tục */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandLoopMotion((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Chuyển động liên tục</span>
              <span className="text-stone-400 font-bold">{expandLoopMotion ? "−" : "+"}</span>
            </button>
            {expandLoopMotion && (
              <div className="p-2.5 bg-white grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { label: "Không", val: "none" },
                  { label: "Nhấp nhô (Float)", val: "float" },
                  { label: "Nhịp đập (Pulse)", val: "pulse" },
                  { label: "Lắc lư (Swing)", val: "swing" },
                ].map((l) => (
                  <button
                    key={l.label}
                    type="button"
                    onClick={() => updateCanvasElement(element.id, { loopAnimation: l.val })}
                    className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                      element.loopAnimation === l.val ? "border-amber-500 bg-amber-50 font-bold text-amber-900" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── THỨ TỰ LỚP & THAO TÁC NHANH ── */}
        <div className="pt-3 border-t border-stone-200 space-y-2">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Thao tác phần tử
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => reorderElementLayer(element.id, "up")}
              className="py-1.5 px-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-1 transition font-medium cursor-pointer"
            >
              <span>Lên 1 lớp</span>
            </button>
            <button
              type="button"
              onClick={() => reorderElementLayer(element.id, "down")}
              className="py-1.5 px-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-1 transition font-medium cursor-pointer"
            >
              <span>Xuống 1 lớp</span>
            </button>
            <button
              type="button"
              onClick={() => duplicateCanvasElement(element.id)}
              className="py-1.5 px-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-1 transition font-medium cursor-pointer"
            >
              <span>Nhân bản</span>
            </button>
            <button
              type="button"
              onClick={() => removeCanvasElement(element.id)}
              className="py-1.5 px-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center gap-1 transition font-medium cursor-pointer"
            >
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <button
          type="button"
          onClick={triggerSave}
          disabled={saveState === "saving"}
          className="w-full min-h-11 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {saveState === "saving" ? "Đang lưu..." : "Lưu Bản Nháp"}
        </button>
      </div>

      {/* ── CROP MODAL CHO PHẦN TỬ CANVAS ── */}
      {showCropModal && (
        <CanvasCropModal
          imageUrl={element.imageUrl || (typeof previewThumbnail === "string" ? previewThumbnail : "")}
          onApply={(croppedUrl) => {
            updateCanvasElement(element.id, { imageUrl: croppedUrl, content: croppedUrl });
            setShowCropModal(false);
          }}
          onClose={() => setShowCropModal(false)}
        />
      )}
    </aside>
  );
}

// ── CANVAS CROP MODAL COMPONENT ──
function CanvasCropModal({
  imageUrl,
  onApply,
  onClose,
}: {
  imageUrl: string;
  onApply: (croppedUrl: string) => void;
  onClose: () => void;
}) {
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "free">("1:1");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleConfirm = () => {
    if (!imageUrl) {
      onClose();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = img.width;
      const h = img.height;
      if (aspectRatio === "1:1") {
        const size = Math.min(w, h);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, (w - size) / 2, (h - size) / 2, size, size, 0, 0, size, size);
          onApply(canvas.toDataURL("image/jpeg", 0.9));
        }
      } else if (aspectRatio === "4:3") {
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 800, 600);
          onApply(canvas.toDataURL("image/jpeg", 0.9));
        }
      } else if (aspectRatio === "16:9") {
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 800, 450);
          onApply(canvas.toDataURL("image/jpeg", 0.9));
        }
      } else {
        onApply(imageUrl);
      }
      onClose();
    };
    img.onerror = () => {
      onClose();
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-800">Cắt & Điều chỉnh ảnh</h4>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="w-full h-56 bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center relative p-2">
            <img
              src={imageUrl}
              alt="Crop preview"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                aspectRatio: aspectRatio === "1:1" ? "1/1" : aspectRatio === "4:3" ? "4/3" : aspectRatio === "16:9" ? "16/9" : "auto",
              }}
              className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-100"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-stone-600 block mb-1.5">Tỉ lệ khung hình</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
              {(["1:1", "4:3", "16:9", "free"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspectRatio(r)}
                  className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                    aspectRatio === r ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {r === "free" ? "Tự do" : r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] text-stone-500 font-medium">Thu/Phóng:</span>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="px-2.5 py-1 text-xs border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 font-medium shrink-0 cursor-pointer"
            >
              Xoay 90°
            </button>
          </div>
        </div>
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition cursor-pointer"
          >
            Áp dụng cắt ảnh
          </button>
        </div>
      </div>
    </div>
  );
}


