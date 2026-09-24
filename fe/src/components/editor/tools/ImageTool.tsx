"use client";

import React, { useRef, useState, useMemo } from "react";
import { useEditor } from "../EditorContext";
import { UploadCloud, Image as ImageIcon, CheckCircle, Trash2, Plus } from "lucide-react";
import { uploadSingleImage } from "@/lib/image-upload";

export function ImageTool() {
  const { fields, selectedField, selectField, updateFieldValue, getFieldValue, draft, addImageElement } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const imageFields = useMemo(() => {
    return fields.filter((f) => f.type === "image");
  }, [fields]);

  // Read photos from draft if available
  const photos = ((draft as any).photos as Array<{ id: string; url: string; caption?: string }>) || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file hình ảnh (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Kích thước ảnh tối đa 10MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadSingleImage(file);
      // If a specific image field is currently selected, assign to it directly
      if (selectedField && selectedField.type === "image") {
        updateFieldValue(selectedField, url);
      } else {
        // Drop as a brand new draggable image on canvas
        addImageElement(url, "Ảnh mới tải lên");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Hình Ảnh</h3>
          <span className="text-[10px] font-semibold text-stone-400">
            {photos.length}/10 ảnh
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Tải ảnh lên hoặc chọn khung ảnh trên thiệp để thay đổi.
        </p>
      </div>

      {/* Upload Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-4 rounded-2xl border-2 border-dashed border-stone-300 hover:border-amber-400 bg-stone-50/60 hover:bg-amber-50/30 transition flex flex-col items-center justify-center text-center cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-stone-200 flex items-center justify-center text-amber-600 mb-2 group-hover:scale-105 transition">
          <UploadCloud className="size-5" />
        </div>
        <span className="text-xs font-bold text-stone-700">
          {uploading ? "Đang tải ảnh lên..." : "Tải ảnh từ máy tính / điện thoại"}
        </span>
        <span className="text-[10px] text-stone-400 mt-0.5">
          Hỗ trợ JPG, PNG, WebP (Tối đa 10MB)
        </span>
      </div>

      {uploadError && (
        <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          {uploadError}
        </p>
      )}

      {/* Vị trí ảnh chính trên mẫu thiệp */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block px-1">
          Khung Ảnh Trên Thiệp
        </span>

        <div className="grid grid-cols-1 gap-2">
          {imageFields.map((field) => {
            const val = getFieldValue(field);
            const isSelected = selectedField?.id === field.id;
            const imgUrl = typeof val === "string" ? val : "";

            return (
              <div
                key={field.id}
                onClick={() => selectField(field)}
                className={`p-2 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-amber-50 border-amber-400 shadow-2xs"
                    : "bg-white border-stone-200 hover:bg-stone-50"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                  {imgUrl ? (
                    <img src={imgUrl} alt={field.label} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="size-5 text-stone-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-800 truncate">{field.label}</span>
                    {imgUrl && <CheckCircle className="size-3 text-emerald-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {imgUrl ? "Đã có ảnh (Click để thay)" : "Chưa có ảnh (Click để chọn)"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── THƯ VIỆN ẢNH CƯỚI MẪU ── */}
      <div className="space-y-2 border-t border-stone-200 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
          Kho ảnh cưới mẫu
        </span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: "Ảnh cưới lãng mạn", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80" },
            { title: "Nụ cười hạnh phúc", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&auto=format&fit=crop&q=80" },
            { title: "Khoảnh khắc tay trong tay", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop&q=80" },
            { title: "Hôn lễ thiêng liêng", url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=500&auto=format&fit=crop&q=80" },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addImageElement(item.url, item.title)}
              className="group p-1.5 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-xs transition flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-full h-20 rounded-lg overflow-hidden bg-stone-100 mb-1">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-[10px] font-semibold text-stone-700 truncate max-w-full">{item.title}</span>
              <span className="text-[8px] text-amber-700 font-bold mt-0.5">+ Thêm vào thiệp</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
