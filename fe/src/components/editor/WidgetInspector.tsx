"use client";

import type { CanvasElement, CanvasWidgetConfig } from "@/types/canvas.types";
import { useEditor } from "./EditorContext";

export function WidgetInspector({ element }: { element: CanvasElement }) {
  const { updateCanvasElement } = useEditor();
  const config = element.widgetConfig ?? {};
  const update = (patch: Partial<CanvasWidgetConfig>) =>
    updateCanvasElement(element.id, { widgetConfig: { ...config, ...patch } });

  const inputClass =
    "w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs outline-stone-500 focus:border-amber-500";

  return (
    <fieldset disabled={element.isLocked} className="flex flex-col gap-3 border-b border-stone-200 pb-4 disabled:opacity-60">
      <legend className="pb-2 text-sm font-bold text-stone-900">
        {element.widgetType === "procession-route"
          ? "🚗 Lộ trình rước dâu 2 nhà"
          : element.widgetType === "lace-vow-card"
          ? "📜 Thẻ lời ước viền ren"
          : element.widgetType === "swan-ceremony"
          ? "🦢 Lễ tiệc & Thiên nga"
          : "Nội dung tiện ích"}
      </legend>

      {/* ── CÁC TRƯỜNG DÀNH RIÊNG CHO LỘ TRÌNH RƯỚC DÂU ── */}
      {element.widgetType === "procession-route" && (
        <div className="space-y-3">
          <div className="rounded-lg bg-rose-50/60 p-2.5 border border-rose-100 space-y-2">
            <span className="text-[11px] font-bold text-rose-900 block uppercase">1. Nhà Gái (Lễ Vu Quy)</span>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tiêu đề lễ
              <input className={inputClass} value={config.brideTitle ?? "LỄ VU QUY"} onChange={(e) => update({ brideTitle: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Thời gian & Thứ
              <input className={inputClass} value={config.brideDate ?? "Vào Thứ Hai - 09h00"} onChange={(e) => update({ brideDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Ngày Âm lịch
              <input className={inputClass} value={config.brideLunarDate ?? "Tức Ngày 16 tháng 12 năm Ất Tỵ"} onChange={(e) => update({ brideLunarDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tên tư gia
              <input className={inputClass} value={config.brideVenue ?? "tại tư gia nhà gái"} onChange={(e) => update({ brideVenue: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Link chỉ đường Google Maps
              <input type="url" className={inputClass} value={config.brideMapUrl ?? ""} placeholder="https://maps.google.com/..." onChange={(e) => update({ brideMapUrl: e.target.value })} />
            </label>
          </div>

          <div className="rounded-lg bg-amber-50/60 p-2.5 border border-amber-100 space-y-2">
            <span className="text-[11px] font-bold text-amber-900 block uppercase">2. Nhà Trai (Lễ Thành Hôn)</span>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tiêu đề lễ
              <input className={inputClass} value={config.groomTitle ?? "LỄ THÀNH HÔN"} onChange={(e) => update({ groomTitle: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Thời gian & Thứ
              <input className={inputClass} value={config.groomDate ?? "Vào Thứ Hai - 14h00"} onChange={(e) => update({ groomDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Ngày Âm lịch
              <input className={inputClass} value={config.groomLunarDate ?? "Tức Ngày 16 tháng 12 năm Ất Tỵ"} onChange={(e) => update({ groomLunarDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Tên tư gia
              <input className={inputClass} value={config.groomVenue ?? "TẠI TƯ GIA NHÀ TRAI"} onChange={(e) => update({ groomVenue: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-stone-600">
              Link chỉ đường Google Maps
              <input type="url" className={inputClass} value={config.groomMapUrl ?? ""} placeholder="https://maps.google.com/..." onChange={(e) => update({ groomMapUrl: e.target.value })} />
            </label>
          </div>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO THẺ LỜI ƯỚC VIỀN REN ── */}
      {element.widgetType === "lace-vow-card" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Kiểu khung ren nghệ thuật
            <select
              className={inputClass}
              value={config.frameStyle ?? "royal"}
              onChange={(e) => update({ frameStyle: e.target.value as "royal" | "gold-arch" | "scalloped" | "lotus" | "rose-cottage" })}
            >
              <option value="royal">Khung ren hoàng gia cổ điển</option>
              <option value="gold-arch">Khung ren vòm dát vàng & ô liu</option>
              <option value="scalloped">Khung giấy viền răng cưa handmade</option>
              <option value="lotus">Khung hoa sen trắng & chữ Hỷ dát vàng</option>
              <option value="rose-cottage">Khung hoa hồng pastel & ngôi nhà</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên Cô Dâu & Chú Rể
            <input className={inputClass} value={config.title ?? "Mạnh Đức & Lan Nhi"} onChange={(e) => update({ title: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Ngày tháng cưới
            <input className={inputClass} value={config.eventDate ?? "29.12.2026"} onChange={(e) => update({ eventDate: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Thơ hẹn ước / Lời ngỏ
            <textarea
              className={inputClass}
              rows={4}
              value={config.vowQuote ?? "Một lời hẹn ước\nMột hành trình mới\nMột mái nhà chung\nMột đời bên nhau"}
              onChange={(e) => update({ vowQuote: e.target.value })}
            />
            <span className="text-[10px] text-stone-400">Xuống dòng để ngắt từng câu thơ.</span>
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG DÀNH CHO LỄ TIỆC & THIÊN NGA ── */}
      {element.widgetType === "swan-ceremony" && (
        <div className="space-y-2.5">
          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Biểu tượng trang trí
            <select
              className={inputClass}
              value={config.decorIcon ?? "swans"}
              onChange={(e) => update({ decorIcon: e.target.value as "swans" | "car" | "cake" | "wreath" | "none" })}
            >
              <option value="swans">Đôi thiên nga sứ trái tim</option>
              <option value="car">Xe hoa rước dâu pastel</option>
              <option value="cake">Bánh cưới 3 tầng hoa tươi hoàng gia</option>
              <option value="wreath">Vòng hoa baby trắng & cúc Tana</option>
              <option value="none">Không hiển thị biểu tượng</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tiêu đề lễ
            <input className={inputClass} value={config.title ?? "LỄ THÀNH HÔN"} onChange={(e) => update({ title: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Thời gian & Thứ
            <input className={inputClass} value={config.description ?? "ĐƯỢC TỔ CHỨC VÀO LÚC 09:30, THỨ BẢY"} onChange={(e) => update({ description: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Ngày Âm lịch
            <input className={inputClass} value={config.groomLunarDate ?? "(Tức ngày 18 tháng 10 năm Bính Ngọ)"} onChange={(e) => update({ groomLunarDate: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Địa điểm tổ chức
            <input className={inputClass} value={config.groomVenue ?? "TẠI TƯ GIA NHÀ TRAI"} onChange={(e) => update({ groomVenue: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Địa chỉ cụ thể
            <textarea className={inputClass} rows={2} value={config.groomAddress ?? "174 Đường Trần Văn Kiểu, Phường 10, TP Hồ Chí Minh"} onChange={(e) => update({ groomAddress: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Link bản đồ (Xem chỉ đường)
            <input type="url" className={inputClass} value={config.url ?? ""} placeholder="https://maps.google.com/..." onChange={(e) => update({ url: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1 text-xs text-stone-700">
            Tên nút chỉ đường
            <input className={inputClass} value={config.buttonLabel ?? "XEM CHỈ ĐƯỜNG"} onChange={(e) => update({ buttonLabel: e.target.value })} />
          </label>
        </div>
      )}

      {/* ── CÁC TRƯỜNG TIỆN ÍCH CƠ BẢN KHÁC ── */}
      {element.widgetType !== "procession-route" &&
        element.widgetType !== "lace-vow-card" &&
        element.widgetType !== "swan-ceremony" && (
          <>
            <label className="flex items-center gap-2 text-xs">
              <input
                name="widgetShowTitle"
                type="checkbox"
                checked={config.showTitle !== false}
                onChange={(event) => update({ showTitle: event.target.checked })}
              />
              Hiển thị tiêu đề
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Tiêu đề
              <input className={inputClass} value={config.title ?? ""} onChange={(event) => update({ title: event.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Nội dung
              <textarea className={inputClass} rows={3} value={config.description ?? ""} onChange={(event) => update({ description: event.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Tên nút
              <input className={inputClass} value={config.buttonLabel ?? ""} onChange={(event) => update({ buttonLabel: event.target.value })} />
            </label>
            {(element.widgetType === "countdown" || element.widgetType === "calendar") && (
              <label className="flex flex-col gap-1 text-xs">
                Ngày giờ tổ chức
                <input
                  name="widgetEventDate"
                  type="datetime-local"
                  className={inputClass}
                  value={config.eventDate ? config.eventDate.slice(0, 16) : ""}
                  onChange={(event) => update({ eventDate: event.target.value ? `${event.target.value}:00+07:00` : "" })}
                />
                <span className="text-stone-500">Giờ Việt Nam (UTC+7)</span>
              </label>
            )}
            {element.widgetType === "map" && (
              <label className="flex flex-col gap-1 text-xs">
                Liên kết bản đồ
                <input name="widgetUrl" type="url" className={inputClass} value={config.url ?? ""} onChange={(event) => update({ url: event.target.value })} />
              </label>
            )}
            {element.widgetType === "contact" && (
              <label className="flex flex-col gap-1 text-xs">
                Số điện thoại
                <input name="widgetPhone" type="tel" className={inputClass} value={config.phone ?? ""} onChange={(event) => update({ phone: event.target.value })} />
              </label>
            )}
            {element.widgetType === "rsvp" && (
              <p className="text-xs leading-5 text-stone-500">
                Khách gửi xác nhận qua form RSVP của thiệp. Danh sách phản hồi nằm trong mục quản lý khách mời.
              </p>
            )}
          </>
        )}
    </fieldset>
  );
}
