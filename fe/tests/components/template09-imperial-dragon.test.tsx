import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Template09ImperialDragon } from "@/components/wedding/templates/Template09ImperialDragon";
import { CardDetail } from "@/types/card.types";

const MOCK_DRAGON_CARD: CardDetail = {
  id: "card-dragon-09",
  slug: "wedding-imperial-dragon-crimson",
  cardCategory: "WEDDING",
  status: "ACTIVE",
  openingEffect: "WAX_SEAL",
  fallingEffect: "PETAL",
  musicUrl: "https://example.com/royal-march.mp3",
  isAutoPlay: false,
  primaryColor: "#78171C",
  fontFamily: "Playfair Display",
  categoryData: {
    cardCategory: "WEDDING",
    groom: {
      fullName: "Nguyễn Hoàng Long",
      shortName: "Hoàng Long",
      avatarUrl: "/images/demo/templates/t09-dragon/groom.jpg",
      birthOrder: "Trưởng Nam",
      parents: {
        fatherName: "Nguyễn Văn Hùng",
        motherName: "Trần Thị Mai",
      },
    },
    bride: {
      fullName: "Lê Bảo Ngọc",
      shortName: "Bảo Ngọc",
      avatarUrl: "/images/demo/templates/t09-dragon/bride.jpg",
      birthOrder: "Út Nữ",
      parents: {
        fatherName: "Lê Quốc Bảo",
        motherName: "Phạm Thu Cúc",
      },
    },
    events: [
      {
        id: "ev-1",
        eventName: "LỄ GIA TIÊN TƯ GIA",
        eventDate: new Date("2026-11-20T08:30:00Z"),
        venueName: "Tư Gia Nhà Gái",
        address: "128 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        mapUrl: "https://maps.google.com/?q=128+Le+Loi",
      },
      {
        id: "ev-2",
        eventName: "TIỆC CƯỚI HOÀNG GIA",
        eventDate: new Date("2026-11-20T18:00:00Z"),
        venueName: "Grand Palace Imperial Ballroom",
        address: "Sảnh Hoàng Kim, Tầng 3, 142 Pasteur, Quận 1, TP. Hồ Chí Minh",
        mapUrl: "https://maps.google.com/?q=Grand+Palace",
      },
    ],
    dressCode: {
      note: "Quý khách vui lòng ưu tiên trang phục trang trọng theo bảng màu hỷ sự hoàng gia",
      colors: ["#78171C", "#D4AF37", "#F5EAD4", "#1A1A1A"],
    },
    loveStory: [
      {
        year: "2020",
        title: "Kỳ Ngộ Định Mệnh",
        description: "Lần đầu gặp gỡ giữa tiết thu Hà Nội",
        imageUrl: "/images/demo/templates/t09-dragon/story-1.jpg",
      },
      {
        year: "2023",
        title: "Lời Hẹn Ước Hoàng Hôn",
        description: "Lời cầu hôn dưới hoàng hôn Phú Quốc",
        imageUrl: "/images/demo/templates/t09-dragon/story-2.jpg",
      },
    ],
    bankAccounts: [
      {
        bankName: "Vietcombank",
        accountNumber: "9988776655",
        accountHolder: "NGUYEN HOANG LONG",
        qrCodeUrl: "/images/demo/templates/t09-dragon/qr-groom.png",
      },
      {
        bankName: "Techcombank",
        accountNumber: "1122334455",
        accountHolder: "LE BAO NGOC",
        qrCodeUrl: "/images/demo/templates/t09-dragon/qr-bride.png",
      },
    ],
  },
  events: [],
  photos: [
    { url: "/images/demo/templates/t09-dragon/gallery-1.jpg", caption: "Ảnh 1" },
    { url: "/images/demo/templates/t09-dragon/gallery-2.jpg", caption: "Ảnh 2" },
    { url: "/images/demo/templates/t09-dragon/gallery-3.jpg", caption: "Ảnh 3" },
  ],
};

describe("Template09ImperialDragon Deep Architecture & Interaction Suite", () => {
  const onOpenRsvpMock = vi.fn();
  const onOpenGiftMock = vi.fn();
  const onSelectPhotoMock = vi.fn();

  const props = {
    card: MOCK_DRAGON_CARD,
    data: MOCK_DRAGON_CARD.categoryData as any,
    primaryColor: "#78171C",
    guestName: "Gia Đình Bác Hai",
    onOpenRsvp: onOpenRsvpMock,
    onOpenGift: onOpenGiftMock,
    onSelectPhoto: onSelectPhotoMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Royal Imperial Hero with Groom & Bride names and guest name", () => {
    const { container } = render(<Template09ImperialDragon {...props} />);

    expect(container.textContent).toContain("Hoàng Long");
    expect(container.textContent).toContain("Bảo Ngọc");
    expect(container.textContent).toContain("Gia Đình Bác Hai");
    expect(container.textContent).toContain("IMPERIAL WEDDING CELEBRATION");
  });

  it("renders Groom and Bride portraits with parents information", () => {
    const { container } = render(<Template09ImperialDragon {...props} />);

    // Groom parents
    expect(container.textContent).toContain("Nguyễn Văn Hùng");
    expect(container.textContent).toContain("Trần Thị Mai");
    // Bride parents
    expect(container.textContent).toContain("Lê Quốc Bảo");
    expect(container.textContent).toContain("Phạm Thu Cúc");
  });

  it("renders two ceremonies (Lễ Gia Tiên & Tiệc Cưới)", () => {
    const { container } = render(<Template09ImperialDragon {...props} />);

    expect(container.textContent).toContain("LỄ GIA TIÊN TƯ GIA");
    expect(container.textContent).toContain("TIỆC CƯỚI HOÀNG GIA");
    expect(container.textContent).toContain("Grand Palace Imperial Ballroom");
  });

  it("renders Dress code guidelines with designated royal colors", () => {
    const { container } = render(<Template09ImperialDragon {...props} />);

    expect(container.textContent).toContain("QUY CHUẨN TRANG PHỤC HOÀNG GIA");
    expect(container.textContent).toContain("Đỏ Hoàng Triều");
    expect(container.textContent).toContain("Vàng Kim Sách");
  });

  it("renders Love Story milestones", () => {
    const { container } = render(<Template09ImperialDragon {...props} />);

    expect(container.textContent).toContain("Kỳ Ngộ Định Mệnh");
    expect(container.textContent).toContain("Lời Hẹn Ước Hoàng Hôn");
  });

  it("renders Grand Photo Gallery and responds to photo click", () => {
    render(<Template09ImperialDragon {...props} />);

    // Click on photo in gallery
    const photoButtons = screen.getAllByRole("button", { name: /Xem ảnh/i });
    expect(photoButtons.length).toBeGreaterThan(0);

    fireEvent.click(photoButtons[0]);
    expect(onSelectPhotoMock).toHaveBeenCalledWith(0);
  });

  it("renders Gift box with VietQR and triggers onOpenGift", () => {
    const { container } = render(<Template09ImperialDragon {...props} />);

    expect(container.textContent).toContain("HỘP MỪNG CƯỚI & LỜI CHÚC PHÚC");
    expect(container.textContent).toContain("NGUYEN HOANG LONG");
    expect(container.textContent).toContain("LE BAO NGOC");

    // Click quick gift button
    const giftButtons = screen.getAllByText(/Mừng Cưới/i);
    expect(giftButtons.length).toBeGreaterThan(0);
    fireEvent.click(giftButtons[0]);
    expect(onOpenGiftMock).toHaveBeenCalled();
  });

  it("triggers onOpenRsvp when clicking RSVP button in floating dock", () => {
    render(<Template09ImperialDragon {...props} />);

    const rsvpButtons = screen.getAllByText(/Xác Nhận Tham Dự/i);
    expect(rsvpButtons.length).toBeGreaterThan(0);
    fireEvent.click(rsvpButtons[0]);
    expect(onOpenRsvpMock).toHaveBeenCalled();
  });
});
