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
  effect?: "none" | "cherry" | "snow" | "leaves" | "apricot" | "hydrangea" | string;
}

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  shape: "petal" | "circle" | "leaf";
}

export function CanvasFallingEffect({ effect }: CanvasFallingEffectProps) {
  if (!effect || effect === "none") return null;

  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    const count = 16;

    for (let i = 0; i < count; i++) {
      const left = Math.round((i / count) * 100 + (Math.sin(i * 99) * 8));
      const size = 10 + (i % 5) * 3;
      const duration = 5 + (i % 4) * 2;
      const delay = (i % 6) * 0.9;

      let color = "#FB7185";
      let shape: "petal" | "circle" | "leaf" = "petal";

      if (effect === "cherry") {
        color = i % 2 === 0 ? "#FDA4AF" : "#F472B6";
        shape = "petal";
      } else if (effect === "snow") {
        color = "#FFFFFF";
        shape = "circle";
      } else if (effect === "leaves") {
        color = i % 2 === 0 ? "#F59E0B" : "#D97706";
        shape = "leaf";
      } else if (effect === "apricot") {
        color = i % 2 === 0 ? "#FBBF24" : "#F59E0B";
        shape = "petal";
      } else if (effect === "hydrangea") {
        color = i % 2 === 0 ? "#C084FC" : "#818CF8";
        shape = "petal";
      }

      list.push({
        id: i,
        left: Math.max(2, Math.min(96, left)),
        size,
        duration,
        delay,
        color,
        shape,
      });
    }

    return list;
  }, [effect]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <style>{`
        @keyframes canvasFallDown {
          0% {
            transform: translateY(-30px) rotate(0deg) translateX(0);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(720px) rotate(360deg) translateX(25px);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationName: "canvasFallDown",
            animationDuration: `${p.duration}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.shape === "circle" ? (
            <div
              className="w-full h-full rounded-full shadow-xs opacity-90"
              style={{ backgroundColor: p.color }}
            />
          ) : p.shape === "leaf" ? (
            <svg viewBox="0 0 30 30" className="w-full h-full drop-shadow-xs">
              <path
                d="M 5 15 Q 15 5 25 15 Q 15 25 5 15 Z"
                fill={p.color}
                opacity={0.85}
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
              <path
                d="M 12 2 C 16 6 20 12 18 18 C 15 22 9 22 6 18 C 4 12 8 6 12 2 Z"
                fill={p.color}
                opacity={0.85}
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
