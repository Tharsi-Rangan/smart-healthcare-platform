import { motion } from "framer-motion";

/**
 * A reusable Skeleton component for shimmering loading states.
 */
function Skeleton({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`rounded-xl bg-slate-200 ${className}`}
    />
  );
}

/**
 * Pre-baked skeleton patterns for common UI elements.
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function ProfilePreviewSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="mt-6 h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-24" />
        <Skeleton className="mt-8 h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function CardSectionSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-10 rounded-2xl" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
