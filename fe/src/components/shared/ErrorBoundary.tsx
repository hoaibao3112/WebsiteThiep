"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary — bắt mọi render error trong React tree
 * Hiển thị UI phục hồi thân thiện thay vì crash toàn bộ trang
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log lỗi — trong production có thể gửi về Sentry/Datadog
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-800 mb-1">
              Có lỗi xảy ra
            </h2>
            <p className="text-sm text-stone-500 max-w-sm">
              Trang này gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors"
            >
              Thử lại
            </button>
            <a
              href="/"
              className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
            >
              Về trang chủ
            </a>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4 text-left max-w-lg w-full">
              <summary className="text-xs text-stone-400 cursor-pointer">Chi tiết lỗi (dev only)</summary>
              <pre className="mt-2 p-3 bg-stone-100 rounded text-xs text-rose-700 overflow-auto whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
