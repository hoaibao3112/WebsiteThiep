"use client";

import React, { useState, useEffect } from "react";
import { PLANS, PlanConfig, getLocalizedPlans } from "@/config/plans";
import { useLanguage } from "@/context/LanguageContext";
import { ApiClient } from "@/lib/api";
import {
  Crown,
  CheckCircle2,
  QrCode,
  Sparkles,
  Check,
  Copy,
  Clock,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function BillingPage() {
  const { t } = useLanguage();
  const localizedPlans = getLocalizedPlans(t);
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig>(localizedPlans[2] || PLANS[2]); // Default VIP
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tạo đơn hàng khi bấm nâng cấp
  const handleCreateOrder = async (plan: PlanConfig) => {
    setSelectedPlan(plan);
    setLoading(true);
    setOrderData(null);
    setIsPaid(false);

    const res = await ApiClient.request("/orders", {
      method: "POST",
      body: JSON.stringify({
        cardId: "demo-card-id",
        planId: plan.code,
      }),
    });

    setLoading(false);
    if (res.success && res.data) {
      setOrderData(res.data.paymentInfo);
    } else {
      // Mock payment info for testing demo
      const mockCode = `THIEP${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderData({
        orderCode: mockCode,
        amount: plan.price,
        bankCode: "MB",
        bankAccount: "0988888888",
        bankAccountName: "NGUYEN VAN A",
        qrUrl: `https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${plan.price}&addInfo=${mockCode}&accountName=NGUYEN%20VAN%20A`,
      });
    }
  };

  // Polling trạng thái đơn hàng mỗi 3 giây
  useEffect(() => {
    if (!orderData || isPaid) return;

    const interval = setInterval(async () => {
      const res = await ApiClient.request(`/orders/${orderData.orderCode}/status`);
      if (res.success && res.data && res.data.status === "PAID") {
        setIsPaid(true);
        clearInterval(interval);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderData, isPaid]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>Nâng Cấp Gói Dịch Vụ</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-stone-900">
            Mở Khóa Toàn Bộ Tính Năng Cao Cấp
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Thanh toán tự động 100% qua VietQR. Gói VIP kích hoạt tức thì sau 3 giây quét mã.
          </p>
        </div>

        {/* BẢNG CHỌN GÓI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {localizedPlans.map((plan) => (
            <div
              key={plan.code}
              className={`bg-white rounded-3xl p-6 border transition flex flex-col justify-between ${
                selectedPlan.code === plan.code
                  ? "border-amber-500 shadow-xl ring-2 ring-amber-500/20"
                  : "border-stone-200/80 shadow-xs"
              }`}
            >
              <div>
                {plan.badge && (
                  <span className="inline-block px-3 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase mb-2">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-stone-900">{plan.name}</h3>
                <div className="my-3">
                  <span className="text-2xl font-extrabold text-stone-900">
                    {plan.price.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-stone-400 ml-1">
                    / {plan.durationLabel}
                  </span>
                </div>

                <div className="space-y-2 my-4 text-xs text-stone-600">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleCreateOrder(plan)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer mt-4 ${
                  selectedPlan.code === plan.code
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                }`}
              >
                {selectedPlan.code === plan.code ? "Đang Chọn" : "Nâng Cấp Gói Này"}
              </button>
            </div>
          ))}
        </div>

        {/* POPUP THANH TOÁN VIETQR SEPAY TỰ ĐỘNG */}
        {orderData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xl max-w-lg mx-auto text-center space-y-6">
            {isPaid ? (
              <div className="py-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-900">
                  Thanh Toán Thành Công! 🎉
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Gói dịch vụ đã được kích hoạt thành công cho thiệp của bạn.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-bold font-serif text-stone-900">
                    Quét Mã VietQR Để Kích Hoạt
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Mở ứng dụng ngân hàng và quét mã để thanh toán tự động
                  </p>
                </div>

                {/* QR CODE */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={orderData.qrUrl}
                    alt="VietQR Payment"
                    className="w-56 h-56 object-contain rounded-lg mx-auto"
                  />
                </div>

                {/* THÔNG TIN CHUYỂN KHOẢN */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Số tiền:</span>
                    <span className="font-bold text-amber-600 text-sm">
                      {orderData.amount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-500">Ngân hàng:</span>
                    <span className="font-semibold text-stone-900">
                      {orderData.bankCode} - {orderData.bankAccountName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">
                        {orderData.bankAccount}
                      </span>
                      <button
                        onClick={() => handleCopy(orderData.bankAccount)}
                        className="p-1 rounded-md hover:bg-stone-200 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                    <span className="text-stone-500">Nội dung CK:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {orderData.orderCode}
                      </span>
                      <button
                        onClick={() => handleCopy(orderData.orderCode)}
                        className="p-1 rounded-md hover:bg-stone-200 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-amber-700 font-medium">
                  <Clock className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Hệ thống đang chờ nhận tiền để kích hoạt tự động...</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
