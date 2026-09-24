"use client";

import React from "react";
import type { CardDetail, WeddingDataPayload } from "@/types/card.types";
import type { CanvasElement } from "@/types/canvas.types";
import type { WeddingSceneDocument } from "@/types/wedding-scene.types";
import { canvasElementStyle, readRecord } from "@/lib/editor/canvas-presentation";
import { CanvasElementContent } from "@/components/card/CanvasElementContent";

interface WeddingSceneRendererProps {
  card: CardDetail;
  data: WeddingDataPayload;
  scene: WeddingSceneDocument;
  guestName?: string;
  onOpenRsvp: () => void;
  onOpenGift: () => void;
  onSelectPhoto: (url: string) => void;
  isPreview?: boolean;
}

export function WeddingSceneRenderer({ card, data, scene, guestName, onOpenRsvp, onOpenGift, onSelectPhoto, isPreview = false }: WeddingSceneRendererProps) {
  const renderData = { ...card, categoryData: { ...data, events: card.events, photos: card.photos } };
  const elements = scene.elements.map((element) => {
    const binding = scene.bindings[element.id];
    if (!binding) return element;
    const value = readBinding(renderData.categoryData, binding);
    if (typeof value !== "string" || !value) return element;
    if (element.type !== "widget") return { ...element, content: value };
    const configKey = binding.endsWith(".eventDate") ? "eventDate" : binding.endsWith(".mapUrl") ? "url" : binding.endsWith(".eventName") ? "title" : "description";
    return { ...element, widgetConfig: { ...element.widgetConfig, [configKey]: value } };
  }).sort((left, right) => (left.zIndex ?? 1) - (right.zIndex ?? 1));
  const cssVars = {
    "--scene-primary": scene.tokens.primary,
    "--scene-accent": scene.tokens.accent,
    "--scene-surface": scene.tokens.surface,
    "--scene-text": scene.tokens.text,
    "--scene-secondary": scene.tokens.secondary,
  } as React.CSSProperties;
  return (
    <div className="w-full overflow-x-hidden" data-scene-renderer data-scene-variant={scene.templateSlug}>
      <div
        className="relative mx-auto overflow-hidden text-[var(--scene-text)]"
        style={{
          ...cssVars,
          width: `min(100%, ${scene.width}px)`,
          height: scene.height,
          backgroundColor: scene.background.color,
          backgroundImage: scene.background.imageUrl ? `url(${scene.background.imageUrl})` : undefined,
          backgroundSize: "cover",
        }}
      >
        {scene.background.pattern && scene.background.pattern !== "none" && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(var(--scene-accent) 1px, transparent 1px)", backgroundSize: scene.background.pattern === "flower-large" ? "24px 24px" : "14px 14px" }} />
        )}
        {elements.map((element) => {
          const owner = scene.sections.find((section) => section.elementIds.includes(element.id));
          const isVisible = !owner || owner.visible;
          if (!isVisible) return null;
          const canvasElement = element as CanvasElement;
          return (
            <div
              key={element.id}
              data-scene-element={element.id}
              style={canvasElementStyle(canvasElement)}
              className="flex items-center justify-center"
              onClick={element.type === "image" && (element.imageUrl || element.content) ? () => onSelectPhoto(element.imageUrl || element.content) : undefined}
            >
              <CanvasElementContent
                element={canvasElement}
                draft={renderData}
                guestName={guestName}
                onRsvp={onOpenRsvp}
                onGift={onOpenGift}
              />
            </div>
          );
        })}
      </div>
      {isPreview && <span className="sr-only">Bản xem trước thiệp cưới</span>}
    </div>
  );
}

function readBinding(data: unknown, path: string): unknown {
  const parts = path.match(/[^.[\]]+/g) ?? [];
  return parts.reduce<unknown>((current, part) => {
    if (Array.isArray(current) && /^\d+$/.test(part)) return current[Number(part)];
    const record = readRecord(current);
    return record ? record[part] : undefined;
  }, data);
}
