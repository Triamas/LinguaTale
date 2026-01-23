import React, { useState, useEffect } from 'react';
import { BookMarked, Sparkles, Send, Tag, Settings as SettingsIcon } from 'lucide-react';
import { LANGUAGES, LEVELS, SUGGESTED_TOPICS, STORY_STYLES, LEVEL_DESCRIPTIONS, STORY_STYLE_LABELS, APP_LANGUAGES, LANGUAGE_LABELS, LANGUAGE_THEMES } from './constants';
import { Language, CEFRLevel, GenerationState, StoryStyle, StoryResponse, AppLanguage } from './types';
import { Selector } from './components/Selector';
import { StoryDisplay } from './components/StoryDisplay';
import { LoadingState } from './components/LoadingState';
import { SettingsModal } from './components/SettingsModal';
import { generateStory } from './services/geminiService';
import { TRANSLATIONS } from './translations';

const STORAGE_KEYS = {
  LANGUAGE: 'linguatale_pref_language',
  LEVEL: 'linguatale_pref_level',
  STYLE: 'linguatale_pref_style',
  APP_LANGUAGE: 'linguatale_app_language'
};

const App: React.FC = () => {
  // App Language State
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
    return (saved && APP_LANGUAGES.includes(saved as AppLanguage)) ? (saved as AppLanguage) : "English";
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Get current translation dictionaries
  const t = TRANSLATIONS[appLanguage] || TRANSLATIONS["English"];
  const levelDescriptions = LEVEL_DESCRIPTIONS[appLanguage] || LEVEL_DESCRIPTIONS["English"];
  const suggestedTopics = SUGGESTED_TOPICS[appLanguage] || SUGGESTED_TOPICS["English"];
  const storyStyleLabels = STORY_STYLE_LABELS[appLanguage] || STORY_STYLE_LABELS["English"];
  const languageLabels = LANGUAGE_LABELS[appLanguage] || LANGUAGE_LABELS["English"];

  // Form State - Initialize from LocalStorage or default
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved && LANGUAGES.includes(saved as Language)) ? (saved as Language) : "English";
  });

  const [level, setLevel] = useState<CEFRLevel>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEVEL);
    return (saved && LEVELS.includes(saved as CEFRLevel)) ? (saved as CEFRLevel) : "A1.1";
  });

  const [storyStyle, setStoryStyle] = useState<StoryStyle>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STYLE);
    return (saved && STORY_STYLES.includes(saved as StoryStyle)) ? (saved as StoryStyle) : "Standard";
  });

  const [storyDescription, setStoryDescription] = useState<string>("");

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEVEL, level);
  }, [level]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STYLE, storyStyle);
  }, [storyStyle]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, appLanguage);
  }, [appLanguage]);

  // Story Pagination State
  const [storyPages, setStoryPages] = useState<StoryResponse[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(-1);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);

  // API State (for initial generation or general errors)
  const [generation, setGeneration] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null
  });

  const handleTagClick = (tag: string) => {
    setStoryDescription((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      return `${trimmed}, ${tag}`;
    });
  };

  // Generate the FIRST page of a new story
  const handleGenerate = async () => {
    if (!storyDescription.trim()) {
      alert("Please describe the story or select a topic.");
      return;
    }

    setGeneration({ isLoading: true, error: null, data: null });
    setStoryPages([]);
    setPageIndex(-1);

    try {
      const data = await generateStory(language, level, storyDescription, storyStyle, appLanguage);
      setStoryPages([data]);
      setPageIndex(0);
      setGeneration({
        isLoading: false,
        error: null,
        data: null // We use storyPages now
      });
    } catch (err: any) {
      setGeneration({
        isLoading: false,
        error: err.message || "An unexpected error occurred.",
        data: null
      });
    }
  };

  // Navigate to previous page
  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  // Navigate to next page OR generate it
  const handleNextPage = async () => {
    // If we already have the next page in history, just go there
    if (pageIndex < storyPages.length - 1) {
      setPageIndex(pageIndex + 1);
      return;
    }

    // Otherwise, generate the next chapter
    setIsGeneratingNext(true);
    try {
      // Get content of the current page to use as context
      const currentContent = storyPages[pageIndex].content;
      
      const newPage = await generateStory(
        language, 
        level, 
        storyDescription, 
        storyStyle,
        appLanguage,
        currentContent // Pass previous context
      );

      setStoryPages(prev => [...prev, newPage]);
      setPageIndex(prev => prev + 1);
    } catch (err: any) {
      console.error("Failed to generate next page", err);
      // Optional: Show a toast or alert, but we'll keep the current page visible
      alert("Failed to generate the next chapter. Please try again.");
    } finally {
      setIsGeneratingNext(false);
    }
  };

  // Helper to determine what to display
  const currentStory = pageIndex >= 0 && storyPages.length > pageIndex ? storyPages[pageIndex] : null;

  // Determine theme gradient based on selected target language
  const themeGradient = LANGUAGE_THEMES[language] || "from-indigo-500 to-purple-600";
  
  // Get localized label for the current story style
  const currentStyleLabel = storyStyleLabels[storyStyle];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appLanguage={appLanguage}
        onLanguageChange={setAppLanguage}
        translations={t}
      />

      {/* Navbar / Header */}
      <header className="mx-auto max-w-7xl mb-10 text-center relative">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute right-0 top-0 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title={t.settingsTitle}
        >
          <SettingsIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <BookMarked className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t.appTitle}
            </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t.appSubtitle}
        </p>
      </header>

      <main className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
              <div className={`bg-gradient-to-r ${themeGradient} px-6 py-4 transition-colors duration-500`}>
                <h2 className="flex items-center text-lg font-semibold text-white shadow-sm">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.storySettings}
                </h2>
              </div>
              
              <div className="space-y-6 p-6">
                <Selector<Language> 
                  label={t.targetLanguage}
                  value={language} 
                  options={LANGUAGES} 
                  onChange={setLanguage}
                  disabled={generation.isLoading || isGeneratingNext}
                  getLabel={(opt) => languageLabels[opt]}
                />

                <Selector<CEFRLevel> 
                  label={t.languageLevel}
                  value={level} 
                  options={LEVELS} 
                  onChange={setLevel}
                  disabled={generation.isLoading || isGeneratingNext}
                  getLabel={(opt) => levelDescriptions[opt]}
                />

                <Selector<StoryStyle> 
                  label={t.storyStyle} 
                  value={storyStyle} 
                  options={STORY_STYLES} 
                  onChange={setStoryStyle}
                  disabled={generation.isLoading || isGeneratingNext}
                  getLabel={(opt) => storyStyleLabels[opt]}
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {t.storyDescription}
                  </label>
                  <textarea
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    placeholder={t.descPlaceholder}
                    className="w-full h-32 resize-none rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 placeholder:text-gray-400"
                    disabled={generation.isLoading || isGeneratingNext}
                  />
                  
                  {/* Tag Cloud */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <Tag className="w-3 h-3" />
                        <span>{t.suggestedTopics}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTopics.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          disabled={generation.isLoading || isGeneratingNext}
                          className="flex-auto text-center px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generation.isLoading || isGeneratingNext || !storyDescription.trim()}
                    className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-4 font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {generation.isLoading ? t.startingStory : (
                        <>
                            {t.newStory} <Send className="ml-2 h-4 w-4" />
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Display */}
          <div className="flex flex-col items-center lg:col-span-8">
            {generation.isLoading && <LoadingState message={t.startingStory} />}
            
            {generation.error && (
              <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
                <p className="font-medium">{t.errorGenerating}</p>
                <p className="text-sm">{generation.error}</p>
              </div>
            )}

            {!generation.isLoading && !generation.error && !currentStory && (
              <div className="flex h-96 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 text-center">
                <div className="mb-4 rounded-full bg-indigo-50 p-4">
                  <BookMarked className="h-10 w-10 text-indigo-200" />
                </div>
                <h3 className="text-xl font-medium text-gray-500">{t.readyToRead}</h3>
                <p className="mt-1 text-gray-400">{t.readyPrompt}</p>
              </div>
            )}

            {currentStory && (
              <StoryDisplay 
                story={currentStory} 
                language={languageLabels[language]} // Pass localized language name
                styleLabel={currentStyleLabel} // Pass localized style label
                level={level}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                canGoNext={true} // Always allow trying for next page
                canGoPrev={pageIndex > 0}
                hasNextPageInHistory={pageIndex < storyPages.length - 1}
                isGeneratingNext={isGeneratingNext}
                currentPage={pageIndex + 1}
                translations={t}
              />
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;