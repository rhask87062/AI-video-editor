from fastapi import FastAPI
from pydantic import BaseModel
import os
import anthropic
from typing import Optional
import json # For parsing error response

app = FastAPI()

# Pydantic model for the request body of /generate-script
class ScriptRequest(BaseModel):
    prompt: str
    model_identifier: str # e.g., 'claude-3-5-sonnet-20240620' - make sure it's a valid model ID
    api_key: Optional[str] = None

class ApiKeyValidateRequest(BaseModel):
    api_key: str

SYSTEM_MESSAGE_SCRIPTING = """You are an expert scriptwriter and creative assistant. 
Your primary task is to help the user generate and develop scripts for various types of video or audio content. 
When a user provides a prompt or an idea, your goal is to transform it into a well-structured script. 
Please use standard script formatting: clearly indicate SCENE HEADINGS (e.g., INT. COFFEE SHOP - DAY), 
character names in uppercase before their dialogue, action descriptions, and parentheticals for tone or brief actions where appropriate. 
If the user's request is a simple idea, try to flesh it out into at least one complete scene or a structured outline with multiple scene ideas. 
Be creative and helpful."""

@app.get("/")
async def read_root():
    return {"message": "Hello from Python FastAPI backend!"}

@app.get("/ping")
async def ping():
    return {"status": "ok", "message": "Python backend is alive!"}

@app.post("/validate-anthropic-key")
async def validate_anthropic_key(request: ApiKeyValidateRequest):
    if not request.api_key:
        return {"success": False, "error": "No API key provided for validation."}
    try:
        client = anthropic.Anthropic(api_key=request.api_key)
        # A light-weight call to check authentication, e.g., try to list models or a simple ping if available.
        # For Anthropic, often just initializing the client with a bad key might not error until a real call.
        # Let's try a very small message request as a validation method.
        client.messages.create(
            model="claude-3-haiku-20240307", # Use a known, cheap/fast model for validation
            max_tokens=1,
            messages=[{"role": "user", "content": "ping"}]
        )
        return {"success": True, "message": "Anthropic API Key is valid and has sufficient credits."}
    except anthropic.AuthenticationError:
        return {"success": False, "error": "Invalid Anthropic API Key (AuthenticationError)."}
    except anthropic.APIConnectionError:
        return {"success": False, "error": "Could not connect to Anthropic API to validate key."}
    except anthropic.APIStatusError as e:
        print(f"Anthropic API Status Error during validation: status_code={e.status_code} response={e.response}")
        error_message = f"Anthropic API error: {e.status_code}."
        try:
            # Try to get more specific error message from Anthropic's response
            if e.response and hasattr(e.response, 'text'):
                error_detail = json.loads(e.response.text)
                if error_detail.get('error') and error_detail['error'].get('message'):
                    error_message = error_detail['error']['message']
        except Exception:
            pass # Stick to the generic status code error
        return {"success": False, "error": error_message}
    except Exception as e:
        print(f"Unexpected validation error: {e}")
        return {"success": False, "error": "Key validation failed due to an unexpected API error during the call."}

@app.post("/generate-script")
async def generate_script_endpoint(request: ScriptRequest):
    key_to_use = request.api_key
    if not key_to_use:
        print("API key not provided in request, attempting to use ANTHROPIC_API_KEY from environment.")
        key_to_use = os.environ.get("ANTHROPIC_API_KEY")
    
    if not key_to_use:
        return {"success": False, "error": "API key not found in request or ANTHROPIC_API_KEY environment variable."}

    try:
        client = anthropic.Anthropic(api_key=key_to_use)
        
        # For Claude 3.5 Sonnet, the model ID is often like 'claude-3-5-sonnet-20240620'
        # We'll use the model_identifier passed from the frontend
        # Ensure the frontend sends a valid model ID Anthropic expects.
        # Max tokens can be adjusted. A lower value is faster and cheaper for testing.
        response = client.messages.create(
            model=request.model_identifier, 
            max_tokens=2048, # Increased max_tokens slightly for potentially longer scripts
            system=SYSTEM_MESSAGE_SCRIPTING, # Added system message
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
        return {"success": False, "error": "Anthropic API authentication failed. Check your API key (from settings or environment)."}
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