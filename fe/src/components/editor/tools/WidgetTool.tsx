"use client";

import {
  CalendarDays,
  Timer,
  MapPin,
  Phone,
  UserCheck,
  Images,
  UserRound,
  Gift,
  Mail,
  Clock,
  Palette,
  Heart,
  UtensilsCrossed,
} from "lucide-react";
import { useEditor } from "../EditorContext";
import type { WidgetType } from "@/types/canvas.types";

interface WidgetItem {
  type: WidgetType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const widgets: WidgetItem[] = [
  { type: "timeline", label: "Lịch trình ngày cưới", desc: "Mốc giờ đón dâu, làm lễ, tiệc mừng", icon: Clock },
  { type: "dress-code", label: "Gợi ý trang phục", desc: "Bảng màu dress code gợi ý", icon: Palette },
  { type: "love-story", label: "Chuyện tình yêu", desc: "Cột mốc từ quen đến chung đôi", icon: Heart },
  { type: "menu", label: "Thực đơn tiệc", desc: "Menu món khai vị, món chính", icon: UtensilsCrossed },
  { type: "calendar", label: "Lịch ngày cưới", desc: "Hiển thị ngày tháng tổ chức", icon: CalendarDays },
  { type: "countdown", label: "Đếm ngược ngày cưới", desc: "Đồng hồ đếm ngược từng giây", icon: Timer },
  { type: "map", label: "Bản đồ & Chỉ đường", desc: "Địa chỉ và nút Google Maps", icon: MapPin },
  { type: "rsvp", label: "Xác nhận tham dự", desc: "Form khách gửi phản hồi dự tiệc", icon: UserCheck },
  { type: "gift", label: "Hộp mừng cưới / QR", desc: "Mã QR nhận lời chúc mừng", icon: Gift },
  { type: "album", label: "Album ảnh cưới", desc: "Bộ sưu tập ảnh kỷ niệm", icon: Images },
  { type: "contact", label: "Số điện thoại liên hệ", desc: "Gọi trực tiếp cho gia đình", icon: Phone },
  { type: "envelope", label: "Hiệu ứng phong bì thư", desc: "Mở bao thư tương tác", icon: Mail },
  { type: "guest-name", label: "Tên khách mời", desc: "Cá nhân hóa theo từng khách", icon: UserRound },
];

export function WidgetTool() {
  const { addWidgetElement } = useEditor();

  return (
    <div className="flex flex-col gap-3.5 select-none">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Tiện Ích Đám Cưới
        </h3>
        <p className="text-[11px] text-stone-400">
          Chạm để thêm tiện ích thông minh vào thiệp, sau đó tùy chỉnh tại bảng thuộc tính.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {widgets.map(({ type, label, desc, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addWidgetElement(type)}
            className="flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2.5 text-center transition cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 hover:shadow-2xs active:scale-98 group"
          >
            <div className="size-8 rounded-lg bg-stone-50 group-hover:bg-amber-100/70 flex items-center justify-center text-stone-700 group-hover:text-amber-900 transition-colors">
              <Icon className="size-4.5" />
            </div>
            <span className="text-xs font-semibold text-stone-800 line-clamp-1">{label}</span>
            <span className="text-[10px] text-stone-400 line-clamp-1">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
