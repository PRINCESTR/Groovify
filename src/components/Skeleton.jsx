import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
};

export const SongCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <Skeleton className="w-full aspect-square" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};

export default Skeleton;
