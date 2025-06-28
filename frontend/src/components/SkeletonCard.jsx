import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse cursor-pointer">
      <div className="h-64 bg-gray-300"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;