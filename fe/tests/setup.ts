import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { createElement } from "react";
import type { ReactNode } from "react";

// ─── Mock Next.js navigation ───
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({ cardId: "demo-card-1" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// ─── Mock Next.js Link — plain string mock, no JSX in .ts ───
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string; [key: string]: unknown }) =>
    createElement("a", { href, ...props }, children),
}));

// ─── Mock canvas-confetti ───
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

// ─── Mock framer-motion (no animations in tests) ───
const motionComponentCache: Record<string, any> = {};
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!motionComponentCache[tag]) {
          const Comp = ({ children, initial: _initial, animate: _animate, exit: _exit,
            transition: _transition, whileHover: _whileHover, whileTap: _whileTap,
            layout: _layout, ...props }: { children: ReactNode; [key: string]: unknown }) =>
            createElement(tag, props, children);
          Comp.displayName = `motion.${tag}`;
          motionComponentCache[tag] = Comp;
        }
        return motionComponentCache[tag];
      },
    }
  ),
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));

import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// ─── Mock ApiClient ───
vi.mock("@/lib/api", () => ({
  ApiClient: {
    request: vi.fn().mockResolvedValue({ success: false }),
    getEnvelopeStyles: vi.fn().mockResolvedValue({ success: true, data: [] }),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  },
}));

// ─── Mock WeddingView / BirthdayView / NewbornView (heavy SVG) ───
vi.mock("@/components/wedding/WeddingView", () => ({
  WeddingView: () => null,
}));
vi.mock("@/components/birthday/BirthdayView", () => ({
  BirthdayView: () => null,
}));
vi.mock("@/components/newborn/NewbornView", () => ({
  NewbornView: () => null,
}));

// ─── Mock URL.createObjectURL ───
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

// ─── Mock HTMLMediaElement.play / pause ───
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(),
});

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
