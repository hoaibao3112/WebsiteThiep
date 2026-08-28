"use client";

import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { FallingEffectType } from "@/types/card.types";

interface FallingEffectProps {
  effect?: FallingEffectType;
}

export const FallingEffect: React.FC<FallingEffectProps> = ({
  effect = "PETAL",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (effect === "NONE") return;

    if (effect === "CONFETTI") {
      // Pháo hoa chào mừng lúc đầu
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      return;
    }

    // Hiệu ứng rơi liên tục (Petals, Hearts, Snow, Balloon)
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const items: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      color: string;
    }> = [];

    const colors =
      effect === "PETAL"
        ? ["#FFB7C5", "#FFC0CB", "#FFD1DC", "#FFE4E1"]
        : effect === "HEART"
        ? ["#FF4D6D", "#FF758F", "#FF8FA3", "#FFB3C1"]
        : effect === "SNOW"
        ? ["#FFFFFF", "#E0F2FE", "#BAE6FD"]
        : ["#38BDF8", "#F472B6", "#FBBF24", "#34D399"]; // Balloon

    const maxItems = effect === "SNOW" ? 60 : 25;

    for (let i = 0; i < maxItems; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (effect === "PETAL" ? 14 : 10) + 8,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: Math.sin(Math.random() * 2) * 0.8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.5 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      items.forEach((item) => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.globalAlpha = item.opacity;
        ctx.fillStyle = item.color;

        if (effect === "PETAL") {
          // Vẽ hình cánh hoa
          ctx.beginPath();
          ctx.ellipse(0, 0, item.size, item.size / 2, Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();
        } else if (effect === "HEART") {
          // Vẽ hình trái tim
          ctx.beginPath();
          const topCurveHeight = item.size * 0.3;
          ctx.moveTo(0, topCurveHeight);
          ctx.bezierCurveTo(
            0,
            0,
            -item.size / 2,
            0,
            -item.size / 2,
            topCurveHeight
          );
          ctx.bezierCurveTo(
            -item.size / 2,
            (item.size + topCurveHeight) / 2,
            0,
            item.size,
            0,
            item.size * 1.2
          );
          ctx.bezierCurveTo(
            0,
            item.size,
            item.size / 2,
            (item.size + topCurveHeight) / 2,
            item.size / 2,
            topCurveHeight
          );
          ctx.bezierCurveTo(item.size / 2, 0, 0, 0, 0, topCurveHeight);
          ctx.fill();
        } else if (effect === "SNOW") {
          // Vẽ bông tuyết
          ctx.beginPath();
          ctx.arc(0, 0, item.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Vẽ bóng bay
          ctx.beginPath();
          ctx.ellipse(0, 0, item.size * 0.8, item.size, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Update position
        item.y += item.speedY;
        item.x += item.speedX;
        item.rotation += item.rotationSpeed;

        if (item.y > height + 20) {
          item.y = -20;
          item.x = Math.random() * width;
        }
        if (item.x > width + 20) item.x = -20;
        if (item.x < -20) item.x = width + 20;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect]);

  if (effect === "NONE" || effect === "CONFETTI") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
};
