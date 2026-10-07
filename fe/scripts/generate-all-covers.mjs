import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const W = 640;
const H = 960;

function createArchMask(w, h, topCurve = 140, cornerR = 16) {
  return Buffer.from(`
    <svg width="${w}" height="${h}">
      <path d="M 0,${topCurve} Q 0,0 ${w/2},0 Q ${w},0 ${w},${topCurve} L ${w},${h-cornerR} Q ${w},${h} ${w-cornerR},${h} L ${cornerR},${h} Q 0,${h} 0,${h-cornerR} Z" fill="#fff" />
    </svg>
  `);
}

async function renderCover(cfg) {
  const {
    id,
    bgPath,
    couplePath,
    portraitW = 340,
    portraitH = 430,
    topOffset = 230,
    topCurve = 140,
    goldColors = ['#FDF0CD', '#E5C158', '#C59B27', '#9E7318'],
    strokeColor = 'url(#gold)',
    headerTop,
    monogram,
    subtitle,
    names,
    date,
    venue,
    // Contrast colors
    isLightBg = false,
    headerTopColor = isLightBg ? '#8A631F' : 'url(#gold)',
    monogramColor = isLightBg ? '#2E2218' : '#FFFBF5',
    subtitleColor = isLightBg ? '#614C38' : '#F4EAE0',
    nameColor = isLightBg ? '#261B12' : '#FFFFFF',
    dateColor = isLightBg ? '#543F2B' : '#F8EEDD',
    venueColor = isLightBg ? '#735E47' : '#D8C7B5',
    outputFile,
  } = cfg;

  // 1. Base Background
  const bg = await sharp(bgPath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. Couple Portrait with Arch Mask
  const mask = createArchMask(portraitW, portraitH, topCurve);

  const maskedPortrait = await sharp(couplePath)
    .resize(portraitW, portraitH, { fit: 'cover', position: 'center' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const leftOffset = Math.round((W - portraitW) / 2);

  // 3. SVG Overlay for Framing, Lighting & Typography
  const archBorder = `
    <path d="M ${leftOffset},${topOffset + topCurve} Q ${leftOffset},${topOffset} ${W/2},${topOffset} Q ${leftOffset + portraitW},${topOffset} ${leftOffset + portraitW},${topOffset + topCurve} L ${leftOffset + portraitW},${topOffset + portraitH - 16} Q ${leftOffset + portraitW},${topOffset + portraitH} ${leftOffset + portraitW - 16},${topOffset + portraitH} L ${leftOffset + 16},${topOffset + portraitH} Q ${leftOffset},${topOffset + portraitH} ${leftOffset},${topOffset + portraitH - 16} Z" 
          fill="none" stroke="${strokeColor}" stroke-width="3" filter="url(#shadow)" />
  `;

  const shadowFilter = isLightBg ? `
    <filter id="textFilter">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#ffffff" flood-opacity="0.8" />
    </filter>
  ` : `
    <filter id="textFilter">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  `;

  const svg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${goldColors[0]}" />
          <stop offset="40%" stop-color="${goldColors[1]}" />
          <stop offset="70%" stop-color="${goldColors[2]}" />
          <stop offset="100%" stop-color="${goldColors[3]}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000" flood-opacity="${isLightBg ? 0.35 : 0.55}" />
        </filter>
        ${shadowFilter}
      </defs>

      <!-- Frame Border -->
      ${archBorder}

      <!-- Top Section -->
      <g filter="url(#textFilter)">
        <text x="${W/2}" y="${topOffset - 105}" text-anchor="middle" font-family="serif" font-size="11" font-weight="700" letter-spacing="4" fill="${headerTopColor}">
          ${headerTop}
        </text>
        <text x="${W/2}" y="${topOffset - 65}" text-anchor="middle" font-family="serif" font-size="30" font-weight="bold" fill="${monogramColor}">
          ${monogram}
        </text>
        <circle cx="${W/2 - 68}" cy="${topOffset - 72}" r="2" fill="${headerTopColor}" />
        <line x1="${W/2 - 58}" y1="${topOffset - 72}" x2="${W/2 - 38}" y2="${topOffset - 72}" stroke="${headerTopColor}" stroke-width="1.5" />
        <circle cx="${W/2 + 68}" cy="${topOffset - 72}" r="2" fill="${headerTopColor}" />
        <line x1="${W/2 + 38}" y1="${topOffset - 72}" x2="${W/2 + 58}" y2="${topOffset - 72}" stroke="${headerTopColor}" stroke-width="1.5" />
        <text x="${W/2}" y="${topOffset - 35}" text-anchor="middle" font-family="serif" font-size="12" font-style="italic" fill="${subtitleColor}">
          ${subtitle}
        </text>
      </g>

      <!-- Bottom Section -->
      <g filter="url(#textFilter)">
        <text x="${W/2}" y="${topOffset + portraitH + 46}" text-anchor="middle" font-family="serif" font-size="24" font-weight="bold" letter-spacing="1" fill="${nameColor}">
          ${names}
        </text>
        <text x="${W/2}" y="${topOffset + portraitH + 74}" text-anchor="middle" font-size="13" fill="${headerTopColor}">
          ❖ ─── ✦ ─── ❖
        </text>
        <text x="${W/2}" y="${topOffset + portraitH + 104}" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="${dateColor}">
          ${date}
        </text>
        <text x="${W/2}" y="${topOffset + portraitH + 128}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="500" letter-spacing="1" fill="${venueColor}">
          ${venue}
        </text>
      </g>
    </svg>
  `);

  await sharp(bg)
    .composite([
      { input: maskedPortrait, top: topOffset, left: leftOffset },
      { input: svg, top: 0, left: 0 }
    ])
    .webp({ quality: 92 })
    .toFile(outputFile);

  console.log(`Updated: ${outputFile}`);
}

async function run() {
  const configs = [
    // 01. Á ĐÔNG CUNG ĐÌNH HOÀNG GIA (Dark red velvet)
    {
      id: '01',
      bgPath: 'public/images/backgrounds/bg-imperial-crimson-velvet.jpg',
      couplePath: 'public/images/demo/templates/t01-heritage/cover.jpg',
      portraitW: 340,
      portraitH: 430,
      topOffset: 230,
      topCurve: 140,
      isLightBg: false,
      headerTop: 'THE WEDDING OF',
      monogram: 'M &#38; H',
      subtitle: 'Save our special day',
      names: 'Minh Khôi &#38; Ngọc Hân',
      date: '20 . 11 . 2026',
      venue: 'HOÀNG GIA CONVENTION &#8226; TP. HỒ CHÍ MINH',
      outputFile: 'public/images/templates/cover-01-heritage.webp'
    },
    // 02. TẠP CHÍ HÀN QUỐC EDITORIAL (White rose arch)
    {
      id: '02',
      bgPath: 'public/images/backgrounds/bg-glasshouse-white-rose.jpg',
      couplePath: 'public/images/demo/templates/t02-magazine/cover.jpg',
      portraitW: 330,
      portraitH: 440,
      topOffset: 220,
      topCurve: 130,
      isLightBg: false,
      goldColors: ['#FFF6E5', '#DFBA73', '#C59A44', '#99732B'],
      headerTop: 'VOGUE EDITORIAL',
      monogram: 'V &#38; Y',
      subtitle: 'A modern love story',
      names: 'Công Vinh &#38; Hải Yến',
      date: '28 . 12 . 2026',
      venue: 'PARK HYATT SAIGON &#8226; TP. HỒ CHÍ MINH',
      outputFile: 'public/images/templates/cover-02-magazine.webp'
    },
    // 03. SWEET PINK LÃNG MẠN (Ribbed glass pastel)
    {
      id: '03',
      bgPath: 'public/images/backgrounds/bg-ribbed-glass-pink-peony.jpg',
      couplePath: 'public/images/demo/templates/t03-sweet-pink/cover.jpg',
      portraitW: 330,
      portraitH: 430,
      topOffset: 230,
      topCurve: 130,
      isLightBg: true,
      strokeColor: '#E68A9E',
      headerTopColor: '#C44D68',
      monogramColor: '#52212B',
      subtitleColor: '#78434F',
      nameColor: '#36161D',
      dateColor: '#78434F',
      venueColor: '#9C6B76',
      headerTop: 'SWEET ROMANCE',
      monogram: 'H &#38; A',
      subtitle: 'Forever begins today',
      names: 'Quốc Huy &#38; Mai Anh',
      date: '24 . 12 . 2026',
      venue: 'GEM CENTER &#8226; TP. HỒ CHÍ MINH',
      outputFile: 'public/images/templates/cover-03-sweet-pink.webp'
    },
    // 04. QUÝ TỘC ĐỎ RƯỢU MARSALA (Roman stone arch)
    {
      id: '04',
      bgPath: 'public/images/backgrounds/bg-roman-arch-marsala.jpg',
      couplePath: 'public/images/demo/templates/t04-marsala/cover.jpg',
      portraitW: 340,
      portraitH: 440,
      topOffset: 220,
      topCurve: 150,
      isLightBg: false,
      goldColors: ['#FFF3D6', '#E2BD6E', '#C2963B', '#8C671C'],
      headerTop: 'ROYAL INVITATION',
      monogram: 'M &#38; P',
      subtitle: 'An evening of love &amp; grace',
      names: 'Nguyễn Minh &#38; Bùi Phương',
      date: '20 . 12 . 2026',
      venue: 'CHÂTEAU DE L&#8217;AMOUR &#8226; THANH HÓA',
      outputFile: 'public/images/templates/cover-04-marsala.webp'
    },
    // 05. RUSTIC XANH RÊU THIÊN NHIÊN (Deckled cotton paper)
    {
      id: '05',
      bgPath: 'public/images/backgrounds/bg-deckled-paper-botanical.jpg',
      couplePath: 'public/images/demo/templates/t05-forest/cover.jpg',
      portraitW: 340,
      portraitH: 430,
      topOffset: 230,
      topCurve: 120,
      isLightBg: true,
      strokeColor: '#A88548',
      headerTopColor: '#7D5C22',
      monogramColor: '#2B2117',
      subtitleColor: '#5C4731',
      nameColor: '#1F1710',
      dateColor: '#543F2B',
      venueColor: '#735E47',
      headerTop: 'BOTANICAL WEDDING',
      monogram: 'M &#38; L',
      subtitle: 'Together with our families',
      names: 'Tuấn Minh &#38; Mai Lan',
      date: '02 . 08 . 2026',
      venue: 'PINE HILL GARDEN &#8226; HÀ NỘI',
      outputFile: 'public/images/templates/cover-05-forest.webp'
    },
    // 06. HOA SEN THANH KHIẾT BÁO HỶ (Rice paper watercolor lotus)
    {
      id: '06',
      bgPath: 'public/images/backgrounds/bg-deckled-paper-lotus.jpg',
      couplePath: 'public/images/demo/templates/t06-lotus/cover.jpg',
      portraitW: 330,
      portraitH: 430,
      topOffset: 230,
      topCurve: 140,
      isLightBg: true,
      strokeColor: '#B8860B',
      headerTopColor: '#8C2B3E',
      monogramColor: '#2B1B1E',
      subtitleColor: '#6B424A',
      nameColor: '#1F1215',
      dateColor: '#5E3840',
      venueColor: '#78545C',
      headerTop: 'THƯ MỜI THÀNH HÔN',
      monogram: 'H &#38; H',
      subtitle: 'Duyên thắm trầu cau',
      names: 'Minh Hằng &#38; Đức Hiển',
      date: '29 . 11 . 2026',
      venue: 'TRUNG TÂM TIỆC CƯỚI CINELOVE &#8226; HÀ NỘI',
      outputFile: 'public/images/templates/cover-06-lotus.webp'
    },
    // 07. ĐIỆN ẢNH LOOKBOOK TÌNH YÊU (Sunset golden flare)
    {
      id: '07',
      bgPath: 'public/images/backgrounds/bg-cinematic-golden-sunset.jpg',
      couplePath: 'public/images/demo/templates/t07-cinematic/cover.jpg',
      portraitW: 340,
      portraitH: 430,
      topOffset: 230,
      topCurve: 130,
      isLightBg: false,
      goldColors: ['#FFF8ED', '#EAC57C', '#D0A045', '#986D1E'],
      headerTop: 'CINEMA LOVE STORY',
      monogram: 'K &#38; T',
      subtitle: 'A lifetime of happiness',
      names: 'Đình Khoa &#38; Bảo Trân',
      date: '08 . 02 . 2027',
      venue: 'JW MARRIOTT HOTEL &#8226; HÀ NỘI',
      outputFile: 'public/images/templates/cover-07-cinematic.webp'
    },
    // 08. SUỐI NGUỒN HỒ NƯỚC THIÊN NHIÊN (Alpine lake)
    {
      id: '08',
      bgPath: 'public/images/backgrounds/bg-alpine-lake-pine.jpg',
      couplePath: 'public/images/demo/templates/t08-alpine/cover.jpg',
      portraitW: 340,
      portraitH: 430,
      topOffset: 230,
      topCurve: 130,
      isLightBg: true,
      strokeColor: '#36656B',
      headerTopColor: '#275258',
      monogramColor: '#1C373B',
      subtitleColor: '#3F6469',
      nameColor: '#14272A',
      dateColor: '#2D4E52',
      venueColor: '#4A6B6F',
      headerTop: 'ALPINE ROMANCE',
      monogram: 'K &#38; N',
      subtitle: 'By the quiet waters',
      names: 'Đăng Khoa &#38; Bảo Ngọc',
      date: '28 . 02 . 2027',
      venue: 'DALAT EDENSEE LAKE RESORT &#8226; ĐÀ LẠT',
      outputFile: 'public/images/templates/cover-08-alpine.webp'
    },
    // 09. LONG PHỤNG SUM VẦY ĐỎ ĐÔ (Crimson gold brocade)
    {
      id: '09',
      bgPath: 'public/images/backgrounds/bg-dragon-phoenix-gold-border.jpg',
      couplePath: 'public/images/demo/templates/t09-dragon/cover.jpg',
      portraitW: 340,
      portraitH: 430,
      topOffset: 230,
      topCurve: 140,
      isLightBg: false,
      goldColors: ['#FFF4D9', '#E0B867', '#BD8F35', '#8C6219'],
      headerTop: 'LỄ THÀNH HÔN &#8226; SONG HỶ',
      monogram: 'T &#38; T',
      subtitle: 'Trăm năm tình viên mãn',
      names: 'Ánh Tuấn &#38; Huỳnh Trúc',
      date: '12 . 12 . 2026',
      venue: 'TRUNG TÂM TIỆC CƯỚI HOÀNG GIA',
      outputFile: 'public/images/templates/cover-09-dragon.webp'
    },
  ];

  for (const cfg of configs) {
    try {
      await renderCover(cfg);
    } catch (e) {
      console.error(`Error on ${cfg.id}:`, e);
    }
  }
  console.log('All 9 covers successfully updated!');
}

run().catch(console.error);
