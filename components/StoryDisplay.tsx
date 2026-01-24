import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Languages, HelpCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2, Bookmark, Maximize2, Minimize2, Sparkles, Layers } from 'lucide-react';
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
  isFocused: boolean;
  onToggleFocus: () => void;
  showQuiz: boolean;
  showFlashCards: boolean;
}

interface TextSegment {
  type: 'text' | 'vocab';
  content: string;
  translation?: string;
  pre?: string;
  post?: string;
}

interface VocabItem {
  word: string;
  translation: string;
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
  const PREFIX_RE = /([(\["'“‘«¿¡]+)$/;
  const SUFFIX_RE = /^([.,!?:;:)\]"'”’»]+)/;

  for (let i = 0; i < rawSegments.length; i++) {
    const segment = rawSegments[i];
    if (segment.type === 'vocab') {
      if (i > 0 && rawSegments[i - 1].type === 'text') {
        const prev = rawSegments[i - 1];
        const match = prev.content.match(PREFIX_RE);
        if (match) {
          const punctuation = match[1];
          segment.pre = (segment.pre || '') + punctuation;
          prev.content = prev.content.slice(0, -punctuation.length);
        }
      }

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

  return rawSegments.filter(s => s.type === 'vocab' || s.content.length > 0);
};

/**
 * Returns accessible theme classes based on the story style.
 * Increased base typography size (prose-xl) and line-height (leading-relaxed/loose).
 */
const getThemeForStyle = (style: StoryStyle) => {
  // Using prose-xl on larger screens for better readability
  const baseProse = "prose-lg md:prose-xl leading-loose";
  const baseContainer = "w-full max-w-4xl mx-auto overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-gray-900/5 dark:ring-gray-800 transition-all duration-500 ease-in-out";
  
  switch (style) {
    case "Adventure":
    case "Mystery":
    case "Thriller":
    case "History":
    case "Biography":
    case "Serious":
      return {
        container: `${baseContainer} font-serif`,
        headerBg: "bg-slate-800 dark:bg-slate-950",
        prose: `${baseProse} prose-slate dark:prose-invert`
      };
    
    case "Bedtime":
    case "Romance":
    case "Fantasy":
      return {
        container: `${baseContainer} font-serif`,
        headerBg: "bg-indigo-900 dark:bg-indigo-950",
        prose: `${baseProse} prose-indigo dark:prose-invert`
      };

    case "News":
      return {
        container: `${baseContainer} font-serif`,
        headerBg: "bg-gray-900 dark:bg-gray-950",
        prose: `${baseProse} prose-gray dark:prose-invert leading-normal` // News is tighter
      };
    
    case "Sci-Fi":
      return {
        container: `${baseContainer} font-sans`,
        headerBg: "bg-blue-900 dark:bg-blue-950",
        prose: `${baseProse} prose-blue dark:prose-invert`
      };

    case "Dialogue":
      return {
        container: `${baseContainer} font-sans`,
        headerBg: "bg-teal-700 dark:bg-teal-900",
        prose: `${baseProse} prose-teal dark:prose-invert space-y-6` 
      };
      
    case "Diary":
       return {
         container: `${baseContainer} font-sans italic`,
         headerBg: "bg-stone-600 dark:bg-stone-800",
         prose: `${baseProse} prose-stone dark:prose-invert`
       };

    default: // Standard, Funny
      return {
        container: `${baseContainer} font-sans`,
        headerBg: "bg-indigo-600 dark:bg-indigo-800",
        prose: `${baseProse} prose-indigo dark:prose-invert`
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
  onToggleBookmark,
  isFocused,
  onToggleFocus,
  showQuiz,
  showFlashCards
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards'>('quiz');
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Default to the first available tab if one is disabled
  useEffect(() => {
    if (showQuiz && !showFlashCards) setActiveTab('quiz');
    else if (!showQuiz && showFlashCards) setActiveTab('flashcards');
    else if (showQuiz && showFlashCards && activeTab === 'quiz') setActiveTab('quiz'); // Preserve unless invalid
  }, [showQuiz, showFlashCards]);

  useEffect(() => {
    setShowTranslation(false);
    setActiveTooltipId(null);
    setQuizAnswers({});
    setFlippedCards(new Set());
    // If both are enabled, default back to quiz on new story load
    if (showQuiz) setActiveTab('quiz');
    else if (showFlashCards) setActiveTab('flashcards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [story]);

  const paragraphs = useMemo(() => {
    if (!story.content) return [];
    const normalizedContent = story.content.replace(/\\n/g, '\n');
    return normalizedContent.split(/\n+/).filter(p => p.trim().length > 0);
  }, [story.content]);

  // Extract all vocabulary for Flash Cards
  const vocabList = useMemo(() => {
    if (!story.content) return [];
    const regex = /\{([^{}|]+?)\s*\|\s*([^{}|]+?)\}/g;
    const list: VocabItem[] = [];
    let match;
    const seen = new Set<string>();

    while ((match = regex.exec(story.content)) !== null) {
      const word = match[1].trim();
      const translation = match[2].trim();
      if (word && translation && !seen.has(word)) {
        list.push({ word, translation });
        seen.add(word);
      }
    }
    return list;
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

  const toggleCardFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const theme = getThemeForStyle(storyStyle);
  const hasTabs = showQuiz && showFlashCards;

  return (
    <div className={`animate-fade-in-up ${theme.container}`}>
      {/* Header */}
      <div className={`border-b border-gray-100 dark:border-gray-800 px-6 py-4 text-white transition-colors duration-300 ${theme.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 opacity-80" />
            <span className="font-medium opacity-90 not-italic tracking-wide">{language} • {styleLabel}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="opacity-75 text-xs font-bold uppercase tracking-wider not-italic">{translations.page} {currentPage}</span>
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white not-italic ring-1 ring-white/30">
                    {level}
                </span>
             </div>
             
             {/* Divider */}
             <div className="h-4 w-px bg-white/30" />

             {/* Focus Toggle */}
             <button 
                onClick={onToggleFocus}
                className="opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
                title={isFocused ? "Exit Focus Mode" : "Enter Focus Mode"}
             >
                {isFocused ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
             </button>
          </div>
        </div>
      </div>

      <div className="relative space-y-10 px-6 py-10 sm:px-12">
        
        {/* Bookmark Button */}
        <div className="absolute top-6 right-6 sm:right-10 z-10">
          <button 
            onClick={onToggleBookmark}
            className={`rounded-full p-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm ${
              isBookmarked 
                ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-400" 
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
            }`}
            title={isBookmarked ? translations.bookmarked : translations.bookmarkStory}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Story Section */}
        <section onClick={handleBackgroundClick} className="pt-4">
          <h2 className="mb-8 mr-12 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl text-center not-italic tracking-tight leading-tight">
            {story.title}
          </h2>
          
          <div className={`prose max-w-none text-gray-800 dark:text-gray-200 ${theme.prose}`}>
            {paragraphs.map((paragraph, pIndex) => {
              const segments = parseParagraph(paragraph);
              
              return (
                <p key={pIndex} className="mb-8 last:mb-0 text-justify">
                  {segments.map((segment, sIndex) => {
                    if (segment.type === 'text') {
                      return <span key={sIndex}>{segment.content}</span>;
                    }

                    const uniqueId = `${pIndex}-${sIndex}`;
                    const isOpen = activeTooltipId === uniqueId;
                    
                    return (
                      <span key={sIndex} className="relative inline-block group whitespace-nowrap">
                        {segment.pre && <span className="mr-[1px] opacity-90">{segment.pre}</span>}
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
                            cursor-pointer rounded border-b-[3px] font-bold transition-all outline-none px-0.5 not-italic
                            ${isOpen 
                              ? 'border-indigo-600 bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' 
                              : 'border-indigo-300/70 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/40'
                            }
                          `}
                        >
                          {segment.content}
                        </span>
                        {segment.post && <span>{segment.post}</span>}
                        
                        {isOpen && (
                          <div className="absolute bottom-full left-1/2 mb-3 z-50 -translate-x-1/2">
                            <div className="animate-fade-in relative rounded-xl bg-gray-900 px-4 py-3 text-base font-medium text-white shadow-2xl whitespace-nowrap dark:bg-gray-800 dark:ring-1 dark:ring-white/10">
                              {segment.translation}
                              <div className="absolute top-full left-1/2 -ml-2 -mt-1 h-4 w-4 -translate-x-1/2 rotate-45 bg-gray-900 dark:bg-gray-800"></div>
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
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-8 not-italic">
            <button
                onClick={onPrevPage}
                disabled={!canGoPrev || isGeneratingNext}
                className="group flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>{translations.previousPage}</span>
            </button>
            
            <button
                onClick={onNextPage}
                disabled={!canGoNext || isGeneratingNext}
                className={`group flex items-center space-x-2 rounded-lg px-6 py-2.5 text-sm font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed
                    ${!hasNextPageInHistory 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-indigo-200 dark:shadow-none" 
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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

        <div className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-8 not-italic">
            <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none transition-colors"
            >
                <Languages className="h-4 w-4" />
                <span>{showTranslation ? translations.hideTranslation : translations.showTranslation}</span>
            </button>
        </div>

        {showTranslation && (
            <div className="animate-fade-in rounded-xl bg-gray-50 p-6 text-gray-700 ring-1 ring-gray-900/5 not-italic dark:bg-gray-800 dark:text-gray-300 dark:ring-white/5 shadow-inner">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{translations.translationTitle}</h3>
                <p className="whitespace-pre-line leading-relaxed text-lg">{story.englishTranslation}</p>
            </div>
        )}

        {/* Tabbed Interface for Quiz/Flash Cards */}
        {(showQuiz || showFlashCards) && (
            <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8 not-italic">
                
                {/* Tabs */}
                {hasTabs && (
                    <div className="flex space-x-6 border-b border-gray-200 dark:border-gray-700 mb-8">
                        <button
                            onClick={() => setActiveTab('quiz')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${
                                activeTab === 'quiz' 
                                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                {translations.comprehensionQuiz}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('flashcards')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${
                                activeTab === 'flashcards' 
                                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                             <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                {translations.flashCards}
                             </div>
                        </button>
                    </div>
                )}

                {/* Single Title if no tabs */}
                {!hasTabs && (
                    <div className="flex items-center space-x-3 mb-8">
                         <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                            {showQuiz ? <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /> : <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                             {showQuiz ? translations.comprehensionQuiz : translations.flashCards}
                         </h3>
                    </div>
                )}
                
                {/* Quiz Content */}
                {showQuiz && activeTab === 'quiz' && (
                    <div className="space-y-6 animate-fade-in">
                        {story.quiz.map((item, index) => {
                            const selectedAnswer = quizAnswers[index];
                            const isCorrect = selectedAnswer === item.correctAnswer;
                            const hasAnswered = selectedAnswer != null;

                            return (
                            <div key={index} className="group relative rounded-2xl border border-gray-200 bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800 overflow-hidden">
                                <p className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-200">
                                <span className="mr-3 inline-block rounded-md bg-white px-2 py-0.5 text-sm font-bold text-indigo-600 shadow-sm ring-1 ring-gray-200 dark:bg-gray-700 dark:text-indigo-400 dark:ring-gray-600">{index + 1}</span>
                                {item.question}
                                </p>
                                
                                <div className="space-y-3">
                                {item.options.map((option) => {
                                    let buttonStyle = "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";
                                    let icon = null;
                                    
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectOption = option === item.correctAnswer;

                                    if (hasAnswered) {
                                    if (isCorrectOption) {
                                        buttonStyle = "border-green-500 bg-green-50 text-green-900 font-semibold ring-1 ring-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-500";
                                        icon = <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 animate-bounce" />;
                                    } else if (isSelected) {
                                        buttonStyle = "border-red-300 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-300 dark:border-red-500";
                                        icon = <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
                                    } else {
                                        buttonStyle = "border-gray-200 bg-gray-50 text-gray-400 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500";
                                    }
                                    }

                                    return (
                                    <button
                                        key={option}
                                        onClick={() => !hasAnswered && handleQuizOptionClick(index, option)}
                                        disabled={hasAnswered}
                                        className={`flex w-full items-center justify-between rounded-xl border px-5 py-3.5 text-left text-base font-medium transition-all ${buttonStyle} ${!hasAnswered ? "active:scale-[0.99]" : ""}`}
                                    >
                                        <span>{option}</span>
                                        {icon}
                                    </button>
                                    );
                                })}
                                </div>
                                
                                {hasAnswered && isCorrect && (
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 animate-pulse bg-green-400/10" />
                                )}
                                
                                {hasAnswered && (
                                <div className={`mt-4 flex items-center space-x-2 text-sm font-bold animate-fade-in ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isCorrect && <Sparkles className="h-4 w-4" />}
                                    <span>{isCorrect ? translations.correct : `${translations.incorrect} ${item.correctAnswer}`}</span>
                                </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}

                {/* Flash Cards Content */}
                {showFlashCards && activeTab === 'flashcards' && (
                     <div className="animate-fade-in">
                        {vocabList.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                {translations.noVocabFound}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {vocabList.map((item, index) => {
                                    const isFlipped = flippedCards.has(index);
                                    return (
                                        <div 
                                            key={index}
                                            onClick={() => toggleCardFlip(index)}
                                            className="group perspective-1000 cursor-pointer h-40"
                                            title={translations.clickToFlip}
                                        >
                                            <div className={`relative h-full w-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                                
                                                {/* Front */}
                                                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-500/50">
                                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center">{item.word}</span>
                                                </div>

                                                {/* Back */}
                                                <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-4 rounded-xl bg-indigo-600 text-white shadow-lg dark:bg-indigo-700">
                                                    <span className="text-lg font-medium text-center">{item.translation}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                     </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};