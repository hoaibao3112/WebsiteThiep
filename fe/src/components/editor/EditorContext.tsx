"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ApiClient } from "@/lib/api";
import { EditorField, getTemplateFields } from "@/lib/editor/template-registry";
import { applyDraftPatch, readDraftPath } from "@/lib/editor/patch-draft";
import type { CanvasElement, WidgetType, ShapeType } from "@/types/canvas.types";
export type { CanvasElement, WidgetType, WidgetConfig, ShapeType } from "@/types/canvas.types";

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

export interface EditorContextValue<T extends object = Record<string, unknown>> {
  // Data state
  draft: T;
  templateSlug: string;
  isVip: boolean;
  fields: readonly EditorField[];

  // Free Canvas Elements
  canvasElements: CanvasElement[];
  canvasHeight: number;
  setCanvasHeight: (height: number) => void;
  fitCanvasToContent: () => void;
  registerViewportCenterGetter: (getter: () => { x: number; y: number } | null) => () => void;
  getViewportCenter: () => { x: number; y: number };
  selectedCanvasElement: CanvasElement | null;
  fieldOffsets: Record<string, { x: number; y: number }>;
  fieldScales: Record<string, number>;
  canvasBackgroundColor: string;
  setCanvasBackgroundColor: (color: string) => void;
  canvasBackgroundPattern: "none" | "flower-small" | "flower-large";
  setCanvasBackgroundPattern: (pat: "none" | "flower-small" | "flower-large") => void;
  canvasFallingEffect: string;
  setCanvasFallingEffect: (eff: string) => void;
  addTextElement: (preset?: { text?: string; fontSize?: number; isBold?: boolean; fontFamily?: string; color?: string }, pos?: { x?: number; y?: number }) => string;
  addStickerElement: (item: { icon: string; title: string; imageUrl?: string; width?: number; height?: number; color?: string }, pos?: { x?: number; y?: number }) => string;
  addStockElement: (item: { id: string; title: string; imageUrl?: string; icon?: string; width?: number; height?: number; color?: string; svgContent?: string; svgType?: "frame" | "divider" | "custom" }, pos?: { x?: number; y?: number }) => string;
  addShapeElement: (item: { shapeType: ShapeType; title: string }, pos?: { x?: number; y?: number }) => string;
  addPresetElement: (item: { id: string; title: string; cat: string }, pos?: { x?: number; y?: number }) => string;
  addImageElement: (url: string, caption?: string, pos?: { x?: number; y?: number }) => string;
  addWidgetElement: (widgetType: WidgetType, pos?: { x?: number; y?: number }) => string;
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
  hasUnsavedChanges: boolean;
  triggerSave: () => Promise<void>;

  // History
  past: T[];
  future: T[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  beginInteraction: () => void;
  endInteraction: () => void;

  // Mutation
  updateFieldValue: (field: EditorField, value: unknown) => void;
  updateFieldById: (fieldId: string, value: unknown) => void;
  getFieldValue: (field: EditorField) => unknown;

  // Photos gallery management
  updatePhotos: (photos: Array<{ id: string; url: string; caption?: string; isCover?: boolean }>) => void;
  addPhotoToGallery: (photo: { id?: string; url: string; caption?: string; isCover?: boolean }) => void;
  removePhotoFromGallery: (photoIdOrUrl: string) => void;
  setCoverPhoto: (url: string) => void;
  replaceSelectedImage: (url: string) => boolean;

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

export function getDefaultCanvasElements(draft?: any): CanvasElement[] {
  const groom = draft?.categoryData?.groom?.fullName || draft?.groom?.fullName || "Văn Anh";
  const bride = draft?.categoryData?.bride?.fullName || draft?.bride?.fullName || "Minh Thơ";
  const cover = draft?.categoryData?.coverPhotoUrl || draft?.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80";

  return [
    {
      id: "el-header-quote",
      type: "text",
      content: "SAVE THE DATE",
      x: 45,
      y: 35,
      width: 300,
      height: 30,
      fontSize: 13,
      fontFamily: "Playfair Display",
      color: "#BE944E",
      textAlign: "center",
      letterSpacing: 4,
      isBold: true,
      zIndex: 2,
    },
    {
      id: "el-couple-names",
      type: "text",
      content: `${groom} & ${bride}`,
      x: 35,
      y: 65,
      width: 320,
      height: 48,
      fontSize: 28,
      fontFamily: "Great Vibes",
      color: "#2C2C2C",
      textAlign: "center",
      zIndex: 2,
    },
    {
      id: "el-envelope",
      type: "preset",
      presetId: "p-envelope-pink",
      title: "Phong bì hồng mở có thiệp",
      content: "envelope-pink",
      imageUrl: cover,
      x: 45,
      y: 130,
      width: 300,
      height: 250,
      zIndex: 3,
    },
    {
      id: "el-carnation",
      type: "preset",
      presetId: "p-carnation-bouquet",
      title: "Cành cẩm chướng nơ đỏ",
      content: "carnation",
      x: 18,
      y: 190,
      width: 85,
      height: 130,
      zIndex: 10,
    },
    {
      id: "el-wax-seal",
      type: "preset",
      presetId: "p-wax-seal",
      title: "Con dấu sáp hồng niêm phong",
      content: "wax-seal",
      x: 165,
      y: 350,
      width: 58,
      height: 58,
      zIndex: 11,
    },
    {
      id: "el-mini-bouquet",
      type: "preset",
      presetId: "p-mini-bouquet",
      title: "Bó hoa cưới mini pastel",
      content: "mini-bouquet",
      x: 265,
      y: 400,
      width: 75,
      height: 95,
      zIndex: 10,
    },
    {
      id: "el-gold-divider",
      type: "preset",
      presetId: "p-gold-divider",
      title: "Thanh chỉ vàng kim loại",
      content: "gold-divider",
      x: 55,
      y: 255,
      width: 280,
      height: 12,
      zIndex: 9,
    },
  ];
}

interface EditorProviderProps<T extends object> {
  templateSlug: string;
  draft: T;
  isVip?: boolean;
  children: React.ReactNode;
  onDraftChange: (nextDraft: T) => void;
  onSave?: (draft: T) => void | Promise<void>;
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
  const interactionDraftRef = useRef<T | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const saveRef = useRef(onSave);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const dirtyTickRef = useRef(dirtyTick);
  dirtyTickRef.current = dirtyTick;
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
  const canvasHeight = Number(categoryData.canvasDocument?.height ?? categoryData.canvasHeight ?? categoryData.canvas?.height ?? 1200);
  const setCanvasHeight = useCallback((height: number) => {
    if (!Number.isFinite(height)) return;
    const bounded = Math.max(500, Math.min(15000, Math.round(height)));
    const currentCategory = (draftRef.current as { categoryData?: { cardCategory?: string; canvasDocument?: object; canvas?: object } }).categoryData;
    const hasWeddingScene = currentCategory?.cardCategory === "WEDDING" && Boolean(currentCategory.canvasDocument);
    let next = draftRef.current;
    if (hasWeddingScene) {
      next = applyDraftPatch(next, "categoryData.canvasDocument.height", bounded);
    }
    next = applyDraftPatch(next, "categoryData.canvasHeight", bounded);
    next = applyDraftPatch(next, "categoryData.canvas", {
      ...((next as { categoryData?: { canvas?: object } }).categoryData?.canvas ?? {}),
      width: 390,
      height: bounded,
    });
    if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draftRef.current]);
    setFuture([]);
    onDraftChange(next);
    setDirtyTick((tick) => tick + 1);
    setSaveState("dirty");
  }, [onDraftChange]);
  const showBottomToolbar = categoryData.showBottomToolbar ?? true;
  const showWishButton = categoryData.showWishButton ?? true;
  const showGiftQR = categoryData.showGiftQR ?? true;
  const showRSVP = categoryData.showRSVP ?? true;
  const setToggle = useCallback((key: "showBottomToolbar" | "showWishButton" | "showGiftQR" | "showRSVP", value: boolean | ((prev: boolean) => boolean)) => {
    const current = ((draftRef.current as { categoryData?: Record<string, unknown> }).categoryData?.[key] as boolean | undefined) ?? true;
    const nextValue = typeof value === "function" ? value(current) : value;
    const next = applyDraftPatch(draftRef.current, `categoryData.${key}`, nextValue);
    if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draftRef.current]);
    setFuture([]);
    onDraftChange(next);
    setDirtyTick((tick) => tick + 1);
    setSaveState("dirty");
  }, [onDraftChange]);
  const setShowBottomToolbar = useCallback((value: boolean | ((prev: boolean) => boolean)) => setToggle("showBottomToolbar", value), [setToggle]);
  const setShowWishButton = useCallback((value: boolean | ((prev: boolean) => boolean)) => setToggle("showWishButton", value), [setToggle]);
  const setShowGiftQR = useCallback((value: boolean | ((prev: boolean) => boolean)) => setToggle("showGiftQR", value), [setToggle]);
  const setShowRSVP = useCallback((value: boolean | ((prev: boolean) => boolean)) => setToggle("showRSVP", value), [setToggle]);
  const canvasElements: CanvasElement[] = useMemo(() => {
    const documentElements = categoryData.canvasDocument?.elements;
    if (Array.isArray(documentElements)) return documentElements;
    if (Array.isArray(categoryData.canvasElements)) {
      return categoryData.canvasElements;
    }
    return categoryData.cardCategory === "WEDDING" ? [] : getDefaultCanvasElements(draft);
  }, [categoryData.canvasDocument?.elements, categoryData.canvasElements, categoryData.cardCategory, draft]);
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
  const patchDebounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      patchDebounceTimersRef.current.forEach((timer) => clearTimeout(timer));
      patchDebounceTimersRef.current.clear();
    };
  }, []);

  const persistElements = useCallback(
    (nextElements: CanvasElement[]) => {
      try {
        const currentDraft = draftRef.current;
        const category = (currentDraft as { categoryData?: { cardCategory?: string; canvasDocument?: object } }).categoryData;
        const isWedding = category?.cardCategory === "WEDDING";
        const hasWeddingScene = isWedding && Boolean(category?.canvasDocument);
        const next = applyDraftPatch(
          currentDraft,
          hasWeddingScene ? "categoryData.canvasDocument.elements" : "categoryData.canvasElements",
          nextElements
        );
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), currentDraft]);
        setFuture([]);
        draftRef.current = next;
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi lưu scene elements:", err);
      }
    },
    [onDraftChange]
  );

  const persistElementsAndHeight = useCallback(
    (nextElements: CanvasElement[], nextHeight?: number) => {
      try {
        const currentDraft = draftRef.current;
        const category = (currentDraft as { categoryData?: { cardCategory?: string; canvasDocument?: any; canvas?: any; canvasHeight?: number } }).categoryData;
        const isWedding = category?.cardCategory === "WEDDING";
        const hasWeddingScene = isWedding && Boolean(category?.canvasDocument);

        let next = applyDraftPatch(
          currentDraft,
          hasWeddingScene ? "categoryData.canvasDocument.elements" : "categoryData.canvasElements",
          nextElements
        );

        if (nextHeight && Number.isFinite(nextHeight)) {
          const boundedHeight = Math.max(600, Math.min(15000, Math.round(nextHeight)));
          if (hasWeddingScene) {
            next = applyDraftPatch(next, "categoryData.canvasDocument.height", boundedHeight);
          }
          next = applyDraftPatch(next, "categoryData.canvasHeight", boundedHeight);
          next = applyDraftPatch(next, "categoryData.canvas", {
            ...((next as any)?.categoryData?.canvas ?? {}),
            width: 390,
            height: boundedHeight,
          });
        }

        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), currentDraft]);
        setFuture([]);
        draftRef.current = next;
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi lưu scene elements & height:", err);
      }
    },
    [onDraftChange]
  );

  const persistOffsets = useCallback(
    (nextOffsets: Record<string, { x: number; y: number }>) => {
      try {
        const next = applyDraftPatch(draftRef.current, "categoryData.fieldPositions", nextOffsets);
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draftRef.current]);
        setFuture([]);
        draftRef.current = next;
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi lưu fieldPositions:", err);
      }
    },
    [onDraftChange]
  );

  const persistScales = useCallback(
    (nextScales: Record<string, number>) => {
      try {
        const next = applyDraftPatch(draftRef.current, "categoryData.fieldScales", nextScales);
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draftRef.current]);
        setFuture([]);
        draftRef.current = next;
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi lưu fieldScales:", err);
      }
    },
    [onDraftChange]
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

  const fitCanvasToContent = useCallback(() => {
    const bottom = canvasElements.reduce((acc, el) => Math.max(acc, el.y + el.height), 0);
    const newHeight = Math.max(800, bottom + 120);
    setCanvasHeight(newHeight);
  }, [canvasElements, setCanvasHeight]);

  const viewportCenterGetterRef = useRef<(() => { x: number; y: number } | null) | null>(null);
  const registerViewportCenterGetter = useCallback((getter: () => { x: number; y: number } | null) => {
    viewportCenterGetterRef.current = getter;
    return () => {
      if (viewportCenterGetterRef.current === getter) {
        viewportCenterGetterRef.current = null;
      }
    };
  }, []);

  const getViewportCenter = useCallback(() => {
    // 1. Thử gọi getter đã đăng ký từ CenterCanvas đang hiển thị
    if (viewportCenterGetterRef.current) {
      try {
        const res = viewportCenterGetterRef.current();
        if (res && typeof res.y === "number" && !isNaN(res.y)) {
          return res;
        }
      } catch (err) {
        console.error("Lỗi getViewportCenter:", err);
      }
    }

    // 2. Dự phòng trực tiếp: Quét DOM tìm viewport và artboard thực tế đang hiển thị trên màn hình
    if (typeof document !== "undefined") {
      try {
        const viewports = document.querySelectorAll<HTMLElement>("[data-center-canvas-viewport]");
        for (const vp of Array.from(viewports)) {
          if (vp.clientHeight > 0 && vp.offsetParent !== null) {
            const artboard = vp.querySelector<HTMLElement>("[data-center-canvas-artboard]");
            if (artboard) {
              const vpRect = vp.getBoundingClientRect();
              const artRect = artboard.getBoundingClientRect();
              const screenCenterY = vpRect.top + vpRect.height / 2;
              const zoomFactor = Math.max(0.1, artRect.width / 390);
              const visualY = (screenCenterY - artRect.top) / zoomFactor;
              return {
                x: 195,
                y: Math.max(20, Math.round(visualY)),
              };
            }
          }
        }
      } catch (err) {
        console.error("DOM fallback getViewportCenter error:", err);
      }
    }

    return { x: 195, y: 280 };
  }, []);

  const getDefaultPosition = useCallback(
    (elemW: number, elemH: number, pos?: { x?: number; y?: number }) => {
      let x = pos?.x;
      let y = pos?.y;

      if (x === undefined) {
        x = Math.max(10, Math.round((390 - elemW) / 2));
      }

      if (y === undefined) {
        const center = getViewportCenter();
        y = Math.round(center.y - elemH / 2);
        y = Math.max(20, y);
      }

      const neededHeight = y + elemH > canvasHeight - 40 ? Math.max(canvasHeight, y + elemH + 160) : undefined;

      return { x, y, neededHeight };
    },
    [getViewportCenter, canvasHeight]
  );

  const addTextElement = useCallback(
    (preset?: { text?: string; fontSize?: number; isBold?: boolean; fontFamily?: string; color?: string }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const w = 300;
      const h = 54;
      const { x: defaultX, y: defaultY, neededHeight } = getDefaultPosition(w, h, pos);
      const newEl: CanvasElement = {
        id: `elem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "text",
        content: preset?.text || "Văn bản mới",
        x: defaultX,
        y: defaultY,
        width: w,
        height: h,
        fontSize: preset?.fontSize || 28,
        fontFamily: preset?.fontFamily || (draftRef.current as any)?.fontFamily || "Playfair Display",
        color: preset?.color || (draftRef.current as any)?.primaryColor || "#333333",
        opacity: 1,
        textAlign: "center",
        isBold: preset?.isBold || false,
        zIndex: maxZ + 1,
        isLocked: false,
      };
      const updated = [...canvasElements, newEl];
      persistElementsAndHeight(updated, neededHeight);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElementsAndHeight, getDefaultPosition]
  );

  const canvasBackgroundColor = useMemo(
    () => categoryData.canvasDocument?.background?.color || categoryData?.canvas?.backgroundColor || categoryData?.canvasBackgroundColor || "#FFFFFF",
    [categoryData]
  );

  const canvasBackgroundPattern = useMemo(
    () => categoryData.canvasDocument?.background?.pattern || categoryData?.canvas?.backgroundPattern || categoryData?.canvasBackgroundPattern || "none",
    [categoryData]
  );

  const canvasFallingEffect = useMemo(
    () => categoryData?.canvas?.fallingEffect || (draft as any)?.fallingEffect || "none",
    [categoryData, draft]
  );

  const setCanvasBackgroundColor = useCallback(
    (color: string) => {
      try {
        const currentCategory = (draft as { categoryData?: { cardCategory?: string; canvasDocument?: { background?: Record<string, unknown> }; canvas?: Record<string, unknown> } }).categoryData;
        const hasWeddingScene = currentCategory?.cardCategory === "WEDDING" && Boolean(currentCategory.canvasDocument);
        let next = hasWeddingScene
          ? applyDraftPatch(draft, "categoryData.canvasDocument.background", { ...currentCategory!.canvasDocument!.background, color })
          : applyDraftPatch(draft, "categoryData.canvasBackgroundColor", color);
        if (!hasWeddingScene) {
          const currentCanvas = currentCategory?.canvas || { width: 390, height: canvasHeight, backgroundPattern: canvasBackgroundPattern, fallingEffect: canvasFallingEffect, elements: canvasElements };
          next = applyDraftPatch(next, "categoryData.canvas", { ...currentCanvas, backgroundColor: color });
        }
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draft]);
        setFuture([]);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi cập nhật canvasBackgroundColor:", err);
      }
    },
    [draft, onDraftChange, canvasBackgroundPattern, canvasFallingEffect, canvasElements]
  );

  const setCanvasBackgroundPattern = useCallback(
    (pattern: "none" | "flower-small" | "flower-large") => {
      try {
        const currentCategory = (draft as { categoryData?: { cardCategory?: string; canvasDocument?: { background?: Record<string, unknown> }; canvas?: Record<string, unknown> } }).categoryData;
        const hasWeddingScene = currentCategory?.cardCategory === "WEDDING" && Boolean(currentCategory.canvasDocument);
        let next = hasWeddingScene
          ? applyDraftPatch(draft, "categoryData.canvasDocument.background", { ...currentCategory!.canvasDocument!.background, pattern })
          : applyDraftPatch(draft, "categoryData.canvasBackgroundPattern", pattern);
        if (!hasWeddingScene) {
          const currentCanvas = currentCategory?.canvas || { width: 390, height: canvasHeight, backgroundColor: canvasBackgroundColor, fallingEffect: canvasFallingEffect, elements: canvasElements };
          next = applyDraftPatch(next, "categoryData.canvas", { ...currentCanvas, backgroundPattern: pattern });
        }
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draft]);
        setFuture([]);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi cập nhật canvasBackgroundPattern:", err);
      }
    },
    [draft, onDraftChange, canvasBackgroundColor, canvasFallingEffect, canvasElements]
  );

  const setCanvasFallingEffect = useCallback(
    (effect: string) => {
      try {
        let next = applyDraftPatch(draft, "fallingEffect", effect);
        const currentCanvas = (next as any)?.categoryData?.canvas || {
          width: 390,
          height: canvasHeight,
          backgroundColor: canvasBackgroundColor,
          backgroundPattern: canvasBackgroundPattern,
          elements: canvasElements,
        };
        next = applyDraftPatch(next, "categoryData.canvas", {
          ...currentCanvas,
          fallingEffect: effect,
        });
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draft]);
        setFuture([]);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi cập nhật canvasFallingEffect:", err);
      }
    },
    [draft, onDraftChange, canvasBackgroundColor, canvasBackgroundPattern, canvasElements]
  );

  const addStockElement = useCallback(
    (
      item: { id: string; title: string; imageUrl?: string; icon?: string; width?: number; height?: number; color?: string; svgContent?: string; svgType?: "frame" | "divider" | "custom" },
      pos?: { x?: number; y?: number }
    ) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const defaultW = item.width || 160;
      const defaultH = item.height || 180;
      const { x: defaultX, y: defaultY, neededHeight } = getDefaultPosition(defaultW, defaultH, pos);
      const newEl: CanvasElement = {
        id: `stock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "stock",
        stockId: item.id,
        content: item.imageUrl || item.icon || item.title || "Khung viền",
        imageUrl: item.imageUrl,
        svgContent: item.svgContent,
        svgType: item.svgType,
        title: item.title,
        color: item.color,
        x: defaultX,
        y: defaultY,
        width: defaultW,
        height: defaultH,
        zIndex: maxZ + 1,
        isLocked: false,
        opacity: 1,
        flipX: false,
        flipY: false,
      };
      const updated = [...canvasElements, newEl];
      persistElementsAndHeight(updated, neededHeight);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElementsAndHeight, getDefaultPosition]
  );

  const addStickerElement = useCallback(
    (item: { icon: string; title: string; imageUrl?: string; width?: number; height?: number; color?: string }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const w = item.width || 100;
      const h = item.height || 100;
      const { x: defaultX, y: defaultY, neededHeight } = getDefaultPosition(w, h, pos);
      const newEl: CanvasElement = {
        id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "sticker",
        content: item.icon,
        imageUrl: item.imageUrl,
        title: item.title,
        color: item.color,
        x: defaultX,
        y: defaultY,
        width: w,
        height: h,
        fontSize: item.width ? Math.round(item.width * 0.5) : 60,
        zIndex: maxZ + 1,
        isLocked: false,
        opacity: 1,
      };
      const updated = [...canvasElements, newEl];
      persistElementsAndHeight(updated, neededHeight);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElementsAndHeight, getDefaultPosition]
  );

  const addShapeElement = useCallback(
    (item: { shapeType: ShapeType; title: string }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      let w = 160;
      let h = 160;

      if (item.shapeType === "line") { w = 300; h = 14; }
      else if (item.shapeType === "square") { w = 150; h = 150; }
      else if (item.shapeType === "rect") { w = 280; h = 180; }
      else if (item.shapeType === "circle") { w = 160; h = 160; }
      else if (item.shapeType === "triangle") { w = 160; h = 160; }
      else if (item.shapeType === "arch") { w = 200; h = 260; }
      else if (item.shapeType === "heart") { w = 160; h = 160; }
      else if (item.shapeType === "star") { w = 140; h = 140; }
      else if (item.shapeType === "diamond") { w = 160; h = 160; }
      else if (item.shapeType === "hexagon") { w = 170; h = 170; }
      else if (item.shapeType === "oval") { w = 200; h = 250; }
      else if (item.shapeType === "ribbon") { w = 260; h = 70; }
      else if (item.shapeType === "wavy-line") { w = 280; h = 24; }
      else if (item.shapeType === "dashed-line") { w = 280; h = 14; }
      else if (item.shapeType === "flourish-line") { w = 280; h = 30; }
      else if (item.shapeType === "corner") { w = 80; h = 80; }

      const { x: defaultX, y: defaultY, neededHeight } = getDefaultPosition(w, h, pos);
      let newEl: CanvasElement;

      if (item.shapeType === "line") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "line",
          content: "—",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          backgroundColor: "#BE944E",
          color: "#BE944E",
          borderRadius: 4,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "square") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "square",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
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
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          borderRadius: 0,
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
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          borderRadius: 999,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "triangle") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "triangle",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "arch") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "arch",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "heart") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "heart",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#E11D48",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "star") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "star",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#D4AF37",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "diamond") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "diamond",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "hexagon") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "hexagon",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "oval") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "oval",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "ribbon") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "ribbon",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "wavy-line") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "wavy-line",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "dashed-line") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "dashed-line",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.shapeType === "flourish-line") {
        newEl = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "shape",
          shapeType: "flourish-line",
          content: "",
          title: item.title,
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          borderWidth: 2,
          borderColor: "#BE944E",
          backgroundColor: "transparent",
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
          x: defaultX,
          y: defaultY,
          width: w,
          height: h,
          fontSize: 48,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      }

      const updated = [...canvasElements, newEl];
      persistElementsAndHeight(updated, neededHeight);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElementsAndHeight, getDefaultPosition]
  );

  const addPresetElement = useCallback(
    (item: { id: string; title: string; cat: string }, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      let newEl: CanvasElement;

      if (item.id === "p-orchid-arch") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-orchid-arch",
          title: "Khung vòm hoa lan hoàng gia",
          content: "orchid-arch",
          imageUrl: (draft as any)?.coverPhotoUrl || "/images/presets/arch-orchid-sample.jpg",
          x: pos?.x ?? 35,
          y: pos?.y ?? 130,
          width: 320,
          height: 420,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-wedding-gift-luxury") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-wedding-gift-luxury",
          title: "Bảng mừng cưới & Mã QR hoàng gia",
          content: "wedding-gift-luxury",
          x: pos?.x ?? 25,
          y: pos?.y ?? 80,
          width: 340,
          height: 540,
          customData: {
            title: "MỪNG CƯỚI",
            subtitle: "Thay cho những lời chúc tốt đẹp",
            message: "Sự hiện diện và lời chúc của bạn là món quà quý giá nhất với chúng mình. Nếu muốn gửi thêm chút yêu thương, bạn có thể mừng cưới qua số tài khoản bên dưới ạ.",
            groomName: (draft as any)?.categoryData?.groom?.fullName || (draft as any)?.groom?.fullName || "",
            groomBank: (draft as any)?.bankingPrimary?.bankCode || "",
            groomAccount: (draft as any)?.bankingPrimary?.accountNumber || "",
            brideName: (draft as any)?.categoryData?.bride?.fullName || (draft as any)?.bride?.fullName || "",
            brideBank: (draft as any)?.bankingSecondary?.bankCode || "",
            brideAccount: (draft as any)?.bankingSecondary?.accountNumber || "",
          },
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-envelope-songhy") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-envelope-songhy",
          title: "Phong bì kem sáp Song Hỷ",
          content: "envelope-songhy",
          imageUrl: (draft as any)?.coverPhotoUrl || "/images/presets/envelope-songhy-luxury.jpg",
          x: pos?.x ?? 30,
          y: pos?.y ?? 150,
          width: 330,
          height: 380,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-envelope-pink" || item.id === "p1") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-envelope-pink",
          title: "Phong bì hồng mở có thiệp",
          content: "envelope-pink",
          imageUrl: (draft as any)?.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
          x: pos?.x ?? 45,
          y: pos?.y ?? 180,
          width: 300,
          height: 250,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-envelope-green") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-envelope-green",
          title: "Phong bì xanh lục bảo mở sáp",
          content: "envelope-green",
          imageUrl: (draft as any)?.coverPhotoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
          x: pos?.x ?? 45,
          y: pos?.y ?? 180,
          width: 300,
          height: 250,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-wedding-typography") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-wedding-typography",
          title: "Thư mời tiệc cưới WEDDING",
          content: "wedding-typography",
          x: pos?.x ?? 40,
          y: pos?.y ?? 200,
          width: 310,
          height: 290,
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#E5E1D8",
          shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-calendar-countdown") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-calendar-countdown",
          title: "Bảng lịch ngày cưới khoanh tròn",
          content: "calendar-countdown",
          x: pos?.x ?? 45,
          y: pos?.y ?? 210,
          width: 300,
          height: 270,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#E5E1D8",
          shadow: "0 12px 30px -8px rgba(0, 0, 0, 0.1)",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-parents-info" || item.id === "p4") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-parents-info",
          title: "Hôn phối hai họ cân đối",
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
      } else if (item.id === "p-arch-portrait" || item.id === "p1-arch") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-arch-portrait",
          title: "Khung ảnh đôi vòm cong hoàng gia",
          content: (draft as any)?.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80",
          x: pos?.x ?? 55,
          y: pos?.y ?? 190,
          width: 280,
          height: 340,
          borderRadius: 140,
          borderWidth: 3,
          borderColor: "#BE944E",
          shadow: "0 14px 35px -10px rgba(0, 0, 0, 0.15)",
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-groom-bride-duo") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-groom-bride-duo",
          title: "Khối chân dung Chú rể & Cô dâu",
          content: "duo-portrait",
          x: pos?.x ?? 35,
          y: pos?.y ?? 220,
          width: 320,
          height: 230,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-timeline-flow" || item.id === "p3") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-timeline-flow",
          title: "Lịch trình tiệc cưới chi tiết",
          content: "timeline",
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
      } else if (item.id === "p-banking-qr") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-banking-qr",
          title: "Hộp mừng cưới & Mã QR",
          content: "banking-qr",
          x: pos?.x ?? 45,
          y: pos?.y ?? 230,
          width: 300,
          height: 260,
          backgroundColor: "#FFFFFF",
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#E5E1D8",
          shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
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
      } else if (item.id === "p-carnation-bouquet") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-carnation-bouquet",
          title: "Cành cẩm chướng nơ đỏ",
          content: "carnation",
          x: pos?.x ?? 25,
          y: pos?.y ?? 210,
          width: 90,
          height: 135,
          zIndex: maxZ + 2,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-wax-seal") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-wax-seal",
          title: "Con dấu sáp hồng niêm phong",
          content: "wax-seal",
          x: pos?.x ?? 160,
          y: pos?.y ?? 380,
          width: 60,
          height: 60,
          zIndex: maxZ + 2,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-mini-bouquet") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-mini-bouquet",
          title: "Bó hoa cưới mini pastel",
          content: "mini-bouquet",
          x: pos?.x ?? 250,
          y: pos?.y ?? 420,
          width: 75,
          height: 95,
          zIndex: maxZ + 2,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-gold-divider") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-gold-divider",
          title: "Thanh chỉ vàng kim loại",
          content: "gold-divider",
          x: pos?.x ?? 55,
          y: pos?.y ?? 260,
          width: 280,
          height: 14,
          zIndex: maxZ + 2,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-song-hy-red") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-song-hy-red",
          title: "Thiệp Song Hỷ Đỏ Á Đông",
          content: "song-hy-red",
          x: pos?.x ?? 40,
          y: pos?.y ?? 200,
          width: 310,
          height: 290,
          borderRadius: 20,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-dress-code") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-dress-code",
          title: "Quy định trang phục (Dress Code)",
          content: "dress-code",
          x: pos?.x ?? 45,
          y: pos?.y ?? 240,
          width: 300,
          height: 160,
          borderRadius: 16,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-venue-map") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-venue-map",
          title: "Địa điểm tiệc cưới & Chỉ đường",
          content: "venue-map",
          x: pos?.x ?? 35,
          y: pos?.y ?? 220,
          width: 320,
          height: 170,
          borderRadius: 18,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-wedding-menu") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-wedding-menu",
          title: "Thực đơn bàn tiệc cưới cao cấp",
          content: "wedding-menu",
          x: pos?.x ?? 40,
          y: pos?.y ?? 210,
          width: 310,
          height: 260,
          borderRadius: 18,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-wedding-countdown") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-wedding-countdown",
          title: "Đếm ngược khoảnh khắc cưới",
          content: "countdown",
          x: pos?.x ?? 45,
          y: pos?.y ?? 230,
          width: 300,
          height: 160,
          borderRadius: 16,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-rings-vow") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-rings-vow",
          title: "Cặp nhẫn cưới & Lời hẹn ước",
          content: "rings-vow",
          x: pos?.x ?? 45,
          y: pos?.y ?? 240,
          width: 300,
          height: 170,
          borderRadius: 18,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-thank-you-note") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-thank-you-note",
          title: "Thư cảm ơn quan khách trân quý",
          content: "thank-you",
          x: pos?.x ?? 45,
          y: pos?.y ?? 250,
          width: 300,
          height: 160,
          borderRadius: 16,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-polaroid-washi") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-polaroid-washi",
          title: "Polaroid dán băng Washi Vintage",
          content: "polaroid-washi",
          imageUrl: (draft as any)?.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
          x: pos?.x ?? 60,
          y: pos?.y ?? 210,
          width: 270,
          height: 290,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else if (item.id === "p-le-thanh-hon") {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: "p-le-thanh-hon",
          title: "Lễ Thành Hôn & Lễ Vu Quy",
          content: "le-thanh-hon",
          x: pos?.x ?? 40,
          y: pos?.y ?? 220,
          width: 310,
          height: 180,
          borderRadius: 16,
          zIndex: maxZ + 1,
          isLocked: false,
          opacity: 1,
        };
      } else {
        newEl = {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "preset",
          presetId: item.id || "p5",
          title: item.title || "Khối Lời Ngỏ Cổ Điển",
          content: "quote",
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


      let neededHeight: number | undefined;
      if (pos?.y === undefined) {
        const def = getDefaultPosition(newEl.width, newEl.height, pos);
        newEl.x = pos?.x ?? def.x;
        newEl.y = def.y;
        neededHeight = def.neededHeight;
      }

      const updated = [...canvasElements, newEl];
      persistElementsAndHeight(updated, neededHeight);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElementsAndHeight, getDefaultPosition]
  );

  const addImageElement = useCallback(
    (url: string, caption?: string, pos?: { x?: number; y?: number }) => {
      const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
      const w = 260;
      const h = 200;
      const { x: defaultX, y: defaultY, neededHeight } = getDefaultPosition(w, h, pos);
      const newEl: CanvasElement = {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "image",
        imageUrl: url,
        content: url,
        title: caption || "Ảnh mới",
        x: defaultX,
        y: defaultY,
        width: w,
        height: h,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        shadow: "0 10px 20px -5px rgba(0,0,0,0.15)",
        zIndex: maxZ + 1,
        isLocked: false,
        opacity: 1,
      };
      const updated = [...canvasElements, newEl];
      persistElementsAndHeight(updated, neededHeight);
      setSelectedElementId(newEl.id);
      setSelectedElementType("canvas-element");
      setSelectedField(null);
      return newEl.id;
    },
    [canvasElements, persistElementsAndHeight, getDefaultPosition]
  );

  const addWidgetElement = useCallback((widgetType: WidgetType, pos?: { x?: number; y?: number }) => {
    const maxZ = canvasElements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1);
    let w = 300;
    let h = 160;
    let initialConfig: Record<string, unknown> = { showTitle: true };

    if (widgetType === "procession-route") {
      w = 340;
      h = 490;
      initialConfig = {
        brideTitle: "LỄ VU QUY",
        brideDate: "Vào Thứ Hai - 09h00 | 21.02.2026",
        brideLunarDate: "Tức Ngày 16 tháng 12 năm Ất Tỵ",
        brideVenue: "tại tư gia nhà gái",
        brideMapUrl: "https://maps.google.com",
        groomTitle: "LỄ THÀNH HÔN",
        groomDate: "Vào Thứ Hai - 14h00 | 21.02.2026",
        groomLunarDate: "Tức Ngày 16 tháng 12 năm Ất Tỵ",
        groomVenue: "TẠI TƯ GIA NHÀ TRAI",
        groomMapUrl: "https://maps.google.com",
      };
    } else if (widgetType === "lace-vow-card") {
      w = 320;
      h = 430;
      initialConfig = {
        title: "Mạnh Đức & Lan Nhi",
        eventDate: "29.12.2026",
        vowQuote: "Một lời hẹn ước\nMột hành trình mới\nMột mái nhà chung\nMột đời bên nhau",
        frameStyle: "royal",
      };
    } else if (widgetType === "swan-ceremony") {
      w = 340;
      h = 500;
      initialConfig = {
        title: "LỄ THÀNH HÔN",
        description: "BUỔI TIỆC CHUNG VUI ĐƯỢC TỔ CHỨC VÀO LÚC 17:30, CHỦ NHẬT",
        eventDate: "29.12.2026",
        groomLunarDate: "Tức ngày 18 tháng 10 năm Bính Ngọ",
        groomVenue: "TẠI TƯ GIA NHÀ TRAI",
        groomAddress: "174 Đường Trần Văn Kiểu, Phường 10, TP Hồ Chí Minh",
        groomParents: "Ông. Lê Văn Anh - Bà. Lê Thị Nhung",
        brideParents: "Ông. Vũ Văn Tài - Bà. Trần Thị Hoà",
        url: "https://maps.google.com",
        buttonLabel: "XEM CHỈ ĐƯỜNG",
      };
    }

    const { x: defaultX, y: defaultY, neededHeight } = getDefaultPosition(w, h, pos);
    const newEl: CanvasElement = {
      id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "widget",
      widgetType,
      widgetConfig: initialConfig,
      content: widgetType,
      x: defaultX,
      y: defaultY,
      width: w,
      height: h,
      zIndex: maxZ + 1,
      isLocked: false,
      opacity: 1,
    };
    persistElementsAndHeight([...canvasElements, newEl], neededHeight);
    setSelectedElementId(newEl.id);
    setSelectedElementType("canvas-element");
    setSelectedField(null);
    return newEl.id;
  }, [canvasElements, persistElementsAndHeight, getDefaultPosition]);

  const updateCanvasElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      const updated = canvasElements.map((el) => (el.id === id ? { ...el, ...patch } : el));
      persistElements(updated);

      // Đồng bộ 2 chiều: nếu element có binding (groom.fullName, bride.fullName, greeting), cập nhật luôn vào draft.categoryData
      if (patch.content !== undefined) {
        const cat = (draft as any)?.categoryData || {};
        const bindings = cat.canvasDocument?.bindings || {};
        const bindingKey = bindings[id] || (id === "scene-groom" ? "groom.fullName" : id === "scene-bride" ? "bride.fullName" : undefined);
        if (bindingKey) {
          try {
            const next = applyDraftPatch(draft, `categoryData.${bindingKey}`, patch.content);
            onDraftChange(next);
          } catch {}
        }
      }

      // Phương án C: Gửi PATCH trực tiếp cho từng element (< 1KB), auto-save realtime
      const cardId = (draft as any)?.id;
      if (cardId && typeof cardId === "string") {
        const existingTimer = patchDebounceTimersRef.current.get(id);
        if (existingTimer) clearTimeout(existingTimer);

        const newTimer = setTimeout(() => {
          patchDebounceTimersRef.current.delete(id);
          const payload: Record<string, unknown> = {};
          if (patch.customData !== undefined) payload.customData = patch.customData;
          if (patch.content !== undefined) payload.content = patch.content;
          if (patch.imageUrl !== undefined) payload.imageUrl = patch.imageUrl;
          if (patch.title !== undefined) payload.title = patch.title;
          if (patch.x !== undefined) payload.x = patch.x;
          if (patch.y !== undefined) payload.y = patch.y;
          if (patch.width !== undefined) payload.width = patch.width;
          if (patch.height !== undefined) payload.height = patch.height;
          if (patch.fontSize !== undefined) payload.fontSize = patch.fontSize;
          if (patch.fontFamily !== undefined) payload.fontFamily = patch.fontFamily;
          if (patch.color !== undefined) payload.color = patch.color;

          if (Object.keys(payload).length > 0) {
            ApiClient.patchCardElement(cardId, id, payload).catch((err) => {
              console.warn("Element auto-save error:", err);
            });
          }
        }, 600);

        patchDebounceTimersRef.current.set(id, newTimer);
      }
    },
    [canvasElements, persistElements, draft, onDraftChange]
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
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draft]);
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

  const updatePhotos = useCallback(
    (newPhotos: Array<{ id: string; url: string; caption?: string; isCover?: boolean }>) => {
      try {
        let next = applyDraftPatch(draft, "photos", newPhotos);
        if ((draft as any)?.categoryData) {
          next = applyDraftPatch(next, "categoryData.photos", newPhotos);
        }
        const cover = newPhotos.find((p) => p.isCover)?.url || newPhotos[0]?.url;
        if (cover) {
          next = applyDraftPatch(next, "coverPhotoUrl", cover);
          if ((draft as any)?.categoryData) {
            next = applyDraftPatch(next, "categoryData.coverPhotoUrl", cover);
          }
        }
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draft]);
        setFuture([]);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi cập nhật photos:", err);
      }
    },
    [draft, onDraftChange]
  );

  const addPhotoToGallery = useCallback(
    (photo: { id?: string; url: string; caption?: string; isCover?: boolean }) => {
      const currentPhotos = ((draft as any).photos as Array<{ id: string; url: string; caption?: string; isCover?: boolean }>) || [];
      const newPhoto = {
        id: photo.id || `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: photo.url,
        caption: photo.caption || "",
        isCover: photo.isCover ?? currentPhotos.length === 0,
      };
      updatePhotos([...currentPhotos, newPhoto]);
    },
    [draft, updatePhotos]
  );

  const removePhotoFromGallery = useCallback(
    (photoIdOrUrl: string) => {
      const currentPhotos = ((draft as any).photos as Array<{ id: string; url: string; caption?: string; isCover?: boolean }>) || [];
      const filtered = currentPhotos.filter((p) => p.id !== photoIdOrUrl && p.url !== photoIdOrUrl);
      updatePhotos(filtered);
    },
    [draft, updatePhotos]
  );

  const setCoverPhoto = useCallback(
    (url: string) => {
      try {
        let next = applyDraftPatch(draft, "categoryData.coverPhotoUrl", url);
        next = applyDraftPatch(next, "coverPhotoUrl", url);
        const currentPhotos = ((draft as any).photos as Array<{ id: string; url: string; caption?: string; isCover?: boolean }>) || [];
        if (currentPhotos.length > 0) {
          const updated = currentPhotos.map((p) => ({
            ...p,
            isCover: p.url === url,
          }));
          next = applyDraftPatch(next, "photos", updated);
          if ((draft as any)?.categoryData) {
            next = applyDraftPatch(next, "categoryData.photos", updated);
          }
        }
        if (!interactionDraftRef.current) setPast((items) => [...items.slice(-19), draft]);
        setFuture([]);
        onDraftChange(next);
        setDirtyTick((t) => t + 1);
        setSaveState("dirty");
      } catch (err) {
        console.error("Lỗi đặt ảnh bìa:", err);
      }
    },
    [draft, onDraftChange]
  );

  const replaceSelectedImage = useCallback(
    (imageUrl: string): boolean => {
      if (selectedCanvasElement) {
        const patch: Partial<CanvasElement> = {
          imageUrl,
          content: selectedCanvasElement.type === "image" ? imageUrl : selectedCanvasElement.content,
        };
        const custom = { ...(selectedCanvasElement.customData || {}) };
        const pid = selectedCanvasElement.presetId;
        if (pid === "p-about-bride") {
          custom.brideAvatar = imageUrl;
          custom.bridePhoto = imageUrl;
        } else if (pid === "p-about-groom") {
          custom.groomAvatar = imageUrl;
          custom.groomPhoto = imageUrl;
        } else if (pid === "p-sweet-marry-me") {
          custom.photoTop = imageUrl;
        } else if (pid === "p-calendar-heart-photo" || pid === "p-forest-polaroid-calendar") {
          custom.photoUrl = imageUrl;
        } else if (pid === "p-gallery-editorial-stack" || pid === "p-forest-gallery-grid") {
          const list = Array.isArray(custom.photos) ? [...custom.photos] : [];
          if (list.length >= 3) list[0] = imageUrl;
          else list.push(imageUrl);
          custom.photos = list;
        } else if (pid === "p-dual-gift-qr") {
          custom.brideAvatar = imageUrl;
        } else {
          custom.photoUrl = imageUrl;
        }
        patch.customData = custom;
        updateCanvasElement(selectedCanvasElement.id, patch);
        return true;
      }
      if (selectedField && selectedField.type === "image") {
        updateFieldValue(selectedField, imageUrl);
        return true;
      }
      const coverPhotoField = fields.find((f) => f.id === "cover-photo");
      if (coverPhotoField) {
        updateFieldValue(coverPhotoField, imageUrl);
        return true;
      }
      setCoverPhoto(imageUrl);
      return true;
    },
    [selectedCanvasElement, updateCanvasElement, selectedField, updateFieldValue, fields, setCoverPhoto]
  );

  const undo = useCallback(() => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [draft, ...items]);
    onDraftChange(previous);
    setDirtyTick((tick) => tick + 1);
    setSaveState("dirty");
  }, [past, draft, onDraftChange]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setPast((items) => [...items, draft]);
    onDraftChange(next);
    setDirtyTick((tick) => tick + 1);
    setSaveState("dirty");
  }, [future, draft, onDraftChange]);

  const beginInteraction = useCallback(() => {
    if (!interactionDraftRef.current) interactionDraftRef.current = draftRef.current;
  }, []);
  const endInteraction = useCallback(() => {
    const initial = interactionDraftRef.current;
    interactionDraftRef.current = null;
    if (initial && initial !== draftRef.current) {
      setPast((items) => [...items.slice(-19), initial]);
      setFuture([]);
    }
  }, []);

  const triggerSave = useCallback(() => {
    if (!saveRef.current) return Promise.resolve();
    const revision = dirtyTickRef.current;
    const snapshot = draftRef.current;
    const save = saveQueueRef.current.catch(() => undefined).then(async () => {
      setSaveState("saving");
      await saveRef.current?.(snapshot);
      setSaveState(dirtyTickRef.current === revision ? "saved" : "dirty");
    }).catch((error: unknown) => {
      setSaveState("dirty");
      throw error;
    });
    saveQueueRef.current = save;
    return save;
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (!dirtyTick || !onSave) return;
    const timer = window.setTimeout(() => {
      void triggerSave().catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [dirtyTick, Boolean(onSave), triggerSave]);

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
    hasUnsavedChanges: saveState !== "saved",
    triggerSave,
    past,
    future,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    beginInteraction,
    endInteraction,
    canvasElements,
    canvasHeight,
    setCanvasHeight,
    fitCanvasToContent,
    registerViewportCenterGetter,
    getViewportCenter,
    selectedCanvasElement,
    fieldOffsets,
    fieldScales,
    canvasBackgroundColor,
    setCanvasBackgroundColor,
    canvasBackgroundPattern,
    setCanvasBackgroundPattern,
    canvasFallingEffect,
    setCanvasFallingEffect,
    addTextElement,
    addStickerElement,
    addStockElement,
    addShapeElement,
    addPresetElement,
    addImageElement,
    addWidgetElement,
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
    updatePhotos,
    addPhotoToGallery,
    removePhotoFromGallery,
    setCoverPhoto,
    replaceSelectedImage,
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
