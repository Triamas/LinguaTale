
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
        - POSITIVE: Top 100 nouns only. Present Simple 'be' and 'have'. Short sentences.
        - FORBIDDEN: NO 'but', NO 'because', NO Past tenses, NO Future tenses, NO adjectives (except colors/size), NO dependent clauses.
      `;
    case "A1.2":
      return `
        - POSITIVE: Basic Present Simple. Connectors: 'and', 'or'.
        - FORBIDDEN: NO Past Continuous, NO Perfect tenses, NO 'if' clauses, NO 'when' clauses.
      `;
    case "A1.3":
      return `
        - POSITIVE: Past Simple (Regular verbs), Present Continuous. Connector: 'because'.
        - FORBIDDEN: NO Passive voice, NO Conditional moods, NO Irregular past forms unless very common (went, saw).
      `;
    case "A2.1":
      return `
        - POSITIVE: Future 'will', basic Comparatives (better, bigger).
        - FORBIDDEN: NO Present Perfect, NO Modal verbs like 'should' or 'must'.
      `;
    case "A2.2":
      return `
        - POSITIVE: Present Perfect, Modal verbs (can, must), First Conditional.
        - FORBIDDEN: NO Past Perfect, NO Third Conditional, NO Passive Voice.
      `;
    case "B1.1":
      return `
        - POSITIVE: Simple Passive Voice, Second Conditional.
        - FORBIDDEN: NO Future Perfect, NO Subjunctive Mood, NO Inversion.
      `;
    case "B1.2":
      return `
        - POSITIVE: Past Perfect, Reported Speech, Connector: 'although'.
        - FORBIDDEN: NO Mixed Conditionals, NO complex Gerund vs Infinitive nuances.
      `;
    case "B2.1":
      return `
        - POSITIVE: Future Continuous, Mixed Conditionals.
        - FORBIDDEN: NO Archaic vocabulary, NO overly formal academic structures.
      `;
    default:
      return "Ensure natural use of the language appropriate for the selected CEFR level.";
  }
};

/**
 * Helper to sanitise JSON response from the model, stripping Markdown fences if present.
 */
const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

export const generateStory = async (
  language: Language,
  level: CEFRLevel,
  topic: string,
  style: StoryStyle,
  outputLanguage: AppLanguage,
  enableQuiz: boolean,
  enableFlashCards: boolean,
  previousContext?: string,
  contentToRewrite?: string
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

  // -------------------------------------------------------------------------
  // STEP 1: GENERATION PHASE
  // -------------------------------------------------------------------------

  // Determine the task prompt
  const taskInstructions = contentToRewrite 
    ? `TASK: REWRITE the provided story content to be EXACTLY level ${level}.
       - Maintain the original plot, characters, and meaning.
       - Adjust vocabulary and grammar to match ${level}.
       - ORIGINAL CONTENT: "${contentToRewrite}"`
    : `TASK: Generate a ${language} story about "${topic}".
       ${previousContext ? `CONTEXT: This is a continuation of the previous part: "${previousContext}"` : ""}
       DRAFTING: Write a coherent narrative in ${language}.`;

  // Define System Instruction: This sets the "Persona" and strict boundaries.
  const systemInstruction = `
    You are a Senior Language Education Specialist and CEFR Level Auditor.
    Your mission is to generate stories that STRICTLY adhere to specific CEFR proficiency levels.
    
    CRITICAL RULES:
    1. NEVER use grammar or vocabulary above the target level.
    2. If a creative choice requires complex language, you MUST simplify the idea instead of using the complex language.
    3. The "Forbidden" constraints for the level are absolute.

    TARGET LEVEL: ${level}
    
    LEVEL CONSTRAINTS:
    ${strictLevelConstraints}
  `;

  // Define Prompt: The specific creative task.
  const prompt = `
    ${taskInstructions}

    CONFIGURATION:
    ${styleConfig.instructions}

    REQUIREMENTS:
    1. LENGTH: 200-300 words. 3 distinct paragraphs. Use \\n\\n separators.
    2. METADATA: 
       - shortDescription in ${outputLanguage}
       - grammarPoint in ${outputLanguage}
       ${enableQuiz ? `- quiz explanations in ${outputLanguage}` : ""}
    ${enableFlashCards ? `3. HIGHLIGHTING: Select ${vocabCount} words in {word|translation} format.` : "3. HIGHLIGHTING: None."}

    ${enableFlashCards ? `VOCABULARY METADATA:
    - Map every highlighted word to its CEFR level in 'vocabularyMetadata'.` : ""}
    
    OUTPUT FORMAT: JSON matching the schema.
  `;

  let parsedResponse: StoryResponse;

  try {
    // Phase 1: Create
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: styleConfig.temperature,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Generation failed: No response text");
    
    const cleanedText = cleanJsonResponse(text);
    parsedResponse = JSON.parse(cleanedText) as StoryResponse;

  } catch (error) {
    console.error("API Error (Generation Phase):", error);
    throw new Error("Could not generate story. Please try again.");
  }

  // -------------------------------------------------------------------------
  // STEP 2: VALIDATION & FIXING PHASE
  // -------------------------------------------------------------------------
  
  try {
    const validationSystemInstruction = `
      You are a Strict Linguistic Editor and Proofreader for ${language}.
      Your job is to take the provided JSON story object and rigorous check it for mistakes.
      
      VALIDATION RULES:
      1. GRAMMAR: Fix any grammatical errors in the 'content' field.
      2. NATURALNESS: Ensure phrases sound natural to a native speaker, not like robotic translation.
      3. LEVEL COMPLIANCE: Ensure strict adherence to CEFR Level ${level}. If a phrase is too complex (e.g., using B2 grammar in an A1 story), simplify it immediately.
      4. INTEGRITY: 
         - Ensure 'englishTranslation' accurately reflects the corrected content.
         - Ensure 'quiz' questions and answers are still valid based on the content.
         - ${enableFlashCards ? "PRESERVE all {word|translation} tags exactly as they are unless the word itself is grammatically wrong." : "Do not add highlighting tags."}
      
      OUTPUT: Return the CLEANED and CORRECTED JSON object matching the exact same schema.
    `;

    const validationPrompt = `
      Here is the drafted story object:
      ${JSON.stringify(parsedResponse)}

      Please review, edit, and fix any mistakes. Return the final polished JSON.
    `;

    const validationResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Flash is fast enough for editing
      contents: validationPrompt,
      config: {
        systemInstruction: validationSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for precise editing
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const validatedText = validationResponse.text;
    if (validatedText) {
      const cleanedValidatedText = cleanJsonResponse(validatedText);
      parsedResponse = JSON.parse(cleanedValidatedText) as StoryResponse;
    }

  } catch (validationError) {
    // If validation fails, log it but return the original generated story rather than failing completely.
    console.error("API Error (Validation Phase):", validationError);
    // We proceed with the unvalidated story as a fallback
  }

  // Final cleanup of optional fields
  if (!enableQuiz) parsedResponse.quiz = [];
  if (!enableFlashCards) parsedResponse.vocabularyMetadata = {};
  
  return parsedResponse;
};
