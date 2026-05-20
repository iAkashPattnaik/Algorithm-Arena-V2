import React from 'react';

const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`macos-glass p-6 animate-pulse ${className}`}>
      <div className="h-4 w-1/3 bg-white/20 rounded mb-4" />
      <div className="h-3 w-full bg-white/10 rounded mb-2" />
      <div className="h-3 w-5/6 bg-white/10 rounded mb-2" />
      <div className="h-3 w-2/3 bg-white/10 rounded" />
    </div>
  );
};

export default SkeletonCard;

