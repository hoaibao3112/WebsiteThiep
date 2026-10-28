"use client";

import React, { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { EditorProvider, useEditor, ToolCategory } from "./EditorContext";
import { LeftSidebar } from "./LeftSidebar";
import { CenterCanvas } from "./CenterCanvas";
import { RightPanel } from "./RightPanel";
import {
  Type,
  Image as ImageIcon,
  Palette,
  Music,
  Sparkles,
  Layers,
  X,
  Undo2,
  Redo2,
  Heart,
  ChevronLeft,
  Eye,
  Loader2,
  SlidersHorizontal,
  Tv,
  BookOpen,
  ExternalLink,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { Album3DManagerModal } from "../card/Album3DManagerModal";
import { LiveCardPreviewModal } from "./LiveCardPreviewModal";
import { motion, AnimatePresence } from "framer-motion";
import { TextTool } from "./tools/TextTool";
import { ImageTool } from "./tools/ImageTool";
import { BackgroundTool } from "./tools/BackgroundTool";
import { MusicTool } from "./tools/MusicTool";
import { EffectTool } from "./tools/EffectTool";
import { ColorTool } from "./tools/ColorTool";

interface VisualCardEditorProps<T extends object> {
  templateSlug: string;
  draft: T;
  children: ReactNode;
  onDraftChange: (draft: T) => void;
  onSave?: (draft: T) => void | Promise<void>;
  isVip?: boolean;
  backUrl?: string;
  previewUrl?: string;
  isSaving?: boolean;
  showTopBar?: boolean;
  onSwitchToForm?: () => void;
}

export function VisualCardEditor<T extends object>({
  templateSlug,
  draft,
  children,
  onDraftChange,
  onSave,
  isVip = false,
  backUrl = "/dashboard/cards",
  previewUrl,
  isSaving = false,
  showTopBar = true,
  onSwitchToForm,
}: VisualCardEditorProps<T>) {
  return (
    <EditorProvider
      templateSlug={templateSlug}
      draft={draft}
      isVip={isVip}
      onDraftChange={onDraftChange}
      onSave={onSave}
    >
      <VisualCardEditorInner
        templateSlug={templateSlug}
        backUrl={backUrl}
        previewUrl={previewUrl}
        isSaving={isSaving}
        showTopBar={showTopBar}
        onSwitchToForm={onSwitchToForm}
      >
        {children}
      </VisualCardEditorInner>
    </EditorProvider>
  );
}

// ────────────────────────────────────────────────────────────────
// INNER EDITOR WORKSPACE (HAS ACCESS TO LIVE UN-SAVED EDITOR CONTEXT)
// ────────────────────────────────────────────────────────────────

interface VisualCardEditorInnerProps {
  templateSlug: string;
  children: ReactNode;
  backUrl?: string;
  previewUrl?: string;
  isSaving?: boolean;
  showTopBar?: boolean;
  onSwitchToForm?: () => void;
}

function VisualCardEditorInner({
  templateSlug,
  children,
  backUrl = "/dashboard/cards",
  previewUrl,
  isSaving = false,
  showTopBar = true,
  onSwitchToForm,
}: VisualCardEditorInnerProps) {
  const {
    draft,
    canvasElements,
    canvasHeight,
    canvasBackgroundColor,
    canvasBackgroundPattern,
    canvasFallingEffect,
    triggerSave,
    saveState,
  } = useEditor();

  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setIsDesktop(true);
      return;
    }
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Keyboard shortcut Ctrl+P / Cmd+P for toggling live preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setShowLivePreview((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [showAlbum3DModal, setShowAlbum3DModal] = useState(false);
  const [album3DInitialTab, setAlbum3DInitialTab] = useState<"frontCover" | "backCover" | "drive" | "preview">("preview");
  const { updateAlbum3D } = useEditor();

  // Lắng nghe sự kiện mở modal Album 3D từ Canvas, RightPanel hoặc LeftSidebar
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: "frontCover" | "backCover" | "drive" | "preview" }>;
      if (customEvent.detail?.tab) {
        setAlbum3DInitialTab(customEvent.detail.tab);
      } else {
        setAlbum3DInitialTab("preview");
      }
      setShowAlbum3DModal(true);
    };

    window.addEventListener("open-album-3d-editor", handleOpen);
    return () => window.removeEventListener("open-album-3d-editor", handleOpen);
  }, []);

  return (
    <div className={`flex flex-col ${showTopBar ? "h-screen" : "h-full"} w-full overflow-hidden bg-white select-none`}>
      {/* 0. TOP BAR - MATCHING NGAYCHUNGDOI.COM/CARD/CREATE/CANVAS */}
      {showTopBar && (
        <CanvasTopBar
          backUrl={backUrl}
          previewUrl={previewUrl}
          isSaving={isSaving}
          onSwitchToForm={onSwitchToForm}
          onOpenPreview={() => setShowLivePreview(true)}
        />
      )}

      {/* 1. DESKTOP STUDIO (3-Column Layout: Left Dock + Artboard Center + Properties Right) */}
      {isDesktop !== false && (
        <div className="hidden lg:flex flex-1 w-full overflow-hidden">
          <LeftSidebar />
          <CenterCanvas>{children}</CenterCanvas>
          <RightPanel />
        </div>
      )}

      {/* 2. MOBILE CANVAS WITH BOTTOM DOCK */}
      {isDesktop === false && (
        <div className="flex lg:hidden flex-1 w-full flex-col relative overflow-hidden">
          <MobileEditorLayout onOpenPreview={() => setShowLivePreview(true)}>
            {children}
          </MobileEditorLayout>
        </div>
      )}

      {/* 3. LIVE GUEST PREVIEW MODAL (USES CURRENT IN-MEMORY DRAFT & CANVASELEMENTS) */}
      <LiveCardPreviewModal
        isOpen={showLivePreview}
        onClose={() => setShowLivePreview(false)}
        draft={draft as any}
        templateSlug={templateSlug}
        canvasElements={canvasElements}
        canvasHeight={canvasHeight}
        canvasBackgroundColor={canvasBackgroundColor}
        canvasBackgroundPattern={canvasBackgroundPattern}
        canvasFallingEffect={canvasFallingEffect}
        onSave={triggerSave}
        isSaving={isSaving || saveState === "saving"}
      >
        {children}
      </LiveCardPreviewModal>

      {/* 4. MODAL QUẢN LÝ ALBUM ẢNH CƯỚI 3D & BÌA SAU (DÙNG CHUNG CHO TẤT CẢ CHẾ ĐỘ) */}
      <Album3DManagerModal
        isOpen={showAlbum3DModal}
        onClose={() => setShowAlbum3DModal(false)}
        cardId={(draft as any)?.id || (draft as any)?._id || "draft-new-card"}
        initialTab={album3DInitialTab}
        initialConfig={(draft as any)?.categoryData?.album3d}
        onSaved={(savedConfig) => {
          updateAlbum3D(savedConfig);
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// TOP BAR — SIMPLIFIED: Essential actions visible, secondary in "More" menu
// ────────────────────────────────────────────────────────────────

interface CanvasTopBarProps {
  backUrl: string;
  previewUrl?: string;
  isSaving?: boolean;
  onSwitchToForm?: () => void;
  onOpenPreview?: () => void;
}

function CanvasTopBar({
  backUrl,
  previewUrl,
  isSaving = false,
  onSwitchToForm,
  onOpenPreview,
}: CanvasTopBarProps) {
  const { draft, undo, redo, canUndo, canRedo, hasUnsavedChanges, saveState, triggerSave } = useEditor();
  const [internalSaving, setInternalSaving] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const cardId = (draft as any)?.id || (draft as any)?._id;

  const handleSaveClick = async () => {
    setInternalSaving(true);
    try {
      await triggerSave();
    } catch {
      // Errors are surfaced through onSave / saveError alerts
    } finally {
      setInternalSaving(false);
    }
  };

  // Close more menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  const isSavingActive = isSaving || internalSaving || saveState === "saving";

  return (
    <header className="h-14 bg-white border-b border-stone-200 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none shadow-2xs">
      {/* LEFT: BACK + BRAND + UNDO/REDO */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link
          href={backUrl}
          className="size-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600 hover:text-stone-900 transition shrink-0"
          title="Quay lại danh sách thiệp"
        >
          <ChevronLeft className="size-5" />
        </Link>

        {/* BRAND BADGE */}
        <div className="flex items-center gap-1.5 select-none shrink-0">
          <div className="size-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500 shadow-2xs">
            <Heart className="size-4 fill-pink-500 text-pink-500" />
          </div>
          <span className="hidden sm:inline font-bold text-sm tracking-tight text-stone-800">
            ngày chung đôi
          </span>
        </div>

        {/* UNDO / REDO */}
        <div className="flex items-center gap-0.5 border-l border-stone-200 pl-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="size-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-25 disabled:hover:bg-transparent transition cursor-pointer"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="size-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-25 disabled:hover:bg-transparent transition cursor-pointer"
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="size-4" />
          </button>
        </div>
      </div>

      {/* CENTER: SAVE STATUS */}
      <div className="flex items-center">
        {hasUnsavedChanges ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full shadow-2xs animate-in fade-in">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Chưa lưu</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <Check className="size-3 text-emerald-600" />
            <span className="hidden sm:inline">Đã lưu</span>
          </div>
        )}
      </div>

      {/* RIGHT: PREVIEW + MORE MENU + SAVE */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* XEM TRƯỚC */}
        {onOpenPreview && (
          <button
            type="button"
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Xem trước thiệp cưới thực tế như khách mời (Ctrl+P)"
          >
            <Eye className="size-3.5 text-amber-700" />
            <span>Xem trước</span>
          </button>
        )}

        {/* MORE MENU (⋯) */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`size-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 transition cursor-pointer border ${
              moreOpen ? "bg-stone-100 border-stone-300" : "border-transparent hover:border-stone-200"
            }`}
            title="Thêm tùy chọn"
            aria-label="Mở menu thêm"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal className="size-4" />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="absolute right-0 top-10 w-52 bg-white rounded-2xl border border-stone-200 shadow-xl z-50 overflow-hidden py-1.5"
              >
                {cardId && (
                  <Link
                    href={`/dashboard/cards/${cardId}/memories`}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition"
                    title="Quản lý ảnh kỷ niệm & Màn hình LED tiệc cưới"
                  >
                    <Tv className="size-3.5 text-amber-600 shrink-0" />
                    <span>Màn Hình LED Tiệc Cưới</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    window.dispatchEvent(
                      new CustomEvent("open-album-3d-editor", { detail: { tab: "backCover" } })
                    );
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer text-left"
                >
                  <BookOpen className="size-3.5 text-amber-700 shrink-0" />
                  <span>Album 3D & Bìa Sau</span>
                </button>

                {previewUrl && (
                  <Link
                    href={previewUrl}
                    target="_blank"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition"
                  >
                    <ExternalLink className="size-3.5 text-stone-500 shrink-0" />
                    <span>Mở link thiệp</span>
                  </Link>
                )}

                {onSwitchToForm && (
                  <>
                    <div className="my-1 mx-3 h-px bg-stone-100" />
                    <button
                      type="button"
                      onClick={() => { setMoreOpen(false); onSwitchToForm(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer text-left"
                    >
                      <SlidersHorizontal className="size-3.5 text-stone-500 shrink-0" />
                      <span>Chuyển sang Biểu Mẫu</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LƯU THIỆP - PRIMARY CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveClick}
          disabled={isSavingActive}
          className="px-4 sm:px-5 py-2 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer transition disabled:opacity-60 shrink-0"
        >
          {isSavingActive ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}
          <span>{isSavingActive ? "Đang lưu..." : "Lưu thiệp"}</span>
        </motion.button>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────
// MOBILE EDITOR LAYOUT (BOTTOM DOCK + DRAWER)
// ────────────────────────────────────────────────────────────────

interface MobileEditorLayoutProps {
  children: ReactNode;
  onOpenPreview?: () => void;
}

function MobileEditorLayout({ children, onOpenPreview }: MobileEditorLayoutProps) {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditor();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const MOBILE_TOOLS: Array<{ id: ToolCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "text", label: "Văn bản", icon: Type },
    { id: "image", label: "Hình ảnh", icon: ImageIcon },
    { id: "background", label: "Nền", icon: Palette },
    { id: "music", label: "Nhạc", icon: Music },
    { id: "effect", label: "Hiệu ứng", icon: Sparkles },
    { id: "color", label: "Mẫu", icon: Layers },
  ];

  const handleOpenTool = (tool: ToolCategory) => {
    setActiveTool(tool);
    setMobileDrawerOpen(true);
  };

  const renderTool = () => {
    switch (activeTool) {
      case "text":
        return <TextTool />;
      case "image":
        return <ImageTool />;
      case "background":
        return <BackgroundTool />;
      case "music":
        return <MusicTool />;
      case "effect":
        return <EffectTool />;
      case "color":
        return <ColorTool />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* Canvas container */}
      <div className="flex-1 overflow-hidden relative">
        <CenterCanvas>{children}</CenterCanvas>
      </div>

      {/* Floating Bottom Quick Bar for Mobile */}
      <div className="sticky bottom-0 left-0 right-0 z-30 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-2 py-2 flex items-center justify-between text-white safe-area-pb">
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {/* Nút Xem Trước Nhanh Trên Mobile */}
          {onOpenPreview && (
            <button
              type="button"
              onClick={onOpenPreview}
              className="flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl text-[10px] font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer shrink-0 border border-amber-400/30 bg-amber-400/10"
              title="Xem trước thiệp"
            >
              <Eye className="size-4 mb-0.5" />
              <span className="truncate">Xem trước</span>
            </button>
          )}

          {MOBILE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id && mobileDrawerOpen;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleOpenTool(tool.id)}
                className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl text-[10px] font-semibold transition cursor-pointer shrink-0 ${
                  isActive ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-300 hover:text-white"
                }`}
              >
                <Icon className="size-4 mb-0.5" />
                <span className="truncate">{tool.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 pl-1 border-l border-stone-800 shrink-0">
          <button
            type="button"
            aria-label="Hoàn tác"
            onClick={undo}
            disabled={!canUndo}
            className="p-2 text-stone-400 disabled:opacity-20 cursor-pointer"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Làm lại"
            onClick={redo}
            disabled={!canRedo}
            className="p-2 text-stone-400 disabled:opacity-20 cursor-pointer"
          >
            <Redo2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl border-t border-stone-200 text-stone-900"
            >
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-stone-300" />
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  {MOBILE_TOOLS.find((t) => t.id === activeTool)?.label || "Tùy chỉnh"}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="pb-6">{renderTool()}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
