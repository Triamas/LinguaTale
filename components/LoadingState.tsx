import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-gray-800 animate-fade-in">
      {/* Skeleton Header */}
      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex gap-2">
             <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
             <div className="h-5 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-8 space-y-8">
        {/* Title Skeleton */}
        <div className="flex justify-center">
          <div className="h-8 w-2/3 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>

        {/* Paragraph Skeletons */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-11/12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Footer / Loading Message */}
        <div className="flex flex-col items-center justify-center pt-4 space-y-3">
          <div className="h-1 w-1/3 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30 animate-pulse" />
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 animate-pulse">
            {message || "Crafting your story..."}
          </p>
        </div>
      </div>
    </div>
  );
};