import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CEFRLevel, Language, StoryResponse, StoryStyle, AppLanguage } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The title of the story (or chapter) in the target language."
    },
    content: {
      type: Type.STRING,
      description: "The main body of the story in the target language. Use \\n\\n to separate paragraphs."
    },
    englishTranslation: {
      type: Type.STRING,
      description: "A full translation of the story in the requested OUTPUT LANGUAGE."
    },
    quiz: {
      type: Type.ARRAY,
      description: "A reading comprehension quiz with 3 questions in the TARGET LANGUAGE.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The question in the TARGET LANGUAGE (not English)." },
          options: { 
            type: Type.ARRAY, 
            description: "3 possible answers in the TARGET LANGUAGE.",
            items: { type: Type.STRING } 
          },
          correctAnswer: { type: Type.STRING, description: "The correct answer string, which must match one of the options." }
        },
        required: ["question", "options", "correctAnswer"]
      }
    }
  },
  required: ["title", "content", "englishTranslation", "quiz"]
};

// Helper to get specific vocabulary count based on level
const getVocabCount = (level: CEFRLevel): string => {
  if (level.startsWith("A1")) return "20-25"; // High support for beginners
  if (level.startsWith("A2")) return "15-20";
  if (level.startsWith("B1")) return "15";
  if (level.startsWith("B2")) return "10";
  return "5-8"; // Minimal support for advanced
};

// Helper to get strict grammatical and structural constraints
const getLevelConstraints = (level: CEFRLevel): string => {
  switch (level) {
    case "A1.1":
      return `
        CRITICAL: LEVEL A1.1 (ABSOLUTE BEGINNER) - EXTREMELY RESTRICTIVE
        1. TENSES: Use ONLY Present Simple (e.g., "It is", "She has"). ABSOLUTELY NO Past, NO Future, NO Continuous tenses.
        2. VERBS: Use only the top 50 most basic verbs (be, have, do, go, see, eat, drink, sleep, want, like).
        3. SYNTAX: Subject-Verb-Object (SVO) sentences ONLY. 
           - Allowed: "The cat is black."
           - PROHIBITED: "The cat that I saw is black." (No relative clauses).
           - PROHIBITED: "I want to go." (Avoid complex infinitives if possible, keep it simple).
        4. CONNECTORS: Use ONLY "and". DO NOT USE "but", "because", "so", "or".
        5. SENTENCE LENGTH: Max 5-7 words per sentence. Keep them extremely short.
        6. TOPICS: Concrete, visible objects only (colors, family, house). No abstract concepts.
      `;
    case "A1.2":
      return `
        CRITICAL: LEVEL A1.2 (BEGINNER)
        1. TENSES: Mostly Present Simple. 
           - Allowed: Very limited high-frequency Past Simple (only 'was/were', 'did', 'went').
           - Allowed: 'Can' for ability.
        2. SYNTAX: Simple sentences. Basic questions (Who, What, Where).
        3. CONNECTORS: "and", "but", "or". 
           - PROHIBITED: "because", "if", "when", "so".
        4. SENTENCE LENGTH: Average 6-8 words.
        5. VOCABULARY: Top 500 common words.
      `;
    case "A1.3":
      return `
        CRITICAL: LEVEL A1.3 (ELEMENTARY)
        1. TENSES: Present Simple, Present Continuous. 
           - Allowed: Simple Past (regular/irregular). 
           - Allowed: 'Going to' for future plans.
        2. SYNTAX: Compound sentences allowed.
        3. CONNECTORS: "and", "but", "or", "because".
        4. VOCABULARY: Top 800 words (Daily routine, family info, hobbies).
      `;
    case "A2.1":
      return `
        CRITICAL: LEVEL A2.1 (HIGH ELEMENTARY)
        1. TENSES: Past Simple (Narrative). Future with 'will'. Imperatives.
        2. SYNTAX: Comparatives and Superlatives (bigger, biggest). Adverbs of frequency (always, sometimes).
        3. CONNECTORS: "when", "then", "first", "next" (Sequencing).
        4. VOCABULARY: Top 1000 words.
        5. PROHIBITED: Passive voice, Conditionals.
      `;
    case "A2.2":
      return `
        CRITICAL: LEVEL A2.2 (PRE-INTERMEDIATE)
        1. TENSES: Present Perfect (for Experience, e.g., "Have you ever..."). Modal verbs (must, should, have to).
        2. SYNTAX: Zero and First Conditional ("If it rains, I stay home"). Relative clauses with "who" or "which".
        3. VOCABULARY: Top 1500 words.
      `;
    case "B1.1":
      return `
        LEVEL B1.1 (INTERMEDIATE)
        1. TENSES: Past Continuous ("I was walking"). Present Perfect with for/since.
        2. SYNTAX: Simple Passive voice. Reported speech (basic).
        3. CONNECTORS: "although", "however", "so that".
        4. CONTENT: Opinions, reasons, dreams, travel.
      `;
    case "B1.2":
      return `
        LEVEL B1.2 (HIGH INTERMEDIATE)
        1. TENSES: Past Perfect. Used to. 
        2. SYNTAX: Second Conditional ("If I were rich..."). 
        3. VOCABULARY: Abstract topics start here.
      `;
    case "B2.1":
      return `
        LEVEL B2.1 (UPPER INTERMEDIATE)
        1. TENSES: Future Continuous. Present Perfect Continuous.
        2. SYNTAX: Third Conditional. Mixed Conditionals. 
        3. STYLE: Argumentation, highlighting significance.
      `;
    case "B2.2":
      return `
        LEVEL B2.2 (PRE-ADVANCED)
        1. TENSES: All tenses used naturally.
        2. SYNTAX: Complex passive forms. Inversion for emphasis.
        3. VOCABULARY: Idioms, phrasal verbs, nuance.
      `;
    case "C1-C2":
      return `
        LEVEL C1/C2 (ADVANCED/MASTERY)
        - No grammatical restrictions.
        - Focus on nuance, idioms, cultural references, and complex literary structures.
        - High-level vocabulary.
      `;
    default:
      return "Standard grammar rules.";
  }
};

export const generateStory = async (
  language: Language,
  level: CEFRLevel,
  topic: string,
  style: StoryStyle,
  outputLanguage: AppLanguage,
  previousContext?: string
): Promise<StoryResponse> => {
  
  const vocabCount = getVocabCount(level);
  const strictLevelConstraints = getLevelConstraints(level);

  // Language specific constraints (keep existing logic)
  let languageConstraints = "";
  if (language === "Finnish") {
    if (level === "A1.1") {
        languageConstraints += " FINNISH A1.1 SPECIFIC: Use ONLY Nominative (dictionary form) and Partitive (for numbers/negation). Avoid Genitive if possible. NO other cases (No Inessive/Adessive etc. unless absolute set phrases).";
    } else if (level === "A1.2") {
        languageConstraints += " FINNISH A1.2 SPECIFIC: Add Genitive. Simple local cases (Missä? -ssa/ssä). Avoid object cases if complex.";
    } else if (level.startsWith("A2")) {
      languageConstraints += " CRITICAL FINNISH RULE: Introduce local cases (Inessive, Elative, Illative, Adessive, Ablative, Allative) sparingly. Keep sentence structure SVO where possible.";
    }
  }

  let taskDescription = "Task: Write a short story strictly adhering to the requested proficiency level.";
  let contentContext = "";

  if (previousContext) {
    taskDescription = "Task: Write the NEXT PART (continuation) of the story provided below. Keep the same characters, setting, and flow. Do NOT repeat the previous text.";
    contentContext = `
    PREVIOUS STORY CONTEXT (Do not repeat this, continue from here):
    "${previousContext.slice(-1500)}"
    `;
  }

  const prompt = `
    Role: You are a strict CEFR compliance engine and language teacher. Your ONE GOAL is to generate text that matches the requested level ${level} EXACTLY.

    PARAMETERS:
    - Target Language: ${language}
    - Level: ${level}
    - Topic: ${topic}
    - Style: ${style}
    - Output/Support Language: ${outputLanguage} (Everything in EnglishTranslation and Vocabulary definitions MUST be in ${outputLanguage})
    
    ${contentContext}
    
    INSTRUCTIONS FOR STRICT ADHERENCE:
    1. ANALYZE the "LEVEL CONSTRAINTS" below.
    2. SIMPLIFY your internal thoughts. If you think of a complex sentence, BREAK IT DOWN.
    3. VALIDATE every sentence against the allowed tenses and connectors for level ${level}.
    4. IF LEVEL IS A1.1 or A1.2: Do not try to be "creative" with grammar. Be robotic and simple. Repetition is good.
    
    LEVEL CONSTRAINTS (YOU MUST OBEY THESE):
    ${strictLevelConstraints}
    
    LANGUAGE SPECIFIC RULES:
    ${languageConstraints}
    
    CONTENT STRUCTURE:
    - Length: approx 300-400 words.
    - Paragraphs: 3-5 clear paragraphs separated by \\n\\n.
    - ENDING: Do NOT finish the story with a definitive ending like "The End". Write the story assuming it can continue to the next page.
    
    INTERACTIVE VOCABULARY:
    - Identify EXACTLY ${vocabCount} key words/phrases.
    - Embed ${outputLanguage} translations strictly using this format: {inflected_word|translation}
    - The word inside the curly braces MUST be the actual word used in the sentence (inflected), not the dictionary form.
    - The translation MUST be in ${outputLanguage}.
    
    QUIZ:
    - Create 3 reading comprehension questions in ${language}.
    - The quiz must be answerable solely from the text generated above.
    
    You will fail if you use vocabulary or grammar from a higher level.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, // Low temperature for strict rule following
        thinkingConfig: { thinkingBudget: 1024 } // Budget for reasoning about grammar constraints
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    
    return JSON.parse(text) as StoryResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate story. Please verify your API key and try again.");
  }
};