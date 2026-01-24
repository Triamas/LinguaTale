import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Languages, HelpCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2, Bookmark } from 'lucide-react';
import { StoryResponse, StoryStyle } from '../types';

interface StoryDisplayProps {
  story: StoryResponse;
  language: string;
  storyStyle: StoryStyle;
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
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

interface TextSegment {
  type: 'text' | 'vocab';
  content: string;
  translation?: string;
  pre?: string;
  post?: string;
}

/**
 * Robustly parses text into segments and attaches orphan punctuation to the relevant vocab word.
 * This ensures that "word." or "(word)" wraps as a single unit.
 */
const parseParagraph = (text: string): TextSegment[] => {
  if (!text) return [];

  const regex = /\{([^{}|]+?)\s*\|\s*([^{}|]+?)\}/g;
  const rawSegments: TextSegment[] = [];
  let lastIndex = 0;
  let match;

  // 1. Initial Split
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      rawSegments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    const word = match[1].trim();
    const translation = match[2].trim();

    if (word && translation) {
      rawSegments.push({
        type: 'vocab',
        content: word,
        translation: translation
      });
    } else {
      // Fallback for malformed tags
      rawSegments.push({
        type: 'text',
        content: match[0]
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    rawSegments.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  // 2. Post-process to glue punctuation
  // We want to move trailing opening punctuation from prev segment to current vocab 'pre'
  // And move leading closing punctuation from next segment to current vocab 'post'
  
  const PREFIX_RE = /([(\["'“‘«¿¡]+)$/;
  const SUFFIX_RE = /^([.,!?:;:)\]"'”’»]+)/;

  for (let i = 0; i < rawSegments.length; i++) {
    const segment = rawSegments[i];
    if (segment.type === 'vocab') {
      // Check previous segment for prefixes (e.g., opening quote)
      if (i > 0 && rawSegments[i - 1].type === 'text') {
        const prev = rawSegments[i - 1];
        const match = prev.content.match(PREFIX_RE);
        if (match) {
          const punctuation = match[1];
          segment.pre = (segment.pre || '') + punctuation;
          prev.content = prev.content.slice(0, -punctuation.length);
        }
      }

      // Check next segment for suffixes (e.g., full stop, comma, closing quote)
      if (i < rawSegments.length - 1 && rawSegments[i + 1].type === 'text') {
        const next = rawSegments[i + 1];
        const match = next.content.match(SUFFIX_RE);
        if (match) {
          const punctuation = match[1];
          segment.post = (segment.post || '') + punctuation;
          next.content = next.content.slice(punctuation.length);
        }
      }
    }
  }

  // Filter out text segments that might have become empty (unless they were empty to start with, which split handles)
  return rawSegments.filter(s => s.type === 'vocab' || s.content.length > 0);
};

/**
 * Returns accessible theme classes based on the story style.
 * Focus is on readability, using standard fonts (Serif/Sans) and subtle spacing adjustments.
 */
const getThemeForStyle = (style: StoryStyle) => {
  const base = "w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5";
  
  switch (style) {
    case "Adventure":
    case "Mystery":
    case "Thriller":
    case "History":
    case "Biography":
    case "Serious":
      return {
        container: `${base} font-serif`,
        headerBg: "bg-slate-800",
        prose: "prose-lg prose-slate"
      };
    
    case "Bedtime":
    case "Romance":
    case "Fantasy":
      return {
        container: `${base} font-serif`,
        headerBg: "bg-indigo-900",
        prose: "prose-lg prose-indigo"
      };

    case "News":
      return {
        container: `${base} font-serif`,
        headerBg: "bg-gray-900",
        prose: "prose-lg prose-gray leading-tight" // Slightly tighter leading for newspaper feel, still accessible
      };
    
    case "Sci-Fi":
      return {
        container: `${base} font-sans`,
        headerBg: "bg-blue-900",
        prose: "prose-lg prose-blue"
      };

    case "Dialogue":
      return {
        container: `${base} font-sans`,
        headerBg: "bg-teal-700",
        prose: "prose-lg prose-teal space-y-6" // Extra spacing for dialogue readability
      };
      
    case "Diary":
       return {
         container: `${base} font-sans italic`,
         headerBg: "bg-stone-600",
         prose: "prose-lg prose-stone"
       };

    default: // Standard, Funny
      return {
        container: `${base} font-sans`,
        headerBg: "bg-indigo-600",
        prose: "prose-lg prose-indigo"
      };
  }
};

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  story, 
  language, 
  storyStyle,
  styleLabel,
  level,
  onNextPage,
  onPrevPage,
  canGoPrev,
  canGoNext,
  hasNextPageInHistory,
  isGeneratingNext,
  currentPage,
  translations,
  isBookmarked,
  onToggleBookmark
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    setShowTranslation(false);
    setActiveTooltipId(null);
    setQuizAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [story]);

  const paragraphs = useMemo(() => {
    if (!story.content) return [];
    const normalizedContent = story.content.replace(/\\n/g, '\n');
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

  const theme = getThemeForStyle(storyStyle);

  return (
    <div className={`animate-fade-in-up ${theme.container}`}>
      {/* Header */}
      <div className={`border-b border-gray-100 px-6 py-4 text-white transition-colors duration-300 ${theme.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium opacity-90 not-italic">{language} {styleLabel}</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="opacity-75 text-xs font-medium uppercase tracking-wider not-italic">{translations.page} {currentPage}</span>
             <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white not-italic">
                {translations.level} {level}
            </span>
          </div>
        </div>
      </div>

      <div className="relative space-y-8 px-6 py-8 sm:px-8">
        
        {/* Bookmark Button */}
        <div className="absolute top-4 right-4 sm:right-8">
          <button 
            onClick={onToggleBookmark}
            className={`rounded-full p-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isBookmarked 
                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" 
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            }`}
            title={isBookmarked ? translations.bookmarked : translations.bookmarkStory}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Story Section */}
        <section onClick={handleBackgroundClick} className="pt-2">
          <h2 className="mb-6 mr-10 text-2xl font-bold text-gray-900 sm:text-3xl text-center not-italic">
            {story.title}
          </h2>
          
          <div className={`prose max-w-none text-gray-700 ${theme.prose}`}>
            {paragraphs.map((paragraph, pIndex) => {
              const segments = parseParagraph(paragraph);
              
              return (
                <p key={pIndex} className="mb-6 leading-relaxed last:mb-0">
                  {segments.map((segment, sIndex) => {
                    if (segment.type === 'text') {
                      return <span key={sIndex}>{segment.content}</span>;
                    }

                    const uniqueId = `${pIndex}-${sIndex}`;
                    const isOpen = activeTooltipId === uniqueId;
                    
                    return (
                      <span key={sIndex} className="relative inline-block group whitespace-nowrap">
                        {segment.pre && <span className="mr-[1px]">{segment.pre}</span>}
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
                            cursor-pointer rounded-sm border-b-2 font-semibold transition-all outline-none px-0.5 not-italic
                            ${isOpen 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                              : 'border-indigo-300 text-indigo-800 hover:bg-indigo-50 hover:border-indigo-400'
                            }
                          `}
                        >
                          {segment.content}
                        </span>
                        {segment.post && <span>{segment.post}</span>}
                        
                        {isOpen && (
                          <div className="absolute bottom-full left-1/2 mb-2 z-50 -translate-x-1/2">
                            <div className="animate-fade-in relative rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-xl whitespace-nowrap">
                              {segment.translation}
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
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 not-italic">
            <button
                onClick={onPrevPage}
                disabled={!canGoPrev || isGeneratingNext}
                className="group flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>{translations.previousPage}</span>
            </button>
            
            <button
                onClick={onNextPage}
                disabled={!canGoNext || isGeneratingNext}
                className={`group flex items-center space-x-2 rounded-lg px-5 py-2 text-sm font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed
                    ${!hasNextPageInHistory 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700" 
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

        <div className="flex justify-center border-t border-gray-100 pt-6 not-italic">
            <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
            >
                <Languages className="h-4 w-4" />
                <span>{showTranslation ? translations.hideTranslation : translations.showTranslation}</span>
            </button>
        </div>

        {showTranslation && (
            <div className="animate-fade-in rounded-xl bg-gray-50 p-6 text-gray-600 ring-1 ring-gray-900/5 not-italic">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">{translations.translationTitle}</h3>
                <p className="whitespace-pre-line leading-relaxed">{story.englishTranslation}</p>
            </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-8 not-italic">
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
                            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${buttonStyle}`}
                          >
                            <span>{option}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>
                    
                    {hasAnswered && (
                      <p className={`mt-2 text-xs font-bold animate-fade-in ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        {isCorrect ? translations.correct : `${translations.incorrect} ${item.correctAnswer}`}
                      </p>
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