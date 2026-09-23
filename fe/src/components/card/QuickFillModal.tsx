"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Plus, Trash2, Calendar, Clock, MapPin, Check, Loader2 } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { uploadSingleImage } from "@/lib/image-upload";

export interface QuickFillData {
  groomName: string;
  groomFather: string;
  groomMother: string;
  brideName: string;
  brideFather: string;
  brideMother: string;
  eventDate: string;
  eventHour: string;
  eventMinute: string;
  address: string;
  photos: { id: string; url: string; caption?: string }[];
}

interface QuickFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: QuickFillData) => void;
  initialData?: Partial<QuickFillData>;
}

export function QuickFillModal({
  isOpen,
  onClose,
  onApply,
  initialData,
}: QuickFillModalProps) {
  const [groomName, setGroomName] = useState(initialData?.groomName || "");
  const [groomFather, setGroomFather] = useState(initialData?.groomFather || "");
  const [groomMother, setGroomMother] = useState(initialData?.groomMother || "");

  const [brideName, setBrideName] = useState(initialData?.brideName || "");
  const [brideFather, setBrideFather] = useState(initialData?.brideFather || "");
  const [brideMother, setBrideMother] = useState(initialData?.brideMother || "");

  const [eventDate, setEventDate] = useState(initialData?.eventDate || "");
  const [eventHour, setEventHour] = useState(initialData?.eventHour || "10");
  const [eventPeriod, setEventPeriod] = useState<"AM" | "PM">("AM");
  const [eventMinute, setEventMinute] = useState(initialData?.eventMinute || "30");

  const [address, setAddress] = useState(initialData?.address || "");
  const [photos, setPhotos] = useState<{ id: string; url: string; caption?: string }[]>(
    initialData?.photos || []
  );

  const [hasProfile, setHasProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingToProfile, setSavingToProfile] = useState(true); // Default checked
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [filledFromProfileToast, setFilledFromProfileToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has saved profile in DB
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    ApiClient.request<{ weddingProfile?: any }>("/user/wedding-profile")
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setHasProfile(true);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Load from profile
  const handleLoadFromProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await ApiClient.request<any>("/user/wedding-profile");
      if (res.success && res.data) {
        const p = res.data;
        if (p.groomName) setGroomName(p.groomName);
        if (p.groomFather) setGroomFather(p.groomFather);
        if (p.groomMother) setGroomMother(p.groomMother);
        if (p.brideName) setBrideName(p.brideName);
        if (p.brideFather) setBrideFather(p.brideFather);
        if (p.brideMother) setBrideMother(p.brideMother);
        if (p.eventDate) setEventDate(p.eventDate);
        if (p.eventHour) setEventHour(p.eventHour);
        if (p.eventMinute) setEventMinute(p.eventMinute);
        if (p.address) setAddress(p.address);
        if (Array.isArray(p.photos) && p.photos.length > 0) {
          setPhotos(p.photos);
        }
        setFilledFromProfileToast(true);
        setTimeout(() => setFilledFromProfileToast(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Upload photos
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploadingPhotos(true);
    const newItems: { id: string; url: string; caption?: string }[] = [];

    for (const file of files.slice(0, 20 - photos.length)) {
      try {
        const safeUrl = await uploadSingleImage(file);
        newItems.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          url: safeUrl,
          caption: file.name.replace(/\.[^.]+$/, ""),
        });
      } catch {
        const base64Url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newItems.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          url: base64Url,
          caption: file.name.replace(/\.[^.]+$/, ""),
        });
      }
    }

    setPhotos((prev) => [...prev, ...newItems].slice(0, 20));
    setUploadingPhotos(false);
    e.target.value = "";
  };

  const handleContinue = async () => {
    const data: QuickFillData = {
      groomName: groomName.trim(),
      groomFather: groomFather.trim(),
      groomMother: groomMother.trim(),
      brideName: brideName.trim(),
      brideFather: brideFather.trim(),
      brideMother: brideMother.trim(),
      eventDate,
      eventHour: `${eventHour} ${eventPeriod}`,
      eventMinute,
      address: address.trim(),
      photos,
    };

    // If checkbox checked, update user profile in backend
    if (savingToProfile) {
      ApiClient.request("/user/wedding-profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }).catch(() => {});
    }

    onApply(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 font-sans text-stone-900">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
              Điền nhanh thông tin thiệp
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Nhập thông tin để hệ thống điền sẵn vào thiệp. Bạn có thể bỏ trống hoặc bỏ qua bước này.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Profile Autofill Button */}
        {hasProfile && (
          <div className="px-6 pt-3 pb-0 shrink-0">
            <button
              type="button"
              onClick={handleLoadFromProfile}
              disabled={loadingProfile}
              className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
            >
              {loadingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-600" />
              )}
              <span>⚡ Điền sẵn từ Hồ sơ tài khoản của tôi</span>
            </button>
            {filledFromProfileToast && (
              <p className="text-[11px] text-emerald-600 font-bold text-center mt-1 flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> Đã nạp thành công thông tin từ tài khoản!
              </p>
            )}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
          {/* Tên chú rể */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Tên chú rể</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Minh"
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
            />
          </div>

          {/* Bố & Mẹ chú rể */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-600 block mb-1">Bố chú rể</label>
              <input
                type="text"
                placeholder="Họ tên"
                value={groomFather}
                onChange={(e) => setGroomFather(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-600 block mb-1">Mẹ chú rể</label>
              <input
                type="text"
                placeholder="Họ tên"
                value={groomMother}
                onChange={(e) => setGroomMother(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Tên cô dâu */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Tên cô dâu</label>
            <input
              type="text"
              placeholder="VD: Trần Lan"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
            />
          </div>

          {/* Bố & Mẹ cô dâu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-600 block mb-1">Bố cô dâu</label>
              <input
                type="text"
                placeholder="Họ tên"
                value={brideFather}
                onChange={(e) => setBrideFather(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-600 block mb-1">Mẹ cô dâu</label>
              <input
                type="text"
                placeholder="Họ tên"
                value={brideMother}
                onChange={(e) => setBrideMother(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Ngày & Giờ tổ chức */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1.5">Ngày tổ chức</label>
              <div className="relative">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1.5">Giờ tổ chức</label>
              <div className="grid grid-cols-3 gap-1.5">
                <select
                  value={eventHour}
                  onChange={(e) => setEventHour(e.target.value)}
                  className="px-2 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-amber-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={String(h)}>
                      {h}
                    </option>
                  ))}
                </select>

                <select
                  value={eventMinute}
                  onChange={(e) => setEventMinute(e.target.value)}
                  className="px-2 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:border-amber-500"
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={eventPeriod}
                  onChange={(e) => setEventPeriod(e.target.value as "AM" | "PM")}
                  className="px-2 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="AM">AM (Sáng)</option>
                  <option value="PM">PM (Chiều)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Địa chỉ tổ chức */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Địa chỉ tổ chức</label>
            <input
              type="text"
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-stone-50/50 text-xs text-stone-900"
            />
          </div>

          {/* Tải ảnh cưới (Tối đa 20 ảnh) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-700">Ảnh cưới</label>
              <span className="text-[11px] text-stone-400 font-mono">{photos.length}/20 ảnh</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <div className="flex flex-wrap gap-2">
              {photos.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="relative w-16 h-16 rounded-xl border border-stone-200 overflow-hidden group bg-stone-100 shrink-0"
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4 text-rose-300" />
                  </button>
                </div>
              ))}

              {photos.length < 20 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhotos}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 hover:bg-amber-50/40 text-stone-500 flex flex-col items-center justify-center gap-1 transition cursor-pointer shrink-0"
                >
                  {uploadingPhotos ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span className="text-[9px] font-semibold">Chọn ảnh</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              Tối đa 20 ảnh. Ảnh sẽ được tự động thay vào các phần đang có ảnh trên thiệp.
            </p>
          </div>

          {/* Checkbox: Lưu vào hồ sơ */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={savingToProfile}
                onChange={(e) => setSavingToProfile(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 accent-amber-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-stone-600 font-medium">
                Lưu thông tin này vào hồ sơ tài khoản của tôi để dùng cho các thiệp sau
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-3 shrink-0 bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition text-center"
          >
            Bỏ qua
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 py-3 px-4 rounded-full bg-[#FFD700] hover:bg-[#F5CC00] text-stone-900 text-xs font-extrabold shadow-sm transition text-center"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
