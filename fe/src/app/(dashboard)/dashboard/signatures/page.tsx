"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Download,
  Eye,
  EyeOff,
  FileEdit,
  Globe,
  Heart,
  Loader2,
  LogOut,
  Menu,
  PenLine,
  Pencil,
  RefreshCw,
  Sparkles,
  Ticket,
  Trash2,
  User,
  X,
  Armchair,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";

interface SignatureItem {
  id: string;
  cardId: string;
  elementId: string;
  signerName: string;
  message?: string | null;
  signatureUrl: string;
  thumbUrl?: string | null;
  isApproved: boolean;
  createdAt: string;
  card: {
    slug: string;
    categoryData?: Record<string, unknown>;
  };
}

interface SignatureMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalCards: number;
  latestCreatedAt: string | null;
}

interface AccountSignaturesResult {
  data: SignatureItem[];
  meta: SignatureMeta;
}

function getCardName(sig: SignatureItem): string {
  const cd = sig.card.categoryData as Record<string, unknown> | undefined;
  const groom =
    (cd?.groom as Record<string, string> | undefined)?.fullName ||
    (cd?.groomName as string | undefined) ||
    "";
  const bride =
    (cd?.bride as Record<string, string> | undefined)?.fullName ||
    (cd?.brideName as string | undefined) ||
    "";
  if (groom && bride) return `${groom} & ${bride}`;
  return sig.card.slug;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SignaturesDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [meta, setMeta] = useState<SignatureMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterCardId, setFilterCardId] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [previewSig, setPreviewSig] = useState<SignatureItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSignatures = useCallback(async (p = 1, cardId = "") => {
    setLoading(true);
    try {
      const res = await ApiClient.getAccountSignatures<AccountSignaturesResult>({
        page: p,
        limit: 20,
        ...(cardId ? { cardId } : {}),
      });
      if (res.success && res.data) {
        setSignatures(res.data.data);
        setMeta(res.data.meta);
      } else {
        setSignatures([]);
        setMeta(null);
      }
    } catch {
      setSignatures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignatures(page, filterCardId);
  }, [fetchSignatures, page, filterCardId]);

  const uniqueCards = useMemo(() => {
    const seen = new Map<string, SignatureItem>();
    signatures.forEach((s) => {
      if (!seen.has(s.cardId)) seen.set(s.cardId, s);
    });
    return Array.from(seen.values());
  }, [signatures]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleApprove = async (sig: SignatureItem) => {
    setTogglingId(sig.id);
    const res = await ApiClient.toggleSignatureApprove<{ success: boolean; isApproved: boolean }>(
      sig.cardId, sig.elementId, sig.id
    );
    if (res.success && res.data) {
      setSignatures((prev) =>
        prev.map((s) => (s.id === sig.id ? { ...s, isApproved: res.data!.isApproved } : s))
      );
      showToast(res.data.isApproved ? "Đã hiện chữ ký" : "Đã ẩn chữ ký");
    } else {
      showToast("Thao tác thất bại, vui lòng thử lại");
    }
    setTogglingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const sig = signatures.find((s) => s.id === deleteId);
    if (!sig) return;
    setDeleting(true);
    const res = await ApiClient.deleteSignature(sig.cardId, sig.elementId, sig.id);
    if (res.success) {
      setSignatures((prev) => prev.filter((s) => s.id !== deleteId));
      if (meta) setMeta({ ...meta, total: meta.total - 1 });
      showToast("Đã xóa chữ ký");
    } else {
      showToast("Xóa thất bại, vui lòng thử lại");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleLogout = () => { logout(); router.push("/"); };

  const navBase = "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition cursor-pointer text-[#5C4D40] hover:bg-[#F3ECE2]/80 hover:text-[#2B2118]";
  const navActive = "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer bg-[#F0E6D8] border border-[#E2D5C3]/70 text-[#2B2118] shadow-2xs relative";

  return (
    <div className="min-h-screen bg-[#F9F5EE] text-[#2D241E] flex flex-col font-sans selection:bg-[#EADDCB] selection:text-[#4A3728] relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 pointer-events-none z-0 select-none opacity-85">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M-20 420 C50 350 110 260 160 150 C180 100 200 60 210 20" stroke="#C2AE93" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
          <ellipse cx="185" cy="248" rx="18" ry="9" transform="rotate(-10 185 248)" fill="#EFE5D7" opacity="0.75" />
          <circle cx="210" cy="20" r="3.5" fill="#C2AE93" opacity="0.8" />
        </svg>
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#EADDCB] px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl text-[#78695A] hover:bg-[#F3EDE2] transition" aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-bold text-base text-[#2D241E]">Chữ Ký Khách Mời</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#8C6239] text-white font-bold text-xs flex items-center justify-center shadow-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
        </div>
      </header>

      <div className="flex-1 flex max-w-[1400px] w-full mx-auto relative z-10">
        {/* SHARED SIDEBAR */}
        <DashboardSidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-7 lg:p-9 max-w-5xl overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard/cards" className="p-1.5 rounded-lg text-[#8E7E70] hover:bg-[#F0E6D8] hover:text-[#2B2118] transition" title="Quay lại">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-[#2D241E] font-serif">Chữ ký khách mời</h1>
              </div>
              <p className="text-sm text-[#8E7E70] ml-8">Quản lý và xem tất cả chữ ký khách mời từ các thiệp của bạn</p>
            </div>
            <button onClick={() => fetchSignatures(page, filterCardId)} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2D5C3] bg-white text-xs font-semibold text-[#5C4D40] hover:bg-[#F3ECE2] transition disabled:opacity-50 shrink-0">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-[#EFE5D8] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs font-semibold text-[#8E7E70]">Tổng chữ ký</span>
              </div>
              {loading ? <div className="h-8 w-16 rounded-lg bg-[#F0E6D8] animate-pulse" /> : <p className="text-3xl font-bold text-[#2D241E]">{meta?.total ?? 0}</p>}
              <p className="text-xs text-[#A89880] mt-1">Số chữ ký đã ghi nhận</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EFE5D8] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-[#8E7E70]">Chữ ký mới nhất</span>
              </div>
              {loading ? <div className="h-5 w-32 rounded-lg bg-[#F0E6D8] animate-pulse" /> : (
                <p className="text-base font-bold text-[#2D241E] leading-tight">
                  {meta?.latestCreatedAt ? formatDateTime(meta.latestCreatedAt) : "Chưa có chữ ký nào"}
                </p>
              )}
              <p className="text-xs text-[#A89880] mt-1">{(!loading && !meta?.latestCreatedAt) ? "Chưa có dữ liệu" : ""}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EFE5D8] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-xs font-semibold text-[#8E7E70]">Thiệp nhận chữ ký</span>
              </div>
              {loading ? <div className="h-8 w-12 rounded-lg bg-[#F0E6D8] animate-pulse" /> : <p className="text-3xl font-bold text-[#2D241E]">{meta?.totalCards ?? 0}</p>}
              <p className="text-xs text-[#A89880] mt-1">Số thiệp có chữ ký gần nhất</p>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-[#EFE5D8] shadow-xs overflow-hidden">
            {/* Filter bar */}
            <div className="px-5 py-3.5 border-b border-[#EFE5D8] flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-[#8E7E70] shrink-0">Lọc theo thiệp:</span>
              <div className="relative">
                <select
                  value={filterCardId}
                  onChange={(e) => { setFilterCardId(e.target.value); setPage(1); }}
                  className="appearance-none text-xs border border-[#E2D5C3] rounded-xl bg-[#FAF7F2] px-3 py-1.5 pr-7 text-[#4A3728] font-medium outline-none focus:border-[#C29D67] transition cursor-pointer"
                >
                  <option value="">Tất cả thiệp</option>
                  {uniqueCards.map((s) => (
                    <option key={s.cardId} value={s.cardId}>{getCardName(s)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E7E70] pointer-events-none" />
              </div>
              {meta && meta.total > 0 && <span className="ml-auto text-xs text-[#8E7E70]">{meta.total} chữ ký</span>}
            </div>

            {/* Table header */}
            {!loading && signatures.length > 0 && (
              <div className="hidden sm:grid grid-cols-[2fr_2fr_1.5fr_1.5fr_auto] gap-4 px-5 py-2.5 border-b border-[#F0EAE0] bg-[#FAF7F2] text-xs font-semibold text-[#8E7E70] uppercase tracking-wide">
                <span>Chữ ký</span><span>Thiệp</span><span>Vị trí</span><span>Thời gian</span><span>Hành động</span>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="divide-y divide-[#F0EAE0]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                    <div className="w-16 h-10 rounded-xl bg-[#F0E6D8] shrink-0" />
                    <div className="flex-1 space-y-2"><div className="h-3 rounded-lg bg-[#F0E6D8] w-32" /><div className="h-2.5 rounded-lg bg-[#F0E6D8] w-20" /></div>
                    <div className="hidden sm:block h-3 rounded-lg bg-[#F0E6D8] w-28" />
                    <div className="hidden sm:block h-3 rounded-lg bg-[#F0E6D8] w-24" />
                    <div className="w-16 h-7 rounded-xl bg-[#F0E6D8]" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && signatures.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-[#F0E6D8] flex items-center justify-center">
                  <PenLine className="w-8 h-8 text-[#C2AE93]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#4A3728] mb-1">Không có chữ ký nào</p>
                  <p className="text-sm text-[#8E7E70]">Bạn chưa nhận được chữ ký nào.<br />Thêm widget <strong>Sổ Lưu Bút Kỹ Thuật Số</strong> vào thiệp để khách ký tên nhé!</p>
                </div>
                <Link href="/dashboard/cards" className="mt-2 px-5 py-2.5 rounded-xl bg-[#8C6239] text-white text-xs font-bold hover:bg-[#7A5230] transition">
                  Chỉnh sửa thiệp
                </Link>
              </div>
            )}

            {/* Rows */}
            {!loading && signatures.length > 0 && (
              <div className="divide-y divide-[#F0EAE0]">
                {signatures.map((sig) => (
                  <div key={sig.id} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1.5fr_1.5fr_auto] gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-[#FAF7F2] transition group">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPreviewSig(sig)} className="w-16 h-10 rounded-xl border border-[#E2D5C3] bg-[#F9F5EE] flex items-center justify-center overflow-hidden shrink-0 hover:border-[#C29D67] transition cursor-zoom-in" title="Xem chữ ký">
                        <img src={sig.thumbUrl || sig.signatureUrl} alt={`Chữ ký của ${sig.signerName}`} className="max-w-full max-h-full object-contain p-0.5" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2D241E] truncate">{sig.signerName}</p>
                        {sig.message && <p className="text-[11px] text-[#8E7E70] truncate italic">"{sig.message}"</p>}
                        {!sig.isApproved && <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 mt-0.5">Đã ẩn</span>}
                      </div>
                    </div>
                    <div className="sm:block hidden">
                      <p className="text-xs font-semibold text-[#4A3728] truncate">{getCardName(sig)}</p>
                      <p className="text-[11px] text-[#A89880]">{sig.card.slug}</p>
                    </div>
                    <div className="sm:block hidden">
                      <p className="text-[11px] text-[#8E7E70] font-mono truncate max-w-[140px]">{sig.elementId.slice(0, 16)}…</p>
                    </div>
                    <div className="sm:block hidden">
                      <p className="text-[11px] text-[#8E7E70]">{formatDateTime(sig.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPreviewSig(sig)} className="p-1.5 rounded-lg text-[#8E7E70] hover:bg-blue-50 hover:text-blue-600 transition" title="Xem chữ ký">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleToggleApprove(sig)} disabled={togglingId === sig.id} className="p-1.5 rounded-lg text-[#8E7E70] hover:bg-amber-50 hover:text-amber-600 transition disabled:opacity-50" title={sig.isApproved ? "Ẩn chữ ký" : "Hiện chữ ký"}>
                        {togglingId === sig.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sig.isApproved ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                      <button onClick={() => setDeleteId(sig.id)} className="p-1.5 rounded-lg text-[#8E7E70] hover:bg-rose-50 hover:text-rose-600 transition" title="Xóa chữ ký">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="px-5 py-4 border-t border-[#F0EAE0] flex items-center justify-between">
                <p className="text-xs text-[#8E7E70]">Trang {meta.page}/{meta.totalPages} — {meta.total} chữ ký</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-xl border border-[#E2D5C3] text-xs font-semibold text-[#5C4D40] hover:bg-[#F3ECE2] disabled:opacity-40 disabled:cursor-not-allowed transition">Trước</button>
                  <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-xl border border-[#E2D5C3] text-xs font-semibold text-[#5C4D40] hover:bg-[#F3ECE2] disabled:opacity-40 disabled:cursor-not-allowed transition">Tiếp</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Preview modal */}
      {previewSig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setPreviewSig(null)}>
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-stone-100 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewSig(null)} className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-[#2D241E]">Chữ ký của {previewSig.signerName}</h3>
              <p className="text-[11px] text-[#8E7E70] mt-0.5">{formatDateTime(previewSig.createdAt)}</p>
            </div>
            <div className="rounded-2xl border-2 border-[#E2D5C3] bg-[#F9F5EE] p-4 flex items-center justify-center min-h-32">
              <img src={previewSig.signatureUrl} alt={`Chữ ký của ${previewSig.signerName}`} className="max-h-40 object-contain" />
            </div>
            {previewSig.message && (
              <p className="mt-3 text-xs text-[#5C4D40] italic text-center bg-amber-50 rounded-xl p-3 border border-amber-100">"{previewSig.message}"</p>
            )}
            <div className="mt-4 flex gap-2 justify-center">
              <a href={previewSig.signatureUrl} download={`chu-ky-${previewSig.signerName}.png`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C6239] text-white text-xs font-bold hover:bg-[#7A5230] transition">
                <Download className="w-3.5 h-3.5" />Tải về
              </a>
              <button onClick={() => setPreviewSig(null)} className="px-4 py-2 rounded-xl border border-[#E2D5C3] text-xs font-medium text-[#5C4D40] hover:bg-[#F3ECE2] transition">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => !deleting && setDeleteId(null)}>
          <div className="relative w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl border border-stone-100 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-[#2D241E] mb-1">Xóa chữ ký này?</h3>
              <p className="text-xs text-[#8E7E70]">Thao tác này không thể hoàn tác. Ảnh chữ ký sẽ bị xóa vĩnh viễn.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => !deleting && setDeleteId(null)} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2D5C3] text-xs font-semibold text-[#5C4D40] hover:bg-[#F3ECE2] transition disabled:opacity-50">Hủy</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-60">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#2D241E] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />{toastMsg}
        </div>
      )}
    </div>
  );
}
