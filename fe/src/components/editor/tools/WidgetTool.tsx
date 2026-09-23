"use client";

import React from "react";
import { Clock, MapPin, QrCode, Video, ToggleLeft, ToggleRight } from "lucide-react";
import { useEditor } from "../EditorContext";

export function WidgetTool() {
  const { showWishButton, setShowWishButton, showGiftQR, setShowGiftQR, showRSVP, setShowRSVP } = useEditor();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Tiện Ích Tương Tác
        </h3>
        <p className="text-[11px] text-stone-400">
          Các tiện ích tích hợp trên thiệp để tăng trải nghiệm cho khách mời.
        </p>
      </div>

      <div className="space-y-2">
        <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Đồng hồ đếm ngược</p>
              <span className="text-[10px] text-stone-400">Đếm ngược đến ngày cưới</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Tự động</span>
        </div>

        <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Bản đồ chỉ đường</p>
              <span className="text-[10px] text-stone-400">Google Maps tới nhà hàng</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Bật</span>
        </div>

        <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <QrCode className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Mã QR Mừng Cưới</p>
              <span className="text-[10px] text-stone-400">Mở popup VietQR chuyển khoản</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGiftQR((v) => !v)}
            className="text-stone-700 cursor-pointer"
          >
            {showGiftQR ? (
              <ToggleRight className="size-6 text-amber-600" />
            ) : (
              <ToggleLeft className="size-6 text-stone-300" />
            )}
          </button>
        </div>

        <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Video className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Video Pre-wedding</p>
              <span className="text-[10px] text-stone-400">Chèn link YouTube / TikTok</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-stone-400">Sắp ra mắt</span>
        </div>
      </div>
    </div>
  );
}
