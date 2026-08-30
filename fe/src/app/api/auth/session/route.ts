import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

/**
 * POST /api/auth/session
 * Nhận JWT token từ frontend → set HTTPOnly cookie (không thể đọc bằng JS)
 * Đây là cách duy nhất để bảo vệ JWT khỏi XSS attacks
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Token không hợp lệ" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,            // JS không thể đọc — ngăn XSS
      secure: process.env.NODE_ENV === "production", // Chỉ HTTPS trên production
      sameSite: "lax",           // Bảo vệ CSRF cơ bản
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/session
 * Xóa HTTPOnly cookie khi user logout
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
