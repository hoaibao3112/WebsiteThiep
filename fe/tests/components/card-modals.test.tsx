import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateModeChoiceModal } from "@/components/card/CreateModeChoiceModal";
import { DemoTemplateActionBar } from "@/components/card/DemoTemplateActionBar";
import { EnvelopeConfigModal } from "@/components/editor/EnvelopeConfigModal";
import { Album3DManagerModal } from "@/components/card/Album3DManagerModal";
import { ApiClient } from "@/lib/api";
import type { Album3DConfig } from "@/types/card.types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));

describe("CreateModeChoiceModal", () => {
  it("hiển thị danh sách mẫu và chế độ tự thiết kế blank canvas", () => {
    const onSelectBlank = vi.fn();
    const onSelectPreset = vi.fn();
    const onClose = vi.fn();

    render(
      <CreateModeChoiceModal
        isOpen={true}
        onClose={onClose}
        onSelectBlank={onSelectBlank}
        onSelectPreset={onSelectPreset}
      />
    );

    expect(screen.getByText("Tạo Thiệp Mới Theo Ý Bạn")).toBeInTheDocument();
    expect(screen.getByText(/Chỉnh Sửa Từ 9 Mẫu Có Sẵn/i)).toBeInTheDocument();
  });

  it("gọi onSelectBlank khi người dùng chọn tab Tự Thiết Kế", () => {
    const onSelectBlank = vi.fn();
    const onSelectPreset = vi.fn();
    const onClose = vi.fn();

    render(
      <CreateModeChoiceModal
        isOpen={true}
        onClose={onClose}
        onSelectBlank={onSelectBlank}
        onSelectPreset={onSelectPreset}
      />
    );

    const blankTabBtn = screen.getByText(/Tạo Mẫu Trắng Tự Do/i);
    fireEvent.click(blankTabBtn);

    const startBlankBtn = screen.getByText(/Tạo Mẫu Trắng Ngay/i);
    fireEvent.click(startBlankBtn);

    expect(onSelectBlank).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("DemoTemplateActionBar", () => {
  it("hiển thị Floating Action Bar cho người dùng trải nghiệm mẫu", () => {
    render(<DemoTemplateActionBar templateSlug="wedding-heritage-crimson-gold" />);
    expect(screen.getByText(/Tùy Chỉnh Mẫu Này/i)).toBeInTheDocument();
    expect(screen.getByText(/Mẫu Khác/i)).toBeInTheDocument();
  });

  it("ẩn Action Bar khi người dùng nhấn nút đóng X", () => {
    render(<DemoTemplateActionBar templateSlug="wedding-heritage-crimson-gold" />);
    expect(screen.getByText(/Tùy Chỉnh Mẫu Này/i)).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/Đóng thanh điều hướng/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Tùy Chỉnh Mẫu Này/i)).not.toBeInTheDocument();
  });
});

describe("EnvelopeConfigModal", () => {
  beforeEach(() => {
    vi.spyOn(ApiClient, "getEnvelopeStyles").mockResolvedValue({
      success: true,
      data: [
        {
          id: "vintage-cream",
          name: "Kem cổ điển",
          envelopeColor: "#7B96A8",
          flapColor: "#6B8596",
          innerColor: "#EAE4DC",
          sealColor: "#C0C5C7",
          sealBorderColor: "#9FA7A9",
          monogramColor: "#4A5D6B",
          bgTexture: "vintage-linen",
          bgColor: "#EFEBE4",
          decorStyle: "blue-hydrangea",
          defaultTitle: "We're getting married!",
          defaultFont: "Aquarelle",
          defaultButtonText: "CHẠM ĐỂ MỞ",
          isVip: false,
        },
      ],
    });
  });

  it("hiển thị modal cấu hình phong bì thiệp với các preset phong cách", async () => {
    render(
      <EnvelopeConfigModal
        isOpen={true}
        onClose={vi.fn()}
        initialGroomName="Long"
        initialBrideName="Ngọc"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Cấu hình phong bì mở đầu/i)).toBeInTheDocument();
      expect(screen.getByText(/Kem cổ điển/i)).toBeInTheDocument();
    });
  });
});

describe("Album3DManagerModal", () => {
  const mockAlbumConfig: Album3DConfig = {
    enabled: true,
    albumTheme: "leather-burgundy",
    pages: [
      { id: "page-1", url: "/images/demo/1.jpg", caption: "Ảnh 1", aspectRatio: "portrait", sortOrder: 0 },
      { id: "page-2", url: "/images/demo/2.jpg", caption: "Ảnh 2", aspectRatio: "portrait", sortOrder: 1 },
    ],
    frontCover: {
      enabled: true,
      designPreset: "photo-arch-gold",
      photoUrl: "/images/demo/front.jpg",
      title: "LONG & NGỌC",
      subtitle: "OUR WEDDING",
      badgeText: "WEDDING",
      frameShape: "arch",
      theme: "leather-burgundy",
      customBgColor: "",
      customTextColor: "",
    },
    backCover: {
      enabled: true,
      designPreset: "velvet-stitched",
      title: "CẢM ƠN",
      subtitle: "THANK YOU",
      photoUrl: "",
      customBgColor: "",
      customTextColor: "",
    },
  };

  it("hiển thị modal và cho phép chuyển tab sang Cài đặt Bìa", async () => {
    const onChange = vi.fn();
    render(
      <Album3DManagerModal
        isOpen={true}
        onClose={vi.fn()}
        config={mockAlbumConfig}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/Quản Lý Album Ảnh Cưới 3D/i)).toBeInTheDocument();

    // Chuyển sang tab Cài đặt Bìa & Hiệu ứng
    const settingsTab = screen.getByText(/Cài đặt Bìa & Hiệu ứng/i);
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByText(/Trang Bìa Sau \(Màn Kết\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Bìa Trước Photobook/i)).toBeInTheDocument();
    });
  });
});
