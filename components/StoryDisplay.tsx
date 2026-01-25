import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Languages, HelpCircle, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2, Bookmark, Maximize2, Minimize2, Sparkles, Layers, GraduationCap, ChevronDown } from 'lucide-react';
import { StoryResponse, StoryStyle, CEFRLevel } from '../types';
import { LEVELS } from '../constants';

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
  onFlashCardToggle: (word: string, translation: string, isSaved: boolean) => void;
  onLevelChange: (level: CEFRLevel) => void;
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

interface UITooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const UITooltip: React.FC<UITooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-white border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-white border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-white border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-white border-y-transparent border-l-transparent',
  };

  return (
    <div className={`group/tooltip relative flex items-center justify-center ${className}`}>
      {children}
      <div 
        role="tooltip"
        className={`pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover/tooltip:flex group-hover/tooltip:opacity-100 dark:bg-white dark:text-gray-900 ${positionClasses[position]}`}
      >
        {content}
        <div className={`absolute border-[6px] ${arrowClasses[position]}`}></div>
      </div>
    </div>
  );
};

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
 * Using "Lora" (serif) for story text to make it feel more book-like.
 */
const getThemeForStyle = (style: StoryStyle) => {
  // Base prose styles with better font stack and leading
  const baseProse = "prose-lg md:prose-xl leading-loose font-serif text-gray-800 dark:text-gray-200";
  const baseContainer = "w-full max-w-4xl mx-auto overflow-hidden rounded-3xl bg-white dark:bg-[#111827] shadow-2xl shadow-indigo-200/20 ring-1 ring-gray-900/5 dark:ring-gray-800 transition-all duration-500 ease-in-out";
  
  switch (style) {
    case "Adventure":
    case "Mystery":
    case "Thriller":
    case "History":
    case "Biography":
    case "Serious":
      return {
        container: `${baseContainer}`,
        headerBg: "bg-slate-900 dark:bg-black",
        prose: `${baseProse} prose-slate dark:prose-invert`
      };
    
    case "Bedtime":
    case "Romance":
    case "Fantasy":
      return {
        container: `${baseContainer}`,
        headerBg: "bg-indigo-900 dark:bg-indigo-950",
        prose: `${baseProse} prose-indigo dark:prose-invert`
      };

    case "News":
      return {
        container: `${baseContainer} font-sans`, // News usually Sans
        headerBg: "bg-gray-900 dark:bg-gray-950",
        prose: `prose-lg md:prose-xl leading-normal text-gray-800 dark:text-gray-200 prose-gray dark:prose-invert font-sans` 
      };
    
    case "Sci-Fi":
      return {
        container: `${baseContainer} font-sans`,
        headerBg: "bg-blue-900 dark:bg-blue-950",
        prose: `prose-lg md:prose-xl leading-loose text-gray-800 dark:text-gray-200 prose-blue dark:prose-invert font-sans`
      };

    case "Dialogue":
      return {
        container: `${baseContainer} font-sans`,
        headerBg: "bg-teal-800 dark:bg-teal-900",
        prose: `prose-lg md:prose-xl leading-loose text-gray-800 dark:text-gray-200 prose-teal dark:prose-invert font-sans space-y-6` 
      };
      
    case "Diary":
       return {
         container: `${baseContainer}`,
         headerBg: "bg-stone-700 dark:bg-stone-800",
         prose: `${baseProse} prose-stone dark:prose-invert italic`
       };

    default: // Standard, Funny
      return {
        container: `${baseContainer}`,
        headerBg: "bg-indigo-600 dark:bg-indigo-700",
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
  showFlashCards,
  onFlashCardToggle,
  onLevelChange
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
      const isCurrentlyFlipped = newSet.has(index);
      
      if (isCurrentlyFlipped) {
        newSet.delete(index);
        // If removing flip, we call toggle with false (remove from saved)
        onFlashCardToggle(vocabList[index].word, vocabList[index].translation, false);
      } else {
        newSet.add(index);
        // If adding flip, we call toggle with true (add to saved)
        onFlashCardToggle(vocabList[index].word, vocabList[index].translation, true);
      }
      return newSet;
    });
  };

  const theme = getThemeForStyle(storyStyle);
  const hasTabs = showQuiz && showFlashCards;

  return (
    <div className={`animate-fade-in-up ${theme.container}`}>
      {/* Header */}
      <div className={`border-b border-white/10 px-6 py-5 text-white transition-colors duration-300 ${theme.headerBg} relative overflow-hidden`}>
        {/* Subtle noise/texture overlay for premium feel */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        
        <div className="relative flex items-center justify-between z-10 font-sans">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
               <BookOpen className="h-5 w-5 opacity-90" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight">{language}</span>
              <span className="text-xs font-medium opacity-70 uppercase tracking-wider">{styleLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
                <span className="opacity-90 text-xs font-bold uppercase tracking-wider">{translations.page} {currentPage}</span>
                <div className="h-3 w-px bg-white/20" />
                
                {/* Level Selector Badge */}
                <UITooltip content="Change Proficiency Level" position="bottom">
                  <div className="relative group cursor-pointer">
                    <span 
                      className="flex items-center gap-1 text-xs font-bold text-white hover:text-indigo-200 transition-colors"
                    >
                        {level}
                        <ChevronDown className="h-3 w-3 opacity-80" />
                    </span>
                    <select
                      value={level}
                      onChange={(e) => onLevelChange(e.target.value as CEFRLevel)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Change Level"
                      disabled={isGeneratingNext}
                    >
                       {LEVELS.map(l => (
                         <option key={l} value={l} className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100">
                           {l}
                         </option>
                       ))}
                    </select>
                  </div>
                </UITooltip>
             </div>
             
             {/* Focus Toggle */}
             <UITooltip content={isFocused ? "Exit Focus Mode" : "Enter Focus Mode"} position="bottom">
               <button 
                  onClick={onToggleFocus}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none text-white/80 hover:text-white"
               >
                  {isFocused ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
               </button>
             </UITooltip>
          </div>
        </div>
      </div>

      <div className="relative space-y-12 px-6 py-12 sm:px-16">
        
        {/* Bookmark Button */}
        <div className="absolute top-8 right-6 sm:right-10 z-10">
          <UITooltip content={isBookmarked ? translations.bookmarked : translations.bookmarkStory} position="left">
            <button 
              onClick={onToggleBookmark}
              className={`rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isBookmarked 
                  ? "bg-amber-100 text-amber-600 shadow-amber-200 shadow-lg scale-110 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:shadow-none" 
                  : "bg-gray-50 text-gray-400 shadow-sm hover:bg-gray-100 hover:text-gray-600 hover:scale-105 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </UITooltip>
        </div>

        {/* Story Section */}
        <section onClick={handleBackgroundClick} className="pt-2">
          <h2 className="mb-6 mr-12 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-5xl text-center tracking-tight leading-tight font-display">
            {story.title}
          </h2>
          
          {story.shortDescription && (
            <p className="mb-10 text-center text-lg font-medium text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-sans leading-relaxed">
              {story.shortDescription}
            </p>
          )}

          <div className={`prose max-w-none ${theme.prose}`}>
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
                          aria-expanded={isOpen}
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
                            cursor-pointer rounded-sm transition-all duration-200 outline-none px-[2px] mx-[1px]
                            ${isOpen 
                              ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 font-semibold decoration-transparent' 
                              : 'decoration-indigo-300/60 dark:decoration-indigo-500/60 underline underline-offset-4 decoration-2 hover:decoration-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                            }
                          `}
                        >
                          {segment.content}
                        </span>
                        {segment.post && <span>{segment.post}</span>}
                        
                        {/* Tooltip */}
                        <div 
                           id={`tooltip-${uniqueId}`}
                           className={`absolute bottom-full left-1/2 mb-3 z-50 -translate-x-1/2 transition-all duration-200 ease-out origin-bottom ${
                             isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                           }`}
                        >
                            <div className="relative rounded-2xl bg-[#0B1120] px-5 py-3 text-base font-semibold text-white shadow-2xl whitespace-nowrap dark:bg-white dark:text-gray-900 font-sans">
                              {segment.translation}
                              <div className="absolute top-full left-1/2 -ml-2 -mt-1 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#0B1120] dark:bg-white"></div>
                            </div>
                        </div>
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        </section>

        {/* Grammar Note */}
        {story.grammarPoint && (
          <div className="mt-12 rounded-2xl border-0 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm ring-1 ring-indigo-100 dark:from-indigo-900/20 dark:to-gray-800 dark:ring-indigo-900/30 font-sans">
            <div className="flex items-start space-x-4">
              <div className="rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-900/40 shrink-0">
                <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-300 mb-2">
                  {translations.grammarPoint}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium">
                  {story.grammarPoint}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-8 font-sans">
            <UITooltip content={translations.previousPage} position="top">
              <button
                  onClick={onPrevPage}
                  disabled={!canGoPrev || isGeneratingNext}
                  className="group flex items-center space-x-2 rounded-2xl border-0 bg-gray-100 px-6 py-3.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-200 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>{translations.previousPage}</span>
              </button>
            </UITooltip>
            
            <UITooltip content={translations.nextPage} position="top">
              <button
                  onClick={onNextPage}
                  disabled={!canGoNext || isGeneratingNext}
                  className={`group flex items-center space-x-2 rounded-2xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
                      ${!hasNextPageInHistory 
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30 shadow-indigo-500/20 dark:bg-indigo-500 dark:hover:bg-indigo-600" 
                          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
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
            </UITooltip>
        </div>

        <div className="flex justify-center pt-4 font-sans">
            <UITooltip content={showTranslation ? "Hide English Translation" : "Show English Translation"} position="top">
              <button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none transition-colors rounded-full py-2 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                  <Languages className="h-4 w-4" />
                  <span>{showTranslation ? translations.hideTranslation : translations.showTranslation}</span>
              </button>
            </UITooltip>
        </div>

        {showTranslation && (
            <div className="animate-fade-in rounded-3xl bg-gray-50 p-8 text-gray-700 ring-1 ring-gray-900/5 dark:bg-gray-800 dark:text-gray-300 dark:ring-white/5 shadow-inner">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{translations.translationTitle}</h3>
                <p className="whitespace-pre-line leading-relaxed text-lg font-serif">{story.englishTranslation}</p>
            </div>
        )}

        {/* Tabbed Interface for Quiz/Flash Cards */}
        {(showQuiz || showFlashCards) && (
            <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-10 font-sans">
                
                {/* Tabs */}
                {hasTabs && (
                    <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700 mb-10">
                        <button
                            onClick={() => setActiveTab('quiz')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wide transition-all border-b-[3px] ${
                                activeTab === 'quiz' 
                                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                {translations.comprehensionQuiz}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('flashcards')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wide transition-all border-b-[3px] ${
                                activeTab === 'flashcards' 
                                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
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
                    <div className="flex items-center space-x-3 mb-10">
                         <div className="rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-900/30">
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
                            <div key={index} className="group relative rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 dark:border-gray-800 dark:bg-[#151d30] dark:hover:border-gray-700 dark:hover:shadow-none overflow-hidden">
                                <p className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                                <span className="mr-4 inline-flex items-center justify-center rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-600 ring-1 ring-indigo-500/10 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-500/20">{index + 1}</span>
                                {item.question}
                                </p>
                                
                                <div className="space-y-3">
                                {item.options.map((option) => {
                                    let buttonStyle = "border-gray-100 bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300 dark:hover:border-indigo-800";
                                    let icon = null;
                                    
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectOption = option === item.correctAnswer;

                                    if (hasAnswered) {
                                    if (isCorrectOption) {
                                        buttonStyle = "border-green-500 bg-green-50 text-green-900 font-bold ring-1 ring-green-500 dark:bg-green-900/20 dark:text-green-300 dark:border-green-500/50";
                                        icon = <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 animate-scale-in" />;
                                    } else if (isSelected) {
                                        buttonStyle = "border-red-300 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300 dark:border-red-500/50";
                                        icon = <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 animate-scale-in" />;
                                    } else {
                                        buttonStyle = "border-gray-100 bg-gray-50 text-gray-400 opacity-50 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-600";
                                    }
                                    }

                                    return (
                                    <button
                                        key={option}
                                        onClick={() => !hasAnswered && handleQuizOptionClick(index, option)}
                                        disabled={hasAnswered}
                                        className={`flex w-full items-center justify-between rounded-2xl border px-6 py-4 text-left text-base font-medium transition-all duration-200 ${buttonStyle} ${!hasAnswered ? "active:scale-[0.99]" : ""}`}
                                    >
                                        <span>{option}</span>
                                        {icon}
                                    </button>
                                    );
                                })}
                                </div>
                                
                                {hasAnswered && (
                                    <div className="mt-6 space-y-3 animate-fade-in border-t border-gray-100 dark:border-gray-700 pt-6">
                                        <div className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {isCorrect && <Sparkles className="h-4 w-4" />}
                                            <span>{isCorrect ? translations.correct : `${translations.incorrect} ${item.correctAnswer}`}</span>
                                        </div>
                                        {item.explanation && (
                                            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                                {item.explanation}
                                            </p>
                                        )}
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
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                {translations.noVocabFound}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {vocabList.map((item, index) => {
                                    const isFlipped = flippedCards.has(index);
                                    return (
                                        <div 
                                            key={index}
                                            className="group perspective-1000 cursor-pointer h-48"
                                        >
                                            <button 
                                                onClick={() => toggleCardFlip(index)}
                                                className={`relative h-full w-full transition-all duration-500 transform-style-3d text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
                                                title={translations.clickToFlip}
                                                aria-label={`${item.word}, ${translations.clickToFlip}`}
                                            >
                                                
                                                {/* Front */}
                                                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02] group-hover:border-indigo-200 dark:bg-gray-800 dark:border-gray-700 dark:group-hover:border-indigo-500/30">
                                                    <span className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">{item.word}</span>
                                                    <span className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">{translations.clickToFlip}</span>
                                                </div>

                                                {/* Back */}
                                                <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl dark:from-indigo-600 dark:to-indigo-800">
                                                    <span className="text-xl font-bold text-center">{item.translation}</span>
                                                    <div className="absolute bottom-4 right-4 opacity-50">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </button>
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