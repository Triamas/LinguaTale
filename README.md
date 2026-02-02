
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
*   A Google Cloud Project or Google AI Studio account

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

3.  **Get a Google Gemini API Key**
    To use this application, you need an API key from Google AI Studio.
    1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    2.  Sign in with your Google account.
    3.  Click **Create API key**.
    4.  Select a project or create a new one, then copy the generated key string.

4.  **Configure Environment**
    Create a file named `.env` in the root directory of the project. Add your API key to this file:
    ```env
    API_KEY=your_actual_api_key_starts_with_AIza...
    ```
    *Note: The application code accesses the key via `process.env.API_KEY`.*

5.  **Run the application**
    ```bash
    npm start
    ```
    Open your browser to the local server address (usually `http://localhost:1234` or similar, depending on your bundler).

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
