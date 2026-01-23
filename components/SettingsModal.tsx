import React from 'react';
import { X, Settings } from 'lucide-react';
import { AppLanguage } from '../types';
import { APP_LANGUAGES } from '../constants';
import { Selector } from './Selector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  translations: Record<string, string>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appLanguage,
  onLanguageChange,
  translations
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center space-x-2 text-gray-900">
            <Settings className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold">{translations.settingsTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <Selector<AppLanguage>
            label={translations.appLanguage}
            value={appLanguage}
            options={APP_LANGUAGES}
            onChange={onLanguageChange}
          />
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {translations.close}
          </button>
        </div>
      </div>
    </div>
  );
};