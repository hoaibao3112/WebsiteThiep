"use client";

import React from "react";

export type OrnamentType =
  | "peony-purple"       // Mẫu đơn tím hoàng kim (ảnh mẫu chungdoi)
  | "heritage-crimson"   // Hoa sen & triện cung đình Á Đông đỏ vàng
  | "modern-gold"        // Khung chỉ vàng tinh tế tối giản
  | "sweet-pink"         // Hoa mẫu đơn đào & hồng phấn ngọt ngào
  | "marsala-wine"       // Hoa hồng đỏ rượu vang Marsala
  | "forest-botanical"   // Khuynh diệp & thảo mộc rừng xanh
  | "pure-lotus"         // Sen trắng ngọc thanh khiết
  | "cinematic"          // Khung viền phim điện ảnh sang trọng
  | "alpine-lake"        // Cành thông tuyết & hồ nước ngọc bích
  | "imperial-dragon"    // Long Phụng gấm hoàng gia
  | "nha-co-hy"          // Cửa cổ hoa cúc & Song Hỷ truyền thống
  | "sage-garden";       // Vườn hồng trắng & lá xô thơm Sage

interface EnvelopeOrnamentProps {
  type: OrnamentType;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

export const EnvelopeOrnament: React.FC<EnvelopeOrnamentProps> = ({
  type,
  position,
  className = "",
}) => {
  const getTransform = () => {
    switch (position) {
      case "top-left":
        return "";
      case "top-right":
        return "scale-x-[-1]";
      case "bottom-left":
        return "scale-y-[-1]";
      case "bottom-right":
        return "scale-[-1]";
    }
  };

  // 1. HOA MẪU ĐƠN TÍM HOÀNG KIM (KHỚP VỚI ẢNH MẪU CHUNGDOI)
  if (type === "peony-purple") {
    return (
      <div className={`pointer-events-none select-none ${getTransform()} ${className}`}>
        <svg viewBox="0 0 160 160" width="160" height="160" fill="none" className="w-full h-full drop-shadow-md">
          {/* Cành lá hoàng kim vàng đồng */}
          <path
            d="M20 140 C 25 100, 45 60, 95 35"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M50 85 C 40 70, 45 50, 60 45 C 65 58, 55 78, 50 85 Z"
            fill="url(#goldGradient)"
            opacity="0.85"
          />
          <path
            d="M75 60 C 70 42, 80 30, 95 32 C 95 45, 85 55, 75 60 Z"
            fill="url(#goldGradient)"
            opacity="0.85"
          />
          <path
            d="M32 110 C 18 105, 15 90, 25 82 C 34 88, 35 102, 32 110 Z"
            fill="url(#goldGradient)"
            opacity="0.75"
          />

          {/* Cụm nụ hoa nhỏ */}
          <circle cx="108" cy="28" r="5" fill="#E6CA65" />
          <circle cx="118" cy="22" r="4" fill="#C5A059" />

          {/* Bông hoa mẫu đơn lớn màu tím cẩm tú & phấn tím hoàng gia */}
          {/* Cánh ngoài tím thẫm */}
          <ellipse cx="48" cy="48" rx="38" ry="36" fill="url(#purpleOuter)" opacity="0.95" />
          <path
            d="M 18 52 C 12 30, 32 15, 55 18 C 72 20, 85 36, 80 58 C 75 78, 48 84, 30 76 C 18 70, 16 62, 18 52 Z"
            fill="url(#purpleOuter)"
          />

          {/* Lớp cánh giữa tím phớt hồng mẫu đơn */}
          <path
            d="M 28 46 C 24 32, 38 24, 52 26 C 66 28, 74 38, 70 52 C 66 64, 48 68, 36 62 C 28 58, 27 52, 28 46 Z"
            fill="url(#purpleMid)"
          />

          {/* Lớp cánh trong & gợn sóng xếp tầng tinh tế */}
          <circle cx="48" cy="46" r="18" fill="url(#purpleInner)" />
          <path
            d="M 40 42 C 40 36, 52 34, 56 40 C 60 46, 52 54, 44 50 C 40 48, 38 45, 40 42 Z"
            fill="#F3E8FF"
            opacity="0.9"
          />
          <circle cx="48" cy="45" r="5" fill="#FEF08A" />

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8C6B2D" />
              <stop offset="50%" stopColor="#E6CA65" />
              <stop offset="100%" stopColor="#C5A059" />
            </linearGradient>
            <radialGradient id="purpleOuter" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="65%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#2E1065" />
            </radialGradient>
            <radialGradient id="purpleMid" cx="45%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="60%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#6B21A8" />
            </radialGradient>
            <radialGradient id="purpleInner" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="70%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7E22CE" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 2. HOA SEN & TRIỆN Á ĐÔNG CUNG ĐÌNH ĐỎ HOÀNG KIM (Heritage / Imperial / Nhà Có Hỷ)
  if (
    type === "heritage-crimson" ||
    type === "imperial-dragon" ||
    type === "nha-co-hy"
  ) {
    return (
      <div className={`pointer-events-none select-none ${getTransform()} ${className}`}>
        <svg viewBox="0 0 140 140" width="140" height="140" fill="none" className="w-full h-full drop-shadow-md">
          {/* Đường diềm góc cổ điển kiểu gấm hoàng cung */}
          <path
            d="M 12 12 L 80 12 C 85 12, 88 16, 86 21 L 82 25 L 30 25 C 27 25, 25 27, 25 30 L 25 82 L 21 86 C 16 88, 12 85, 12 80 Z"
            fill="url(#heritageGold)"
          />
          <path
            d="M 8 8 L 96 8 M 8 8 L 8 96"
            stroke="url(#heritageGold)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Bông Sen Vàng Cung Đình */}
          <path
            d="M 42 70 C 25 55, 30 38, 42 28 C 54 38, 59 55, 42 70 Z"
            fill="url(#heritageGold)"
          />
          <path
            d="M 28 66 C 15 56, 18 42, 32 38 C 38 48, 38 58, 28 66 Z"
            fill="url(#heritageGoldLight)"
            opacity="0.8"
          />
          <path
            d="M 56 66 C 70 56, 66 42, 52 38 C 46 48, 46 58, 56 66 Z"
            fill="url(#heritageGoldLight)"
            opacity="0.8"
          />

          <defs>
            <linearGradient id="heritageGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9E8A2" />
              <stop offset="45%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8C6819" />
            </linearGradient>
            <linearGradient id="heritageGoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D0" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 3. THẢO MỘC RỪNG & VƯỜN SAGE (Botanical / Sage Garden / Alpine Lake)
  if (
    type === "forest-botanical" ||
    type === "sage-garden" ||
    type === "alpine-lake"
  ) {
    return (
      <div className={`pointer-events-none select-none ${getTransform()} ${className}`}>
        <svg viewBox="0 0 150 150" width="150" height="150" fill="none" className="w-full h-full drop-shadow-sm">
          {/* Cành khuynh diệp mềm mại uốn lượn */}
          <path
            d="M 15 135 Q 25 75 85 30 T 135 15"
            stroke="url(#botanicalGold)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Lá khuynh diệp tròn màu xanh sage viền vàng */}
          <ellipse cx="40" cy="85" rx="14" ry="9" transform="rotate(-35 40 85)" fill="#5E7865" opacity="0.85" stroke="#E6CA65" strokeWidth="1" />
          <ellipse cx="62" cy="62" rx="13" ry="8" transform="rotate(-40 62 62)" fill="#789680" opacity="0.9" stroke="#E6CA65" strokeWidth="1" />
          <ellipse cx="90" cy="40" rx="11" ry="7" transform="rotate(-45 90 40)" fill="#A4BFA8" opacity="0.9" stroke="#E6CA65" strokeWidth="1" />
          <ellipse cx="118" cy="24" rx="8" ry="5" transform="rotate(-50 118 24)" fill="#C2D6C5" opacity="0.95" stroke="#E6CA65" strokeWidth="1" />

          {/* Hoa chuông / hoa hồng trắng trang nhã */}
          <circle cx="36" cy="105" r="7" fill="#FFFFFF" stroke="#E6CA65" strokeWidth="1" />
          <circle cx="36" cy="105" r="2.5" fill="#E6CA65" />

          <defs>
            <linearGradient id="botanicalGold" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7E6028" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#F5E4A8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 4. HOA HỒNG MARSALA & SWEET PINK (Romance / Wine Marsala)
  if (type === "sweet-pink" || type === "marsala-wine") {
    const isMarsala = type === "marsala-wine";
    const primaryFill = isMarsala ? "url(#marsalaRed)" : "url(#sweetPink)";
    const midFill = isMarsala ? "#8B1E2D" : "#F472B6";

    return (
      <div className={`pointer-events-none select-none ${getTransform()} ${className}`}>
        <svg viewBox="0 0 150 150" width="150" height="150" fill="none" className="w-full h-full drop-shadow-md">
          {/* Cành vàng & nụ hồng */}
          <path d="M 20 130 Q 30 70 90 35" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
          <path d="M 45 80 Q 35 65 50 60 Q 55 75 45 80 Z" fill="#D4AF37" opacity="0.75" />
          <path d="M 70 55 Q 65 40 80 42 Q 80 55 70 55 Z" fill="#D4AF37" opacity="0.75" />

          {/* Bông hồng nhiều lớp */}
          <circle cx="48" cy="48" r="32" fill={primaryFill} />
          <path
            d="M 32 38 C 30 26, 48 20, 60 28 C 68 36, 66 52, 52 56 C 38 60, 32 50, 32 38 Z"
            fill={midFill}
            opacity="0.9"
          />
          <circle cx="48" cy="46" r="12" fill={isMarsala ? "#58111A" : "#FBCFE8"} />
          <circle cx="48" cy="46" r="4" fill="#FEF08A" />

          <defs>
            <radialGradient id="marsalaRed" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#A82835" />
              <stop offset="70%" stopColor="#721B24" />
              <stop offset="100%" stopColor="#450A10" />
            </radialGradient>
            <radialGradient id="sweetPink" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="65%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#BE185D" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 5. HIỆN ĐẠI TỐI GIẢN / CINEMATIC / HOA SEN TRẮNG (Modern Editorial / Cinematic / Pure Lotus)
  return (
    <div className={`pointer-events-none select-none ${getTransform()} ${className}`}>
      <svg viewBox="0 0 120 120" width="120" height="120" fill="none" className="w-full h-full drop-shadow-sm">
        {/* Viền đôi hình học vàng kim tối giản */}
        <path d="M 12 12 L 68 12 M 12 12 L 12 68" stroke="url(#minimalGold)" strokeWidth="2" strokeLinecap="round" />
        <path d="M 18 18 L 52 18 M 18 18 L 18 52" stroke="url(#minimalGold)" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="12" cy="12" r="3" fill="#E6CA65" />
        <circle cx="68" cy="12" r="2" fill="#C5A059" />
        <circle cx="12" cy="68" r="2" fill="#C5A059" />

        <defs>
          <linearGradient id="minimalGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6E7B0" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8C6819" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
