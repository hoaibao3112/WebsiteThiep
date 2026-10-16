import { NextRequest, NextResponse } from "next/server";

const SYSTEM_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "websitethiep.com",
  "websitethiep.vn",
  "zenlove.me",
  "vercel.app",
];

function isCustomDomain(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.split(":")[0].toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return false;
  return !SYSTEM_DOMAINS.some(
    (sys) => host === sys || host.endsWith(`.${sys}`)
  );
}

/**
 * Next.js Middleware
 *
 * 1. Định tuyến tên miền riêng (Custom Domain) sang /thiep-domain/:domain/:path
 * 2. Thiết lập các Security Headers chuẩn
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const pathname = request.nextUrl.pathname;

  // Nếu là Custom Domain (VD: damcuoilongngoc.com hoặc wedding.longngoc.vn)
  // và không phải file tĩnh / API nội bộ
  if (isCustomDomain(host) && !pathname.startsWith("/api") && !pathname.startsWith("/thiep-domain")) {
    const cleanHost = (host || "").split(":")[0].toLowerCase();
    const rewriteUrl = new URL(`/thiep-domain/${cleanHost}${pathname}${request.nextUrl.search}`, request.url);
    const response = NextResponse.rewrite(rewriteUrl);

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|images|icons|music).*)",
  ],
};
