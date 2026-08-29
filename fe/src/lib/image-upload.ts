import { ApiClient } from "./api";

/**
 * Nén ảnh phía client bằng HTMLCanvas để tối ưu dung lượng (tương thích cả iPhone, Android và Laptop)
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Chuyển sang WebP hoặc JPEG chất lượng cao dung lượng nhẹ
        try {
          const dataUrl = canvas.toDataURL("image/webp", quality);
          resolve(dataUrl);
        } catch {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload 1 file ảnh lên server hoặc fallback về compressed Base64
 */
export async function uploadSingleImage(file: File): Promise<string> {
  // 1. Nén ảnh trước
  const compressedBase64 = await compressImage(file);

  // 2. Thử gửi lên backend qua FormData
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await ApiClient.request<{ url: string }>("/media/upload", {
      method: "POST",
      body: formData,
    });

    if (res.success && res.data?.url) {
      // Nếu server trả về relative path "/uploads/..." thì nối với API URL
      if (res.data.url.startsWith("/")) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const origin = apiBase.replace(/\/api\/?$/, "");
        return `${origin}${res.data.url}`;
      }
      return res.data.url;
    }
  } catch (err) {
    console.warn("Upload ảnh lên server thất bại, sử dụng fallback client-side:", err);
  }

  // Fallback an toàn 100% bằng base64 nén siêu nhẹ
  return compressedBase64;
}
