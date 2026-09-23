"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, Check, Loader2, Heart, Calendar, MapPin, Users, QrCode } from "lucide-react";
import { ApiClient } from "@/lib/api";

export default function WeddingProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Profile fields
  const [groomName, setGroomName] = useState("");
  const [groomFather, setGroomFather] = useState("");
  const [groomMother, setGroomMother] = useState("");
  const [groomPhone, setGroomPhone] = useState("");
  const [groomAddress, setGroomAddress] = useState("");

  const [brideName, setBrideName] = useState("");
  const [brideFather, setBrideFather] = useState("");
  const [brideMother, setBrideMother] = useState("");
  const [bridePhone, setBridePhone] = useState("");
  const [brideAddress, setBrideAddress] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [eventHour, setEventHour] = useState("10 AM");
  const [eventMinute, setEventMinute] = useState("30");
  const [address, setAddress] = useState("");

  const [bankGroom, setBankGroom] = useState({ bankCode: "MB", accountNumber: "", accountName: "" });
  const [bankBride, setBankBride] = useState({ bankCode: "VCB", accountNumber: "", accountName: "" });

  useEffect(() => {
    let isMounted = true;
    ApiClient.request<any>("/user/wedding-profile")
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          const d = res.data;
          setGroomName(d.groomName || "");
          setGroomFather(d.groomFather || "");
          setGroomMother(d.groomMother || "");
          setGroomPhone(d.groomPhone || "");
          setGroomAddress(d.groomAddress || "");
          setBrideName(d.brideName || "");
          setBrideFather(d.brideFather || "");
          setBrideMother(d.brideMother || "");
          setBridePhone(d.bridePhone || "");
          setBrideAddress(d.brideAddress || "");
          setEventDate(d.eventDate || "");
          setEventHour(d.eventHour || "10 AM");
          setEventMinute(d.eventMinute || "30");
          setAddress(d.address || "");
          if (d.bankGroom) setBankGroom(d.bankGroom);
          if (d.bankBride) setBankBride(d.bankBride);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {
        groomName,
        groomFather,
        groomMother,
        groomPhone,
        groomAddress,
        brideName,
        brideFather,
        brideMother,
        bridePhone,
        brideAddress,
        eventDate,
        eventHour,
        eventMinute,
        address,
        bankGroom,
        bankBride,
      };

      const res = await ApiClient.request("/user/wedding-profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#BE944E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/cards"
              className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
                <span>Hồ Sơ Cưới Của Tôi</span>
                <Sparkles className="w-5 h-5 text-[#BE944E]" />
              </h1>
              <p className="text-xs text-stone-500">
                Lưu thông tin 1 lần để hệ thống tự động điền sẵn mỗi khi bạn tạo thiệp mới.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#BE944E] to-[#966E29] hover:opacity-95 text-white text-xs font-bold shadow-md flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Đang lưu..." : "Lưu Hồ Sơ"}</span>
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu thông tin hồ sơ cưới thành công! Các thiệp mới tạo sẽ tự động được điền sẵn.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. THÔNG TIN CHÚ RỂ */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE2D6] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Heart className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Nhà Trai (Chú Rể)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Tên chú rể</label>
                <input
                  type="text"
                  placeholder="VD: Trần Minh Quân"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Số điện thoại chú rể</label>
                <input
                  type="text"
                  placeholder="VD: 0988 888 888"
                  value={groomPhone}
                  onChange={(e) => setGroomPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-600 block mb-1">Bố chú rể</label>
                <input
                  type="text"
                  placeholder="Họ tên bố"
                  value={groomFather}
                  onChange={(e) => setGroomFather(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-600 block mb-1">Mẹ chú rể</label>
                <input
                  type="text"
                  placeholder="Họ tên mẹ"
                  value={groomMother}
                  onChange={(e) => setGroomMother(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-600 block mb-1">Địa chỉ nhà trai</label>
                <input
                  type="text"
                  placeholder="VD: 45 Đường ABC, Phường 1, TP. Đà Lạt"
                  value={groomAddress}
                  onChange={(e) => setGroomAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          {/* 2. THÔNG TIN CÔ DÂU */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE2D6] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Heart className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Nhà Gái (Cô Dâu)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Tên cô dâu</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Thu Hà"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Số điện thoại cô dâu</label>
                <input
                  type="text"
                  placeholder="VD: 0977 777 777"
                  value={bridePhone}
                  onChange={(e) => setBridePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-600 block mb-1">Bố cô dâu</label>
                <input
                  type="text"
                  placeholder="Họ tên bố"
                  value={brideFather}
                  onChange={(e) => setBrideFather(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-600 block mb-1">Mẹ cô dâu</label>
                <input
                  type="text"
                  placeholder="Họ tên mẹ"
                  value={brideMother}
                  onChange={(e) => setBrideMother(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-600 block mb-1">Địa chỉ nhà gái</label>
                <input
                  type="text"
                  placeholder="VD: 78 Đường XYZ, Quận 3, TP.HCM"
                  value={brideAddress}
                  onChange={(e) => setBrideAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          {/* 3. NGÀY GIỜ & ĐỊA ĐIỂM TIỆC CHÍNH */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE2D6] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Thời Gian & Địa Điểm Tiệc</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Ngày tổ chức tiệc cưới</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Giờ tổ chức</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="VD: 11:00 AM"
                    value={eventHour}
                    onChange={(e) => setEventHour(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                  />
                  <input
                    type="text"
                    placeholder="30"
                    value={eventMinute}
                    onChange={(e) => setEventMinute(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Địa chỉ trung tâm tiệc cưới</label>
                <input
                  type="text"
                  placeholder="VD: Trung tâm Hội nghị Asiana Plaza, 45 Phan Đăng Lưu, Bình Thạnh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          {/* 4. TÀI KHOẢN MỪNG CƯỚI VIETQR */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE2D6] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Tài Khoản Mừng Cưới (VietQR)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Chú rể */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-800 block">Tài khoản Chú Rể</span>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-0.5">Ngân hàng</label>
                  <input
                    type="text"
                    placeholder="VD: MB, VCB, Techcombank"
                    value={bankGroom.bankCode}
                    onChange={(e) => setBankGroom({ ...bankGroom, bankCode: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-0.5">Số tài khoản</label>
                  <input
                    type="text"
                    placeholder="VD: 0988888888"
                    value={bankGroom.accountNumber}
                    onChange={(e) => setBankGroom({ ...bankGroom, accountNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-0.5">Chủ tài khoản</label>
                  <input
                    type="text"
                    placeholder="VD: TRAN MINH QUAN"
                    value={bankGroom.accountName}
                    onChange={(e) => setBankGroom({ ...bankGroom, accountName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white uppercase"
                  />
                </div>
              </div>

              {/* Cô dâu */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-stone-800 block">Tài khoản Cô Dâu</span>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-0.5">Ngân hàng</label>
                  <input
                    type="text"
                    placeholder="VD: VCB, MB, ACB"
                    value={bankBride.bankCode}
                    onChange={(e) => setBankBride({ ...bankBride, bankCode: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-0.5">Số tài khoản</label>
                  <input
                    type="text"
                    placeholder="VD: 9988776655"
                    value={bankBride.accountNumber}
                    onChange={(e) => setBankBride({ ...bankBride, accountNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-0.5">Chủ tài khoản</label>
                  <input
                    type="text"
                    placeholder="VD: NGUYEN THU HA"
                    value={bankBride.accountName}
                    onChange={(e) => setBankBride({ ...bankBride, accountName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-[#BE944E] to-[#966E29] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi Hồ Sơ Cưới"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
