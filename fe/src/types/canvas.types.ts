export type WidgetType =
  | "calendar"
  | "countdown"
  | "map"
  | "contact"
  | "rsvp"
  | "album"
  | "guest-name"
  | "gift"
  | "envelope"
  | "timeline"
  | "dress-code"
  | "love-story"
  | "menu"
  | "procession-route"
  | "lace-vow-card"
  | "swan-ceremony"
  | "embed-video"
  | "carousel"
  | "background-video"
  | "custom-form"
  | "reminder"
  | "guest-signature";
export type CanvasWidgetType = WidgetType;

export interface WidgetConfig {
  // --- Common ---
  title?: string;
  description?: string;
  buttonLabel?: string;
  eventDate?: string;
  url?: string;
  phone?: string;
  showTitle?: boolean;

  // --- Ceremony / Route / Lace card (existing) ---
  groomTitle?: string;
  brideTitle?: string;
  groomDate?: string;
  brideDate?: string;
  groomLunarDate?: string;
  brideLunarDate?: string;
  groomVenue?: string;
  brideVenue?: string;
  groomMapUrl?: string;
  brideMapUrl?: string;
  groomAddress?: string;
  brideAddress?: string;
  groomParents?: string;
  brideParents?: string;
  vowQuote?: string;
  frameStyle?: "royal" | "gold-arch" | "scalloped" | "lotus" | "rose-cottage";
  decorIcon?: "swans" | "car" | "cake" | "wreath" | "rings" | "none";

  // --- Calendar extended ---
  lunarDate?: string;
  showLunarDate?: boolean;
  highlightColor?: string;
  calendarStyle?: "classic" | "circle" | "minimal" | "full-month";
  showDayOfWeek?: boolean;
  showAddToCalendar?: boolean;
  firstDayOfWeek?: "mon" | "sun";

  // --- Countdown extended ---
  countdownStyle?: "flip-clock" | "circle-ring" | "simple-text" | "elegant-box";
  showSeconds?: boolean;
  showLabels?: boolean;
  labelLanguage?: "vi" | "en" | "zh";
  endMessage?: string;
  endAction?: "show-message" | "hide" | "confetti";
  numberColor?: string;
  labelColor?: string;
  separatorStyle?: "colon" | "dot" | "none";

  // --- Map extended ---
  mapDisplayMode?: "static-image" | "embed-iframe" | "directions-only";
  locations?: Array<{
    id: string;
    label: string;
    address: string;
    latitude?: number;
    longitude?: number;
    mapUrl?: string;
    icon?: "home" | "church" | "restaurant" | "hotel" | "pin";
  }>;
  showDirectionButton?: boolean;
  directionButtonText?: string;
  mapZoom?: number;
  mapHeight?: number;

  // --- Guest Name extended ---
  salutationPrefix?: string;
  salutationSuffix?: string;
  fallbackName?: string;
  showSalutation?: boolean;
  nameStyle?: "elegant" | "simple" | "calligraphy" | "framed";
  nameFontFamily?: string;
  nameFontSize?: number;
  nameColor?: string;
  showGroup?: boolean;

  // --- Gift QR extended ---
  displayMode?: "popup-modal" | "inline" | "floating-button";
  showGroomTab?: boolean;
  showBrideTab?: boolean;
  groomTabLabel?: string;
  brideTabLabel?: string;
  thankYouMessage?: string;
  qrStyle?: "vietqr-standard" | "custom-frame" | "minimal";
  showCopyButton?: boolean;
  showBankLogo?: boolean;
  animationOnOpen?: "none" | "confetti" | "hearts" | "sparkle";

  // --- Embed Video ---
  videoSource?: "youtube" | "vimeo" | "tiktok" | "upload" | "direct-url";
  videoUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
  aspectRatio?: "16:9" | "9:16" | "4:3" | "1:1" | "auto";
  maxWidth?: number;
  playButtonStyle?: "center-circle" | "bottom-bar" | "minimal" | "none";
  caption?: string;

  // --- Carousel ---
  slides?: Array<{
    id: string;
    imageUrl: string;
    thumbUrl?: string;
    caption?: string;
    linkUrl?: string;
    sortOrder: number;
  }>;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showCaption?: boolean;
  slidesPerView?: number;
  spaceBetween?: number;
  transitionEffect?: "slide" | "fade" | "coverflow" | "flip" | "creative";
  swipeable?: boolean;
  pauseOnHover?: boolean;
  clickToEnlarge?: boolean;

  // --- Album extended ---
  albumDisplayMode?: "3d-flip-book" | "masonry-grid" | "horizontal-scroll" | "lightbox-grid" | "slideshow";
  columns?: number;
  gap?: number;
  lightboxEnabled?: boolean;
  showCounter?: boolean;
  maxPhotosDisplay?: number;
  showViewAll?: boolean;
  albumTransitionEffect?: "fade" | "slide" | "zoom" | "flip";

  // --- Background Video ---
  enabled?: boolean;
  opacity?: number;
  posterUrl?: string;
  fallbackColor?: string;
  playbackRate?: number;
  overlayColor?: string;
  overlayGradient?: string;

  // --- RSVP Widget (form inline) ---
  rsvpTitle?: string;
  rsvpSubtitle?: string;
  rsvpDeadline?: string;
  rsvpFormStyle?: "classic" | "transparent" | "elegant" | "minimal";
  rsvpShowGuestCount?: boolean;
  rsvpShowSide?: boolean;
  rsvpShowNote?: boolean;
  rsvpShowPhone?: boolean;
  rsvpRequirePhone?: boolean;
  rsvpButtonText?: string;
  rsvpButtonColor?: string;
  rsvpSuccessMessage?: string;
  rsvpAttendingLabel?: string;
  rsvpDeclinedLabel?: string;

  // --- Contact Widget (multi-channel) ---
  contactTitle?: string;
  contactSubtitle?: string;
  contactStyle?: "buttons-row" | "buttons-grid" | "list" | "floating-fab" | "card-style";
  contactChannels?: Array<{
    id: string;
    type: "phone" | "zalo" | "messenger" | "whatsapp" | "email" | "telegram" | "viber" | "line";
    label: string;
    value: string;
    enabled: boolean;
    sortOrder: number;
    buttonColor?: string;
  }>;
  contactButtonSize?: "sm" | "md" | "lg";
  contactShowLabel?: boolean;

  // --- Custom Form Widget ---
  customFormTitle?: string;
  customFormSubtitle?: string;
  customFormFields?: Array<{
    id: string;
    type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating" | "number" | "phone" | "email" | "signature";
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    maxLength?: number;
    sortOrder: number;
  }>;
  customFormButtonText?: string;
  customFormButtonColor?: string;
  customFormStyle?: "classic" | "transparent" | "elegant" | "minimal";
  customFormSuccessMessage?: string;
  customFormAllowMultipleSubmit?: boolean;

  // --- Reminder Widget (Add to Calendar) ---
  reminderTitle?: string;
  reminderDescription?: string;
  reminderEventTitle?: string;
  reminderEventDescription?: string;
  reminderEventLocation?: string;
  reminderEventDate?: string;
  reminderDurationMinutes?: number;
  reminderStyle?: "button-row" | "single-button" | "card";
  reminderButtonText?: string;
  reminderShowGoogle?: boolean;
  reminderShowApple?: boolean;
  reminderShowOutlook?: boolean;
  reminderButtonColor?: string;

  // --- Guest Signature Widget ---
  signatureTitle?: string;
  signatureSubtitle?: string;
  signatureInstructions?: string;
  signatureCanvasColor?: string;
  signaturePenColor?: string;
  signaturePenWidth?: number;
  signatureStyle?: "polaroid" | "envelope" | "elegant-card" | "chalkboard" | "minimal";
  signatureRequireName?: boolean;
  signatureRequireMessage?: boolean;
  signatureMaxMessageLength?: number;
  signatureShowGallery?: boolean;
  signatureGalleryLimit?: number;
  signatureButtonText?: string;
  signatureSubmitText?: string;
  signatureClearText?: string;

  // --- Timeline Widget ---
  timelineTitle?: string;
  timelineEvents?: Array<{ id: string; time: string; label: string }>;

  // --- Dress Code Widget ---
  dressCodeTitle?: string;
  dressCodeDescription?: string;
  dressCodeColors?: Array<{ id: string; name: string; hex: string; border?: string }>;

  // --- Love Story Widget ---
  loveStoryTitle?: string;
  loveStoryMilestones?: Array<{ id: string; year: string; title: string; description?: string }>;

  // --- Menu Widget ---
  menuTitle?: string;
  menuCourses?: Array<{ id: string; type: string; dish: string }>;

  // --- Procession Route Widget ---
  brideMonth?: string;
  brideDay?: string;
  brideYear?: string;
  brideButtonText?: string;
  groomMonth?: string;
  groomDay?: string;
  groomYear?: string;
  groomButtonText?: string;

  // --- Swan Ceremony Widget ---
  ceremonyMonth?: string;
  ceremonyDay?: string;
  ceremonyYear?: string;
}
export type CanvasWidgetConfig = WidgetConfig;

export type ShapeType =
  | "line"
  | "rect"
  | "circle"
  | "corner"
  | "square"
  | "triangle"
  | "arch"
  | "heart"
  | "star"
  | "diamond"
  | "hexagon"
  | "oval"
  | "ribbon"
  | "wavy-line"
  | "dashed-line"
  | "flourish-line";

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape" | "sticker" | "preset" | "stock" | "widget";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  isUppercase?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: string;
  zIndex: number;
  isLocked?: boolean;
  shapeType?: ShapeType;
  presetId?: string;
  stockId?: string;
  svgContent?: string;
  svgType?: "frame" | "divider" | "custom";
  imageUrl?: string;
  title?: string;
  rotation?: number;
  animation?: string;
  animationDelay?: number;
  animationDuration?: number;
  loopAnimation?: string;
  loopDuration?: number;
  linkUrl?: string;
  flipX?: boolean;
  flipY?: boolean;
  widgetType?: WidgetType;
  widgetConfig?: WidgetConfig;
  customData?: Record<string, any>;
}

