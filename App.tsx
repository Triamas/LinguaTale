import React, { useState, useEffect, useMemo } from 'react';
import { BookMarked, Sparkles, Send, Tag, Settings as SettingsIcon, Library } from 'lucide-react';
import { LANGUAGES, LEVELS, LEVEL_SPECIFIC_TOPICS, STORY_STYLES, LEVEL_DESCRIPTIONS, STORY_STYLE_LABELS, APP_LANGUAGES, LANGUAGE_LABELS, LANGUAGE_THEMES } from './constants';
import { Language, CEFRLevel, GenerationState, StoryStyle, StoryResponse, AppLanguage, SavedStory } from './types';
import { Selector } from './components/Selector';
import { StoryDisplay } from './components/StoryDisplay';
import { LoadingState } from './components/LoadingState';
import { SettingsModal } from './components/SettingsModal';
import { SavedStoriesModal } from './components/SavedStoriesModal';
import { generateStory } from './services/geminiService';
import { TRANSLATIONS } from './translations';

const STORAGE_KEYS = {
  LANGUAGE: 'linguatale_pref_language',
  LEVEL: 'linguatale_pref_level',
  STYLE: 'linguatale_pref_style',
  APP_LANGUAGE: 'linguatale_app_language',
  SAVED_STORIES: 'linguatale_saved_stories'
};

const App: React.FC = () => {
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
    return (saved && APP_LANGUAGES.includes(saved as AppLanguage)) ? (saved as AppLanguage) : "English";
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const t = TRANSLATIONS[appLanguage] || TRANSLATIONS["English"];
  const levelDescriptions = LEVEL_DESCRIPTIONS[appLanguage] || LEVEL_DESCRIPTIONS["English"];
  const storyStyleLabels = STORY_STYLE_LABELS[appLanguage] || STORY_STYLE_LABELS["English"];
  const languageLabels = LANGUAGE_LABELS[appLanguage] || LANGUAGE_LABELS["English"];

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

  // History for pagination and state management
  const [storyHistory, setStoryHistory] = useState<StoryResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistence for Saved Stories
  const [savedStories, setSavedStories] = useState<SavedStory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_STORIES);
      if (saved) {
        let parsed = JSON.parse(saved);
        // Migration: Rename deprecated styles in saved stories to avoid UI errors
        parsed = parsed.map((s: any) => ({
          ...s,
          style: s.style === "Bedtime Story" ? "Bedtime" : 
                 s.style === "Dialogue-heavy" ? "Dialogue" : s.style
        }));
        return parsed;
      }
      return [];
    } catch (e) {
      console.error("Failed to parse saved stories", e);
      return [];
    }
  });

  // Identifier for the current session's story
  const [currentStoryId, setCurrentStoryId] = useState<string>(() => crypto.randomUUID());

  // Dynamic Topics based on Level
  const currentSuggestedTopics = useMemo(() => {
    // Look up topics for the exact level
    return LEVEL_SPECIFIC_TOPICS[appLanguage]?.[level] || LEVEL_SPECIFIC_TOPICS["English"]?.["A1.1"] || [];
  }, [level, appLanguage]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, appLanguage);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    localStorage.setItem(STORAGE_KEYS.LEVEL, level);
    localStorage.setItem(STORAGE_KEYS.STYLE, storyStyle);
  }, [appLanguage, language, level, storyStyle]);

  // Persist Saved Stories
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_STORIES, JSON.stringify(savedStories));
  }, [savedStories]);

  // Auto-update saved story if the current story is modified (e.g., new page added)
  useEffect(() => {
    if (savedStories.some(s => s.id === currentStoryId) && storyHistory.length > 0) {
      setSavedStories(prev => prev.map(s => 
        s.id === currentStoryId ? { ...s, history: storyHistory } : s
      ));
    }
  }, [storyHistory, currentStoryId]);

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    setError(null);
    setStoryHistory([]);
    setCurrentIndex(-1);
    
    // Generate new ID for the new story
    setCurrentStoryId(crypto.randomUUID());
    
    try {
      const topic = storyDescription.trim() || (currentSuggestedTopics[0] || "A random adventure");
      const newStory = await generateStory(language, level, topic, storyStyle, appLanguage);
      setStoryHistory([newStory]);
      setCurrentIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || t.errorGenerating);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextPage = async () => {
    if (currentIndex < storyHistory.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const lastStory = storyHistory[storyHistory.length - 1];
      const nextPart = await generateStory(
        language, 
        level, 
        `Continuation of: ${lastStory.title}`, 
        storyStyle, 
        appLanguage, 
        lastStory.content
      );
      setStoryHistory(prev => [...prev, nextPart]);
      setCurrentIndex(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || t.errorGenerating);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTopicClick = (topic: string) => {
    setStoryDescription((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return topic;
      const existing = trimmed.split(',').map(s => s.trim());
      if (existing.includes(topic)) return trimmed;
      return `${trimmed}, ${topic}`;
    });
  };

  const handleToggleBookmark = () => {
    if (savedStories.some(s => s.id === currentStoryId)) {
      // Remove bookmark
      setSavedStories(prev => prev.filter(s => s.id !== currentStoryId));
    } else {
      // Add bookmark
      if (storyHistory.length === 0) return;
      
      const newSavedStory: SavedStory = {
        id: currentStoryId,
        createdAt: Date.now(),
        language,
        level,
        style: storyStyle,
        topic: storyDescription || currentSuggestedTopics[0],
        history: storyHistory,
        appLanguage
      };
      setSavedStories(prev => [newSavedStory, ...prev]);
    }
  };

  const handleLoadStory = (story: SavedStory) => {
    setLanguage(story.language);
    setLevel(story.level);
    setStoryStyle(story.style);
    setStoryDescription(story.topic);
    setStoryHistory(story.history);
    setCurrentStoryId(story.id);
    setCurrentIndex(story.history.length - 1);
    setError(null);
  };

  const handleDeleteSavedStory = (id: string) => {
    setSavedStories(prev => prev.filter(s => s.id !== id));
    // If we delete the currently viewed story from the list, we don't necessarily need to clear the view,
    // but the bookmark icon should update to "unfilled". This happens automatically via reactivity.
  };

  const currentStory = currentIndex >= 0 ? storyHistory[currentIndex] : null;
  const themeGradient = LANGUAGE_THEMES[language] || "from-indigo-500 to-purple-600";
  const isBookmarked = savedStories.some(s => s.id === currentStoryId);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-lg">
                <BookMarked className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">{t.appTitle}</h1>
                <p className="hidden text-xs font-medium text-gray-500 sm:block">{t.appSubtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                title={t.savedStories}
              >
                <Library className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                title={t.settingsTitle}
              >
                <SettingsIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar - Controls */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
              <div className={`bg-gradient-to-r ${themeGradient} px-6 py-4`}>
                <h2 className="flex items-center text-lg font-semibold text-white">
                  <Sparkles className="mr-2 h-5 w-5" /> {t.storySettings}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <Selector<Language>
                  label={t.targetLanguage}
                  value={language}
                  options={LANGUAGES}
                  onChange={setLanguage}
                  getLabel={(opt) => languageLabels[opt]}
                  disabled={isGenerating}
                />

                <Selector<CEFRLevel>
                  label={t.languageLevel}
                  value={level}
                  options={LEVELS}
                  onChange={setLevel}
                  getLabel={(opt) => levelDescriptions[opt]}
                  disabled={isGenerating}
                />

                <Selector<StoryStyle>
                  label={t.storyStyle}
                  value={storyStyle}
                  options={STORY_STYLES}
                  onChange={setStoryStyle}
                  getLabel={(opt) => storyStyleLabels[opt]}
                  disabled={isGenerating}
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-indigo-500" />
                    {t.storyDescription}
                  </label>
                  <textarea
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    placeholder={t.descPlaceholder}
                    rows={3}
                    disabled={isGenerating}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{t.suggestedTopics}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentSuggestedTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleTopicClick(topic)}
                        disabled={isGenerating}
                        className="grow rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 text-center justify-center transition-colors hover:bg-indigo-100 disabled:opacity-50"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateNew}
                  disabled={isGenerating}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                  <span>{t.newStory}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content - Story Display */}
          <section className="lg:col-span-8 xl:col-span-9">
            {isGenerating && !currentStory ? (
              <div className="mt-12">
                <LoadingState message={t.startingStory} />
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            ) : currentStory ? (
              <StoryDisplay
                story={currentStory}
                language={languageLabels[language]}
                storyStyle={storyStyle}
                styleLabel={storyStyleLabels[storyStyle]}
                level={level}
                currentPage={currentIndex + 1}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                canGoPrev={currentIndex > 0}
                canGoNext={true}
                hasNextPageInHistory={currentIndex < storyHistory.length - 1}
                isGeneratingNext={isGenerating}
                translations={t}
                isBookmarked={isBookmarked}
                onToggleBookmark={handleToggleBookmark}
              />
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <div className="mb-4 rounded-full bg-indigo-50 p-4 text-indigo-600">
                  <BookMarked className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t.readyToRead}</h3>
                <p className="mt-2 text-gray-500">{t.readyPrompt}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appLanguage={appLanguage}
        onLanguageChange={setAppLanguage}
        translations={t}
      />
      
      <SavedStoriesModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedStories={savedStories}
        onLoadStory={handleLoadStory}
        onDeleteStory={handleDeleteSavedStory}
        translations={t}
      />
    </div>
  );
};

export default App;