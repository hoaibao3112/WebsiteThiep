"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, Clipboard, Loader2, MessageCircle, Plus, Search, Send, Trash2, Upload, Users } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { parseGuestText } from "@/lib/guests/parse-guest-text";
import { buildGuestInvitation, copyInvitation, DEFAULT_INVITATION, openZaloShare } from "@/lib/guests/zalo-share";

type DeliveryStatus = "NOT_SENT" | "OPENED_ZALO" | "CONFIRMED_SENT" | "FAILED";
interface Guest { id: string; fullName: string; salutation: string; group?: string | null; phone?: string | null; guestToken: string; customUrl: string; deliveryStatus: DeliveryStatus; rsvpResponses?: Array<{ status: string; guestCount: number }> }
interface GuestResult { items: Guest[]; pagination: { total: number }; metrics: { total: number; confirmedSent: number; responded: number; attendingPeople: number } }
const emptyResult: GuestResult = { items: [], pagination: { total: 0 }, metrics: { total: 0, confirmedSent: 0, responded: 0, attendingPeople: 0 } };

export default function GuestsPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [result, setResult] = useState(emptyResult); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false); const [showImport, setShowImport] = useState(false);
  const [fullName, setFullName] = useState(""); const [salutation, setSalutation] = useState("Bạn");
  const [phone, setPhone] = useState(""); const [group, setGroup] = useState(""); const [paste, setPaste] = useState("");
  const [notice, setNotice] = useState(""); const [pendingId, setPendingId] = useState<string | null>(null);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_INVITATION);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const response = await ApiClient.request<GuestResult>(`/cards/${cardId}/guests?search=${encodeURIComponent(search)}&pageSize=50`);
    setLoading(false); if (response.success && response.data) setResult(response.data); else setError(response.error || "Không thể tải danh sách khách mời");
  }, [cardId, search]);
  useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer); }, [load]);

  const parsed = useMemo(() => parseGuestText(paste), [paste]);
  async function createGuest() {
    const response = await ApiClient.request(`/cards/${cardId}/guests`, { method: "POST", body: JSON.stringify({ fullName, salutation, phone, group }) });
    if (!response.success) return setError(response.error || "Không thể thêm khách");
    setShowAdd(false); setFullName(""); setPhone(""); setGroup(""); await load();
  }
  async function importGuests() {
    if (!parsed.items.length || parsed.errors.length) return;
    const response = await ApiClient.request(`/cards/${cardId}/guests/import`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ guests: parsed.items, mode: "SKIP_DUPLICATES" }) });
    if (!response.success) return setError(response.error || "Không thể nhập danh sách");
    setShowImport(false); setPaste(""); await load();
  }
  function guestUrl(guest: Guest) { return new URL(guest.customUrl, window.location.origin).toString(); }
  async function share(guest: Guest) {
    setPendingId(guest.id); const url = guestUrl(guest); const message = buildGuestInvitation(messageTemplate, { salutation: guest.salutation, fullName: guest.fullName, url });
    try { await copyInvitation(message); setNotice("Đã sao chép lời mời. Hãy chọn người nhận và bấm gửi trong Zalo."); } catch { setNotice(message); }
    await ApiClient.request(`/cards/${cardId}/guests/${guest.id}/delivery`, { method: "PATCH", body: JSON.stringify({ status: "OPENED_ZALO" }) });
    openZaloShare(url); setPendingId(null); await load();
  }
  async function confirmSent(guest: Guest) { await ApiClient.request(`/cards/${cardId}/guests/${guest.id}/delivery`, { method: "PATCH", body: JSON.stringify({ status: "CONFIRMED_SENT" }) }); await load(); }
  async function remove(guest: Guest) { if (!window.confirm(`Xóa ${guest.salutation} ${guest.fullName}?`)) return; await ApiClient.request(`/cards/${cardId}/guests/${guest.id}`, { method: "DELETE" }); await load(); }

  return <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><Link href="/dashboard/cards" className="text-sm text-stone-500 hover:text-stone-900">← Danh sách thiệp</Link><h1 className="mt-2 text-2xl font-semibold text-stone-950">Khách mời cá nhân</h1><p className="mt-1 text-sm text-stone-500">Tạo link riêng, chuẩn bị lời mời Zalo và theo dõi RSVP.</p></div><div className="flex gap-2"><button onClick={() => setShowImport(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium"><Upload className="size-4"/>Nhập nhanh</button><button onClick={() => setShowAdd(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0068ff] px-3 text-sm font-semibold text-white"><Plus className="size-4"/>Thêm khách</button></div></div>
    <dl className="mb-6 grid grid-cols-2 divide-x divide-stone-200 rounded-xl bg-stone-50 p-4 lg:grid-cols-4">{[["Tổng khách",result.metrics.total],["Đã xác nhận gửi",result.metrics.confirmedSent],["Đã phản hồi",result.metrics.responded],["Số người tham dự",result.metrics.attendingPeople]].map(([label,value])=><div key={String(label)} className="px-4 first:pl-0"><dt className="text-xs text-stone-500">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums text-stone-950">{value}</dd></div>)}</dl>
    <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_2fr]"><label className="relative"><Search className="absolute left-3 top-3 size-4 text-stone-400"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Tìm tên hoặc số điện thoại" className="h-10 w-full rounded-lg border border-stone-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0068ff]/25"/></label><input value={messageTemplate} onChange={(e)=>setMessageTemplate(e.target.value)} aria-label="Mẫu lời mời Zalo" className="h-10 rounded-lg border border-stone-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#0068ff]/25"/></div>
    {notice && <div aria-live="polite" className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{notice}</div>}{error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
    {loading ? <div className="flex h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-stone-400"/></div> : !result.items.length ? <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center"><Users className="mx-auto size-8 text-stone-400"/><p className="mt-3 font-medium">Chưa có khách mời</p><p className="mt-1 text-sm text-stone-500">Thêm một khách hoặc dán danh sách để bắt đầu.</p></div> : <div className="overflow-hidden rounded-xl border border-stone-200 bg-white"><div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 md:grid"><span>Khách mời</span><span>Điện thoại</span><span>Đã gửi</span><span>RSVP</span><span>Hành động</span></div>{result.items.map((guest)=><article key={guest.id} className="grid gap-3 border-b border-stone-100 p-4 last:border-0 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-center"><div className="min-w-0"><p className="truncate font-medium text-stone-950">{guest.salutation} {guest.fullName}</p><p className="text-xs text-stone-500">{guest.group || "Chưa phân nhóm"}</p></div><p className="text-sm text-stone-600">{guest.phone || "—"}</p><span className="text-sm text-stone-600">{guest.deliveryStatus === "CONFIRMED_SENT" ? "Đã xác nhận" : guest.deliveryStatus === "OPENED_ZALO" ? "Đã mở Zalo" : "Chưa gửi"}</span><span className="text-sm text-stone-600">{guest.rsvpResponses?.[0]?.status || "Chưa phản hồi"}</span><div className="flex flex-wrap gap-2"><button onClick={()=>share(guest)} disabled={pendingId===guest.id} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0068ff] px-3 text-xs font-semibold text-white disabled:opacity-50"><MessageCircle className="size-4"/>Mở Zalo</button>{guest.deliveryStatus === "OPENED_ZALO" && <button onClick={()=>confirmSent(guest)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-emerald-200 px-2 text-xs text-emerald-700"><Check className="size-4"/>Đã gửi</button>}<button onClick={async()=>{await copyInvitation(guestUrl(guest));setNotice("Đã sao chép link riêng");}} aria-label={`Sao chép link của ${guest.fullName}`} className="min-h-9 rounded-lg border border-stone-200 p-2"><Clipboard className="size-4"/></button><button onClick={()=>remove(guest)} aria-label={`Xóa ${guest.fullName}`} className="min-h-9 rounded-lg border border-rose-100 p-2 text-rose-600"><Trash2 className="size-4"/></button></div></article>)}</div>}
    {(showAdd||showImport)&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"><h2 className="text-lg font-semibold">{showImport?"Nhập nhanh danh sách":"Thêm khách mời"}</h2>{showImport?<><p className="mt-1 text-sm text-stone-500">Mỗi dòng: Danh xưng, Tên, Nhóm, SĐT. Hoặc chỉ nhập tên.</p><textarea value={paste} onChange={(e)=>setPaste(e.target.value)} rows={9} className="mt-4 w-full rounded-lg border border-stone-200 p-3 text-sm"/><p className="mt-2 text-sm text-stone-600">Hợp lệ: {parsed.items.length} · Lỗi: {parsed.errors.length}</p></>:<div className="mt-4 grid gap-3"><input value={salutation} onChange={(e)=>setSalutation(e.target.value)} placeholder="Danh xưng" className="h-10 rounded-lg border px-3"/><input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Họ và tên" className="h-10 rounded-lg border px-3"/><input value={group} onChange={(e)=>setGroup(e.target.value)} placeholder="Nhóm" className="h-10 rounded-lg border px-3"/><input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Số điện thoại" className="h-10 rounded-lg border px-3"/></div>}<div className="mt-5 flex justify-end gap-2"><button onClick={()=>{setShowAdd(false);setShowImport(false)}} className="rounded-lg border px-4 py-2 text-sm">Hủy</button><button disabled={showImport?(parsed.items.length===0||parsed.errors.length>0):fullName.trim().length<2} onClick={showImport?importGuests:createGuest} className="rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">{showImport?"Nhập danh sách":"Thêm khách"}</button></div></section></div>}
  </main>;
}
