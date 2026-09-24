export type WidgetType = "calendar" | "countdown" | "map" | "contact" | "rsvp" | "album" | "guest-name" | "gift" | "envelope";
export type CanvasWidgetType = WidgetType;

export interface WidgetConfig {
  title?: string;
  description?: string;
  buttonLabel?: string;
  eventDate?: string;
  url?: string;
  phone?: string;
  showTitle?: boolean;
}
export type CanvasWidgetConfig = WidgetConfig;

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
  shapeType?: "line" | "rect" | "circle" | "corner" | "square" | "triangle";
  presetId?: string;
  stockId?: string;
  svgContent?: string;
  svgType?: "frame" | "divider" | "custom";
  imageUrl?: string;
  title?: string;
  rotation?: number;
  animation?: string;
  loopAnimation?: string;
  linkUrl?: string;
  flipX?: boolean;
  flipY?: boolean;
  widgetType?: WidgetType;
  widgetConfig?: WidgetConfig;
}
