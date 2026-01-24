# LinguaTale - AI Language Story Generator

LinguaTale is an intelligent language learning application that uses Google's latest Gemini models to generate short stories tailored to your exact proficiency level. It supports **28 languages** and strictly adheres to CEFR standards (A1 to C2), making it the perfect tool for reading practice at any stage of learning.

## Features

*   **28 Supported Languages**: Practice reading in European languages (Bulgarian, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian, Irish, Italian, Latvian, Lithuanian, Maltese, Polish, Portuguese, Romanian, Slovak, Slovenian, Spanish, Swedish) as well as **Chinese, Japanese, Korean, and Vietnamese**.
*   **Precise Level Control**: Choose from detailed CEFR levels including specific sub-levels (e.g., **A1.1, A1.2, A1.3** up to **C1-C2**) to ensure the content matches your grammar and vocabulary knowledge exactly.
*   **Diverse Story Styles**: Select from 15 genres including *Thriller, Sci-Fi, Bedtime Story, Dialogue/Script, News Article*, and *Business/Serious*.
*   **Interactive Vocabulary**: Click on highlighted words within the story to see instant context-aware translations. The app smartly handles punctuation, ensuring natural reading flow.
*   **Comprehension Quizzes**: Every story segment includes a 3-question quiz generated in the target language to test your understanding immediately.
*   **Story Continuation**: The app remembers context, allowing you to generate "Next Page" chapters to create a continuous narrative.
*   **Personal Library**: Save your favorite stories to the local library and resume reading them later.
*   **Multilingual Interface**: The application UI is fully localized in **English, Finnish, and Vietnamese**.
*   **Dynamic Theming**: The application interface adapts its color accents based on the selected target language.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   A Google AI Studio API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/linguatale.git
    cd linguatale
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_google_ai_studio_api_key_here
    ```
    *Note: Ensure your environment is configured to expose this key as `process.env.API_KEY` to the application.*

4.  **Run the application**
    ```bash
    npm start
    ```

## Usage

1.  **Select Target Language**: Choose the language you want to learn (e.g., Spanish, Japanese).
2.  **Set Proficiency Level**: Specify your CEFR level (e.g., A2.1).
3.  **Choose Style & Topic**: Select a genre (e.g., Mystery) and type a description or click a suggested topic tag.
4.  **Generate**: Click "New Story".
5.  **Read & Interact**: 
    *   Click colored words for definitions.
    *   Toggle "Show Full Translation" if you need help with the whole text.
6.  **Quiz**: Answer the questions at the bottom to verify your understanding.
7.  **Continue or Save**: Click "Next Page" to keep the story going, or the Bookmark icon to save it to your library.

## Technologies Used

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 2.5/3.0 via `@google/genai` SDK
*   **Icons**: Lucide React
*   **State Management**: React Hooks & LocalStorage for persistence

## License

This project is licensed under the MIT License.
