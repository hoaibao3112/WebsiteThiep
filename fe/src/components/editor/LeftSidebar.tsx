"use client";

import React from "react";
import { useEditor, ToolCategory } from "./EditorContext";
import {
  Type,
  Image as ImageIcon,
  ShoppingBag,
  Palette,
  Music,
  Hexagon,
  Wrench,
  LayoutGrid,
  Layers,
  Sparkles,
  Undo2,
  Redo2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TextTool } from "./tools/TextTool";
import { ImageTool } from "./tools/ImageTool";
import { StockTool } from "./tools/StockTool";
import { BackgroundTool } from "./tools/BackgroundTool";
import { MusicTool } from "./tools/MusicTool";
import { ShapeTool } from "./tools/ShapeTool";
import { WidgetTool } from "./tools/WidgetTool";
import { PresetTool } from "./tools/PresetTool";
import { ColorTool } from "./tools/ColorTool";
import { EffectTool } from "./tools/EffectTool";

interface NavItem {
  id: ToolCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOOLS: NavItem[] = [
  { id: "text", label: "Văn bản", icon: Type },
  { id: "image", label: "Hình ảnh", icon: ImageIcon },
  { id: "stock", label: "Stock", icon: ShoppingBag },
  { id: "background", label: "Nền", icon: Palette },
  { id: "music", label: "Nhạc", icon: Music },
  { id: "shape", label: "Hình dạng", icon: Hexagon },
  { id: "widget", label: "Tiện ích", icon: Wrench },
  { id: "preset", label: "Preset", icon: LayoutGrid },
  { id: "color", label: "Mẫu", icon: Layers },
  { id: "effect", label: "Hiệu ứng", icon: Sparkles },
];

export function LeftSidebar() {
  const { activeTool, setActiveTool, undo, redo, canUndo, canRedo } = useEditor();

  const handleToolClick = (toolId: ToolCategory) => {
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case "text":
        return <TextTool />;
      case "image":
        return <ImageTool />;
      case "stock":
        return <StockTool />;
      case "background":
        return <BackgroundTool />;
      case "music":
        return <MusicTool />;
      case "shape":
        return <ShapeTool />;
      case "widget":
        return <WidgetTool />;
      case "preset":
        return <PresetTool />;
      case "color":
        return <ColorTool />;
      case "effect":
        return <EffectTool />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-full select-none">
      {/* 1. NARROW ICON DOCK (VERTICAL) */}
      <aside className="w-16 sm:w-18 bg-white border-r border-stone-200 flex flex-col justify-between py-3 z-30 shrink-0 shadow-xs">
        {/* Tool list */}
        <div className="flex flex-col items-center gap-1 overflow-y-auto px-1">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool.id)}
                className={`w-full min-h-[50px] rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  isActive
                    ? "bg-amber-100/80 text-amber-950 font-bold border border-amber-300 shadow-2xs"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
                title={tool.label}
              >
                <Icon className={`size-4.5 ${isActive ? "text-amber-800" : ""}`} />
                <span className="text-[10px] leading-none tracking-tight">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Undo/Redo at bottom */}
        <div className="flex flex-col items-center gap-1 border-t border-stone-100 pt-2 px-1">
          <div className="flex gap-1 w-full justify-center">
            <button
              type="button"
              aria-label="Hoàn tác"
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-25 transition cursor-pointer"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Làm lại"
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-25 transition cursor-pointer"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. EXPANDED TOOL CONTENT DRAWER */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 280 }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-white border-r border-stone-200 shadow-lg z-20 overflow-hidden flex flex-col shrink-0"
          >
            <div className="h-12 border-b border-stone-100 px-4 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {TOOLS.find((t) => t.id === activeTool)?.label}
              </span>
              <button
                type="button"
                aria-label="Đóng panel"
                onClick={() => setActiveTool(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">{renderToolContent()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
