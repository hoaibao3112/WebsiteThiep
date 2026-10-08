"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Check, Loader2, Sparkles } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { EnvelopeStyle, EnvelopeConfig } from "@/types/card.types";

interface EnvelopeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId?: string;
  initialConfig?: EnvelopeConfig;
  initialGroomName?: string;
  initialBrideName?: string;
  onSaveSuccess?: (savedConfig: EnvelopeConfig) => void;
}

// Fallback styles khi backend offline hoặc đang tải
const FALLBACK_STYLES: EnvelopeStyle[] = [
  {
    id: "vintage-cream",
    name: "Kem cổ điển",
    envelopeColor: "#7B96A8",
    flapColor: "#6B8596",
    innerColor: "#EAE4DC",
    sealColor: "#C0C5C7",
    sealBorderColor: "#9FA7A9",
    monogramColor: "#4A5D6B",
    bgTexture: "vintage-linen",
    bgColor: "#EFEBE4",
    decorStyle: "blue-hydrangea",
    defaultTitle: "We're getting married!",
    defaultFont: "Aquarelle",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: false,
  },
  {
    id: "beige",
    name: "Beige",
    envelopeColor: "#F5EBE1",
    flapColor: "#E8DCCF",
    innerColor: "#FAF6F0",
    sealColor: "#1E1E1E",
    sealBorderColor: "#111111",
    monogramColor: "#D4AF37",
    bgTexture: "ivory-paper",
    bgColor: "#FAF8F5",
    decorStyle: "white-green",
    defaultTitle: "We're getting married!",
    defaultFont: "Playfair Display",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: false,
  },
  {
    id: "red",
    name: "Đỏ",
    envelopeColor: "#73161C",
    flapColor: "#611015",
    innerColor: "#420A0E",
    sealColor: "#C89B3C",
    sealBorderColor: "#A67B27",
    monogramColor: "#611015",
    bgTexture: "linen-light",
    bgColor: "#FAF6F5",
    decorStyle: "burgundy-butterfly",
    defaultTitle: "We're getting married!",
    defaultFont: "Great Vibes",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: false,
  },
  {
    id: "emerald",
    name: "Xanh Emerald",
    envelopeColor: "#1B4332",
    flapColor: "#143326",
    innerColor: "#EDF4F0",
    sealColor: "#D4AF37",
    sealBorderColor: "#AA8C2C",
    monogramColor: "#1B4332",
    bgTexture: "emerald-linen",
    bgColor: "#F4F7F5",
    decorStyle: "gold-eucalyptus",
    defaultTitle: "We're getting married!",
    defaultFont: "Cinzel",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: true,
  },
  {
    id: "rose-gold",
    name: "Hồng Rose",
    envelopeColor: "#D8A49B",
    flapColor: "#C89288",
    innerColor: "#FFF3F0",
    sealColor: "#8C4A4A",
    sealBorderColor: "#703838",
    monogramColor: "#FFFFFF",
    bgTexture: "soft-linen",
    bgColor: "#FCF8F7",
    decorStyle: "pink-peony",
    defaultTitle: "We're getting married!",
    defaultFont: "Alex Brush",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: true,
  },
  {
    id: "peony-crimson",
    name: "Mẫu đơn nhung đỏ",
    envelopeColor: "#8B1E2D",
    flapColor: "#73161C",
    innerColor: "#420A0E",
    sealColor: "#D4AF37",
    sealBorderColor: "#AA8C2C",
    monogramColor: "#F4E8D0",
    bgTexture: "vintage-linen",
    bgColor: "#FAF6F5",
    decorStyle: "crimson-peony",
    defaultTitle: "We're getting married!",
    defaultFont: "Playfair Display",
    defaultButtonText: "CHẠM ĐỂ MỞ",
    isVip: true,
  },
  {
    id: "peony-purple",
    name: "Mẫu đơn tím hoàng kim",
    envelopeColor: "#32123B",
    flapColor: "#250B2D",
    innerColor: "#1A0620",
    sealColor: "#D4AF37",
    sealBorderColor: "#F5D77F",
    monogramColor: "#FFFFFF",
    bgTexture: "starry-night",
    bgColor: "#190A1D",
    bgGradient: "radial-gradient(ellipse at center, #2C1035 0%, #17071D 100%)",
    cardBg: "#1F0B24",
    borderColor: "#D4AF37",
    ornamentType: "peony-purple",
    sealIcon: "heart",
    decorStyle: "purple-peony-gold",
    defaultTitle: "THIỆP MỜI CƯỚI",
    defaultFont: "Great Vibes",
    defaultButtonText: "Mở thiệp",
    isVip: true,
  },
];

const FONT_OPTIONS = [
  { id: "Aquarelle", label: "Aquarelle", className: "font-serif italic" },
  { id: "Great Vibes", label: "Great Vibes", className: "font-serif italic" },
  { id: "Playfair Display", label: "Playfair Display", className: "font-serif" },
  { id: "Cinzel", label: "Cinzel", className: "font-serif uppercase tracking-widest" },
  { id: "Alex Brush", label: "Alex Brush", className: "font-serif italic" },
  { id: "Dancing Script", label: "Dancing Script", className: "font-serif" },
  { id: "Ephesis", label: "Ephesis", className: "font-serif italic" },
  { id: "Montserrat", label: "Montserrat", className: "font-sans uppercase tracking-wider" },
];

/**
 * Trích xuất Monogram (chữ cái đầu của từ cuối trong họ tên)
 * VD: "Mai Lan" -> "L", "Tuấn Minh" -> "M" => "LM" hoặc "ML"
 */
function extractMonogram(name1: string, name2: string): string {
  const getFirstLetterOfLastWord = (str: string) => {
    const parts = str.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    const lastWord = parts[parts.length - 1];
    return lastWord ? lastWord.charAt(0).toUpperCase() : "";
  };

  const l1 = getFirstLetterOfLastWord(name1);
  const l2 = getFirstLetterOfLastWord(name2);
  if (l1 && l2) return `${l1}${l2}`;
  if (l1) return l1;
  if (l2) return l2;
  return "ML";
}

export function EnvelopeConfigModal({
  isOpen,
  onClose,
  cardId,
  initialConfig,
  initialGroomName = "Minh Khôi",
  initialBrideName = "Ngọc Hân",
  onSaveSuccess,
}: EnvelopeConfigModalProps) {
  const [styles, setStyles] = useState<EnvelopeStyle[]>(FALLBACK_STYLES);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [enabled, setEnabled] = useState<boolean>(
    initialConfig?.enabled ?? true
  );
  const [selectedStyleId, setSelectedStyleId] = useState<string>(
    initialConfig?.styleId || "peony-purple"
  );
  const [groomName, setGroomName] = useState<string>(
    initialConfig?.groomName || initialGroomName
  );
  const [brideName, setBrideName] = useState<string>(
    initialConfig?.brideName || initialBrideName
  );
  const [title, setTitle] = useState<string>(
    initialConfig?.title || initialConfig?.coverTitle || "THIỆP MỜI CƯỚI"
  );
  const [weddingDateText, setWeddingDateText] = useState<string>(
    initialConfig?.weddingDateText || "19 tháng 12, 2026"
  );
  const [salutation, setSalutation] = useState<string>(
    initialConfig?.salutation || "Thân Mời"
  );
  const [sealIcon, setSealIcon] = useState<"heart" | "song-hy" | "monogram" | "flower" | "ring">(
    initialConfig?.sealIcon || "heart"
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    initialConfig?.soundEnabled ?? true
  );
  const [fontFamily, setFontFamily] = useState<string>(
    initialConfig?.fontFamily || "Great Vibes"
  );
  const [buttonText, setButtonText] = useState<string>(
    initialConfig?.buttonText || "Mở thiệp"
  );
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch danh sách kiểu phong bì từ Backend API (Không hardcode FE)
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoadingStyles(true);
    setErrorMessage(null);

    ApiClient.getEnvelopeStyles<EnvelopeStyle[]>()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setStyles(res.data);
        }
      })
      .catch((err) => {
        console.warn("Lỗi tải envelope styles từ backend:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingStyles(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Đồng bộ giá trị khởi tạo khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (initialConfig?.enabled !== undefined) setEnabled(initialConfig.enabled);
      if (initialConfig?.styleId) setSelectedStyleId(initialConfig.styleId);
      
      const g = initialConfig?.groomName || initialGroomName || "Minh Khôi";
      const b = initialConfig?.brideName || initialBrideName || "Ngọc Hân";
      setGroomName(g);
      setBrideName(b);

      if (initialConfig?.title || initialConfig?.coverTitle) setTitle(initialConfig.title || initialConfig.coverTitle || "THIỆP MỜI CƯỚI");
      if (initialConfig?.weddingDateText) setWeddingDateText(initialConfig.weddingDateText);
      if (initialConfig?.salutation) setSalutation(initialConfig.salutation);
      if (initialConfig?.sealIcon) setSealIcon(initialConfig.sealIcon);
      if (initialConfig?.soundEnabled !== undefined) setSoundEnabled(initialConfig.soundEnabled);
      if (initialConfig?.fontFamily) setFontFamily(initialConfig.fontFamily);
      if (initialConfig?.buttonText) setButtonText(initialConfig.buttonText);
      setErrorMessage(null);
    }
  }, [isOpen, initialConfig, initialGroomName, initialBrideName]);

  // Kiểu phong bì hiện được chọn
  const activeStyle = useMemo(() => {
    return styles.find((s) => s.id === selectedStyleId) || styles[0] || FALLBACK_STYLES[0];
  }, [styles, selectedStyleId]);

  // Monogram tự động tính
  const calculatedMonogram = useMemo(() => {
    return extractMonogram(groomName || initialGroomName, brideName || initialBrideName);
  }, [groomName, brideName, initialGroomName, initialBrideName]);

  // Ghép tên cặp đôi
  const combinedCoupleName = useMemo(() => {
    const g = groomName.trim();
    const b = brideName.trim();
    if (g && b) return `${g} & ${b}`;
    return g || b || `${initialGroomName || "Minh Khôi"} & ${initialBrideName || "Ngọc Hân"}`;
  }, [groomName, brideName, initialGroomName, initialBrideName]);

  // Xử lý lưu cấu hình (Gọi Backend API nếu đã tạo thiệp, lưu local state nếu là thiệp mới)
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const finalGroom = groomName.trim() || initialGroomName || "Minh Khôi";
    const finalBride = brideName.trim() || initialBrideName || "Ngọc Hân";

    const configToSave: EnvelopeConfig = {
      enabled,
      styleId: selectedStyleId,
      styleName: activeStyle.name,
      groomName: finalGroom,
      brideName: finalBride,
      title: title.trim() || "THIỆP MỜI CƯỚI",
      coverTitle: title.trim() || "THIỆP MỜI CƯỚI",
      weddingDateText: weddingDateText.trim() || "19 tháng 12, 2026",
      salutation: salutation.trim() || "Thân Mời",
      sealIcon,
      soundEnabled,
      fontFamily: fontFamily || "Great Vibes",
      buttonText: buttonText.trim() || "Mở thiệp",
      monogram: calculatedMonogram,
      envelopeColor: activeStyle.envelopeColor,
      sealColor: activeStyle.sealColor,
      cardBg: activeStyle.cardBg,
      bgGradient: activeStyle.bgGradient,
      ornamentType: activeStyle.ornamentType,
    };

    try {
      // Chỉ gửi request backend nếu cardId hợp lệ và đã lưu trong database (không phải draft-new-card hoặc chưa tạo thiệp)
      const isPersistedCard =
        cardId &&
        !cardId.startsWith("draft-") &&
        cardId !== "draft-new-card" &&
        !cardId.includes("temp");

      if (isPersistedCard) {
        try {
          const res = await ApiClient.updateCardEnvelopeConfig(cardId, configToSave);
          if (!res.success) {
            console.warn("Lưu backend phong bì không thành công, tiếp tục lưu local:", res.error);
          }
        } catch (apiErr) {
          console.warn("Lỗi mạng khi lưu phong bì backend, tiếp tục lưu local:", apiErr);
        }
      }

      onSaveSuccess?.(configToSave);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Đã có lỗi xảy ra khi lưu cấu hình phong bì."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => {
          // Đóng dropdown font nếu click ra ngoài
          if (fontDropdownOpen) setFontDropdownOpen(false);
          e.stopPropagation();
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-stone-900">
            Cấu hình phong bì mở đầu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR ALERT */}
        {errorMessage && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* BODY - 2 COLUMNS (INPUT FORM LEFT, PREVIEW RIGHT) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CỘT TRÁI (CONTROLS) */}
          <div className="md:col-span-6 lg:col-span-6 space-y-5">
            {/* 1. KIỂU PHONG BÌ (TỪ BACKEND) */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                  Kiểu phong bì
                </label>
                {loadingStyles && (
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải mẫu...
                  </span>
                )}
              </div>

              {/* Danh sách thẻ kiểu phong bì cuộn ngang */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {styles.map((style) => {
                  const isSelected = selectedStyleId === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setSelectedStyleId(style.id);
                        if (!fontFamily || fontFamily === "Aquarelle") {
                          setFontFamily(style.defaultFont);
                        }
                      }}
                      className={`group relative flex-shrink-0 w-28 sm:w-32 rounded-xl p-2.5 transition text-left cursor-pointer flex flex-col items-center bg-white border ${
                        isSelected
                          ? "border-stone-900 ring-2 ring-stone-900/10 shadow-md"
                          : "border-stone-200 hover:border-stone-400 hover:shadow-xs"
                      }`}
                    >
                      {/* Thumbnail phong bì mini */}
                      <div
                        className="w-full h-36 rounded-lg overflow-hidden flex flex-col items-center justify-between p-2 relative shadow-inner"
                        style={{
                          backgroundColor: style.bgColor,
                          backgroundImage:
                            style.bgTexture === "vintage-linen"
                              ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7), transparent 70%)"
                              : "none",
                        }}
                      >
                        {/* Mini Title */}
                        <div className="text-[7px] text-center text-stone-500 font-serif leading-none mt-1 line-clamp-1">
                          We&apos;re getting married!
                        </div>
                        {/* Mini Couple */}
                        <div className="text-[8px] text-center font-bold text-stone-800 font-serif leading-tight">
                          Mai Lan &amp; Tuấn Minh
                        </div>

                        {/* Mini Phong Bì 3D */}
                        <div className="relative w-full h-16 flex items-center justify-center my-auto">
                          {/* Hoa trang trí mini bên hông */}
                          {style.decorStyle === "blue-hydrangea" && (
                            <div className="absolute inset-x-0 flex justify-between px-0.5 text-[10px] pointer-events-none opacity-80">
                              <span>🌸</span>
                              <span>💐</span>
                            </div>
                          )}
                          {style.decorStyle === "white-green" && (
                            <div className="absolute inset-x-0 flex justify-between px-0.5 text-[10px] pointer-events-none opacity-80">
                              <span>🌿</span>
                              <span>🌼</span>
                            </div>
                          )}
                          {style.decorStyle === "burgundy-butterfly" && (
                            <div className="absolute inset-x-0 flex justify-between px-0.5 text-[10px] pointer-events-none opacity-80">
                              <span>🌹</span>
                              <span>🦋</span>
                            </div>
                          )}

                          {/* Thân phong bì mini */}
                          <div
                            className="w-20 h-13 rounded shadow-xs relative flex items-center justify-center overflow-hidden border border-black/10"
                            style={{ backgroundColor: style.envelopeColor }}
                          >
                            {/* Nắp tam giác gập mini */}
                            <div
                              className="absolute top-0 inset-x-0 h-0 border-l-[38px] border-l-transparent border-r-[38px] border-r-transparent border-t-[26px] z-10"
                              style={{ borderTopColor: style.flapColor }}
                            />

                            {/* Con dấu sáp mini */}
                            <div
                              className="absolute z-20 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-serif font-bold shadow-sm border border-white/40"
                              style={{
                                backgroundColor: style.sealColor,
                                color: style.monogramColor,
                              }}
                            >
                              ML
                            </div>
                          </div>
                        </div>

                        {/* Mini Button Text */}
                        <div className="text-[6px] tracking-wider uppercase text-stone-500 font-medium">
                          CHẠM ĐỂ MỞ
                        </div>
                      </div>

                      {/* Tên kiểu phong bì */}
                      <span
                        className={`text-xs font-bold mt-2 text-center truncate w-full ${
                          isSelected ? "text-stone-900" : "text-stone-600"
                        }`}
                      >
                        {style.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. NỘI DUNG HIỂN THỊ */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                  Cấu hình Bìa &amp; Nội dung mở thiệp
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                  />
                  <span>Bật màn hình bìa</span>
                </label>
              </div>

              {/* Tên chú rể & Tên cô dâu */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Tên chú rể
                  </label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="Minh Khôi"
                    className="w-full px-3 py-2 text-xs font-semibold text-stone-900 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 bg-white placeholder:text-stone-400 shadow-2xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Tên cô dâu
                  </label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="Ngọc Hân"
                    className="w-full px-3 py-2 text-xs font-semibold text-stone-900 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 bg-white placeholder:text-stone-400 shadow-2xs transition"
                  />
                </div>
              </div>

              {/* Dòng tiêu đề & Lời mời */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Tiêu đề bìa
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="THIỆP MỜI CƯỚI"
                    className="w-full px-3 py-2 text-xs font-semibold text-stone-900 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 bg-white placeholder:text-stone-400 shadow-2xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Lời kính mời
                  </label>
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    placeholder="Thân Mời"
                    className="w-full px-3 py-2 text-xs font-semibold text-stone-900 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 bg-white placeholder:text-stone-400 shadow-2xs transition"
                  />
                </div>
              </div>

              {/* Ngày cưới & Nút mở thiệp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Ngày cưới hiển thị
                  </label>
                  <input
                    type="text"
                    value={weddingDateText}
                    onChange={(e) => setWeddingDateText(e.target.value)}
                    placeholder="19 tháng 12, 2026"
                    className="w-full px-3 py-2 text-xs font-semibold text-stone-900 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 bg-white placeholder:text-stone-400 shadow-2xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Chữ trên nút bấm
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Mở thiệp"
                    className="w-full px-3 py-2 text-xs font-semibold text-stone-900 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 bg-white placeholder:text-stone-400 shadow-2xs transition"
                  />
                </div>
              </div>

              {/* Con dấu sáp & Bật âm thanh */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Con dấu hoàng gia
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "heart", label: "♥ Tim" },
                      { id: "song-hy", label: "囍 Hỷ" },
                      { id: "monogram", label: "ML Chữ" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSealIcon(opt.id as any)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition ${
                          sealIcon === opt.id
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Hiệu ứng âm thanh
                  </label>
                  <label className="flex items-center gap-2 h-8 px-2 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer text-xs font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                    />
                    <span className="truncate">Chuông &amp; Giấy lụa</span>
                  </label>
                </div>
              </div>

              {/* Font hiển thị tên (Dropdown như trong ảnh) */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-stone-700 mb-1 text-center">
                  Font hiển thị tên
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFontDropdownOpen(!fontDropdownOpen);
                  }}
                  className="w-full py-2 px-3 text-center text-sm font-serif font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{fontFamily}</span>
                  <span className="text-[10px] text-stone-700">▼</span>
                </button>

                {fontDropdownOpen && (
                  <div className="absolute top-full inset-x-4 mt-1 bg-white rounded-xl shadow-xl border border-stone-200 z-30 py-1.5 max-h-48 overflow-y-auto">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => {
                          setFontFamily(font.id);
                          setFontDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-xs text-left flex items-center justify-between hover:bg-stone-50 transition ${
                          fontFamily === font.id ? "bg-amber-50 font-bold text-amber-900" : "text-stone-700"
                        }`}
                      >
                        <span className={font.className}>{font.label}</span>
                        {fontFamily === font.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chú thích thông tin tự ghép */}
              <p className="text-[11px] text-stone-500 italic leading-relaxed pt-1">
                Toàn bộ thông tin trên bìa lưu trực tiếp vào máy chủ và hiển thị cho người xem khi mở thiệp cưới.
              </p>
            </div>
          </div>

          {/* CỘT PHẢI (PREVIEW TRỰC QUAN KHỚP 100% ẢNH MẪU) */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2 block">
              Preview
            </label>

            {/* ARTBOARD PREVIEW CARD */}
            <div
              className="w-full aspect-square sm:aspect-4/5 rounded-2xl overflow-hidden relative shadow-lg border border-stone-200 flex flex-col items-center justify-between p-6 sm:p-8 select-none"
              style={{
                backgroundColor: activeStyle.bgColor,
                backgroundImage:
                  activeStyle.bgTexture === "vintage-linen"
                    ? "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.7) 0%, rgba(230,225,217,0.5) 70%, rgba(210,205,195,0.8) 100%)"
                    : "radial-gradient(ellipse at 50% 50%, #ffffff 0%, #f4f0eb 100%)",
              }}
            >
              {/* Bóng đổ vải mỹ thuật góc trên bên phải mô phỏng ánh sáng thật */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-black/10 via-transparent to-transparent pointer-events-none" />

              {/* DÒNG TIÊU ĐỀ */}
              <div className="text-center z-10 mt-2 px-3">
                <p className="text-xs sm:text-sm font-serif text-stone-700 font-medium tracking-wide">
                  {title || "We're getting married!"}
                </p>
                {/* TÊN CẶP ĐÔI */}
                <h3
                  className="text-xl sm:text-2xl font-bold mt-1 text-stone-900 tracking-tight drop-shadow-xs"
                  style={{
                    fontFamily:
                      fontFamily === "Aquarelle"
                        ? "'Playfair Display', Georgia, serif"
                        : fontFamily || "'Playfair Display', Georgia, serif",
                  }}
                >
                  {combinedCoupleName}
                </h3>
              </div>

              {/* KHỐI PHONG BÌ 3D Ở TRUNG TÂM */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-4/3 my-auto flex items-center justify-center">
                {/* 2 Chùm hoa trang trí 2 bên sườn phong bì */}
                {activeStyle.decorStyle === "blue-hydrangea" && (
                  <>
                    {/* Chùm hoa trái (Tú cầu xanh + hoa baby trắng) */}
                    <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none drop-shadow-md">
                      <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="25" cy="45" r="14" fill="#9FBAD3" opacity="0.9" />
                        <circle cx="35" cy="35" r="12" fill="#B8D0E5" opacity="0.95" />
                        <circle cx="20" cy="30" r="10" fill="#E6EEF4" />
                        <circle cx="38" cy="55" r="11" fill="#789CBF" />
                        <circle cx="15" cy="58" r="8" fill="#FFFFFF" />
                        {/* Nhụy hoa */}
                        <circle cx="25" cy="45" r="2.5" fill="#FFFFFF" />
                        <circle cx="35" cy="35" r="2.5" fill="#FFE599" />
                        {/* Cành lá xanh */}
                        <path d="M12 25 C5 20, 2 35, 10 40 Z" fill="#6B8E63" opacity="0.8" />
                        <path d="M10 65 C2 70, 5 80, 15 75 Z" fill="#587A50" opacity="0.8" />
                      </svg>
                    </div>
                    {/* Chùm hoa phải */}
                    <div className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none drop-shadow-md scale-x-[-1]">
                      <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="25" cy="45" r="14" fill="#9FBAD3" opacity="0.9" />
                        <circle cx="35" cy="35" r="12" fill="#B8D0E5" opacity="0.95" />
                        <circle cx="20" cy="30" r="10" fill="#E6EEF4" />
                        <circle cx="38" cy="55" r="11" fill="#789CBF" />
                        <circle cx="15" cy="58" r="8" fill="#FFFFFF" />
                        <circle cx="25" cy="45" r="2.5" fill="#FFFFFF" />
                        <circle cx="35" cy="35" r="2.5" fill="#FFE599" />
                        <path d="M12 25 C5 20, 2 35, 10 40 Z" fill="#6B8E63" opacity="0.8" />
                        <path d="M10 65 C2 70, 5 80, 15 75 Z" fill="#587A50" opacity="0.8" />
                      </svg>
                    </div>
                  </>
                )}

                {activeStyle.decorStyle === "white-green" && (
                  <>
                    <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none drop-shadow-md">
                      <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="28" cy="40" r="14" fill="#FAF6EE" />
                        <circle cx="28" cy="40" r="4" fill="#C5A059" />
                        <circle cx="32" cy="58" r="12" fill="#FFFFFF" />
                        <circle cx="32" cy="58" r="3.5" fill="#E5C77A" />
                        <path d="M15 20 C5 15, 0 30, 12 35 Z" fill="#5A7D52" />
                        <path d="M8 55 C-2 60, 4 75, 16 68 Z" fill="#476640" />
                      </svg>
                    </div>
                    <div className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none drop-shadow-md scale-x-[-1]">
                      <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="28" cy="40" r="14" fill="#FAF6EE" />
                        <circle cx="28" cy="40" r="4" fill="#C5A059" />
                        <circle cx="32" cy="58" r="12" fill="#FFFFFF" />
                        <circle cx="32" cy="58" r="3.5" fill="#E5C77A" />
                        <path d="M15 20 C5 15, 0 30, 12 35 Z" fill="#5A7D52" />
                        <path d="M8 55 C-2 60, 4 75, 16 68 Z" fill="#476640" />
                      </svg>
                    </div>
                  </>
                )}

                {activeStyle.decorStyle === "burgundy-butterfly" && (
                  <>
                    <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none drop-shadow-md">
                      <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="28" cy="42" r="15" fill="#6A1016" />
                        <circle cx="24" cy="38" r="10" fill="#8B1E24" />
                        <circle cx="34" cy="60" r="12" fill="#4A0B10" />
                        <path d="M15 15 C8 10, 2 22, 12 28 Z" fill="#996D38" />
                        <path d="M18 20 C22 15, 26 22, 20 25 Z" fill="#C5A059" />
                      </svg>
                    </div>
                    <div className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none drop-shadow-md scale-x-[-1]">
                      <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="28" cy="42" r="15" fill="#6A1016" />
                        <circle cx="24" cy="38" r="10" fill="#8B1E24" />
                        <circle cx="34" cy="60" r="12" fill="#4A0B10" />
                        <path d="M15 15 C8 10, 2 22, 12 28 Z" fill="#996D38" />
                        <path d="M18 20 C22 15, 26 22, 20 25 Z" fill="#C5A059" />
                      </svg>
                    </div>
                  </>
                )}

                {/* THÂN PHONG BÌ 3D */}
                <div
                  className="w-full h-full rounded-xl relative shadow-xl overflow-hidden flex items-center justify-center border border-black/10 transition-colors duration-300"
                  style={{
                    backgroundColor: activeStyle.envelopeColor,
                  }}
                >
                  {/* Texture nhẹ trên mặt phong bì */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15 pointer-events-none" />

                  {/* NẮP PHONG BÌ TAM GIÁC GẬP (TRIANGLE FLAP) */}
                  <div
                    className="absolute top-0 inset-x-0 h-0 border-l-[140px] sm:border-l-[160px] border-l-transparent border-r-[140px] sm:border-r-[160px] border-r-transparent border-t-[90px] sm:border-t-[105px] z-10 transition-all duration-300 drop-shadow-md"
                    style={{
                      borderTopColor: activeStyle.flapColor,
                    }}
                  />

                  {/* CON DẤU SÁP HOÀNG GIA (WAX SEAL) */}
                  <div
                    className="absolute z-20 top-[60px] sm:top-[70px] w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-all duration-300 group cursor-pointer"
                    style={{
                      backgroundColor: activeStyle.sealColor,
                      border: `2px solid ${activeStyle.sealBorderColor}`,
                    }}
                  >
                    {/* Gờ sáp tròn chìm bên trong */}
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/20 flex items-center justify-center shadow-inner"
                      style={{
                        backgroundColor: activeStyle.sealColor,
                      }}
                    >
                      {/* Monogram dập nổi */}
                      <span
                        className="text-base sm:text-lg font-serif font-bold italic tracking-tighter drop-shadow-xs"
                        style={{
                          color: activeStyle.monogramColor,
                        }}
                      >
                        {calculatedMonogram}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NÚT / DÒNG CHỮ CHẠM ĐỂ MỞ */}
              <div className="z-10 mb-2">
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-stone-600 uppercase">
                  {buttonText || "CHẠM ĐỂ MỞ"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#2E2E2E] hover:bg-black text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Xác nhận</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
