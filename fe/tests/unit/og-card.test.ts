import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/og/card/route";

describe("OpenGraph Personalized Wedding Card Route (/api/og/card)", () => {
  it("renders a 200 ImageResponse with customized guest and couple details", async () => {
    const req = new NextRequest(
      "https://cardvite.vn/api/og/card?guest=Anh%20Nguy%E1%BB%85n%20V%C4%83n%20Tu%E1%BA%A5n&couple=HO%C3%80NG%20NAM%20%26%20MAI%20LAN&date=25.10.2026&venue=White%20Palace"
    );

    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    expect(res.headers.get("cache-control")).toContain("public");
  });

  it("handles fallback gracefully when query params are missing", async () => {
    const req = new NextRequest("https://cardvite.vn/api/og/card");

    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });
});
