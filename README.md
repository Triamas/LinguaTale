# LinguaTale - AI Language Story Generator

LinguaTale is an intelligent language learning application that uses Google's Gemini models to generate short stories tailored to your exact proficiency level. It supports all 24 official EU languages and strictly adheres to CEFR standards (A1 to C2), making it the perfect tool for reading practice.

## Features

*   **24 Supported Languages**: Practice reading in Bulgarian, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian, Irish, Italian, Latvian, Lithuanian, Maltese, Polish, Portuguese, Romanian, Slovak, Slovenian, Spanish, and Swedish.
*   **Precise Level Control**: Choose from detailed CEFR levels including specific sub-levels (e.g., A1.1, A1.2, A1.3) to ensure the content matches your grammar and vocabulary knowledge exactly.
*   **Interactive Vocabulary**: Click on highlighted words within the story to see instant translations in your interface language.
*   **Comprehension Quizzes**: Every story segment includes a 3-question quiz generated in the target language to test your understanding.
*   **Multi-Chapter Stories**: The app remembers context, allowing you to generate subsequent chapters and continue the narrative.
*   **Customizable Content**: Select from various story styles (Thriller, Sci-Fi, Funny, etc.) and define your own topics or use suggested ones.
*   **Localized Interface**: The application UI is available in English, Finnish, and Vietnamese.
*   **Dynamic Theming**: The application interface adapts its color scheme based on the selected target language's flag colors.

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

1.  **Select Target Language**: Choose the language you want to learn.
2.  **Set Proficiency Level**: specific your CEFR level (e.g., A2.1).
3.  **Choose Style & Topic**: Select a genre (e.g., Mystery) and type a description or click a suggested topic tag.
4.  **Generate**: Click "New Story".
5.  **Read & Interact**: Click colored words for translations. Toggle the full English translation if you get stuck.
6.  **Quiz**: Answer the questions at the bottom to verify your understanding.
7.  **Continue**: Click "Next Page" to generate the next chapter of the story.

## Technologies Used

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 2.5/3.0 via `@google/genai` SDK
*   **Icons**: Lucide React
