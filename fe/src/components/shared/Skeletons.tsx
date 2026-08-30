/**
 * Skeleton Loading Components — placeholder animations trong khi data đang load
 * Dùng thay cho spinner để giảm Cumulative Layout Shift (CLS)
 */

// Base skeleton pulse class
const skeletonBase = "animate-pulse bg-stone-200 rounded";

// -----------------------------------------------------------------------
// Card Skeleton — dùng trong trang dashboard danh sách thiệp
// -----------------------------------------------------------------------
export function CardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
      <div className={`${skeletonBase} h-40 w-full rounded-xl`} />
      <div className="space-y-2">
        <div className={`${skeletonBase} h-4 w-3/4`} />
        <div className={`${skeletonBase} h-3 w-1/2`} />
      </div>
      <div className="flex gap-2 pt-2">
        <div className={`${skeletonBase} h-8 w-20 rounded-full`} />
        <div className={`${skeletonBase} h-8 w-16 rounded-full`} />
      </div>
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Dashboard Stats Skeleton — dùng trong trang RSVP analytics
// -----------------------------------------------------------------------
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-2">
          <div className={`${skeletonBase} h-3 w-16`} />
          <div className={`${skeletonBase} h-8 w-12`} />
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Table Row Skeleton — dùng trong bảng danh sách RSVP
// -----------------------------------------------------------------------
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-stone-100">
        {[40, 20, 20, 20].map((w, i) => (
          <div key={i} className={`${skeletonBase} h-3`} style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-stone-50">
          {[40, 20, 20, 20].map((w, j) => (
            <div key={j} className={`${skeletonBase} h-4`} style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Profile Skeleton — dùng trong header sau khi đăng nhập
// -----------------------------------------------------------------------
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className={`${skeletonBase} w-8 h-8 rounded-full`} />
      <div className={`${skeletonBase} h-3 w-24`} />
    </div>
  );
}
