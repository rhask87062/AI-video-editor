import React, { useState, useEffect, useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import '@milkdown/theme-nord/style.css';
import { callClaudeApi } from './api'; // Import the new API function
// import { Lock, Unlock } from 'lucide-react'; // Example icons, install if needed or use SVGs/text -- Now using text

// SVG Icon Components for Padlock
const LockIcon = ({ size = 16, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const UnlockIcon = ({ size = 16, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 9.9-1H17M12 16v-3"></path> {/* Slightly changed unlock path for distinction if needed, or keep original for open shackle */}
  </svg>
);

// Basic initial markdown content - now empty
const initialMarkdown = '';

// Define SCRIPT_MODELS (can be expanded later)
const SCRIPT_MODELS = [
  { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
  { id: 'gemini-1.5-pro-preview-0514', name: 'Gemini 1.5 Pro' },
  // Add more models as needed
];

const DEFAULT_CHAT_SYSTEM_PROMPT = "You are a helpful AI assistant. The user is working on a script in an editor. Respond to their questions and engage in conversation about their script. All your responses should be directed to the chat panel.";
const DEFAULT_EDIT_SYSTEM_PROMPT = "You are an AI script editing assistant. The user will provide instructions or text they want to change in their script. Your task is to analyze their request and provide the modified text or a description of the changes directly in the chat panel. Do not attempt to directly edit any document. For example, if the user says 'Change scene 1 to be at night', you might respond in the chat with: 'Okay, I've updated scene 1 to be at night. Here's the revised description: [revised text here]'. Or if they say 'Make this dialogue more tense', you could suggest new dialogue options in the chat.";

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
  const [apiKey, setApiKey] = useState('');
  const [selectedScriptModel, setSelectedScriptModel] = useState(SCRIPT_MODELS[0].id);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [chatSystemPromptText, setChatSystemPromptText] = useState(DEFAULT_CHAT_SYSTEM_PROMPT);
  const [editSystemPromptText, setEditSystemPromptText] = useState(DEFAULT_EDIT_SYSTEM_PROMPT);
  const [showPromptSettingsModal, setShowPromptSettingsModal] = useState(false);
  const [editingChatPrompt, setEditingChatPrompt] = useState('');
  const [editingEditPrompt, setEditingEditPrompt] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isPromptHeightLocked, setIsPromptHeightLocked] = useState(false);
  const [lockedPromptHeight, setLockedPromptHeight] = useState(100);

  // New state for dragging
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const resizerRef = useRef(null); // Ref for the resizer div
  const promptInputAreaRef = useRef(null); // Ref for the prompt input area to get its initial height

  // Load API key, system prompts, lock state, and locked height from localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('anthropicApiKey');
    if (storedApiKey) setApiKey(storedApiKey);
    const storedChatPrompt = localStorage.getItem('chatSystemPrompt');
    if (storedChatPrompt) setChatSystemPromptText(storedChatPrompt);
    const storedEditPrompt = localStorage.getItem('editSystemPrompt');
    if (storedEditPrompt) setEditSystemPromptText(storedEditPrompt);
    const storedIsLocked = localStorage.getItem('isPromptHeightLocked');
    if (storedIsLocked) setIsPromptHeightLocked(JSON.parse(storedIsLocked));
    const storedLockedHeight = localStorage.getItem('lockedPromptHeight');
    if (storedLockedHeight) setLockedPromptHeight(parseInt(storedLockedHeight, 10));
    else setLockedPromptHeight(100); // Ensure a default if not in localStorage
  }, []);

  // Effect for textarea auto-height OR fixed height
  useEffect(() => {
    if (textareaRef.current) {
      if (!isPromptHeightLocked) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      } else {
        textareaRef.current.style.height = lockedPromptHeight + 'px';
      }
    }
  }, [promptText, isPromptHeightLocked, lockedPromptHeight]);

  // Event handlers for resizing
  const handleMouseDownOnDivider = (e) => {
    if (!isPromptHeightLocked) return; // Only allow resize if locked
    setIsResizing(true);
    setStartY(e.clientY);
    // Prevent text selection during drag
    e.preventDefault(); 
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !isPromptHeightLocked) return;
      const deltaY = e.clientY - startY;
      // Adjust height: dragging down increases height, dragging up decreases.
      // The prompt input area is below the resizer, so a positive deltaY (mouse moved down)
      // means the resizer is moving down, thus the area below it should *decrease* in height if we interpret
      // lockedPromptHeight as the height of the textarea itself.
      // Let's define lockedPromptHeight as the height of the textarea. Dragging the divider *down* should *increase* textarea height.
      setLockedPromptHeight(prevHeight => Math.max(50, prevHeight + deltaY)); // Min height 50px
      setStartY(e.clientY); // Update startY for next delta calculation
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // Save the final lockedPromptHeight to localStorage
        localStorage.setItem('lockedPromptHeight', lockedPromptHeight.toString());
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startY, isPromptHeightLocked, lockedPromptHeight]); // Added lockedPromptHeight to dependencies

  const toggleChatPanel = () => setIsChatPanelOpen(!isChatPanelOpen);
  const handlePromptChange = (event) => setPromptText(event.target.value);
  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('anthropicApiKey', newApiKey);
  };

  const handleTogglePromptLock = () => {
    const newLockState = !isPromptHeightLocked;
    setIsPromptHeightLocked(newLockState);
    localStorage.setItem('isPromptHeightLocked', JSON.stringify(newLockState));
    if (newLockState && textareaRef.current) {
        const currentScrollHeight = textareaRef.current.scrollHeight;
        const newLockedHeight = Math.max(50, Math.min(currentScrollHeight, 300));
        setLockedPromptHeight(newLockedHeight);
        localStorage.setItem('lockedPromptHeight', newLockedHeight.toString());
    } else if (!newLockState && textareaRef.current) {
        // When unlocking, trigger height recalculation by momentarily changing promptText or another dependency
        // This ensures the useEffect for height calculation runs.
        // A more direct way might be to call a recalculate function if we abstract the logic from useEffect.
        // For now, this is a simple way to trigger the existing useEffect.
        setPromptText(prev => prev + ' '); // Add a space to trigger effect
        setTimeout(() => setPromptText(prev => prev.trim()), 0); // then remove it
    }
  };

  const handleOpenPromptSettings = () => {
    setEditingChatPrompt(chatSystemPromptText);
    setEditingEditPrompt(editSystemPromptText);
    setShowPromptSettingsModal(true);
  };

  const handleSavePromptSettings = () => {
    setChatSystemPromptText(editingChatPrompt);
    localStorage.setItem('chatSystemPrompt', editingChatPrompt);
    setEditSystemPromptText(editingEditPrompt);
    localStorage.setItem('editSystemPrompt', editingEditPrompt);
    setShowPromptSettingsModal(false);
  };

  const handleChatSend = async () => {
    if (!promptText.trim()) return;
    const userMessage = { sender: 'user', text: promptText };
    setChatMessages(prevMessages => [...prevMessages, userMessage]);
    setIsGeneratingScript(true);
    if (!apiKey.trim()) {
      const aiMessage = { sender: 'ai', text: "API Key is missing. Please enter it below the chat/editor area." };
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
      setIsGeneratingScript(false);
      if (!isChatPanelOpen) setIsChatPanelOpen(true);
      return;
    }
    console.log(`Sending to AI for chat: "${promptText}" with model: ${selectedScriptModel}`);
    const systemPromptToUse = chatSystemPromptText;
    const result = await callClaudeApi(promptText, apiKey, selectedScriptModel, systemPromptToUse);
    let aiResponseText;
    if (result.success) aiResponseText = result.script;
    else { aiResponseText = `Error: ${result.error}`; if (result.raw_error) console.error("Raw AI Error:", result.raw_error); }
    const aiMessage = { sender: 'ai', text: aiResponseText };
    setChatMessages(prevMessages => [...prevMessages, aiMessage]);
    setIsGeneratingScript(false);
    if (!isChatPanelOpen) setIsChatPanelOpen(true);
    setPromptText('');
  };

  const handleEditScriptRequest = async () => {
    if (!promptText.trim()) return;
    const userMessage = { sender: 'user', text: `(Revise Request) ${promptText}` };
    setChatMessages(prevMessages => [...prevMessages, userMessage]);
    setIsGeneratingScript(true);
    if (!apiKey.trim()) {
      const aiMessage = { sender: 'ai', text: "API Key is missing. Please enter it below the chat/editor area." };
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
      setIsGeneratingScript(false);
      if (!isChatPanelOpen) setIsChatPanelOpen(true);
      return;
    }
    console.log(`Request to revise script with: "${promptText}", model: ${selectedScriptModel}`);
    const systemPromptToUse = editSystemPromptText;
    const result = await callClaudeApi(promptText, apiKey, selectedScriptModel, systemPromptToUse);
    let aiResponseText;
    if (result.success) aiResponseText = result.script;
    else { aiResponseText = `Error processing revise request: ${result.error}`; if (result.raw_error) console.error("Raw AI Error (Revise Request):", result.raw_error); }
    const aiMessage = { sender: 'ai', text: aiResponseText };
    setChatMessages(prevMessages => [...prevMessages, aiMessage]);
    setIsGeneratingScript(false);
    if (!isChatPanelOpen) setIsChatPanelOpen(true);
    setPromptText('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleChatSend();
    }
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

        {/* DRAGGABLE DIVIDER LINE */}
        <div 
          ref={resizerRef}
          style={{
            height: '10px', // Slimmer divider line
            backgroundColor: 'var(--color-nord3)', // Make it more prominent
            cursor: isPromptHeightLocked ? 'row-resize' : 'default',
            userSelect: 'none',
            // borderTop: '1px solid var(--color-nord1)', // Optional subtle borders for effect
            // borderBottom: '1px solid var(--color-nord1)',
          }}
          onMouseDown={handleMouseDownOnDivider}
        />

        {/* PROMPT INPUT AREA (now contains the lock control) */}
        <div ref={promptInputAreaRef} className="prompt-input-area" style={{ display: 'flex', alignItems: 'stretch', position: 'relative' /* For positioning lock control */ }}>
          
          {/* LOCK CONTROL (Above textarea, but visually part of this area) */}
          <div 
            style={{
              position: 'absolute',
              top: '-20px', // Position it so it sits on/above the top border of prompt-input-area
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '2px 5px',
              backgroundColor: 'var(--color-nord2)', // Match resizer bar for visual continuity
              border: `1px solid ${isPromptHeightLocked ? 'var(--color-nord10)' : 'var(--color-nord3)'}`,
              borderRadius: '15px', // Pill shape
              zIndex: 5, // Ensure it's above the textarea but below modals
              cursor: 'pointer',
            }}
            onClick={handleTogglePromptLock} 
            title={isPromptHeightLocked ? "Unlock prompt height (auto-expand)" : "Lock prompt height (fixed size)"}
          >
            <span style={{ color: 'var(--color-nord4)', fontSize: '10px', lineHeight: '0.8', opacity: isPromptHeightLocked ? 1 : 0.5 }}>▲</span>
            {isPromptHeightLocked ? <LockIcon size={12} color='var(--color-nord10)'/> : <UnlockIcon size={12} color='var(--color-nord4)'/>}
            <span style={{ color: 'var(--color-nord4)', fontSize: '10px', lineHeight: '0.8', opacity: isPromptHeightLocked ? 1 : 0.5 }}>▼</span>
          </div>

          {/* Internal wrapper for textarea and its own absolutely positioned elements */}
          <div style={{ flexGrow: 1, position: 'relative', display: 'flex' }} className="prompt-input-internal-wrapper">
            {/* Model selector and cog button (already absolutely positioned within this wrapper) */}
            <div className="model-selector-button-internal" onClick={() => !isGeneratingScript && setShowModelPicker(!showModelPicker)} title="Click to change LLM model" style={{ position: 'absolute', bottom: '8px', left: '25px', zIndex: 2 }}>
              {selectedModelName} {showModelPicker ? '▲' : '▼'}
            </div>
            {showModelPicker && (
              <div className="model-picker-dropdown-internal" style={{position: 'absolute', bottom: 'calc(100% + 5px)', left: '10px', zIndex: 100}}>
                {SCRIPT_MODELS.map(model => (
                  <div key={model.id} className={`model-picker-item ${model.id === selectedScriptModel ? 'selected' : ''}`} onClick={() => { setSelectedScriptModel(model.id); setShowModelPicker(false); }} title={model.name}>
                    {model.name}
                  </div>
                ))}
              </div>
            )}
            <button className="settings-cog-button-internal" onClick={handleOpenPromptSettings} disabled={isGeneratingScript} title="Edit system prompts..." style={{ position: 'absolute', bottom: '6px', left: '3px', zIndex: 2 }}>
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
              disabled={isGeneratingScript} 
              style={{
                flexGrow: 1, 
                resize: 'none', 
                paddingBottom: '30px', 
                paddingLeft: '10px', 
                paddingRight: '10px', 
                paddingTop: '10px',
                boxSizing: 'border-box',
                overflowY: 'auto',
                borderTop: '1px solid var(--color-nord3)' // Add top border to visually contain the lock
              }}
            />
          </div>
          {/* Button Column (Revise, Chat) */}
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px', width: '100px', justifyContent: 'space-between' }}>
            <button className="send-button" onClick={handleEditScriptRequest} disabled={!promptText.trim() || isGeneratingScript || !apiKey.trim()} style={{ marginBottom: '8px', flexGrow: 1 }}>
              Revise
            </button>
            <button className="send-button" onClick={handleChatSend} disabled={!promptText.trim() || isGeneratingScript || !apiKey.trim()} style={{ flexGrow: 1 }}>
              {isGeneratingScript ? 'Sending...' : 'Chat'}
            </button>
          </div>
        </div>
        <div style={{ padding: '10px', backgroundColor: 'var(--color-nord0)', borderTop: '1px solid var(--color-nord2)' }}>
          <label htmlFor="apiKeyInput" style={{ marginRight: '10px', color: 'var(--color-nord4)' }}>Anthropic API Key:</label>
          <input
            type="password"
            id="apiKeyInput"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Anthropic API Key"
            style={{ width: '300px', padding: '5px', backgroundColor: 'var(--color-nord1)', color: 'var(--color-nord4)', border: '1px solid var(--color-nord3)' }}
          />
          <p style={{ fontSize: '0.8em', color: 'var(--color-nord3)', marginTop: '5px' }}>
            Note: Key is stored in browser's localStorage.
          </p>
        </div>

        {showPromptSettingsModal && (
          <div className="modal-overlay" style={{position: 'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
            <div className="modal-content" style={{background:'var(--color-nord1)', padding:'20px', borderRadius:'8px', width:'80%', maxWidth:'600px', color:'var(--color-nord4)'}}>
              <h3 style={{marginTop:0}}>Edit System Prompts</h3>
              
              <div style={{marginBottom:'15px'}}>
                <label htmlFor="chatSystemPromptEdit" style={{display:'block', marginBottom:'5px'}}>Chat System Prompt:</label>
                <textarea 
                  id="chatSystemPromptEdit" 
                  value={editingChatPrompt} 
                  onChange={(e) => setEditingChatPrompt(e.target.value)} 
                  rows={5} 
                  style={{width:'100%', padding:'8px', boxSizing:'border-box', backgroundColor:'var(--color-nord0)', color:'var(--color-nord4)', border:'1px solid var(--color-nord3)'}}
                />
              </div>

              <div style={{marginBottom:'20px'}}>
                <label htmlFor="editSystemPromptEdit" style={{display:'block', marginBottom:'5px'}}>Revise System Prompt:</label>
                <textarea 
                  id="editSystemPromptEdit" 
                  value={editingEditPrompt} 
                  onChange={(e) => setEditingEditPrompt(e.target.value)} 
                  rows={5} 
                  style={{width:'100%', padding:'8px', boxSizing:'border-box', backgroundColor:'var(--color-nord0)', color:'var(--color-nord4)', border:'1px solid var(--color-nord3)'}}
                />
              </div>

              <div style={{textAlign:'right'}}>
                <button onClick={handleSavePromptSettings} style={{marginRight:'10px', padding:'8px 15px', backgroundColor:'var(--color-nord10)', color:'var(--color-nord0)', border:'none', borderRadius:'4px'}}>Save</button>
                <button onClick={() => setShowPromptSettingsModal(false)} style={{padding:'8px 15px', backgroundColor:'var(--color-nord2)', color:'var(--color-nord4)', border:'1px solid var(--color-nord3)', borderRadius:'4px'}}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MilkdownProvider>
  );
}

export default App; 