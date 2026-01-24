import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = "Crafting your story..." }) => {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Simulate progress: Fast at start, slows down as it reaches 90%
    // This provides psychological reassurance without needing real-time backend events.
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90% until complete
        
        // Calculate remaining distance to 90%
        const remaining = 90 - prev;
        
        // Move 10% of the remaining distance, or at least 0.5% to keep it moving slightly
        const step = Math.max(remaining * 0.1, 0.5); 
        
        return Math.min(prev + step, 90);
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 py-16 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100 opacity-75"></div>
        <div className="relative rounded-full bg-white p-4 shadow-lg ring-1 ring-gray-900/5">
          <Sparkles className="h-8 w-8 animate-pulse text-indigo-600" />
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-3 w-full max-w-xs">
        <p className="text-lg font-medium text-gray-700 text-center">
          {message}
        </p>
        
        {/* Progress Bar Container */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-xs text-gray-400 font-medium font-mono">
          {Math.floor(progress)}%
        </p>
      </div>
    </div>
  );
};