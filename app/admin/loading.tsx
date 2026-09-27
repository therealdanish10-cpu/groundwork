export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="space-y-2">
          <div className="h-4 w-28 rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-72 rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border space-y-4"
            style={{
              background: 'var(--paper-2)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Content Table / List Skeleton */}
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{
          background: 'var(--paper-2)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              background: 'var(--paper)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-44 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
            <div className="h-7 w-16 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
