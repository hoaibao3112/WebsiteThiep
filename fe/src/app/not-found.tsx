import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-stone-50 to-amber-50/30">
      <div className="w-20 h-20 rounded-full bg-amber-100/80 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
          />
        </svg>
      </div>

      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-stone-300 mb-4">404</p>
        <h1
          className="text-2xl font-semibold text-stone-800 mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Không tìm thấy trang
        </h1>
        <p className="text-stone-500 leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy kiểm
          tra lại đường dẫn hoặc quay về trang chủ.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors shadow-sm"
        >
          Về trang chủ
        </Link>
        <Link
          href="/thiep-mau"
          className="px-6 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-full hover:bg-stone-50 transition-colors"
        >
          Xem thiệp mẫu
        </Link>
      </div>
    </div>
  );
}
