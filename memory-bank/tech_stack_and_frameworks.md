# Technology Stack and Frameworks

This document outlines the key technologies, frameworks, libraries, and tools used in the AI Video Editor project, along with patterns and best practices for their use.

## Core Stack

*   **Electron:** For building the cross-platform desktop application.
*   **React:** For building the user interface.
*   **Vite:** For the frontend build tooling and development server.
*   **Node.js:** For the main process in Electron and general scripting.
*   **Python (FastAPI):** For the backend server handling AI model interactions and other server-side logic.
    *   **Uvicorn:** ASGI server for FastAPI.
*   **`electron-store`:** For persisting user settings like API keys locally.

## AI/ML Model Integration

*   **Anthropic API:** Used for Large Language Model (LLM) tasks, currently for script generation.
    *   Models: Claude 3.5 Sonnet, Claude 3 Haiku.
*   **Google Gemini API (via `google-generativeai` SDK):** Used for LLM tasks, available for script generation.
    *   Models: Gemini 2.5 Pro (Preview), Gemini 2.5 Flash (Preview).
*   **IPC (Inter-Process Communication):** Electron's IPC is used heavily for communication between the renderer process (React UI) and the main process (Node.js), which then communicates with the Python backend.

## UI Components & Libraries

*   **ReactMarkdown with `remark-gfm`:** Used for rendering generated scripts (which are in Markdown format) in the UI.
*   **Quill Rich Text Editor (Candidate):**
    *   **Reference:** [https://github.com/slab/quill](https://github.com/slab/quill)
    *   **Use Case:** Suggested as a powerful and easily integratable WYSIWYG editor for the scriptwriting interface in the React application. It supports rich text features that would be beneficial for script editing beyond plain Markdown.
    *   **Consideration:** To be evaluated and potentially integrated to replace or enhance the current script display/editing mechanism.
*   **Milkdown:** Chosen for the script editing experiment.
    *   Plugin-driven WYSIWYG Markdown editor framework based on Prosemirror and Remark.
    *   MIT Licensed.
    *   Requires `@milkdown/core`, `@milkdown/react`, `@milkdown/preset-commonmark` (or GFM), and a theme (e.g., `@milkdown/theme-nord`).
    *   `@milkdown/plugin-history` will be used for undo/redo functionality.
*   Quill: Initially considered, but Milkdown selected for better direct Markdown focus.

## Styling

*   **CSS:** Custom CSS is used for styling the application, as seen in `App.css` and inline styles.

## Version Control

*   **Git & GitHub:** For source code management and collaboration.

## Key Libraries & Utilities (Frontend - `package.json`)

*   `react`
*   `react-dom`
*   `react-markdown`
*   `remark-gfm`
*   _Review `package.json` for a complete list._

## Key Libraries & Utilities (Backend - Python `requirements.txt` or `pip freeze`)

*   `fastapi`
*   `uvicorn`
*   `anthropic`
*   `google-generativeai`
*   `python-dotenv` (for managing environment variables if used directly by Python)
*   _Review Python environment for a complete list._

## Development Workflow & Patterns

*   **Environment Variables / `electron-store` for API Keys:** API keys are primarily managed via `electron-store` after user input, though the Python server can also fall back to environment variables (`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`).
*   **Modular UI Views:** The application is structured into different views (Editor, Concept, Scripting) managed by React state.
*   **IPC for Backend Communication:** All interactions with the Python backend and sensitive operations (like saving API keys) are routed through Electron's main process via IPC calls defined in `main.js` and exposed via `preload.js`.

## Future Considerations / Areas for Expansion

*   Video processing libraries (e.g., FFmpeg.js, or server-side Python libraries)
*   Audio processing libraries
*   Image generation model integration (Stable Diffusion, DALL-E, etc.)
*   More sophisticated state management for React (e.g., Zustand, Redux Toolkit)
*   Dedicated UI component library (e.g., Material UI, Ant Design, Shadcn/ui)

*(This document should be updated as new technologies are adopted or decisions are made.)* 