"use client";

import React, { useState } from "react";
import { useEditor } from "../EditorContext";
import {
  BookOpen,
  Sparkles,
  Pencil,
  Eye,
  Heart,
  RotateCcw,
  UploadCloud,
  Check,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  Album3DConfig,
  AlbumBackCoverConfig,
  AlbumCoverDesignPreset,
  ALBUM_BACK_COVER_PRESET_CATALOG,
  DEFAULT_ALBUM_BACK_COVER,
  DEFAULT_ALBUM_3D_CONFIG,
} from "@/types/album-3d.types";

export function Album3DTool() {
  const { draft, updateAlbum3D, openAlbum3DEditor } = useEditor();

  const currentAlbum: Album3DConfig =
    (draft as any)?.categoryData?.album3d || DEFAULT_ALBUM_3D_CONFIG;
  const backCover: AlbumBackCoverConfig =
    currentAlbum.backCover || DEFAULT_ALBUM_BACK_COVER;

  const handleUpdateBackCover = (patch: Partial<AlbumBackCoverConfig>) => {
    const updated: Album3DConfig = {
      ...currentAlbum,
      backCover: {
        ...backCover,
        ...patch,
      },
    };
    updateAlbum3D(updated);
  };

  const handleSelectPreset = (presetKey: AlbumCoverDesignPreset) => {
    const preset = ALBUM_BACK_COVER_PRESET_CATALOG[presetKey];
    if (!preset) return;
    handleUpdateBackCover({
      designPreset: presetKey,
      borderStyle: preset.borderStyle,
      badgeIcon: preset.badgeIcon,
      showPetals: preset.showPetals,
      title: preset.defaultTitle,
      subtitle: preset.defaultSubtitle,
      buttonText: preset.defaultButtonText,
    });
  };

  const handleJumpToBackCover = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jump-flipbook-spread", { detail: { target: "back" } })
      );
    }
  };

  const handleJumpToFrontCover = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jump-flipbook-spread", { detail: { target: "front" } })
      );
    }
  };

  return (
    <div className="space-y-5 p-4 text-xs select-none">
      {/* ── BANNER GIỚI THIỆU & NÚT MỞ MODAL ĐẦY ĐỦ ── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50/70 border border-amber-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-2xs">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-xs">Album 3D & Màn Kết</h4>
              <span className="text-[10px] text-amber-700 font-medium">Lật trang chân thực</span>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-2xs">
            VIP
          </span>
        </div>

        {/* NÚT HÀNH ĐỘNG NHANH */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openAlbum3DEditor("backCover")}
            className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center"
          >
            <Pencil className="size-3 shrink-0" />
            <span className="truncate">Chỉnh Bìa Sau</span>
          </button>
          <button
            type="button"
            onClick={() => openAlbum3DEditor("frontCover")}
            className="py-2 px-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-semibold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <BookOpen className="size-3 shrink-0 text-amber-600" />
            <span className="truncate">Chỉnh Bìa Trước</span>
          </button>
        </div>

        {/* ĐIỀU HƯỚNG FLIPBOOK TRÊN CANVAS */}
        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-1">
          <span className="text-[11px] text-stone-600 font-medium">Xem trên Canvas:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleJumpToFrontCover}
              className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100/70 text-stone-700 border border-amber-200 font-semibold text-[10px] transition cursor-pointer"
            >
              Bìa trước
            </button>
            <button
              type="button"
              onClick={handleJumpToBackCover}
              className="px-2 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-300 font-bold text-[10px] transition cursor-pointer"
            >
              Bìa sau
            </button>
          </div>
        </div>
      </div>

      {/* ── BỘ SƯU TẬP 7 MẪU PRESET BÌA SAU (MÀN KẾT) ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-600" />
            <span>Mẫu thiết kế Bìa Sau ({Object.keys(ALBUM_BACK_COVER_PRESET_CATALOG).length} mẫu)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {Object.entries(ALBUM_BACK_COVER_PRESET_CATALOG).map(([key, meta]) => {
            const isSelected = (backCover.designPreset || "velvet-stitched") === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key as AlbumCoverDesignPreset)}
                className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 cursor-pointer ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500 shadow-2xs"
                    : "border-stone-200 hover:border-amber-300 hover:bg-stone-50 bg-white"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-xs truncate">
                      {meta.name}
                    </span>
                    {isSelected && (
                      <span className="size-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 truncate mt-0.5 font-light">
                    {meta.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-stone-400 shrink-0 font-medium">
                  {meta.borderStyle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── NỘI DUNG VĂN BẢN BÌA SAU (CHỈNH TRỰC TIẾP TẠI ĐÂY) ── */}
      <div className="space-y-3 p-3 rounded-2xl bg-stone-50/80 border border-stone-200">
        <h5 className="font-bold text-stone-900 text-xs border-b border-stone-200/80 pb-2">
          Nội dung Bìa Sau (Màn Kết)
        </h5>

        {/* Tiêu đề chính */}
        <div>
          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
            Tiêu đề màn kết:
          </label>
          <input
            type="text"
            value={backCover.title || ""}
            onChange={(e) => handleUpdateBackCover({ title: e.target.value })}
            placeholder="Forever & Always"
            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Lời cảm ơn */}
        <div>
          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
            Lời cảm ơn khách mời:
          </label>
          <textarea
            rows={3}
            value={backCover.subtitle || ""}
            onChange={(e) => handleUpdateBackCover({ subtitle: e.target.value })}
            placeholder="Cảm ơn bạn đã dõi theo và sẻ chia những khoảnh khắc hạnh phúc cùng chúng mình!"
            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Nút quay lại */}
        <div>
          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
            Chữ trên nút quay lại:
          </label>
          <input
            type="text"
            value={backCover.buttonText || ""}
            onChange={(e) => handleUpdateBackCover({ buttonText: e.target.value })}
            placeholder="Quay lại trang bìa"
            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Hiệu ứng cánh hoa bay */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold text-stone-700">Cánh hoa đào rơi trên bìa sau:</span>
          <button
            type="button"
            onClick={() => handleUpdateBackCover({ showPetals: !backCover.showPetals })}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
              backCover.showPetals
                ? "bg-rose-500 text-white shadow-2xs"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {backCover.showPetals ? "BẬT" : "TẮT"}
          </button>
        </div>
      </div>
    </div>
  );
}
