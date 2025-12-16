export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header Skeleton */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 skeleton rounded-full" />
            <div className="w-32 h-5 skeleton" />
          </div>
          <div className="w-10 h-10 skeleton rounded-full" />
        </header>

        <main className="px-5 py-5 space-y-5">
          {/* Stats Card Skeleton */}
          <div className="bg-gray-100 rounded-2xl p-5 animate-pulse">
            <div className="w-20 h-3 bg-gray-200 rounded mb-2" />
            <div className="w-32 h-8 bg-gray-200 rounded mb-5" />
            <div className="flex gap-6">
              <div>
                <div className="w-24 h-2 bg-gray-200 rounded mb-2" />
                <div className="w-16 h-5 bg-gray-200 rounded" />
              </div>
              <div>
                <div className="w-20 h-2 bg-gray-200 rounded mb-2" />
                <div className="w-8 h-5 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-3">
            <div className="flex-1 h-16 skeleton rounded-xl" />
            <div className="flex-1 h-16 skeleton rounded-xl" />
          </div>

          {/* Activity Section Skeleton */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="w-32 h-5 skeleton" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 skeleton rounded-full" />
                  <div className="flex-1">
                    <div className="w-24 h-3 skeleton mb-2" />
                    <div className="w-16 h-2 skeleton" />
                  </div>
                  <div className="w-12 h-5 skeleton" />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

