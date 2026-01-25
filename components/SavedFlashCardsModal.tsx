
import React, { useState } from 'react';
import { X, SquareStack, Trash2 } from 'lucide-react';
import { SavedFlashCard } from '../types';

interface SavedFlashCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedFlashCards: SavedFlashCard[];
  onDeleteFlashCard: (id: string) => void;
  translations: Record<string, string>;
}

export const SavedFlashCardsModal: React.FC<SavedFlashCardsModalProps> = ({
  isOpen,
  onClose,
  savedFlashCards,
  onDeleteFlashCard,
  translations
}) => {
  const [flippedCardIds, setFlippedCardIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleCard = (id: string) => {
    setFlippedCardIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex h-full max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800">
          <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <SquareStack className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold">{translations.savedFlashCards}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {savedFlashCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 h-full">
              <SquareStack className="mb-3 h-12 w-12 opacity-20" />
              <p>{translations.noSavedFlashCards}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedFlashCards.sort((a,b) => b.createdAt - a.createdAt).map((card) => {
                const isFlipped = flippedCardIds.has(card.id);
                return (
                  <div key={card.id} className="relative group perspective-1000 h-40">
                    <div 
                      onClick={() => toggleCard(card.id)}
                      className={`relative h-full w-full transition-all duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                    >
                      {/* Front */}
                      <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-500/50">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 absolute top-2 left-3 opacity-60 uppercase">{card.language}</span>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center break-words w-full">{card.word}</span>
                      </div>

                      {/* Back */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-4 rounded-xl bg-indigo-600 text-white shadow-lg dark:bg-indigo-700">
                        <span className="text-lg font-medium text-center break-words w-full">{card.translation}</span>
                      </div>
                    </div>

                    {/* Delete Button (Front Only - simplified interactions) */}
                    {!isFlipped && (
                        <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFlashCard(card.id);
                        }}
                        className="absolute top-2 right-2 rounded-full p-1.5 bg-white/80 text-gray-400 hover:text-red-600 hover:bg-white shadow-sm border border-transparent hover:border-red-100 dark:bg-gray-700/80 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700 transition-all z-10"
                        title={translations.removeFlashCard}
                        >
                        <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                  </div>
                );
              })}
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
