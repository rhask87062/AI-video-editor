# Environment Configuration & Secrets Management

This document outlines how to configure environment variables and manage secrets for development and different deployment environments (though this project is initially local-only).

## Development Environment

### External LLM API Keys

For connecting to external LLM services, API keys are required. These keys should NEVER be committed to the Git repository.

**1. Anthropic API Key (Claude Models)**

*   **Environment Variable Name:** `ANTHROPIC_API_KEY`
*   **How to Set (Local Development):**
    *   **Windows (PowerShell - for the current session):**
        ```powershell
        $env:ANTHROPIC_API_KEY="your_actual_api_key_here"
        ```
    *   **Windows (System-wide - GUI):** Search for "environment variables", edit system environment variables, and add `ANTHROPIC_API_KEY` with your key as its value (for your user or system).
    *   **Linux/macOS (bash/zsh - for the current session):**
        ```bash
        export ANTHROPIC_API_KEY="your_actual_api_key_here"
        ```
    *   **Linux/macOS (Persistent):** Add the `export` command to your shell's startup file (e.g., `~/.bashrc`, `~/.zshrc`, `~/.profile`) and then source it or open a new terminal.
*   **Usage:** The Python backend (`python_server/main.py`) will attempt to read this environment variable to authenticate with the Anthropic API.

**2. Google Gemini API Key (Future)**

*   **Environment Variable Name:** `GOOGLE_API_KEY` (or `GEMINI_API_KEY` - TBD)
*   **How to Set:** Similar to Anthropic.

**3. OpenAI API Key (Future)**

*   **Environment Variable Name:** `OPENAI_API_KEY`
*   **How to Set:** Similar to Anthropic.

### `.gitignore` Reminder

Ensure that any local configuration files that *might* inadvertently contain secrets (e.g., `.env` files if you choose to use them for loading env vars, though direct env var setting is preferred for now) are listed in your project's `.gitignore` file.

This project currently reads API keys directly from environment variables set in the system or terminal session where the Python server is run. 