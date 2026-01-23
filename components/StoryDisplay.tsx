import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Languages, HelpCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { StoryResponse } from '../types';

interface StoryDisplayProps {
  story: StoryResponse;
  language: string;
  styleLabel: string;
  level: string;
  onNextPage: () => void;
  onPrevPage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  hasNextPageInHistory: boolean;
  isGeneratingNext: boolean;
  currentPage: number;
  translations: Record<string, string>;
}

interface TextSegment {
  type: 'text' | 'vocab';
  content: string;
  translation?: string;
}

// Parses a single string (paragraph) into segments of text and interactive vocab words
const parseParagraph = (text: string): TextSegment[] => {
  const regex = /\{([^|]+)\|([^}]+)\}/g;
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    segments.push({
      type: 'vocab',
      content: match[1].trim(),
      translation: match[2].trim()
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return segments;
};

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  story, 
  language, 
  styleLabel,
  level,
  onNextPage,
  onPrevPage,
  canGoPrev,
  canGoNext,
  hasNextPageInHistory,
  isGeneratingNext,
  currentPage,
  translations
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  // Reset local state when story changes (pagination)
  useEffect(() => {
    setShowTranslation(false);
    setActiveTooltipId(null);
    setQuizAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [story]);

  // Split story content into paragraphs
  const paragraphs = useMemo(() => {
    if (!story.content) return [];
    
    // Handle edge case where model produces literal "\n" string characters instead of control characters
    const normalizedContent = story.content.replace(/\\n/g, '\n');
    
    // Split by one or more newline characters to ensure distinct paragraphs are created
    return normalizedContent.split(/\n+/).filter(p => p.trim().length > 0);
  }, [story.content]);

  const handleBackgroundClick = () => {
    setActiveTooltipId(null);
  };

  const handleQuizOptionClick = (questionIndex: number, option: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  return (
    <div className="animate-fade-in-up w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
      {/* Header */}
      <div className="border-b border-gray-100 bg-indigo-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium opacity-90">{language} {styleLabel}</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="opacity-75 text-xs font-medium uppercase tracking-wider">{translations.page} {currentPage}</span>
             <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                {translations.level} {level}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 px-6 py-8 sm:px-8">
        
        {/* Story Section */}
        <section onClick={handleBackgroundClick}>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl text-center">
            {story.title}
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            {paragraphs.map((paragraph, pIndex) => {
              const segments = parseParagraph(paragraph);
              
              return (
                <p key={pIndex} className="mb-6 leading-relaxed last:mb-0">
                  {segments.map((segment, sIndex) => {
                    if (segment.type === 'text') {
                      return <span key={sIndex}>{segment.content}</span>;
                    }

                    // Create a unique ID for this segment based on paragraph and segment index
                    const uniqueId = `${pIndex}-${sIndex}`;
                    const isOpen = activeTooltipId === uniqueId;
                    
                    return (
                      <span key={sIndex} className="relative group">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltipId(isOpen ? null : uniqueId);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveTooltipId(isOpen ? null : uniqueId);
                            }
                          }}
                          className={`
                            cursor-pointer rounded-sm border-b-2 font-semibold transition-colors outline-none px-0.5
                            ${isOpen 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                              : 'border-indigo-300 text-indigo-800 hover:bg-indigo-50'
                            }
                          `}
                        >
                          {segment.content}
                        </span>
                        
                        {isOpen && (
                          <div className="absolute bottom-full left-1/2 mb-2 z-50 -translate-x-1/2">
                            <div className="animate-fade-in relative rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-xl">
                              <span className="whitespace-nowrap">{segment.translation}</span>
                              <div className="absolute top-full left-1/2 -ml-1.5 -mt-1 h-3 w-3 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        </section>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <button
                onClick={onPrevPage}
                disabled={!canGoPrev || isGeneratingNext}
                className="group flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>{translations.previousPage}</span>
            </button>
            
            <button
                onClick={onNextPage}
                disabled={!canGoNext || isGeneratingNext}
                className={`group flex items-center space-x-2 rounded-lg px-5 py-2 text-sm font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none
                    ${!hasNextPageInHistory 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md" 
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600"
                    }
                `}
            >
                {isGeneratingNext ? (
                     <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{translations.creatingNextPage}</span>
                     </>
                ) : (
                    <>
                        <span>{translations.nextPage}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </button>
        </div>

        {/* Translation Toggle */}
        <div className="flex justify-center border-t border-gray-100 pt-6">
            <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
            >
                <Languages className="h-4 w-4" />
                <span>{showTranslation ? translations.hideTranslation : translations.showTranslation}</span>
            </button>
        </div>

        {/* Translation Section */}
        {showTranslation && (
            <div className="animate-fade-in rounded-xl bg-gray-50 p-6 text-gray-600 ring-1 ring-gray-900/5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">{translations.translationTitle}</h3>
                <p className="whitespace-pre-line leading-relaxed">{story.englishTranslation}</p>
            </div>
        )}

        {/* Quiz Section */}
        <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex items-center space-x-2 mb-6">
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">{translations.comprehensionQuiz}</h3>
            </div>
            
            <div className="space-y-6">
              {story.quiz.map((item, index) => {
                const selectedAnswer = quizAnswers[index];
                const isCorrect = selectedAnswer === item.correctAnswer;
                const hasAnswered = selectedAnswer != null;

                return (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-all hover:bg-white hover:shadow-sm">
                    <p className="mb-4 font-medium text-gray-900">
                      <span className="mr-2 text-indigo-600">{index + 1}.</span>
                      {item.question}
                    </p>
                    
                    <div className="space-y-2">
                      {item.options.map((option) => {
                        let buttonStyle = "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
                        let icon = null;

                        if (hasAnswered) {
                           if (option === item.correctAnswer) {
                             buttonStyle = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500";
                             icon = <CheckCircle2 className="h-4 w-4 text-green-600" />;
                           } else if (option === selectedAnswer) {
                             buttonStyle = "border-red-300 bg-red-50 text-red-700";
                             icon = <XCircle className="h-4 w-4 text-red-500" />;
                           } else {
                             buttonStyle = "border-gray-200 bg-gray-50 text-gray-400 opacity-60";
                           }
                        }

                        return (
                          <button
                            key={option}
                            onClick={() => !hasAnswered && handleQuizOptionClick(index, option)}
                            disabled={hasAnswered}
                            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${buttonStyle} ${!hasAnswered ? 'active:scale-[0.99]' : ''}`}
                          >
                            <span>{option}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>
                    
                    {hasAnswered && isCorrect && (
                      <p className="mt-2 text-xs font-bold text-green-600 animate-fade-in">{translations.correct}</p>
                    )}
                    {hasAnswered && !isCorrect && (
                      <p className="mt-2 text-xs font-bold text-red-500 animate-fade-in">{translations.incorrect} {item.correctAnswer}</p>
                    )}
                  </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};