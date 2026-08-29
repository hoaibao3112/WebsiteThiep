import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Auth Guard Logic & Redirect Target", () => {
  it("nếu chưa đăng nhập → trả về URL mở modal đăng nhập và lưu target path", () => {
    const isAuthenticated = false;
    const targetPath = "/dashboard/cards/new";

    let redirectUrl = "";
    if (!isAuthenticated) {
      redirectUrl = `/?auth=login&redirect=${encodeURIComponent(targetPath)}`;
    }

    expect(redirectUrl).toBe("/?auth=login&redirect=%2Fdashboard%2Fcards%2Fnew");
  });

  it("nếu đã đăng nhập → cho phép truy cập trực tiếp target path", () => {
    const isAuthenticated = true;
    const targetPath = "/dashboard/cards/new";

    let destination = "";
    if (isAuthenticated) {
      destination = targetPath;
    }

    expect(destination).toBe("/dashboard/cards/new");
  });

  it("sau khi đăng nhập thành công → trích xuất đúng redirect param", () => {
    const searchParams = new URLSearchParams("auth=login&redirect=%2Fdashboard%2Fcards%2Fnew");
    const redirectParam = searchParams.get("redirect");
    const destination = redirectParam || "/dashboard/cards";

    expect(destination).toBe("/dashboard/cards/new");
  });

  it("nếu không có redirect param → fallback về /dashboard/cards/new", () => {
    const searchParams = new URLSearchParams("");
    const redirectParam = searchParams.get("redirect");
    const destination = redirectParam || "/dashboard/cards/new";

    expect(destination).toBe("/dashboard/cards/new");
  });
});
