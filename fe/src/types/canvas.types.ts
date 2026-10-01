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
  | "swan-ceremony";
export type CanvasWidgetType = WidgetType;

export interface WidgetConfig {
  title?: string;
  description?: string;
  buttonLabel?: string;
  eventDate?: string;
  url?: string;
  phone?: string;
  showTitle?: boolean;
  // Extended custom properties for ceremony / route / lace card
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
