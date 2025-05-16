from fastapi import FastAPI
from pydantic import BaseModel
import os
import anthropic
from typing import Optional
import json # For parsing error response
import google.generativeai as genai # Added for Gemini
from fastapi.responses import JSONResponse
import logging # Added for more detailed logging

app = FastAPI()
logger = logging.getLogger(__name__) # Added logger instance
logging.basicConfig(level=logging.INFO) # Basic config for logging

# Pydantic model for the request body of /generate-script
class ScriptRequest(BaseModel):
    prompt: str
    model_identifier: str # e.g., 'claude-3-5-sonnet-20240620', 'gemini-2.5-pro-preview-05-06'
    api_key: Optional[str] = None
    system_prompt: Optional[str] = None # Added optional system_prompt

class ApiKeyValidateRequest(BaseModel):
    api_key: str

SYSTEM_MESSAGE_SCRIPTING_ANTHROPIC = """You are an expert scriptwriter and creative assistant integrated into an AI video editing application. 
Your primary task is to help the user generate and develop scripts based on user prompts.

**Output Requirements:**
*   **Format:** Your entire response MUST be a complete script formatted in **Markdown**.
*   **Content:** Only provide the script itself. Do NOT include any conversational intros, outros, summaries, or explanations outside of the script content (e.g., no "Here's the script you asked for:").
*   **Script Structure:** Use standard scriptwriting conventions within the Markdown:
    *   **Scene Headings:** Start with `INT.` or `EXT.`, followed by location and time of day (e.g., `## INT. COFFEE SHOP - DAY`). Use Markdown headings (like `##` or `###`) for these.
    *   **Action Descriptions:** Plain text paragraphs.
    *   **Character Names:** In ALL CAPS before their dialogue (e.g., `JOHN DOE`).
    *   **Dialogue:** Plain text following the character name.
    *   **Parentheticals:** For tone or brief actions, enclosed in parentheses on a new line below the character name and before the dialogue (e.g., `(sadly)`).
*   **Elaboration:** If the user's request is a simple idea, try to flesh it out into at least one complete scene or a structured outline with multiple scene ideas, all within the Markdown script format.

The user will be interacting with your generated Markdown script in a canvas-like text editor where they can further refine it with AI assistance. Your direct output will populate this editor. Be creative and helpful in generating compelling script content."""

# System message for Google Gemini (can be the same or tailored)
# For now, let's assume a similar base instruction, but Gemini might have different best practices for system prompts.
# We can refine this later.
SYSTEM_MESSAGE_SCRIPTING_GEMINI = """You are an expert scriptwriter and creative assistant integrated into an AI video editing application.
Your primary task is to help the user generate and develop scripts based on user prompts.

**Output Requirements:**
*   **Format:** Your entire response MUST be a complete script formatted in **Markdown**.
*   **Content:** Only provide the script itself. Do NOT include any conversational intros, outros, summaries, or explanations outside of the script content (e.g., no "Here's the script you asked for:").
*   **Script Structure:** Use standard scriptwriting conventions within the Markdown:
    *   **Scene Headings:** Start with `INT.` or `EXT.`, followed by location and time of day (e.g., `## INT. COFFEE SHOP - DAY`). Use Markdown headings (like `##` or `###`) for these.
    *   **Action Descriptions:** Plain text paragraphs.
    *   **Character Names:** In ALL CAPS before their dialogue (e.g., `JOHN DOE`).
    *   **Dialogue:** Plain text following the character name.
    *   **Parentheticals:** For tone or brief actions, enclosed in parentheses on a new line below the character name and before the dialogue (e.g., `(sadly)`).
*   **Elaboration:** If the user\'s request is a simple idea, try to flesh it out into at least one complete scene or a structured outline with multiple scene ideas, all within the Markdown script format.

The user will be interacting with your generated Markdown script in a canvas-like text editor where they can further refine it with AI assistance. Your direct output will populate this editor. Be creative and helpful in generating compelling script content."""

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

@app.post("/validate-google-key")
async def validate_google_key_endpoint(request: ApiKeyValidateRequest):
    if not request.api_key:
        return {"success": False, "error": "No Google API key provided for validation."}
    try:
        genai.configure(api_key=request.api_key)
        # Attempt a lightweight, quick call to validate the key
        # Listing models is a good, low-cost way to check authentication and basic API access.
        # If this doesn't work well, a tiny generation call could be an alternative.
        models = genai.list_models() # This is a synchronous call, wrap if needed for async or use async equivalent
        # Check if we got a list of models (even if empty, it means auth worked)
        # A more robust check might be to see if a specific expected model type is in the list
        # For now, just checking if the call itself succeeded without an auth error is enough.
        # Example: iterate and print (for server log, not for response)
        # for m in models:
        #     if 'generateContent' in m.supported_generation_methods:
        #         print(m.name)
        if models is not None: # Check if the call returned something (not None)
             return {"success": True, "message": "Google API Key appears valid (successfully listed models)."}
        else:
            # This case might not be hit if list_models() errors out first on bad key
            return {"success": False, "error": "Google API Key validation failed (could not list models)."}

    except google.api_core.exceptions.PermissionDenied as e:
        print(f"Google API Permission Denied during validation: {e}")
        return {"success": False, "error": "Invalid Google API Key (Permission Denied)."}
    except google.api_core.exceptions.Unauthenticated as e: # More specific for bad keys
        print(f"Google API Unauthenticated during validation: {e}")
        return {"success": False, "error": "Invalid Google API Key (Unauthenticated)."}
    except google.api_core.exceptions.GoogleAPIError as e:
        print(f"Google API Error during validation: {e}")
        return {"success": False, "error": f"Google API error during validation: {e}."}
    except Exception as e:
        print(f"Unexpected Google key validation error: {e}")
        return {"success": False, "error": "Key validation failed due to an unexpected API error."}

@app.post("/generate-script")
async def generate_script_endpoint(request: ScriptRequest):
    model_id = request.model_identifier
    prompt_text = request.prompt
    api_key_from_request = request.api_key
    custom_system_prompt = request.system_prompt # Get custom system prompt

    try:
        if model_id.startswith("claude-"):
            # ANTHROPIC API CALL
            key_to_use = api_key_from_request
            if not key_to_use:
                print("Anthropic API key not provided in request, attempting to use ANTHROPIC_API_KEY from environment.")
                key_to_use = os.environ.get("ANTHROPIC_API_KEY")
            
            if not key_to_use:
                return {"success": False, "error": "Anthropic API key not found in request or ANTHROPIC_API_KEY environment variable."}

            client = anthropic.Anthropic(api_key=key_to_use)
            
            # Use custom system prompt if provided, else default
            system_message_to_use = custom_system_prompt if custom_system_prompt else SYSTEM_MESSAGE_SCRIPTING_ANTHROPIC
            logger.info(f"Using system prompt for Anthropic: {system_message_to_use[:100]}...") # Log first 100 chars

            response = client.messages.create(
                model=model_id, 
                max_tokens=2048,
                system=system_message_to_use, # Use determined system message
                messages=[
                    {
                        "role": "user",
                        "content": prompt_text
                    }
                ]
            )
            
            script_text = ""
            if response.content and isinstance(response.content, list):
                for block in response.content:
                    if hasattr(block, 'text'):
                        script_text += block.text
            
            if not script_text:
                print("Warning: No text content extracted from Anthropic LLM response. Full response:", response)
                return {"success": True, "data": {"script": "[No text content found in Anthropic response]"}}

            return {"success": True, "data": {"script": script_text}}

        elif model_id.startswith("gemini-"):
            # GOOGLE GEMINI API CALL
            key_to_use = api_key_from_request
            if not key_to_use:
                print("Google API key not provided in request, attempting to use GOOGLE_API_KEY from environment.")
                key_to_use = os.environ.get("GOOGLE_API_KEY")

            if not key_to_use:
                return {"success": False, "error": "Google API key not found in request or GOOGLE_API_KEY environment variable."}

            try: # Start of new try block for Gemini specific calls
                genai.configure(api_key=key_to_use)
                
                generation_config = genai.types.GenerationConfig(
                    max_output_tokens=2048,
                )
                
                # Use custom system prompt if provided, else default for Gemini
                system_message_to_use_gemini = custom_system_prompt if custom_system_prompt else SYSTEM_MESSAGE_SCRIPTING_GEMINI
                logger.info(f"Using system prompt for Gemini: {system_message_to_use_gemini[:100]}...") # Log first 100 chars

                model = genai.GenerativeModel(
                    model_name=model_id,
                    system_instruction=system_message_to_use_gemini, # Use determined system message
                    generation_config=generation_config
                )
                
                logger.info(f"Attempting to generate content with Gemini model: {model_id}")
                response = await model.generate_content_async(prompt_text) # Using async version
                logger.info(f"Received response from Gemini model: {model_id}")

                script_text = ""
                if response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if candidate.content and candidate.content.parts:
                        for part in candidate.content.parts:
                            if hasattr(part, 'text'):
                                script_text += part.text
                
                if not script_text:
                    logger.warning(f"No text content extracted from Gemini LLM response for model {model_id}. Full response: {response}")
                    if response.prompt_feedback and response.prompt_feedback.block_reason:
                        block_reason_message = response.prompt_feedback.block_reason_message or "Content blocked"
                        logger.error(f"Gemini content generation blocked for model {model_id}: {block_reason_message}")
                        return JSONResponse(
                            status_code=400, # Or a more appropriate error code for blocked content
                            content={"success": False, "error": f"Gemini content generation blocked: {block_reason_message}"}
                        )
                    return {"success": True, "data": {"script": "[No text content extracted from Gemini response]"}}

                return {"success": True, "data": {"script": script_text}}

            except Exception as gemini_e: # Catch specific Gemini errors
                logger.exception(f"Error during Gemini API call for model {model_id}:")
                # Try to get more specific error details if it's a Google API core exception
                error_detail = str(gemini_e)
                error_type = type(gemini_e).__name__
                # if isinstance(gemini_e, google.api_core.exceptions.GoogleAPIError):
                #     # This can provide more structured error information
                #     error_detail = f"Reason: {gemini_e.reason}, Message: {gemini_e.message}" # Example fields

                return JSONResponse(
                    status_code=500,
                    content={"success": False, "error": f"LLM Server error (Gemini - {error_type}): {error_detail}", "data": {"raw_error": str(gemini_e), "error_type": error_type}}
                )
        
        else:
            print(f"Model identifier '{request.model_identifier}' not recognized for specific handling.")
            # Basic placeholder - replace with actual logic or error if model is unknown
            # For now, let's assume a generic error if not Claude or Gemini
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": f"Model '{request.model_identifier}' not supported by this endpoint yet."}
            )

    except anthropic.APIConnectionError as e:
        print(f"Anthropic APIConnectionError: {e}")
        error_message = f"Anthropic server could not be reached: {e.__cause__}"
        return JSONResponse(status_code=503, content={"success": False, "error": error_message, "data": {"raw_error": str(e)}})
    except anthropic.RateLimitError as e:
        print(f"Anthropic RateLimitError: {e}")
        error_message = "Anthropic API rate limit exceeded."
        return JSONResponse(status_code=429, content={"success": False, "error": error_message, "data": {"raw_error": str(e)}})
    except anthropic.APIStatusError as e:
        print(f"Anthropic APIStatusError status_code={e.status_code} response={e.response}")
        logger.error(f"Anthropic APIStatusError for model {request.model_identifier}: status_code={e.status_code}", exc_info=True)
        error_body = "Unknown error structure"
        try:
            error_body = e.response.json() # Attempt to parse error
        except json.JSONDecodeError:
            error_body = e.response.text # Fallback to raw text
        error_message = f"Anthropic API error (Status {e.status_code})"
        return JSONResponse(status_code=e.status_code, content={"success": False, "error": error_message, "data": {"raw_error": error_body}})
    
    # General fallback for other UNEXPECTED errors during script generation
    # This should ideally not be hit if specific exceptions for Anthropic and Gemini are comprehensive.
    except Exception as e: 
        logger.exception(f"Unexpected unhandled exception during script generation with model {request.model_identifier}:")
        
        # Determine if it was likely an Anthropic or Gemini context if not caught above, though this is less ideal
        api_context = "Unknown API"
        if "gemini" in request.model_identifier:
            api_context = "Gemini"
        elif "claude" in request.model_identifier:
            api_context = "Anthropic"

        error_message = f"Unexpected LLM Server error ({api_context}): {type(e).__name__} - {str(e)}"
        return JSONResponse(
            status_code=500, 
            content={"success": False, "error": error_message, "data": {"raw_error": str(e), "error_type": type(e).__name__}}
        )

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