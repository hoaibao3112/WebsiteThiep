import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CanvasElementContent } from "@/components/card/CanvasElementContent";
import { canvasElementStyle, safeCanvasLink } from "@/lib/editor/canvas-presentation";

afterEach(cleanup);

describe("canvas presentation shared by editor and public card", () => {
  it("uses the actual RSVP action and custom widget title", () => {
    const openRsvp = vi.fn();
    render(<CanvasElementContent element={{ id: "rsvp", type: "widget", widgetType: "rsvp", widgetConfig: { title: "Hẹn gặp bạn", buttonLabel: "Tôi tham dự" }, content: "", x: 0, y: 0, width: 300, height: 120, zIndex: 1 }} onRsvp={openRsvp} />);
    expect(screen.getByRole("heading", { name: "Hẹn gặp bạn" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tôi tham dự" }));
    expect(openRsvp).toHaveBeenCalledOnce();
  });
  it("renders whitespace and actual wedding names in presets", () => {
    render(<CanvasElementContent element={{ id: "names", type: "preset", presetId: "p-wedding-typography", content: "", x: 0, y: 0, width: 300, height: 120, zIndex: 1 }} draft={{ categoryData: { groom: { fullName: "An" }, bride: { fullName: "Bình" } } }} />);
    expect(screen.getByRole("heading", { name: /An.*Bình/ })).toBeInTheDocument();
  });

  it("keeps zero opacity/layer and typography in shared style", () => {
    const style = canvasElementStyle({ id: "text", type: "text", content: "A\nB", x: 12, y: 34, width: 220, height: 80, zIndex: 0, opacity: 0, padding: 9, lineHeight: 1.5, letterSpacing: 2, rotation: 30, flipX: true });
    expect(style).toMatchObject({ left: 12, top: 34, zIndex: 0, opacity: 0, padding: 9, lineHeight: 1.5, letterSpacing: 2, whiteSpace: "pre-wrap", transform: "rotate(30deg) scaleX(-1)" });
  });

  it("rejects executable and protocol-relative links", () => {
    expect(safeCanvasLink("javascript:alert(1)")).toBeUndefined();
    expect(safeCanvasLink("//untrusted.example")).toBeUndefined();
    expect(safeCanvasLink("https://example.com/location")).toBe("https://example.com/location");
    expect(safeCanvasLink("tel:+84901234567")).toBe("tel:+84901234567");
  });
});
