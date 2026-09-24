"use client";

import React, { useMemo } from "react";

interface CanvasPatternOverlayProps {
  pattern?: "none" | "flower-small" | "flower-large";
}

export function CanvasPatternOverlay({ pattern }: CanvasPatternOverlayProps) {
  if (!pattern || pattern === "none") return null;

  if (pattern === "flower-small") {
    return (
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="small-flowers" width="60" height="60" patternUnits="userSpaceOnUse">
              {/* Petal 1 */}
              <circle cx="30" cy="22" r="5" fill="#F43F5E" />
              <circle cx="38" cy="27" r="5" fill="#F43F5E" />
              <circle cx="35" cy="36" r="5" fill="#F43F5E" />
              <circle cx="25" cy="36" r="5" fill="#F43F5E" />
              <circle cx="22" cy="27" r="5" fill="#F43F5E" />
              {/* Center */}
              <circle cx="30" cy="30" r="3.5" fill="#FBBF24" />
              {/* Secondary tiny dot */}
              <circle cx="10" cy="10" r="2" fill="#FDA4AF" />
              <circle cx="50" cy="50" r="2" fill="#FDA4AF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#small-flowers)" />
        </svg>
      </div>
    );
  }

  if (pattern === "flower-large") {
    return (
      <div className="absolute inset-0 pointer-events-none z-0 opacity-15 overflow-hidden">
        {/* Top-left corner ornament */}
        <svg
          viewBox="0 0 150 150"
          className="absolute -top-4 -left-4 w-36 h-36 text-pink-700 fill-current"
        >
          <path d="M0,0 Q60,10 90,50 Q110,90 120,150 Q70,110 50,80 Q20,50 0,0 Z" />
          <circle cx="45" cy="45" r="14" fill="#E11D48" opacity="0.6" />
          <circle cx="75" cy="65" r="10" fill="#FB7185" opacity="0.6" />
          <path d="M10,80 Q40,60 80,80 Q50,110 10,80 Z" fill="#FDA4AF" opacity="0.5" />
        </svg>

        {/* Bottom-right corner ornament */}
        <svg
          viewBox="0 0 150 150"
          className="absolute -bottom-4 -right-4 w-36 h-36 text-pink-700 fill-current rotate-180"
        >
          <path d="M0,0 Q60,10 90,50 Q110,90 120,150 Q70,110 50,80 Q20,50 0,0 Z" />
          <circle cx="45" cy="45" r="14" fill="#E11D48" opacity="0.6" />
          <circle cx="75" cy="65" r="10" fill="#FB7185" opacity="0.6" />
          <path d="M10,80 Q40,60 80,80 Q50,110 10,80 Z" fill="#FDA4AF" opacity="0.5" />
        </svg>
      </div>
    );
  }

  return null;
}

interface CanvasFallingEffectProps {
  effect?:
    | "none"
    | "rose-petals"
    | "cherry-blossom"
    | "cherry"
    | "gold-sparkle"
    | "floating-hearts"
    | "snow"
    | "dandelion"
    | "fireflies"
    | "confetti"
    | "falling-leaves"
    | "leaves"
    | "apricot"
    | "hydrangea"
    | string;
}

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  secondaryColor?: string;
  shape:
    | "rose-petal"
    | "cherry-petal"
    | "gold-sparkle"
    | "heart"
    | "snowflake"
    | "dandelion"
    | "firefly"
    | "confetti"
    | "apricot-petal"
    | "leaf"
    | "hydrangea-petal";
  rotateInitial: number;
  swayX: number;
}

export function CanvasFallingEffect({ effect }: CanvasFallingEffectProps) {
  if (!effect || effect === "none" || effect === "NONE") return null;

  const normalizedEffect = effect.toLowerCase();

  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const count = normalizedEffect === "gold-sparkle" || normalizedEffect === "fireflies" ? 22 : 18;

    for (let i = 0; i < count; i++) {
      const left = Math.round((i / count) * 100 + (Math.sin(i * 99) * 8));
      const size = 12 + (i % 6) * 3;
      const duration = 5.5 + (i % 5) * 1.5;
      const delay = (i % 7) * 0.7;
      const rotateInitial = (i * 47) % 360;
      const swayX = 15 + (i % 4) * 10;

      let color = "#FB7185";
      let secondaryColor = "#F43F5E";
      let shape: Particle["shape"] = "cherry-petal";

      if (normalizedEffect === "rose-petals") {
        color = i % 2 === 0 ? "#E11D48" : "#BE123C";
        secondaryColor = "#9F1239";
        shape = "rose-petal";
      } else if (normalizedEffect === "cherry-blossom" || normalizedEffect === "cherry") {
        color = i % 2 === 0 ? "#FDA4AF" : "#F472B6";
        secondaryColor = "#FB7185";
        shape = "cherry-petal";
      } else if (normalizedEffect === "gold-sparkle") {
        color = i % 2 === 0 ? "#F59E0B" : "#FBBF24";
        secondaryColor = "#FEF08A";
        shape = "gold-sparkle";
      } else if (normalizedEffect === "floating-hearts") {
        color = i % 3 === 0 ? "#F43F5E" : i % 3 === 1 ? "#FB7185" : "#FDA4AF";
        secondaryColor = "#E11D48";
        shape = "heart";
      } else if (normalizedEffect === "snow") {
        color = "#FFFFFF";
        secondaryColor = "#E0F2FE";
        shape = "snowflake";
      } else if (normalizedEffect === "dandelion") {
        color = "#FFFFFF";
        secondaryColor = "#F1F5F9";
        shape = "dandelion";
      } else if (normalizedEffect === "fireflies") {
        color = i % 2 === 0 ? "#FACC15" : "#A3E635";
        secondaryColor = "#FEF08A";
        shape = "firefly";
      } else if (normalizedEffect === "confetti") {
        const confettiColors = ["#F43F5E", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
        color = confettiColors[i % confettiColors.length];
        shape = "confetti";
      } else if (normalizedEffect === "falling-leaves" || normalizedEffect === "leaves") {
        color = i % 2 === 0 ? "#F59E0B" : "#D97706";
        secondaryColor = "#B45309";
        shape = "leaf";
      } else if (normalizedEffect === "apricot") {
        color = i % 2 === 0 ? "#FBBF24" : "#F59E0B";
        secondaryColor = "#D97706";
        shape = "apricot-petal";
      } else if (normalizedEffect === "hydrangea") {
        color = i % 2 === 0 ? "#C084FC" : "#818CF8";
        secondaryColor = "#A855F7";
        shape = "hydrangea-petal";
      }

      list.push({
        id: i,
        left: Math.max(2, Math.min(96, left)),
        size,
        duration,
        delay,
        color,
        secondaryColor,
        shape,
        rotateInitial,
        swayX,
      });
    }

    return list;
  }, [normalizedEffect]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      <style>{`
        @keyframes canvasFallSway {
          0% {
            transform: translateY(-40px) translateX(0px) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          50% {
            transform: translateY(350px) translateX(var(--sway-x)) rotate(180deg) scale(1);
            opacity: 0.85;
          }
          85% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(850px) translateX(calc(var(--sway-x) * -0.5)) rotate(360deg) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes canvasFloatUp {
          0% {
            transform: translateY(850px) translateX(0px) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-40px) translateX(var(--sway-x)) scale(1.05);
            opacity: 0;
          }
        }

        @keyframes canvasGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 3px rgba(250, 204, 21, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.9));
          }
        }
      `}</style>

      {particles.map((p) => {
        const isUpward = normalizedEffect === "fireflies" || normalizedEffect === "floating-hearts";

        return (
          <div
            key={p.id}
            style={
              {
                position: "absolute",
                left: `${p.left}%`,
                top: isUpward ? "auto" : "-30px",
                bottom: isUpward ? "-30px" : "auto",
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationName: isUpward ? "canvasFloatUp" : "canvasFallSway",
                animationDuration: `${p.duration}s`,
                animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                animationIterationCount: "infinite",
                animationDelay: `${p.delay}s`,
                "--sway-x": `${p.swayX}px`,
                willChange: "transform, opacity",
              } as React.CSSProperties
            }
          >
            {/* 1. CÁNH HOA HỒNG (Rose Petal) */}
            {p.shape === "rose-petal" && (
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
                <path
                  d="M16 2 C22 2 30 10 28 20 C26 26 19 30 16 30 C13 30 6 26 4 20 C2 10 10 2 16 2 Z"
                  fill={p.color}
                />
                <path
                  d="M16 5 C20 7 24 12 23 18 C21 23 18 26 16 27"
                  stroke={p.secondaryColor}
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.6"
                />
              </svg>
            )}

            {/* 2. CÁNH HOA ANH ĐÀO (Cherry Petal) */}
            {p.shape === "cherry-petal" && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
                <path
                  d="M 12 2 C 16 6 20 12 18 18 C 15 22 9 22 6 18 C 4 12 8 6 12 2 Z"
                  fill={p.color}
                  opacity={0.88}
                />
                <circle cx="12" cy="16" r="1.5" fill={p.secondaryColor} opacity={0.6} />
              </svg>
            )}

            {/* 3. KIM TUYẾN VÀNG (Gold Sparkle) */}
            {p.shape === "gold-sparkle" && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_6px_rgba(245,158,11,0.7)] animate-pulse">
                <path
                  d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
                  fill={p.color}
                />
                <circle cx="12" cy="12" r="3" fill="#FFFFFF" opacity="0.9" />
              </svg>
            )}

            {/* 4. TRÁI TIM BAY (Floating Heart) */}
            {p.shape === "heart" && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={p.color}
                  opacity={0.9}
                />
              </svg>
            )}

            {/* 5. HOA TUYẾT TRẮNG (Snowflake) */}
            {p.shape === "snowflake" && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
                <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
                <path
                  d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="4" r="1.2" fill="#E0F2FE" />
                <circle cx="12" cy="20" r="1.2" fill="#E0F2FE" />
                <circle cx="4" cy="12" r="1.2" fill="#E0F2FE" />
                <circle cx="20" cy="12" r="1.2" fill="#E0F2FE" />
              </svg>
            )}

            {/* 6. BỒ CÔNG ANH (Dandelion) */}
            {p.shape === "dandelion" && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
                <circle cx="12" cy="8" r="2" fill="#FFFFFF" />
                <line x1="12" y1="8" x2="12" y2="22" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                <line x1="12" y1="8" x2="6" y2="4" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
                <line x1="12" y1="8" x2="18" y2="4" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
                <line x1="12" y1="8" x2="4" y2="9" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
                <line x1="12" y1="8" x2="20" y2="9" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />
              </svg>
            )}

            {/* 7. ĐOM ĐÓM ĐÊM (Firefly) */}
            {p.shape === "firefly" && (
              <div
                className="w-full h-full rounded-full shadow-[0_0_12px_rgba(250,204,21,0.9)] animate-pulse"
                style={{
                  backgroundColor: p.color,
                  filter: "blur(0.5px)",
                }}
              />
            )}

            {/* 8. PHÁO HOA GIẤY (Confetti) */}
            {p.shape === "confetti" && (
              <div
                className="w-full h-2 rounded-xs shadow-xs"
                style={{
                  backgroundColor: p.color,
                  transform: `rotate(${p.rotateInitial}deg)`,
                }}
              />
            )}

            {/* 9. LÁ THU RƠI (Leaf) */}
            {p.shape === "leaf" && (
              <svg viewBox="0 0 30 30" className="w-full h-full drop-shadow-xs">
                <path
                  d="M 5 15 Q 15 5 25 15 Q 15 25 5 15 Z"
                  fill={p.color}
                  opacity={0.88}
                />
                <line x1="5" y1="15" x2="25" y2="15" stroke={p.secondaryColor} strokeWidth="1" opacity="0.6" />
              </svg>
            )}

            {/* 10. HOA MAI VÀNG (Apricot Petal) */}
            {p.shape === "apricot-petal" && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
                <circle cx="12" cy="12" r="7" fill={p.color} opacity={0.9} />
                <circle cx="12" cy="12" r="3" fill="#D97706" opacity="0.7" />
              </svg>
            )}

            {/* 11. HOA TÚ CẦU (Hydrangea Petal) */}
            {p.shape === "hydrangea-petal" && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
                <path
                  d="M12 4 C15 7 15 11 12 14 C9 11 9 7 12 4 Z M12 14 C15 17 15 21 12 24 C9 21 9 17 12 14 Z M4 12 C7 15 11 15 14 12 C11 9 7 9 4 12 Z M14 12 C17 15 21 15 24 12 C21 9 17 9 14 12 Z"
                  fill={p.color}
                  opacity={0.85}
                />
                <circle cx="12" cy="12" r="2" fill="#FAF5FF" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
