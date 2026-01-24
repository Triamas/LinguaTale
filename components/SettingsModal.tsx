import React from 'react';
import { X, Settings } from 'lucide-react';
import { AppLanguage, Theme } from '../types';
import { APP_LANGUAGES } from '../constants';
import { Selector } from './Selector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  showQuiz: boolean;
  onShowQuizChange: (show: boolean) => void;
  showFlashCards: boolean;
  onShowFlashCardsChange: (show: boolean) => void;
  translations: Record<string, string>;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (val: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
      checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appLanguage,
  onLanguageChange,
  theme,
  onThemeChange,
  showQuiz,
  onShowQuizChange,
  showFlashCards,
  onShowFlashCardsChange,
  translations
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800">
          <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold">{translations.settingsTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          <Selector<AppLanguage>
            label={translations.appLanguage}
            value={appLanguage}
            options={APP_LANGUAGES}
            onChange={onLanguageChange}
          />
          
          <div className="space-y-6 pt-2">
             {/* Dark Mode Toggle */}
             <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {translations.darkMode}
                </label>
                <ToggleSwitch 
                  checked={theme === 'dark'}
                  onChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
                />
             </div>

             {/* Quiz Toggle */}
             <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {translations.enableQuiz}
                </label>
                <ToggleSwitch 
                  checked={showQuiz}
                  onChange={onShowQuizChange}
                />
             </div>

             {/* Flash Cards Toggle */}
             <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {translations.enableFlashCards}
                </label>
                <ToggleSwitch 
                  checked={showFlashCards}
                  onChange={onShowFlashCardsChange}
                />
             </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 text-right dark:border-gray-800 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {translations.close}
          </button>
        </div>
      </div>
    </div>
  );
};