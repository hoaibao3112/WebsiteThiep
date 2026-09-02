"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ApiClient } from "@/lib/api";
import {
  Users,
  UserCheck,
  UserX,
  HelpCircle,
  Download,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function RsvpDashboardPage() {
  const params = useParams();
  const cardId = params.cardId as string;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    summary: {
      attendingCount: number;
      declinedCount: number;
      undecidedCount: number;
      totalAttendingGuests: number;
    };
    responses: any[];
  } | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const fetchStats = async () => {
    setLoading(true);
    const res = await ApiClient.request<{
      summary: { attendingCount: number; declinedCount: number; undecidedCount: number; totalAttendingGuests: number };
      responses: any[];
    }>(`/rsvp/${cardId}/stats`);
    if (res.success && res.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [cardId]);

  const handleExportExcel = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    window.open(
      `${apiBase}/cards/${cardId}/export-excel`,
      "_blank"
    );
  };

  const filteredResponses = (stats?.responses || []).filter((r) => {
    const matchSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone && r.phone.includes(search));
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/cards"
              className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-serif text-stone-900">
                Thống Kê Khách Mời & RSVP
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Quản lý số lượng khách tham dự và xuất danh sách cho nhà hàng
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <Link href={`/dashboard/cards/${cardId}/guests`} className="inline-flex items-center gap-2 rounded-xl border border-[#0068ff]/25 bg-blue-50 px-4 py-2.5 text-xs font-bold text-[#005bdc]">
              <Users className="w-4 h-4"/><span>Quản lý khách mời</span>
            </Link>
            <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer">
              <Download className="w-4 h-4"/><span>Xuất Báo Cáo Excel</span>
            </button>
          </div>
        </div>

        {/* 4 THẺ THỐNG KÊ (METRICS CARDS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">Sẽ tham dự</span>
              <h3 className="text-2xl font-bold text-stone-900">
                {stats?.summary.attendingCount || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">Tổng số khẩu</span>
              <h3 className="text-2xl font-bold text-stone-900">
                {stats?.summary.totalAttendingGuests || 0} người
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">Không thể đến</span>
              <h3 className="text-2xl font-bold text-stone-900">
                {stats?.summary.declinedCount || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">Chưa chắc chắn</span>
              <h3 className="text-2xl font-bold text-stone-900">
                {stats?.summary.undecidedCount || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* BẢNG DANH SÁCH PHẢN HỒI */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          {/* SEARCH & FILTER BAR */}
          <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-stone-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-700 font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ATTENDING">Sẽ tham dự</option>
                <option value="DECLINED">Không thể đến</option>
                <option value="UNDECIDED">Chưa chắc chắn</option>
              </select>
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
                <tr>
                  <th className="px-6 py-3.5">Họ và Tên</th>
                  <th className="px-6 py-3.5">Số Điện Thoại</th>
                  <th className="px-6 py-3.5">Trạng Thái</th>
                  <th className="px-6 py-3.5">Số Khẩu</th>
                  <th className="px-6 py-3.5">Bên Tiệc</th>
                  <th className="px-6 py-3.5">Lời Nhắn</th>
                  <th className="px-6 py-3.5">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredResponses.length > 0 ? (
                  filteredResponses.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-stone-50/80 transition">
                      <td className="px-6 py-4 font-bold text-stone-900">
                        {r.fullName}
                      </td>
                      <td className="px-6 py-4 text-stone-500">
                        {r.phone || "---"}
                      </td>
                      <td className="px-6 py-4">
                        {r.status === "ATTENDING" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Sẽ tham dự
                          </span>
                        ) : r.status === "DECLINED" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Không thể đến
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Chưa chắc chắn
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-stone-800">
                        {r.status === "ATTENDING" ? `${r.guestCount} người` : 0}
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        {r.side === "GROOM_SIDE"
                          ? "Nhà Trai"
                          : r.side === "BRIDE_SIDE"
                          ? "Nhà Gái"
                          : "Chung"}
                      </td>
                      <td className="px-6 py-4 text-stone-500 max-w-xs truncate">
                        {r.note || "---"}
                      </td>
                      <td className="px-6 py-4 text-stone-400 text-[11px]">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                      Chưa có phản hồi nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
