import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DesktopMobileQrWidget } from "@/components/shared/DesktopMobileQrWidget";

describe("DesktopMobileQrWidget Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("hiển thị đúng tiêu đề và mã QR SVG khi render với URL", async () => {
    render(
      <DesktopMobileQrWidget
        url="https://cardvite.vn/thiep/thiep-cuoi-minh-ngoc"
        title="Quét mã QR để xem trên điện thoại"
      />
    );

    expect(screen.getByText("Quét mã QR để xem trên điện thoại")).toBeInTheDocument();
    expect(screen.getByText("Mobile View")).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveClass("hidden", "md:block");

    // Kiểm tra có SVG của QR code
    const svgEl = document.querySelector("svg");
    expect(svgEl).toBeInTheDocument();
  });

  it("thu nhỏ thành nút 'Xem trên điện thoại' khi bấm nút đóng X và mở lại khi bấm nút", async () => {
    render(
      <DesktopMobileQrWidget
        url="https://cardvite.vn/thiep/thiep-cuoi-minh-ngoc"
      />
    );

    const closeBtn = screen.getByLabelText("Thu nhỏ mã QR");
    expect(closeBtn).toBeInTheDocument();

    // Bấm nút thu nhỏ
    fireEvent.click(closeBtn);

    // Thẻ QR thu lại, xuất hiện nút floating "Xem trên điện thoại"
    await waitFor(() => {
      expect(screen.getByLabelText("Mở mã QR xem trên điện thoại")).toBeInTheDocument();
      expect(screen.getByText("Xem trên điện thoại")).toBeInTheDocument();
    });

    // Bấm lại để mở
    const expandBtn = screen.getByLabelText("Mở mã QR xem trên điện thoại");
    fireEvent.click(expandBtn);

    await waitFor(() => {
      expect(screen.getByText("Quét mã QR để xem trên điện thoại")).toBeInTheDocument();
    });
  });

  it("sao chép liên kết vào clipboard khi click nút 'Sao chép liên kết'", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <DesktopMobileQrWidget
        url="https://cardvite.vn/thiep/thiep-cuoi-minh-ngoc?g=VIP01"
      />
    );

    const copyBtn = screen.getByText("Sao chép liên kết");
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("https://cardvite.vn/thiep/thiep-cuoi-minh-ngoc?g=VIP01");

    await waitFor(() => {
      expect(screen.getByText("Đã chép link!")).toBeInTheDocument();
    });
  });
});
