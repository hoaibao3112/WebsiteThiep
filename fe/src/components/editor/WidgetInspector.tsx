"use client";

import React, { useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Video,
  Sparkles,
  RefreshCw,
  UploadCloud,
  Play,
  RotateCcw,
  Loader2,
  ArrowUp,
  ArrowDown,
  Images,
} from "lucide-react";
import type { CanvasElement, CanvasWidgetConfig } from "@/types/canvas.types";
import { useEditor } from "./EditorContext";
import { uploadSingleImage } from "@/lib/image-upload";

export function WidgetInspector({ element }: { element: CanvasElement }) {
  const { updateCanvasElement } = useEditor();
  const config = element.widgetConfig ?? {};
  const update = (patch: Partial<CanvasWidgetConfig>) =>
    updateCanvasElement(element.id, { widgetConfig: { ...config, ...patch } });

  const inputClass =
    "w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-stone-500 focus:border-amber-500";

  const [isUploadingSlides, setIsUploadingSlides] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [isUploadingVideoCover, setIsUploadingVideoCover] = useState(false);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoCoverInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingSlideIdx, setReplacingSlideIdx] = useState<number | null>(null);

  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    const trimmed = url.trim();
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    const pathMatch = trimmed.match(/youtube\.com\/(?:shorts|embed|v)\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch) return pathMatch[1];
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch) return vMatch[1];
    return null;
  };

  const handleExtractVideo = (url: string) => {
    const trimmed = url.trim();
    const ytId = extractYouTubeId(trimmed);
    if (ytId) {
      update({
        videoSource: "youtube",
        videoId: ytId,
        videoUrl: trimmed,
        thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      });
      return;
    }
    const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch?.[1]) {
      update({
        videoSource: "vimeo",
        videoId: vimeoMatch[1],
        videoUrl: trimmed,
        thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      });
      return;
    }
    const tiktokMatch = trimmed.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    if (tiktokMatch?.[1]) {
      update({
        videoSource: "tiktok",
        videoId: tiktokMatch[1],
        videoUrl: trimmed,
      });
      return;
    }
    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(trimmed)) {
      update({
        videoSource: "direct-url",
        videoUrl: trimmed,
      });
      return;
    }
    update({ videoUrl: trimmed });
  };

  const handleCarouselMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingSlides(true);
    setUploadProgress(`Đang tải 1/${files.length} ảnh...`);
    try {
      const newSlides = [...(config.slides || [])];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Đang xử lý ảnh ${i + 1}/${files.length}...`);
        const uploadedUrl = await uploadSingleImage(files[i]);
        newSlides.push({
          id: `slide-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
          imageUrl: uploadedUrl,
          caption: "",
          sortOrder: newSlides.length,
        });
      }
      update({ slides: newSlides });
    } catch (err) {
      alert("Tải ảnh thất bại: " + (err instanceof Error ? err.message : "Đã có lỗi xảy ra"));
    } finally {
      setIsUploadingSlides(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  const handleReplaceSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingSlideIdx === null) return;
    setIsUploadingSlides(true);
    try {
      const uploadedUrl = await uploadSingleImage(file);
      const updated = [...(config.slides || [])];
      if (updated[replacingSlideIdx]) {
        updated[replacingSlideIdx] = { ...updated[replacingSlideIdx], imageUrl: uploadedUrl };
        update({ slides: updated });
      }
    } catch (err) {
      alert("Đổi ảnh thất bại");
    } finally {
      setIsUploadingSlides(false);
      setReplacingSlideIdx(null);
      e.target.value = "";
    }
  };

  const handleUploadVideoCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideoCover(true);
    try {
      const uploadedUrl = await uploadSingleImage(file);
      update({ thumbnailUrl: uploadedUrl });
    } catch (err) {
      alert("Tải ảnh bìa thất bại");
    } finally {
      setIsUploadingVideoCover(false);
      e.target.value = "";
    }
  };



  return (
    <fieldset disabled={element.isLocked} className="flex flex-col gap-3 border-b border-stone-200 pb-4 disabled:opacity-60">
      <legend className="pb-2 text-sm font-bold text-stone-900">
        {element.widgetType === "procession-route"
          ? "🚗 Lộ trình rước dâu 2 nhà"
          : element.widgetType === "lace-vow-card"
          ? "📜 Thẻ lời ước viền ren"
          : element.widgetType === "swan-ceremony"
          ? "🦢 Lễ tiệc & Thiên nga"
          : element.widgetType === "embed-video"
          ? "🎬 Nhúng Video"
          : element.widgetType === "carousel"
          ? "🎠 Carousel Ảnh"
          : element.widgetType === "background-video"
          ? "🎥 Video Nền"
          : element.widgetType === "calendar"
          ? "📅 Lịch Ngày Cưới"
          : element.widgetType === "countdown"
          ? "⏰ Đếm Ngược Ngày Cưới"
          : element.widgetType === "map"
          ? "🗺️ Bản Đồ & Chỉ Đường"
          : element.widgetType === "gift"
          ? "🎁 Hộp Mừng Cưới / QR"
          : element.widgetType === "rsvp"
          ? "💌 Xác Nhận Tham Dự (RSVP)"
          : element.widgetType === "contact"
          ? "📞 Nút Liên Hệ Đa Kênh"
          : element.widgetType === "reminder"
          ? "🔔 Thêm Lời Nhắc Lịch"
          : element.widgetType === "custom-form"
          ? "📋 Biểu Mẫu Tùy Chỉnh"
          : element.widgetType === "guest-signature"
          ? "✍️ Sổ Lưu Bút Ký Tên"
          : "Nội dung tiện ích"}
      </legend>

      {/* ── CÁC TRƯỜNG DÀNH RIÊNG CHO LỘ TRÌNH RƯỚC DÂU ── */}
      {element.widgetType === "procession-route" && (
        <div className="space-y-3">
          <div className="rounded-lg bg-rose-50/60 p-2.5 border border-rose-100 space-y-2">
            <span className="text-[11px] font-bold text-rose-900 block uppercase">1. Nhà Gái (Lễ Vu Quy)</span>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tiêu đề lễ
              <input className={inputClass} value={config.brideTitle ?? "LỄ VU QUY"} onChange={(e) => update({ brideTitle: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Thời gian & Thứ
              <input className={inputClass} value={config.brideDate ?? "Vào Thứ Hai - 09h00"} onChange={(e) => update({ brideDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Ngày Âm lịch
              <input className={inputClass} value={config.brideLunarDate ?? "Tức Ngày 16 tháng 12 năm Ất Tỵ"} onChange={(e) => update({ brideLunarDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tên tư gia
              <input className={inputClass} value={config.brideVenue ?? "tại tư gia nhà gái"} onChange={(e) => update({ brideVenue: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Link chỉ đường Google Maps
              <input type="url" className={inputClass} value={config.brideMapUrl ?? ""} placeholder="https://maps.google.com/..." onChange={(e) => update({ brideMapUrl: e.target.value })} />
            </label>
          </div>

          <div className="rounded-lg bg-amber-50/60 p-2.5 border border-amber-100 space-y-2">
            <span className="text-[11px] font-bold text-amber-900 block uppercase">2. Nhà Trai (Lễ Thành Hôn)</span>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tiêu đề lễ
              <input className={inputClass} value={config.groomTitle ?? "LỄ THÀNH HÔN"} onChange={(e) => update({ groomTitle: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Thời gian & Thứ
              <input className={inputClass} value={config.groomDate ?? "Vào Thứ Hai - 14h00"} onChange={(e) => update({ groomDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Ngày Âm lịch
              <input className={inputClass} value={config.groomLunarDate ?? "Tức Ngày 16 tháng 12 năm Ất Tỵ"} onChange={(e) => update({ groomLunarDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tên tư gia
              <input className={inputClass} value={config.groomVenue ?? "TẠI TƯ GIA NHÀ TRAI"} onChange={(e) => update({ groomVenue: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Link chỉ đường Google Maps
              <input type="url" className={inputClass} value={config.groomMapUrl ?? ""} placeholder="https://maps.google.com/..." onChange={(e) => update({ groomMapUrl: e.target.value })} />
            </label>
          </div>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO THẺ LỜI ƯỚC VIỀN REN ── */}
      {element.widgetType === "lace-vow-card" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Kiểu khung ren nghệ thuật
            <select
              className={inputClass}
              value={config.frameStyle ?? "royal"}
              onChange={(e) => update({ frameStyle: e.target.value as "royal" | "gold-arch" | "scalloped" | "lotus" | "rose-cottage" })}
            >
              <option value="royal">Khung ren hoàng gia cổ điển</option>
              <option value="gold-arch">Khung ren vòm dát vàng & ô liu</option>
              <option value="scalloped">Khung giấy viền răng cưa handmade</option>
              <option value="lotus">Khung hoa sen trắng & chữ Hỷ dát vàng</option>
              <option value="rose-cottage">Khung hoa hồng pastel & ngôi nhà</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên Cô Dâu & Chú Rể
            <input className={inputClass} value={config.title ?? "Mạnh Đức & Lan Nhi"} onChange={(e) => update({ title: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Ngày tháng cưới
            <input className={inputClass} value={config.eventDate ?? "29.12.2026"} onChange={(e) => update({ eventDate: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Thơ hẹn ước / Lời ngỏ
            <textarea
              className={inputClass}
              rows={4}
              value={config.vowQuote ?? "Một lời hẹn ước\nMột hành trình mới\nMột mái nhà chung\nMột đời bên nhau"}
              onChange={(e) => update({ vowQuote: e.target.value })}
            />
            <span className="text-[10px] text-stone-400">Xuống dòng để ngắt từng câu thơ.</span>
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO LỄ TIỆC & THIÊN NGA ── */}
      {element.widgetType === "swan-ceremony" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Biểu tượng trang trí
            <select
              className={inputClass}
              value={config.decorIcon ?? "swans"}
              onChange={(e) => update({ decorIcon: e.target.value as "swans" | "car" | "cake" | "wreath" | "none" })}
            >
              <option value="swans">Đôi thiên nga sứ trái tim</option>
              <option value="car">Xe hoa rước dâu pastel</option>
              <option value="cake">Bánh cưới 3 tầng hoa tươi hoàng gia</option>
              <option value="wreath">Vòng hoa baby trắng & cúc Tana</option>
              <option value="none">Không hiển thị biểu tượng</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề lễ
            <input className={inputClass} value={config.title ?? "LỄ THÀNH HÔN"} onChange={(e) => update({ title: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Thời gian & Thứ
            <input className={inputClass} value={config.description ?? "ĐƯỢC TỔ CHỨC VÀO LÚC 09:30, THỨ BẢY"} onChange={(e) => update({ description: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Ngày Âm lịch
            <input className={inputClass} value={config.groomLunarDate ?? "(Tức ngày 18 tháng 10 năm Bính Ngọ)"} onChange={(e) => update({ groomLunarDate: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Địa điểm tổ chức
            <input className={inputClass} value={config.groomVenue ?? "TẠI TƯ GIA NHÀ TRAI"} onChange={(e) => update({ groomVenue: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Địa chỉ cụ thể
            <textarea className={inputClass} rows={2} value={config.groomAddress ?? "174 Đường Trần Văn Kiểu, Phường 10, TP Hồ Chí Minh"} onChange={(e) => update({ groomAddress: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Link bản đồ (Xem chỉ đường)
            <input type="url" className={inputClass} value={config.url ?? ""} placeholder="https://maps.google.com/..." onChange={(e) => update({ url: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên nút chỉ đường
            <input className={inputClass} value={config.buttonLabel ?? "XEM CHỈ ĐƯỜNG"} onChange={(e) => update({ buttonLabel: e.target.value })} />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO NHÚNG VIDEO ── */}
      {element.widgetType === "embed-video" && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Nguồn video
            <select
              className={inputClass}
              value={config.videoSource ?? "youtube"}
              onChange={(e) => update({ videoSource: e.target.value as any })}
            >
              <option value="youtube">YouTube (Video / Shorts)</option>
              <option value="vimeo">Vimeo</option>
              <option value="tiktok">TikTok</option>
              <option value="direct-url">Link trực tiếp (.mp4 / .webm)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            URL Video YouTube / Video
            <input
              className={inputClass}
              value={config.videoUrl ?? ""}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(e) => handleExtractVideo(e.target.value)}
            />
            <span className="text-[10px] text-stone-400">
              Dán link YouTube (tự động nhận diện video, shorts và ảnh bìa)
            </span>
          </label>

          {/* ẢNH BÌA VIDEO (YOUTUBE THUMBNAIL) PREVIEW */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-950 uppercase flex items-center gap-1.5">
                <Video className="size-3.5 text-amber-700" />
                Ảnh Bìa Video (Thumbnail)
              </span>
              {config.videoId && config.videoSource === "youtube" && (
                <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  YouTube: {config.videoId}
                </span>
              )}
            </div>

            {config.thumbnailUrl ? (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-amber-300 shadow-inner group">
                <img
                  src={config.thumbnailUrl}
                  alt="Ảnh bìa video"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg">
                    <Play className="size-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white font-medium">
                  Ảnh bìa hiển thị trên thiệp
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 px-2 border-2 border-dashed border-amber-200 rounded-lg text-center text-stone-400 bg-white/70">
                <Video className="size-6 text-stone-300 mb-1" />
                <span className="text-xs text-stone-600 font-medium">Chưa có ảnh bìa</span>
                <span className="text-[10px] text-stone-400">Dán link YouTube ở trên để tự động hiển thị ảnh bìa</span>
              </div>
            )}

            {/* Upload or Reset cover */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                ref={videoCoverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadVideoCover}
              />
              <button
                type="button"
                disabled={isUploadingVideoCover}
                onClick={() => videoCoverInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-stone-200 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 active:scale-98 transition cursor-pointer disabled:opacity-60"
              >
                {isUploadingVideoCover ? (
                  <>
                    <Loader2 className="size-3 animate-spin text-amber-600" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-3.5 text-amber-600" />
                    <span>Đổi ảnh bìa từ máy</span>
                  </>
                )}
              </button>

              {config.videoId && config.videoSource === "youtube" && (
                <button
                  type="button"
                  onClick={() => {
                    update({ thumbnailUrl: `https://i.ytimg.com/vi/${config.videoId}/hqdefault.jpg` });
                  }}
                  title="Khôi phục ảnh bìa gốc của video YouTube"
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-stone-100 border border-stone-200 px-2 py-1.5 text-[10px] font-medium text-stone-600 hover:bg-stone-200 transition cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Bìa gốc</span>
                </button>
              )}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề video
            <input className={inputClass} value={config.title ?? ""} placeholder="Video Kỷ Niệm" onChange={(e) => update({ title: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tỉ lệ khung hình
            <select
              className={inputClass}
              value={config.aspectRatio ?? "16:9"}
              onChange={(e) => update({ aspectRatio: e.target.value as any })}
            >
              <option value="16:9">16:9 (Ngang chuẩn YouTube)</option>
              <option value="9:16">9:16 (Dọc TikTok / Reels / Shorts)</option>
              <option value="4:3">4:3 (Cổ điển)</option>
              <option value="1:1">1:1 (Vuông)</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.autoPlay ?? false} onChange={(e) => update({ autoPlay: e.target.checked })} />
              Tự động phát
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.muted ?? true} onChange={(e) => update({ muted: e.target.checked })} />
              Tắt tiếng
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.loop ?? false} onChange={(e) => update({ loop: e.target.checked })} />
              Lặp lại
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.showControls !== false} onChange={(e) => update({ showControls: e.target.checked })} />
              Hiện thanh điều khiển
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Chú thích dưới video
            <input className={inputClass} value={config.caption ?? ""} placeholder="Khoảnh khắc hạnh phúc" onChange={(e) => update({ caption: e.target.value })} />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO CAROUSEL (TẢI ẢNH TỪ MÁY) ── */}
      {element.widgetType === "carousel" && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề Carousel
            <input className={inputClass} value={config.title ?? ""} placeholder="Khoảnh Khắc Đáng Nhớ" onChange={(e) => update({ title: e.target.value })} />
          </label>

          {/* Hidden file inputs */}
          <input
            ref={multiFileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleCarouselMultiUpload}
          />
          <input
            ref={replaceFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplaceSlide}
          />

          {/* Upload Button */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">
                Ảnh Trong Slider ({config.slides?.length || 0})
              </span>
              {uploadProgress && (
                <span className="text-[10px] text-amber-700 font-semibold animate-pulse">
                  {uploadProgress}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isUploadingSlides}
              onClick={() => multiFileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs hover:from-amber-700 hover:to-amber-800 active:scale-98 transition cursor-pointer disabled:opacity-60"
            >
              {isUploadingSlides ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{uploadProgress || "Đang tải ảnh..."}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  <span>Tải ảnh từ máy / điện thoại (Chọn nhiều ảnh)</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-stone-500 text-center">
              Hỗ trợ chọn cùng lúc nhiều ảnh JPG, PNG, WebP. Tự động nén tối ưu.
            </p>
          </div>

          {/* Slides List */}
          {(!config.slides || config.slides.length === 0) ? (
            <div
              onClick={() => multiFileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/60 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition group"
            >
              <UploadCloud className="size-8 text-stone-400 group-hover:text-amber-600 mb-1 transition-colors" />
              <span className="text-xs font-semibold text-stone-700 group-hover:text-amber-900">
                Chưa có ảnh nào trong Carousel
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5">
                Nhấn vào đây để tải ảnh cưới từ máy của bạn
              </span>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(config.slides || []).map((slide, idx) => (
                <div key={slide.id || idx} className="flex items-center gap-2.5 rounded-xl border border-stone-200 p-2 bg-white shadow-2xs hover:border-stone-300 transition">
                  <div className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                    <img src={slide.imageUrl} alt="" className="size-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <input
                      className={inputClass}
                      value={slide.caption || ""}
                      placeholder="Chú thích ảnh (tùy chọn)"
                      onChange={(e) => {
                        const updated = [...(config.slides || [])];
                        updated[idx] = { ...updated[idx], caption: e.target.value };
                        update({ slides: updated });
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingSlideIdx(idx);
                          replaceFileInputRef.current?.click();
                        }}
                        className="text-[10px] text-amber-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="size-2.5" /> Đổi ảnh
                      </button>
                      <span className="text-[10px] text-stone-300">|</span>
                      <span className="text-[10px] text-stone-400">Ảnh #{idx + 1}</span>
                    </div>
                  </div>

                  {/* Reorder and Delete buttons */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        if (idx === 0) return;
                        const updated = [...(config.slides || [])];
                        const temp = updated[idx - 1];
                        updated[idx - 1] = updated[idx];
                        updated[idx] = temp;
                        update({ slides: updated });
                      }}
                      className="text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer p-0.5"
                      title="Lên trên"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (config.slides?.length || 0) - 1}
                      onClick={() => {
                        const updated = [...(config.slides || [])];
                        if (idx >= updated.length - 1) return;
                        const temp = updated[idx + 1];
                        updated[idx + 1] = updated[idx];
                        updated[idx] = temp;
                        update({ slides: updated });
                      }}
                      className="text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer p-0.5"
                      title="Xuống dưới"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (config.slides || []).filter((_, i) => i !== idx);
                        update({ slides: updated });
                      }}
                      className="text-stone-400 hover:text-rose-600 cursor-pointer p-0.5"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.autoPlay ?? true} onChange={(e) => update({ autoPlay: e.target.checked })} />
              Tự động chuyển
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.showArrows ?? true} onChange={(e) => update({ showArrows: e.target.checked })} />
              Nút mũi tên
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.showDots ?? true} onChange={(e) => update({ showDots: e.target.checked })} />
              Chấm phân trang
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.loop !== false} onChange={(e) => update({ loop: e.target.checked })} />
              Lặp vô tận
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Thời gian chuyển (giây)
            <input
              type="number"
              min={1}
              max={20}
              className={inputClass}
              value={config.autoPlayInterval ?? 4}
              onChange={(e) => update({ autoPlayInterval: Number(e.target.value) })}
            />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO VIDEO NỀN ── */}
      {element.widgetType === "background-video" && (
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled !== false}
              onChange={(e) => update({ enabled: e.target.checked })}
            />
            Kích hoạt video nền
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Nguồn video
            <select
              className={inputClass}
              value={config.videoSource ?? "upload"}
              onChange={(e) => update({ videoSource: e.target.value as any })}
            >
              <option value="upload">Upload lên máy chủ</option>
              <option value="youtube">YouTube</option>
              <option value="direct-url">Link trực tiếp (.mp4 / .webm)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            URL Video
            <input
              className={inputClass}
              value={config.videoUrl ?? ""}
              placeholder="https://... (.mp4)"
              onChange={(e) => handleExtractVideo(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Phạm vi hiển thị
            <select
              className={inputClass}
              value={config.displayMode ?? "hero-section"}
              onChange={(e) => update({ displayMode: e.target.value as any })}
            >
              <option value="hero-section">Chỉ phần đầu thiệp (Hero Section)</option>
              <option value="fullscreen">Toàn trang thiệp cưới</option>
              <option value="section-bg">Theo từng phân đoạn</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Độ mờ video: {Math.round((config.opacity ?? 0.6) * 100)}%
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={config.opacity ?? 0.6}
              onChange={(e) => update({ opacity: Number(e.target.value) })}
              className="w-full accent-amber-600"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.autoPlay !== false} onChange={(e) => update({ autoPlay: e.target.checked })} />
              Tự động phát
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={config.loop !== false} onChange={(e) => update({ loop: e.target.checked })} />
              Lặp video
            </label>
          </div>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO LỊCH ── */}
      {element.widgetType === "calendar" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề
            <input className={inputClass} value={config.title ?? "Save The Date"} onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Ngày giờ tổ chức
            <input
              type="datetime-local"
              className={inputClass}
              value={config.eventDate ? config.eventDate.slice(0, 16) : ""}
              onChange={(e) => update({ eventDate: e.target.value ? `${e.target.value}:00+07:00` : "" })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Ngày Âm lịch
            <input className={inputClass} value={config.lunarDate ?? ""} placeholder="Tức Ngày 16 tháng 08 năm Ất Tỵ" onChange={(e) => update({ lunarDate: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Kiểu lịch
            <select
              className={inputClass}
              value={config.calendarStyle ?? "full-month"}
              onChange={(e) => update({ calendarStyle: e.target.value as any })}
            >
              <option value="full-month">Hiển thị cả tháng có highlight</option>
              <option value="classic">Lịch bảng truyền thống</option>
              <option value="circle">Vòng tròn nổi bật ngày cưới</option>
              <option value="minimal">Tối giản (Ngày - Tháng - Năm)</option>
            </select>
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO ĐẾM NGƯỢC ── */}
      {element.widgetType === "countdown" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề
            <input className={inputClass} value={config.title ?? "Đếm Ngược Ngày Trọng Đại"} onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Ngày giờ mục tiêu
            <input
              type="datetime-local"
              className={inputClass}
              value={config.eventDate ? config.eventDate.slice(0, 16) : ""}
              onChange={(e) => update({ eventDate: e.target.value ? `${e.target.value}:00+07:00` : "" })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Kiểu đồng hồ
            <select
              className={inputClass}
              value={config.countdownStyle ?? "elegant-box"}
              onChange={(e) => update({ countdownStyle: e.target.value as any })}
            >
              <option value="elegant-box">Hộp bo tròn nền mờ thanh lịch</option>
              <option value="flip-clock">Đồng hồ lật số (Flip Clock)</option>
              <option value="circle-ring">Vòng tròn tiến trình</option>
              <option value="simple-text">Chữ số lớn đơn giản</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Thông báo khi hết giờ
            <input className={inputClass} value={config.endMessage ?? "🎉 Hôm nay là ngày trọng đại!"} onChange={(e) => update({ endMessage: e.target.value })} />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO BẢN ĐỒ ── */}
      {element.widgetType === "map" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề
            <input className={inputClass} value={config.title ?? "Địa Điểm Tổ Chức"} onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Liên kết Google Maps
            <input type="url" className={inputClass} value={config.url ?? ""} placeholder="https://maps.google.com/..." onChange={(e) => update({ url: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên nút chỉ đường
            <input className={inputClass} value={config.buttonLabel ?? "Xem chỉ đường"} onChange={(e) => update({ buttonLabel: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Chế độ hiển thị bản đồ
            <select
              className={inputClass}
              value={config.mapDisplayMode ?? "embed-iframe"}
              onChange={(e) => update({ mapDisplayMode: e.target.value as any })}
            >
              <option value="embed-iframe">Nhúng bản đồ Google Maps tương tác</option>
              <option value="static-image">Ảnh tĩnh bản đồ</option>
              <option value="directions-only">Chỉ hiển thị nút chỉ đường</option>
            </select>
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO HỘP MỪNG CƯỚI / QR ── */}
      {element.widgetType === "gift" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề
            <input className={inputClass} value={config.title ?? "Hộp Mừng Cưới"} onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Nội dung ngỏ lời
            <textarea className={inputClass} rows={2} value={config.description ?? "Quý khách có thể mừng cưới qua mã QR tiện lợi"} onChange={(e) => update({ description: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Lời cảm ơn
            <input className={inputClass} value={config.thankYouMessage ?? "Xin chân thành cảm ơn! 💝"} onChange={(e) => update({ thankYouMessage: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Kiểu hiển thị
            <select
              className={inputClass}
              value={config.displayMode ?? "popup-modal"}
              onChange={(e) => update({ displayMode: e.target.value as any })}
            >
              <option value="popup-modal">Popup modal 2 tab (Chú Rể / Cô Dâu)</option>
              <option value="inline">Hiển thị trực tiếp trên thiệp</option>
              <option value="floating-button">Nút nổi tròn góc dưới</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên nút mở
            <input className={inputClass} value={config.buttonLabel ?? "Mở hộp mừng cưới"} onChange={(e) => update({ buttonLabel: e.target.value })} />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH RIÊNG CHO RSVP ── */}
      {element.widgetType === "rsvp" && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề form
            <input className={inputClass} value={config.rsvpTitle ?? config.title ?? ""} placeholder="Xác Nhận Tham Dự" onChange={(e) => update({ rsvpTitle: e.target.value, title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Mô tả / Lời ngỏ
            <textarea className={inputClass} rows={2} value={config.rsvpSubtitle ?? config.description ?? ""} placeholder="Sự hiện diện của quý khách..." onChange={(e) => update({ rsvpSubtitle: e.target.value, description: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên nút gửi
            <input className={inputClass} value={config.rsvpButtonText ?? config.buttonLabel ?? ""} placeholder="Gửi Xác Nhận" onChange={(e) => update({ rsvpButtonText: e.target.value, buttonLabel: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Màu nút xác nhận
            <div className="flex items-center gap-2">
              <input type="color" className="size-8 rounded border border-stone-200 cursor-pointer" value={config.rsvpButtonColor || "#D4AF37"} onChange={(e) => update({ rsvpButtonColor: e.target.value })} />
              <input className={inputClass} value={config.rsvpButtonColor || "#D4AF37"} onChange={(e) => update({ rsvpButtonColor: e.target.value })} />
            </div>
          </label>
          <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200 space-y-2">
            <span className="text-[11px] font-bold text-stone-700 block uppercase">Tùy Chọn Các Trường Form</span>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input type="checkbox" checked={config.rsvpShowGuestCount !== false} onChange={(e) => update({ rsvpShowGuestCount: e.target.checked })} />
              Hỏi số người tham dự cùng
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input type="checkbox" checked={config.rsvpShowSide !== false} onChange={(e) => update({ rsvpShowSide: e.target.checked })} />
              Hỏi khách phía nhà Trai / Gái
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input type="checkbox" checked={config.rsvpShowNote !== false} onChange={(e) => update({ rsvpShowNote: e.target.checked })} />
              Ô nhập lời chúc & ghi chú món ăn
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input type="checkbox" checked={config.rsvpShowPhone !== false} onChange={(e) => update({ rsvpShowPhone: e.target.checked })} />
              Trường số điện thoại
            </label>
            {config.rsvpShowPhone !== false && (
              <label className="flex items-center gap-2 text-xs text-stone-700 ml-4 cursor-pointer">
                <input type="checkbox" checked={config.rsvpRequirePhone !== false} onChange={(e) => update({ rsvpRequirePhone: e.target.checked })} />
                Bắt buộc điền số điện thoại
              </label>
            )}
          </div>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Thông báo sau khi gửi thành công
            <textarea className={inputClass} rows={2} value={config.rsvpSuccessMessage ?? ""} placeholder="Cảm ơn quý khách đã phản hồi..." onChange={(e) => update({ rsvpSuccessMessage: e.target.value })} />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH RIÊNG CHO NÚT LIÊN HỆ ĐA KÊNH ── */}
      {element.widgetType === "contact" && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề
            <input className={inputClass} value={config.contactTitle ?? config.title ?? ""} placeholder="Liên Hệ Gia Đình" onChange={(e) => update({ contactTitle: e.target.value, title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Mô tả
            <input className={inputClass} value={config.contactSubtitle ?? config.description ?? ""} placeholder="Liên hệ trực tiếp..." onChange={(e) => update({ contactSubtitle: e.target.value, description: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs text-stone-700">
              Kiểu hiển thị
              <select className={inputClass} value={config.contactStyle ?? "buttons-row"} onChange={(e) => update({ contactStyle: e.target.value as any })}>
                <option value="buttons-row">Các nút ngang hàng</option>
                <option value="buttons-grid">Dạng lưới 2 cột</option>
                <option value="list">Danh sách dọc</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-stone-700">
              Kích thước nút
              <select className={inputClass} value={config.contactButtonSize ?? "md"} onChange={(e) => update({ contactButtonSize: e.target.value as any })}>
                <option value="sm">Nhỏ (sm)</option>
                <option value="md">Vừa (md)</option>
                <option value="lg">Lớn (lg)</option>
              </select>
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800">Danh Sách Kênh Liên Hệ</span>
              <button
                type="button"
                onClick={() => {
                  const current = config.contactChannels || [];
                  const newChannel = {
                    id: `ch-${Date.now()}`,
                    type: "phone" as const,
                    label: "Gọi Chú Rể",
                    value: "0901234567",
                    enabled: true,
                    sortOrder: current.length,
                    buttonColor: "#2563EB",
                  };
                  update({ contactChannels: [...current, newChannel] });
                }}
                className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-200 cursor-pointer"
              >
                <Plus className="size-3" /> Thêm Kênh
              </button>
            </div>
            {(config.contactChannels || []).map((ch, idx) => (
              <div key={ch.id} className="rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700">Kênh #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (config.contactChannels || []).filter(c => c.id !== ch.id);
                      update({ contactChannels: updated });
                    }}
                    className="text-stone-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    className={inputClass}
                    value={ch.type}
                    onChange={(e) => {
                      const updated = [...(config.contactChannels || [])];
                      updated[idx] = { ...updated[idx], type: e.target.value as any };
                      update({ contactChannels: updated });
                    }}
                  >
                    <option value="phone">Gọi điện (Phone)</option>
                    <option value="zalo">Nhắn Zalo</option>
                    <option value="messenger">Facebook Messenger</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="telegram">Telegram</option>
                  </select>
                  <input
                    className={inputClass}
                    value={ch.label}
                    placeholder="Nhãn nút (vd: Gọi Chú Rể)"
                    onChange={(e) => {
                      const updated = [...(config.contactChannels || [])];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      update({ contactChannels: updated });
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5 items-center">
                  <input
                    className={`${inputClass} col-span-2`}
                    value={ch.value}
                    placeholder="Số ĐT hoặc Link"
                    onChange={(e) => {
                      const updated = [...(config.contactChannels || [])];
                      updated[idx] = { ...updated[idx], value: e.target.value };
                      update({ contactChannels: updated });
                    }}
                  />
                  <input
                    type="color"
                    className="size-8 w-full rounded border border-stone-200 cursor-pointer"
                    value={ch.buttonColor || "#1E293B"}
                    onChange={(e) => {
                      const updated = [...(config.contactChannels || [])];
                      updated[idx] = { ...updated[idx], buttonColor: e.target.value };
                      update({ contactChannels: updated });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH RIÊNG CHO LỜI NHẮC CALENDAR ── */}
      {element.widgetType === "reminder" && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề widget
            <input className={inputClass} value={config.reminderTitle ?? config.title ?? ""} placeholder="Đừng Quên Ngày Trọng Đại" onChange={(e) => update({ reminderTitle: e.target.value, title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên sự kiện trên lịch
            <input className={inputClass} value={config.reminderEventTitle ?? ""} placeholder="Lễ Cưới Mạnh Đức & Lan Nhi" onChange={(e) => update({ reminderEventTitle: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Mô tả sự kiện
            <textarea className={inputClass} rows={2} value={config.reminderEventDescription ?? ""} placeholder="Trân trọng kính mời..." onChange={(e) => update({ reminderEventDescription: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Địa điểm tổ chức
            <input className={inputClass} value={config.reminderEventLocation ?? ""} placeholder="Trung tâm tiệc cưới..." onChange={(e) => update({ reminderEventLocation: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs text-stone-700">
              Kiểu hiển thị
              <select className={inputClass} value={config.reminderStyle ?? "card"} onChange={(e) => update({ reminderStyle: e.target.value as any })}>
                <option value="card">Thẻ chi tiết (card)</option>
                <option value="button-row">Các nút ngang</option>
                <option value="single-button">1 Nút đơn</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-stone-700">
              Thời lượng sự kiện
              <select className={inputClass} value={config.reminderDurationMinutes ?? 240} onChange={(e) => update({ reminderDurationMinutes: Number(e.target.value) })}>
                <option value={120}>2 giờ</option>
                <option value={180}>3 giờ</option>
                <option value={240}>4 giờ</option>
                <option value={360}>6 giờ</option>
                <option value={480}>Cả ngày (8h)</option>
              </select>
            </label>
          </div>
          <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200 space-y-1.5">
            <span className="text-[11px] font-bold text-stone-700 block uppercase">Nền tảng hỗ trợ</span>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input type="checkbox" checked={config.reminderShowGoogle !== false} onChange={(e) => update({ reminderShowGoogle: e.target.checked })} />
              Google Calendar
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input type="checkbox" checked={config.reminderShowApple !== false} onChange={(e) => update({ reminderShowApple: e.target.checked })} />
              Apple / Outlook (.ics file)
            </label>
          </div>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH RIÊNG CHO BIỂU MẪU TÙY CHỈNH ── */}
      {element.widgetType === "custom-form" && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề biểu mẫu
            <input className={inputClass} value={config.customFormTitle ?? config.title ?? ""} placeholder="Khảo Sát Khách Mời" onChange={(e) => update({ customFormTitle: e.target.value, title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Lời ngỏ / Mô tả
            <textarea className={inputClass} rows={2} value={config.customFormSubtitle ?? config.description ?? ""} placeholder="Vui lòng để lại thông tin..." onChange={(e) => update({ customFormSubtitle: e.target.value, description: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên nút gửi
            <input className={inputClass} value={config.customFormButtonText ?? "Gửi Thông Tin"} onChange={(e) => update({ customFormButtonText: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
            <input type="checkbox" checked={Boolean(config.customFormAllowMultipleSubmit)} onChange={(e) => update({ customFormAllowMultipleSubmit: e.target.checked })} />
            Cho phép khách gửi nhiều lần
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800">Các Câu Hỏi / Trường Dữ Liệu</span>
              <button
                type="button"
                onClick={() => {
                  const current = config.customFormFields || [];
                  const newField = {
                    id: `field-${Date.now()}`,
                    type: "text" as const,
                    label: `Câu hỏi ${current.length + 1}`,
                    placeholder: "",
                    required: false,
                    sortOrder: current.length,
                  };
                  update({ customFormFields: [...current, newField] });
                }}
                className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-200 cursor-pointer"
              >
                <Plus className="size-3" /> Thêm Trường
              </button>
            </div>
            {(config.customFormFields || []).map((f, idx) => (
              <div key={f.id} className="rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700">Trường #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (config.customFormFields || []).filter(item => item.id !== f.id);
                      update({ customFormFields: updated });
                    }}
                    className="text-stone-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    className={inputClass}
                    value={f.type}
                    onChange={(e) => {
                      const updated = [...(config.customFormFields || [])];
                      updated[idx] = { ...updated[idx], type: e.target.value as any };
                      update({ customFormFields: updated });
                    }}
                  >
                    <option value="text">Chữ ngắn (Text)</option>
                    <option value="phone">Số điện thoại</option>
                    <option value="email">Email</option>
                    <option value="number">Số lượng (Number)</option>
                    <option value="textarea">Văn bản dài (Textarea)</option>
                    <option value="select">Menu chọn 1 (Dropdown)</option>
                    <option value="radio">Nút tròn chọn 1 (Radio)</option>
                    <option value="checkbox">Nhiều lựa chọn (Checkbox)</option>
                    <option value="rating">Đánh giá sao (Rating 1-5)</option>
                  </select>
                  <input
                    className={inputClass}
                    value={f.label}
                    placeholder="Tiêu đề câu hỏi *"
                    onChange={(e) => {
                      const updated = [...(config.customFormFields || [])];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      update({ customFormFields: updated });
                    }}
                  />
                </div>
                {(f.type === "select" || f.type === "radio" || f.type === "checkbox") && (
                  <input
                    className={inputClass}
                    value={(f.options || []).join(", ")}
                    placeholder="Các lựa chọn (ngăn cách bởi dấu phẩy)"
                    onChange={(e) => {
                      const updated = [...(config.customFormFields || [])];
                      const opts = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                      updated[idx] = { ...updated[idx], options: opts };
                      update({ customFormFields: updated });
                    }}
                  />
                )}
                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => {
                      const updated = [...(config.customFormFields || [])];
                      updated[idx] = { ...updated[idx], required: e.target.checked };
                      update({ customFormFields: updated });
                    }}
                  />
                  Bắt buộc khách phải điền
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH RIÊNG CHO CHỮ KÝ KHÁCH MỜI ── */}
      {element.widgetType === "guest-signature" && (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề widget
            <input className={inputClass} value={config.signatureTitle ?? config.title ?? ""} placeholder="Sổ Lưu Bút Kỹ Thuật Số" onChange={(e) => update({ signatureTitle: e.target.value, title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Mô tả / Lời nhắn
            <textarea className={inputClass} rows={2} value={config.signatureSubtitle ?? config.description ?? ""} placeholder="Hãy để lại chữ ký..." onChange={(e) => update({ signatureSubtitle: e.target.value, description: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Hướng dẫn ký tên
            <input className={inputClass} value={config.signatureInstructions ?? ""} placeholder="Vẽ chữ ký vào ô bên dưới" onChange={(e) => update({ signatureInstructions: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs text-stone-700">
              Màu mực vẽ
              <div className="flex items-center gap-1.5">
                <input type="color" className="size-8 rounded border border-stone-200 cursor-pointer" value={config.signaturePenColor || "#2C1810"} onChange={(e) => update({ signaturePenColor: e.target.value })} />
                <input className={inputClass} value={config.signaturePenColor || "#2C1810"} onChange={(e) => update({ signaturePenColor: e.target.value })} />
              </div>
            </label>
            <label className="flex flex-col gap-1 text-xs text-stone-700">
              Màu nền canvas
              <div className="flex items-center gap-1.5">
                <input type="color" className="size-8 rounded border border-stone-200 cursor-pointer" value={config.signatureCanvasColor || "#FFFDF9"} onChange={(e) => update({ signatureCanvasColor: e.target.value })} />
                <input className={inputClass} value={config.signatureCanvasColor || "#FFFDF9"} onChange={(e) => update({ signatureCanvasColor: e.target.value })} />
              </div>
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
            <input type="checkbox" checked={config.signatureShowGallery !== false} onChange={(e) => update({ signatureShowGallery: e.target.checked })} />
            Hiển thị nút xem thư viện chữ ký của các khách khác
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên nút ký
            <input className={inputClass} value={config.signatureButtonText ?? "Ký Tên Ngay"} onChange={(e) => update({ signatureButtonText: e.target.value })} />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG TIỆN ÍCH CƠ BẢN KHÁC (album, guest-name, envelope...) ── */}
      {element.widgetType !== "procession-route" &&
        element.widgetType !== "lace-vow-card" &&
        element.widgetType !== "swan-ceremony" &&
        element.widgetType !== "embed-video" &&
        element.widgetType !== "carousel" &&
        element.widgetType !== "background-video" &&
        element.widgetType !== "calendar" &&
        element.widgetType !== "countdown" &&
        element.widgetType !== "map" &&
        element.widgetType !== "gift" &&
        element.widgetType !== "rsvp" &&
        element.widgetType !== "contact" &&
        element.widgetType !== "reminder" &&
        element.widgetType !== "custom-form" &&
        element.widgetType !== "guest-signature" && (
          <>
            <label className="flex items-center gap-2 text-xs">
              <input
                name="widgetShowTitle"
                type="checkbox"
                checked={config.showTitle !== false}
                onChange={(event) => update({ showTitle: event.target.checked })}
              />
              Hiển thị tiêu đề
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Tiêu đề
              <input className={inputClass} value={config.title ?? ""} onChange={(event) => update({ title: event.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Nội dung
              <textarea className={inputClass} rows={3} value={config.description ?? ""} onChange={(event) => update({ description: event.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Tên nút
              <input className={inputClass} value={config.buttonLabel ?? ""} onChange={(event) => update({ buttonLabel: event.target.value })} />
            </label>
            {element.widgetType === "guest-name" && (
              <label className="flex flex-col gap-1 text-xs">
                Tên khách mặc định (fallback)
                <input className={inputClass} value={config.description ?? "Quý khách"} placeholder="Quý khách" onChange={(event) => update({ description: event.target.value })} />
              </label>
            )}
          </>
        )}
    </fieldset>
  );
}
