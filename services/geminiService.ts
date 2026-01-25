
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CEFRLevel, Language, StoryResponse, StoryStyle, AppLanguage } from "../types";

const getVocabCount = (level: CEFRLevel): string => {
  if (level.startsWith("A1")) return "25-35"; 
  if (level.startsWith("A2")) return "20-28";
  if (level.startsWith("B1")) return "18-24";
  if (level.startsWith("B2")) return "15-20";
  return "12-18"; 
};

/**
 * Returns style-specific prompt instructions and temperature.
 * Adjusts constraints based on CEFR level to ensure accessibility.
 */
const getStyleConfig = (style: StoryStyle, level: CEFRLevel): { instructions: string; temperature: number } => {
  const isBeginner = level.startsWith("A1") || level === "A2.1";
  
  switch (style) {
    case "Adventure":
      return {
        instructions: `GENRE: ADVENTURE. 
        - Focus on action, travel, and discovery.
        - ${isBeginner ? "Keep the plot linear. Simple 'Problem -> Journey -> Solution' structure." : "Include suspense, diverse locations, and unexpected obstacles."}`,
        temperature: 0.6
      };
    case "Bedtime":
      return {
        instructions: `GENRE: BEDTIME STORY.
        - Tone: Soothing, calm, repetitive, and gentle.
        - Structure: Begin with "Once upon a time" (or language equivalent) and end happily.
        - ${isBeginner ? "Use heavy repetition of key vocabulary for reinforcement." : "Use descriptive, dream-like imagery."}`,
        temperature: 0.4
      };
    case "Biography":
      return {
        instructions: `GENRE: BIOGRAPHY.
        - Format: Factual account of a person's life (real or fictional).
        - Tone: Respectful, informative, chronological.
        - ${isBeginner ? "Focus on basic life events: birth, school, job, family." : "Discuss achievements, historical context, and legacy."}`,
        temperature: 0.3
      };
    case "Dialogue":
      return {
        instructions: `GENRE: DIALOGUE / SCRIPT.
        - Format: Use a script format (e.g., 'Person A: [Text]').
        - Focus: Spoken language, natural conversational fillers appropriate for ${level}.
        - ${isBeginner ? "Topics: Greetings, ordering food, asking directions." : "Topics: Debates, expressing complex opinions, negotiating."}`,
        temperature: 0.5
      };
    case "Diary":
      return {
        instructions: `GENRE: DIARY ENTRY.
        - Format: Start with a date or 'Dear Diary'. First-person perspective ('I').
        - Tone: Personal, reflective, informal.
        - ${isBeginner ? "Describe daily routine, weather, and basic feelings." : "Express deep thoughts, regrets, hopes, and complex emotions."}`,
        temperature: 0.5
      };
    case "Fantasy":
      return {
        instructions: `GENRE: FANTASY.
        - Elements: Magic, mythical creatures, imaginary worlds.
        - ${isBeginner ? "Keep magic simple (e.g., a flying cat, a magic stone). Avoid complex lore." : "Build a rich world. Use descriptive adjectives for settings."}`,
        temperature: 0.7
      };
    case "Funny":
      return {
        instructions: `GENRE: COMEDY / FUNNY.
        - Goal: Make the reader laugh using situational humor.
        - ${isBeginner ? "Use physical comedy or simple misunderstandings. NO puns or wordplay (too hard)." : "Use wit, irony, and sarcasm."}`,
        temperature: 0.8
      };
    case "History":
      return {
        instructions: `GENRE: HISTORICAL FICTION / HISTORY.
        - Setting: A specific time in the past.
        - ${isBeginner ? "Focus on a single event or day. Use simple Past Simple sentences." : "Describe the era, costumes, and social atmosphere."}`,
        temperature: 0.3
      };
    case "Mystery":
      return {
        instructions: `GENRE: MYSTERY.
        - Plot: A puzzle, missing object, or strange event needs solving.
        - ${isBeginner ? "The solution should be obvious and physical (e.g., the dog hid the keys)." : "Include red herrings and subtle clues."}`,
        temperature: 0.6
      };
    case "News":
      return {
        instructions: `GENRE: NEWS ARTICLE.
        - Format: Headline at the top. Third-person 'Reporter' voice.
        - Tone: Objective, factual, formal.
        - ${isBeginner ? "Short sentences. 'Who, What, Where'. Simple reported speech." : "Use passive voice. 'It was reported that...'. Interview quotes."}`,
        temperature: 0.2
      };
    case "Romance":
      return {
        instructions: `GENRE: ROMANCE.
        - Focus: Relationships, feelings, dates.
        - Tone: Warm, emotional.
        - ${isBeginner ? "Focus on first meeting, liking someone, going to the movies." : "Focus on deep connection, relationship struggles, and resolution."}`,
        temperature: 0.6
      };
    case "Sci-Fi":
      return {
        instructions: `GENRE: SCIENCE FICTION.
        - Elements: Robots, space, future technology.
        - ${isBeginner ? "Focus on everyday life with a robot helper. Simple gadgets." : "Explore themes of AI, space travel, or ethical dilemmas."}`,
        temperature: 0.7
      };
    case "Serious":
      return {
        instructions: `GENRE: SERIOUS / DRAMA.
        - Tone: Grounded, realistic, perhaps slightly melancholic or focused on important issues.
        - ${isBeginner ? "A serious day at work or a lost pet." : "Social issues, personal loss, or difficult decisions."}`,
        temperature: 0.4
      };
    case "Thriller":
      return {
        instructions: `GENRE: THRILLER.
        - Tone: Tense, urgent, fast-paced.
        - ${isBeginner ? "Someone is late, running for a bus, or hearing a strange noise." : "High stakes, racing against time, psychological tension."}`,
        temperature: 0.7
      };
    default: // Standard
      return {
        instructions: "GENRE: STANDARD STORY. A balanced, engaging narrative suitable for general reading practice.",
        temperature: 0.5
      };
  }
};

/**
 * Enhanced Level Constraints with FORBIDDEN GRAMMAR to prevent level-bleed.
 */
const getLevelConstraints = (level: CEFRLevel): string => {
  switch (level) {
    case "A1.1":
      return `
        LEVEL: A1.1 (BREAKTHROUGH)
        - POSITIVE: Top 100 nouns only. Present Simple 'be' and 'have'.
        - FORBIDDEN: NO 'but', NO 'because', NO Past tenses, NO Future tenses, NO adjectives (except colors/size).
      `;
    case "A1.2":
      return `
        LEVEL: A1.2 (BEGINNER)
        - POSITIVE: Basic Present Simple. 'and', 'or'.
        - FORBIDDEN: NO Past Continuous, NO Perfect tenses, NO 'if' clauses, NO 'when' clauses.
      `;
    case "A1.3":
      return `
        LEVEL: A1.3 (ELEMENTARY)
        - POSITIVE: Past Simple (Regular verbs), Present Continuous. 'because'.
        - FORBIDDEN: NO Passive voice, NO Conditional moods, NO Irregular past forms if obscure.
      `;
    case "A2.1":
      return `
        LEVEL: A2.1 (HIGH ELEMENTARY)
        - POSITIVE: Future 'will', basic Comparatives.
        - FORBIDDEN: NO Present Perfect, NO Modal verbs like 'should' or 'must'.
      `;
    case "A2.2":
      return `
        LEVEL: A2.2 (PRE-INTERMEDIATE)
        - POSITIVE: Present Perfect, Modal verbs, First Conditional.
        - FORBIDDEN: NO Past Perfect, NO Third Conditional, NO Passive Voice.
      `;
    case "B1.1":
      return `
        LEVEL: B1.1 (INTERMEDIATE)
        - POSITIVE: Simple Passive Voice, Second Conditional.
        - FORBIDDEN: NO Future Perfect, NO Subjunctive Mood, NO Inversion.
      `;
    case "B1.2":
      return `
        LEVEL: B1.2 (HIGH INTERMEDIATE)
        - POSITIVE: Past Perfect, Reported Speech, 'although'.
        - FORBIDDEN: NO Mixed Conditionals, NO complex Gerund vs Infinitive nuances.
      `;
    case "B2.1":
      return `
        LEVEL: B2.1 (UPPER INTERMEDIATE)
        - POSITIVE: Future Continuous, Mixed Conditionals.
        - FORBIDDEN: NO Archaic vocabulary, NO overly formal academic structures.
      `;
    default:
      return "Ensure natural use of the language appropriate for the selected CEFR level.";
  }
};

export const generateStory = async (
  language: Language,
  level: CEFRLevel,
  topic: string,
  style: StoryStyle,
  outputLanguage: AppLanguage,
  enableQuiz: boolean,
  enableFlashCards: boolean,
  previousContext?: string
): Promise<StoryResponse> => {
  
  // Create a new instance right before use to ensure latest API_KEY is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const vocabCount = getVocabCount(level);
  const strictLevelConstraints = getLevelConstraints(level);
  const styleConfig = getStyleConfig(style, level);

  // Dynamic Schema Construction
  const schemaProperties: any = {
    title: {
      type: Type.STRING,
      description: "The title of the story in the target language."
    },
    shortDescription: {
      type: Type.STRING,
      description: "A 1-sentence summary of the story in the user's interface language (English, Finnish, or Vietnamese)."
    },
    content: {
      type: Type.STRING,
      description: enableFlashCards 
        ? "The main body of the story in the target language. Use {word|translation} for highlights. MUST contain multiple paragraphs separated by newlines."
        : "The main body of the story in the target language. Do NOT use {word|translation} tags. Plain text only. MUST contain multiple paragraphs separated by newlines."
    },
    englishTranslation: {
      type: Type.STRING,
      description: "A full translation of the story in the user's interface language."
    },
    grammarPoint: {
      type: Type.STRING,
      description: "A short explanation of a specific grammar rule or structure used in the story, written in the user's interface language."
    }
  };

  const requiredFields = ["title", "shortDescription", "content", "englishTranslation", "grammarPoint"];

  if (enableQuiz) {
    schemaProperties.quiz = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "Explanation of why the answer is correct, in the user's interface language." }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
      }
    };
    requiredFields.push("quiz");
  }

  if (enableFlashCards) {
    schemaProperties.vocabularyMetadata = {
      type: Type.OBJECT,
      description: "A mapping of every highlighted {word} to its verified CEFR level and reason for selection.",
      properties: {
        word: {
           type: Type.OBJECT,
           properties: {
             level: { type: Type.STRING },
             reason: { type: Type.STRING }
           }
        }
      },
      additionalProperties: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    };
    requiredFields.push("vocabularyMetadata");
  }

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: schemaProperties,
    required: requiredFields
  };

  const prompt = `
    Role: Senior Language Education Specialist & CEFR Auditor.
    
    TASK: Generate a ${language} story at EXACTLY level ${level}.
    ${previousContext ? `CONTEXT: This is a continuation of the previous part: "${previousContext}"` : ""}

    SYSTEMIC WORKFLOW:
    1. CONFIGURATION: Use the following style settings:
       ${styleConfig.instructions}
    2. LENGTH & STRUCTURE (STRICT):
       - The story MUST be at least 3 distinct paragraphs long.
       - The total length MUST be approximately 200-300 words (or appropriate length for ${level} to allow for 3 paragraphs).
       - This is a strict requirement. Do not generate a single block of text. Use \\n\\n to separate paragraphs.
    3. DRAFTING: Create a story about "${topic}" in ${language}.
    4. AUDITING (CRITICAL): Scan the draft for grammar or vocabulary that is too complex for ${level}. Even if the style requires creativity, accessibility and level-adherence are the PRIORITY.
    5. REFINING: Rewrite any sentences that violate the ${level} constraints, even if it makes the style less "pure".
    6. PEDAGOGICAL METADATA:
       - Create a "shortDescription" in ${outputLanguage} that summarizes the story in 1 sentence to prime the learner.
       - Identify one key "grammarPoint" used in the story (e.g., "Use of Past Simple") and explain it simply in ${outputLanguage}.
       ${enableQuiz ? `- Create quiz explanations in ${outputLanguage}.` : ""}
    ${enableFlashCards ? `7. HIGHLIGHTING: Select ${vocabCount} words at or above ${level} difficulty. Use {word|translation} format in the content.` : "7. HIGHLIGHTING: Do NOT highlight any words. Provide plain text only."}
    
    CONSTRAINTS FOR ${level}:
    ${strictLevelConstraints}
    
    ${enableFlashCards ? `VOCABULARY METADATA RULES:
    - For every highlighted {word|translation}, you MUST categorize its CEFR difficulty in the "vocabularyMetadata" object.
    - Example: "vocabularyMetadata": { "exploration": { "level": "B2", "reason": "Academic abstract noun" } }` : ""}
    
    FORMAT:
    - Return JSON matching the schema.
    - Content must be in ${language}.
    - englishTranslation must be in ${outputLanguage}.
    - shortDescription must be in ${outputLanguage}.
    - grammarPoint must be in ${outputLanguage}.
    ${enableQuiz ? `- quiz questions must be in ${language}, but explanations must be in ${outputLanguage}.` : ""}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: styleConfig.temperature,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Generation failed");
    
    const parsed = JSON.parse(text.trim());
    
    // Fill defaults if disabled to match StoryResponse type
    if (!enableQuiz) parsed.quiz = [];
    if (!enableFlashCards) parsed.vocabularyMetadata = {};
    
    return parsed as StoryResponse;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Could not generate story. Please try again.");
  }
};
