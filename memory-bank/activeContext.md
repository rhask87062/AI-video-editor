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
*   Begin research into specific open-source, locally runnable AI models for video generation (e.g., Stable Video Diffusion).
*   Initialize the Git repository.

## 4. Open Questions/Considerations

*   Viability and performance of specific local AI models on target hardware.
*   Best approach for communication between Electron Main process and Python backend (local API vs. direct script execution).
*   Detailed structure for the project file format. 