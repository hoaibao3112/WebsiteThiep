"use client";
import { CalendarDays, Timer, MapPin, Phone, UserCheck, Images, UserRound, Gift, Mail } from "lucide-react";
import { useEditor } from "../EditorContext";
import type { WidgetType } from "@/types/canvas.types";

const widgets = [
  { type: "calendar", label: "Lịch", icon: CalendarDays },
  { type: "countdown", label: "Đếm ngược", icon: Timer },
  { type: "map", label: "Bản đồ", icon: MapPin },
  { type: "contact", label: "Liên hệ", icon: Phone },
  { type: "rsvp", label: "Xác nhận tham dự", icon: UserCheck },
  { type: "album", label: "Album ảnh", icon: Images },
  { type: "guest-name", label: "Tên khách mời", icon: UserRound },
  { type: "gift", label: "QR Box", icon: Gift },
  { type: "envelope", label: "Hiệu ứng phong bì thư", icon: Mail },
] satisfies Array<{ type: WidgetType; label: string; icon: typeof CalendarDays }>;

export function WidgetTool() {
  const { addWidgetElement } = useEditor();
  return <div className="flex flex-col gap-4">
    <p className="text-xs text-stone-500">Chọn tiện ích để thêm vào thiệp, sau đó chỉnh nội dung ở bảng thuộc tính.</p>
    <div className="grid grid-cols-2 gap-2">
      {widgets.map(({ type, label, icon: Icon }) => <button key={type} type="button" onClick={() => addWidgetElement(type)} className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-lg border border-stone-200 bg-white p-3 text-xs text-stone-700 hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2"><Icon className="size-5" /><span>{label}</span></button>)}
    </div>
  </div>;
}
