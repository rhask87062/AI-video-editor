# Active Context: AI Video Editor

**Date:** 2024-07-27

## 1. Current Focus

*   Project Initialization: Setting up the foundational structure, defining initial scope, and choosing the core platform (Desktop App via Electron).
*   Memory Bank Creation: Drafting the initial core Memory Bank documents (`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`).

## 2. Recent Changes/Decisions

*   Decided on a Desktop Application using Electron to better facilitate local AI model integration and performance.
*   Outlined initial target features: AI video generation (text/image-to-video), basic timeline editing (stitching, trimming), audio track support.
*   Identified the need for local AI models for video, audio, and music generation, plus potential LLM integration for planning.
*   Acknowledged inspiration from professional editing software for UI/UX.
*   Identified core technology stack components (Electron, JS/TS Frontend (React), Python Backend).

## 3. Next Steps

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

*   Viability and performance of specific local AI models on target hardware (for future local LLM integration).
*   Best approach for communication between Electron Main process and Python backend if Python needs to *initiate* communication or send progress updates (currently Renderer initiates all).
*   Detailed structure for the project file format (for saving scripts, storyboard data etc.).
*   Specifics of the sandbox/canvas editor for script refinement. 