import React from 'react';
import { X, BookMarked, Trash2, BookOpen } from 'lucide-react';
import { SavedStory } from '../types';

interface SavedStoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedStories: SavedStory[];
  onLoadStory: (story: SavedStory) => void;
  onDeleteStory: (id: string) => void;
  translations: Record<string, string>;
}

export const SavedStoriesModal: React.FC<SavedStoriesModalProps> = ({
  isOpen,
  onClose,
  savedStories,
  onLoadStory,
  onDeleteStory,
  translations
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex h-full max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800">
          <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <BookMarked className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold">{translations.savedStories}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {savedStories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <BookMarked className="mb-3 h-12 w-12 opacity-20" />
              <p>{translations.noSavedStories}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedStories.sort((a,b) => b.createdAt - a.createdAt).map((story) => (
                <div key={story.id} className="relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500/50">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-500/30">
                        {story.language}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-500/30">
                        {story.level}
                      </span>
                    </div>
                    <h4 className="mb-1 line-clamp-2 font-semibold text-gray-900 dark:text-white">
                      {story.history[0]?.title || "Untitled Story"}
                    </h4>
                    <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(story.createdAt).toLocaleDateString()} • {story.history.length} {translations.page.toLowerCase()}(s)
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onLoadStory(story);
                        onClose();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      <BookOpen className="h-4 w-4" />
                      {translations.load}
                    </button>
                    <button
                      onClick={() => onDeleteStory(story.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 focus:outline-none dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title={translations.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 text-right dark:border-gray-800 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {translations.close}
          </button>
        </div>
      </div>
    </div>
  );
};