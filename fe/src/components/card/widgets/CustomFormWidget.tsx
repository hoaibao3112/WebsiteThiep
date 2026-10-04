"use client";

import React, { useState } from "react";
import { FileText, CheckCircle2, Loader2, Star } from "lucide-react";
import confetti from "canvas-confetti";
import type { CanvasWidgetConfig } from "@/types/canvas.types";

interface Props {
  config: CanvasWidgetConfig;
  cardId?: string;
  elementId?: string;
  isEditor?: boolean;
}

export function CustomFormWidget({ config, cardId, elementId, isEditor }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = config.customFormTitle || config.title || "Biểu Mẫu Tùy Chỉnh";
  const subtitle = config.customFormSubtitle || config.description;
  const buttonText = config.customFormButtonText || "Gửi Thông Tin";
  const buttonColor = config.customFormButtonColor || "#D4AF37";
  const successMessage = config.customFormSuccessMessage || "Cảm ơn bạn đã điền thông tin!";
  const fields = config.customFormFields && config.customFormFields.length > 0
    ? [...config.customFormFields].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : [
        { id: "default-name", type: "text" as const, label: "Họ và tên của bạn", placeholder: "Nhập họ tên...", required: true, sortOrder: 0 },
        { id: "default-phone", type: "phone" as const, label: "Số điện thoại", placeholder: "09xxxxxxxx", required: true, sortOrder: 1 },
      ];

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxToggle = (fieldId: string, opt: string) => {
    const current = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    const index = current.indexOf(opt);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(opt);
    }
    setFormData((prev) => ({ ...prev, [fieldId]: current }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditor) {
      alert("Đang ở chế độ chỉnh sửa thiệp. Form hoạt động khi khách xem thiệp thực tế.");
      return;
    }

    // Client validation
    for (const f of fields) {
      if (f.required) {
        const val = formData[f.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          setError(`Vui lòng điền thông tin "${f.label}"`);
          return;
        }
      }
    }

    if (!cardId || !elementId) {
      setError("Không tìm thấy thông tin thiệp để gửi biểu mẫu");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${cardId}/custom-form/${elementId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Gửi biểu mẫu thất bại");
      }

      setSubmitted(true);
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      } catch {}
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi gửi. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex size-full flex-col items-center justify-center p-4 text-center">
        <div className="rounded-2xl border border-amber-200 bg-white/95 p-5 shadow-sm max-w-sm w-full">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <CheckCircle2 className="size-6" />
          </div>
          <h4 className="text-sm font-bold text-stone-900 mb-1">Gửi Thành Công!</h4>
          <p className="text-xs text-stone-600 leading-relaxed">{successMessage}</p>
          {config.customFormAllowMultipleSubmit && (
            <button
              type="button"
              onClick={() => {
                setFormData({});
                setSubmitted(false);
              }}
              className="mt-3 text-[11px] text-amber-700 underline font-medium cursor-pointer"
            >
              Gửi một phản hồi khác
            </button>
          )}
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-xs text-stone-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition placeholder:text-stone-400";

  return (
    <div className="flex size-full flex-col items-center justify-center p-3">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200/70 bg-white/95 p-4 shadow-sm backdrop-blur-xs">
        <div className="text-center mb-3">
          <div className="inline-flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-900 mb-1">
            <FileText className="size-4" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">{title}</h3>
          {subtitle && <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{subtitle}</p>}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.id} className="flex flex-col gap-1 text-left">
              <label className="text-xs font-medium text-stone-700">
                {f.label} {f.required && <span className="text-rose-500">*</span>}
              </label>

              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  required={f.required}
                  placeholder={f.placeholder || "Nhập nội dung..."}
                  className={inputClass}
                  value={formData[f.id] || ""}
                  onChange={(e) => handleFieldChange(f.id, e.target.value)}
                />
              ) : f.type === "select" ? (
                <select
                  required={f.required}
                  className={inputClass}
                  value={formData[f.id] || ""}
                  onChange={(e) => handleFieldChange(f.id, e.target.value)}
                >
                  <option value="">-- Chọn lựa chọn --</option>
                  {(f.options || []).map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === "radio" ? (
                <div className="flex flex-col gap-1.5 pt-0.5">
                  {(f.options || []).map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="radio"
                        name={f.id}
                        value={opt}
                        checked={formData[f.id] === opt}
                        onChange={() => handleFieldChange(f.id, opt)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : f.type === "checkbox" ? (
                <div className="flex flex-col gap-1.5 pt-0.5">
                  {(f.options || []).map((opt, idx) => {
                    const checked = Array.isArray(formData[f.id]) && formData[f.id].includes(opt);
                    return (
                      <label key={idx} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCheckboxToggle(f.id, opt)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : f.type === "rating" ? (
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleFieldChange(f.id, star)}
                      className="cursor-pointer p-0.5 text-stone-300 transition hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`size-6 ${
                          Number(formData[f.id] || 0) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  {formData[f.id] && (
                    <span className="text-xs font-semibold text-amber-700 ml-1.5">
                      {formData[f.id]} / 5 sao
                    </span>
                  )}
                </div>
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                  required={f.required}
                  placeholder={f.placeholder || `Nhập ${f.label.toLowerCase()}...`}
                  className={inputClass}
                  value={formData[f.id] || ""}
                  onChange={(e) => handleFieldChange(f.id, e.target.value)}
                />
              )}
            </div>
          ))}

          {error && <p className="text-[11px] text-rose-600 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-98 disabled:opacity-60 cursor-pointer mt-1"
            style={{ backgroundColor: buttonColor }}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
            <span>{buttonText}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
