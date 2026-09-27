export default function AdminBlogsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-80 rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Table Skeleton */}
      <div 
        className="rounded-2xl border p-6 space-y-4"
        style={{
          background: 'var(--paper-2)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              background: 'var(--paper)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
