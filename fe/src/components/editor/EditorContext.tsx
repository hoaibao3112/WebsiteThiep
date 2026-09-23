"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { EditorField, getTemplateFields } from "@/lib/editor/template-registry";
import { applyDraftPatch, readDraftPath } from "@/lib/editor/patch-draft";

export type ToolCategory =
  | "text"
  | "image"
  | "stock"
  | "background"
  | "music"
  | "shape"
  | "widget"
  | "preset"
  | "color"
  | "effect";

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape" | "sticker" | "preset";
  content: string;
  x: number; // in px
  y: number; // in px
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  isUppercase?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: string;
  zIndex: number;
  isLocked?: boolean;
  shapeType?: "line" | "rect" | "circle" | "corner";
  presetId?: string;
  imageUrl?: string;
  title?: string;
}

export interface EditorContextValue<T extends object = Record<string, unknown>> {
  // Data state
  draft: T;
  templateSlug: string;
  isVip: boolean;
  fields: readonly EditorField[];

  // Free Canvas Elements
  canvasElements: CanvasElement[];
  selectedCanvasElement: CanvasElement | null;
  fieldOffsets: Record<string, { x: number; y: number }>;
  fieldScales: Record<string, number>;
  addTextElement: (preset?: { text?: string; fontSize?: number; isBold?: boolean }, pos?: { x?: number; y?: number }) => string;
  addStickerElement: (item: { icon: string; title: string; imageUrl?: string; width?: number; height?: number; color?: string }, pos?: { x?: number; y?: number }) => string;
  addShapeElement: (item: { shapeType: "line" | "rect" | "circle" | "corner"; title: string }, pos?: { x?: number; y?: number }) => string;
  addPresetElement: (item: { id: string; title: string; cat: string }, pos?: { x?: number; y?: number }) => string;
  addImageElement: (url: string, caption?: string, pos?: { x?: number; y?: number }) => string;
  updateCanvasElement: (id: string, patch: Partial<CanvasElement>) => void;
  removeCanvasElement: (id: string) => void;
  duplicateCanvasElement: (id: string) => string | null;
  reorderElementLayer: (id: string, action: "top" | "bottom" | "up" | "down") => void;
  toggleLockElement: (id: string) => void;
  updateFieldPositionOffset: (fieldId: string, deltaX: number, deltaY: number) => void;
  resetFieldPositionOffset: (fieldId: string) => void;
  updateFieldScale: (fieldId: string, scale: number) => void;
  resetFieldScale: (fieldId: string) => void;
  copySelectedElement: () => void;
  cutSelectedElement: () => void;
  pasteElement: () => void;

  // Selection
  selectedField: EditorField | null;
  selectedElementId: string | null;
  selectedElementType: "text" | "image" | "color" | "compound" | "canvas-element" | null;
  selectField: (field: EditorField | null) => void;
  selectElement: (id: string | null, type?: "text" | "image" | "color" | "compound" | "canvas-element" | null) => void;

  // Active Tool panel
  activeTool: ToolCategory | null;
  setActiveTool: (tool: ToolCategory | null) => void;

  // UI state
  zoomLevel: number;
  setZoomLevel: (action: number | ((prev: number) => number)) => void;
  saveState: "saved" | "dirty" | "saving";
  triggerSave: () => Promise<void>;

  // History
  past: T[];
  future: T[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Mutation
  updateFieldValue: (field: EditorField, value: unknown) => void;
  updateFieldById: (fieldId: string, value: unknown) => void;
  getFieldValue: (field: EditorField) => unknown;

  // Bottom toolbar / widget toggles
  showWishButton: boolean;
  setShowWishButton: (val: boolean | ((prev: boolean) => boolean)) => void;
  showGiftQR: boolean;
  setShowGiftQR: (val: boolean | ((prev: boolean) => boolean)) => void;
  showRSVP: boolean;
  setShowRSVP: (val: boolean | ((prev: boolean) => boolean)) => void;
  showBottomToolbar: boolean;
  setShowBottomToolbar: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const EditorContext = createContext<EditorContextValue<any> | null>(null);

interface EditorProviderProps<T extends object> {
  templateSlug: string;
  draft: T;
  isVip?: boolean;
  children: React.ReactNode;
  onDraftChange: (nextDraft: T) => void;
  onSave?: () => void | Promise<void>;
}

export function EditorProvider<T extends object>({
  templateSlug,
  draft,
  isVip = false,
  children,
  onDraftChange,
  onSave,
}: EditorProviderProps<T>) {
  const fields = useMemo(() => getTemplateFields(templateSlug), [templateSlug]);

  const [selectedField, setSelectedField] = useState<EditorField | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<"text" | "image" | "color" | "compound" | "canvas-element" | null>(null);

  const [activeTool, setActiveTool] = useState<ToolCategory | null>(null);
  const [zoomLevel, setZoomLevelState] = useState<number>(100);

  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const [dirtyTick, setDirtyTick] = useState(0);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving">("saved");

  // Widget bottom toggles
  const [showBottomToolbar, setShowBottomToolbar] = useState(true);
  const [showWishButton, setShowWishButton] = useState(true);
  const [showGiftQR, setShowGiftQR] = useState(true);
  const [showRSVP, setShowRSVP] = useState(true);

  const saveRef = useRef(onSave);
  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  const setZoomLevel = useCallback((action: number | ((prev: number) => number)) => {
    setZoomLevelState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      return Math.min(200, Math.max(50, next));
    });
  }, []);

  // Free canvas elements & position offsets
  const categoryData = (draft as any)?.categoryData || {};
  const canvasElements: CanvasElement[] = useMemo(
    () => (Array.isArray(categoryData.canvasElements) ? categoryData.canvasElements : []),
    [categoryData.canvasElements]
  );
  const fieldOffsets: Record<string, { x: number; y: number }> = useMemo(
    () => categoryData.fieldPositions || {},
    [categoryData.fieldPositions]
  );

  const fieldScales: Record<string, number> = useMemo(
    () => categoryData.fieldScales || {},
    [categoryData.fieldScales]
  );

  const selectedCanvasElement = useMemo(
    () => canvasElements.find((el) => el.id === selectedElementId) || null,
    [canvasElements, selectedElementId]
  );

  const clipboardRef = useRef<CanvasElement | null>(null);

  const persistElements = useCallback(
    (nextElements: CanvasElement[]) => {
      try {
        const next = applyDraftPatch(draft, "categoryData.canvasElements", nextElements);
        setPast((items) => [...items.slice(-19), draft]);
        setFuture([]);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi lưu canvasElements:", err);
      }
    },
    [draft, onDraftChange]
  );

  const persistOffsets = useCallback(
    (nextOffsets: Record<string, { x: number; y: number }>) => {
      try {
        const next = applyDraftPatch(draft, "categoryData.fieldPositions", nextOffsets);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi lưu fieldPositions:", err);
      }
    },
    [draft, onDraftChange]
  );

  const persistScales = useCallback(
    (nextScales: Record<string, number>) => {
      try {
        const next = applyDraftPatch(draft, "categoryData.fieldScales", nextScales);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi lưu fieldScales:", err);
      }
    },
    [draft, onDraftChange]
  );

  const updateFieldScale = useCallback(
    (fieldId: string, scale: number) => {
      const updated = {
        ...fieldScales,
        [fieldId]: Math.max(0.3, Math.min(3, Math.round(scale * 100) / 100)),
      };
      persistScales(updated);
    },
    [fieldScales, persistScales]
  );

  const resetFieldScale = useCallback(
    (fieldId: string) => {
      const updated = { ...fieldScales };
      delete updated[fieldId];
      persistScales(updated);
    },
    [fieldScales, persistScales]
  );

  const addTextElement = useCallback(
    (preset?: { text?: string; fontSize?: number; isBold?: boolean }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const newEl: CanvasElement = {
        id: `elem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "text",
        content: preset?.text || "Văn bản mới",
        x: pos?.x ?? 45,
        y: pos?.y ?? 280,
        width: 300,
        height: 54,
        fontSize: preset?.fontSize || 28,
        fontFamily: (draft as any)?.fontFamily || "Playfair Display",
        color: (draft as any)?.primaryColor || "#333333",
        opacity: 1,
        textAlign: "center",
        isBold: preset?.isBold || false,
        zIndex: maxZ + 1,
        isLocked: false,
      };
      const updated = [...canvasElements, newEl];
      persistElements(updated);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, draft, persistElements]
  );

  const addStickerElement = useCallback(
    (item: { icon: string; title: string; imageUrl?: string; width?: number; height?: number; color?: string }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const newEl: CanvasElement = {
        id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "sticker",
        content: item.icon,
        imageUrl: item.imageUrl,
        title: item.title,
        color: item.color,
        x: pos?.x ?? 140,
        y: pos?.y ?? 280,
        width: item.width || 100,
        height: item.height || 100,
        fontSize: item.width ? Math.round(item.width * 0.5) : 60,
        zIndex: maxZ + 1,
        isLocked: false,
        opacity: 1,
      };
      const updated = [...canvasElements, newEl];
      persistElements(updated);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElements]
  );

  const addShapeElement = useCallback(
    (item: { shapeType: "line" | "rect" | "circle" | "corner"; title: string }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      let newEl: CanvasElement;

      if (item.shapeType === "line") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "line",
          content: "—",
          title: item.title,
          x: pos?.x ?? 45,
          y: pos?.y ?? 300,
          width: 300,
          height: 14,
          backgroundColor: "#BE944E",
          color: "#BE944E",
          borderRadius: 4,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "rect") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "rect",
          content: "",
          title: item.title,
          x: pos?.x ?? 55,
          y: pos?.y ?? 240,
          width: 280,
          height: 180,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "rgba(190, 148, 78, 0.05)",
          borderRadius: 16,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "circle") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "circle",
          content: "",
          title: item.title,
          x: pos?.x ?? 105,
          y: pos?.y ?? 240,
          width: 180,
          height: 180,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "rgba(190, 148, 78, 0.05)",
          borderRadius: 999,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "corner",
          content: "⚜️",
          title: item.title,
          x: pos?.x ?? 150,
          y: pos?.y ?? 280,
          width: 80,
          height: 80,
          fontSize: 48,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      }

      const updated = [...canvasElements, newEl];
      persistElements(updated);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElements]
  );

  const addPresetElement = useCallback(
    (item: { id: string; title: string; cat: string }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      let newEl: CanvasElement;

      if (item.id === "p1") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p1",
          title: "Khung Ảnh Cổng Vòm",
          content: "/images/demo/couple-cover.png",
          x: pos?.x ?? 55,
          y: pos?.y ?? 200,
          width: 280,
          height: 330,
          borderRadius: 140,
          borderWidth: 3,
          borderColor: "#BE944E",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p2") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p2",
          title: "Khung Ảnh Polaroids",
          content: "polaroids",
          x: pos?.x ?? 40,
          y: pos?.y ?? 220,
          width: 310,
          height: 240,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p3") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p3",
          title: "Khối Lịch Trình Tiệc Đầy Đủ",
          content: "schedule",
          x: pos?.x ?? 35,
          y: pos?.y ?? 240,
          width: 320,
          height: 230,
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#E5E1D8",
          shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p4") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p4",
          title: "Thẻ Song Thân 2 Cột Cân Đối",
          content: "parents",
          x: pos?.x ?? 35,
          y: pos?.y ?? 250,
          width: 320,
          height: 180,
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#E5E1D8",
          shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p5",
          title: "Khối Lời Ngỏ Cổ Điển",
          content: "“Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng. Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi!”",
          x: pos?.x ?? 35,
          y: pos?.y ?? 260,
          width: 320,
          height: 160,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#D4AF37",
          fontFamily: "Playfair Display",
          fontSize: 14,
          color: "#4A3E3D",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      }

      const updated = [...canvasElements, newEl];
      persistElements(updated);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElements]
  );

  const addImageElement = useCallback(
    (url: string, caption?: string, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const newEl: CanvasElement = {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "image",
        imageUrl: url,
        content: url,
        title: caption || "Ảnh mới",
        x: pos?.x ?? 65,
        y: pos?.y ?? 220,
        width: 260,
        height: 200,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        shadow: "0 10px 20px -5px rgba(0,0,0,0.15)",
        zIndex: maxZ + 1,
        isLocked: false,
        opacity: 1,
      };
      const updated = [...canvasElements, newEl];
      persistElements(updated);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElements]
  );

  const updateCanvasElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      const updated = canvasElements.map((el) => (el.id === id ? { ...el, ...patch } : el));
      persistElements(updated);
    },
    [canvasElements, persistElements]
  );

  const removeCanvasElement = useCallback(
    (id: string) => {
      const updated = canvasElements.filter((el) => el.id !== id);
      persistElements(updated);
      if (selectedElementId === id) {
        setSelectedElementId(null);
        setSelectedElementType(null);
      }
    },
    [canvasElements, persistElements, selectedElementId]
  );

  const duplicateCanvasElement = useCallback(
    (id: string) => {
      const target = canvasElements.find((el) => el.id === id);
      if (!target) return null;
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const copy: CanvasElement = {
        ...target,
        id: `elem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: target.x + 15,
        y: target.y + 15,
        zIndex: maxZ + 1,
      };
      persistElements([...canvasElements, copy]);
      setSelectedElementId(copy.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return copy.id;
    },
    [canvasElements, persistElements]
  );

  const reorderElementLayer = useCallback(
    (id: string, action: "top" | "bottom" | "up" | "down") => {
      const target = canvasElements.find((el) => el.id === id);
      if (!target) return;
      let nextZ = target.zIndex || 1;
      const allZ = canvasElements.map((e) => e.zIndex || 1).sort((a, b) => a - b);
      const maxZ = allZ.length ? Math.max(...allZ) : 1;
      const minZ = allZ.length ? Math.min(...allZ) : 1;

      if (action === "top") nextZ = maxZ + 1;
      else if (action === "bottom") nextZ = Math.max(1, minZ - 1);
      else if (action === "up") nextZ = target.zIndex + 1;
      else if (action === "down") nextZ = Math.max(1, target.zIndex - 1);

      updateCanvasElement(id, { zIndex: nextZ });
    },
    [canvasElements, updateCanvasElement]
  );

  const toggleLockElement = useCallback(
    (id: string) => {
      const target = canvasElements.find((el) => el.id === id);
      if (!target) return;
      updateCanvasElement(id, { isLocked: !target.isLocked });
    },
    [canvasElements, updateCanvasElement]
  );

  const updateFieldPositionOffset = useCallback(
    (fieldId: string, deltaX: number, deltaY: number) => {
      const curr = fieldOffsets[fieldId] || { x: 0, y: 0 };
      const updated = {
        ...fieldOffsets,
        [fieldId]: { x: curr.x + deltaX, y: curr.y + deltaY },
      };
      persistOffsets(updated);
    },
    [fieldOffsets, persistOffsets]
  );

  const resetFieldPositionOffset = useCallback(
    (fieldId: string) => {
      const updated = { ...fieldOffsets };
      delete updated[fieldId];
      persistOffsets(updated);
    },
    [fieldOffsets, persistOffsets]
  );

  const copySelectedElement = useCallback(() => {
    if (selectedCanvasElement) {
      clipboardRef.current = { ...selectedCanvasElement };
    }
  }, [selectedCanvasElement]);

  const cutSelectedElement = useCallback(() => {
    if (selectedCanvasElement) {
      clipboardRef.current = { ...selectedCanvasElement };
      removeCanvasElement(selectedCanvasElement.id);
    }
  }, [selectedCanvasElement, removeCanvasElement]);

  const pasteElement = useCallback(() => {
    if (!clipboardRef.current) return;
    const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
    const pasted: CanvasElement = {
      ...clipboardRef.current,
      id: `elem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: clipboardRef.current.x + 20,
      y: clipboardRef.current.y + 20,
      zIndex: maxZ + 1,
    };
    persistElements([...canvasElements, pasted]);
    setSelectedElementId(pasted.id);
    setSelectedElementType("canvas-element");
  }, [canvasElements, persistElements]);

  const selectField = useCallback((field: EditorField | null) => {
    setSelectedField(field);
    if (field) {
      setSelectedElementId(field.id);
      setSelectedElementType(field.type === "image" ? "image" : field.type === "color" ? "color" : "text");
    } else {
      setSelectedElementId(null);
      setSelectedElementType(null);
    }
  }, []);

  const selectElement = useCallback(
    (id: string | null, type: "text" | "image" | "color" | "compound" | "canvas-element" | null = null) => {
      setSelectedElementId(id);
      setSelectedElementType(type);
      if (id) {
        const found = fields.find((f) => f.id === id);
        if (found) {
          setSelectedField(found);
          return;
        }
      }
      setSelectedField(null);
    },
    [fields]
  );

  const updateFieldValue = useCallback(
    (field: EditorField, value: unknown) => {
      try {
        const next = applyDraftPatch(draft, field.path, value);
        setPast((items) => [...items.slice(-19), draft]);
        setFuture([]);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi cập nhật field:", err);
      }
    },
    [draft, onDraftChange]
  );

  const updateFieldById = useCallback(
    (fieldId: string, value: unknown) => {
      const field = fields.find((f) => f.id === fieldId);
      if (field) {
        updateFieldValue(field, value);
      }
    },
    [fields, updateFieldValue]
  );

  const getFieldValue = useCallback(
    (field: EditorField) => {
      return readDraftPath(draft, field.path);
    },
    [draft]
  );

  const undo = useCallback(() => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [draft, ...items]);
    onDraftChange(previous);
  }, [past, draft, onDraftChange]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setPast((items) => [...items, draft]);
    onDraftChange(next);
  }, [future, draft, onDraftChange]);

  const triggerSave = useCallback(async () => {
    if (!saveRef.current) return;
    setSaveState("saving");
    try {
      await Promise.resolve(saveRef.current());
      setSaveState("saved");
    } catch {
      setSaveState("dirty");
    }
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (!dirtyTick || !onSave) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void Promise.resolve(saveRef.current?.())
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("dirty"));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [dirtyTick, onSave]);

  const value: EditorContextValue<T> = {
    draft,
    templateSlug,
    isVip,
    fields,
    selectedField,
    selectedElementId,
    selectedElementType,
    selectField,
    selectElement,
    activeTool,
    setActiveTool,
    zoomLevel,
    setZoomLevel,
    saveState,
    triggerSave,
    past,
    future,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    canvasElements,
    selectedCanvasElement,
    fieldOffsets,
    fieldScales,
    addTextElement,
    addStickerElement,
    addShapeElement,
    addPresetElement,
    addImageElement,
    updateCanvasElement,
    removeCanvasElement,
    duplicateCanvasElement,
    reorderElementLayer,
    toggleLockElement,
    updateFieldPositionOffset,
    resetFieldPositionOffset,
    updateFieldScale,
    resetFieldScale,
    copySelectedElement,
    cutSelectedElement,
    pasteElement,
    updateFieldValue,
    updateFieldById,
    getFieldValue,
    showBottomToolbar,
    setShowBottomToolbar,
    showWishButton,
    setShowWishButton,
    showGiftQR,
    setShowGiftQR,
    showRSVP,
    setShowRSVP,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor<T extends object = Record<string, unknown>>(): EditorContextValue<T> {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return ctx as EditorContextValue<T>;
}
