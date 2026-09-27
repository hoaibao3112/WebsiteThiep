"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  Upload,
  Trash2,
  MoveUp,
  MoveDown,
  Volume2,
  VolumeX,
  Palette,
  Check,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  Album3DConfig,
  Album3DPage,
  AlbumCoverTheme,
  DEFAULT_ALBUM_3D_CONFIG,
  parseMultipleGoogleDriveLinks,
  extractGoogleDriveFolderId,
} from "@/types/album-3d.types";
import { ApiClient } from "@/lib/api";
import { uploadSingleImage } from "@/lib/image-upload";

interface Album3DManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  initialConfig?: Album3DConfig;
  onSaved?: (updatedConfig: Album3DConfig) => void;
}

const THEME_OPTIONS: Array<{
  id: AlbumCoverTheme;
  name: string;
  desc: string;
  colorClass: string;
  bgHex: string;
}> = [
  {
    id: "leather-burgundy",
    name: "Vân Da Đỏ Rượu",
    desc: "Sang trọng hoàng gia, dập chỉ vàng kim",
    colorClass: "bg-[#4A0E17] border-[#D4AF37]",
    bgHex: "#4A0E17",
  },
  {
    id: "linen-cream",
    name: "Vải Linen Kem",
    desc: "Tinh khôi, mộc mạc phong cách vintage",
    colorClass: "bg-[#F5F2EB] border-[#8C7A5E]",
    bgHex: "#F5F2EB",
  },
  {
    id: "royal-gold",
    name: "Ánh Kim Hoàng Gia",
    desc: "Lộng lẫy, dập nổi kim loại quý phái",
    colorClass: "bg-[#D4AF37] border-white",
    bgHex: "#D4AF37",
  },
  {
    id: "minimalist-dark",
    name: "Tối Giản Hàn Quốc",
    desc: "Đen tuyền hiện đại phong cách studio",
    colorClass: "bg-[#1A1A1E] border-stone-600",
    bgHex: "#1A1A1E",
  },
];

export function Album3DManagerModal({
  isOpen,
  onClose,
  cardId,
  initialConfig,
  onSaved,
}: Album3DManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"drive" | "upload" | "settings">("drive");
  const [config, setConfig] = useState<Album3DConfig>(initialConfig || DEFAULT_ALBUM_3D_CONFIG);
  const [driveInput, setDriveInput] = useState("");
  const [isScanningDrive, setIsScanningDrive] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);

  // Load config ban đầu từ backend nếu chưa có
  useEffect(() => {
    if (isOpen && cardId) {
      if (initialConfig) {
        setConfig(initialConfig);
      } else {
        ApiClient.request<Album3DConfig>(`/cards/${cardId}/album-3d`)
          .then((res) => {
            if (res.success && res.data) {
              setConfig(res.data);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, cardId, initialConfig]);

  if (!isOpen) return null;

  // 1. Quét và nhập link Google Drive
  const handleScanDrive = async () => {
    const trimmed = driveInput.trim();
    if (!trimmed) {
      setScanMessage({ text: "Vui lòng dán link thư mục hoặc link ảnh Google Drive.", type: "error" });
      return;
    }

    setIsScanningDrive(true);
    setScanMessage({ text: "Đang phân tích link Google Drive...", type: "info" });

    try {
      const folderId = extractGoogleDriveFolderId(trimmed);

      // Thử gọi backend để quét folder hoặc phân tích
      const res = await ApiClient.request<{
        type: "folder" | "links";
        photos: Array<{ fileId: string; directUrl: string }>;
      }>(`/cards/${cardId}/google-drive-import`, {
        method: "POST",
        body: JSON.stringify({ input: trimmed }),
      });

      let foundPhotos: Array<{ fileId: string; directUrl: string }> = [];

      if (res.success && res.data && res.data.photos?.length > 0) {
        foundPhotos = res.data.photos;
      } else {
        // Fallback phân tích client-side
        foundPhotos = parseMultipleGoogleDriveLinks(trimmed);
      }

      if (foundPhotos.length === 0) {
        setScanMessage({
          text: folderId
            ? "Chưa tìm thấy ảnh công khai trong thư mục này. Hãy đảm bảo thư mục Google Drive đã chọn quyền 'Bất kỳ ai có liên kết đều có thể xem'."
            : "Không tìm thấy link ảnh Google Drive hợp lệ. Hãy kiểm tra lại định dạng link.",
          type: "error",
        });
        setIsScanningDrive(false);
        return;
      }

      // Chuyển đổi thành các trang Album3D
      const newPages: Album3DPage[] = foundPhotos.map((photo, idx) => ({
        id: `drive-${photo.fileId}-${Date.now()}-${idx}`,
        url: photo.directUrl,
        caption: `Khoảnh khắc ${config.pages.length + idx + 1}`,
        aspectRatio: "portrait",
        sortOrder: config.pages.length + idx,
      }));

      setConfig((prev) => ({
        ...prev,
        pages: [...prev.pages, ...newPages],
      }));

      setScanMessage({
        text: `Nhập thành công ${foundPhotos.length} ảnh vào Album 3D! Bạn có thể kéo thả sắp xếp lại thứ tự bên dưới.`,
        type: "success",
      });
      setDriveInput("");
    } catch {
      // Fallback client parser
      const clientPhotos = parseMultipleGoogleDriveLinks(trimmed);
      if (clientPhotos.length > 0) {
        const newPages: Album3DPage[] = clientPhotos.map((photo, idx) => ({
          id: `drive-${photo.fileId}-${Date.now()}-${idx}`,
          url: photo.directUrl,
          caption: `Khoảnh khắc ${config.pages.length + idx + 1}`,
          aspectRatio: "portrait",
          sortOrder: config.pages.length + idx,
        }));
        setConfig((prev) => ({
          ...prev,
          pages: [...prev.pages, ...newPages],
        }));
        setScanMessage({
          text: `Đã nhập ${clientPhotos.length} ảnh từ Google Drive thành công!`,
          type: "success",
        });
        setDriveInput("");
      } else {
        setScanMessage({ text: "Lỗi kết nối khi quét Google Drive. Vui lòng thử lại.", type: "error" });
      }
    } finally {
      setIsScanningDrive(false);
    }
  };

  // 2. Kéo thả tải ảnh từ máy tính/điện thoại
  const handleLocalFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingLocal(true);
    const newPages: Album3DPage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      try {
        const safeUrl = await uploadSingleImage(file);
        newPages.push({
          id: `local-${Date.now()}-${i}`,
          url: safeUrl,
          caption: file.name.replace(/\.[^.]+$/, ""),
          aspectRatio: "portrait",
          sortOrder: config.pages.length + newPages.length,
        });
      } catch {
        // bỏ qua ảnh lỗi
      }
    }

    if (newPages.length > 0) {
      setConfig((prev) => ({
        ...prev,
        pages: [...prev.pages, ...newPages],
      }));
    }
    setIsUploadingLocal(false);
    e.target.value = "";
  };

  // Di chuyển trang lên/xuống
  const movePage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.pages.length) return;

    const updated = [...config.pages];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Cập nhật lại sortOrder
    const normalized = updated.map((p, idx) => ({ ...p, sortOrder: idx }));
    setConfig((prev) => ({ ...prev, pages: normalized }));
  };

  // Xóa trang
  const removePage = (index: number) => {
    const updated = config.pages.filter((_, idx) => idx !== index);
    const normalized = updated.map((p, idx) => ({ ...p, sortOrder: idx }));
    setConfig((prev) => ({ ...prev, pages: normalized }));
  };

  // Cập nhật caption trang
  const updateCaption = (index: number, caption: string) => {
    const updated = [...config.pages];
    if (updated[index]) {
      updated[index] = { ...updated[index], caption };
      setConfig((prev) => ({ ...prev, pages: updated }));
    }
  };

  // 3. Lưu cấu hình Album 3D vào Backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await ApiClient.request<Album3DConfig>(`/cards/${cardId}/album-3d`, {
        method: "PUT",
        body: JSON.stringify(config),
      });

      if (res.success && res.data) {
        onSaved?.(res.data);
      } else {
        onSaved?.(config);
      }
      onClose();
    } catch {
      onSaved?.(config);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 shadow-2xs">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-stone-900">Quản Lý Album Ảnh Cưới 3D</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                  VIP 3D Flipbook
                </span>
              </div>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Nhập ảnh từ Google Drive, sắp xếp trang và tùy biến bìa sách lật 3D chân thực
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 pt-3 border-b border-stone-200 flex items-center gap-2 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("drive")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "drive"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <LinkIcon className="size-4" />
            <span>Nhập từ Google Drive</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "upload"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Upload className="size-4" />
            <span>Tải ảnh từ máy ({config.pages.length} trang)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === "settings"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Palette className="size-4" />
            <span>Cài đặt Bìa &amp; Hiệu ứng</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GOOGLE DRIVE IMPORT */}
          {activeTab === "drive" && (
            <div className="space-y-5 animate-in fade-in">
              {/* Box Hướng dẫn thao tác dễ dàng */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <HelpCircle className="size-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed space-y-1">
                  <p className="font-bold">Cách lấy link từ Google Drive Studio gửi cho bạn:</p>
                  <p>
                    1. Mở thư mục ảnh cưới trên Google Drive, bấm nút <strong>Chia sẻ (Share)</strong>.
                  </p>
                  <p>
                    2. Tại mục Quyền truy cập chung, chọn: <strong>&quot;Bất kỳ ai có đường liên kết&quot; (Người xem)</strong>.
                  </p>
                  <p>
                    3. Bấm <strong>Sao chép đường liên kết (Copy link)</strong> và dán vào ô bên dưới. Hệ thống sẽ tự động bóc tách toàn bộ ảnh!
                  </p>
                </div>
              </div>

              {/* Ô dán link Google Drive */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Dán link Thư mục Google Drive hoặc Danh sách link ảnh
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={driveInput}
                    onChange={(e) => setDriveInput(e.target.value)}
                    placeholder="Ví dụ: https://drive.google.com/drive/folders/1R175CquKkvE8af3MsLDpHorUNyhUmC_k&#10;Hoặc dán nhiều link ảnh / file ID chia sẻ..."
                    className="w-full p-3.5 rounded-2xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-hidden text-xs sm:text-sm font-mono transition"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    Hỗ trợ: Link thư mục công khai, link chia sẻ ảnh đơn lẻ, file ID
                  </span>
                  <button
                    type="button"
                    onClick={handleScanDrive}
                    disabled={isScanningDrive || !driveInput.trim()}
                    className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isScanningDrive ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-amber-400" />}
                    <span>{isScanningDrive ? "Đang quét..." : "Quét & Nhập Ngay"}</span>
                  </button>
                </div>
              </div>

              {/* Thông báo kết quả quét */}
              {scanMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                    scanMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : scanMessage.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{scanMessage.text}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD TỪ MÁY */}
          {activeTab === "upload" && (
            <div className="space-y-4 animate-in fade-in">
              <label className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-stone-50 hover:bg-amber-50/30 transition group">
                <Upload className="size-10 text-stone-400 group-hover:text-amber-600 transition mb-3" />
                <span className="text-sm font-bold text-stone-800 group-hover:text-amber-800">
                  {isUploadingLocal ? "Đang xử lý và nén ảnh..." : "Bấm để chọn nhiều ảnh cưới từ máy"}
                </span>
                <span className="text-xs text-stone-500 mt-1">Hỗ trợ JPG, PNG, WEBP (Tự động nén tối ưu hiển thị 3D)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleLocalFilesUpload}
                  disabled={isUploadingLocal}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 3: SETTINGS BÌA ALBUM & HIỆU ỨNG */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Chọn màu bìa Photobook */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Chọn phong cách Bìa Album Mỹ Thuật
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = config.coverTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setConfig((prev) => ({ ...prev, coverTheme: theme.id }))}
                        className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3.5 transition ${
                          isSelected
                            ? "border-amber-500 bg-amber-50/40 shadow-sm"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className={`size-10 rounded-xl border ${theme.colorClass} shadow-inner shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-stone-900">{theme.name}</span>
                            {isSelected && <Check className="size-4 text-amber-600" />}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">{theme.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tùy chỉnh chữ trên bìa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tiêu đề Album (Hiển thị đầu mục)
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Album Kỷ Niệm Ngày Chung Đôi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tên in nhũ trên bìa sách
                  </label>
                  <input
                    type="text"
                    value={config.coverTitle || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, coverTitle: e.target.value }))}
                    placeholder="HOÀNG NAM & MAI LAN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Tùy chọn Âm thanh lật giấy */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                    {config.soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                      Âm thanh sột soạt lật giấy mỹ thuật
                    </span>
                    <span className="text-[11px] text-stone-500 font-light">
                      Mô phỏng tiếng lật trang chân thực khi khách vuốt lật album
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.soundEnabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="size-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────── */}
          {/* DANH SÁCH CÁC TRANG ẢNH ĐANG CÓ (LƯỚI SẮP XẾP)         */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="border-t border-stone-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Danh Sách Trang Album ({config.pages.length} trang)
              </span>
              <span className="text-xs text-stone-400">
                Lật 2 trang trên máy tính • 1 trang trên điện thoại
              </span>
            </div>

            {config.pages.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 italic bg-stone-50 rounded-2xl border border-stone-200">
                Chưa có ảnh nào trong Album. Hãy dán link Google Drive hoặc tải ảnh lên ở các tab trên!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {config.pages.map((page, index) => (
                  <div
                    key={page.id || index}
                    className="group relative bg-stone-50 rounded-2xl border border-stone-200 p-2 flex flex-col justify-between hover:shadow-md transition"
                  >
                    {/* Ảnh Preview */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-200">
                      <img src={page.url} alt={`Trang ${index + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/70 text-[10px] text-white font-mono font-bold">
                        Trang {index + 1}
                      </span>
                    </div>

                    {/* Ô sửa chú thích */}
                    <input
                      type="text"
                      value={page.caption || ""}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      placeholder="Chú thích ảnh..."
                      className="mt-2 text-[11px] px-2 py-1 rounded-lg border border-stone-200 focus:border-amber-500 outline-hidden text-stone-700 truncate"
                    />

                    {/* Các nút hành động: Lên, Xuống, Xóa */}
                    <div className="mt-2 flex items-center justify-between border-t border-stone-200/70 pt-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => movePage(index, "up")}
                          disabled={index === 0}
                          className="size-6 rounded-md hover:bg-stone-200 disabled:opacity-20 flex items-center justify-center text-stone-600 transition"
                          title="Chuyển lên trước"
                        >
                          <MoveUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(index, "down")}
                          disabled={index === config.pages.length - 1}
                          className="size-6 rounded-md hover:bg-stone-200 disabled:opacity-20 flex items-center justify-center text-stone-600 transition"
                          title="Chuyển xuống sau"
                        >
                          <MoveDown className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePage(index)}
                        className="size-6 rounded-md hover:bg-rose-100 text-stone-400 hover:text-rose-600 flex items-center justify-center transition"
                        title="Xóa trang này"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-bold transition"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-60 transition cursor-pointer"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4 text-emerald-400" />}
            <span>{isSaving ? "Đang lưu..." : "Lưu Cấu Hình Album 3D"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
