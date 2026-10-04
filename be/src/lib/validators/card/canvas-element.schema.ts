import { z } from "zod";
import { sanitizeSvg } from "../../sanitize-svg";

export const StoredImageUrlSchema = z.string().refine(
  (value) =>
    /^https?:\/\//i.test(value) ||
    value.startsWith("data:image/") ||
    value.startsWith("/uploads/") ||
    value.startsWith("/images/") ||
    (value.startsWith("/") && !value.startsWith("//")),
  "Ảnh không hợp lệ hoặc chưa được tải lên máy chủ"
);

export const CanvasElementSchema = z
  .object({
    id: z.string(),
    type: z.enum(["text", "image", "shape", "sticker", "preset", "widget", "stock"]),
    content: z.string().default(""),
    x: z.number().min(-2000).max(10000), // Tọa độ X (px) - giới hạn hợp lý
    y: z.number().min(-2000).max(100000), // Tọa độ Y (px) - giới hạn hợp lý
    width: z.number().min(0).max(10000), // Chiều rộng (px)
    height: z.number().min(0).max(100000), // Chiều cao (px)
    rotation: z.number().min(-360).max(360).default(0), // Góc xoay độ (-360 đến 360)
    zIndex: z.number().default(1), // Thứ tự lớp hiển thị
    // Styling & Typography
    fontSize: z.number().min(1).max(500).optional(),
    fontFamily: z.string().max(100).optional(),
    color: z.string().max(100).optional(),
    backgroundColor: z.string().max(100).optional(),
    opacity: z.number().min(0).max(1).optional(),
    textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
    isBold: z.boolean().optional(),
    isItalic: z.boolean().optional(),
    isUnderline: z.boolean().optional(),
    isStrike: z.boolean().optional(),
    isUppercase: z.boolean().optional(),
    letterSpacing: z.number().optional(),
    lineHeight: z.number().optional(),
    padding: z.number().optional(),
    borderRadius: z.number().min(0).max(1000).optional(),
    borderWidth: z.number().min(0).max(100).optional(),
    borderColor: z.string().max(100).optional(),
    shadow: z.string().optional(),
    isLocked: z.boolean().optional(),
    userEdited: z.boolean().optional(),
    bindingDetached: z.boolean().optional(),
    shapeType: z.enum([
      "line",
      "rect",
      "circle",
      "corner",
      "square",
      "triangle",
      "arch",
      "heart",
      "star",
      "diamond",
      "hexagon",
      "oval",
      "ribbon",
      "wavy-line",
      "dashed-line",
      "flourish-line",
    ]).optional(),
    presetId: z.string().optional(),
    stockId: z.string().optional(),
    svgContent: z.string().transform((svg) => (svg ? sanitizeSvg(svg) : svg)).optional(),
    svgType: z.enum(["frame", "divider", "custom"]).optional(),
    imageUrl: z.union([StoredImageUrlSchema, z.literal("")]).optional(),
    title: z.string().max(500).optional(),
    animation: z.string().optional(),
    animationDelay: z.number().min(0).max(60000).optional(),
    animationDuration: z.number().min(0).max(60000).optional(),
    loopAnimation: z.string().optional(),
    loopDuration: z.number().min(0).max(60000).optional(),
    linkUrl: z.string().refine((url) => {
      if (!url) return true;
      return /^(https?:\/\/|tel:|mailto:)/i.test(url);
    }, "linkUrl chỉ cho phép giao thức http, https, tel hoặc mailto").optional(),
    // Đối xứng (Flip)
    flipX: z.boolean().optional(),
    flipY: z.boolean().optional(),
    widgetType: z.enum([
      "calendar",
      "countdown",
      "map",
      "contact",
      "rsvp",
      "album",
      "guest-name",
      "gift",
      "envelope",
      "timeline",
      "dress-code",
      "love-story",
      "menu",
      "procession-route",
      "lace-vow-card",
      "swan-ceremony",
      "embed-video",
      "carousel",
      "background-video",
      "custom-form",
      "reminder",
      "guest-signature",
    ]).optional(),
    customData: z.record(z.string().max(2000)).optional(),
    widgetConfig: z.object({
      // --- Common fields ---
      title: z.string().max(160).optional(),
      description: z.string().max(1_000).optional(),
      buttonLabel: z.string().max(80).optional(),
      eventDate: z.string().max(80).optional(),
      url: z.string().max(2_000).optional(),
      phone: z.string().max(30).optional(),
      showTitle: z.boolean().optional(),

      // --- Calendar extended ---
      lunarDate: z.string().max(100).optional(),
      showLunarDate: z.boolean().optional(),
      highlightColor: z.string().max(20).optional(),
      calendarStyle: z.enum(["classic", "circle", "minimal", "full-month"]).optional(),
      showDayOfWeek: z.boolean().optional(),
      showAddToCalendar: z.boolean().optional(),
      firstDayOfWeek: z.enum(["mon", "sun"]).optional(),

      // --- Countdown extended ---
      countdownStyle: z.enum(["flip-clock", "circle-ring", "simple-text", "elegant-box"]).optional(),
      showSeconds: z.boolean().optional(),
      showLabels: z.boolean().optional(),
      labelLanguage: z.enum(["vi", "en", "zh"]).optional(),
      endMessage: z.string().max(200).optional(),
      endAction: z.enum(["show-message", "hide", "confetti"]).optional(),
      numberColor: z.string().max(20).optional(),
      labelColor: z.string().max(20).optional(),
      separatorStyle: z.enum(["colon", "dot", "none"]).optional(),

      // --- Map extended ---
      mapDisplayMode: z.enum(["static-image", "embed-iframe", "directions-only"]).optional(),
      locations: z.array(z.object({
        id: z.string(),
        label: z.string().max(120),
        address: z.string().max(500),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
        mapUrl: z.string().max(2_000).optional(),
        icon: z.enum(["home", "church", "restaurant", "hotel", "pin"]).optional(),
      }).passthrough()).max(5).optional(),
      showDirectionButton: z.boolean().optional(),
      directionButtonText: z.string().max(50).optional(),
      mapZoom: z.number().int().min(10).max(20).optional(),
      mapHeight: z.number().int().min(150).max(500).optional(),

      // --- Guest Name extended ---
      salutationPrefix: z.string().max(50).optional(),
      salutationSuffix: z.string().max(100).optional(),
      fallbackName: z.string().max(100).optional(),
      showSalutation: z.boolean().optional(),
      nameStyle: z.enum(["elegant", "simple", "calligraphy", "framed"]).optional(),
      nameFontFamily: z.string().max(100).optional(),
      nameFontSize: z.number().min(12).max(72).optional(),
      nameColor: z.string().max(20).optional(),
      showGroup: z.boolean().optional(),

      // --- Gift QR extended ---
      displayMode: z.enum(["popup-modal", "inline", "floating-button"]).optional(),
      showGroomTab: z.boolean().optional(),
      showBrideTab: z.boolean().optional(),
      groomTabLabel: z.string().max(50).optional(),
      brideTabLabel: z.string().max(50).optional(),
      thankYouMessage: z.string().max(500).optional(),
      qrStyle: z.enum(["vietqr-standard", "custom-frame", "minimal"]).optional(),
      showCopyButton: z.boolean().optional(),
      showBankLogo: z.boolean().optional(),
      animationOnOpen: z.enum(["none", "confetti", "hearts", "sparkle"]).optional(),

      // --- Embed Video ---
      videoSource: z.enum(["youtube", "vimeo", "tiktok", "upload", "direct-url"]).optional(),
      videoUrl: z.string().max(2_000).optional(),
      videoId: z.string().max(100).optional(),
      thumbnailUrl: z.string().max(2_000).optional(),
      autoPlay: z.boolean().optional(),
      muted: z.boolean().optional(),
      loop: z.boolean().optional(),
      showControls: z.boolean().optional(),
      aspectRatio: z.enum(["16:9", "9:16", "4:3", "1:1", "auto"]).optional(),
      maxWidth: z.number().int().min(200).max(800).optional(),
      playButtonStyle: z.enum(["center-circle", "bottom-bar", "minimal", "none"]).optional(),
      caption: z.string().max(500).optional(),

      // --- Carousel ---
      slides: z.array(z.object({
        id: z.string(),
        imageUrl: z.string().max(2_000),
        thumbUrl: z.string().max(2_000).optional(),
        caption: z.string().max(200).optional(),
        linkUrl: z.string().max(2_000).optional(),
        sortOrder: z.number().int().default(0),
      })).max(30).optional(),
      autoPlayInterval: z.number().int().min(1).max(30).optional(),
      showArrows: z.boolean().optional(),
      showDots: z.boolean().optional(),
      showCaption: z.boolean().optional(),
      slidesPerView: z.number().int().min(1).max(5).optional(),
      spaceBetween: z.number().int().min(0).max(50).optional(),
      transitionEffect: z.enum(["slide", "fade", "coverflow", "flip", "creative"]).optional(),
      swipeable: z.boolean().optional(),
      pauseOnHover: z.boolean().optional(),
      clickToEnlarge: z.boolean().optional(),

      // --- Album extended ---
      albumDisplayMode: z.enum(["3d-flip-book", "masonry-grid", "horizontal-scroll", "lightbox-grid", "slideshow"]).optional(),
      columns: z.number().int().min(2).max(4).optional(),
      gap: z.number().int().min(0).max(20).optional(),
      lightboxEnabled: z.boolean().optional(),
      showCounter: z.boolean().optional(),
      maxPhotosDisplay: z.number().int().min(4).max(50).optional(),
      showViewAll: z.boolean().optional(),
      albumTransitionEffect: z.enum(["fade", "slide", "zoom", "flip"]).optional(),

      // --- RSVP Widget (form inline) ---
      rsvpTitle: z.string().max(160).optional(),
      rsvpSubtitle: z.string().max(300).optional(),
      rsvpDeadline: z.string().max(80).optional(),
      rsvpFormStyle: z.enum(["classic", "transparent", "elegant", "minimal"]).optional(),
      rsvpShowGuestCount: z.boolean().optional(),
      rsvpShowSide: z.boolean().optional(),
      rsvpShowNote: z.boolean().optional(),
      rsvpShowPhone: z.boolean().optional(),
      rsvpRequirePhone: z.boolean().optional(),
      rsvpButtonText: z.string().max(80).optional(),
      rsvpButtonColor: z.string().max(20).optional(),
      rsvpSuccessMessage: z.string().max(500).optional(),
      rsvpAttendingLabel: z.string().max(50).optional(),
      rsvpDeclinedLabel: z.string().max(50).optional(),

      // --- Contact Widget (multi-channel) ---
      contactTitle: z.string().max(160).optional(),
      contactSubtitle: z.string().max(300).optional(),
      contactStyle: z.enum(["buttons-row", "buttons-grid", "list", "floating-fab", "card-style"]).optional(),
      contactChannels: z.array(z.object({
        id: z.string(),
        type: z.enum(["phone", "zalo", "messenger", "whatsapp", "email", "telegram", "viber", "line"]),
        label: z.string().max(80),
        value: z.string().max(200),
        enabled: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
        buttonColor: z.string().max(20).optional(),
      })).max(8).optional(),
      contactButtonSize: z.enum(["sm", "md", "lg"]).optional(),
      contactShowLabel: z.boolean().optional(),

      // --- Custom Form Widget ---
      customFormTitle: z.string().max(160).optional(),
      customFormSubtitle: z.string().max(300).optional(),
      customFormFields: z.array(z.object({
        id: z.string(),
        type: z.enum(["text", "textarea", "select", "radio", "checkbox", "rating", "number", "phone", "email", "signature"]),
        label: z.string().max(120),
        placeholder: z.string().max(120).optional(),
        required: z.boolean().default(false),
        options: z.array(z.string().max(100)).max(20).optional(),
        maxLength: z.number().int().min(1).max(5000).optional(),
        sortOrder: z.number().int().default(0),
      })).max(20).optional(),
      customFormButtonText: z.string().max(80).optional(),
      customFormButtonColor: z.string().max(20).optional(),
      customFormStyle: z.enum(["classic", "transparent", "elegant", "minimal"]).optional(),
      customFormSuccessMessage: z.string().max(500).optional(),
      customFormAllowMultipleSubmit: z.boolean().optional(),

      // --- Reminder Widget (Add to Calendar) ---
      reminderTitle: z.string().max(160).optional(),
      reminderDescription: z.string().max(300).optional(),
      reminderEventTitle: z.string().max(160).optional(),
      reminderEventDescription: z.string().max(1000).optional(),
      reminderEventLocation: z.string().max(500).optional(),
      reminderEventDate: z.string().max(80).optional(),
      reminderDurationMinutes: z.number().int().min(30).max(1440).optional(),
      reminderStyle: z.enum(["button-row", "single-button", "card"]).optional(),
      reminderButtonText: z.string().max(80).optional(),
      reminderShowGoogle: z.boolean().optional(),
      reminderShowApple: z.boolean().optional(),
      reminderShowOutlook: z.boolean().optional(),
      reminderButtonColor: z.string().max(20).optional(),

      // --- Guest Signature Widget ---
      signatureTitle: z.string().max(160).optional(),
      signatureSubtitle: z.string().max(300).optional(),
      signatureInstructions: z.string().max(200).optional(),
      signatureCanvasColor: z.string().max(20).optional(),
      signaturePenColor: z.string().max(20).optional(),
      signaturePenWidth: z.number().int().min(1).max(10).optional(),
      signatureStyle: z.enum(["polaroid", "envelope", "elegant-card", "chalkboard", "minimal"]).optional(),
      signatureRequireName: z.boolean().optional(),
      signatureRequireMessage: z.boolean().optional(),
      signatureMaxMessageLength: z.number().int().min(20).max(200).optional(),
      signatureShowGallery: z.boolean().optional(),
      signatureGalleryLimit: z.number().int().min(4).max(50).optional(),
      signatureButtonText: z.string().max(80).optional(),
      signatureSubmitText: z.string().max(80).optional(),
      signatureClearText: z.string().max(50).optional(),
    }).passthrough().optional(),
    updatedAt: z.string().optional(),
  }).passthrough();

export type CanvasElement = z.infer<typeof CanvasElementSchema>;

export const PatchElementBodySchema = CanvasElementSchema.partial().extend({
  expectedUpdatedAt: z.union([z.string(), z.date()]).optional(),
  version: z.number().int().optional(),
});

export type PatchElementBody = z.infer<typeof PatchElementBodySchema>;

export const CanvasDocumentSchema = z
  .object({
    width: z.number().default(420),
    height: z.number().default(720),
    backgroundColor: z.string().default("#FFFFFF"),
    backgroundPattern: z.string().default("none"),
    fallingEffect: z.string().default("none"),
    elements: z.array(CanvasElementSchema).max(300).default([]),
  })
  .passthrough();

export type CanvasDocument = z.infer<typeof CanvasDocumentSchema>;


