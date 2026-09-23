"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminRouteGuard from "@/components/auth/AdminRouteGuard";
import { ApiClient } from "@/lib/api";
import {
  AdminPaymentOrder,
  AdminPaymentListResponse,
  OrderStatus,
} from "@/types/billing.types";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Eye,
  FileText,
  User,
  CreditCard,
  Building,
} from "lucide-react";

export default function AdminPaymentsPage() {
  return (
    <AdminRouteGuard>
      <AdminPaymentsContent />
    </AdminRouteGuard>
  );
}

function AdminPaymentsContent() {
  const [orders, setOrders] = useState<AdminPaymentOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("AWAITING_REVIEW");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [approveModalOrder, setApproveModalOrder] = useState<AdminPaymentOrder | null>(null);
  const [approveAmount, setApproveAmount] = useState<number>(0);
  const [approveBankRef, setApproveBankRef] = useState<string>("");
  const [approveNote, setApproveNote] = useState<string>("");

  const [rejectModalOrder, setRejectModalOrder] = useState<AdminPaymentOrder | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const [detailModalOrder, setDetailModalOrder] = useState<AdminPaymentOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (statusFilter && statusFilter !== "ALL") {
        queryParams.set("status", statusFilter);
      }

      const res = await ApiClient.request<AdminPaymentListResponse>(
        `/admin/payment-orders?${queryParams.toString()}`,
      );

      if (res.success && res.data) {
        setOrders(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Lỗi tải danh sách đơn thanh toán." });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenApprove = (order: AdminPaymentOrder) => {
    setApproveModalOrder(order);
    setApproveAmount(order.amount);
    setApproveBankRef("");
    setApproveNote("");
  };

  const handleConfirmApprove = async () => {
    if (!approveModalOrder) return;
    setActionLoading(true);
    try {
      const res = await ApiClient.request(`/admin/payment-orders/${approveModalOrder.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          receivedAmount: Number(approveAmount),
          bankReference: approveBankRef.trim() || undefined,
          note: approveNote.trim() || undefined,
        }),
      });

      if (res.success) {
        setFeedbackMsg({
          type: "success",
          text: `Đã duyệt đơn hàng #${approveModalOrder.orderCode}. Quyền lợi đã kích hoạt!`,
        });
        setApproveModalOrder(null);
        await fetchOrders();
      } else {
        setFeedbackMsg({
          type: "error",
          text: res.error || "Không thể duyệt đơn hàng.",
        });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Có lỗi khi gửi yêu cầu duyệt." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (order: AdminPaymentOrder) => {
    setRejectModalOrder(order);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    if (!rejectReason.trim()) {
      setFeedbackMsg({ type: "error", text: "Vui lòng nhập lý do từ chối." });
      return;
    }
    setActionLoading(true);
    try {
      const res = await ApiClient.request(`/admin/payment-orders/${rejectModalOrder.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });

      if (res.success) {
        setFeedbackMsg({
          type: "success",
          text: `Đã từ chối đơn hàng #${rejectModalOrder.orderCode}.`,
        });
        setRejectModalOrder(null);
        await fetchOrders();
      } else {
        setFeedbackMsg({
          type: "error",
          text: res.error || "Không thể từ chối đơn hàng.",
        });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Có lỗi khi gửi yêu cầu từ chối." });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "AWAITING_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
            <Clock className="w-3 h-3" />
            Chờ Duyệt
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Đã Thanh Toán
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" />
            Đã Từ Chối
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600">
            <Clock className="w-3 h-3" />
            Chờ Chuyển Tiền
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-500">
            Hết Hạn
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Hệ Thống Quản Trị</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              Duyệt Đơn Thanh Toán Thủ Công
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Kiểm tra thông tin sao kê ngân hàng và phê duyệt nâng cấp gói dịch vụ cho tài khoản.
            </p>
          </div>

          <button
            onClick={() => fetchOrders()}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-stone-200 hover:border-amber-400 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm Mới</span>
          </button>
        </div>

        {/* FEEDBACK ALERT */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* STATUS TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
          {[
            { key: "AWAITING_REVIEW", label: "Chờ Phê Duyệt" },
            { key: "ALL", label: "Tất Cả Đơn" },
            { key: "PAID", label: "Đã Thanh Toán" },
            { key: "REJECTED", label: "Đã Từ Chối" },
            { key: "PENDING", label: "Đang Chờ CK" },
            { key: "EXPIRED", label: "Đã Hết Hạn" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          {loading && orders.length === 0 ? (
            <div className="p-12 text-center text-stone-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
              <p className="text-xs font-medium">Đang tải danh sách đơn...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-stone-500 space-y-2">
              <p className="text-sm font-semibold">Không có đơn hàng nào phù hợp với bộ lọc</p>
              <p className="text-xs text-stone-400">
                Khi khách hàng gửi xác nhận chuyển khoản, đơn hàng sẽ hiển thị ở tab Chờ Phê Duyệt.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#FAF7F2] text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Mã Đơn / Ngày Tạo</th>
                    <th className="py-3.5 px-4">Tài Khoản / Khách Hàng</th>
                    <th className="py-3.5 px-4">Gói Yêu Cầu</th>
                    <th className="py-3.5 px-4">Số Tiền</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-stone-900 text-sm">#{order.orderCode}</div>
                        <div className="text-[11px] text-stone-400 font-sans mt-0.5">
                          Tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </div>
                        {order.submittedAt && (
                          <div className="text-[11px] text-amber-700 font-sans">
                            Gửi duyệt: {new Date(order.submittedAt).toLocaleTimeString("vi-VN")}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-stone-900">
                          {order.accountName || order.account?.name || "Tài khoản"}
                        </div>
                        <div className="text-stone-500 text-[11px]">
                          {order.buyerEmail || order.user?.email || "—"}
                        </div>
                        {order.user?.phone && (
                          <div className="text-stone-400 text-[11px]">{order.user.phone}</div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded-md font-bold uppercase text-[11px]">
                          {order.planName || order.plan?.name || "Gói dịch vụ"}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-1">
                          Hiện tại: {order.account?.currentPlan?.name || "FREE"}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-amber-700 text-sm">
                        {order.amount.toLocaleString("vi-VN")} đ
                      </td>

                      <td className="py-4 px-4">{getStatusBadge(order.status)}</td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailModalOrder(order)}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status === "AWAITING_REVIEW" && (
                            <>
                              <button
                                onClick={() => handleOpenApprove(order)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() => handleOpenReject(order)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Từ Chối</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="py-3 px-4 bg-[#FAF7F2] border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>
                Tổng số <strong>{total}</strong> đơn hàng · Trang {page}/{totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: APPROVE ORDER */}
        {approveModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Xác Nhận Duyệt Đơn Thanh Toán</span>
                </div>
                <button
                  onClick={() => setApproveModalOrder(null)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 text-xs space-y-2 border border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">Mã đơn:</span>
                  <strong className="font-mono text-stone-900">#{approveModalOrder.orderCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Tài khoản:</span>
                  <span className="font-medium text-stone-900">
                    {approveModalOrder.accountName || approveModalOrder.account?.name || "Tài khoản"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Gói nâng cấp:</span>
                  <span className="font-bold text-amber-700">
                    {approveModalOrder.planName || approveModalOrder.plan?.name || "Gói dịch vụ"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Số tiền đơn:</span>
                  <span className="font-bold text-stone-900">
                    {approveModalOrder.amount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Số Tiền Thực Nhận (VND) *
                  </label>
                  <input
                    type="number"
                    value={approveAmount}
                    onChange={(e) => setApproveAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Phải lớn hơn hoặc bằng số tiền đơn ({approveModalOrder.amount.toLocaleString("vi-VN")} đ)
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Mã Tham Chiếu Ngân Hàng (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: FT2412345678"
                    value={approveBankRef}
                    onChange={(e) => setApproveBankRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Ghi Chú Nội Bộ (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: Đã khớp sao kê Vietcombank 10:15 sáng..."
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setApproveModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmApprove}
                  disabled={actionLoading || approveAmount < approveModalOrder.amount}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Xác Nhận Kích Hoạt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REJECT ORDER */}
        {rejectModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <XCircle className="w-5 h-5" />
                  <span>Từ Chối Đơn Hàng</span>
                </div>
                <button
                  onClick={() => setRejectModalOrder(null)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600">
                Đơn hàng #{rejectModalOrder.orderCode} sẽ chuyển sang trạng thái REJECTED. Lý do sẽ được hiển thị cho khách hàng xem.
              </p>

              <div>
                <label className="block font-bold text-stone-700 text-xs mb-1">
                  Lý Do Từ Chối *
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Không tìm thấy giao dịch chuyển khoản trên tài khoản ngân hàng..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRejectModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>Xác Nhận Từ Chối</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DETAIL ORDER */}
        {detailModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Chi Tiết Đơn Hàng</h3>
                  <p className="font-mono text-xs text-amber-700">#{detailModalOrder.orderCode}</p>
                </div>
                <button
                  onClick={() => setDetailModalOrder(null)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* STATUS & PLAN */}
                <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Trạng thái</span>
                    <div className="mt-1">{getStatusBadge(detailModalOrder.status)}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Gói dịch vụ</span>
                    <span className="text-stone-900 font-bold block mt-1">
                      {detailModalOrder.planName || detailModalOrder.plan?.name || "Gói dịch vụ"} ({detailModalOrder.amount.toLocaleString("vi-VN")} đ)
                    </span>
                  </div>
                </div>

                {/* ACCOUNT & USER */}
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                    Thông Tin Khách Hàng
                  </h4>
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tài khoản:</span>
                      <strong className="text-stone-900">
                        {detailModalOrder.accountName || detailModalOrder.account?.name || "Tài khoản"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Người mua:</span>
                      <span className="text-stone-900">
                        {detailModalOrder.buyerName || detailModalOrder.user?.name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Email:</span>
                      <span className="text-stone-900">
                        {detailModalOrder.buyerEmail || detailModalOrder.user?.email || "—"}
                      </span>
                    </div>
                    {detailModalOrder.user?.phone && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Số điện thoại:</span>
                        <span className="text-stone-900">{detailModalOrder.user?.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIMESTAMPS */}
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                    Nhật Ký Thời Gian
                  </h4>
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Thời gian tạo:</span>
                      <span>{new Date(detailModalOrder.createdAt).toLocaleString("vi-VN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Hết hạn đơn:</span>
                      <span>{new Date(detailModalOrder.expiredAt).toLocaleString("vi-VN")}</span>
                    </div>
                    {detailModalOrder.submittedAt && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Khách gửi xác nhận:</span>
                        <span className="text-amber-700 font-medium">
                          {new Date(detailModalOrder.submittedAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                    {detailModalOrder.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Thời gian duyệt:</span>
                        <span className="text-emerald-700 font-medium">
                          {new Date(detailModalOrder.reviewedAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* REVIEW AUDIT NOTE */}
                {detailModalOrder.reviewNote && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                      Ghi Chú Ban Quản Trị
                    </h4>
                    <p className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-stone-800">
                      {detailModalOrder.reviewNote}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setDetailModalOrder(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
