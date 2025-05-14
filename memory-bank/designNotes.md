# Design Notes & UI Intentions

This file stores temporary design notes, intentions, and reminders specific to individual UI elements or components during active development. These notes can be used to inform the implementation of development-only tooltips.

## Concept View - Collapsible Sidebars (Assets & Moodboard)

*   **Current State (as of 2024-07-27/28):**
    *   Sidebars (`assets-column`, `moodboard-column`) collapse/expand using a `.collapsed` class and CSS width/opacity transitions.
    *   Expand buttons (`.expand-button`) are styled as tabs, positioned at the top edge of the main container.
    *   Collapse buttons (`.collapse-button`) are positioned within the header (`h3`) of the expanded sidebar.
*   **Intention for Visual Alignment:**
    *   The `expand-button` (tab) and the sidebar `h3` (when expanded) should appear at the same vertical `top` position and have the same visual height to make the expand/collapse transition feel seamless for that top bar element.
    *   The `collapse-button` (arrow within the `h3`) should also align with this consistent bar height and have its icon centered.
*   **Known Issue / To Refine:** Ensuring perfect pixel alignment and consistent perceived height for the tabs and headers across different states has been tricky. The `top` positioning of the expand tabs and the padding/font-size of both tabs and headers are key to this. The goal is for the user to feel like it's the *same bar element* transforming.
*   **Future Consideration (Slide-over animation):** User expressed a desire for sidebars to physically slide over the central content. This was deferred for functional progress but should be revisited for UI polish.

## Editor View - Media Bin Sections

*   **Current State (as of 2024-07-27/28):**
    *   Video, Audio, and Image sections have toggle buttons for generation panels or content display.
    *   A `.media-section-title-placeholder` div displays the title of the section below the toggle/panel.
*   **Intention for Consistency:** All sections in the media bin should have a similar structure: a toggle button for controls/content, and then a clear title for the main content area of that section.
*   **Image Assets (Editor):**
    *   Model Focus: Prioritize AI models excelling at logos, banners, icons with transparent backgrounds (PNGs).
    *   Purpose: For overlaying on video tracks.

## Timeline (Future)

*   **Track Types:** Needs Video, Audio, and Image tracks.
*   **Multiple Tracks:** Allow multiple instances of each.
*   **Operations:** Fading, opacity, layering.

## Development Tooltips

*   **Reminder:** Implement a mechanism for showing these notes as tooltips on relevant UI elements during development.
*   **Critical:** Ensure all tooltip-rendering code is REMOVED before any production build. 