"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

interface ButterflyData {
  id: number;
  startX: number; // %
  startY: number; // %
  size: number;   // px
  color1: string;
  color2: string;
  baseFlapSpeed: number;
  flightDuration: number;
  delay: number;
  path: { x: number[]; y: number[]; rotate: number[] };
}

interface BubbleData {
  id: number;
  baseLeft: number; // %
  baseTop: number;  // %
  size: number;     // px
  duration: number;
  delay: number;
  driftX: number;
  colorTheme: "gold" | "rose" | "pearl" | "champagne";
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number;
}

export const JournalHeroDecorations: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 600 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [trail, setTrail] = useState<TrailParticle[]>([]);
  const lastTrailTimeRef = useRef(0);

  // Cập nhật kích thước vùng chứa
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth || 1200,
          height: containerRef.current.offsetHeight || 600,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Lắng nghe tương tác chuột trên vùng Hero
  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setMousePos({ x: currentX, y: currentY });

      // Tạo vệt bong bóng nhỏ & bụi sao lung linh theo đuôi chuột (throttle 60ms)
      const now = performance.now();
      if (now - lastTrailTimeRef.current > 55) {
        lastTrailTimeRef.current = now;
        const newParticle: TrailParticle = {
          id: now + Math.random(),
          x: currentX + (Math.random() * 20 - 10),
          y: currentY + (Math.random() * 20 - 10),
          size: Math.floor(Math.random() * 12) + 8, // 8px - 20px
          createdAt: now,
        };
        setTrail((prev) => [...prev.slice(-14), newParticle]);
      }
    };

    const handleMouseLeave = () => {
      setMousePos(null);
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Dọn dẹp các hạt bụi sao / bong bóng vệt chuột sau 1s
  useEffect(() => {
    if (trail.length === 0) return;
    const interval = setInterval(() => {
      const now = performance.now();
      setTrail((prev) => prev.filter((p) => now - p.createdAt < 1100));
    }, 150);
    return () => clearInterval(interval);
  }, [trail.length]);

  // ─────────────────────────────────────────────────────────────
  // 1. DANH SÁCH 7 CHÚ BƯỚM 3D VỚI ĐA DẠNG MÀU SẮC & QUỸ ĐẠO BAY
  // ─────────────────────────────────────────────────────────────
  const butterflies: ButterflyData[] = useMemo(
    () => [
      {
        id: 1,
        startX: 64,
        startY: 20,
        size: 34,
        color1: "#F3D079",
        color2: "#C59B42",
        baseFlapSpeed: 0.28,
        flightDuration: 9.5,
        delay: 0,
        path: {
          x: [0, 50, -35, 25, 0],
          y: [0, -30, 25, -25, 0],
          rotate: [15, 45, -20, 30, 15],
        },
      },
      {
        id: 2,
        startX: 86,
        startY: 38,
        size: 28,
        color1: "#F9B7C3",
        color2: "#E58798",
        baseFlapSpeed: 0.24,
        flightDuration: 10.5,
        delay: 1.2,
        path: {
          x: [0, -45, -15, -55, 0],
          y: [0, 35, -35, 20, 0],
          rotate: [-10, -35, 25, -15, -10],
        },
      },
      {
        id: 3,
        startX: 48,
        startY: 28,
        size: 24,
        color1: "#FCE7A2",
        color2: "#D8A843",
        baseFlapSpeed: 0.22,
        flightDuration: 12,
        delay: 2.2,
        path: {
          x: [0, 65, 30, 80, 0],
          y: [0, -25, 30, -20, 0],
          rotate: [20, 50, -10, 35, 20],
        },
      },
      {
        id: 4,
        startX: 76,
        startY: 72,
        size: 30,
        color1: "#FCD0C5",
        color2: "#D48B7B",
        baseFlapSpeed: 0.26,
        flightDuration: 10.2,
        delay: 3.5,
        path: {
          x: [0, -35, 25, -25, 0],
          y: [0, -45, -15, -55, 0],
          rotate: [-15, -40, 15, -25, -15],
        },
      },
      {
        id: 5,
        startX: 14,
        startY: 18,
        size: 26,
        color1: "#F8E3A9",
        color2: "#C99E4B",
        baseFlapSpeed: 0.3,
        flightDuration: 11.5,
        delay: 0.6,
        path: {
          x: [0, 40, -20, 35, 0],
          y: [0, -20, 25, -10, 0],
          rotate: [10, 30, -15, 20, 10],
        },
      },
      {
        id: 6,
        startX: 92,
        startY: 65,
        size: 22,
        color1: "#EAD7FF",
        color2: "#B786E5",
        baseFlapSpeed: 0.23,
        flightDuration: 8.8,
        delay: 1.8,
        path: {
          x: [0, -30, -60, -10, 0],
          y: [0, -40, 15, -30, 0],
          rotate: [-20, 10, -35, 15, -20],
        },
      },
      {
        id: 7,
        startX: 32,
        startY: 68,
        size: 25,
        color1: "#FFE0B2",
        color2: "#FFA726",
        baseFlapSpeed: 0.25,
        flightDuration: 11.0,
        delay: 2.8,
        path: {
          x: [0, 45, 15, 55, 0],
          y: [0, -35, 20, -15, 0],
          rotate: [15, 40, -10, 25, 15],
        },
      },
    ],
    []
  );

  // ─────────────────────────────────────────────────────────────
  // 2. DANH SÁCH 26 BONG BÓNG ÁNH SÁNG ĐA TẦNG (VÙNG TOÀN BỘ HERO)
  // ─────────────────────────────────────────────────────────────
  const bubbles: BubbleData[] = useMemo(
    () => [
      // Nhóm quanh tiêu đề bên trái
      { id: 1, baseLeft: 6, baseTop: 35, size: 28, duration: 6.2, delay: 0, driftX: 16, colorTheme: "gold" },
      { id: 2, baseLeft: 18, baseTop: 15, size: 18, duration: 7.0, delay: 1.4, driftX: -12, colorTheme: "rose" },
      { id: 3, baseLeft: 25, baseTop: 62, size: 34, duration: 8.1, delay: 0.8, driftX: 20, colorTheme: "pearl" },
      { id: 4, baseLeft: 34, baseTop: 22, size: 22, duration: 6.5, delay: 2.1, driftX: -14, colorTheme: "champagne" },
      { id: 5, baseLeft: 12, baseTop: 78, size: 38, duration: 7.6, delay: 3.2, driftX: 18, colorTheme: "gold" },
      { id: 6, baseLeft: 28, baseTop: 82, size: 20, duration: 6.8, delay: 0.5, driftX: -10, colorTheme: "rose" },

      // Nhóm trung tâm kết nối
      { id: 7, baseLeft: 42, baseTop: 18, size: 26, duration: 7.4, delay: 2.8, driftX: 16, colorTheme: "pearl" },
      { id: 8, baseLeft: 47, baseTop: 48, size: 42, duration: 8.6, delay: 0.3, driftX: -22, colorTheme: "champagne" },
      { id: 9, baseLeft: 52, baseTop: 75, size: 24, duration: 6.9, delay: 1.9, driftX: 14, colorTheme: "gold" },

      // Nhóm quanh bó hoa cưới bên phải (dày dặn & lung linh)
      { id: 10, baseLeft: 60, baseTop: 28, size: 36, duration: 7.2, delay: 1.1, driftX: -18, colorTheme: "rose" },
      { id: 11, baseLeft: 66, baseTop: 55, size: 48, duration: 9.2, delay: 0.2, driftX: 24, colorTheme: "gold" },
      { id: 12, baseLeft: 71, baseTop: 12, size: 22, duration: 5.9, delay: 3.1, driftX: -12, colorTheme: "pearl" },
      { id: 13, baseLeft: 76, baseTop: 42, size: 54, duration: 8.8, delay: 0.7, driftX: 22, colorTheme: "champagne" },
      { id: 14, baseLeft: 81, baseTop: 72, size: 32, duration: 7.5, delay: 1.7, driftX: -16, colorTheme: "rose" },
      { id: 15, baseLeft: 87, baseTop: 22, size: 28, duration: 6.7, delay: 2.5, driftX: 15, colorTheme: "gold" },
      { id: 16, baseLeft: 91, baseTop: 50, size: 44, duration: 8.4, delay: 0.9, driftX: -20, colorTheme: "pearl" },
      { id: 17, baseLeft: 95, baseTop: 78, size: 20, duration: 6.3, delay: 2.2, driftX: 12, colorTheme: "champagne" },
      { id: 18, baseLeft: 64, baseTop: 82, size: 30, duration: 7.8, delay: 1.5, driftX: -14, colorTheme: "gold" },
      { id: 19, baseLeft: 84, baseTop: 88, size: 26, duration: 7.1, delay: 3.3, driftX: 18, colorTheme: "rose" },

      // Bong bóng mini phản quang li ti
      { id: 20, baseLeft: 38, baseTop: 36, size: 14, duration: 5.5, delay: 1.0, driftX: 8, colorTheme: "pearl" },
      { id: 21, baseLeft: 58, baseTop: 16, size: 16, duration: 5.8, delay: 2.4, driftX: -9, colorTheme: "gold" },
      { id: 22, baseLeft: 78, baseTop: 26, size: 15, duration: 5.4, delay: 0.6, driftX: 10, colorTheme: "rose" },
      { id: 23, baseLeft: 89, baseTop: 35, size: 14, duration: 5.7, delay: 1.8, driftX: -8, colorTheme: "champagne" },
      { id: 24, baseLeft: 16, baseTop: 50, size: 15, duration: 5.6, delay: 2.9, driftX: 9, colorTheme: "gold" },
      { id: 25, baseLeft: 73, baseTop: 68, size: 18, duration: 6.0, delay: 1.3, driftX: -11, colorTheme: "pearl" },
      { id: 26, baseLeft: 83, baseTop: 58, size: 16, duration: 5.9, delay: 2.0, driftX: 10, colorTheme: "rose" },
    ],
    []
  );

  // Tính độ dịch chuyển đẩy né chuột (Physics Repulsion) cho từng bong bóng
  const getBubbleRepulsion = useCallback(
    (bubble: BubbleData) => {
      if (!mousePos) return { x: 0, y: 0, scale: 1 };

      const bubblePxX = (bubble.baseLeft / 100) * containerSize.width;
      const bubblePxY = (bubble.baseTop / 100) * containerSize.height;

      const dx = bubblePxX - mousePos.x;
      const dy = bubblePxY - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxRepulsionRadius = 170; // Bán kính tương tác chuột
      if (dist < maxRepulsionRadius && dist > 1) {
        const force = (1 - dist / maxRepulsionRadius) * 45; // Đẩy tối đa 45px
        return {
          x: (dx / dist) * force,
          y: (dy / dist) * force,
          scale: 1.15, // Phóng to nhẹ khi chuột lướt qua
        };
      }

      return { x: 0, y: 0, scale: 1 };
    },
    [mousePos, containerSize]
  );

  // Tính phản ứng né chuột cho từng chú bướm (Butterfly Evasion & Excitement)
  const getButterflyRepulsion = useCallback(
    (bf: ButterflyData) => {
      if (!mousePos) return { x: 0, y: 0, flapBoost: 1 };

      const bfPxX = (bf.startX / 100) * containerSize.width;
      const bfPxY = (bf.startY / 100) * containerSize.height;

      const dx = bfPxX - mousePos.x;
      const dy = bfPxY - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const avoidRadius = 150;
      if (dist < avoidRadius && dist > 1) {
        const force = (1 - dist / avoidRadius) * 55; // Bướm giật mình bay né ra 55px
        return {
          x: (dx / dist) * force,
          y: (dy / dist) * force,
          flapBoost: 0.5, // Đập cánh nhanh gấp đôi khi chuột tới gần
        };
      }

      return { x: 0, y: 0, flapBoost: 1 };
    },
    [mousePos, containerSize]
  );

  // Lấy kiểu màu bong bóng theo chủ đề
  const getBubbleStyle = (theme: BubbleData["colorTheme"]) => {
    switch (theme) {
      case "gold":
        return {
          background:
            "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(254, 240, 185, 0.6) 40%, rgba(243, 198, 105, 0.35) 75%, rgba(255, 255, 255, 0.2) 100%)",
          border: "1.2px solid rgba(230, 195, 120, 0.75)",
          boxShadow:
            "0 6px 20px rgba(212, 168, 83, 0.35), inset 0 0 12px rgba(255, 255, 255, 0.8)",
        };
      case "rose":
        return {
          background:
            "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 218, 225, 0.6) 40%, rgba(244, 158, 175, 0.35) 75%, rgba(255, 255, 255, 0.2) 100%)",
          border: "1.2px solid rgba(244, 175, 190, 0.75)",
          boxShadow:
            "0 6px 20px rgba(235, 140, 160, 0.35), inset 0 0 12px rgba(255, 255, 255, 0.8)",
        };
      case "pearl":
        return {
          background:
            "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98) 0%, rgba(235, 242, 255, 0.6) 40%, rgba(200, 220, 255, 0.3) 75%, rgba(255, 255, 255, 0.2) 100%)",
          border: "1.2px solid rgba(200, 225, 255, 0.8)",
          boxShadow:
            "0 6px 20px rgba(160, 195, 245, 0.3), inset 0 0 12px rgba(255, 255, 255, 0.85)",
        };
      case "champagne":
      default:
        return {
          background:
            "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(252, 235, 212, 0.6) 40%, rgba(235, 185, 150, 0.35) 75%, rgba(255, 255, 255, 0.2) 100%)",
          border: "1.2px solid rgba(235, 190, 160, 0.75)",
          boxShadow:
            "0 6px 20px rgba(215, 160, 130, 0.35), inset 0 0 12px rgba(255, 255, 255, 0.8)",
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10 select-none"
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. HIỆU ỨNG VỆT BONG BÓNG LUNG LINH KHI DI CHUỘT (TRAIL)        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {trail.map((p) => (
        <motion.div
          key={`trail-${p.id}`}
          className="absolute rounded-full"
          initial={{ opacity: 0.9, scale: 0.4, x: p.x, y: p.y }}
          animate={{
            opacity: 0,
            scale: 1.4,
            y: p.y - 45,
            x: p.x + (Math.random() * 30 - 15),
          }}
          transition={{ duration: 0.95, ease: "easeOut" }}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            background:
              "radial-gradient(circle at 30% 30%, #FFFFFF 0%, rgba(254, 230, 160, 0.8) 50%, rgba(235, 160, 180, 0.4) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 0 12px rgba(245, 205, 110, 0.6)",
          }}
        />
      ))}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. HỆ THỐNG 26 BONG BÓNG TRÔI TỰ DO & TƯƠNG TÁC ĐẨY KHI RÊ CHUỘT*/}
      {/* ───────────────────────────────────────────────────────────── */}
      {bubbles.map((b) => {
        const repulsion = getBubbleRepulsion(b);
        const bubbleStyle = getBubbleStyle(b.colorTheme);

        return (
          <motion.div
            key={`bubble-${b.id}`}
            className="absolute rounded-full"
            style={{
              left: `${b.baseLeft}%`,
              top: `${b.baseTop}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              ...bubbleStyle,
              backdropFilter: "blur(1.5px)",
            }}
            animate={{
              // Dao động tự nhiên trôi nổi
              y: [0, -32, -64, -32, 0],
              x: [0, b.driftX, 0, -b.driftX, 0],
              scale: [0.94, 1.08, 0.98, 1.05, 0.94],
              opacity: [0.65, 0.95, 0.75, 0.92, 0.65],
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: b.delay,
            }}
          >
            {/* Lớp phản ứng vật lý đẩy ra khi chuột lướt qua */}
            <motion.div
              className="w-full h-full relative"
              animate={{
                x: repulsion.x,
                y: repulsion.y,
                scale: repulsion.scale,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
                mass: 0.6,
              }}
            >
              {/* Điểm phản quang ánh sáng lấp lánh trên đỉnh bong bóng */}
              <div
                className="absolute top-[16%] left-[20%] rounded-full bg-white/95"
                style={{
                  width: `${Math.max(3.5, b.size * 0.24)}px`,
                  height: `${Math.max(2.5, b.size * 0.17)}px`,
                  transform: "rotate(-35deg)",
                  boxShadow: "0 0 3px rgba(255, 255, 255, 0.9)",
                }}
              />
              {/* Điểm phản quang phụ góc dưới */}
              <div
                className="absolute bottom-[20%] right-[22%] rounded-full bg-white/50"
                style={{
                  width: `${Math.max(2, b.size * 0.12)}px`,
                  height: `${Math.max(2, b.size * 0.12)}px`,
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. 7 CHÚ BƯỚM 3D VỖ CÁNH BAY LƯỢN & NÉ KHI CHUỘT TIẾP CẬN      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {butterflies.map((bf) => {
        const repulsion = getButterflyRepulsion(bf);

        return (
          <motion.div
            key={`butterfly-${bf.id}`}
            className="absolute"
            style={{
              left: `${bf.startX}%`,
              top: `${bf.startY}%`,
              width: `${bf.size}px`,
              height: `${bf.size}px`,
            }}
            animate={{
              x: bf.path.x,
              y: bf.path.y,
              rotate: bf.path.rotate,
            }}
            transition={{
              duration: bf.flightDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bf.delay,
            }}
          >
            {/* Lớp phản ứng né chuột linh hoạt */}
            <motion.div
              className="w-full h-full"
              animate={{
                x: repulsion.x,
                y: repulsion.y,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 15,
              }}
            >
              {/* Container 3D Perspective */}
              <div
                className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_5px_12px_rgba(180,130,50,0.45)]"
                style={{ perspective: "600px" }}
              >
                {/* CÁNH TRÁI (3D Flapping) */}
                <motion.div
                  className="origin-right w-1/2 h-full flex items-center justify-end"
                  animate={{ rotateY: [0, 72, 0] }}
                  transition={{
                    duration: bf.baseFlapSpeed * repulsion.flapBoost,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <svg viewBox="0 0 50 60" className="w-full h-full" fill="none">
                    <path
                      d="M 50 28 C 35 10, 8 2, 2 18 C -2 30, 20 42, 50 35 Z"
                      fill={`url(#wingGrad-${bf.id})`}
                      opacity="0.96"
                    />
                    <path
                      d="M 50 34 C 36 40, 14 46, 12 55 C 10 60, 28 62, 50 38 Z"
                      fill={`url(#wingGrad-${bf.id})`}
                      opacity="0.9"
                    />
                    {/* Đường gân cánh ánh vàng hoàng gia */}
                    <path
                      d="M 48 30 C 35 20, 18 18, 12 24"
                      stroke="#FFF7D6"
                      strokeWidth="1.4"
                      opacity="0.85"
                    />
                    <path
                      d="M 48 34 C 36 38, 22 42, 18 48"
                      stroke="#FFF7D6"
                      strokeWidth="1.1"
                      opacity="0.7"
                    />
                  </svg>
                </motion.div>

                {/* THÂN BƯỚM */}
                <div className="w-[3.5px] h-[68%] rounded-full bg-[#422E15] z-10 shrink-0 relative shadow-xs">
                  {/* Cặp râu bướm */}
                  <div className="absolute -top-1.5 -left-1 w-1.5 h-1.5 border-t border-l border-[#422E15] rounded-tl-full" />
                  <div className="absolute -top-1.5 -right-1 w-1.5 h-1.5 border-t border-r border-[#422E15] rounded-tr-full" />
                </div>

                {/* CÁNH PHẢI (3D Flapping) */}
                <motion.div
                  className="origin-left w-1/2 h-full flex items-center justify-start"
                  animate={{ rotateY: [0, -72, 0] }}
                  transition={{
                    duration: bf.baseFlapSpeed * repulsion.flapBoost,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <svg viewBox="0 0 50 60" className="w-full h-full scale-x-[-1]" fill="none">
                    <path
                      d="M 50 28 C 35 10, 8 2, 2 18 C -2 30, 20 42, 50 35 Z"
                      fill={`url(#wingGrad-${bf.id})`}
                      opacity="0.96"
                    />
                    <path
                      d="M 50 34 C 36 40, 14 46, 12 55 C 10 60, 28 62, 50 38 Z"
                      fill={`url(#wingGrad-${bf.id})`}
                      opacity="0.9"
                    />
                    <path
                      d="M 48 30 C 35 20, 18 18, 12 24"
                      stroke="#FFF7D6"
                      strokeWidth="1.4"
                      opacity="0.85"
                    />
                    <path
                      d="M 48 34 C 36 38, 22 42, 18 48"
                      stroke="#FFF7D6"
                      strokeWidth="1.1"
                      opacity="0.7"
                    />
                  </svg>
                </motion.div>

                {/* GRADIENT CÁNH BƯỚM */}
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id={`wingGrad-${bf.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={bf.color1} />
                      <stop offset="65%" stopColor={bf.color2} />
                      <stop offset="100%" stopColor="#9B6F20" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
