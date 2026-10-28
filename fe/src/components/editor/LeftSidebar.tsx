"use client";

import React, { useState } from "react";
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
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TextTool } from "./tools/TextTool";
import { ImageTool } from "./tools/ImageTool";
import { Album3DTool } from "./tools/Album3DTool";
import { StockTool } from "./tools/StockTool";
import { BackgroundTool } from "./tools/BackgroundTool";
import { MusicTool } from "./tools/MusicTool";
import { ShapeTool } from "./tools/ShapeTool";
import { ShapePopover } from "./tools/ShapePopover";
import { WidgetTool } from "./tools/WidgetTool";
import { PresetTool } from "./tools/PresetTool";
import { ColorTool } from "./tools/ColorTool";
import { EffectTool } from "./tools/EffectTool";

interface NavItem {
  id: ToolCategory;
  label: string;
  drawerTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "create" | "settings";
  hint?: string;
}

const TOOLS: NavItem[] = [
  // ── NHÓM TẠO ──
  { id: "text", label: "Văn bản", drawerTitle: "Thêm văn bản", icon: Type, group: "create", hint: "Thêm tiêu đề, chú thích" },
  { id: "image", label: "Ảnh", drawerTitle: "Hình ảnh", icon: ImageIcon, group: "create", hint: "Tải ảnh lên hoặc thêm ảnh" },
  { id: "shape", label: "Hình dạng", drawerTitle: "Hình dạng & Đường", icon: Shapes, group: "create", hint: "Thêm đường, khung viền" },
  { id: "widget", label: "Tiện ích", drawerTitle: "Tiện ích trang trí", icon: LayoutGrid, group: "create", hint: "Đồng hồ đếm ngược, QR, đếm ngày" },
  { id: "stock", label: "Thư viện", drawerTitle: "Thư viện Stock", icon: Layers, group: "create", hint: "Clipart, sticker, hoa lá" },
  // ── NHÓM CÀI ĐẶT ──
  { id: "background", label: "Nền", drawerTitle: "Nền thiệp", icon: Palette, group: "settings", hint: "Màu nền, ảnh nền, họa tiết" },
  { id: "music", label: "Nhạc", drawerTitle: "Nhạc nền thiệp", icon: Music, group: "settings", hint: "Chọn bản nhạc phát tự động" },
  { id: "color", label: "Mẫu", drawerTitle: "Mẫu thiệp nhanh", icon: Columns, group: "settings", hint: "Áp dụng bộ màu & font có sẵn" },
  { id: "effect", label: "Hiệu ứng", drawerTitle: "Hiệu ứng tương tác", icon: Sparkles, group: "settings", hint: "Hoa rơi, pháo hoa, snow..." },
  { id: "preset", label: "Preset", drawerTitle: "Bộ mẫu thiết kế", icon: Mail, group: "settings", hint: "Bộ thiết kế hoàn chỉnh" },
  { id: "album3d", label: "Album", drawerTitle: "Album 3D & Bìa Màn Kết", icon: BookOpen, group: "settings", hint: "Cuốn album lật trang 3D" },
];

export function LeftSidebar() {
  const { activeTool, setActiveTool } = useEditor();
  const [isShapePopoverOpen, setIsShapePopoverOpen] = useState(false);
  const [shapeTopOffset, setShapeTopOffset] = useState(240);

  const handleToolClick = (toolId: ToolCategory, e: React.MouseEvent<HTMLButtonElement>) => {
    if (toolId === "shape") {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = e.currentTarget.closest("aside")?.getBoundingClientRect();
      if (parentRect) {
        setShapeTopOffset(rect.top - parentRect.top);
      }
      setIsShapePopoverOpen(!isShapePopoverOpen);
      if (activeTool) setActiveTool(null);
      return;
    }

    setIsShapePopoverOpen(false);
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case "text":
        return <TextTool />;
      case "image":
        return <ImageTool />;
      case "album3d":
        return <Album3DTool />;
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
  const createTools = TOOLS.filter((t) => t.group === "create");
  const settingsTools = TOOLS.filter((t) => t.group === "settings");

  return (
    <div className="relative flex h-full select-none bg-white">
      {/* 1. NARROW ICON DOCK (VERTICAL ~72px) */}
      <aside className="w-[72px] bg-white border-r border-stone-200 flex flex-col justify-start py-2 z-30 shrink-0 shadow-xs overflow-y-auto">

        {/* Nhóm TẠO */}
        <div className="px-1.5 pb-1">
          <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 text-center py-1.5 select-none">Tạo</span>
          <div className="flex flex-col items-center gap-0.5">
            {createTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === "shape" ? isShapePopoverOpen : activeTool === tool.id;

              return (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={isActive}
                  Icon={Icon}
                  onClick={(e) => handleToolClick(tool.id, e)}
                />
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 my-1.5 h-px bg-stone-200/80" />

        {/* Nhóm CÀI ĐẶT */}
        <div className="px-1.5 pb-2">
          <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 text-center py-1.5 select-none">Thiết lập</span>
          <div className="flex flex-col items-center gap-0.5">
            {settingsTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={isActive}
                  Icon={Icon}
                  onClick={(e) => handleToolClick(tool.id, e)}
                />
              );
            })}
          </div>
        </div>
      </aside>

      {/* Floating Shape Popover Menu */}
      <ShapePopover
        isOpen={isShapePopoverOpen}
        onClose={() => setIsShapePopoverOpen(false)}
        topOffset={shapeTopOffset}
      />

      {/* 2. EXPANDED TOOL SUB-DRAWER */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 300 }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full bg-white border-r border-stone-200 shadow-lg z-20 flex flex-col shrink-0 relative"
          >
            {/* Header sub-drawer */}
            <div className="h-12 border-b border-stone-100 px-4 flex items-center justify-between shrink-0 bg-stone-50/60">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  {activeToolItem?.group === "create" ? "Tạo" : "Thiết lập"}
                </span>
                <span className="text-sm font-bold text-stone-800 truncate">
                  {activeToolItem?.drawerTitle || "Công cụ"}
                </span>
              </div>
              <button
                type="button"
                aria-label="Thu gọn panel"
                onClick={() => setActiveTool(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer shrink-0 ml-2"
                title="Thu gọn"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            {/* Vertical Edge Collapse Toggle */}
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

// ── Tool Button Component ──────────────────────────────────
interface ToolButtonProps {
  tool: NavItem;
  isActive: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ToolButton({ tool, isActive, Icon, onClick }: ToolButtonProps) {
  return (
    <button
      key={tool.id}
      type="button"
      onClick={onClick}
      className={`w-full min-h-[54px] rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer group relative ${
        isActive
          ? "bg-amber-500/15 text-amber-800 font-bold border border-amber-300/70 shadow-inner"
          : "text-stone-500 hover:text-stone-900 hover:bg-stone-50/80"
      }`}
      title={tool.hint || tool.label}
      aria-label={tool.label}
      aria-pressed={isActive}
    >
      <Icon className={`size-[18px] transition-transform group-hover:scale-110 ${isActive ? "text-amber-700" : ""}`} />
      <span className={`text-[9.5px] leading-tight tracking-tight text-center font-semibold ${isActive ? "text-amber-800" : ""}`}>
        {tool.label}
      </span>

      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
      )}
    </button>
  );
}
