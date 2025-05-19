# Active Context: AI Video Editor

**Date:** 2024-07-28

## 1. Current Focus

*   **Milkdown Experiment (`milkdown-experiment/` directory):** Refining AI interaction within a Milkdown-based script editor.
    *   Current Sub-focus: Defining how AI responses are delivered (chat, direct editor modification, or both).
    *   **On Hold (Milkdown Experiment - Prompt Input UI):**
        *   User-configurable draggable resizer for prompt input height.
        *   Consistent 50% vertical screen space expansion for unlocked prompt input.
        *   Correct visual state for the lock/unlock icon for prompt input height.

## 2. Recent Changes/Decisions

*   **Milkdown Experiment:**
    *   Implemented basic Anthropic Claude API calls within the experiment.
    *   Added UI for API key input (using localStorage for persistence in experiment).
    *   Implemented UI for selecting LLM models (Claude, Gemini placeholders).
    *   Implemented editable system prompts for "Chat" and "Revise" actions, stored in localStorage.
    *   Simplified prompt input height to auto-expand (10%-50% window height) with a lock toggle, removing draggable resizer due to interaction issues.
    *   Decision: For "Revise" actions, AI will provide suggestions/text in the chat panel. Direct modification of Milkdown editor by AI is a future consideration.

*   Decided on a Desktop Application using Electron to better facilitate local AI model integration and performance.
*   Outlined initial target features: AI video generation (text/image-to-video), basic timeline editing (stitching, trimming), audio track support.
*   Identified the need for local AI models for video, audio, and music generation, plus potential LLM integration for planning.
*   Acknowledged inspiration from professional editing software for UI/UX.
*   Identified core technology stack components (Electron, JS/TS Frontend (React), Python Backend).

## 3. Next Steps

*   **Milkdown Experiment:**
    *   Refine `editSystemPromptText` to guide AI to provide copyable Markdown in chat for script revisions.
    *   Thoroughly test current AI chat response flow with new system prompt.
    *   Begin planning for how AI could provide more structured data for potential future direct editor integration (e.g., diffs, commands).

*   Review and refine the initial Memory Bank documents.
*   Set up the basic Electron project structure.
*   Set up React within the Electron project.
*   Basic script generation with Anthropic Claude (via external API) is now functional in the Scripting View, including Markdown rendering.
*   API Key input and storage (via UI Settings for Anthropic) is functional.

**Immediate Next Steps for LLM Integration (Scripting View):**
*   **Google Gemini Integration:**
    *   Implement Python backend logic to call Google Gemini API (e.g., Gemini 1.5 Pro, Gemini 1.5 Flash).
    *   Add UI in API Key Settings for Google API Key.
    *   Update `main.js` and `preload.js` for Gemini key validation and API calls.
*   **Model Selection UI:**
    *   Add a dropdown/selector in the Scripting View to allow the user to choose which LLM (and specific model variant like Claude 3.5 Sonnet, Gemini 1.5 Pro, etc.) to use for script generation.
    *   The `handleGenerateScript` function in `App.jsx` will need to pass the selected model identifier.
*   **Refine Error Handling & User Feedback** for LLM calls across different models.
*   **UI for Scripting View:** Flesh out the initial prompt area and script display beyond basic placeholders.

## 4. Open Questions/Considerations

*   **Milkdown Experiment:** Best strategy for AI to output changes for easy application by user (e.g., specific Markdown formatting in chat, copy buttons).
*   How to eventually integrate the `milkdown-experiment` back into the main `AI-video-editor` application and its Electron IPC for API keys.
*   **Future AI Revision System (Milkdown Experiment):** Plan for a more token-efficient revision system where users can highlight text for specific AI edits, rather than always sending/receiving the full script. This is to manage potential API costs with large documents. The current full-script replacement for revisions is a temporary measure for simplicity.

*   Viability and performance of specific local AI models on target hardware (for future local LLM integration).
*   Best approach for communication between Electron Main process and Python backend if Python needs to *initiate* communication or send progress updates (currently Renderer initiates all).
*   Detailed structure for the project file format (for saving scripts, storyboard data etc.).
https://github.com/marktext/marktext*   Specifics of the sandbox/canvas editor for script refinement.
*   **Chat History Management for Scripting View:** Explored the idea of adding a "New Chat/Clear History" button in the Scripting View's chat panel. This would clear the visible context for the AI and trigger a background summarization of the cleared chat, focusing on writing-specific details (themes, plot points, character notes, style choices). The goal is to create a lighter-weight, persistent "project memory" for the AI, improving long-term context without overwhelming the immediate prompt, similar to Cursor's memory system but tailored for creative writing. (Further planning/clarification needed on UI specifics, summarization technique, and integration with overall project memory.) 