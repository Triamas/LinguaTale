
import React, { useState, useEffect } from 'react';
import { Sparkles, PenTool, CheckCircle, BrainCircuit, FileText } from 'lucide-react';

const LOADING_STAGES = [
  // Faster initial stages to match Gemini Flash speed
  { threshold: 30, text: "Planning story structure...", icon: BrainCircuit, minTime: 800 },
  { threshold: 60, text: "Drafting content...", icon: PenTool, minTime: 1500 },
  { threshold: 80, text: "Verifying CEFR level compliance...", icon: CheckCircle, minTime: 1000 },
  { threshold: 90, text: "Generating quiz & vocabulary...", icon: FileText, minTime: 1000 },
  { threshold: 95, text: "Finalizing formatting...", icon: Sparkles, minTime: 1000 },
];

interface LoadingStateProps {
  message?: string;
  finish?: boolean;
  onFinished?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ finish, onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Main Progress Logic
  useEffect(() => {
    // If we are finishing, handle that in the separate effect below
    if (finish) return;

    let startTime = Date.now();
    let stageStartTime = startTime;

    const timer = setInterval(() => {
      const now = Date.now();
      const currentStage = LOADING_STAGES[currentStageIndex];
      const nextStage = LOADING_STAGES[currentStageIndex + 1];
      
      setProgress((oldProgress) => {
        // Absolute cap before "finish" is triggered
        if (oldProgress >= 95) return 95;

        const target = currentStage.threshold;
        
        // If we reached the target of the current stage
        if (oldProgress >= target - 1) {
          // Check if we've met the minimum time requirement for this stage
          if (now - stageStartTime > currentStage.minTime && nextStage) {
            // Advance to next stage
            setCurrentStageIndex(prev => prev + 1);
            stageStartTime = now;
            return oldProgress; 
          } else {
            // Hold at the threshold (crawl very slowly)
            return Math.min(oldProgress + 0.05, target); 
          }
        }

        // Standard movement towards target
        // Moves faster initially, then slows down as it approaches threshold
        const remainingInStage = target - oldProgress;
        const speed = Math.max(0.2, remainingInStage * 0.08); 
        
        return Math.min(oldProgress + speed, 95);
      });

    }, 50); // Faster tick rate for smoother animation

    return () => clearInterval(timer);
  }, [currentStageIndex, finish]);

  // Finishing Logic - Triggers when API is done
  useEffect(() => {
    if (finish) {
      // Force the final stage text
      setCurrentStageIndex(LOADING_STAGES.length - 1);

      const finishTimer = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            clearInterval(finishTimer);
            // Small delay before unmounting to let user see 100%
            setTimeout(() => onFinished && onFinished(), 200);
            return 100;
          }
          // Fast forward to 100
          return old + 2; 
        });
      }, 10); // Very fast ticks

      return () => clearInterval(finishTimer);
    }
  }, [finish, onFinished]);

  const CurrentIcon = LOADING_STAGES[currentStageIndex]?.icon || Sparkles;
  const currentText = LOADING_STAGES[currentStageIndex]?.text || "Finalizing...";

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
        
        {/* Footer / Loading Message & Progress Bar */}
        <div className="flex flex-col items-center justify-center pt-8 space-y-6 max-w-md mx-auto w-full">
          {/* Main Status Text */}
          <div className="flex items-center gap-3 text-lg font-medium text-gray-700 dark:text-gray-200 animate-fade-in">
             <CurrentIcon className="h-5 w-5 animate-bounce text-indigo-600 dark:text-indigo-400" />
             <span key={currentText} className="animate-fade-in">
               {currentText}
             </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
