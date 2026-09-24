import React, { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorProvider, useEditor } from "@/components/editor/EditorContext";

function Harness({ onSave }: { onSave?: (draft: Record<string, unknown>) => Promise<void> }) {
  const [draft, setDraft] = useState<Record<string, unknown>>({ categoryData: { cardCategory: "WEDDING", canvasElements: [], showWishButton: false } });
  return <EditorProvider templateSlug="wedding-minimalist-gold" draft={draft} onDraftChange={setDraft} onSave={onSave}>
    <Probe />
  </EditorProvider>;
}

let editor: ReturnType<typeof useEditor<Record<string, unknown>>>;
function Probe() {
  editor = useEditor();
  return <div data-testid="state">{JSON.stringify({ elements: editor.canvasElements, height: editor.canvasHeight, wish: editor.showWishButton, saveState: editor.saveState })}</div>;
}

describe("canvas persistence", () => {
  it("keeps an intentionally empty canvas and persists widget toggles and height", () => {
    render(<Harness />);
    expect(editor.canvasElements).toEqual([]);
    expect(editor.showWishButton).toBe(false);
    act(() => editor.setCanvasHeight(1500));
    expect(editor.canvasHeight).toBe(1500);
    expect((editor.draft.categoryData as Record<string, unknown>).canvasHeight).toBe(1500);
    act(() => editor.setShowWishButton(true));
    expect((editor.draft.categoryData as Record<string, unknown>).showWishButton).toBe(true);
  });

  it("coalesces an interaction into one undo step and marks undo dirty", () => {
    render(<Harness />);
    act(() => editor.beginInteraction());
    act(() => editor.addTextElement({ text: "One" }));
    act(() => editor.updateCanvasElement(editor.canvasElements[0].id, { x: 123 }));
    act(() => editor.endInteraction());
    expect(editor.past).toHaveLength(1);
    act(() => editor.undo());
    expect(editor.canvasElements).toEqual([]);
    expect(editor.saveState).toBe("dirty");
  });

  it("keeps a newer draft dirty when an older save resolves", async () => {
    vi.useFakeTimers();
    let finish!: () => void;
    const onSave = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<Harness onSave={onSave} />);
    act(() => editor.addTextElement({ text: "First" }));
    await act(async () => { await vi.advanceTimersByTimeAsync(800); });
    act(() => editor.addTextElement({ text: "Second" }));
    await act(async () => { finish(); });
    expect(editor.saveState).toBe("dirty");
    vi.useRealTimers();
  });
});
