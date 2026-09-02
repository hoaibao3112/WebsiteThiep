import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "@/lib/api";

const TEST_CARD = {
  id: "demo-card-1", slug: "quan-va-ha-wedding", cardCategory: "WEDDING" as const,
  status: "DRAFT" as const, openingEffect: "WAX_SEAL" as const,
  fallingEffect: "PETAL" as const, musicUrl: "/music/a-thousand-years.mp3",
  isAutoPlay: true, primaryColor: "#BE944E", fontFamily: "Playfair Display",
  greetingMessage: "Kính mời", template: { slug: "wedding-minimalist-gold" },
  categoryData: {
    cardCategory: "WEDDING" as const,
    groom: { fullName: "Nguyễn Văn Quân", shortName: "Quân" },
    bride: { fullName: "Trần Thu Hà", shortName: "Hà" }, events: [],
  },
  events: [], photos: [],
};

async function renderPage() {
  const Page = (await import("@/app/(dashboard)/dashboard/cards/[cardId]/edit/page")).default;
  await act(async () => { render(<Page />); });
}

describe("EditCardPage owner flow", () => {
  beforeEach(() => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: true, data: TEST_CARD });
  });

  it("loads the owner's card without demo fallback", async () => {
    await renderPage();
    expect(await screen.findByText(/Chỉnh Sửa Thiệp/i)).toBeInTheDocument();
    expect(ApiClient.request).toHaveBeenCalledWith("/cards/demo-card-1");
  });

  it("shows a recoverable error when loading fails", async () => {
    vi.mocked(ApiClient.request).mockResolvedValue({ success: false, error: "Không thể tải thiệp" });
    await renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể tải thiệp");
    expect(screen.getByRole("button", { name: /Thử lại/i })).toBeInTheDocument();
    expect(screen.queryByText(/Lưu Thay Đổi/i)).not.toBeInTheDocument();
  });

  it("saves changes through the owner endpoint", async () => {
    vi.mocked(ApiClient.request).mockImplementation(async (_endpoint, options) =>
      options?.method === "PUT" ? { success: true, data: TEST_CARD } : { success: true, data: TEST_CARD });
    await renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /Lưu Thay Đổi/i }));
    await waitFor(() => expect(ApiClient.request).toHaveBeenCalledWith(
      "/cards/demo-card-1", expect.objectContaining({ method: "PUT" })
    ));
  });

  it("does not display false success when saving fails", async () => {
    vi.mocked(ApiClient.request).mockImplementation(async (_endpoint, options) =>
      options?.method === "PUT"
        ? { success: false, error: "Mất kết nối, chưa lưu thay đổi" }
        : { success: true, data: TEST_CARD });
    await renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /Lưu Thay Đổi/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Mất kết nối");
    expect(screen.queryByText(/lưu thành công/i)).not.toBeInTheDocument();
  });
});
