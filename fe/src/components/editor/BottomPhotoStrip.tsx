"use client";

import React, { useRef } from "react";
import { useEditor } from "./EditorContext";
import { Plus, Image as ImageIcon, Check } from "lucide-react";
import { uploadSingleImage } from "@/lib/image-upload";

export function BottomPhotoStrip() {
  const { draft, selectedField, selectField, fields, updateFieldValue } = useEditor();
  const fileRef = useRef<HTMLInputElement>(null);

  const photos = ((draft as any).photos as Array<{ id: string; url: string; caption?: string; isCover?: boolean }>) || [];
  const coverPhotoField = fields.find((f) => f.id === "cover-photo");

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadSingleImage(file);
      if (coverPhotoField) {
        updateFieldValue(coverPhotoField, url);
        selectField(coverPhotoField);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto mt-2 select-none">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadPhoto}
      />

      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
          Dải ảnh:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto py-1 flex-1">
          {photos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => {
                if (coverPhotoField) {
                  selectField(coverPhotoField);
                }
              }}
              className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-300 hover:border-amber-400 bg-stone-200 cursor-pointer relative group transition"
            >
              <img src={photo.url} alt="Thumbnail" className="w-full h-full object-cover" />
              {photo.isCover && (
                <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-stone-300 hover:border-amber-500 bg-white/70 hover:bg-amber-50/50 flex items-center justify-center text-stone-400 hover:text-amber-600 shrink-0 transition cursor-pointer"
            title="Thêm ảnh"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
