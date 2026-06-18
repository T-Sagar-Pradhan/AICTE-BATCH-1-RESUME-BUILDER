export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-dark-700 border-t-brand-500 animate-spin" />
        <p className="text-dark-500 text-sm">Loading…</p>
      </div>
    </div>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card animate-pulse">
      <div className="h-5 bg-dark-700 rounded-lg w-3/4 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-dark-700 rounded mb-2" style={{ width: `${80 - i * 10}%` }} />
      ))}
    </div>
  )
}
