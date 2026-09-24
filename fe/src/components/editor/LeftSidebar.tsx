"use client";

import React from "react";
import { useEditor, ToolCategory } from "./EditorContext";
import {
  Type,
  Image as ImageIcon,
  Layers,
  Palette,
  Music,
  Shapes,
  LayoutGrid,
  Mail,
  Columns,
  Sparkles,
  ChevronLeft,
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
  drawerTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOOLS: NavItem[] = [
  { id: "text", label: "Văn bản", drawerTitle: "Văn bản", icon: Type },
  { id: "image", label: "Hình ảnh", drawerTitle: "Hình ảnh", icon: ImageIcon },
  { id: "stock", label: "Stock", drawerTitle: "Thư viện Stock", icon: Layers },
  { id: "background", label: "Nền", drawerTitle: "Nền thiệp", icon: Palette },
  { id: "music", label: "Nhạc", drawerTitle: "Nhạc nền", icon: Music },
  { id: "shape", label: "Hình dạng", drawerTitle: "Hình dạng", icon: Shapes },
  { id: "widget", label: "Tiện ích", drawerTitle: "Tiện ích", icon: LayoutGrid },
  { id: "preset", label: "Preset", drawerTitle: "Preset mẫu", icon: Mail },
  { id: "color", label: "Mẫu", drawerTitle: "Mẫu thiết kế", icon: Columns },
  { id: "effect", label: "Hiệu ứng", drawerTitle: "Hiệu ứng tương tác", icon: Sparkles },
];

export function LeftSidebar() {
  const { activeTool, setActiveTool } = useEditor();

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

  const activeToolItem = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="relative flex h-full select-none bg-white">
      {/* 1. NARROW ICON DOCK (VERTICAL ~68px) KHỚP CHUẨN NGAYCHUNGDOI */}
      <aside className="w-[70px] bg-white border-r border-stone-200 flex flex-col justify-start py-3 z-30 shrink-0 shadow-xs">
        <div className="flex flex-col items-center gap-1.5 overflow-y-auto px-1.5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool.id)}
                className={`w-full min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  isActive
                    ? "bg-stone-100 text-stone-900 font-bold border border-stone-200 shadow-2xs"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                }`}
                title={tool.label}
              >
                <Icon className={`size-4.5 ${isActive ? "text-stone-900" : ""}`} />
                <span className="text-[10px] leading-tight tracking-tight text-center">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2. EXPANDED TOOL SUB-DRAWER */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 320 }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full bg-white border-r border-stone-200 shadow-lg z-20 flex flex-col shrink-0 relative"
          >
            {/* Header sub-drawer với nút thu gọn '<' */}
            <div className="h-12 border-b border-stone-100 px-4 flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-stone-800">
                {activeToolItem?.drawerTitle || "Công cụ"}
              </span>
              <button
                type="button"
                aria-label="Thu gọn panel"
                onClick={() => setActiveTool(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                title="Thu gọn"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            {/* Vertical Edge Collapse Toggle (Khớp nút thu gọn ở cạnh drawer trong ảnh mẫu) */}
            <button
              type="button"
              onClick={() => setActiveTool(null)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-3.5 h-10 bg-white border border-stone-200 border-l-0 rounded-r-md shadow-xs flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              title="Đóng thanh công cụ"
            >
              <ChevronLeft className="size-3" />
            </button>

            {/* Content of the tool */}
            <div className="flex-1 overflow-y-auto p-4">{renderToolContent()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
