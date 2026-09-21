import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware
 *
 * Lưu ý: Việc xác thực và bảo vệ route /dashboard/* được thực hiện chuyên sâu
 * bởi DashboardAuthGuard trong (dashboard)/layout.tsx (tương thích cross-domain
 * giữa Vercel FE và Render BE, hỗ trợ cả sessionStorage Bearer token và HTTPS credentials cookie).
 */
export function middleware(request: NextRequest) {
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
