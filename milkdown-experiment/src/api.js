export async function callClaudeApi(prompt, apiKey, modelIdentifier, systemPrompt = null) {
  const ANTHROPIC_API_URL = '/api/anthropic/v1/messages';
  
  if (!apiKey) {
    // In a real app, handle this more gracefully, maybe prompt the user or check secure storage.
    // For this experiment, we'll rely on the App.jsx to provide it.
    console.error('Anthropic API key is missing.');
    return { success: false, error: 'Anthropic API key is missing.' };
  }

  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  };

  const messages = [{ role: 'user', content: prompt }];
  
  // Construct the body, including system prompt if provided
  const body = {
    model: modelIdentifier,
    max_tokens: 2048, // Default, can be made configurable
    messages: messages,
  };

  if (systemPrompt && systemPrompt.trim() !== '') {
    body.system = systemPrompt;
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      console.error('Anthropic API Error:', errorData);
      // Try to extract a more specific error message
      let errorMessage = `API request failed with status ${response.status}`;
      if (errorData && errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData && errorData.detail) {
        errorMessage = errorData.detail;
      }
      return { success: false, error: errorMessage, raw_error: errorData };
    }

    const responseData = await response.json();
    
    // Extract the text from the response
    // Assuming the response structure has content an array and the text is in the first element.
    if (responseData.content && responseData.content.length > 0 && responseData.content[0].text) {
      return { success: true, script: responseData.content[0].text };
    } else {
      console.error('Unexpected response structure from Anthropic API:', responseData);
      return { success: false, error: 'Unexpected response structure.', raw_error: responseData };
    }

  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return { success: false, error: error.message, raw_error: error };
  }
} 