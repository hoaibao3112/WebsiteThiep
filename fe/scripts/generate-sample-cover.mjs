import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function createCover1() {
  const width = 640;
  const height = 960;

  // 1. Resize background
  const bgPath = 'public/images/backgrounds/bg-imperial-crimson-velvet.jpg';
  const bg = await sharp(bgPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. Prepare couple portrait
  const couplePath = 'public/images/demo/templates/t01-heritage/cover.jpg';
  const portraitW = 340;
  const portraitH = 430;

  // Arch mask for portrait
  const archMask = Buffer.from(`
    <svg width="${portraitW}" height="${portraitH}">
      <path d="M 0,140 Q 0,0 ${portraitW/2},0 Q ${portraitW},0 ${portraitW},140 L ${portraitW},${portraitH-16} Q ${portraitW},${portraitH} ${portraitW-16},${portraitH} L 16,${portraitH} Q 0,${portraitH} 0,${portraitH-16} Z" fill="#fff" />
    </svg>
  `);

  const maskedPortrait = await sharp(couplePath)
    .resize(portraitW, portraitH, { fit: 'cover', position: 'center' })
    .composite([{ input: archMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. SVG overlay for borders and typography
  const overlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDF0CD" />
          <stop offset="40%" stop-color="#E5C158" />
          <stop offset="70%" stop-color="#C59B27" />
          <stop offset="100%" stop-color="#9E7318" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5" />
        </filter>
        <filter id="textGlow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.7" />
        </filter>
      </defs>

      <!-- Arch border around couple -->
      <path d="M ${(width-portraitW)/2},${230+140} Q ${(width-portraitW)/2},230 ${width/2},230 Q ${(width+portraitW)/2},230 ${(width+portraitW)/2},${230+140} L ${(width+portraitW)/2},${230+portraitH-16} Q ${(width+portraitW)/2},${230+portraitH} ${(width+portraitW)/2-16},${230+portraitH} L ${(width-portraitW)/2+16},${230+portraitH} Q ${(width-portraitW)/2},${230+portraitH} ${(width-portraitW)/2},${230+portraitH-16} Z" 
            fill="none" stroke="url(#gold)" stroke-width="3" filter="url(#shadow)" />

      <!-- Top Title -->
      <text x="${width/2}" y="125" text-anchor="middle" font-family="serif" font-size="11" font-weight="600" letter-spacing="4" fill="url(#gold)" filter="url(#textGlow)">
        THE WEDDING OF
      </text>
      
      <!-- Couple Monogram -->
      <text x="${width/2}" y="165" text-anchor="middle" font-family="serif" font-size="28" font-weight="bold" fill="#FFF8EA" filter="url(#textGlow)">
        M &#38; H
      </text>
      
      <circle cx="${width/2 - 70}" cy="158" r="2" fill="url(#gold)" />
      <line x1="${width/2 - 60}" y1="158" x2="${width/2 - 40}" y2="158" stroke="url(#gold)" stroke-width="1" />
      <circle cx="${width/2 + 70}" cy="158" r="2" fill="url(#gold)" />
      <line x1="${width/2 + 40}" y1="158" x2="${width/2 + 60}" y2="158" stroke="url(#gold)" stroke-width="1" />

      <!-- Subtitle -->
      <text x="${width/2}" y="195" text-anchor="middle" font-family="serif" font-size="13" font-style="italic" fill="#F0E3CB" filter="url(#textGlow)">
        Save our special day
      </text>

      <!-- Bottom Card Metadata: Couple Names -->
      <g filter="url(#textGlow)">
        <text x="${width/2}" y="715" text-anchor="middle" font-family="serif" font-size="24" font-weight="bold" letter-spacing="1" fill="#FFFFFF">
          Minh Khôi &#38; Ngọc Hân
        </text>

        <!-- Floral divider -->
        <text x="${width/2}" y="745" text-anchor="middle" font-size="14" fill="url(#gold)">
          ❖ ─── ✦ ─── ❖
        </text>

        <!-- Date & Location -->
        <text x="${width/2}" y="775" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" letter-spacing="3" fill="#F7E7CE">
          20 . 11 . 2026
        </text>
        <text x="${width/2}" y="800" text-anchor="middle" font-family="sans-serif" font-size="11" letter-spacing="1" fill="#D8C7B5">
          HOÀNG GIA CONVENTION &#8226; TP. HỒ CHÍ MINH
        </text>
      </g>
    </svg>
  `);

  const output = await sharp(bg)
    .composite([
      { input: maskedPortrait, top: 230, left: (width - portraitW) / 2 },
      { input: overlaySvg, top: 0, left: 0 }
    ])
    .webp({ quality: 92 })
    .toFile('public/images/templates/cover-01-heritage.webp');

  console.log('Cover 1 created successfully:', output);
}

createCover1().catch(console.error);
