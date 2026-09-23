"use client";

import React, { useState } from "react";
import { LayoutGrid, Sparkles } from "lucide-react";

const PRESETS = [
  { id: "p1", title: "Khung Ảnh Cổng Vòm", cat: "photo", desc: "Ảnh chân dung vòm cong hoàng gia Á Đông" },
  { id: "p2", title: "Khung Ảnh Polaroids 3 Tấm", cat: "photo", desc: "Hiệu ứng ảnh dán sổ tay lãng mạn" },
  { id: "p3", title: "Khối Lịch Trình Tiệc Đầy Đủ", cat: "info", desc: "Lễ đón khách, làm lễ, khai tiệc, chụp hình" },
  { id: "p4", title: "Thẻ Song Thân 2 Cột Cân Đối", cat: "info", desc: "Thông tin nhà trai và nhà gái trang trọng" },
  { id: "p5", title: "Khối Lời Ngỏ Cổ Điển", cat: "invite", desc: "Trích dẫn câu đối và lời nhắn gửi song ngữ" },
];

export function PresetTool() {
  const [tab, setTab] = useState<"all" | "photo" | "info" | "invite">("all");

  const filtered = PRESETS.filter((p) => tab === "all" || p.cat === tab);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Thiết Kế Sẵn (Presets)
        </h3>
        <p className="text-[11px] text-stone-400">
          Các khối thành phần dựng sẵn giúp bố cục thiệp thêm phần sinh động.
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto">
        {[
          { id: "all", label: "Tất cả" },
          { id: "photo", label: "Ảnh" },
          { id: "info", label: "Thông tin" },
          { id: "invite", label: "Lời mời" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTab(c.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              tab === c.id ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer space-y-1 shadow-2xs"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3 text-amber-600" />
              <h4 className="text-xs font-bold text-stone-800">{item.title}</h4>
            </div>
            <p className="text-[11px] text-stone-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
