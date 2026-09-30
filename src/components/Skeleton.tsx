import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const FoodCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
    <Skeleton className="h-40 w-full rounded-lg" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  </div>
);

export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
    <div className="flex justify-between">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-8 w-full rounded-lg" />
  </div>
);

export const StatusCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-10 w-16 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);
