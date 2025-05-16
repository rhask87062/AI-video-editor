# Product Context: AI Video Editor

## 1. Problem Space

Creating videos using current AI generation tools often involves a fragmented workflow:
1.  Generate individual video clips using one or more AI tools/websites/apps.
2.  Download these clips.
3.  Import clips into a separate, traditional video editing software.
4.  Stitch clips together, trim, add audio, effects, etc.
5.  If a clip needs regeneration, the user must go back to the generation tool and repeat the process.

This context switching is inefficient and hinders creative flow.

## 2. Proposed Solution

An integrated desktop application that combines AI video generation capabilities with standard video editing features.

## 3. Key Features & User Experience Goals

*   **Seamless Generation & Editing:** Users should be able to prompt for video clips directly within the application and immediately see them on a timeline or in a media bin, ready for editing.
*   **Iterative Refinement:** Easy re-generation of specific clips directly from the editing interface if the initial result isn't satisfactory.
*   **Familiar Editing UI:** Provide a user interface that feels familiar to users of existing video editors (e.g., timeline-based, media bins, preview window), focusing on cleanliness and usability.
*   **Local Control:** Empower users by enabling the use of locally run AI models, offering more control and potentially lower costs compared to purely cloud-based services.
*   **Comprehensive Tooling (Long-term):** Evolve towards a powerful editor including features like transitions, effects, titles, audio mixing, and advanced AI controls (camera movement, style consistency), alongside AI audio/music generation and potentially script/storyboard assistance.

### 3.1 Scripting View - Two-Phase Approach

*   **Phase 1 (New Script Workflow):** 
    *   Initial state will be a prominent, central prompt input field (similar to Claude's initial console).
    *   No editor is visible at this stage.
    *   User is presented with options: "Skip to text editor" button (left), plain text "or", and "Upload Script" button (right).
    *   This phase is for generating a new script from a detailed prompt.
*   **Phase 2 (Script Editing & Revision Workflow):**
    *   This phase is entered after a script is generated, skipped to, or uploaded.
    *   Features a primary Markdown editor (e.g., Milkdown) taking up the majority of the screen.
    *   A smaller, persistent prompt input area at the bottom for AI-assisted edits, revisions, or additions to the existing script. The prompt input area should auto-grow from a minimal height but have a user-configurable 'max height'. If content exceeds this max height, the area should scroll internally. The input cursor/line should remain fixed at the bottom of the prompt area, with previous lines scrolling upwards. Prompt submission will be via `Ctrl+Enter` or a dedicated 'Send' button; `Enter` alone will create a newline.
    *   This phase will include a visible toolbar for common formatting operations (bold, italic, lists, headings, etc.) to support users unfamiliar with Markdown.
    *   Implement robust undo/redo functionality.
    *   Implement a slide-out chat panel from the left (approx 1/3 screen width, above prompt bar) for AI responses and dialogue.
    *   Chat panel toggled by a button on the left edge (mid-height).

### 3.2 AI Interaction Design Principles (Scripting View & Beyond)
*   Explore AI interaction models:
    *   Chat-first response then optional edits.
    *   Direct edits by AI.
    *   User toggle for AI interaction mode (chat vs. edit).
*   Default behavior for script revisions: AI responds in a chat-like interface first, then (optionally or upon confirmation) makes edits to the document. AI needs read/write access to editor content.
*   Prompt submission behavior: User prompts via bottom input. `Enter` key creates a newline. `Ctrl+Enter` (or `Cmd+Enter`) submits the prompt. A visible 'Send' button also submits the prompt.

## 4. Why Now?

The increasing quality and availability of open-source AI models for video and audio generation make integrating these capabilities directly into an editing workflow more feasible and desirable. 