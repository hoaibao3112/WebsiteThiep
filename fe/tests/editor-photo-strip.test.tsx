import React, { useState } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorProvider, useEditor } from "@/components/editor/EditorContext";
import { CanvasElement } from "@/types/canvas.types";

function PhotoStripTestHarness() {
  const initialElements: CanvasElement[] = [
    {
      id: "elem-img-1",
      type: "image",
      content: "https://example.com/initial.jpg",
      imageUrl: "https://example.com/initial.jpg",
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      zIndex: 1,
    },
  ];

  const [draft, setDraft] = useState<Record<string, unknown>>({
    categoryData: {
      cardCategory: "WEDDING",
      coverPhotoUrl: "https://example.com/initial-cover.jpg",
      canvasDocument: {
        elements: initialElements,
      },
    },
    photos: [
      { id: "p1", url: "https://example.com/p1.jpg", caption: "Photo 1", isCover: false },
      { id: "p2", url: "https://example.com/p2.jpg", caption: "Photo 2", isCover: false },
    ],
  });

  return (
    <EditorProvider
      templateSlug="wedding-sweet-editorial-romance"
      draft={draft}
      onDraftChange={setDraft}
    >
      <Probe />
    </EditorProvider>
  );
}

let editor: ReturnType<typeof useEditor<Record<string, unknown>>>;
function Probe() {
  editor = useEditor();
  return null;
}

describe("BottomPhotoStrip & Quick Photo Operations", () => {
  it("replaces image on selected canvas element and supports undo", () => {
    render(<PhotoStripTestHarness />);

    // Select the canvas image element
    act(() => {
      editor.selectElement("elem-img-1", "canvas-element");
    });
    expect(editor.selectedCanvasElement?.id).toBe("elem-img-1");
    expect(editor.selectedCanvasElement?.imageUrl).toBe("https://example.com/initial.jpg");

    // Replace selected image with photo from strip
    act(() => {
      editor.replaceSelectedImage("https://example.com/p2.jpg");
    });

    const updated = editor.canvasElements.find((e) => e.id === "elem-img-1");
    expect(updated?.imageUrl).toBe("https://example.com/p2.jpg");
    expect(editor.saveState).toBe("dirty");

    // Test undo restores previous image
    act(() => {
      editor.undo();
    });
    const restored = editor.canvasElements.find((e) => e.id === "elem-img-1");
    expect(restored?.imageUrl).toBe("https://example.com/initial.jpg");
  });

  it("adds, removes, and sets cover photo in gallery", () => {
    render(<PhotoStripTestHarness />);

    // Add new photo
    act(() => {
      editor.addPhotoToGallery({
        id: "p3",
        url: "https://example.com/p3.jpg",
        caption: "Photo 3",
      });
    });

    const photos = (editor.draft as any).photos;
    expect(photos).toHaveLength(3);
    expect(photos[2].url).toBe("https://example.com/p3.jpg");

    // Set as cover photo
    act(() => {
      editor.setCoverPhoto("https://example.com/p3.jpg");
    });

    const coverUrl = (editor.draft as any).categoryData?.coverPhotoUrl;
    expect(coverUrl).toBe("https://example.com/p3.jpg");
    const updatedPhotos = (editor.draft as any).photos;
    expect(updatedPhotos.find((p: any) => p.id === "p3")?.isCover).toBe(true);

    // Remove photo
    act(() => {
      editor.removePhotoFromGallery("p1");
    });
    const remainingPhotos = (editor.draft as any).photos;
    expect(remainingPhotos.find((p: any) => p.id === "p1")).toBeUndefined();
    expect(remainingPhotos).toHaveLength(2);
  });
});
