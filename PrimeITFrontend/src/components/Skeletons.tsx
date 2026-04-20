import React from 'react';

export const CardSkeleton = () => (
  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
        <div className="space-y-3">
          <div className="h-5 w-40 bg-white/10 rounded-lg"></div>
          <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
        </div>
      </div>
      <div className="h-8 w-20 bg-white/10 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-3 w-full bg-white/10 rounded-lg"></div>
      <div className="h-3 w-5/6 bg-white/10 rounded-lg"></div>
    </div>
    <div className="flex gap-3">
      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
