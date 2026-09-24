"use client";

import React, { useRef, useState, useMemo } from "react";
import { useEditor } from "./EditorContext";
import { Plus, Image as ImageIcon, Star, Trash2, Loader2, Sparkles } from "lucide-react";
import { uploadSingleImage } from "@/lib/image-upload";

export function BottomPhotoStrip() {
  const {
    draft,
    selectedField,
    selectedCanvasElement,
    fields,
    replaceSelectedImage,
    setCoverPhoto,
    addPhotoToGallery,
    removePhotoFromGallery,
    selectField,
  } = useEditor();

  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Extract photos list with fallback to coverPhotoUrl if list is empty
  const rawPhotos = ((draft as any).photos as Array<{ id: string; url: string; caption?: string; isCover?: boolean }>) || [];
  const coverUrl = (draft as any)?.categoryData?.coverPhotoUrl || (draft as any)?.coverPhotoUrl;

  const photos = useMemo(() => {
    if (rawPhotos.length > 0) return rawPhotos;
    if (coverUrl) {
      return [{ id: "photo-cover-default", url: coverUrl, caption: "Ảnh bìa", isCover: true }];
    }
    return [];
  }, [rawPhotos, coverUrl]);

  // Determine current active image URL from selected canvas node or selected field
  const activeImageUrl = useMemo(() => {
    if (selectedCanvasElement?.imageUrl) {
      return selectedCanvasElement.imageUrl;
    }
    if (selectedField?.type === "image") {
      const fieldVal = (draft as any)?.categoryData?.[selectedField.id] || coverUrl;
      return typeof fieldVal === "string" ? fieldVal : null;
    }
    return coverUrl || null;
  }, [selectedCanvasElement, selectedField, draft, coverUrl]);

  const hasSelectedImageTarget = Boolean(
    (selectedCanvasElement && (selectedCanvasElement.imageUrl || selectedCanvasElement.type === "image" || selectedCanvasElement.presetId)) ||
    (selectedField && selectedField.type === "image")
  );

  const handleSelectPhoto = (photoUrl: string) => {
    replaceSelectedImage(photoUrl);
  };

  const handleSetCover = (e: React.MouseEvent, photoUrl: string) => {
    e.stopPropagation();
    setCoverPhoto(photoUrl);
  };

  const handleRemovePhoto = (e: React.MouseEvent, photoIdOrUrl: string) => {
    e.stopPropagation();
    removePhotoFromGallery(photoIdOrUrl);
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadSingleImage(file);
        if (uploadedUrl) {
          addPhotoToGallery({
            id: `photo-${Date.now()}-${i}`,
            url: uploadedUrl,
            caption: file.name.replace(/\.[^/.]+$/, ""),
            isCover: photos.length === 0 && i === 0,
          });

          // Automatically apply first uploaded image to currently selected canvas node or field
          if (i === 0 && hasSelectedImageTarget) {
            replaceSelectedImage(uploadedUrl);
          }
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto mt-2 px-2 select-none">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUploadPhoto}
      />

      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-stone-200/80 transition-all">
        {/* Header bar with contextual feedback */}
        <div className="flex items-center justify-between gap-2 px-1 mb-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <ImageIcon className="size-3.5 text-amber-600" />
            <span className="font-semibold text-stone-800">Dải ảnh cưới</span>
            <span className="text-[10px] text-stone-400 bg-stone-100 rounded-full px-1.5 py-0.2">
              {photos.length}
            </span>
          </div>

          {hasSelectedImageTarget ? (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-2 py-0.5 flex items-center gap-1 animate-pulse">
              <Sparkles className="size-2.5" />
              Bấm ảnh để thay thế vào node đang chọn
            </span>
          ) : (
            <span className="text-[10px] text-stone-400">
              Chọn ảnh trên thiệp để thay nhanh
            </span>
          )}
        </div>

        {uploadError && (
          <div className="text-[11px] text-rose-600 bg-rose-50 rounded-lg px-2 py-1 mb-2">
            {uploadError}
          </div>
        )}

        {/* Scrollable strip */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-stone-300">
          {photos.map((photo, idx) => {
            const isCover = photo.isCover || photo.url === coverUrl;
            const isActive = activeImageUrl === photo.url;

            return (
              <div
                key={photo.id || idx}
                onClick={() => handleSelectPhoto(photo.url)}
                className={`relative group size-12 sm:size-14 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer bg-stone-100 ${
                  isActive
                    ? "ring-2 ring-amber-500 ring-offset-2 border-amber-500 scale-105 shadow-md"
                    : "border-stone-200 hover:border-amber-400 hover:scale-102"
                }`}
                title={hasSelectedImageTarget ? "Nhấp để thay ảnh vào node đang chọn" : "Nhấp để chọn ảnh"}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Thumbnail"}
                  className="w-full h-full object-cover pointer-events-none"
                  loading="lazy"
                />

                {/* Cover badge */}
                {isCover && (
                  <div
                    className="absolute top-1 left-1 bg-amber-500/90 text-white rounded-md px-1 py-0.2 text-[8px] font-bold shadow flex items-center gap-0.5 pointer-events-none"
                    title="Ảnh bìa chính"
                  >
                    <Star className="size-2 fill-white" />
                    Bìa
                  </div>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-around px-1">
                  {!isCover && (
                    <button
                      type="button"
                      onClick={(e) => handleSetCover(e, photo.url)}
                      className="size-5 rounded-full bg-white/90 hover:bg-amber-500 text-stone-700 hover:text-white flex items-center justify-center transition"
                      title="Đặt làm ảnh bìa"
                    >
                      <Star className="size-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleRemovePhoto(e, photo.id || photo.url)}
                    className="size-5 rounded-full bg-white/90 hover:bg-rose-500 text-stone-700 hover:text-white flex items-center justify-center transition"
                    title="Xóa khỏi dải ảnh"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Upload Button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileRef.current?.click()}
            className="size-12 sm:size-14 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-500 bg-white/70 hover:bg-amber-50/50 flex flex-col items-center justify-center text-stone-400 hover:text-amber-600 shrink-0 transition cursor-pointer disabled:opacity-50"
            title="Thêm ảnh mới vào dải ảnh"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin text-amber-600" />
            ) : (
              <>
                <Plus className="size-4" />
                <span className="text-[9px] font-medium mt-0.5">Thêm ảnh</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
