"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import {
  BillingSummary,
  PlanCatalogItem,
  PaymentOrder,
  PaymentInfo,
  CreateOrderResponse,
  PlanCode,
} from "@/types/billing.types";
import {
  Crown,
  CheckCircle2,
  Copy,
  Clock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

function BillingContent() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryPlan = searchParams.get("plan")?.toUpperCase() as PlanCode | undefined;

  const [loading, setLoading] = useState(true);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [catalog, setCatalog] = useState<PlanCatalogItem[]>([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState<PlanCode>(
    queryPlan === "BASIC" || queryPlan === "VIP" ? queryPlan : "VIP",
  );

  const [activeOrder, setActiveOrder] = useState<PaymentOrder | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [orderActionLoading, setOrderActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1. Fetch initial billing summary & catalog
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [summaryRes, plansRes] = await Promise.all([
        ApiClient.request<BillingSummary>("/billing/summary"),
        ApiClient.request<PlanCatalogItem[]>("/plans"),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setBillingSummary(summaryRes.data);
        if (summaryRes.data.activeOrder) {
          setActiveOrder(summaryRes.data.activeOrder);
        }
      }

      if (plansRes.success && plansRes.data) {
        const sorted = [...plansRes.data].sort((a, b) => a.sortOrder - b.sortOrder);
        setCatalog(sorted);
      }
    } catch {
      setErrorMessage("Không thể tải thông tin thanh toán. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Poll active order when in PENDING or AWAITING_REVIEW status
  useEffect(() => {
    if (!activeOrder) return;
    if (activeOrder.status !== "PENDING" && activeOrder.status !== "AWAITING_REVIEW") return;

    const intervalId = setInterval(async () => {
      try {
        const res = await ApiClient.request<PaymentOrder>(`/orders/${activeOrder.id}`);
        if (res.success && res.data) {
          const updated = res.data;
          setActiveOrder(updated);

          if (updated.status === "PAID") {
            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.6 },
            });
            await refreshUser();
            clearInterval(intervalId);
          } else if (updated.status === "REJECTED" || updated.status === "EXPIRED") {
            clearInterval(intervalId);
          }
        }
      } catch {
        // Silent failure on polling interval
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeOrder, refreshUser]);

  // 3. Create or reuse order (OWNER only)
  const handleCreateOrder = async (planCode: PlanCode) => {
    if (planCode === "FREE") return;
    setSelectedPlanCode(planCode);
    setOrderActionLoading(true);
    setErrorMessage(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await ApiClient.request<CreateOrderResponse>("/orders", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ planCode }),
      });

      if (res.success && res.data) {
        setActiveOrder(res.data.order);
        setPaymentInfo(res.data.paymentInfo);
      } else {
        setErrorMessage(res.error || "Không thể tạo đơn hàng. Vui lòng thử lại.");
      }
    } catch {
      setErrorMessage("Có lỗi kết nối đến máy chủ thanh toán.");
    } finally {
      setOrderActionLoading(false);
    }
  };

  // 4. Submit transfer confirmation (PENDING -> AWAITING_REVIEW)
  const handleSubmitTransfer = async () => {
    if (!activeOrder) return;
    setOrderActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await ApiClient.request<PaymentOrder>(`/orders/${activeOrder.id}/submit-transfer`, {
        method: "POST",
      });

      if (res.success && res.data) {
        setActiveOrder(res.data);
      } else {
        setErrorMessage(res.error || "Không thể gửi xác nhận chuyển khoản.");
      }
    } catch {
      setErrorMessage("Có lỗi khi gửi xác nhận chuyển khoản.");
    } finally {
      setOrderActionLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-stone-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mb-3" />
        <p className="text-sm font-medium">Đang tải thông tin gói dịch vụ & thanh toán...</p>
      </div>
    );
  }

  const userRole = billingSummary?.accountRole || user?.account?.role || "OWNER";
  const isOwner = billingSummary?.isOwner ?? (userRole === "OWNER");
  const currentPlan = billingSummary?.effectivePlan;
  const isVipUser = currentPlan?.planCode === "VIP" && !currentPlan.isExpired;

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>Nâng Cấp Gói Dịch Vụ Tài Khoản</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Mở Khóa Toàn Bộ Quyền Lợi Thiệp Cưới
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
            Gói dịch vụ áp dụng cho toàn bộ thiệp trong tài khoản của bạn. Chuyển khoản ngân hàng qua VietQR thuận tiện và an toàn.
          </p>
        </div>

        {/* CURRENT ENTITLEMENT STATUS */}
        {currentPlan && (
          <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Gói hiện tại:</span>
                  <span className="text-sm font-bold text-stone-900 uppercase">
                    {currentPlan.planName}
                  </span>
                  {currentPlan.isPaid && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                      {currentPlan.daysRemaining !== null
                        ? `Còn ${currentPlan.daysRemaining} ngày`
                        : "Vĩnh viễn"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Vai trò của bạn: <strong className="text-stone-700">{userRole}</strong>
                </p>
              </div>
            </div>

            {isVipUser && (
              <div className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                ✨ Tài khoản đã sở hữu VIP Vĩnh Viễn
              </div>
            )}
          </div>
        )}

        {/* MEMBER WARNING (NON-OWNER) */}
        {userRole === "MEMBER" && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">Bạn đang xem với tư cách Thành viên (Member)</p>
              <p className="text-amber-800">
                Chỉ Chủ tài khoản (Owner) mới có quyền khởi tạo đơn hàng và thanh toán nâng cấp. Vui lòng liên hệ chủ tài khoản nếu muốn mở khóa thêm tính năng.
              </p>
            </div>
          </div>
        )}

        {/* ERROR ALERT */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ACTIVE ORDER DRAWER / MODAL */}
        {activeOrder && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xl max-w-xl mx-auto space-y-6">
            {/* 1. ORDER: PAID */}
            {activeOrder.status === "PAID" && (
              <div className="py-6 flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-900">
                  Thanh Toán Thành Công! 🎉
                </h3>
                <p className="text-xs text-stone-600 max-w-sm">
                  Gói <strong>{activeOrder.planName}</strong> đã được kích hoạt thành công cho tài khoản của bạn.
                </p>
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => router.push("/dashboard/cards")}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    Xem Danh Sách Thiệp
                  </button>
                  <button
                    onClick={() => setActiveOrder(null)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* 2. ORDER: AWAITING_REVIEW */}
            {activeOrder.status === "AWAITING_REVIEW" && (
              <div className="py-4 space-y-5 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mx-auto">
                  <Clock className="w-7 h-7 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-serif text-stone-900">
                    Đang Chờ Admin Xác Nhận Thanh Toán
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    Hệ thống đã nhận được thông báo chuyển khoản của bạn cho đơn hàng{" "}
                    <strong className="text-stone-900 font-mono">#{activeOrder.orderCode}</strong>.
                    Ban quản trị sẽ đối soát và kích hoạt gói trong vòng 5 - 30 phút.
                  </p>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Mã đơn hàng:</span>
                    <span className="font-mono font-bold text-stone-900">{activeOrder.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Gói nâng cấp:</span>
                    <span className="font-bold text-stone-900">{activeOrder.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Số tiền chuyển:</span>
                    <span className="font-bold text-amber-700">
                      {activeOrder.amount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Thời gian gửi:</span>
                    <span className="text-stone-600">
                      {activeOrder.submittedAt
                        ? new Date(activeOrder.submittedAt).toLocaleTimeString("vi-VN")
                        : "Vừa xong"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Trang này sẽ tự động cập nhật khi đơn hàng được duyệt...</span>
                </div>
              </div>
            )}

            {/* 3. ORDER: REJECTED */}
            {activeOrder.status === "REJECTED" && (
              <div className="py-4 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-serif text-stone-900">
                    Đơn Hàng Không Được Duyệt
                  </h3>
                  <p className="text-xs text-stone-500">
                    Lý do: <strong className="text-rose-600">{activeOrder.reviewNote || "Không khớp thông tin thanh toán"}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Tạo Đơn Thanh Toán Khác
                </button>
              </div>
            )}

            {/* 4. ORDER: EXPIRED */}
            {activeOrder.status === "EXPIRED" && (
              <div className="py-4 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-serif text-stone-900">
                    Đơn Hàng Đã Hết Hạn
                  </h3>
                  <p className="text-xs text-stone-500">
                    Đơn hàng #{activeOrder.orderCode} đã quá 48 giờ chưa hoàn tất. Vui lòng tạo đơn mới.
                  </p>
                </div>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Tạo Đơn Mới
                </button>
              </div>
            )}

            {/* 5. ORDER: PENDING (TRANSFER & VIETQR INSTRUCTIONS) */}
            {activeOrder.status === "PENDING" && paymentInfo && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold font-serif text-stone-900">
                    Quét Mã VietQR Chuyển Khoản
                  </h3>
                  <p className="text-xs text-stone-500">
                    Mở app ngân hàng bất kỳ để quét mã QR và xác nhận chuyển tiền
                  </p>
                </div>

                {/* QR CODE DISPLAY */}
                {paymentInfo.qrUrl && (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={paymentInfo.qrUrl}
                      alt="VietQR Payment"
                      className="w-56 h-56 object-contain rounded-lg mx-auto"
                    />
                    <p className="text-[11px] text-stone-400 mt-2">
                      Mã đơn: <strong className="font-mono text-stone-700">{paymentInfo.orderCode}</strong> · Hạn thanh toán 48 giờ
                    </p>
                  </div>
                )}

                {/* BANK DETAILS WITH COPY BUTTONS */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Số tiền:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-600 text-sm">
                        {paymentInfo.amount.toLocaleString("vi-VN")} đ
                      </span>
                      <button
                        onClick={() => handleCopy(paymentInfo.amount.toString(), "amount")}
                        className="p-1 rounded-md hover:bg-stone-200 text-stone-500 cursor-pointer"
                        title="Sao chép"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Ngân hàng:</span>
                    <span className="font-semibold text-stone-900">
                      {paymentInfo.bankCode} ({paymentInfo.bankAccountName})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-stone-900">
                        {paymentInfo.bankAccount}
                      </span>
                      <button
                        onClick={() => handleCopy(paymentInfo.bankAccount || "", "account")}
                        className="p-1 rounded-md hover:bg-stone-200 text-stone-500 cursor-pointer"
                        title="Sao chép số tài khoản"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                    <span className="text-stone-500">Nội dung CK (bắt buộc):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {paymentInfo.orderCode}
                      </span>
                      <button
                        onClick={() => handleCopy(paymentInfo.orderCode, "code")}
                        className="p-1 rounded-md hover:bg-stone-200 text-stone-500 cursor-pointer"
                        title="Sao chép nội dung chuyển khoản"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {copiedKey && (
                  <p className="text-[11px] text-emerald-600 font-semibold text-center">
                    ✓ Đã sao chép vào bộ nhớ tạm!
                  </p>
                )}

                {/* SUBMIT CONFIRMATION BUTTON */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleSubmitTransfer}
                    disabled={orderActionLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {orderActionLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Tôi Đã Chuyển Khoản Thành Công</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-stone-400 text-center">
                    Sau khi bấm, đơn hàng sẽ chuyển sang trạng thái chờ ban quản trị phê duyệt.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRICING CARDS CATALOG */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {catalog.map((plan) => {
            const isSelected = selectedPlanCode === plan.code;
            const isCurrentPlan = currentPlan?.planCode === plan.code;
            const isFree = plan.code === "FREE";

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border transition flex flex-col justify-between ${
                  isSelected && !isFree
                    ? "border-amber-500 shadow-xl ring-2 ring-amber-500/20"
                    : "border-stone-200/80 shadow-xs hover:border-amber-300"
                }`}
              >
                <div>
                  {plan.code === "VIP" && (
                    <span className="inline-block px-3 py-0.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full text-[10px] font-bold uppercase mb-2 shadow-2xs">
                      ★ Cao cấp nhất
                    </span>
                  )}
                  {plan.code === "BASIC" && (
                    <span className="inline-block px-3 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase mb-2">
                      Phổ biến
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-stone-900">{plan.name}</h3>

                  <div className="my-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                      {plan.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-xs text-stone-400 ml-1">
                      / {plan.durationDays ? `${plan.durationDays} ngày` : "Vĩnh viễn"}
                    </span>
                  </div>

                  <div className="space-y-2.5 my-5 text-xs text-stone-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Tối đa {plan.maxPhotos} ảnh album</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          plan.hasWatermark ? "text-stone-300" : "text-emerald-500"
                        }`}
                      />
                      <span className={plan.hasWatermark ? "text-stone-400 line-through" : ""}>
                        Xóa hoàn toàn logo hệ thống
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          plan.allowMusicUpload ? "text-emerald-500" : "text-stone-300"
                        }`}
                      />
                      <span className={plan.allowMusicUpload ? "" : "text-stone-400"}>
                        Tự tải nhạc nền theo ý thích
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          plan.allowTelegramNoti ? "text-emerald-500" : "text-stone-300"
                        }`}
                      />
                      <span className={plan.allowTelegramNoti ? "" : "text-stone-400"}>
                        Thông báo RSVP qua Telegram Bot
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          plan.allowPremiumTemplates ? "text-emerald-500" : "text-stone-300"
                        }`}
                      />
                      <span className={plan.allowPremiumTemplates ? "" : "text-stone-400"}>
                        Mở khóa toàn bộ mẫu thiệp VIP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  {isFree ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-400 cursor-not-allowed"
                    >
                      {isCurrentPlan ? "Gói Mặc Định Hiện Tại" : "Gói Miễn Phí"}
                    </button>
                  ) : isVipUser ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 cursor-not-allowed border border-emerald-200"
                    >
                      Đã Sở Hữu VIP
                    </button>
                  ) : !isOwner ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-400 cursor-not-allowed"
                    >
                      Chỉ Chủ Tài Khoản Có Thể Nâng Cấp
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateOrder(plan.code)}
                      disabled={orderActionLoading}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                        isSelected
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                          : "bg-stone-900 hover:bg-stone-800 text-white"
                      }`}
                    >
                      {orderActionLoading && selectedPlanCode === plan.code
                        ? "Đang tạo đơn..."
                        : `Nâng Cấp ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
