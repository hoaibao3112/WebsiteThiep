"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Camera, Tv, Printer, Eye, EyeOff, Trash2, ArrowLeft, Loader2, RefreshCw, QrCode } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { WeddingMemory } from "@/types/wedding-memory.types";

export default function CardMemoriesAdminPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.cardId as string;

  const [cardSlug, setCardSlug] = useState<string>("");
  const [cardTitle, setCardTitle] = useState<string>("Thiệp cưới");
  const [memories, setMemories] = useState<WeddingMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Tải thông tin thiệp & danh sách ảnh quản trị
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin thiệp để có slug
      const cardRes = await ApiClient.request<{ card?: { slug: string; greetingMessage?: string } }>(
        `/cards/${encodeURIComponent(cardId)}`
      );
      if (cardRes.success && cardRes.data) {
        const c = (cardRes.data as any).card || cardRes.data;
        if (c.slug) {
          setCardSlug(c.slug);
          setCardTitle(c.greetingMessage || "Tiệc Cưới");
        }
      }

      // 2. Lấy danh sách ảnh quản trị
      const memRes = await ApiClient.getAdminWeddingMemories<WeddingMemory[]>(cardId);
      if (memRes.success && Array.isArray(memRes.data)) {
        setMemories(memRes.data);
      }
    } catch (err) {
      console.warn("Lỗi tải danh sách ảnh quản trị:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) fetchData();
  }, [cardId]);

  // Bật/tắt ẩn hiện ảnh
  const handleToggle = async (mem: WeddingMemory) => {
    setActionLoadingId(mem.id);
    try {
      const nextApproved = !mem.isApproved;
      const res = await ApiClient.toggleWeddingMemory(cardId, mem.id, {
        isApproved: nextApproved,
      });
      if (res.success) {
        setMemories((prev) =>
          prev.map((m) => (m.id === mem.id ? { ...m, isApproved: nextApproved } : m))
        );
      }
    } catch (err) {
      console.warn("Lỗi cập nhật ảnh:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Xóa ảnh vi phạm
  const handleDelete = async (memoryId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bức ảnh kỷ niệm này không?")) return;

    setActionLoadingId(memoryId);
    try {
      const res = await ApiClient.deleteWeddingMemory(cardId, memoryId);
      if (res.success) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      }
    } catch (err) {
      console.warn("Lỗi xóa ảnh:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mở cửa sổ in mã QR bàn tiệc
  const handlePrintQr = () => {
    if (!cardSlug) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      `${window.location.origin}/thiep/${cardSlug}`
    )}&margin=15`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mã QR Bàn Tiệc Cưới</title>
          <style>
            body { font-family: 'Times New Roman', serif; text-align: center; padding: 40px; }
            .card { max-width: 450px; margin: 0 auto; border: 2px solid #C5A059; padding: 30px; border-radius: 20px; }
            h1 { color: #8C6B2D; font-size: 26px; margin-bottom: 5px; }
            p { color: #555; font-size: 14px; margin-top: 0; }
            img { width: 280px; height: 280px; margin: 15px 0; }
            .note { font-style: italic; color: #777; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>KỶ NIỆM NGÀY CƯỚI</h1>
            <p>Quét mã để chụp ảnh selfie & gửi lời chúc lên Màn hình LED sân khấu!</p>
            <img src="${qrUrl}" alt="QR Code" />
            <div class="note">Trân trọng cảm ơn sự hiện diện của Quý khách!</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* NÚT QUAY LẠI & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/cards/${cardId}/edit`)}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer shadow-2xs"
              title="Quay lại chỉnh sửa thiệp"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                Bức Tường Ảnh Tiệc Cưới &amp; Màn Hình LED
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Quản lý ảnh selfie và lời chúc của khách mời tại sảnh tiệc
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 transition cursor-pointer shadow-2xs"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrintQr}
              disabled={!cardSlug}
              className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>In Mã QR Để Bàn</span>
            </button>

            {cardSlug && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const ledUrl = `${window.location.origin}/thiep/${cardSlug}/live-display`;
                    navigator.clipboard.writeText(ledUrl).then(() => {
                      alert("Đã sao chép link Màn Hình LED!\nGửi cho kỹ thuật viên nhà hàng để mở trên máy tính kết nối LED.");
                    }).catch(() => {});
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-stone-600" />
                  <span>Sao Chép Link LED</span>
                </button>

                <a
                  href={`/thiep/${cardSlug}/live-display`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Tv className="w-4 h-4" />
                  <span>Mở Màn Hình LED Sảnh Tiệc</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* THỐNG KÊ NHANH */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 block">Tổng số ảnh đã gửi</span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">
              {memories.length}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 block">Đang chiếu lên màn hình</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {memories.filter((m) => m.isApproved).length}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 block">Đã ẩn / Tạm khóa</span>
            <span className="text-2xl font-bold text-stone-400 mt-1 block">
              {memories.filter((m) => !m.isApproved).length}
            </span>
          </div>
        </div>

        {/* LƯỚI QUẢN TRỊ ẢNH */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400 text-xs gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <span>Đang tải danh sách ảnh kỷ niệm...</span>
          </div>
        ) : memories.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-stone-200 text-center p-8 shadow-2xs space-y-3">
            <Camera className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">
              Chưa có bức ảnh nào từ khách mời
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Khi khách mời quét mã QR tại bàn tiệc và gửi ảnh, toàn bộ ảnh sẽ xuất hiện tại đây theo thời gian thực.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {memories.map((mem) => {
              const isLoading = actionLoadingId === mem.id;

              return (
                <div
                  key={mem.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-2xs transition flex flex-col justify-between ${
                    mem.isApproved ? "border-stone-200" : "border-rose-300 opacity-60 bg-stone-50"
                  }`}
                >
                  {/* ẢNH */}
                  <div className="aspect-square bg-stone-100 relative overflow-hidden group">
                    <img
                      src={mem.photoUrl}
                      alt={mem.senderName}
                      className="w-full h-full object-cover"
                    />

                    {!mem.isApproved && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                        ĐÃ ẨN KHỎI MÀN HÌNH
                      </div>
                    )}
                  </div>

                  {/* THÔNG TIN */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {mem.senderName}
                        </span>
                        {mem.relationship && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium shrink-0">
                            {mem.relationship}
                          </span>
                        )}
                      </div>

                      {mem.message && (
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 italic font-serif">
                          &ldquo;{mem.message}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] text-stone-400">
                      {new Date(mem.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>

                  {/* THAO TÁC (ẨN/HIỆN / XÓA) */}
                  <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggle(mem)}
                      className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        mem.isApproved
                          ? "text-stone-600 hover:text-amber-800 hover:bg-amber-50"
                          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      }`}
                    >
                      {mem.isApproved ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ẩn</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Hiện</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDelete(mem.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
