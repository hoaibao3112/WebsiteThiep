/**
 * Tiện ích tải ảnh về máy hoạt động đa nền tảng (Mobile & Desktop).
 * Hỗ trợ fetch Blob trực tiếp để tải thẳng về thư viện ảnh / thư mục Downloads.
 * Tự động dự phòng (fallback) nếu gặp hạn chế CORS trên domain ngoài.
 */
export async function downloadImage(
  url: string,
  preferredFilename = "anh-cuoi.jpg"
): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Fetch failed");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = preferredFilename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch {
    // Dự phòng khi trình duyệt chặn CORS (ảnh từ CDN ngoài không cho fetch blob):
    try {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.download = preferredFilename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return true;
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }
  }
}
