from fastapi import FastAPI
from pydantic import BaseModel
import os
import anthropic

app = FastAPI()

# Pydantic model for the request body of /generate-script
class ScriptRequest(BaseModel):
    prompt: str
    model_identifier: str # e.g., 'claude-3-5-sonnet-20240620' - make sure it's a valid model ID

@app.get("/")
async def read_root():
    return {"message": "Hello from Python FastAPI backend!"}

@app.get("/ping")
async def ping():
    return {"status": "ok", "message": "Python backend is alive!"}

@app.post("/generate-script")
async def generate_script_endpoint(request: ScriptRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return {"success": False, "error": "ANTHROPIC_API_KEY not found in environment variables."}

    try:
        client = anthropic.Anthropic(api_key=api_key)
        
        # For Claude 3.5 Sonnet, the model ID is often like 'claude-3-5-sonnet-20240620'
        # We'll use the model_identifier passed from the frontend
        # Ensure the frontend sends a valid model ID Anthropic expects.
        # Max tokens can be adjusted. A lower value is faster and cheaper for testing.
        response = client.messages.create(
            model=request.model_identifier, 
            max_tokens=1024, # Adjust as needed
            messages=[
                {
                    "role": "user",
                    "content": request.prompt
                }
            ]
        )
        
        # Assuming the response structure gives text directly in content blocks
        # This might need adjustment based on actual Claude API response structure
        script_text = ""
        if response.content and isinstance(response.content, list):
            for block in response.content:
                if hasattr(block, 'text'):
                    script_text += block.text
        
        if not script_text:
            # Handle cases where content might be empty or in unexpected format
            # For now, log the full response if script_text is empty for debugging
            print("Warning: No text content extracted from LLM response. Full response:", response)
            return {"success": True, "data": {"script": "[No text content found in response]"}}

        return {"success": True, "data": {"script": script_text}}

    except anthropic.APIConnectionError as e:
        print(f"Anthropic API Connection Error: {e}")
        return {"success": False, "error": "Failed to connect to Anthropic API."}
    except anthropic.RateLimitError as e:
        print(f"Anthropic Rate Limit Error: {e}")
        return {"success": False, "error": "Anthropic API rate limit exceeded."}
    except anthropic.AuthenticationError as e:
        print(f"Anthropic Authentication Error: {e}")
        return {"success": False, "error": "Anthropic API authentication failed. Check your API key."}
    except anthropic.APIStatusError as e:
        print(f"Anthropic API Status Error status_code={e.status_code} response={e.response}")
        return {"success": False, "error": f"Anthropic API error: {e.status_code}"}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"success": False, "error": "An unexpected error occurred while generating the script."}

# To run this (from your project's root directory, in a separate terminal):
# 1. Ensure you have fastapi and uvicorn installed: 
#    pip install fastapi "uvicorn[standard]" anthropic
# 2. Set ANTHROPIC_API_KEY environment variable: 
#    (Windows PowerShell) $env:ANTHROPIC_API_KEY="your_actual_api_key_here"
#    (bash/zsh) export ANTHROPIC_API_KEY="your_actual_api_key_here"
# 3. Navigate to the python_server directory: 
#    cd python_server
# 4. Run the server: 
#    uvicorn main:app --reload --port 8000 