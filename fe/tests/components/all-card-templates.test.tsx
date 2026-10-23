import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import confetti from "canvas-confetti";
import { BocDoGame } from "@/components/newborn/BocDoGame";
import { Template01Heritage } from "@/components/wedding/templates";
import { ApplyProfileModal } from "@/components/card/ApplyProfileModal";
import { ApiClient } from "@/lib/api";
import type { CardDetail } from "@/types/card.types";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("BocDoGame (Trò chơi Thôi nôi / Đầy tháng)", () => {
  it("hiển thị danh sách các món đồ cho khách dự đoán nghề nghiệp tương lai", () => {
    render(<BocDoGame babyName="Bé Bo" />);
    expect(screen.getByText("Ống Nghe")).toBeInTheDocument();
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Cây Bút")).toBeInTheDocument();
    expect(screen.getByText("Thỏi Vàng")).toBeInTheDocument();
  });

  it("cho phép khách bình chọn một món đồ, tăng số lượt vote và bắn confetti", () => {
    render(<BocDoGame babyName="Bé Bo" />);
    const laptopItem = screen.getByText("Laptop").closest("button") || screen.getByText("Laptop");
    fireEvent.click(laptopItem);

    expect(confetti).toHaveBeenCalledTimes(1);

    // Bấm lại lần nữa không tăng vote (chặn vote trùng lặp)
    fireEvent.click(laptopItem);
    expect(confetti).toHaveBeenCalledTimes(1);
  });
});

describe("Wedding Template Interaction Controls", () => {
  const MOCK_CARD: CardDetail = {
    id: "test-card-id",
    slug: "long-va-ngoc",
    cardCategory: "WEDDING",
    status: "ACTIVE",
    openingEffect: "WAX_SEAL",
    fallingEffect: "PETAL",
    musicUrl: null,
    isAutoPlay: false,
    primaryColor: "#BE944E",
    fontFamily: "Playfair Display",
    bankingPrimary: {
      bankCode: "MB",
      accountNumber: "0987654321",
      accountName: "NGUYEN HOANG LONG",
    },
    categoryData: {
      cardCategory: "WEDDING",
      groom: { fullName: "Hoàng Long", shortName: "Long" },
      bride: { fullName: "Bảo Ngọc", shortName: "Ngọc" },
      events: [
        {
          id: "ev-1",
          eventName: "Tiệc Cưới",
          eventDate: new Date("2026-11-20T18:00:00Z"),
          venueName: "GEM Center",
          address: "TP. Hồ Chí Minh",
        },
      ],
    },
    events: [
      {
        id: "ev-1",
        eventName: "Tiệc Cưới",
        eventDate: new Date("2026-11-20T18:00:00Z"),
        venueName: "GEM Center",
        address: "TP. Hồ Chí Minh",
      },
    ],
    photos: [],
  };

  it("kích hoạt onOpenRsvp và onOpenGift khi bấm nút tương tác trong thiệp cưới", () => {
    const onOpenRsvp = vi.fn();
    const onOpenGift = vi.fn();

    render(
      <Template01Heritage
        card={MOCK_CARD}
        data={MOCK_CARD.categoryData as any}
        primaryColor="#BE944E"
        guestName="Khách Quý"
        onOpenRsvp={onOpenRsvp}
        onOpenGift={onOpenGift}
        onSelectPhoto={vi.fn()}
      />
    );

    expect(screen.getAllByText(/Hoàng Long/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bảo Ngọc/i).length).toBeGreaterThan(0);

    // Bấm nút Xác nhận tham dự (RSVP)
    const rsvpButton = screen.getByRole("button", { name: /Xác Nhận Tham Dự/i });
    fireEvent.click(rsvpButton);
    expect(onOpenRsvp).toHaveBeenCalledTimes(1);

    // Bấm nút Mừng cưới
    const giftButton = screen.getByRole("button", { name: /Gửi Quà Mừng/i });
    fireEvent.click(giftButton);
    expect(onOpenGift).toHaveBeenCalledTimes(1);
  });
});

describe("ApplyProfileModal", () => {
  beforeEach(() => {
    vi.spyOn(ApiClient, "request").mockResolvedValue({
      success: true,
      data: {
        groomName: "Nguyễn Hoàng Long",
        brideName: "Lê Bảo Ngọc",
        groomPhone: "0901234567",
        bridePhone: "0907654321",
        venueName: "White Palace",
      },
    });
  });

  it("hiển thị danh sách các mục có thể áp dụng từ hồ sơ cưới", async () => {
    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <ApplyProfileModal
        isOpen={true}
        onClose={onClose}
        onApply={onApply}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Áp Dụng Dữ Liệu Từ Hồ Sơ Tài Khoản/i)).toBeInTheDocument();
      expect(screen.getByText(/Thông tin Cô dâu & Chú rể/i)).toBeInTheDocument();
    });

    const applyButton = screen.getByRole("button", { name: /Áp Dụng Vào Thiệp/i });
    expect(applyButton).toBeInTheDocument();
    fireEvent.click(applyButton);

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
