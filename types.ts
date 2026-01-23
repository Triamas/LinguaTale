export type Language = 
  | "Bulgarian" | "Croatian" | "Czech" | "Danish" | "Dutch" | "English" 
  | "Estonian" | "Finnish" | "French" | "German" | "Greek" | "Hungarian" 
  | "Irish" | "Italian" | "Latvian" | "Lithuanian" | "Maltese" | "Polish" 
  | "Portuguese" | "Romanian" | "Slovak" | "Slovenian" | "Spanish" | "Swedish";

export type AppLanguage = "English" | "Finnish" | "Vietnamese";

export type CEFRLevel = 
  | "A1.1" | "A1.2" | "A1.3" 
  | "A2.1" | "A2.2" 
  | "B1.1" | "B1.2" 
  | "B2.1" | "B2.2" 
  | "C1-C2";

export type StoryStyle = 
  | "Standard"
  | "Funny"
  | "Serious"
  | "Bedtime Story"
  | "Thriller"
  | "Sci-Fi"
  | "Fantasy"
  | "Mystery"
  | "Dialogue-heavy";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface StoryResponse {
  title: string;
  content: string;
  englishTranslation: string;
  quiz: QuizQuestion[];
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: StoryResponse | null;
}