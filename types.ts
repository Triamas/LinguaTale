
export type Language = 
  | "Bulgarian" | "Chinese" | "Croatian" | "Czech" | "Danish" | "Dutch" | "English" 
  | "Estonian" | "Finnish" | "French" | "German" | "Greek" | "Hungarian" 
  | "Irish" | "Italian" | "Japanese" | "Korean" | "Latvian" | "Lithuanian" | "Maltese" | "Polish" 
  | "Portuguese" | "Romanian" | "Slovak" | "Slovenian" | "Spanish" | "Swedish" | "Vietnamese";

export type AppLanguage = "English" | "Finnish" | "Vietnamese";

export type Theme = "light" | "dark";

export type CEFRLevel = 
  | "A1.1" | "A1.2" | "A1.3" 
  | "A2.1" | "A2.2" 
  | "B1.1" | "B1.2" 
  | "B2.1" | "B2.2" 
  | "C1-C2";

export type StoryStyle = 
  | "Adventure"
  | "Bedtime"
  | "Biography"
  | "Dialogue"
  | "Diary"
  | "Fantasy"
  | "Funny"
  | "History"
  | "Mystery"
  | "News"
  | "Romance"
  | "Sci-Fi"
  | "Serious"
  | "Standard"
  | "Thriller";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StoryResponse {
  title: string;
  shortDescription?: string; // Context priming in L1
  content: string;
  englishTranslation: string;
  grammarPoint?: string; // Explicit grammar noticing in L1
  quiz: QuizQuestion[];
  // Metadata for pedagogical verification (not shown to user)
  vocabularyMetadata: Record<string, {
    level: string;
    reason: string;
  }>;
}

export interface SavedStory {
  id: string;
  createdAt: number;
  language: Language;
  level: CEFRLevel;
  style: StoryStyle;
  topic: string;
  history: StoryResponse[];
  appLanguage: AppLanguage;
}

export interface SavedFlashCard {
  id: string; // Composite key: word + language
  word: string;
  translation: string;
  language: string; // The target language (e.g., "Finnish")
  createdAt: number;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: StoryResponse | null;
}
