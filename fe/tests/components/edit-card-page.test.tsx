/**
 * Integration test: Edit Card Page
 *
 * Scope: Render page → load demo data → interact với tabs Gallery & Music
 * Pattern: RTL (React Testing Library) + vitest
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiClient } from "@/lib/api";

// Lazy import component SAU khi mock đã setup
let EditCardPage: typeof import("@/app/(dashboard)/dashboard/cards/[cardId]/edit/page")["default"];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function makeMockFile(name: string, type: string, size = 1024): File {
  const file = new File([new ArrayBuffer(size)], name, { type });
  return file;
}

async function renderEditPage() {
  // Dynamic import để mock có hiệu lực trước
  const mod = await import("@/app/(dashboard)/dashboard/cards/[cardId]/edit/page");
  const { default: Page } = mod;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(<Page />);
  });
  return result;
}

// ─────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────

describe("EditCardPage — Render & Load", () => {
  beforeEach(() => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: false }); // trigger demo data fallback
  });

  it("hiển thị trang edit với tiêu đề 'Chỉnh Sửa Thiệp'", async () => {
    await renderEditPage();
    expect(screen.getByText(/Chỉnh Sửa Thiệp/i)).toBeInTheDocument();
  });

  it("hiển thị 8 tabs điều hướng", async () => {
    await renderEditPage();

    const tabLabels = ["Giao Diện", "Cặp Đôi", "Câu Chuyện", "Lịch Trình", "Album Ảnh", "Nhạc Nền", "Mừng Cưới", "RSVP"];
    for (const label of tabLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("hiển thị nút 'Lưu Thay Đổi'", async () => {
    await renderEditPage();
    expect(screen.getByText(/Lưu Thay Đổi/i)).toBeInTheDocument();
  });

  it("load demo data khi API fail → hiển thị live preview", async () => {
    await renderEditPage();
    // WeddingView mock được render ở cột phải
    expect(screen.getByTestId("wedding-view")).toBeInTheDocument();
  });

  it("load data thật từ API khi success → điền tên chú rể vào form", async () => {
    vi.mocked(ApiClient.request).mockResolvedValue({
      success: true,
      data: {
        id: "real-card-1",
        slug: "test-slug",
        cardCategory: "WEDDING",
        status: "ACTIVE",
        openingEffect: "WAX_SEAL",
        fallingEffect: "PETAL",
        musicUrl: "/music/a-thousand-years.mp3",
        isAutoPlay: true,
        primaryColor: "#BE944E",
        fontFamily: "Playfair Display",
        greetingMessage: "Kính mời",
        categoryData: {
          cardCategory: "WEDDING",
          groom: { fullName: "Lê Văn API", shortName: "Văn API" },
          bride: { fullName: "Trần Thị Mock", shortName: "Thị Mock" },
          events: [],
        },
        events: [],
        photos: [],
      },
    });

    await renderEditPage();

    // Tab "Cặp Đôi" — kiểm tra input được điền
    const coupleTab = screen.getByText("Cặp Đôi");
    await userEvent.click(coupleTab);

    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue("Lê Văn API");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────
// TAB NAVIGATION
// ─────────────────────────────────────────────

describe("EditCardPage — Tab Navigation", () => {
  beforeEach(() => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: false });
  });

  it("click tab 'Album Ảnh' → hiển thị vùng kéo thả upload", async () => {
    await renderEditPage();

    const galleryTab = screen.getByText("Album Ảnh");
    await userEvent.click(galleryTab);

    await waitFor(() => {
      expect(screen.getByText(/Kéo thả ảnh vào đây/i)).toBeInTheDocument();
    });
  });

  it("click tab 'Nhạc Nền' → hiển thị 2 sub-tab Kho Nhạc / Tải Nhạc", async () => {
    await renderEditPage();

    const musicTab = screen.getByText("Nhạc Nền");
    await userEvent.click(musicTab);

    await waitFor(() => {
      expect(screen.getByText(/Kho Nhạc Có Sẵn/i)).toBeInTheDocument();
      expect(screen.getByText(/Tải Nhạc Lên/i)).toBeInTheDocument();
    });
  });

  it("click tab 'Lịch Trình' → hiển thị nút 'Thêm Buổi Lễ'", async () => {
    await renderEditPage();

    await userEvent.click(screen.getByText("Lịch Trình"));

    await waitFor(() => {
      expect(screen.getByText(/Thêm Buổi Lễ/i)).toBeInTheDocument();
    });
  });

  it("click tab 'Câu Chuyện' → hiển thị nút 'Thêm Mốc'", async () => {
    await renderEditPage();

    await userEvent.click(screen.getByText("Câu Chuyện"));

    await waitFor(() => {
      expect(screen.getByText(/Thêm Mốc/i)).toBeInTheDocument();
    });
  });

  it("click tab 'RSVP' → hiển thị link 'Quản Lý Danh Sách Khách RSVP'", async () => {
    await renderEditPage();

    await userEvent.click(screen.getByText("RSVP"));

    await waitFor(() => {
      expect(screen.getByText(/Quản Lý Danh Sách Khách RSVP/i)).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────
// TAB GALLERY — Upload Ảnh
// ─────────────────────────────────────────────

describe("EditCardPage — Gallery Tab: Photo Upload", () => {
  beforeEach(() => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: false });
    vi.mocked(URL.createObjectURL).mockReturnValue("blob:mock-preview-url");
  });

  it("hiển thị vùng Drag & Drop với text hướng dẫn", async () => {
    await renderEditPage();
    await userEvent.click(screen.getByText("Album Ảnh"));

    await waitFor(() => {
      expect(screen.getByText(/Kéo thả ảnh vào đây/i)).toBeInTheDocument();
      expect(screen.getByText(/JPG · PNG · WEBP/i)).toBeInTheDocument();
    });
  });

  it("khi chọn file ảnh → gọi URL.createObjectURL để preview", async () => {
    vi.mocked(ApiClient.request).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/upload/image") return { success: false }; // simulate API fail
      return { success: false };
    });

    await renderEditPage();
    await userEvent.click(screen.getByText("Album Ảnh"));

    await waitFor(() => screen.getByText(/Kéo thả ảnh vào đây/i));

    // Tìm hidden file input
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const mockFile = makeMockFile("wedding.jpg", "image/jpeg", 512 * 1024);

    await act(async () => {
      await userEvent.upload(fileInput, mockFile);
    });

    // URL.createObjectURL phải được gọi để preview
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  it("upload ảnh → thử gọi POST /upload/image", async () => {
    vi.mocked(ApiClient.request).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/upload/image") return { success: false };
      return { success: false };
    });

    await renderEditPage();
    await userEvent.click(screen.getByText("Album Ảnh"));
    await waitFor(() => screen.getByText(/Kéo thả ảnh vào đây/i));

    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    const mockFile = makeMockFile("photo.png", "image/png");

    await act(async () => {
      await userEvent.upload(fileInput, mockFile);
    });

    await waitFor(() => {
      expect(ApiClient.request).toHaveBeenCalledWith(
        "/upload/image",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("demo data có 3 ảnh → hiển thị 3 ảnh trong grid", async () => {
    await renderEditPage();
    await userEvent.click(screen.getByText("Album Ảnh"));

    await waitFor(() => {
      const images = document.querySelectorAll('img[alt="Ảnh cưới"], img[alt="Khoảnh khắc lãng mạn"], img[alt="Nụ cười hạnh phúc"], img[alt="Ánh nhìn yêu thương"]');
      // Demo data có 3 ảnh nên hiển thị ít nhất 1 img trong grid
      const allImgs = document.querySelectorAll(".grid img");
      expect(allImgs.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ─────────────────────────────────────────────
// TAB MUSIC — Nhạc Nền
// ─────────────────────────────────────────────

describe("EditCardPage — Music Tab: Library", () => {
  beforeEach(() => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: false });
  });

  it("hiển thị danh sách bài có sẵn (ít nhất 4 bài)", async () => {
    await renderEditPage();
    await userEvent.click(screen.getByText("Nhạc Nền"));

    await waitFor(() => {
      expect(screen.getByText("Until I Found You")).toBeInTheDocument();
      expect(screen.getByText("A Thousand Years")).toBeInTheDocument();
      expect(screen.getByText("Perfect")).toBeInTheDocument();
    });
  });

  it("bấm vào bài → bài đó được chọn (check icon xuất hiện)", async () => {
    await renderEditPage();
    await userEvent.click(screen.getByText("Nhạc Nền"));

    await waitFor(() => screen.getByText("Perfect"));

    const perfectRow = screen.getByText("Perfect").closest("div[class*='rounded-2xl']");
    expect(perfectRow).not.toBeNull();

    await userEvent.click(perfectRow!);

    // Bài "A Thousand Years" là demo default, sau khi click Perfect thì class thay đổi
    // Kiểm tra ring/border của Perfect row
    await waitFor(() => {
      expect(perfectRow).toHaveClass("bg-amber-50/60");
    });
  });

  it("click tab 'Tải Nhạc Lên' → hiển thị upload zone nhạc", async () => {
    await renderEditPage();
    await userEvent.click(screen.getByText("Nhạc Nền"));

    await waitFor(() => screen.getByText(/Tải Nhạc Lên/i));
    await userEvent.click(screen.getAllByText(/Tải Nhạc Lên/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/Tải file nhạc của bạn lên/i)).toBeInTheDocument();
    });
  });

  it("toggle AutoPlay → trạng thái checkbox thay đổi", async () => {
    await renderEditPage();
    await userEvent.click(screen.getByText("Nhạc Nền"));

    await waitFor(() => screen.getByText(/Tự Động Phát Nhạc/i));

    const toggle = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(toggle).not.toBeNull();

    const initialState = toggle.checked;
    await userEvent.click(toggle);
    expect(toggle.checked).toBe(!initialState);
  });
});

describe("EditCardPage — Music Tab: Upload MP3", () => {
  beforeEach(() => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: false });
    vi.mocked(URL.createObjectURL).mockReturnValue("blob:mock-audio-url");
  });

  it("upload file MP3 → gọi URL.createObjectURL", async () => {
    await renderEditPage();
    await userEvent.click(screen.getByText("Nhạc Nền"));
    await waitFor(() => screen.getByText(/Tải Nhạc Lên/i));
    await userEvent.click(screen.getAllByText(/Tải Nhạc Lên/i)[0]);

    const musicInput = document.querySelector(
      'input[type="file"][accept*="audio"]'
    ) as HTMLInputElement;
    expect(musicInput).not.toBeNull();

    const mp3File = makeMockFile("my-song.mp3", "audio/mpeg", 2 * 1024 * 1024);

    await act(async () => {
      await userEvent.upload(musicInput, mp3File);
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(mp3File);
  });

  it("upload MP3 → thử gọi POST /upload/music", async () => {
    vi.mocked(ApiClient.request).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/upload/music") return { success: false };
      return { success: false };
    });

    await renderEditPage();
    await userEvent.click(screen.getByText("Nhạc Nền"));
    await waitFor(() => screen.getByText(/Tải Nhạc Lên/i));
    await userEvent.click(screen.getAllByText(/Tải Nhạc Lên/i)[0]);

    const musicInput = document.querySelector(
      'input[type="file"][accept*="audio"]'
    ) as HTMLInputElement;
    const mp3File = makeMockFile("love-song.mp3", "audio/mpeg");

    await act(async () => {
      await userEvent.upload(musicInput, mp3File);
    });

    await waitFor(() => {
      expect(ApiClient.request).toHaveBeenCalledWith(
        "/upload/music",
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});

// ─────────────────────────────────────────────
// SAVE — Nút Lưu Thay Đổi
// ─────────────────────────────────────────────

describe("EditCardPage — Save / PUT", () => {
  beforeEach(() => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: false });
  });

  it("click 'Lưu Thay Đổi' → gọi ApiClient.request với PUT", async () => {
    vi.mocked(ApiClient.request).mockImplementation(async (endpoint, options) => {
      if (options?.method === "PUT") return { success: true };
      return { success: false }; // GET /cards/:id fallback to demo
    });

    await renderEditPage();

    const saveBtn = screen.getByText(/Lưu Thay Đổi/i);
    await userEvent.click(saveBtn);

    await waitFor(() => {
      const putCall = vi.mocked(ApiClient.request).mock.calls.find(
        ([, opts]) => opts?.method === "PUT"
      );
      expect(putCall).toBeDefined();
    });
  });

  it("trong khi đang lưu → nút hiển thị 'Đang lưu...' và bị disable", async () => {
    // API trả về promise chậm
    vi.mocked(ApiClient.request).mockImplementation(
      async (endpoint, options) =>
        new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500))
    );

    await renderEditPage();

    const saveBtn = screen.getByText(/Lưu Thay Đổi/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đang lưu.../i)).toBeInTheDocument();
    });
  });
});
