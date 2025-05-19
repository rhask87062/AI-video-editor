# Progress Tracker: AI Video Editor

## Legend

*   `[ ]` To Do
*   `[x]` Done
*   `[-]` In Progress / Blocked

## Phase 0: Project Initialization & Planning

*   `[x]` Define initial project idea and core goals.
*   `[x]` Discuss target user and primary pain points.
*   `[x]` Explore potential platforms (Web vs. Desktop).
*   `[x]` Decide on Desktop platform (Electron).
*   `[x]` Outline high-level feature wishlist (AI Gen, Editing, Audio).
*   `[x]` Identify potential tech stack components (Electron, React/Vue, Python).
*   `[x]` Create initial Memory Bank files:
    *   `[x]` `projectbrief.md`
    *   `[x]` `productContext.md`
    *   `[x]` `systemPatterns.md`
    *   `[x]` `techContext.md`
    *   `[x]` `activeContext.md`
    *   `[x]` `progress.md`
*   `[ ]` Review and refine initial Memory Bank documents.
*   `[x]` Initialize Git repository.
*   `[x]` Decide on specific Frontend Framework (React).

## Phase 1: Foundational Setup & Core UI

*   `[x]` Set up basic Electron project structure (`package.json`, `main.js`, `index.html`, install Electron).
*   `[x]` Implement basic window management (in `main.js`).
*   `[x]` Set up React framework within Electron (using Vite).
*   `[x]` Design and implement core UI layout (Placeholder structure in `App.jsx` and `App.css`).
*   `[x]` Set up communication bridge (IPC) between Frontend and Electron Main Process (using preload script, basic test implemented).
*   `[x]` Set up placeholder Python backend communication (FastAPI server created, Electron main process can call it via IPC, basic test in UI).

## Phase 2: Video Editing Basics

*   `[ ]` Implement project file handling (New, Open, Save).
*   `[ ]` Implement media import functionality (adding existing video/audio files).
*   `[ ]` Implement basic timeline display.
*   `[ ]` Implement clip placement on timeline.
*   `[ ]` Implement basic video playback/preview.
*   `[ ]` Implement clip trimming on timeline.
*   `[ ]` Implement adding basic audio tracks.

## Phase 3: AI Generation Integration (v1 - Video)

*   `[ ]` Research and select initial local Text-to-Video model (e.g., Stable Video Diffusion).
*   `[ ]` Set up Python environment for the chosen model.
*   `[ ]` Implement backend logic to run the video generation model based on text prompts.
*   `[ ]` Implement UI controls for text prompt input and generation triggering.
*   `[ ]` Integrate generation results into the media bin/timeline.
*   `[ ]` Implement mechanism for re-generating clips.

## Phase 3B: LLM Integration - Scripting (Iterative)

*   `[x]` Initial Anthropic (Claude) API call setup for script generation.
*   `[x]` System message implemented for initial script generation (Markdown output).
*   `[x]` Basic Markdown rendering in UI for generated scripts.
*   `[x]` Basic API Key management UI (Anthropic key input, save, load via electron-store).
*   `[x]` API Key validation on save (for Anthropic).
*   `[ ]` **Google Gemini Integration (Python backend, API Key UI & validation, IPC).**
*   `[ ]` **OpenAI Integration (Python backend, API Key UI & validation, IPC).**
*   `[x]` **Model Selection UI in Scripting View** (Dropdown to choose Anthropic/Gemini/OpenAI models).
*   `[ ]` Refine error handling and user feedback for all LLM calls.
*   `[ ]` **Design and Implement Scripting View - Phase 1 (Claude-like prominent prompt, no editor, skip/upload options).**
*   `[-]` **Develop Scripting View - Phase 2 (Milkdown editor with bottom prompt area - current Milkdown experiment).**
    *   `[-]` Layout: Milkdown editor fills majority of screen, prompt area minimal at bottom.
    *   `[ ]` UI: Implement slide-out chat panel from left.
    *   `[ ]` UI: Implement chat panel toggle button.
    *   `[ ]` Implement undo/redo functionality (likely via `@milkdown/plugin-history`).
    *   `[ ]` Implement a visible toolbar for common Markdown formatting operations.
    *   `[ ]` Implement user-configurable max height for the prompt input area (auto-grows to this max, then scrolls; input line fixed at bottom, previous lines scroll up).
    *   `[ ]` Define AI interaction model (chat-first response then optional edits vs. direct edits; consider user toggle. AI needs read/write access to editor content).
    *   `[ ]` UI/UX: Implement prompt submission logic: Enter for newline, Ctrl+Enter (or Cmd+Enter) to send.
    *   `[ ]` UI: Add a visible 'Send' button for the prompt input area.
    *   
    *   **On Hold Features (Milkdown Experiment - Prompt Input Area):**
        *   `[-]` Prompt Input Height: User-configurable draggable resizer for `lockedPromptHeight`. (Issues with reliable drag interaction and visual cues led to simplification).
        *   `[-]` Prompt Input Height: Current simplified auto-expand (unlocked state) does not consistently reach the intended 50% of available vertical screen space even with sufficient content. (Root cause likely CSS parent constraints or JS calculation nuance; console logs requested for further diagnosis).
        *   `[-]` Prompt Input Lock Icon: Visual state of the lock icon (open/closed padlock) needs to be definitively corrected to match user expectation of representing the *current* state of the stretch feature (i.e., show Unlocked icon when auto-stretching, Lock icon when height is fixed).

*   `[ ]` **Future - AI Script Revision Enhancements (Milkdown Experiment):**
    *   `[ ]` Implement "highlight to revise": Allow user to select specific text in Milkdown editor. AI receives only selected text (or selected text + limited surrounding context) for revision, and only the selection is replaced. This is to optimize token usage and API costs for large scripts compared to sending/receiving the full script for every revision.
    *   `[ ]` Investigate methods for the AI to output structured changes (e.g., diffs, specific commands) for more precise application of revisions, as an alternative to full text replacement.

*   `[ ]` (Future) Implement canvas-style script editor with AI-assisted inline editing (requires new system message for editing tasks).
*   `[ ]` (Future) Allow user to customize system messages or select personas.
*   `[x]` **Tech Debt/Optimization:** Anthropic API key validation in `App.jsx` and `python_server/main.py` is slow. Investigate using a faster/lighter API call for validation. (Marking as [x] since we identified it, though fix is pending)
*   `[-]` UI: Implement rich text editor (e.g., Milkdown experiment) for script editing.
*   `[ ]` AI: Explore AI co-writing features (suggestions, summarization, plot points).

## Phase 4: Further Enhancements (Future)

*   `[ ]` AI Image-to-Video Generation.
*   `[ ]` AI Audio Generation (Speech/SFX).
*   `[ ]` AI Music Generation.
*   `[ ]` Advanced AI Controls (Camera, Style).
*   `[ ]` Video Transitions & Effects.
*   `[ ]` Title Generation.
*   `[ ]` Advanced Audio Mixing.
*   `[ ]` LLM Integration (Scripting/Storyboarding).
*   `[ ]` User Authentication (if cloud features added).
*   `[-]` Implement Development Tooltips mechanism (Basic component created, integrated with one element).
*   `[ ]` UI Polish: Revisit Concept View sidebar collapse/expand animations (slide-over effect).

## Pre-Release Checklist (Future)

*   `[ ]` CRITICAL: Remove all Development Tooltip rendering code.

## Known Issues / Blockers

*   *(None currently)* 

## UI: Implement the actual image generation modal/panel for Concept View Assets.

## UI: Implement the actual image generation modal/panel for Moodboard.

### Scripting View

-   [x] Backend: Basic script generation endpoint (`/generate-script`).
-   [x] Backend: Support for Anthropic Claude 3.5 Sonnet and Haiku models.
-   [x] Backend: Support for Google Gemini 2.5 Pro (Preview) and Flash (Preview) models.
-   [x] UI: Textarea for script prompt input.
-   [x] UI: Button to trigger script generation.
-   [x] UI: Display area for the generated script (currently using ReactMarkdown).
-   [x] UI: Model selection dropdown for script generation.
-   [ ] **Tech Debt/Optimization:** Anthropic API key validation in `App.jsx` and `python_server/main.py` is slow. Investigate using a faster/lighter API call for validation.
-   [ ] UI: Implement rich text editor (e.g., Quill as per `tech_stack_and_frameworks.md`) for script editing.
-   [ ] AI: Explore AI co-writing features (suggestions, summarization, plot points). 