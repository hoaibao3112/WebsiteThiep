/**
 * VideoEmbedService — Parse/validate video URLs and generate safe embed URLs.
 * Supports YouTube, Vimeo, TikTok, and direct MP4/WebM URLs.
 * Chống XSS/injection qua URL sanitization.
 */

export interface ParsedVideo {
  source: "youtube" | "vimeo" | "tiktok" | "direct-url";
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
}

// --- REGEX PATTERNS ---
const YOUTUBE_PATTERNS = [
  // youtube.com/watch?v=VIDEO_ID
  /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  // youtu.be/VIDEO_ID
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  // youtube.com/shorts/VIDEO_ID
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  // youtube.com/embed/VIDEO_ID
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  // youtube.com/v/VIDEO_ID
  /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
];

const VIMEO_PATTERN = /(?:vimeo\.com\/)(\d+)/;

const TIKTOK_PATTERN = /(?:tiktok\.com\/@[\w.-]+\/video\/)(\d+)/;

const DIRECT_VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export class VideoEmbedService {
  /**
   * Parse a raw video URL and extract source, videoId, safe embed URL, and thumbnail.
   * Throws on invalid or unsupported URLs.
   */
  static parseVideoUrl(rawUrl: string): ParsedVideo {
    if (!rawUrl || typeof rawUrl !== "string") {
      throw new Error("URL video không được để trống");
    }

    const trimmed = rawUrl.trim();

    // Validate URL format
    try {
      new URL(trimmed);
    } catch {
      throw new Error("URL video không hợp lệ");
    }

    // Block dangerous protocols
    if (!/^https?:\/\//i.test(trimmed)) {
      throw new Error("URL video chỉ cho phép giao thức HTTP hoặc HTTPS");
    }

    // --- YouTube ---
    try {
      const u = new URL(trimmed);
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
        const videoId = u.searchParams.get("v")!;
        if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return {
            source: "youtube",
            videoId,
            embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          };
        }
      }
    } catch {}

    for (const pattern of YOUTUBE_PATTERNS) {
      const match = trimmed.match(pattern);
      if (match?.[1]) {
        const videoId = match[1];
        return {
          source: "youtube",
          videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    }

    // --- Vimeo ---
    const vimeoMatch = trimmed.match(VIMEO_PATTERN);
    if (vimeoMatch?.[1]) {
      const videoId = vimeoMatch[1];
      return {
        source: "vimeo",
        videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0`,
        thumbnailUrl: `https://vumbnail.com/${videoId}.jpg`,
      };
    }

    // --- TikTok ---
    const tiktokMatch = trimmed.match(TIKTOK_PATTERN);
    if (tiktokMatch?.[1]) {
      const videoId = tiktokMatch[1];
      return {
        source: "tiktok",
        videoId,
        embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
        thumbnailUrl: "", // TikTok doesn't have a static thumbnail URL pattern
      };
    }

    // --- Direct video URL (mp4, webm, etc.) ---
    if (DIRECT_VIDEO_EXTENSIONS.test(trimmed)) {
      return {
        source: "direct-url",
        videoId: "",
        embedUrl: trimmed,
        thumbnailUrl: "",
      };
    }

    throw new Error(
      "URL video không được hỗ trợ. Vui lòng sử dụng YouTube, Vimeo, TikTok hoặc link trực tiếp (mp4/webm)."
    );
  }

  /**
   * Validate that a video file upload meets size and format requirements.
   */
  static validateVideoUpload(
    fileSizeBytes: number,
    mimeType: string,
    maxSizeMB: number = 50
  ): { valid: boolean; error?: string } {
    const ALLOWED_MIME_TYPES = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime", // .mov
    ];

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Định dạng video không được hỗ trợ (${mimeType}). Chỉ chấp nhận: MP4, WebM, OGG, MOV.`,
      };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (fileSizeBytes > maxSizeBytes) {
      return {
        valid: false,
        error: `Video quá lớn (${(fileSizeBytes / 1024 / 1024).toFixed(1)}MB). Giới hạn tối đa: ${maxSizeMB}MB.`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate a safe embed URL with sanitized parameters.
   * Prevents parameter injection.
   */
  static generateSafeEmbedUrl(
    source: "youtube" | "vimeo" | "tiktok" | "direct-url",
    videoId: string,
    options?: {
      autoPlay?: boolean;
      muted?: boolean;
      loop?: boolean;
      showControls?: boolean;
    }
  ): string {
    switch (source) {
      case "youtube": {
        const params = new URLSearchParams({
          rel: "0",
          modestbranding: "1",
        });
        if (options?.autoPlay) params.set("autoplay", "1");
        if (options?.muted) params.set("mute", "1");
        if (options?.loop) {
          params.set("loop", "1");
          params.set("playlist", videoId);
        }
        if (options?.showControls === false) params.set("controls", "0");
        return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
      }
      case "vimeo": {
        const params = new URLSearchParams({
          badge: "0",
          autopause: "0",
        });
        if (options?.autoPlay) params.set("autoplay", "1");
        if (options?.muted) params.set("muted", "1");
        if (options?.loop) params.set("loop", "1");
        return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?${params.toString()}`;
      }
      case "tiktok":
        return `https://www.tiktok.com/embed/v2/${encodeURIComponent(videoId)}`;
      default:
        return "";
    }
  }
}
