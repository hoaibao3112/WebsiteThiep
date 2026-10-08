import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WeddingCoverOpening } from "@/components/wedding/opening/WeddingCoverOpening";
import { resolveCoverTheme } from "@/components/wedding/opening/cover-themes";

describe("WeddingCoverOpening & Dynamic Themes", () => {
  it("resolves cover theme with template fallback", () => {
    const theme = resolveCoverTheme("wedding-heritage-crimson-gold", undefined, {
      groom: { fullName: "Minh Khôi" },
      bride: { fullName: "Ngọc Hân" },
    });

    expect(theme.coupleNames).toBe("Minh Khôi & Ngọc Hân");
    expect(theme.ornamentType).toBe("heritage-crimson");
    expect(theme.title).toBe("THIỆP MỜI CƯỚI");
    expect(theme.buttonText).toBe("Mở thiệp");
  });

  it("prioritizes backend envelopeConfig customization when provided", () => {
    const theme = resolveCoverTheme(
      "wedding-heritage-crimson-gold",
      {
        styleId: "peony-purple",
        title: "WE ARE GETTING MARRIED",
        weddingDateText: "19.12.2026",
        buttonText: "Mở Thiệp Ngay",
        salutation: "Kính mời quý quan khách",
        sealIcon: "song-hy",
      },
      {
        groom: { fullName: "Gia Bảo" },
        bride: { fullName: "Tú Anh" },
      }
    );

    expect(theme.coupleNames).toBe("Gia Bảo & Tú Anh");
    expect(theme.title).toBe("WE ARE GETTING MARRIED");
    expect(theme.dateText).toBe("19.12.2026");
    expect(theme.buttonText).toBe("Mở Thiệp Ngay");
    expect(theme.salutation).toBe("Kính mời quý quan khách");
    expect(theme.sealIcon).toBe("song-hy");
    expect(theme.ornamentType).toBe("peony-purple");
  });

  it("renders cover screen and triggers opening callbacks on click", () => {
    const onOpenStart = vi.fn();
    const onOpened = vi.fn();

    render(
      <WeddingCoverOpening
        templateSlug="wedding-sweet-editorial-romance"
        envelopeConfig={{
          styleId: "sweet-pink",
          title: "THIỆP HỶ",
          buttonText: "Mở thiệp",
          weddingDateText: "24.12.2026",
        }}
        weddingData={{
          cardCategory: "WEDDING",
          groom: { fullName: "Gia Bảo", shortName: "Gia Bảo" },
          bride: { fullName: "Tú Anh", shortName: "Tú Anh" },
        }}
        onOpenStart={onOpenStart}
        onOpened={onOpened}
      />
    );

    expect(screen.getByText("THIỆP HỶ")).toBeInTheDocument();
    expect(screen.getByText("Gia Bảo & Tú Anh")).toBeInTheDocument();
    expect(screen.getByText("24.12.2026")).toBeInTheDocument();

    const openButton = screen.getByRole("button", { name: /Mở thiệp/i });
    expect(openButton).toBeInTheDocument();

    fireEvent.click(openButton);
    expect(onOpenStart).toHaveBeenCalled();
  });
});
