import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = "Crafting your story..." }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4 py-12">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100 opacity-75"></div>
        <div className="relative rounded-full bg-white p-4 shadow-lg ring-1 ring-gray-900/5">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
      <p className="animate-pulse text-lg font-medium text-gray-600">
        {message}
      </p>
    </div>
  );
};