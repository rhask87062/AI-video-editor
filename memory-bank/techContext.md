# Tech Context: AI Video Editor

## 1. Core Technologies (Anticipated)

*   **Desktop Application Framework:** Electron
*   **Frontend Language:** JavaScript / TypeScript
*   **Frontend UI Framework:** React (using Next.js structure/tooling adapted for Electron is a possibility)
*   **Backend Language (AI & Processing):** Python 3.x
*   **Python Web Framework (for local API, if used):** FastAPI or Flask (TBD)
*   **Node.js:** Runtime for Electron's Main Process.

## 2. Key Libraries/Tools (To Investigate/Consider)

*   **Video Processing (Python):** MoviePy, OpenCV, FFmpeg (potentially via Python bindings)
*   **Video Processing (JS/Web):** Libraries interacting with WebCodecs/WASM if performance bottlenecks arise or if a web component becomes necessary.
*   **UI Component Libraries (React):** Material UI, Ant Design, Chakra UI, Shadcn/ui, etc.
*   **State Management (React):** Redux Toolkit, Zustand, Jotai, Context API
*   **AI Models (Local - To Research):**
    *   Text-to-Video: Stable Video Diffusion, others?
    *   Image-to-Video: (Depends on Text-to-Video model capabilities)
    *   Audio Generation: Bark, Tortoise TTS, Riffusion?
    *   Music Generation: MusicGen, others?
    *   LLMs: Local models like Llama, Mistral (via libraries like `transformers` or `llama.cpp` bindings)
*   **Python AI Libraries:** Hugging Face `transformers`, `diffusers`, PyTorch, TensorFlow/Keras
*   **Packaging/Building (Electron):** Electron Builder, Electron Forge

## 3. Development Setup & Environment

*   **Package Managers:** `npm` or `yarn` (for Node.js/Frontend), `pip` or `conda` (for Python)
*   **Version Control:** Git (repository to be initialized)
*   **OS:** Development likely on Windows (based on user info), but Electron allows for cross-platform builds (macOS, Linux).
*   **IDE/Editor:** VS Code (assumed based on Cursor usage)

## 4. Technical Constraints & Considerations

*   **Local Hardware:** Performance will depend heavily on the user's GPU/CPU/RAM, especially for running AI models locally.
*   **Model Size & Loading:** Large AI models require significant disk space and RAM. Efficient loading and management are crucial.
*   **Installation Complexity:** Setting up Python environment with potentially complex AI dependencies (CUDA, etc.) might require clear instructions or packaging solutions.
*   **Security:** If ever connecting to external services or handling user data, standard security practices (input validation, environment variables, secure credential storage) are essential. 