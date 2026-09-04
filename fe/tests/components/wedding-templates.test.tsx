import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Template01Heritage,
  Template02ModernMagazine,
  Template03SweetRomance,
  Template04CrimsonMarsala,
  Template05ForestBotanical,
  Template06PureLotus,
  Template07Cinematic,
  Template08AlpineLake,
  Template09ImperialDragon,
} from "@/components/wedding/templates";
import { CardDetail } from "@/types/card.types";

const MOCK_CARD: CardDetail = {
  id: "test-card-id",
  slug: "test-card-slug",
  cardCategory: "WEDDING",
  status: "ACTIVE",
  openingEffect: "WAX_SEAL",
  fallingEffect: "PETAL",
  musicUrl: null,
  isAutoPlay: false,
  primaryColor: "#BE944E",
  fontFamily: "Playfair Display",
  categoryData: {
    cardCategory: "WEDDING",
    groom: {
      fullName: "Nguyễn Minh Khôi",
      shortName: "Minh Khôi",
      avatarUrl: "/images/demo/groom-avatar.png",
      birthOrder: "Trưởng nam",
      parents: {
        fatherName: "Nguyễn Văn Hùng",
        motherName: "Trần Thị Mai",
      },
    },
    bride: {
      fullName: "Lê Ngọc Hân",
      shortName: "Ngọc Hân",
      avatarUrl: "/images/demo/bride-avatar.png",
      birthOrder: "Út nữ",
      parents: {
        fatherName: "Lê Quốc Bảo",
        motherName: "Phạm Thu Cúc",
      },
    },
    events: [
      {
        id: "ev-1",
        eventName: "Lễ Vu Quy",
        eventDate: new Date("2026-11-20T18:00:00Z"),
        venueName: "Tư Gia Nhà Gái",
        address: "TP. Hồ Chí Minh",
        mapUrl: "https://maps.google.com",
      },
    ],
  },
  events: [
    {
      id: "ev-1",
      eventName: "Lễ Vu Quy",
      eventDate: new Date("2026-11-20T18:00:00Z"),
      venueName: "Tư Gia Nhà Gái",
      address: "TP. Hồ Chí Minh",
      mapUrl: "https://maps.google.com",
    },
  ],
  photos: [
    { url: "/images/demo/couple-aodai.png", caption: "Ảnh 1" },
    { url: "/images/demo/couple-cover.png", caption: "Ảnh 2" },
  ],
};

const defaultProps = {
  card: MOCK_CARD,
  data: MOCK_CARD.categoryData as any,
  primaryColor: "#BE944E",
  guestName: "Khách Quý",
  onOpenRsvp: vi.fn(),
  onOpenGift: vi.fn(),
  onSelectPhoto: vi.fn(),
};

describe("9 Wedding Templates Suite", () => {
  it("renders Template01Heritage with AuspiciousMedallions and ScrollUnfurl", () => {
    const { container } = render(<Template01Heritage {...defaultProps} />);
    expect(container.textContent).toContain("Minh Khôi");
    expect(container.textContent).toContain("Ngọc Hân");
    expect(container.textContent).toContain("LỊCH KHẮC THIÊN DUYÊN");
    expect(container.textContent).toContain("Sổ Lưu Bút Hoàng Gia");
  });

  it("renders Template02ModernMagazine with Korean editorial zigzag layout", () => {
    const { container } = render(<Template02ModernMagazine {...defaultProps} />);
    expect(container.textContent).toContain("MODERN EDITORIAL WEDDING");
    expect(container.textContent).toContain("Thiệp Mời");
    expect(container.textContent).toContain("ALBUM ẢNH CƯỚI");
  });

  it("renders Template03SweetRomance with about us and countdown", () => {
    const { container } = render(<Template03SweetRomance {...defaultProps} />);
    expect(container.textContent).toContain("THIỆP MỜI CƯỚI");
    expect(container.textContent).toContain("About us");
    expect(container.textContent).toContain("GỬI QUÀ MỪNG");
  });

  it("renders Template04CrimsonMarsala with arch design and ceremony cards", () => {
    const { container } = render(<Template04CrimsonMarsala {...defaultProps} />);
    expect(container.textContent).toContain("CRIMSON WINE MARSALA");
    expect(container.textContent).toContain("THƯ MỜI TIỆC CƯỚI");
    expect(container.textContent).toContain("THANKS");
  });

  it("renders Template05ForestBotanical with polaroid calendar and outdoor poem", () => {
    const { container } = render(<Template05ForestBotanical {...defaultProps} />);
    expect(container.textContent).toContain("We got married");
    expect(container.textContent).toContain("My Love");
    expect(container.textContent).toContain("Tháng 08.2026");
  });

  it("renders Template06PureLotus with pure lotus watercolor theme", () => {
    const { container } = render(<Template06PureLotus {...defaultProps} />);
    expect(container.textContent).toContain("THIỆP BÁO HỶ");
    expect(container.textContent).toContain("Song Hỷ");
  });

  it("renders Template07Cinematic with poetic editorial quotes and Promes center", () => {
    const { container } = render(<Template07Cinematic {...defaultProps} />);
    expect(container.textContent).toContain("Welcome to our wedding");
    expect(container.textContent).toContain("OUR LOVE STORY");
    expect(container.textContent).toContain("Promes Center");
    expect(container.textContent).toContain("You are my");
  });

  it("renders Template08AlpineLake with washi tape note and alpine poem", () => {
    const { container } = render(<Template08AlpineLake {...defaultProps} />);
    expect(container.textContent).toContain("Hi bạn thân mến");
    expect(container.textContent).toContain("My heart belongs to you");
    expect(container.textContent).toContain("Tình yêu chúng mình như suối nguồn qua bốn mùa");
  });

  it("renders Template09ImperialDragon with 3D Song Hy and Promes center", () => {
    const { container } = render(<Template09ImperialDragon {...defaultProps} />);
    expect(container.textContent).toContain("Save The Date");
    expect(container.textContent).toContain("TƯ GIA");
    expect(container.textContent).toContain("HỘP MỪNG CƯỚI");
  });
});
