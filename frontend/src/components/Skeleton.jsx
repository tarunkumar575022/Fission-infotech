import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

export const SkeletonCard = () => (
  <div className="card-container border-t-4 border-t-gray-200">
    <div className="flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="w-24 h-4 mb-2" />
        <Skeleton className="w-12 h-8" />
      </div>
    </div>
  </div>
);

export const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    <td className="p-4"><Skeleton className="w-32 h-4 mb-1" /><Skeleton className="w-40 h-3" /></td>
    <td className="p-4"><Skeleton className="w-12 h-4" /></td>
    <td className="p-4"><Skeleton className="w-24 h-4 mb-1" /><Skeleton className="w-16 h-3" /></td>
    <td className="p-4"><Skeleton className="w-8 h-4" /></td>
    <td className="p-4"><Skeleton className="w-20 h-6 rounded-full" /></td>
    <td className="p-4"><Skeleton className="w-16 h-8 rounded" /></td>
  </tr>
);
