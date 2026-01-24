import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectorProps<T extends string> {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
  disabled?: boolean;
  getLabel?: (option: T) => string;
}

export const Selector = <T extends string>({ 
  label, 
  value, 
  options, 
  onChange, 
  disabled,
  getLabel 
}: SelectorProps<T>) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="dark:bg-gray-800">
              {getLabel ? getLabel(opt) : opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};