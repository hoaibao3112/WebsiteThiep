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
} from "lucide-react";
import { uploadSingleImage } from "@/lib/image-upload";
import { EditorField } from "@/lib/editor/template-registry";

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

function CanvasElementInspector({ element }: { element: CanvasElement }) {
  const { updateCanvasElement, selectElement, triggerSave, saveState, draft } = useEditor();
  const [expandColor, setExpandColor] = useState(false);
  const [expandPadding, setExpandPadding] = useState(false);
  const [expandBorder, setExpandBorder] = useState(false);
  const [expandShadow, setExpandShadow] = useState(false);
  const [expandLink, setExpandLink] = useState(false);
  const [expandMotion, setExpandMotion] = useState(false);
  const [expandLoopMotion, setExpandLoopMotion] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <aside className="w-72 sm:w-80 bg-white border-l border-stone-200 flex flex-col justify-between h-full select-none shrink-0 shadow-xs z-20">
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Header */}
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

        {/* ── THUMBNAIL PREVIEW & ACTION BUTTONS (CHO PRESET & ẢNH KHỚP VỚI ẢNH MẪU) ── */}
        {!isTextElement && (
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            {/* Visual Thumbnail */}
            <div className="w-full h-24 rounded-xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center relative shadow-inner">
              {element.presetId === "p-envelope-pink" || element.presetId === "p1" ? (
                <div className="w-20 h-14 bg-[#F294A6] rounded-md relative shadow-sm flex items-center justify-center border border-pink-300">
                  <div className="absolute -top-3 w-16 h-8 bg-[#EFA0AF] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
                  <div className="size-3.5 rounded-full bg-pink-600 border border-white text-[5px] text-white flex items-center justify-center font-bold">ML</div>
                </div>
              ) : previewThumbnail && (previewThumbnail.startsWith("http") || previewThumbnail.startsWith("/")) ? (
                <img
                  src={previewThumbnail}
                  alt={element.title || "Phần tử"}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Sparkles className="size-8 text-amber-500" />
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

            {/* 2 Nút: Cắt ảnh & Đổi ảnh (Khớp y hệt thanh công cụ ngaychungdoi) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const activeImg = element.imageUrl || (typeof previewThumbnail === "string" && (previewThumbnail.startsWith("http") || previewThumbnail.startsWith("/")) ? previewThumbnail : "");
                  if (activeImg) {
                    setShowCropModal(true);
                  } else if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                className="py-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-2xs transition cursor-pointer text-center"
              >
                Cắt ảnh
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="py-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-amber-800 text-xs font-semibold shadow-2xs transition cursor-pointer text-center disabled:opacity-50"
              >
                {isUploading ? "Đang tải..." : "Đổi ảnh"}
              </button>
            </div>
          </div>
        )}

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
          </div>
        )}

        {/* ── BỘ 7 ACCORDION CHUẨN (KHỚP HOÀN TOÀN VỚI NGAYCHUNGDOI) ── */}
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
              <div className="p-3 bg-white space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Màu chủ đạo / chữ</span>
                  <input
                    type="color"
                    value={element.color || "#000000"}
                    onChange={(e) => updateCanvasElement(element.id, { color: e.target.value })}
                    className="size-6 rounded-lg cursor-pointer border border-stone-300 p-0 overflow-hidden"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Màu nền</span>
                  <input
                    type="color"
                    value={element.backgroundColor && element.backgroundColor !== "transparent" ? element.backgroundColor : "#ffffff"}
                    onChange={(e) => updateCanvasElement(element.id, { backgroundColor: e.target.value })}
                    className="size-6 rounded-lg cursor-pointer border border-stone-300 p-0 overflow-hidden"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-600">Độ mờ (Opacity)</span>
                    <span className="font-mono text-stone-500">{element.opacity ?? 1}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={element.opacity ?? 1}
                    onChange={(e) => updateCanvasElement(element.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Khoảng đệm */}
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
              <div className="p-3 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Lề bên trong</span>
                  <span className="font-mono text-stone-500">{element.padding || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={element.padding || 0}
                  onChange={(e) => updateCanvasElement(element.id, { padding: Number(e.target.value) })}
                  className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 3. Đường viền */}
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandBorder((v) => !v)}
              className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700 transition"
            >
              <span>Đường viền</span>
              <span className="text-stone-400 font-bold">{expandBorder ? "−" : "+"}</span>
            </button>
            {expandBorder && (
              <div className="p-3 bg-white space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Độ dày viền</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={element.borderWidth || 0}
                    onChange={(e) => updateCanvasElement(element.id, { borderWidth: Number(e.target.value) })}
                    className="w-14 text-center border rounded-lg p-1 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Bo góc (Radius)</span>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={element.borderRadius || 0}
                    onChange={(e) => updateCanvasElement(element.id, { borderRadius: Number(e.target.value) })}
                    className="w-14 text-center border rounded-lg p-1 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Màu viền</span>
                  <input
                    type="color"
                    value={element.borderColor || "#D4AF37"}
                    onChange={(e) => updateCanvasElement(element.id, { borderColor: e.target.value })}
                    className="size-6 rounded-lg cursor-pointer border border-stone-300 p-0 overflow-hidden"
                  />
                </div>
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


