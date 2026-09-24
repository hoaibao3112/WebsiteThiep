export interface StockItem {
  id: string;
  title: string;
  cat: "frames" | "dividers" | "wedding" | "character" | "flower" | "hy" | "heart" | "vietnam";
  svgType?: "frame" | "divider" | "custom";
  icon?: string;
  svgContent?: string;
  color?: string;
  width: number;
  height: number;
  isWide?: boolean;
}

export const STOCK_CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "wedding", label: "Yếu tố đám cưới" },
  { id: "character", label: "Nhân vật" },
  { id: "flower", label: "Hoa cưới" },
  { id: "hy", label: "Chữ hỷ" },
  { id: "heart", label: "Trái tim" },
  { id: "frames", label: "Khung viền" },
  { id: "dividers", label: "Đường phân cách" },
  { id: "vietnam", label: "Văn hóa Việt" },
] as const;

export type StockCategoryId = (typeof STOCK_CATEGORIES)[number]["id"];

export const STOCK_CATALOG: StockItem[] = [
  // ── 1. KHUNG VIỀN (FRAMES) ──
  {
    id: "fr-scalloped-cloud",
    title: "Khung uốn lượn hoàng gia",
    cat: "frames",
    svgType: "frame",
    color: "#E11D48",
    width: 260,
    height: 180,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 260 180" class="w-full h-full" fill="none" stroke="currentColor">
        <path d="M 40 20 C 50 10, 80 15, 130 15 C 180 15, 210 10, 220 20 C 235 35, 230 60, 245 70 C 255 78, 255 102, 245 110 C 230 120, 235 145, 220 160 C 210 170, 180 165, 130 165 C 80 165, 50 170, 40 160 C 25 145, 30 120, 15 110 C 5 102, 5 78, 15 70 C 30 60, 25 35, 40 20 Z" stroke-width="2.5" />
        <path d="M 44 26 C 53 17, 81 21, 130 21 C 179 21, 207 17, 216 26 C 229 39, 224 62, 238 72 C 247 79, 247 101, 238 108 C 224 118, 229 141, 216 154 C 207 163, 179 159, 130 159 C 81 159, 53 163, 44 154 C 31 141, 36 118, 22 108 C 13 101, 13 79, 22 72 C 36 62, 31 39, 44 26 Z" stroke-width="1" stroke-dasharray="3,2" opacity="0.85" />
      </svg>
    `,
  },
  {
    id: "fr-classic-rect",
    title: "Khung chỉ góc hoa văn",
    cat: "frames",
    svgType: "frame",
    color: "#E11D48",
    width: 220,
    height: 300,
    svgContent: `
      <svg viewBox="0 0 220 300" class="w-full h-full" fill="none" stroke="currentColor">
        <rect x="15" y="15" width="190" height="270" rx="2" stroke-width="2" />
        <rect x="20" y="20" width="180" height="260" rx="1" stroke-width="0.8" opacity="0.7" />
        <!-- Top Left Corner -->
        <path d="M 10 32 L 32 10 M 15 42 L 42 15 M 24 24 A 6 6 0 1 1 24 25" stroke-width="1.5" />
        <!-- Top Right Corner -->
        <path d="M 210 32 L 188 10 M 205 42 L 178 15 M 196 24 A 6 6 0 1 0 196 25" stroke-width="1.5" />
        <!-- Bottom Left Corner -->
        <path d="M 10 268 L 32 290 M 15 258 L 42 285 M 24 276 A 6 6 0 1 0 24 275" stroke-width="1.5" />
        <!-- Bottom Right Corner -->
        <path d="M 210 268 L 188 290 M 205 258 L 178 285 M 196 276 A 6 6 0 1 1 196 275" stroke-width="1.5" />
      </svg>
    `,
  },
  {
    id: "fr-ornate-corner",
    title: "Khung viền vương giả",
    cat: "frames",
    svgType: "frame",
    color: "#BE944E",
    width: 220,
    height: 300,
    svgContent: `
      <svg viewBox="0 0 220 300" class="w-full h-full" fill="none" stroke="currentColor">
        <rect x="18" y="18" width="184" height="264" stroke-width="1.8" />
        <!-- Corner flourishes -->
        <g stroke-width="1.5">
          <path d="M 14 36 C 22 36, 26 26, 36 26 C 26 26, 26 14, 26 14" />
          <path d="M 206 36 C 198 36, 194 26, 184 26 C 194 26, 194 14, 194 14" />
          <path d="M 14 264 C 22 264, 26 274, 36 274 C 26 274, 26 286, 26 286" />
          <path d="M 206 264 C 198 264, 194 274, 184 274 C 194 274, 194 286, 194 286" />
          <circle cx="26" cy="26" r="3" fill="currentColor" />
          <circle cx="194" cy="26" r="3" fill="currentColor" />
          <circle cx="26" cy="274" r="3" fill="currentColor" />
          <circle cx="194" cy="274" r="3" fill="currentColor" />
        </g>
      </svg>
    `,
  },
  {
    id: "fr-double-border",
    title: "Khung viền song tuyến thanh lịch",
    cat: "frames",
    svgType: "frame",
    color: "#E11D48",
    width: 220,
    height: 300,
    svgContent: `
      <svg viewBox="0 0 220 300" class="w-full h-full" fill="none" stroke="currentColor">
        <rect x="16" y="16" width="188" height="268" rx="4" stroke-width="1.2" />
        <rect x="22" y="22" width="176" height="256" rx="2" stroke-width="2.2" />
        <line x1="16" y1="36" x2="36" y2="16" stroke-width="1.5" />
        <line x1="204" y1="36" x2="184" y2="16" stroke-width="1.5" />
        <line x1="16" y1="264" x2="36" y2="284" stroke-width="1.5" />
        <line x1="204" y1="264" x2="184" y2="284" stroke-width="1.5" />
      </svg>
    `,
  },
  {
    id: "fr-oval-cartouche",
    title: "Khung vòm cổ điển Baroque",
    cat: "frames",
    svgType: "frame",
    color: "#E11D48",
    width: 260,
    height: 180,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 260 180" class="w-full h-full" fill="none" stroke="currentColor">
        <path d="M 50 35 C 70 20, 190 20, 210 35 C 235 50, 245 80, 245 90 C 245 100, 235 130, 210 145 C 190 160, 70 160, 50 145 C 25 130, 15 100, 15 90 C 15 80, 25 50, 50 35 Z" stroke-width="2.2" />
        <circle cx="130" cy="22" r="3.5" fill="currentColor" />
        <circle cx="130" cy="158" r="3.5" fill="currentColor" />
        <circle cx="18" cy="90" r="3.5" fill="currentColor" />
        <circle cx="242" cy="90" r="3.5" fill="currentColor" />
        <path d="M 60 45 C 75 35, 185 35, 200 45 C 220 60, 230 85, 230 90 C 230 95, 220 120, 200 135 C 185 145, 75 145, 60 135 C 40 120, 30 95, 30 90 C 30 85, 40 60, 60 45 Z" stroke-width="1" stroke-dasharray="4,2" opacity="0.8" />
      </svg>
    `,
  },
  {
    id: "fr-certificate-royal",
    title: "Khung trang trí thiệp cưới",
    cat: "frames",
    svgType: "frame",
    color: "#BE944E",
    width: 220,
    height: 300,
    svgContent: `
      <svg viewBox="0 0 220 300" class="w-full h-full" fill="none" stroke="currentColor">
        <rect x="14" y="14" width="192" height="272" stroke-width="2" />
        <rect x="20" y="20" width="180" height="260" stroke-width="1" stroke-dasharray="2,2" />
        <path d="M 14 14 L 30 14 L 30 30 L 14 30 Z" fill="currentColor" opacity="0.2" />
        <path d="M 206 14 L 190 14 L 190 30 L 206 30 Z" fill="currentColor" opacity="0.2" />
        <path d="M 14 286 L 30 286 L 30 270 L 14 270 Z" fill="currentColor" opacity="0.2" />
        <path d="M 206 286 L 190 286 L 190 270 L 206 270 Z" fill="currentColor" opacity="0.2" />
        <circle cx="110" cy="14" r="4" fill="currentColor" />
        <circle cx="110" cy="286" r="4" fill="currentColor" />
      </svg>
    `,
  },

  // ── 2. ĐƯỜNG PHÂN CÁCH (DIVIDERS) ──
  {
    id: "div-diamond-center",
    title: "Phân cách quả trám cổ điển",
    cat: "dividers",
    svgType: "divider",
    color: "#78716C",
    width: 280,
    height: 24,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 280 24" class="w-full h-full" fill="none" stroke="currentColor">
        <line x1="20" y1="12" x2="115" y2="12" stroke-width="1.2" stroke-linecap="round" />
        <line x1="165" y1="12" x2="260" y2="12" stroke-width="1.2" stroke-linecap="round" />
        <polygon points="140,6 148,12 140,18 132,12" fill="currentColor" />
        <circle cx="122" cy="12" r="2" fill="currentColor" />
        <circle cx="158" cy="12" r="2" fill="currentColor" />
      </svg>
    `,
  },
  {
    id: "div-scroll-flourish",
    title: "Phân cách uốn lượn phong cách Âu",
    cat: "dividers",
    svgType: "divider",
    color: "#78716C",
    width: 280,
    height: 24,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 280 24" class="w-full h-full" fill="none" stroke="currentColor">
        <line x1="15" y1="12" x2="100" y2="12" stroke-width="1" />
        <line x1="180" y1="12" x2="265" y2="12" stroke-width="1" />
        <path d="M 100 12 C 110 5, 120 18, 130 12 C 135 9, 137 6, 140 12 C 143 6, 145 9, 150 12 C 160 18, 170 5, 180 12" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="140" cy="12" r="2" fill="currentColor" />
      </svg>
    `,
  },
  {
    id: "div-minimal-dots",
    title: "Phân cách chấm thanh lịch",
    cat: "dividers",
    svgType: "divider",
    color: "#78716C",
    width: 280,
    height: 24,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 280 24" class="w-full h-full" fill="currentColor">
        <circle cx="132" cy="12" r="1.5" opacity="0.6" />
        <circle cx="140" cy="12" r="2.5" />
        <circle cx="148" cy="12" r="1.5" opacity="0.6" />
      </svg>
    `,
  },
  {
    id: "div-dotted-line",
    title: "Đường kẻ chỉ chấm bi",
    cat: "dividers",
    svgType: "divider",
    color: "#78716C",
    width: 280,
    height: 24,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 280 24" class="w-full h-full" fill="none" stroke="currentColor">
        <line x1="20" y1="12" x2="260" y2="12" stroke-width="1.5" stroke-dasharray="2,5" stroke-linecap="round" />
      </svg>
    `,
  },
  {
    id: "div-filigree-asian",
    title: "Đường phân cách hoa văn Á Đông",
    cat: "dividers",
    svgType: "divider",
    color: "#BE944E",
    width: 280,
    height: 24,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 280 24" class="w-full h-full" fill="none" stroke="currentColor">
        <line x1="25" y1="12" x2="95" y2="12" stroke-width="1" />
        <line x1="185" y1="12" x2="255" y2="12" stroke-width="1" />
        <path d="M 95 12 Q 105 4, 115 12 Q 125 20, 140 12 Q 155 20, 165 12 Q 175 4, 185 12" stroke-width="1.4" />
        <circle cx="140" cy="12" r="3" fill="currentColor" />
        <circle cx="115" cy="12" r="1.5" fill="currentColor" />
        <circle cx="165" cy="12" r="1.5" fill="currentColor" />
      </svg>
    `,
  },
  {
    id: "div-calligraphy-wave",
    title: "Đường lượn sóng thư pháp",
    cat: "dividers",
    svgType: "divider",
    color: "#78716C",
    width: 280,
    height: 24,
    isWide: true,
    svgContent: `
      <svg viewBox="0 0 280 24" class="w-full h-full" fill="none" stroke="currentColor">
        <path d="M 30 12 C 70 8, 90 16, 140 12 C 190 8, 210 16, 250 12" stroke-width="1.2" stroke-linecap="round" />
      </svg>
    `,
  },

  // ── 3. YẾU TỐ ĐÁM CƯỚI ──
  { id: "w1", title: "Chân nến cổ điển", cat: "wedding", icon: "🕯️", width: 140, height: 160 },
  { id: "w2", title: "Bách Niên Hảo Hợp", cat: "wedding", icon: "百年好合", color: "#8B1E0F", isWide: true, width: 160, height: 70 },
  { id: "w3", title: "Giỏ hoa pastel", cat: "wedding", icon: "🧺", width: 100, height: 100 },
  { id: "w4", title: "Cành hoa cưới", cat: "wedding", icon: "💐", width: 110, height: 110 },
  { id: "w5", title: "Lời yêu thương", cat: "wedding", icon: "喜欢你", color: "#D946EF", isWide: true, width: 150, height: 70 },
  { id: "w6", title: "Ruy băng hồng", cat: "wedding", icon: "🎀", width: 100, height: 100 },
  { id: "w7", title: "Cặp nhẫn cưới kim cương", cat: "wedding", icon: "💍", width: 110, height: 110 },
  { id: "w8", title: "Ly rượu mừng", cat: "wedding", icon: "🥂", width: 100, height: 100 },
  { id: "w9", title: "Bồ câu trắng", cat: "wedding", icon: "🕊️", width: 110, height: 110 },
  { id: "w10", title: "Chuông cưới vàng", cat: "wedding", icon: "🔔", width: 100, height: 100 },

  // ── 4. VĂN HÓA VIỆT ──
  { id: "vn1", title: "Cột cờ Hà Nội", cat: "vietnam", icon: "🏛️", width: 100, height: 100 },
  { id: "vn2", title: "Ngày hội 30/4", cat: "vietnam", icon: "30/4", color: "#D4AF37", isWide: true, width: 150, height: 70 },
  { id: "vn3", title: "Họa tiết Trống Đồng", cat: "vietnam", icon: "🪙", color: "#BE944E", width: 120, height: 120 },
  { id: "vn4", title: "Cờ đỏ sao vàng", cat: "vietnam", icon: "🇻🇳", width: 100, height: 100 },
  { id: "vn5", title: "Nón lá bài thơ", cat: "vietnam", icon: "👒", width: 110, height: 110 },
  { id: "vn6", title: "Hoa sen hồng", cat: "vietnam", icon: "🪷", width: 110, height: 110 },
  { id: "vn7", title: "Chim Lạc hoàng cung", cat: "vietnam", icon: "🦅", color: "#BE944E", width: 120, height: 120 },
  { id: "vn8", title: "Đường kẻ gấm Á Đông", cat: "vietnam", icon: "❖ ❖ ❖", color: "#BE944E", isWide: true, width: 160, height: 70 },

  // ── 5. NHÂN VẬT ──
  { id: "c1", title: "Chú rể áo vest", cat: "character", icon: "🤵", width: 100, height: 120 },
  { id: "c2", title: "Cô dâu váy cưới", cat: "character", icon: "👰", width: 100, height: 120 },
  { id: "c3", title: "Chú rể Áo Dài đỏ", cat: "character", icon: "🤴", width: 100, height: 120 },
  { id: "c4", title: "Cô dâu Khăn Đóng đỏ", cat: "character", icon: "👸", width: 100, height: 120 },
  { id: "c5", title: "Cặp đôi tay trong tay", cat: "character", icon: "👩‍❤️‍👨", width: 120, height: 120 },
  { id: "c6", title: "Chụp ảnh cưới", cat: "character", icon: "📸", width: 100, height: 100 },
  { id: "c7", title: "Khiêu vũ ngày cưới", cat: "character", icon: "💃🕺", width: 120, height: 120 },
  { id: "c8", title: "Thần tình yêu Cupid", cat: "character", icon: "👼", width: 100, height: 100 },

  // ── 6. HOA CƯỚI ──
  { id: "f1", title: "Bó hoa hồng đỏ", cat: "flower", icon: "🌹", width: 100, height: 100 },
  { id: "f2", title: "Hoa Tulip thanh lịch", cat: "flower", icon: "🌷", width: 100, height: 100 },
  { id: "f3", title: "Cành lá bạch đàn", cat: "flower", icon: "🌿", width: 100, height: 100 },
  { id: "f4", title: "Hoa anh đào hồng", cat: "flower", icon: "🌸", width: 100, height: 100 },
  { id: "f5", title: "Hoa hướng dương", cat: "flower", icon: "🌻", width: 100, height: 100 },
  { id: "f6", title: "Hoa mẫu đơn quý phái", cat: "flower", icon: "🌺", width: 100, height: 100 },

  // ── 7. CHỮ HỶ ──
  { id: "h1", title: "Chữ Hỷ Song Hỷ Đỏ", cat: "hy", icon: "囍", color: "#DC2626", width: 110, height: 110 },
  { id: "h2", title: "Chữ Hỷ Mạ Vàng", cat: "hy", icon: "囍", color: "#D4AF37", width: 110, height: 110 },
  { id: "h3", title: "Chữ Hỷ Tròn Nghệ Thuật", cat: "hy", icon: "💮囍💮", color: "#DC2626", isWide: true, width: 160, height: 70 },
  { id: "h4", title: "Bách Niên Giai Lão", cat: "hy", icon: "百年偕老", color: "#991B1B", isWide: true, width: 160, height: 70 },
  { id: "h5", title: "Loan Phụng Hòa Minh", cat: "hy", icon: "鸞鳳和鳴", color: "#991B1B", isWide: true, width: 160, height: 70 },
  { id: "h6", title: "Hỷ Lồng Hoa Mẫu Đơn", cat: "hy", icon: "🌺囍🌺", color: "#DC2626", isWide: true, width: 160, height: 70 },

  // ── 8. TRÁI TIM ──
  { id: "ht1", title: "Trái tim pha lê 3D", cat: "heart", icon: "💖", width: 100, height: 100 },
  { id: "ht2", title: "Trái tim đôi", cat: "heart", icon: "💕", width: 110, height: 110 },
  { id: "ht3", title: "Mũi tên tình yêu", cat: "heart", icon: "💘", width: 110, height: 110 },
  { id: "ht4", title: "Bong bóng trái tim", cat: "heart", icon: "🎈", width: 100, height: 100 },
  { id: "ht5", title: "Hộp quà trái tim", cat: "heart", icon: "💝", width: 100, height: 100 },
  { id: "ht6", title: "Trái tim ánh sao", cat: "heart", icon: "✨❤️✨", isWide: true, width: 150, height: 70 },
];
