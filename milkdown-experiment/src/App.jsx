import React, { useState, useEffect, useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import '@milkdown/theme-nord/style.css';

// Basic initial markdown content - now empty
const initialMarkdown = '';

// Define SCRIPT_MODELS (can be expanded later)
const SCRIPT_MODELS = [
  { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
  { id: 'gemini-1.5-pro-preview-0514', name: 'Gemini 1.5 Pro' },
  // Add more models as needed
];

// Reinstating EditorComponent
const EditorComponent = () => {
  useEditor((root) => 
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, initialMarkdown);
      })
      .use(nord)
      .use(commonmark)
      .use(history)
  );

  return <Milkdown />;
};

function App() {
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const textareaRef = useRef(null);

  // New state variables for AI interaction
  const [selectedScriptModel, setSelectedScriptModel] = useState(SCRIPT_MODELS[0].id);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showPromptSettingsModal, setShowPromptSettingsModal] = useState(false); // Placeholder for now
  const [customSystemPrompt, setCustomSystemPrompt] = useState(''); // Placeholder
  const [isGeneratingScript, setIsGeneratingScript] = useState(false); // Placeholder
  const [chatMessages, setChatMessages] = useState([]); // To store chat messages { sender: 'user' | 'ai', text: 'message' }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [promptText]);

  const toggleChatPanel = () => {
    setIsChatPanelOpen(!isChatPanelOpen);
  };

  const handlePromptChange = (event) => {
    setPromptText(event.target.value);
  };

  const handleSendMessage = async () => {
    if (!promptText.trim()) return;
    const userMessage = { sender: 'user', text: promptText };
    setChatMessages(prevMessages => [...prevMessages, userMessage]);

    setIsGeneratingScript(true);
    // Simulate AI call
    console.log(`Sending to AI: "${promptText}" with model: ${selectedScriptModel}`);
    // Placeholder for actual AI call
    // const aiResponse = await callAI(promptText, selectedScriptModel); 
    setTimeout(() => {
      const aiResponseText = `AI Response for: "${promptText}" (using ${selectedScriptModel})`;
      const aiMessage = { sender: 'ai', text: aiResponseText };
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
      setIsGeneratingScript(false);
      // Auto-open chat panel if it's not already open when AI responds
      if (!isChatPanelOpen) {
        setIsChatPanelOpen(true);
      }
    }, 1000);

    setPromptText(''); // Clear prompt input after sending
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSendMessage();
    }
    // Allow Enter for newline by not preventing default if only Enter is pressed
  };

  const handleOpenPromptSettings = () => {
    setShowPromptSettingsModal(true); // Logic for modal will be added later
    console.log("Open prompt settings modal...");
  };
  
  const selectedModelName = SCRIPT_MODELS.find(m => m.id === selectedScriptModel)?.name || 'Select Model';

  return (
    <MilkdownProvider>
      <div className="app-layout">
        <div className="app-header">
          {/* Minimal header content, or remove app-header div if truly empty */}
        </div>
        
        <div className="main-content-area">
          {isChatPanelOpen && (
            <div className="chat-panel">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <p><strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="milkdown-editor-wrapper">
            <EditorComponent />
          </div>

          <button 
            onClick={toggleChatPanel} 
            className={`chat-toggle-button ${isChatPanelOpen ? 'open' : ''}`}
          >
            {isChatPanelOpen ? '<' : '>'}
          </button>
        </div>

        <div className="prompt-input-area">
          {/* Container for Textarea, Gear Icon, and Model Name - adapted from AI-video-editor */}
          <div style={{ flexGrow: 1, position: 'relative' }} className="prompt-input-internal-wrapper">
            {/* Model Name Display / Clickable Area - adapted */}
            <div
              className="model-selector-button-internal"
              onClick={() => !isGeneratingScript && setShowModelPicker(!showModelPicker)}
              title="Click to change LLM model"
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '25px', // New position: To the right of settings cog
                zIndex: 2,
                // Styling from .model-selector-button in CSS will be primary
              }}
            >
              {selectedModelName} {showModelPicker ? '▲' : '▼'}
            </div>

            {/* Custom Model Picker Dropdown - adapted */}
            {showModelPicker && (
              <div 
                className="model-picker-dropdown-internal"
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 5px)', // Position above the internal button
                  left: '10px',
                  zIndex: 100,
                  // Styling from .model-picker-dropdown in CSS will be primary
              }}>
                {SCRIPT_MODELS.map(model => (
                  <div
                    key={model.id}
                    className={`model-picker-item ${model.id === selectedScriptModel ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedScriptModel(model.id);
                      setShowModelPicker(false);
                    }}
                    title={model.name}
                  >
                    {model.name}
                  </div>
                ))}
              </div>
            )}

            {/* Settings Cog Button - adapted */}
            <button
              className="settings-cog-button-internal"
              onClick={handleOpenPromptSettings}
              disabled={isGeneratingScript}
              title="Edit text generation settings..."
              style={{
                position: 'absolute',
                bottom: '6px', 
                left: '3px', // New position: Far left
                zIndex: 2,
                // Styling from .settings-cog-button in CSS will be primary
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={promptText}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your chat or change request here (Ctrl+Enter to send)..."
              rows={1} // Will auto-grow due to useEffect and CSS
              disabled={isGeneratingScript}
              // Inline style for padding to accommodate internal controls
              style={{
                paddingBottom: '30px', // Make space for controls at the bottom
                // Add other necessary paddings if text overlaps controls
                paddingLeft: '10px', // Default padding
                paddingRight: '10px', // Default padding
                paddingTop: '10px' // Default padding
              }}
            />
          </div>
          {/* Send button remains outside the relative container, next to it */}
          <button 
            className="send-button" 
            onClick={handleSendMessage} 
            disabled={!promptText.trim() || isGeneratingScript}
          >
            {isGeneratingScript ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </MilkdownProvider>
  );
}

export default App; 