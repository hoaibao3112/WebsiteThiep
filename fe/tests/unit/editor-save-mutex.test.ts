import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit test for Save Mutex Lock, Stale Closure Prevention & Slug Protection
 * Replicating the concurrency patterns implemented in edit/page.tsx
 */

interface SaveArgs {
  payload: {
    slug: string;
    expectedUpdatedAt?: string | null;
  };
  forceOverwrite: boolean;
}

class SaveMutexManager {
  isSavingInFlight = false;
  pendingSaveArgs: SaveArgs | null = null;
  expectedUpdatedAt: string | null = null;
  saveHistory: SaveArgs[] = [];
  mockServerSave: (args: SaveArgs) => Promise<{ success: boolean; updatedAt?: string; code?: string }>;

  constructor(mockServerSave: (args: SaveArgs) => Promise<{ success: boolean; updatedAt?: string; code?: string }>) {
    this.mockServerSave = mockServerSave;
  }

  async persist(args: SaveArgs): Promise<void> {
    if (this.isSavingInFlight) {
      this.pendingSaveArgs = args;
      return;
    }

    this.isSavingInFlight = true;
    try {
      // Use latest expectedUpdatedAt if not force overwrite
      const activePayload = {
        ...args.payload,
        expectedUpdatedAt: args.forceOverwrite ? undefined : (this.expectedUpdatedAt || args.payload.expectedUpdatedAt),
      };

      const finalArgs: SaveArgs = { ...args, payload: activePayload };
      this.saveHistory.push(finalArgs);

      const res = await this.mockServerSave(finalArgs);
      if (res.success && res.updatedAt) {
        this.expectedUpdatedAt = res.updatedAt;
      }
    } finally {
      this.isSavingInFlight = false;
      if (this.pendingSaveArgs) {
        const nextArgs = this.pendingSaveArgs;
        this.pendingSaveArgs = null;
        await this.persist(nextArgs);
      }
    }
  }
}

describe("Editor Save Mutex Lock & Concurrency Manager", () => {
  it("tuần tự hóa (serialize) các request lưu: request sau đợi request trước hoàn tất", async () => {
    let finishFirstSave!: (val: any) => void;
    const firstSavePromise = new Promise((resolve) => {
      finishFirstSave = resolve;
    });

    const mockSave = vi.fn().mockImplementationOnce(async () => {
      await firstSavePromise;
      return { success: true, updatedAt: "2026-10-22T10:00:01.000Z" };
    }).mockImplementationOnce(async () => {
      return { success: true, updatedAt: "2026-10-22T10:00:02.000Z" };
    });

    const manager = new SaveMutexManager(mockSave);
    manager.expectedUpdatedAt = "2026-10-22T10:00:00.000Z";

    // Request 1 bắn trước (đang in-flight)
    const p1 = manager.persist({
      payload: { slug: "thiep-1", expectedUpdatedAt: manager.expectedUpdatedAt },
      forceOverwrite: false,
    });
    expect(manager.isSavingInFlight).toBe(true);

    // Request 2 (auto-save hoặc gõ phím tiếp theo) bắn khi Request 1 chưa xong
    const p2 = manager.persist({
      payload: { slug: "thiep-1-edited", expectedUpdatedAt: "2026-10-22T10:00:00.000Z" },
      forceOverwrite: false,
    });

    // Chỉ có 1 cuộc gọi server đang chạy
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(manager.pendingSaveArgs).toBeDefined();

    // Kết thúc Request 1
    finishFirstSave(null);
    await Promise.all([p1, p2]);

    // Request 2 đã tự động chạy ngay sau đó với timestamp mới nhất từ Request 1
    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(manager.saveHistory[1].payload.expectedUpdatedAt).toBe("2026-10-22T10:00:01.000Z");
    expect(manager.expectedUpdatedAt).toBe("2026-10-22T10:00:02.000Z");
    expect(manager.isSavingInFlight).toBe(false);
  });

  it("giải phóng mutex lock trong khối finally ngay cả khi lưu thất bại", async () => {
    const mockSave = vi.fn().mockRejectedValueOnce(new Error("Mất kết nối mạng"));
    const manager = new SaveMutexManager(mockSave);

    await expect(manager.persist({
      payload: { slug: "thiep-loi" },
      forceOverwrite: false,
    })).rejects.toThrow("Mất kết nối mạng");

    expect(manager.isSavingInFlight).toBe(false);
  });
});

describe("Slug Locking for Active Cards", () => {
  function computeSaveSlug(cardStatus: "DRAFT" | "ACTIVE", originalSlug: string, inputSlug: string): string {
    const activeLockedSlug = cardStatus === "ACTIVE" && originalSlug ? originalSlug : inputSlug;
    return (
      activeLockedSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "") || "thiep-default"
    );
  }

  it("giữ nguyên slug gốc đối với thiệp đã ACTIVE kể cả khi người dùng nhập slug khác", () => {
    const result = computeSaveSlug("ACTIVE", "thiep-cuoi-long-ngoc", "doi-slug-tuy-tien");
    expect(result).toBe("thiep-cuoi-long-ngoc");
  });

  it("cho phép đổi và chuẩn hóa slug đối với thiệp DRAFT", () => {
    const result = computeSaveSlug("DRAFT", "slug-cu", "  Thiệp Cưới Mới 2026!  ");
    expect(result).toBe("thi-p-c-i-m-i-2026");
  });
});
