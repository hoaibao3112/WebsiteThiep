import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const guestCode = searchParams.get("g");

    // Cho phép truyền trực tiếp thông tin từ Dashboard để preview nhanh
    let guestName = searchParams.get("guest") || "";
    let coupleNames = searchParams.get("couple") || "";
    let dateText = searchParams.get("date") || "";
    let venueText = searchParams.get("venue") || "";
    let coverPhoto = searchParams.get("bg") || "";

    // Nếu có slug và chưa có đủ thông tin, thử lấy từ Backend
    if (slug && (!guestName || !coupleNames)) {
      try {
        const queryUrl = `${API_BASE_URL}/cards/by-slug/${encodeURIComponent(slug)}${
          guestCode ? `?g=${encodeURIComponent(guestCode)}` : ""
        }`;
        const res = await fetch(queryUrl, {
          signal: AbortSignal.timeout(4000),
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.card) {
            const card = json.data.card;
            const catData = card.categoryData || {};
            const groom = catData.groom?.fullName || catData.groom?.shortName || "Chú Rể";
            const bride = catData.bride?.fullName || catData.bride?.shortName || "Cô Dâu";
            if (!coupleNames) coupleNames = `${groom.toUpperCase()} & ${bride.toUpperCase()}`;

            if (!coverPhoto && card.photos?.[0]?.url) {
              coverPhoto = card.photos[0].url;
            }

            if (!dateText && card.events?.[0]?.eventDate) {
              const d = new Date(card.events[0].eventDate);
              dateText = `Ngày ${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
            }

            if (!venueText && card.events?.[0]?.venueName) {
              venueText = card.events[0].venueName;
            }

            // Nếu có thông tin khách mời từ token
            if (json.data.guestInfo && !guestName) {
              const gInfo = json.data.guestInfo;
              const salutation = gInfo.salutation ? `${gInfo.salutation} ` : "";
              guestName = `${salutation}${gInfo.fullName}`;
            }
          }
        }
      } catch (err) {
        console.warn("[OG Card] Fetch backend failed, using defaults:", err);
      }
    }

    // Giá trị dự phòng sang trọng
    if (!coupleNames) coupleNames = "HOÀNG NAM & MAI LAN";
    if (!guestName) guestName = "Quý Khách & Người Thương";
    if (!dateText) dateText = "Ngày Chung Đôi Hạnh Phúc";
    if (!venueText) venueText = "Trung Tâm Tiệc Cưới";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1F0F12",
            backgroundImage:
              "radial-gradient(circle at 50% 30%, #3D171E 0%, #1B0A0D 70%, #120608 100%)",
            position: "relative",
            padding: "36px",
            boxSizing: "border-box",
            fontFamily: "serif",
          }}
        >
          {/* Nẹp viền đôi vàng champagne trang nhã */}
          <div
            style={{
              position: "absolute",
              inset: "20px",
              border: "2px solid rgba(212, 175, 55, 0.65)",
              borderRadius: "24px",
              display: "flex",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "26px",
              border: "1px dashed rgba(212, 175, 55, 0.3)",
              borderRadius: "20px",
              display: "flex",
              pointerEvents: "none",
            }}
          />

          {/* Họa tiết 4 góc vàng kim */}
          <div
            style={{
              position: "absolute",
              top: "32px",
              left: "36px",
              color: "#D4AF37",
              fontSize: "18px",
              display: "flex",
            }}
          >
            ✦
          </div>
          <div
            style={{
              position: "absolute",
              top: "32px",
              right: "36px",
              color: "#D4AF37",
              fontSize: "18px",
              display: "flex",
            }}
          >
            ✦
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              left: "36px",
              color: "#D4AF37",
              fontSize: "18px",
              display: "flex",
            }}
          >
            ✦
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              right: "36px",
              color: "#D4AF37",
              fontSize: "18px",
              display: "flex",
            }}
          >
            ✦
          </div>

          {/* Khung nội dung thiệp mời chính */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              maxWidth: "1020px",
              width: "100%",
              position: "relative",
            }}
          >
            {/* Lời mở đầu */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#D4AF37",
                fontSize: "19px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              <span>✦</span>
              <span>TRÂN TRỌNG KÍNH MỜI</span>
              <span>✦</span>
            </div>

            {/* Tên khách mời nổi bật */}
            <div
              style={{
                color: "#FFFFFF",
                fontSize: "50px",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "14px",
                maxWidth: "920px",
                textShadow: "0 3px 14px rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {guestName}
            </div>

            {/* Họa tiết dải phân cách */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                color: "#C5A059",
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "1px",
                  backgroundColor: "rgba(212, 175, 55, 0.4)",
                  display: "flex",
                }}
              />
              <span>ĐẾN DỰ LỄ THÀNH HÔN CỦA</span>
              <div
                style={{
                  width: "60px",
                  height: "1px",
                  backgroundColor: "rgba(212, 175, 55, 0.4)",
                  display: "flex",
                }}
              />
            </div>

            {/* Tên cô dâu chú rể */}
            <div
              style={{
                color: "#F6E4C4",
                fontSize: "36px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "18px",
                display: "flex",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {coupleNames}
            </div>

            {/* Ngày cưới & Địa điểm */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                borderRadius: "999px",
                padding: "8px 24px",
                color: "#E2D3BE",
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              <span>{dateText}</span>
              <span style={{ color: "#D4AF37" }}>•</span>
              <span>{venueText}</span>
            </div>

            {/* Nhắc nhở bấm mở thiệp */}
            <div
              style={{
                color: "#BCAAA4",
                fontSize: "15px",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>💌</span>
              <span>Chạm vào tin nhắn để mở thiệp & gửi lời chúc mừng</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("[OG Route] Error rendering image:", error);
    return new Response(`Failed to generate OG image: ${error?.message || "Unknown error"}`, {
      status: 500,
    });
  }
}
