export interface StockItem {
  id: string;
  title: string;
  cat: "frames" | "dividers" | "wedding" | "character" | "flower" | "hy" | "heart" | "vietnam" | "monogram";
  svgType?: "frame" | "divider" | "custom";
  icon?: string;
  imageUrl?: string;
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
  { id: "monogram", label: "Chữ nghệ thuật (Monogram)" },
] as const;

export type StockCategoryId = (typeof STOCK_CATEGORIES)[number]["id"];

export const STOCK_CATALOG: StockItem[] = [
  // ── 1. KHUNG VIỀN MỸ THUẬT CAO CẤP (AI GENERATED LACE & DECKLE) ──
  {
    id: "fr-lace-royal",
    title: "Khung ren hoàng gia cổ điển",
    cat: "frames",
    imageUrl: "/images/decor/lace-frame-royal.png",
    width: 280,
    height: 375,
  },
  {
    id: "fr-lace-gold-arch",
    title: "Khung ren vòm dát vàng & ô liu",
    cat: "frames",
    imageUrl: "/images/decor/lace-frame-gold-arch.png",
    width: 280,
    height: 375,
  },
  {
    id: "fr-scalloped-paper",
    title: "Khung giấy viền răng cưa handmade",
    cat: "frames",
    imageUrl: "/images/decor/scalloped-paper-frame.png",
    width: 280,
    height: 375,
  },

  {
    id: "fr-lotus-heritage",
    title: "Khung hoa sen trắng & chữ Hỷ dát vàng",
    cat: "frames",
    imageUrl: "/images/decor/lotus-heritage-frame.png",
    width: 280,
    height: 380,
  },
  {
    id: "fr-rose-cottage",
    title: "Khung hoa hồng & ngôi nhà hạnh phúc",
    cat: "frames",
    imageUrl: "/images/decor/rose-cottage-frame.png",
    width: 280,
    height: 380,
  },
  {
    id: "fr-baby-breath-wreath",
    title: "Vòng nguyệt quế hoa baby & cúc Tana",
    cat: "flower",
    imageUrl: "/images/decor/baby-breath-wreath.png",
    width: 280,
    height: 280,
  },

  // ── 2. BIỂU TƯỢNG ĐÁM CƯỚI SANG TRỌNG (SWANS, CAR, CAKE) ──
  {
    id: "wd-twin-swans",
    title: "Đôi thiên nga sứ trái tim",
    cat: "wedding",
    imageUrl: "/images/decor/twin-swans-heart.png",
    width: 240,
    height: 240,
  },
  {
    id: "wd-wedding-car",
    title: "Xe hoa rước dâu pastel cổ điển",
    cat: "wedding",
    imageUrl: "/images/decor/vintage-wedding-car.png",
    width: 250,
    height: 250,
  },
  {
    id: "wd-wedding-cake",
    title: "Bánh cưới 3 tầng hoa tươi hoàng gia",
    cat: "wedding",
    imageUrl: "/images/decor/wedding-cake-3tier.png",
    width: 250,
    height: 300,
  },
  {
    id: "wd-peony-red-envelope",
    title: "Phong bì hoa mẫu đơn nhung đỏ",
    cat: "wedding",
    imageUrl: "/images/decor/peony-red-envelope.png",
    width: 210,
    height: 290,
  },

  // ── 3. KHUNG VIỀN VECTOR (FRAMES) ──
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
  { id: "w11", title: "Bánh cưới 3 tầng", cat: "wedding", icon: "🎂", width: 110, height: 110 },
  { id: "w12", title: "Xe hoa rước dâu", cat: "wedding", icon: "🚗💐", isWide: true, width: 140, height: 80 },
  { id: "w13", title: "Tem sáp hoàng gia", cat: "wedding", icon: "🏷️", color: "#8B1E2D", width: 100, height: 100 },
  { id: "w14", title: "Khóa tình yêu vĩnh cửu", cat: "wedding", icon: "🔒💖", width: 100, height: 100 },
  { id: "w15", title: "Thư tình trao tay", cat: "wedding", icon: "💌", width: 100, height: 100 },
  { id: "w16", title: "Pháo hoa chúc mừng", cat: "wedding", icon: "🎉", width: 100, height: 100 },
  { id: "w17", title: "Vương miện công chúa", cat: "wedding", icon: "👑", color: "#D4AF37", width: 110, height: 110 },
  { id: "w18", title: "Giày cưới pha lê", cat: "wedding", icon: "👠", width: 100, height: 100 },

  // ── 4. VĂN HÓA VIỆT ──
  {
    id: "vn-trong-dong",
    title: "Họa tiết Trống Đồng mạ vàng",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-trong-dong-gold.png",
    width: 180,
    height: 180,
  },
  {
    id: "vn-trau-cau",
    title: "Tráp trầu cau têm cánh phượng",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-trau-cau-canh-phuong.png",
    width: 180,
    height: 190,
  },
  {
    id: "vn-non-la",
    title: "Nón lá bài thơ & hoa sen",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-non-la-lotus.png",
    width: 200,
    height: 140,
    isWide: true,
  },
  {
    id: "vn-hoa-sen",
    title: "Hoa sen hồng & lá đọng sương",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-hoa-sen-hong.png",
    width: 200,
    height: 140,
    isWide: true,
  },
  {
    id: "vn-chim-lac",
    title: "Chim Lạc mạ vàng hoàng gia",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-chim-lac-gold.png",
    width: 200,
    height: 150,
    isWide: true,
  },
  {
    id: "vn-long-den",
    title: "Lồng đèn lụa đỏ tân hôn",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-long-den-do.png",
    width: 130,
    height: 220,
  },
  {
    id: "vn-couple-lotus",
    title: "Cặp đôi áo dài che ô bên đầm sen",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-couple-lotus-umbrella.png",
    width: 170,
    height: 210,
  },
  {
    id: "vn-bamboo",
    title: "Khóm tre xanh Việt Nam",
    cat: "vietnam",
    imageUrl: "/images/decor/vn-green-bamboo.png",
    width: 180,
    height: 220,
  },
  { id: "vn8", title: "Đường kẻ gấm Á Đông", cat: "vietnam", icon: "❖ ❖ ❖", color: "#BE944E", isWide: true, width: 160, height: 70 },
  { id: "vn10", title: "Đôi uyên ương hồ điệp", cat: "vietnam", icon: "🦆💕🦆", color: "#8B1E2D", isWide: true, width: 160, height: 70 },
  { id: "vn11", title: "Mây cát tường Á Đông", cat: "vietnam", icon: "☁️✨", color: "#D4AF37", isWide: true, width: 140, height: 70 },
  { id: "vn13", title: "Chữ Phúc mạ vàng", cat: "vietnam", icon: "福", color: "#D4AF37", width: 100, height: 100 },

  // ── 5. NHÂN VẬT (3D CHIBI ĐÁM CƯỚI CAO CẤP) ──
  {
    id: "ch-couple-aodai",
    title: "Cặp đôi Áo Dài truyền thống",
    cat: "character",
    imageUrl: "/images/decor/chibi-vietnam-aodai.png",
    width: 170,
    height: 180,
    isWide: true,
  },
  {
    id: "ch-couple-proposal",
    title: "Cặp đôi trao nhẫn cầu hôn",
    cat: "character",
    imageUrl: "/images/decor/chibi-couple-proposal.png",
    width: 180,
    height: 185,
    isWide: true,
  },
  {
    id: "ch-couple-dance",
    title: "Cặp đôi khiêu vũ hạnh phúc",
    cat: "character",
    imageUrl: "/images/decor/chibi-wedding-dance.png",
    width: 170,
    height: 190,
    isWide: true,
  },
  {
    id: "ch-couple-chibi-3d",
    title: "Cặp đôi Chibi vest & váy cưới",
    cat: "character",
    imageUrl: "/images/decor/chibi-wedding-couple.png",
    width: 190,
    height: 150,
    isWide: true,
  },
  {
    id: "ch-bride-solo",
    title: "Cô dâu Chibi hoa linh lan",
    cat: "character",
    imageUrl: "/images/decor/chibi-bride-solo.png",
    width: 150,
    height: 185,
  },
  {
    id: "ch-cupid-angel",
    title: "Thần tình yêu Cupid Chibi",
    cat: "character",
    imageUrl: "/images/decor/chibi-cupid-angel.png",
    width: 150,
    height: 175,
  },

  // ── 6. HOA CƯỚI ──
  {
    id: "f1",
    title: "Bó hoa hồng đỏ & nơ lụa",
    cat: "flower",
    imageUrl: "/images/decor/rose-bridal-bouquet.png",
    width: 170,
    height: 190,
  },
  {
    id: "f2",
    title: "Hoa Tulip thanh lịch",
    cat: "flower",
    imageUrl: "/images/decor/tulip-stem-blush.png",
    width: 190,
    height: 130,
    isWide: true,
  },
  {
    id: "f3",
    title: "Cành lá bạch đàn",
    cat: "flower",
    imageUrl: "/images/decor/eucalyptus-branch.png",
    width: 200,
    height: 130,
    isWide: true,
  },
  {
    id: "f6",
    title: "Hoa mẫu đơn quý phái",
    cat: "flower",
    imageUrl: "/images/decor/peony-blush-single.png",
    width: 170,
    height: 170,
  },
  { id: "f4", title: "Hoa anh đào hồng", cat: "flower", icon: "🌸", width: 100, height: 100 },
  {
    id: "f5",
    title: "Hoa hướng dương rustic & hoa nhí",
    cat: "flower",
    imageUrl: "/images/decor/sunflower-wedding-rustic.png",
    width: 200,
    height: 140,
    isWide: true,
  },
  {
    id: "fl-white-rose",
    title: "Bó hoa hồng trắng & lá khuynh diệp",
    cat: "flower",
    imageUrl: "/images/decor/white-rose-eucalyptus-bouquet.png",
    width: 180,
    height: 190,
  },
  {
    id: "fl-bouquet-lineart",
    title: "Bó hoa cưới minh họa pastel",
    cat: "flower",
    imageUrl: "/images/decor/floral-bouquet-lineart.png",
    width: 160,
    height: 210,
  },
  {
    id: "fl-rose-peach",
    title: "Bó hoa hồng cam pastel",
    cat: "flower",
    imageUrl: "/images/decor/rose-posy-peach.png",
    width: 170,
    height: 180,
  },
  {
    id: "f10",
    title: "Vòng nguyệt quế hoa baby tròn",
    cat: "flower",
    imageUrl: "/images/decor/wreath-baby-breath-round.png",
    width: 220,
    height: 220,
  },
  {
    id: "fl-dried-baby-breath",
    title: "Nhành hoa baby khô vintage",
    cat: "flower",
    imageUrl: "/images/decor/dried-baby-breath-branch.png",
    width: 170,
    height: 280,
  },
  {
    id: "fl-cypress-garden",
    title: "Vườn cây bách màu nước Tuscany",
    cat: "flower",
    imageUrl: "/images/decor/watercolor-cypress-garden.png",
    width: 280,
    height: 180,
    isWide: true,
  },

  // ── 7. CHỮ HỶ ──
  { id: "h1", title: "Chữ Hỷ Song Hỷ Đỏ", cat: "hy", icon: "囍", color: "#DC2626", width: 110, height: 110 },
  { id: "h2", title: "Chữ Hỷ Mạ Vàng", cat: "hy", icon: "囍", color: "#D4AF37", width: 110, height: 110 },
  { id: "h3", title: "Chữ Hỷ Tròn Nghệ Thuật", cat: "hy", icon: "💮囍💮", color: "#DC2626", isWide: true, width: 160, height: 70 },
  { id: "h4", title: "Bách Niên Giai Lão", cat: "hy", icon: "百年偕老", color: "#991B1B", isWide: true, width: 160, height: 70 },
  { id: "h5", title: "Loan Phụng Hòa Minh", cat: "hy", icon: "鸞鳳和鳴", color: "#991B1B", isWide: true, width: 160, height: 70 },
  { id: "h6", title: "Hỷ Lồng Hoa Mẫu Đơn", cat: "hy", icon: "🌺囍🌺", color: "#DC2626", isWide: true, width: 160, height: 70 },

  // ── 8. TRÁI TIM ──
  {
    id: "ht1",
    title: "Trái tim pha lê Ruby 3D",
    cat: "heart",
    imageUrl: "/images/decor/crystal-faceted-heart.png",
    width: 170,
    height: 170,
  },
  {
    id: "ht2",
    title: "Trái tim đôi kim cương & nhung đỏ",
    cat: "heart",
    imageUrl: "/images/decor/twin-interlocking-hearts.png",
    width: 210,
    height: 130,
    isWide: true,
  },
  {
    id: "ht3",
    title: "Mũi tên vàng tình yêu xuyên tim",
    cat: "heart",
    imageUrl: "/images/decor/cupid-golden-arrow-heart.png",
    width: 220,
    height: 120,
    isWide: true,
  },
  {
    id: "ht4",
    title: "Cặp bong bóng trái tim pastel & vàng",
    cat: "heart",
    imageUrl: "/images/decor/heart-balloons-metallic.png",
    width: 180,
    height: 170,
  },
  {
    id: "ht5",
    title: "Hộp quà trái tim thắt nơ vàng kim",
    cat: "heart",
    imageUrl: "/images/decor/heart-gift-box-golden-bow.png",
    width: 170,
    height: 170,
  },
  {
    id: "ht6",
    title: "Trái tim tỏa ánh sao vàng hoàng gia",
    cat: "heart",
    imageUrl: "/images/decor/glow-heart-stars.png",
    width: 180,
    height: 160,
  },
  {
    id: "ht7",
    title: "Vòng trái tim hoa hồng & lá bạch đàn",
    cat: "heart",
    imageUrl: "/images/decor/floral-heart-wreath.png",
    width: 200,
    height: 180,
  },
  { id: "ht8", title: "Nhịp đập yêu thương", cat: "heart", icon: "💓", width: 100, height: 100 },

  // ── 9. CHỮ NGHỆ THUẬT & MONOGRAM (PHA LÊ 3D & BOTANICAL INK) ──
  {
    id: "mono-z-floral",
    title: "Chữ Z hoa lá nghệ thuật Vintage",
    cat: "monogram",
    imageUrl: "/images/decor/monogram-z-floral.png",
    width: 200,
    height: 200,
  },
  {
    id: "mono-b-crystal",
    title: "Chữ B pha lê 3D nguyên khối",
    cat: "monogram",
    imageUrl: "/images/decor/crystal-letter-b.png",
    width: 180,
    height: 210,
  },
  {
    id: "mono-d-crystal",
    title: "Chữ D pha lê 3D nguyên khối",
    cat: "monogram",
    imageUrl: "/images/decor/crystal-letter-d.png",
    width: 200,
    height: 210,
  },
  {
    id: "mono-e-crystal",
    title: "Chữ E pha lê 3D nguyên khối",
    cat: "monogram",
    imageUrl: "/images/decor/crystal-letter-e.png",
    width: 190,
    height: 210,
  },
  {
    id: "mono-g-crystal",
    title: "Chữ G pha lê 3D nguyên khối",
    cat: "monogram",
    imageUrl: "/images/decor/crystal-letter-g.png",
    width: 200,
    height: 200,
  },
];
