import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";

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
  default: ({ children, href, ...props }: { children: unknown; href: string; [key: string]: unknown }) =>
    Object.assign(document.createElement("a"), { href }),
}));

// ─── Mock canvas-confetti ───
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

// ─── Mock framer-motion (no animations in tests) ───
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        ({ children, ...props }: { children: unknown; [key: string]: unknown }) =>
          ({ type: tag, props: { children, ...props } }),
    }
  ),
  AnimatePresence: ({ children }: { children: unknown }) => children,
}));

// ─── Mock ApiClient ───
vi.mock("@/lib/api", () => ({
  ApiClient: {
    request: vi.fn().mockResolvedValue({ success: false }),
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
