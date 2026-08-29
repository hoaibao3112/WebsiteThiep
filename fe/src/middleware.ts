import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware — bảo vệ các route trong /dashboard
 *
 * Logic:
 * - Nếu user vào /dashboard/* mà chưa có auth_token → redirect về / với query ?auth=login
 * - Frontend sẽ đọc query này và tự động mở modal đăng nhập
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ bảo vệ route /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth_token")?.value;

    // Fallback: đọc từ header (một số browser không dùng cookie)
    const authHeader = request.headers.get("authorization");
    const hasAuth = token || authHeader?.startsWith("Bearer ");

    if (!hasAuth) {
      // Redirect về trang chủ với signal mở modal login
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("auth", "login");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
