import { cn } from '@/lib/utils';

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted',
        className
      )}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="space-y-2 text-right">
      <Skeleton className="h-5 w-20 ml-auto" />
      <Skeleton className="h-6 w-16 ml-auto rounded-full" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-6 text-center">
    <Skeleton className="h-8 w-8 mx-auto mb-3 rounded-full" />
    <Skeleton className="h-8 w-20 mx-auto mb-2" />
    <Skeleton className="h-4 w-24 mx-auto" />
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative min-h-[90vh] flex items-center">
    <div className="container py-20">
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48 rounded-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-14 w-44 rounded-xl" />
          <Skeleton className="h-14 w-44 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 py-4 border-b border-border">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-8 w-24 rounded-lg" />
  </div>
);

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
