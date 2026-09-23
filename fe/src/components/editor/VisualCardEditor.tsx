"use client";

import React, { ReactNode, useState } from "react";
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
  SlidersHorizontal,
} from "lucide-react";
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
  onSave?: () => void | Promise<void>;
  isVip?: boolean;
}

export function VisualCardEditor<T extends object>({
  templateSlug,
  draft,
  children,
  onDraftChange,
  onSave,
  isVip = false,
}: VisualCardEditorProps<T>) {
  return (
    <EditorProvider
      templateSlug={templateSlug}
      draft={draft}
      isVip={isVip}
      onDraftChange={onDraftChange}
      onSave={onSave}
    >
      <div className="flex h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] w-full overflow-hidden bg-white">
        {/* 1. DESKTOP STUDIO (3-Column Layout) */}
        <div className="hidden lg:flex w-full h-full">
          <LeftSidebar />
          <CenterCanvas>{children}</CenterCanvas>
          <RightPanel />
        </div>

        {/* 2. MOBILE CANVAS WITH BOTTOM DOCK */}
        <div className="flex lg:hidden w-full h-full flex-col relative overflow-hidden">
          <MobileEditorLayout>{children}</MobileEditorLayout>
        </div>
      </div>
    </EditorProvider>
  );
}

function MobileEditorLayout({ children }: { children: ReactNode }) {
  const {
    activeTool,
    setActiveTool,
    selectedField,
    selectField,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditor();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const MOBILE_TOOLS: Array<{ id: ToolCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "text", label: "Văn bản", icon: Type },
    { id: "image", label: "Hình ảnh", icon: ImageIcon },
    { id: "background", label: "Màu & Nền", icon: Palette },
    { id: "music", label: "Nhạc nền", icon: Music },
    { id: "effect", label: "Hiệu ứng", icon: Sparkles },
    { id: "color", label: "Đổi mẫu", icon: Layers },
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
