"use client";

import React, { useState, useRef, useMemo } from "react";
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
  Image as ImageIcon,
  Trash2,
  Volume2,
  VolumeX,
  Palette,
  Camera,
  FolderOpen,
  Loader2,
  Square,
  Circle,
} from "lucide-react";
import {
  Album3DConfig,
  AlbumFrontCoverConfig,
  AlbumFrontCoverPreset,
  AlbumFrontCoverFrameShape,
  AlbumBackCoverConfig,
  AlbumCoverDesignPreset,
  AlbumCoverTheme,
  ALBUM_FRONT_COVER_PRESET_CATALOG,
  ALBUM_BACK_COVER_PRESET_CATALOG,
  DEFAULT_ALBUM_FRONT_COVER,
  DEFAULT_ALBUM_BACK_COVER,
  DEFAULT_ALBUM_3D_CONFIG,
} from "@/types/album-3d.types";
import { uploadSingleImage } from "@/lib/image-upload";

const THEME_OPTIONS: Array<{
  id: AlbumCoverTheme;
  name: string;
  bgHex: string;
  colorClass: string;
}> = [
  { id: "leather-burgundy", name: "Đỏ rượu", bgHex: "#4A0E17", colorClass: "bg-[#4A0E17] border-[#D4AF37]" },
  { id: "oriental-crimson", name: "Đỏ son Á Đông", bgHex: "#80121D", colorClass: "bg-[#80121D] border-[#D4AF37]" },
  { id: "linen-cream", name: "Linen kem", bgHex: "#F5F2EB", colorClass: "bg-[#F5F2EB] border-[#8C7A5E]" },
  { id: "royal-gold", name: "Ánh kim", bgHex: "#D4AF37", colorClass: "bg-[#D4AF37] border-white" },
  { id: "botanical-sage", name: "Xanh rêu", bgHex: "#2C3E2D", colorClass: "bg-[#2C3E2D] border-[#8FB38D]" },
  { id: "minimalist-dark", name: "Tối giản đen", bgHex: "#1A1A1E", colorClass: "bg-[#1A1A1E] border-stone-600" },
  { id: "polaroid-kraft", name: "Giấy Kraft", bgHex: "#382622", colorClass: "bg-[#382622] border-[#C9A45C]" },
];

const FRAME_SHAPES: Array<{
  id: AlbumFrontCoverFrameShape;
  label: string;
  desc: string;
}> = [
  { id: "arch", label: "Cổng vòm", desc: "Uốn cong mái vòm hoàng gia dát vàng" },
  { id: "oval", label: "Khung Oval", desc: "Bầu dục cổ điển hoa văn baroque" },
  { id: "polaroid", label: "Polaroid", desc: "Ảnh trắng kẹp chỉ may vintage" },
  { id: "rect", label: "Chữ nhật", desc: "Khung chữ nhật bo góc nghệ thuật" },
  { id: "circle", label: "Khung tròn", desc: "Huy hiệu tròn thếp vàng sang trọng" },
  { id: "full", label: "Tràn viền", desc: "Ảnh phủ kín bìa tạp chí lookbook" },
  { id: "none", label: "Monogram", desc: "Chỉ chữ & chữ lồng mạ vàng (không ảnh)" },
];

export function Album3DTool() {
  const { draft, updateAlbum3D, openAlbum3DEditor, canvasMode, setCanvasMode } = useEditor();
  const [activeTab, setActiveTab] = useState<"front" | "back" | "pages">("front");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);

  const currentAlbum: Album3DConfig =
    (draft as any)?.categoryData?.album3d || DEFAULT_ALBUM_3D_CONFIG;
  const frontCover: AlbumFrontCoverConfig =
    currentAlbum.frontCover || DEFAULT_ALBUM_FRONT_COVER;
  const backCover: AlbumBackCoverConfig =
    currentAlbum.backCover || DEFAULT_ALBUM_BACK_COVER;

  // Thu thập danh sách ảnh cưới hiện có trong thiệp
  const weddingPhotos: Array<{ id: string; url: string; caption?: string }> = useMemo(() => {
    const list: Array<{ id: string; url: string; caption?: string }> = [];
    const directPhotos = (draft as any)?.photos;
    if (Array.isArray(directPhotos)) {
      directPhotos.forEach((p, idx) => {
        if (p?.url) list.push({ id: p.id || `photo-${idx}`, url: p.url, caption: p.caption });
      });
    }
    const catPhotos = (draft as any)?.categoryData?.photos;
    if (Array.isArray(catPhotos)) {
      catPhotos.forEach((p, idx) => {
        if (p?.url && !list.some((existing) => existing.url === p.url)) {
          list.push({ id: p.id || `cat-photo-${idx}`, url: p.url, caption: p.caption });
        }
      });
    }
    const pages = currentAlbum?.pages;
    if (Array.isArray(pages)) {
      pages.forEach((p, idx) => {
        if (p?.url && !list.some((existing) => existing.url === p.url)) {
          list.push({ id: p.id || `page-photo-${idx}`, url: p.url, caption: p.caption });
        }
      });
    }
    return list;
  }, [draft, currentAlbum?.pages]);

  // Cập nhật cấu hình Bìa Trước
  const handleUpdateFrontCover = (patch: Partial<AlbumFrontCoverConfig>) => {
    const updated: Album3DConfig = {
      ...currentAlbum,
      frontCover: {
        ...frontCover,
        ...patch,
      },
    };
    updateAlbum3D(updated);
  };

  // Cập nhật cấu hình Bìa Sau
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

  // Chọn mẫu Bìa Trước từ catalogue
  const handleSelectFrontPreset = (presetKey: AlbumFrontCoverPreset) => {
    const preset = ALBUM_FRONT_COVER_PRESET_CATALOG[presetKey];
    if (!preset) return;
    handleUpdateFrontCover({
      designPreset: presetKey,
      frameShape: preset.frameShape,
      theme: preset.theme,
      badgeText: preset.defaultBadgeText,
      title: frontCover.title || preset.defaultTitle,
      subtitle: frontCover.subtitle || preset.defaultSubtitle,
    });
  };

  // Chọn mẫu Bìa Sau từ catalogue
  const handleSelectBackPreset = (presetKey: AlbumCoverDesignPreset) => {
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

  // Upload ảnh Bìa Trước
  const handleUploadFrontPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFront(true);
    setUploadError("");
    try {
      const url = await uploadSingleImage(file);
      handleUpdateFrontCover({
        photoUrl: url,
        frameShape: frontCover.frameShape === "none" ? "arch" : frontCover.frameShape,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Tải ảnh bìa thất bại");
    } finally {
      setUploadingFront(false);
      e.target.value = "";
    }
  };

  // Upload ảnh Bìa Sau
  const handleUploadBackPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBack(true);
    setUploadError("");
    try {
      const url = await uploadSingleImage(file);
      handleUpdateBackCover({ photoUrl: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Tải ảnh bìa sau thất bại");
    } finally {
      setUploadingBack(false);
      e.target.value = "";
    }
  };

  const handleJumpToFrontCover = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jump-flipbook-spread", { detail: { target: "front" } })
      );
    }
  };

  const handleJumpToBackCover = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jump-flipbook-spread", { detail: { target: "back" } })
      );
    }
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* ── BANNER ĐIỀU HƯỚNG TAB THIẾT KẾ BÌA ALBUM ── */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50/70 border border-amber-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-2xs">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-xs">Thiết Kế Album 3D</h4>
              <span className="text-[10px] text-amber-700 font-medium">Bìa Sách &amp; Màn Kết</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAlbum3DEditor("frontCover")}
            className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
            title="Mở toàn màn hình"
          >
            <Pencil className="size-3" />
            <span>Mở rộng</span>
          </button>
        </div>

        {/* Nút Hiển Thị Giao Diện Album 3D Ngay */}
        <button
          type="button"
          onClick={() => setCanvasMode(canvasMode === "album3d" ? "card" : "album3d")}
          className={`w-full py-2 px-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            canvasMode === "album3d"
              ? "bg-stone-900 text-amber-300 hover:bg-black"
              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950"
          }`}
        >
          <BookOpen className="size-4" />
          <span>{canvasMode === "album3d" ? "Quay lại thiết kế thiệp" : "Hiển Thị Cuốn Album 3D Ngay"}</span>
        </button>

        {/* 3 TABS ĐIỀU KHIỂN CHÍNH */}
        <div className="grid grid-cols-3 gap-1 bg-white/80 p-1 rounded-xl border border-amber-200/70">
          <button
            type="button"
            onClick={() => setActiveTab("front")}
            className={`py-1.5 px-1 rounded-lg font-bold text-[11px] transition text-center cursor-pointer ${
              activeTab === "front"
                ? "bg-amber-500 text-stone-950 shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            📖 Bìa Trước
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("back")}
            className={`py-1.5 px-1 rounded-lg font-bold text-[11px] transition text-center cursor-pointer ${
              activeTab === "back"
                ? "bg-amber-500 text-stone-950 shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            💌 Bìa Sau
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={`py-1.5 px-1 rounded-lg font-bold text-[11px] transition text-center cursor-pointer ${
              activeTab === "pages"
                ? "bg-amber-500 text-stone-950 shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            🖼️ {currentAlbum.pages?.length || 0} Trang
          </button>
        </div>

        {/* NÚT XEM TRÊN CANVAS */}
        <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
          <span className="text-[10px] text-stone-500 font-medium">Xem nhanh trên thiệp:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleJumpToFrontCover}
              className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-100/70 text-stone-700 border border-amber-200 font-semibold text-[10px] transition cursor-pointer"
            >
              Bìa trước
            </button>
            <button
              type="button"
              onClick={handleJumpToBackCover}
              className="px-2 py-0.5 rounded-md bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-300 font-bold text-[10px] transition cursor-pointer"
            >
              Bìa sau
            </button>
          </div>
        </div>
      </div>

      {uploadError && (
        <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          {uploadError}
        </p>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: THIẾT KẾ BÌA TRƯỚC (ẢNH BÌA ALBUM)                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "front" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* MỤC 1: BỎ ẢNH VÀO BÌA TRƯỚC */}
          <div className="space-y-2.5 p-3 rounded-2xl bg-stone-50/90 border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Camera className="size-3.5 text-amber-600" />
                <span>Bỏ Ảnh Vào Bìa Trước</span>
              </label>
              {frontCover.photoUrl && (
                <button
                  type="button"
                  onClick={() => handleUpdateFrontCover({ photoUrl: "", frameShape: "none" })}
                  className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Gỡ ảnh bìa
                </button>
              )}
            </div>

            {/* Input file ẩn */}
            <input
              ref={fileInputFrontRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleUploadFrontPhoto}
            />

            {/* Vùng xem ảnh hiện tại hoặc nút tải ảnh mới */}
            {frontCover.photoUrl ? (
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-300/80 shadow-2xs">
                <div className="relative size-14 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                  <img
                    src={frontCover.photoUrl}
                    alt="Ảnh bìa album"
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">
                    Ảnh bìa
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-xs font-bold text-stone-800 block truncate">
                    Đã chọn ảnh bìa
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputFrontRef.current?.click()}
                      className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[10px] transition cursor-pointer"
                    >
                      {uploadingFront ? "Đang tải..." : "Đổi ảnh khác"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputFrontRef.current?.click()}
                className="p-3.5 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50/70 transition flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="size-8 rounded-lg bg-white shadow-2xs border border-amber-200 flex items-center justify-center text-amber-600 mb-1.5 group-hover:scale-105 transition">
                  {uploadingFront ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UploadCloud className="size-4" />
                  )}
                </div>
                <span className="text-xs font-bold text-stone-800">
                  {uploadingFront ? "Đang tải ảnh lên..." : "Tải ảnh cưới làm bìa album"}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5">
                  JPG, PNG, WebP (Tối đa 10MB)
                </span>
              </div>
            )}

            {/* CHỌN NHANH TỪ ẢNH CƯỚI CÓ SẴN TRÊN THIỆP */}
            {weddingPhotos.length > 0 && (
              <div className="pt-2 border-t border-stone-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Hoặc chọn nhanh từ ảnh thiệp cưới ({weddingPhotos.length} ảnh):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {weddingPhotos.map((photo, idx) => {
                    const isSelected = frontCover.photoUrl === photo.url;
                    return (
                      <button
                        key={photo.id || idx}
                        type="button"
                        onClick={() =>
                          handleUpdateFrontCover({
                            photoUrl: photo.url,
                            frameShape: frontCover.frameShape === "none" ? "arch" : frontCover.frameShape,
                          })
                        }
                        className={`relative size-12 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                          isSelected
                            ? "border-amber-500 ring-2 ring-amber-400 scale-105 shadow-2xs"
                            : "border-stone-200 hover:border-amber-300 opacity-80 hover:opacity-100"
                        }`}
                        title="Dùng làm ảnh bìa"
                      >
                        <img
                          src={photo.url}
                          alt={`Ảnh cưới ${idx + 1}`}
                          className="w-full h-full object-cover object-top"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/35 flex items-center justify-center">
                            <Check className="size-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* MỤC 2: CHỌN MẪU THIẾT KẾ BÌA TRƯỚC (7 MẪU) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-600" />
                <span>Mẫu Thiết Kế Bìa ({Object.keys(ALBUM_FRONT_COVER_PRESET_CATALOG).length} mẫu)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-[260px] overflow-y-auto pr-0.5">
              {Object.entries(ALBUM_FRONT_COVER_PRESET_CATALOG).map(([key, meta]) => {
                const isSelected = (frontCover.designPreset || "photo-arch-gold") === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectFrontPreset(key as AlbumFrontCoverPreset)}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/80 ring-1 ring-amber-500 shadow-2xs"
                        : "border-stone-200 hover:border-amber-300 hover:bg-stone-50 bg-white"
                    }`}
                  >
                    <div
                      className={`size-8 rounded-lg ${meta.bgGradient} border border-white/30 shadow-inner shrink-0 flex items-center justify-center text-[10px] font-serif text-white/90 font-bold`}
                    >
                      {meta.frameShape === "arch" && "∩"}
                      {meta.frameShape === "oval" && "○"}
                      {meta.frameShape === "polaroid" && "□"}
                      {meta.frameShape === "rect" && "▭"}
                      {meta.frameShape === "circle" && "●"}
                      {meta.frameShape === "full" && "■"}
                      {meta.frameShape === "none" && "囍"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* MỤC 3: KIỂU DÁNG KHUNG ẢNH (FRAME SHAPE) */}
          <div className="space-y-2 p-3 rounded-2xl bg-stone-50/90 border border-stone-200">
            <label className="font-bold text-stone-800 text-xs block">
              Kiểu Dáng Khung Ảnh Bìa
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {FRAME_SHAPES.map((shape) => {
                const isSelected = (frontCover.frameShape || "arch") === shape.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => handleUpdateFrontCover({ frameShape: shape.id })}
                    className={`py-2 px-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? "border-amber-500 bg-white ring-1 ring-amber-500 font-bold text-stone-900 shadow-2xs"
                        : "border-stone-200 hover:border-amber-200 bg-white/70 text-stone-700"
                    }`}
                  >
                    <span className="truncate text-xs">{shape.label}</span>
                    {isSelected && <Check className="size-3 text-amber-600 shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MỤC 4: THÔNG TIN CHỮ TRÊN BÌA TRƯỚC */}
          <div className="space-y-2.5 p-3 rounded-2xl bg-stone-50/90 border border-stone-200">
            <h5 className="font-bold text-stone-900 text-xs border-b border-stone-200/80 pb-1.5">
              Thông Tin Chữ Trên Bìa
            </h5>

            {/* Tên cặp đôi */}
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Tên cặp đôi dập nhũ vàng:
              </label>
              <input
                type="text"
                value={frontCover.title || ""}
                onChange={(e) => handleUpdateFrontCover({ title: e.target.value })}
                placeholder="HOÀNG LONG & BẢO NGỌC"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs font-bold uppercase focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Chữ lồng Monogram */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Chữ lồng Monogram:
                </label>
                <input
                  type="text"
                  value={frontCover.monogram || ""}
                  onChange={(e) => handleUpdateFrontCover({ monogram: e.target.value })}
                  placeholder="L & N"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs font-bold uppercase focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Huy hiệu đầu bìa:
                </label>
                <input
                  type="text"
                  value={frontCover.badgeText || ""}
                  onChange={(e) => handleUpdateFrontCover({ badgeText: e.target.value })}
                  placeholder="WEDDING COLLECTION"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs uppercase focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tiêu đề phụ / Năm cưới */}
            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Tiêu đề phụ / Năm cưới:
              </label>
              <input
                type="text"
                value={frontCover.subtitle || ""}
                onChange={(e) => handleUpdateFrontCover({ subtitle: e.target.value })}
                placeholder="OUR WEDDING PHOTOBOOK • 2026"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* MỤC 5: CHẤT LIỆU BÌA DA & MÀU SẮC (THEME) */}
          <div className="space-y-2 p-3 rounded-2xl bg-stone-50/90 border border-stone-200">
            <label className="font-bold text-stone-800 text-xs block">
              Màu Sắc &amp; Chất Liệu Bìa Da
            </label>
            <div className="grid grid-cols-4 gap-2">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = (frontCover.theme || currentAlbum.coverTheme) === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      handleUpdateFrontCover({ theme: theme.id });
                      updateAlbum3D({ ...currentAlbum, coverTheme: theme.id });
                    }}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? "border-amber-500 bg-white ring-1 ring-amber-500 shadow-2xs"
                        : "border-stone-200 hover:border-amber-200 bg-white/70"
                    }`}
                    title={theme.name}
                  >
                    <div
                      className={`size-6 rounded-full border shadow-inner ${theme.colorClass}`}
                      style={{ backgroundColor: theme.bgHex }}
                    />
                    <span className="text-[9px] text-stone-700 font-medium truncate w-full text-center">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: THIẾT KẾ BÌA SAU (MÀN KẾT)                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "back" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* MẪU BÌA SAU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-600" />
                <span>Mẫu Bìa Sau ({Object.keys(ALBUM_BACK_COVER_PRESET_CATALOG).length} mẫu)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-[240px] overflow-y-auto pr-0.5">
              {Object.entries(ALBUM_BACK_COVER_PRESET_CATALOG).map(([key, meta]) => {
                const isSelected = (backCover.designPreset || "velvet-stitched") === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectBackPreset(key as AlbumCoverDesignPreset)}
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* ĐÍNH KÈM ẢNH POLAROID KỶ NIỆM BÌA SAU */}
          <div className="space-y-2 p-3 rounded-2xl bg-stone-50/90 border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-amber-600" />
                <span>Ảnh Kỷ Niệm Polaroid Bìa Sau</span>
              </label>
              {backCover.photoUrl && (
                <button
                  type="button"
                  onClick={() => handleUpdateBackCover({ photoUrl: "" })}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>

            <input
              ref={fileInputBackRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadBackPhoto}
            />

            {backCover.photoUrl ? (
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
                <img
                  src={backCover.photoUrl}
                  alt="Ảnh bìa sau"
                  className="size-12 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputBackRef.current?.click()}
                  className="px-2 py-1 rounded-md bg-stone-100 text-stone-700 text-[10px] font-semibold cursor-pointer"
                >
                  Đổi ảnh khác
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputBackRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-stone-300 hover:border-amber-400 bg-white text-stone-600 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                {uploadingBack ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                <span>Tải ảnh đính kèm bìa sau</span>
              </button>
            )}
          </div>

          {/* VĂN BẢN BÌA SAU */}
          <div className="space-y-2.5 p-3 rounded-2xl bg-stone-50/90 border border-stone-200">
            <h5 className="font-bold text-stone-900 text-xs border-b border-stone-200/80 pb-1.5">
              Lời Cảm Ơn Màn Kết
            </h5>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Tiêu đề màn kết:
              </label>
              <input
                type="text"
                value={backCover.title || ""}
                onChange={(e) => handleUpdateBackCover({ title: e.target.value })}
                placeholder="Forever & Always"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Lời cảm ơn khách mời:
              </label>
              <textarea
                rows={3}
                value={backCover.subtitle || ""}
                onChange={(e) => handleUpdateBackCover({ subtitle: e.target.value })}
                placeholder="Cảm ơn bạn đã sẻ chia khoảnh khắc hạnh phúc cùng chúng mình!"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-stone-700">Cánh hoa đào rơi:</span>
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
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: QUẢN LÝ TRANG TRONG & LINK GOOGLE DRIVE                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "pages" && (
        <div className="space-y-3 p-3 rounded-2xl bg-stone-50/90 border border-stone-200 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-xs">Trang Trong Album</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {currentAlbum.pages?.length || 0} trang
            </span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed font-light">
            Khách mời có thể lật trang album 3D để ngắm nhìn từng khoảnh khắc kỷ niệm.
          </p>

          <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="size-4 text-amber-600" />
              <span className="text-xs font-semibold text-stone-800">Âm thanh lật giấy</span>
            </div>
            <button
              type="button"
              onClick={() => updateAlbum3D({ ...currentAlbum, soundEnabled: !currentAlbum.soundEnabled })}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                currentAlbum.soundEnabled ? "bg-amber-500 text-stone-950 shadow-2xs" : "bg-stone-200 text-stone-600"
              }`}
            >
              {currentAlbum.soundEnabled ? "BẬT" : "TẮT"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => openAlbum3DEditor("drive")}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition active:scale-95"
          >
            <FolderOpen className="size-4" />
            <span>Mở Quản Lý Ảnh &amp; Google Drive</span>
          </button>
        </div>
      )}
    </div>
  );
}
