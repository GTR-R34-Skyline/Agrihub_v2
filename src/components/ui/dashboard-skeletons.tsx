import { Skeleton } from "@/components/ui/skeleton-loader";

export const CartItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
    <Skeleton className="h-20 w-20 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-6 w-20" />
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);
