import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { Wedding3DFlipbook } from "@/components/wedding/Wedding3DFlipbook";
import { downloadImage } from "@/lib/utils/download-image";
import { Album3DConfig } from "@/types/album-3d.types";

vi.mock("@/lib/audio/page-flip-sound", () => ({
  playPageFlipSound: vi.fn(),
}));

describe("Wedding3DFlipbook image download functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: Album3DConfig = {
    enabled: true,
    title: "Album Cưới Kỷ Niệm",
    coverTheme: "leather-burgundy",
    soundEnabled: false,
    pages: [
      { id: "page-1", url: "https://example.com/photo1.jpg", caption: "Ảnh 1", sortOrder: 0 },
      { id: "page-2", url: "https://example.com/photo2.jpg", caption: "Ảnh 2", sortOrder: 1 },
    ],
  };

  it("renders download buttons when navigating to inside pages", async () => {
    render(<Wedding3DFlipbook config={mockConfig} />);

    // Click Next button on bottom bar to go from front cover to spread 1
    const nextBtn = screen.getByTitle("Trang kế tiếp");
    fireEvent.click(nextBtn);

    // Mini download buttons should appear for displayed pages
    const downloadBtns = screen.getAllByTitle(/Tải ảnh/i);
    expect(downloadBtns.length).toBeGreaterThan(0);
  });

  it("triggers download helper without propagating click to flipbook spread", async () => {
    // Mock global fetch
    const mockBlob = new Blob(["fake-image"], { type: "image/jpeg" });
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
    } as any);

    // Mock URL.createObjectURL and revokeObjectURL
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();

    render(<Wedding3DFlipbook config={mockConfig} />);

    // Lật vào trang 1
    const nextBtn = screen.getByTitle("Trang kế tiếp");
    fireEvent.click(nextBtn);

    const downloadBtns = screen.getAllByTitle(/Tải ảnh/i);
    fireEvent.click(downloadBtns[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("https://example.com/photo1.jpg", expect.any(Object));
    });
  });

  it("downloadImage helper falls back gracefully on network or CORS failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("CORS blocked"));
    const appendChildSpy = vi.spyOn(document.body, "appendChild");

    const result = await downloadImage("https://example.com/blocked-cors.jpg", "test.jpg");
    expect(result).toBe(true);
    expect(appendChildSpy).toHaveBeenCalled();
  });
});
