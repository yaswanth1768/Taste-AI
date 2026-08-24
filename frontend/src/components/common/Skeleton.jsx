import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-4 flex flex-col space-y-3 animate-pulse">
    <div className="w-full aspect-[2/3] bg-slate-800/80 rounded-xl"></div>
    <div className="h-5 bg-slate-800/90 rounded-md w-3/4"></div>
    <div className="h-4 bg-slate-800/60 rounded-md w-1/2"></div>
    <div className="flex gap-2 pt-2">
      <div className="h-6 bg-slate-800/60 rounded-full w-16"></div>
      <div className="h-6 bg-slate-800/60 rounded-full w-14"></div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <CardSkeleton key={idx} />
    ))}
  </div>
);
