"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production: gửi về Sentry/Datadog nếu có
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-stone-50 to-rose-50">
      <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <div className="text-center max-w-md">
        <h1
          className="text-2xl font-semibold text-stone-800 mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Có lỗi xảy ra
        </h1>
        <p className="text-stone-500 leading-relaxed">
          Trang này gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về
          trang chủ. Nếu lỗi tiếp tục, hãy liên hệ hỗ trợ.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors shadow-sm"
        >
          Thử lại
        </button>
        <a
          href="/"
          className="px-6 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-full hover:bg-stone-50 transition-colors"
        >
          Về trang chủ
        </a>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-left max-w-lg w-full">
          <summary className="text-xs text-stone-400 cursor-pointer">
            Chi tiết lỗi (dev only)
          </summary>
          <pre className="mt-2 p-3 bg-stone-100 rounded-lg text-xs text-rose-700 overflow-auto whitespace-pre-wrap">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>
      )}
    </div>
  );
}
