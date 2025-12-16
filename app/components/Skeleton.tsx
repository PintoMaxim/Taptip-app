interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-black rounded-2xl p-5 animate-pulse">
      <div className="skeleton h-3 w-20 mb-2" />
      <div className="skeleton h-8 w-32 mb-5" />
      <div className="flex gap-6">
        <div>
          <div className="skeleton h-2 w-16 mb-2" />
          <div className="skeleton h-5 w-20" />
        </div>
        <div>
          <div className="skeleton h-2 w-16 mb-2" />
          <div className="skeleton h-5 w-8" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonButton() {
  return (
    <div className="flex-1 h-16 rounded-xl skeleton" />
  )
}

export function SkeletonActivity() {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="skeleton w-9 h-9 rounded-full" />
      <div className="flex-1">
        <div className="skeleton h-3 w-24 mb-2" />
        <div className="skeleton h-2 w-16" />
      </div>
      <div className="skeleton h-4 w-12" />
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.12)] p-6">
      <div className="flex justify-center">
        <div className="skeleton w-24 h-24 rounded-full" />
      </div>
      <div className="skeleton h-6 w-32 mx-auto mt-4" />
      <div className="skeleton h-4 w-20 mx-auto mt-2" />
      <div className="skeleton h-8 w-24 mx-auto mt-3 rounded-full" />
    </div>
  )
}

