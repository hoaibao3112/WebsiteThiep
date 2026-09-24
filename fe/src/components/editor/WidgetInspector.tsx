"use client";

import type { CanvasElement, CanvasWidgetConfig } from "@/types/canvas.types";
import { useEditor } from "./EditorContext";

export function WidgetInspector({ element }: { element: CanvasElement }) {
  const { updateCanvasElement } = useEditor();
  const config = element.widgetConfig ?? {};
  const update = (patch: Partial<CanvasWidgetConfig>) => updateCanvasElement(element.id, { widgetConfig: { ...config, ...patch } });
  const inputClass = "w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-base outline-stone-500 sm:text-xs";
  return <fieldset disabled={element.isLocked} className="flex flex-col gap-3 border-b border-stone-200 pb-4 disabled:opacity-60">
    <legend className="pb-3 text-sm font-semibold">Nội dung tiện ích</legend>
    <label className="flex items-center gap-2 text-xs"><input name="widgetShowTitle" type="checkbox" checked={config.showTitle !== false} onChange={event => update({ showTitle: event.target.checked })} />Hiển thị tiêu đề</label>
    <label className="flex flex-col gap-1 text-xs">Tiêu đề<input name="widgetTitle" className={inputClass} value={config.title ?? ""} onChange={event => update({ title: event.target.value })} /></label>
    <label className="flex flex-col gap-1 text-xs">Nội dung<textarea name="widgetDescription" className={inputClass} rows={3} value={config.description ?? ""} onChange={event => update({ description: event.target.value })} /></label>
    <label className="flex flex-col gap-1 text-xs">Tên nút<input name="widgetButton" className={inputClass} value={config.buttonLabel ?? ""} onChange={event => update({ buttonLabel: event.target.value })} /></label>
    {(element.widgetType === "countdown" || element.widgetType === "calendar") && <label className="flex flex-col gap-1 text-xs">Ngày giờ tổ chức<input name="widgetEventDate" type="datetime-local" className={inputClass} value={config.eventDate ? config.eventDate.slice(0, 16) : ""} onChange={event => update({ eventDate: event.target.value ? `${event.target.value}:00+07:00` : "" })} /><span className="text-stone-500">Giờ Việt Nam (UTC+7)</span></label>}
    {element.widgetType === "map" && <label className="flex flex-col gap-1 text-xs">Liên kết bản đồ<input name="widgetUrl" type="url" className={inputClass} value={config.url ?? ""} onChange={event => update({ url: event.target.value })} /></label>}
    {element.widgetType === "contact" && <label className="flex flex-col gap-1 text-xs">Số điện thoại<input name="widgetPhone" type="tel" className={inputClass} value={config.phone ?? ""} onChange={event => update({ phone: event.target.value })} /></label>}
    {element.widgetType === "rsvp" && <p className="text-xs leading-5 text-stone-500">Khách gửi xác nhận qua form RSVP của thiệp. Danh sách phản hồi nằm trong mục quản lý khách mời.</p>}
  </fieldset>;
}
