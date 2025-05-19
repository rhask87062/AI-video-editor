import React, { useState, useEffect, useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { replaceAll, getMarkdown } from '@milkdown/utils';
import '@milkdown/theme-nord/style.css';
import { callClaudeApi } from './api'; // Import the new API function
// import { Lock, Unlock } from 'lucide-react'; // Example icons, install if needed or use SVGs/text -- Now using text

// SVG Icon Components for Padlock - Body Filled, Shackle Outline
const LockIcon = ({ size = 16, color = "currentColor", shackleColor = "currentColor" }) => (
  // Main SVG tag: viewBox is important for scaling. No fill/stroke here, defined on paths.
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
    {/* Body of the lock - Filled */}
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill={color} stroke="none"/>
    {/* Shackle of the lock - Outline */}
    <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke={shackleColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> 
  </svg>
);

const UnlockIcon = ({ size = 16, color = "currentColor", shackleColor = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
    {/* Body of the lock - Filled */}
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill={color} stroke="none"/>
    {/* Shackle path: Left arm, top curve, then right arm swung out horizontally */}
    <path d="M7 11V7a5 5 0 0 1 5-5h0 M12 2a5 5 0 0 1 5 5v0 M12 7h5.5" fill="none" stroke={shackleColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// Re-introduce EditorComponent with a ref to expose actions
const EditorComponent = React.forwardRef((props, ref) => {
  console.log("EditorComponent: Rendering");

  const { loading, anError, editor } = useEditor((root) => {
    console.log("EditorComponent: useEditor - factory function running");
    return Editor.make()
      .config((ctx) => {
        console.log("EditorComponent: useEditor - config running");
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, props.initialValue || initialMarkdown);
      })
      .use(nord)
      .use(commonmark)
      .use(history());
  });

  // const [editorInstance, setEditorInstance] = useState(null); // Not strictly needed if directly using editor from useEditor
  const { getInstance } = useInstance(); 

  useEffect(() => {
    console.log("EditorComponent: useEffect[loading, anError, getInstance] - Fired. Loading:", loading, "Error:", anError);
    if (!loading && !anError) {
      const currentInstance = getInstance();
      console.log("EditorComponent: useEffect - Editor instance obtained:", !!currentInstance);
      // setEditorInstance(currentInstance); // Not setting state here directly
    } else if (anError) {
        console.error("EditorComponent: useEffect - Editor creation error state:", anError);
    }
  }, [loading, anError, getInstance]);

  React.useImperativeHandle(ref, () => ({
    getMarkdownContent: () => {
      const currentEditor = editor.current(); // Get current editor instance directly
      if (currentEditor) {
        try {
          console.log("EditorComponent: ref.getMarkdownContent - Calling action");
          return currentEditor.action(getMarkdown());
        } catch (e) {
          console.error("Error getting markdown from EditorComponent via ref:", e);
          return '';
        }
      }
      console.warn("EditorComponent: ref.getMarkdownContent - Editor not available");
      return '';
    },
    replaceAllMarkdown: (newMarkdown) => {
      const currentEditor = editor.current(); // Get current editor instance directly
      if (currentEditor) {
        try {
          console.log("EditorComponent: ref.replaceAllMarkdown - Calling action with:", newMarkdown.substring(0,50) + "...");
          currentEditor.action(replaceAll(newMarkdown));
        } catch (e) {
          console.error("Error setting markdown in EditorComponent via ref:", e);
        }
      } else {
        console.warn("EditorComponent: ref.replaceAllMarkdown - Editor not available");
      }
    }
  }), [editor]); // Add editor to dependency array of useImperativeHandle

  // Timeout for loading
  const [loadTimeout, setLoadTimeout] = useState(false);
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadTimeout(true);
        console.warn("EditorComponent: Load timeout reached after 15 seconds.");
      }, 15000); // 15 seconds timeout
      return () => clearTimeout(timer);
    } else {
      setLoadTimeout(false); // Reset timeout if loading completes
    }
  }, [loading]);

  if (anError) {
    console.error("EditorComponent: Rendering error state.", anError);
    return <div style={{padding: '20px', color: 'red'}}>Milkdown Editor Error: {anError.message} (Check console for more details)</div>;
  }
  if (loading && !loadTimeout) {
    console.log("EditorComponent: Rendering loading state...");
    return <div style={{padding: '20px'}}>Initializing editor plugins... Please wait. (This might take a moment)</div>; // More descriptive message
  }
  if (loadTimeout) {
    return <div style={{padding: '20px', color: 'orange'}}>Editor is taking too long to load. Please try refreshing the page. If the problem persists, check the console.</div>;
  }
  
  console.log("EditorComponent: Rendering Milkdown component.");
  return <Milkdown />;
});

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
  const [currentTextareaHeight, setCurrentTextareaHeight] = useState('auto'); // Store actual height before lock
  const promptInputAreaRef = useRef(null);
  const editorActionsRef = useRef(null); // Ref for EditorComponent actions

  // Load API key, system prompts, and lock state from localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem('anthropicApiKey');
    if (storedApiKey) setApiKey(storedApiKey);
    const storedChatPrompt = localStorage.getItem('chatSystemPrompt');
    if (storedChatPrompt) setChatSystemPromptText(storedChatPrompt);
    const storedEditPrompt = localStorage.getItem('editSystemPrompt');
    if (storedEditPrompt) setEditSystemPromptText(storedEditPrompt);
    const storedIsLocked = localStorage.getItem('isPromptHeightLocked');
    if (storedIsLocked) setIsPromptHeightLocked(JSON.parse(storedIsLocked));
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      if (!isPromptHeightLocked) { // Auto-expand if not locked
        console.log("--- Height Calculation (Unlocked) ---");
        console.log("Window InnerHeight:", window.innerHeight);
        textareaRef.current.style.height = 'auto'; // Reset before calculating scrollHeight
        const scrollH = textareaRef.current.scrollHeight;
        console.log("Textarea ScrollHeight:", scrollH);
        const minHeight = Math.max(50, window.innerHeight * 0.10);
        const maxHeight = window.innerHeight * 0.50; 
        console.log("Calculated MinHeight:", minHeight, "Calculated MaxHeight:", maxHeight);
        const newHeight = Math.min(maxHeight, Math.max(minHeight, scrollH));
        console.log("Applied NewHeight to textarea:", newHeight);
        textareaRef.current.style.height = newHeight + 'px';
        setCurrentTextareaHeight(newHeight + 'px'); // Keep track of current calculated height
      } else {
        // When locked, apply the height that was captured at the moment of locking
        // console.log("Applying locked height:", currentTextareaHeight);
        textareaRef.current.style.height = currentTextareaHeight;
      }
    }
  }, [promptText, isPromptHeightLocked, currentTextareaHeight]);

  const toggleChatPanel = () => setIsChatPanelOpen(!isChatPanelOpen);
  const handlePromptChange = (event) => setPromptText(event.target.value);
  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('anthropicApiKey', newApiKey);
  };

  const handleTogglePromptLock = () => {
    if (textareaRef.current) {
      if (!isPromptHeightLocked) { // About to LOCK
        // Capture the current computed height (which includes clamps) before changing state
        const computedHeight = getComputedStyle(textareaRef.current).height;
        setCurrentTextareaHeight(computedHeight);
      } else { // About to UNLOCK
        // Set to auto to let the useEffect recalculate based on scrollHeight
        // setCurrentTextareaHeight('auto'); // Or do nothing and let useEffect handle it based on new isPromptHeightLocked
      }
    }
    const newLockState = !isPromptHeightLocked;
    setIsPromptHeightLocked(newLockState);
    localStorage.setItem('isPromptHeightLocked', JSON.stringify(newLockState));
    // No direct style manipulation here; useEffect will handle it based on new isPromptHeightLocked and currentTextareaHeight
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

  const getFullEditorMarkdown = () => {
    return editorActionsRef.current?.getMarkdownContent() || '';
  };

  const updateFullEditorMarkdown = (newMarkdown) => {
    editorActionsRef.current?.replaceAllMarkdown(newMarkdown);
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

    const currentEditorContent = getFullEditorMarkdown();
    const contextForAI = `Current Script Content:\n\n${currentEditorContent}\n\nUser Request: ${promptText}`;
    console.log(`Sending to AI for CHAT: "${contextForAI}" with model: ${selectedScriptModel}`);
    
    const result = await callClaudeApi(contextForAI, apiKey, selectedScriptModel, chatSystemPromptText);
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

    const currentEditorContent = getFullEditorMarkdown();
    const contextForAI = `User instruction for revision: ${promptText}\n\nFull script to revise:\n\n${currentEditorContent}`;
    console.log(`Sending to AI for REVISE: model: ${selectedScriptModel}`);

    const result = await callClaudeApi(contextForAI, apiKey, selectedScriptModel, newEditSystemPrompt);
    
    if (result.success && typeof result.script === 'string') {
      updateFullEditorMarkdown(result.script);
      const aiMessage = { sender: 'ai', text: "Script has been revised based on your instruction." };
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
    } else {
      const errorText = `Error revising script: ${result.error || 'Unknown error'}`;
      const aiMessage = { sender: 'ai', text: errorText };
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
      if (result.raw_error) console.error("Raw AI Error (Revise Request):", result.raw_error);
    }
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
            {/* Render EditorComponent with the ref and pass initial value if needed */}
            <EditorComponent ref={editorActionsRef} initialValue={initialMarkdown} />
          </div>

          <button 
            onClick={toggleChatPanel} 
            className={`chat-toggle-button ${isChatPanelOpen ? 'open' : ''}`}
          >
            {isChatPanelOpen ? '<' : '>'}
          </button>
        </div>

        {/* PROMPT INPUT AREA */}
        <div 
            ref={promptInputAreaRef} 
            className="prompt-input-area" 
            style={{
                display: 'flex', 
                alignItems: 'stretch', 
                backgroundColor: 'var(--color-nord0)',
                boxSizing: 'border-box' 
            }}
        >
          {/* Internal wrapper for textarea AND internal controls */}
          <div style={{ flexGrow: 1, position: 'relative', display: 'flex', boxSizing: 'border-box' }} className="prompt-input-internal-wrapper">
            
            {/* CONTAINER FOR TOP RIGHT CONTROLS (Model Selector, Lock, Cog) */}
            <div 
              style={{
                position: 'absolute',
                top: '8px', 
                right: '8px',
                display: 'flex',
                alignItems: 'center', // Align items vertically in the middle of this row
                zIndex: 20, // Above textarea content
                gap: '5px' // Space between controls in this row
              }}
            >
              {/* Model Selector Button - Moved here */}
              <div className="model-selector-button-internal" 
                onClick={() => !isGeneratingScript && setShowModelPicker(!showModelPicker)} 
                title="Click to change LLM model"
                style={{ 
                  padding: '2px 10px',
                  borderRadius: '15px',
                  backgroundColor: 'var(--color-nord2)',
                  color: 'var(--color-nord5)',
                  cursor: 'pointer',
                  fontSize: '0.5em', // From original CSS
                  border: '1px solid var(--color-nord3)', // From original CSS
                  whiteSpace: 'nowrap'
                  // Removed absolute positioning, now a flex item
                }}
              >
                {selectedModelName} {showModelPicker ? '▲' : '▼'}
              </div>
              {/* Dropdown is still absolutely positioned relative to its trigger if needed, or could be portalled */}
              {showModelPicker && ( 
                <div className="model-picker-dropdown-internal" style={{
                    position: 'absolute', 
                    // Adjust positioning relative to the new layout of model selector
                    // This might need to be relative to the whole top-right controls container or the model selector itself
                    // For simplicity, let's try to position it below the entire top-right controls bar or near the model selector
                    top: 'calc(100% + 2px)', // Below the control group
                    left: '0px', // Align with the start of the model selector
                    zIndex: 100, // Above everything
                    background: 'var(--color-nord1)',
                    border: '1px solid var(--color-nord3)',
                    borderRadius: '4px',
                    minWidth: '180px', 
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0px 2px 5px rgba(0,0,0,0.1)'
                }}>
                  {SCRIPT_MODELS.map(model => (
                    <div key={model.id} className={`model-picker-item ${model.id === selectedScriptModel ? 'selected' : ''}`} onClick={() => { setSelectedScriptModel(model.id); setShowModelPicker(false); }} title={model.name}>
                      {model.name}
                    </div>
                  ))}
                </div>
              )}

              {/* LOCK CONTROL - Centered in the new row */}
              <div 
                style={{
                  // position: 'absolute', // No longer absolute within this flex row
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '2px 3px',
                  borderRadius: '15px', 
                  // zIndex: 20, // Not needed if parent has zIndex
                  cursor: 'pointer',
                }}
                onClick={handleTogglePromptLock}
                title={isPromptHeightLocked ? "Height is LOCKED. Click to UNLOCK (auto-expand)" : "Height is UNLOCKED. Click to LOCK"}
              >
                <span style={{ color: 'var(--color-nord1)', fontSize: '4px', lineHeight: '0.8' }}>▲</span>
                {isPromptHeightLocked ? 
                  <LockIcon size={12} color='var(--color-nord1)' shackleColor='var(--color-nord1)'/> : 
                  <UnlockIcon size={12} color='var(--color-nord1)' shackleColor='var(--color-nord1)'/>
                }
                <span style={{ color: 'var(--color-nord1)', fontSize: '4px', lineHeight: '0.8' }}>▼</span>
              </div>

              {/* Settings Cog Button - Moved here */}
              <button className="settings-cog-button-internal" 
                onClick={handleOpenPromptSettings} 
                disabled={isGeneratingScript} 
                title="Edit system prompts..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: 'var(--color-nord1)', // Fallback, SVG fill is primary
                  display: 'flex', // For centering icon if needed
                  alignItems: 'center',
                  justifyContent: 'center'
                  // Removed absolute positioning, now a flex item
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="var(--color-nord1)" /* Changed fill to match text */ viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
              </button>
            </div>
            
            {/* Model selector and cog button - REMOVE OLD ABSOLUTELY POSITIONED ONES */}
            {/* Their zIndex might need to be lower than the new lock control if they overlap */}
            {/* 
            <div className="model-selector-button-internal" style={{
                position: 'absolute', bottom: '8px', left: '25px', zIndex: 2 
            }}>
              {selectedModelName} {showModelPicker ? '▲' : '▼'}
            </div>
            */}
            {/* {showModelPicker && ( ... )} REMOVED - Handled above */}
            {/*
            <button className="settings-cog-button-internal" style={{
                position: 'absolute', bottom: '6px', left: '3px', zIndex: 2 
            }}>
              <svg ...></svg>
            </button>
            */}

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
                paddingRight: '120px', // Increased paddingRight significantly for the group of controls
                paddingTop: '30px', // Increased paddingTop to avoid overlap with top-right controls
                boxSizing: 'border-box',
                overflowY: 'auto',
                border: '1px solid var(--color-nord1)',
              }}
            />
          </div>
          {/* Button Column (Revise, Chat) */}
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px', width: '100px', justifyContent: 'space-between' }}>
            <button className="send-button" onClick={handleEditScriptRequest} disabled={!promptText.trim() || isGeneratingScript || !apiKey.trim()} style={{ marginBottom: '8px' }}>
              Revise
            </button>
            <button className="send-button" onClick={handleChatSend} disabled={!promptText.trim() || isGeneratingScript || !apiKey.trim()} >
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

// Make sure newEditSystemPrompt is defined (as discussed before)
const newEditSystemPrompt = `You are an AI script editing assistant. Your task is to revise the user's provided script based on their specific instruction. IMPORTANT: Your entire response will directly replace the user's current script in the editor. Therefore, you MUST output the COMPLETE script, with the requested revisions integrated, as a single block of valid Markdown. Do NOT output only the changed section. Do NOT output any conversational text, apologies, or explanations before or after the Markdown script. Your response should be ONLY the full, revised Markdown script. The user will provide: 1. Their current full script. 2. An instruction for a revision. Your goal is to apply the revision instruction to the full script and return the new, complete Markdown script. Example: If the user's script is:
---
SCENE 1
INT. COFFEE SHOP - DAY
JOHN sits at a table, looking bored.
---
And the user's instruction is: "Change John to be looking anxious." Your response MUST BE (exactly this Markdown):
---
SCENE 1
INT. COFFEE SHOP - DAY
JOHN sits at a table, looking anxious.
---`;

export default App; 