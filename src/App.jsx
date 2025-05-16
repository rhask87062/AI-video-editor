import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm for GitHub Flavored Markdown
// import reactLogo from './assets/react.svg' // Example asset import
// import viteLogo from '/vite.svg' // Example asset import
import './App.css';
// import DevTooltip from './DevTooltip'; // REMOVED DevTooltip import

function App() {
  const [currentView, setCurrentView] = useState('editor'); // 'editor', 'concept', or 'scripting'
  const [isVideoGenVisible, setIsVideoGenVisible] = useState(false);
  const [isAudioGenVisible, setIsAudioGenVisible] = useState(false);
  const [isImagesVisible, setIsImagesVisible] = useState(true); // Default to visible?
  const [isAssetsCollapsed, setIsAssetsCollapsed] = useState(false);
  const [isMoodboardCollapsed, setIsMoodboardCollapsed] = useState(false);
  const [isConceptImageGenVisible, setIsConceptImageGenVisible] = useState(false);
  const [isMoodboardImageGenVisible, setIsMoodboardImageGenVisible] = useState(false);
  const [appVersion, setAppVersion] = useState('N/A');
  const [pythonResponse, setPythonResponse] = useState('N/A'); // New state for Python response
  const [scriptPrompt, setScriptPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [apiKeyValidationStatus, setApiKeyValidationStatus] = useState(''); // For validation message
  const [isKeyValidating, setIsKeyValidating] = useState(false); // For disabling button
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);

  // New state for Google API Key
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [googleApiKeyValidationStatus, setGoogleApiKeyValidationStatus] = useState('');
  const [isGoogleKeyValidating, setIsGoogleKeyValidating] = useState(false);

  // New state for selected script model
  const [selectedScriptModel, setSelectedScriptModel] = useState('claude-3-5-sonnet-20240620');

  // State for custom system prompts and modal visibility
  const [showPromptSettingsModal, setShowPromptSettingsModal] = useState(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState(''); // Single system prompt
  // Temporary state for editing in modal, to be applied on save
  const [editingSystemPrompt, setEditingSystemPrompt] = useState(''); // Single editing state

  // State for custom model picker
  const [showModelPicker, setShowModelPicker] = useState(false);

  const SCRIPT_MODELS = [
    // Updated list of models as per user request
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet' }, 
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' }, // Renamed from v2
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    
    // Google Models (names cleaned)
    { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash' },
  ];

  // Listen for event from main process to open API key settings
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.on) {
      window.electronAPI.on('open-api-key-settings', () => {
        console.log('Renderer: Received open-api-key-settings');
        setApiKeyValidationStatus(''); // Reset validation status when opening
        setGoogleApiKeyValidationStatus(''); // Reset Google validation status too
        setIsKeyValidating(false);
        setIsGoogleKeyValidating(false);
        // Fetch Anthropic Key
        window.electronAPI.getApiKey('ANTHROPIC_API_KEY').then(key => {
          if (key) setAnthropicApiKey(key);
          else setAnthropicApiKey(''); // Clear if no key was stored
        });
        // Fetch Google Key
        window.electronAPI.getApiKey('GOOGLE_API_KEY').then(key => {
          if (key) setGoogleApiKey(key);
          else setGoogleApiKey(''); // Clear if no key was stored
        });
        setShowApiKeySettings(true);
      });
    }
    // Clean up listener if component unmounts, though App usually doesn't
    // return () => { /* ipcRenderer.removeAllListeners(...) if needed, but electronAPI.on is safer */ };
  }, []);

  // Unified handler to validate and save all API keys
  const handleSaveAllApiKeys = async () => {
    let anthropicKeyToSave = anthropicApiKey.trim();
    let googleKeyToSave = googleApiKey.trim();
    let canProceedAnthropic = true;
    let canProceedGoogle = true;

    setIsKeyValidating(true); // Generic validating state for Anthropic section
    setIsGoogleKeyValidating(true); // Generic validating state for Google section
    setApiKeyValidationStatus('');
    setGoogleApiKeyValidationStatus('');

    // Validate Anthropic Key if it's not empty
    if (anthropicKeyToSave) {
      setApiKeyValidationStatus('Validating Anthropic Key...');
      try {
        const anthropicValidation = await window.electronAPI.validateApiKey({ 
          serviceName: 'ANTHROPIC_API_KEY', 
          apiKey: anthropicKeyToSave 
        });
        if (anthropicValidation.success) {
          setApiKeyValidationStatus(anthropicValidation.message || 'Anthropic Key is valid.');
        } else {
          setApiKeyValidationStatus(anthropicValidation.error || 'Invalid Anthropic Key.');
          canProceedAnthropic = false;
        }
      } catch (error) {
        setApiKeyValidationStatus(`Error validating Anthropic Key: ${error.message}`);
        canProceedAnthropic = false;
      }
    } else {
      setApiKeyValidationStatus('Anthropic Key field is empty. No validation performed, will clear if saved.');
    }

    // Validate Google Key if it's not empty
    if (googleKeyToSave) {
      setGoogleApiKeyValidationStatus('Validating Google Key...');
      try {
        const googleValidation = await window.electronAPI.validateGoogleApiKey({ apiKey: googleKeyToSave });
        if (googleValidation.success) {
          setGoogleApiKeyValidationStatus(googleValidation.message || 'Google Key is valid.');
        } else {
          setGoogleApiKeyValidationStatus(googleValidation.error || 'Invalid Google Key.');
          canProceedGoogle = false;
        }
      } catch (error) {
        setGoogleApiKeyValidationStatus(`Error validating Google Key: ${error.message}`);
        canProceedGoogle = false;
      }
    } else {
      setGoogleApiKeyValidationStatus('Google Key field is empty. No validation performed, will clear if saved.');
    }

    let savedAnthropic = false;
    let savedGoogle = false;

    if (canProceedAnthropic && window.electronAPI) {
      window.electronAPI.saveApiKey({ serviceName: 'ANTHROPIC_API_KEY', apiKey: anthropicKeyToSave });
      if(anthropicKeyToSave) setApiKeyValidationStatus('Anthropic Key Saved!');
      else setApiKeyValidationStatus('Anthropic Key cleared.'); 
      savedAnthropic = true;
    }

    if (canProceedGoogle && window.electronAPI) {
      window.electronAPI.saveApiKey({ serviceName: 'GOOGLE_API_KEY', apiKey: googleKeyToSave });
      if(googleKeyToSave) setGoogleApiKeyValidationStatus('Google Key Saved!');
      else setGoogleApiKeyValidationStatus('Google Key cleared.');
      savedGoogle = true;
    }
    
    // Ensure these are always called to re-enable UI elements
    setIsKeyValidating(false);
    setIsGoogleKeyValidating(false);

    // Optionally close modal if both successful or no errors for attempted saves
    // For now, leave it open so user sees status, they can click Cancel/Close.
    // if ((anthropicKeyToSave === '' || (canProceedAnthropic && savedAnthropic)) && 
    //     (googleKeyToSave === '' || (canProceedGoogle && savedGoogle))) {
    //   alert('API Keys processed.'); 
    // }
  };

  // Function to test IPC
  const handleGetAppVersion = async () => {
    if (window.electronAPI) {
      try {
        const version = await window.electronAPI.invoke('get-app-version');
        console.log('Renderer: App version received:', version);
        setAppVersion(version);
      } catch (error) {
        console.error('Error invoking get-app-version:', error);
        setAppVersion('Error');
      }
    } else {
      console.warn('electronAPI is not available on window object. Ensure preload script is working.');
      setAppVersion('Unavailable');
    }
  };

  // New function to test Python backend IPC
  const handlePingPython = async () => {
    if (window.electronAPI) {
      try {
        console.log('Renderer: Sending ping to Python backend...');
        setPythonResponse('Pinging...');
        const result = await window.electronAPI.invoke('ping-python-backend');
        console.log('Renderer: Python backend response:', result);
        if (result.success) {
          setPythonResponse(JSON.stringify(result.data, null, 2));
        } else {
          setPythonResponse(`Error: ${result.error} - Data: ${JSON.stringify(result.data, null, 2) || 'N/A'}`);
        }
      } catch (error) {
        console.error('Error invoking ping-python-backend:', error);
        setPythonResponse('IPC Error');
      }
    } else {
      console.warn('electronAPI is not available on window object.');
      setPythonResponse('IPC Unavailable');
    }
  };

  const handleGenerateScript = async () => {
    if (!scriptPrompt.trim()) {
      alert('Please enter a script prompt.');
      return;
    }
    if (window.electronAPI) {
      setIsGeneratingScript(true);
      setGeneratedScript('Generating script...');
      
      // Use the single custom system prompt if it has content, otherwise null
      const systemPromptToUse = customSystemPrompt.trim() ? customSystemPrompt.trim() : null;

      try {
        const apiKey = selectedScriptModel.startsWith('claude-') ? anthropicApiKey : (selectedScriptModel.startsWith('gemini-') ? googleApiKey : null);
        const result = await window.electronAPI.generateLlmScript({ 
          prompt: scriptPrompt, 
          modelIdentifier: selectedScriptModel,
          apiKey: apiKey, // Pass the relevant API key
          systemPrompt: systemPromptToUse // Pass the determined system prompt
        });
        console.log('Renderer: LLM script response:', result);
        if (result.success && result.data && result.data.script) {
          setGeneratedScript(result.data.script);
        } else {
          let errorMessage = `Error generating script: ${result.error || 'Unknown error'}`;
          if (result.data && result.data.error_type === 'ResourceExhausted' && selectedScriptModel.startsWith('gemini-')) {
            errorMessage += `\n\nThis often means you\'ve exceeded the free tier quota for the selected Gemini model, or the model requires a billing-enabled account. Please check your Google Cloud project quotas and billing status. More info: https://ai.google.dev/gemini-api/docs/rate-limits`;
          }
          if (result.data && result.data.raw_error) {
             errorMessage += `\nDetails: ${JSON.stringify(result.data.raw_error, null, 2)}`;
          } else if (result.data) {
            errorMessage += `\nDetails: ${JSON.stringify(result.data, null, 2)}`;
          }
          setGeneratedScript(errorMessage);
        }
      } catch (error) {
        console.error('Error invoking generateLlmScript:', error);
        setGeneratedScript(`IPC Error: ${error.message}`);
      }
      setIsGeneratingScript(false);
    } else {
      console.warn('electronAPI is not available on window object.');
      setGeneratedScript('IPC Unavailable for LLM script generation.');
    }
  };

  const renderEditorView = () => (
    <>
      <div className="main-content">
        <div className="left-panel">
          <div className="media-bin">
            <div className="section-header-wrapper">
              <h4>Media Bin</h4>
              {/* <DevTooltip note={notes.editorMediaBin}> ... </DevTooltip> */}{/* REMOVED DevTooltip */}
            </div>
            <div className="media-section video-clips-section">
              <button className="generation-toggle-button" onClick={() => setIsVideoGenVisible(!isVideoGenVisible)}>
                {isVideoGenVisible ? '▼' : '►'} Video Generation 
                {/* <DevTooltip note={notes.editorVideoGen}><span className="info-icon mini-info-icon">&#x24D8;</span></DevTooltip> */}{/* REMOVED DevTooltip */}
              </button>
              {isVideoGenVisible && (
                <div className="generation-panel embedded-generation-panel">
                  <p>Video Model Selector Placeholder</p>
                  <p>Prompt Input Placeholder</p>
                  <p>Settings (Seed, Sliders...) Placeholder</p>
                  <button>Generate Video</button>
                </div>
              )}
              <div className="media-section-title-placeholder">Video Clips</div>
            </div>
            <div className="media-section audio-clips-section">
              <button className="generation-toggle-button" onClick={() => setIsAudioGenVisible(!isAudioGenVisible)}>
                 {isAudioGenVisible ? '▼' : '►'} Audio/Music Generation 
                 {/* <DevTooltip note={notes.editorAudioGen}><span className="info-icon mini-info-icon">&#x24D8;</span></DevTooltip> */}{/* REMOVED DevTooltip */}
              </button>
               {isAudioGenVisible && (
                <div className="generation-panel embedded-generation-panel">
                  <p>Audio Model Selector Placeholder</p>
                  <p>Prompt/Input Placeholder</p>
                  <p>Settings Placeholder</p>
                  <button>Generate Audio</button>
                </div>
              )}
              <div className="media-section-title-placeholder">Audio Clips</div>
            </div>
            <div className="media-section images-section">
              <button className="generation-toggle-button" onClick={() => setIsImagesVisible(!isImagesVisible)}>
                {isImagesVisible ? '▼' : '►'} Image Assets 
                {/* <DevTooltip note={notes.editorImageAssets}><span className="info-icon mini-info-icon">&#x24D8;</span></DevTooltip> */}{/* REMOVED DevTooltip */}
              </button>
              {isImagesVisible && (
                <div className="media-content-placeholder">
                  {/* This area will list generated/imported images */}
                  <p><i>Image list placeholder...</i></p>
                  {/* Add Image Gen tools if desired for this specific bin too */}
                  {/* <button className="generation-toggle-button concept-gen-toggle">Image Generation Tools</button> */}
                </div>
              )}
              {!isImagesVisible && <div className="media-section-title-placeholder">Images</div>}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="preview-window">
            <div className="section-header-wrapper">
              {/* Text removed, placeholder provides context */}
              {/* <DevTooltip note={notes.editorPreviewWindow}><span className="info-icon-container"><span className="info-icon">&#x24D8;</span><span className="dev-notes-label">Dev Notes</span></span></DevTooltip> */}{/* REMOVED DevTooltip */} 
            </div>
            Preview Window Placeholder
          </div>
        </div>
      </div>
      <div className="timeline">
        <div className="section-header-wrapper">
          <h5>Timeline</h5>
          {/* <DevTooltip note={notes.editorTimeline}> ... </DevTooltip> */}{/* REMOVED DevTooltip */}
        </div>
        Timeline Placeholder
      </div>
    </>
  );

  const renderConceptView = () => (
    <div className="concept-view-container">
      <div className={`concept-column assets-column ${isAssetsCollapsed ? 'collapsed' : ''}`}>
        {!isAssetsCollapsed && (
          <button className="collapse-button left" onClick={() => setIsAssetsCollapsed(true)}>◀</button>
        )}
        <div className="concept-column-header-wrapper">
          <h3>Image Assets</h3>
          {/* <DevTooltip note={notes.imageAssets}> ... </DevTooltip> */}{/* REMOVED DevTooltip */}
        </div>
        <div className="concept-content">
          <button className="generation-toggle-button concept-gen-toggle" onClick={() => setIsConceptImageGenVisible(!isConceptImageGenVisible)}>
            {isConceptImageGenVisible ? '▼' : '►'} Image Generation Tools
          </button>
          {isConceptImageGenVisible && (
            <div className="generation-panel embedded-generation-panel">
              <p>Image Model Selector</p>
              <p>Prompt Input</p>
              <p>Settings...</p>
              <button>Generate Image</button>
            </div>
          )}
          Generated Images Bin Placeholder
        </div>
      </div>
      {isAssetsCollapsed && (
         <button className="expand-button left" onClick={() => setIsAssetsCollapsed(false)}>▶</button>
      )}
      
      <div className="concept-column storyboard-column">
        <div className="concept-column-header-wrapper">
          <h3>Storyboard/Shot List</h3>
          {/* <DevTooltip note={notes.storyboard}> ... </DevTooltip> */}{/* REMOVED DevTooltip */}
        </div>
        <div className="concept-content">
          Storyboard Area Placeholder - List of Scenes/Shots
          <div className="shot-card-placeholder" style={{ border: '1px solid #555', padding: '10px', margin: '10px 0' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Scene 1 - Shot 1 <button style={{fontSize: '0.7em', marginLeft: '10px'}}>Edit</button> <button style={{fontSize: '0.7em'}}>Gen Img</button></p>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.8em' }}>
              Script Ref: [ Page: <input type="text" size="2" placeholder="#" /> Lines: <input type="text" size="3" placeholder="#-#" /> ]
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ border: '1px dashed #777', width: '150px', height: '100px', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '0.8em'}}>Img Area</div>
              <div style={{ flexGrow: 1 }}>
                <textarea placeholder="Action/Description..." style={{ width: '100%', minHeight: '40px', marginBottom: '5px' }}></textarea>
                <textarea placeholder="Dialogue..." style={{ width: '100%', minHeight: '30px', marginBottom: '5px' }}></textarea>
                <input type="text" placeholder="SFX/Notes..." style={{ width: '100%' }} />
              </div>
            </div>
          </div>
          {/* Add more shot card placeholders or scene placeholders as needed */}
          <p><small>(Drag images from Assets bin here for image area)</small></p>
        </div>
      </div>

      <div className={`concept-column moodboard-column ${isMoodboardCollapsed ? 'collapsed' : ''}`}>
        {!isMoodboardCollapsed && (
          <button className="collapse-button right" onClick={() => setIsMoodboardCollapsed(true)}>▶</button>
        )}
        <div className="concept-column-header-wrapper">
          <h3>Moodboard/References</h3>
          {/* <DevTooltip note={notes.moodboard}> ... </DevTooltip> */}{/* REMOVED DevTooltip */}
        </div>
        <div className="concept-content">
           <button className="generation-toggle-button concept-gen-toggle" onClick={() => setIsMoodboardImageGenVisible(!isMoodboardImageGenVisible)}>
            {isMoodboardImageGenVisible ? '▼' : '►'} Moodboard Image Gen
          </button>
          {isMoodboardImageGenVisible && (
            <div className="generation-panel embedded-generation-panel">
              <p>Image Model Selector</p>
              <p>Prompt Input</p>
              <p>Settings...</p>
              <button>Generate Image</button>
            </div>
          )}
          Moodboard Area Placeholder
        </div>
      </div>
      {isMoodboardCollapsed && (
         <button className="expand-button right" onClick={() => setIsMoodboardCollapsed(false)}>◀</button>
      )}
    </div>
  );

  const renderScriptingView = () => {
    const selectedModelName = SCRIPT_MODELS.find(m => m.id === selectedScriptModel)?.name || 'Select Model';

    return (
      <div className="scripting-view-container">
        <div className="script-generation-area" style={{ margin: '0 0 20px 0', padding: '10px', borderBottom: '1px solid #555' }}>
          
          {/* Prompt Textarea, Gear Icon, and Model Name Display */}
          <div style={{ /*position: 'relative',*/ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}> {/* Removed outer relative positioning as gear is now inside the next div */}
            {/* Container for Textarea, Gear Icon, and Model Name */}
            <div style={{ flexGrow: 1, position: 'relative' }}> 
              {/* Gear Icon Button - Updated to SVG */}
              <button 
                style={{ 
                  position: 'absolute', 
                  bottom: '8px', 
                  left: '110px', 
                  cursor: 'pointer',
                  zIndex: 2, 
                  background: 'transparent', // Transparent background for icon button
                  border: 'none', // No border for icon button
                  padding: '2px', // Minimal padding for the icon
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Ensure consistent height with the other button if needed, e.g., by setting height/width
                  height: '20px', // Match height of other button
                  width: '18px',  // Make it square for an icon
                }}
                title="Edit text generation settings..."
                onClick={handleOpenPromptSettings}
                disabled={isGeneratingScript}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#2a2a2a" stroke="#2a2a2a" strokeWidth="0.5" className="bi bi-gear-fill" viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
              </button>

              <textarea 
                value={scriptPrompt} 
                onChange={(e) => setScriptPrompt(e.target.value)} 
                placeholder="Enter your prompt..."
                rows={6} 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  paddingLeft: '5px', // Reduced padding to bring text closer to left edge, still clears button
                  paddingRight: '5px', // Reduced padding to bring text closer to left edge, still clears button
                  paddingTop: '10px',  // Increased padding top slightly for more space below buttons
                  boxSizing: 'border-box', 
                  resize: 'vertical', 
                  border: '1px solid #444',
                }} 
                disabled={isGeneratingScript}
              />
              {/* Model Name Display / Clickable Area - Refined Styling */}
              <div 
                onClick={() => !isGeneratingScript && setShowModelPicker(!showModelPicker)}
                title="Click to change LLM model"
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  padding: '2px 10px', // Reduced padding for smaller size
                  background: '#2a2a2a',
                  color: '#e0e0e0',
                  borderRadius: '15px', // Increased border-radius for oval shape
                  fontSize: '0.5em',
                  cursor: isGeneratingScript ? 'default' : 'pointer',
                  opacity: isGeneratingScript ? 0.7 : 1,
                  border: '1px solid #404040',
                  zIndex: 2,
                  // minWidth removed to allow width to be content-driven, will tie dropdown width to this.
                  textAlign: 'center',
                  whiteSpace: 'nowrap', // Prevent wrapping in the trigger
                  display: 'inline-block' // Ensure it only takes necessary width
                }}
              >
                {selectedModelName} {showModelPicker ? '▲' : '▼'}
              </div>

              {/* Custom Model Picker Dropdown - Refined Styling */}
              {showModelPicker && (
                <div style={{
                  position: 'absolute',
                  top: '108px',
                  left: '4px',
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  zIndex: 100, 
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0px 5px 10px rgba(0,0,0,0.5)',
                  minWidth: 'max-content',
                }}>
                  {SCRIPT_MODELS.map(model => (
                    <div 
                      key={model.id}
                      onClick={() => {
                        setSelectedScriptModel(model.id);
                        setShowModelPicker(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: model.id === selectedScriptModel ? '#007bff' : 'transparent',
                        color: model.id === selectedScriptModel ? 'white' : '#d0d0d0',
                        borderBottom: '1px solid #333',
                        fontSize: '0.5em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = model.id === selectedScriptModel ? '#0056b3' : '#3a3a3a'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = model.id === selectedScriptModel ? '#007bff' : 'transparent'}
                      title={model.name}
                    >
                      {model.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleGenerateScript} 
            disabled={isGeneratingScript} 
            style={{ 
              padding: '12px 15px', 
              width: '100%',
              fontSize: '1.1em' 
            }}
          >
            {isGeneratingScript ? 'Generating...' : 'Generate Script (via LLM)'}
          </button>
        </div>

        {/* Generated Script Display Area */}
        {generatedScript && (
          <div className="generated-script-display" style={{ marginTop: '0', /* Removed top margin */ borderTop: 'none', /*Removed border if controls are above*/ paddingTop: '0', textAlign: 'left' }}>
            <h4>Generated Script:</h4>
            <div className="markdown-output-area" style={{ backgroundColor: '#222', padding: '10px', borderRadius: '4px', maxHeight: 'calc(100vh - 300px)', /* Adjust max height based on other elements */ overflowY: 'auto' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedScript}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* IPC Test Buttons - can be kept or removed */}
        {/* <div style={{ marginTop: '20px', borderTop: '1px solid #555', paddingTop: '10px', opacity: 0.5 }}>
          <button onClick={handleGetAppVersion}>Get App Version (IPC Test)</button>
          <p style={{fontSize: '0.8em'}}>App Version: {appVersion}</p>
          <button onClick={handlePingPython}>Ping Python Backend (IPC Test)</button>
          <p style={{fontSize: '0.8em'}}>Python Response: <pre style={{fontSize: '0.8em'}}>{pythonResponse}</pre></p>
        </div> */}
      </div>
    );
  };

  const handleOpenPromptSettings = () => {
    // Load current custom prompts into editing state when modal opens
    setEditingSystemPrompt(customSystemPrompt);
    setShowPromptSettingsModal(true);
  };

  const handleSavePromptSettings = () => {
    setCustomSystemPrompt(editingSystemPrompt);
    setShowPromptSettingsModal(false);
  };

  const handleCancelPromptSettings = () => {
    setShowPromptSettingsModal(false);
  };

  const renderPromptSettingsModal = () => (
    <div className="modal-overlay">
      <div className="modal-content prompt-settings-modal" style={{width: '600px', maxHeight: '80vh'}}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Prompt Settings</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="customSystemPromptTextarea" style={{ display: 'block', marginBottom: '5px' }}>Custom System Prompt (for all LLM models):</label>
          <textarea 
            id="customSystemPromptTextarea"
            value={editingSystemPrompt} // Use single editing state
            onChange={(e) => setEditingSystemPrompt(e.target.value)} // Update single editing state
            placeholder="Leave blank to use default system prompt for the selected model. Otherwise, enter your custom instructions here..."
            rows={12} // Made it taller as it's the only one
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {/* Removed Gemini-specific textarea */}

        {/* Placeholder for future settings like tone, genre, top_p, top_k etc. */}
        {/* <p style={{color: '#888', fontSize: '0.9em'}}>Future settings (tone, genre, top_p, top_k) will appear here.</p> */}

        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #555', paddingTop: '15px'}}>
          <button onClick={handleCancelPromptSettings} style={{ padding: '8px 12px'}}>
            Cancel
          </button>
          <button onClick={handleSavePromptSettings} style={{ padding: '8px 12px'}}>
            Save Prompt Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderApiKeySettings = () => (
    <div className="modal-overlay">
      <div className="modal-content api-key-settings">
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>API Key Settings</h3>

        {/* Anthropic API Key Input */}
        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="anthropicApiKeyInput" style={{ display: 'block', marginBottom: '5px' }}>Anthropic API Key:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type={showAnthropicKey ? 'text' : 'password'} 
              id="anthropicApiKeyInput" 
              value={anthropicApiKey}
              onChange={(e) => setAnthropicApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ width: '100%', flexGrow: 1, padding: '8px', marginRight: '10px' }} // Added padding and margin
              disabled={isKeyValidating || isGoogleKeyValidating} // Disable if any validation is running
            />
            <button 
              onClick={() => setShowAnthropicKey(!showAnthropicKey)} 
              style={{ padding: '8px'}} // Standardized padding
              disabled={isKeyValidating || isGoogleKeyValidating}
            >
              {showAnthropicKey ? 'Hide' : 'Show'}
            </button>
          </div>
          {apiKeyValidationStatus && (
            <p style={{
                marginTop: '10px',
                color: apiKeyValidationStatus.includes('Invalid') || apiKeyValidationStatus.includes('Error') ? '#ff6b6b' : '#66bb6a',
                fontSize: '0.9em'
            }}>
                {apiKeyValidationStatus}
            </p>
          )}
        </div>

        {/* Google API Key Input */}
        <div style={{ marginBottom: '25px' }}>
            <label htmlFor="googleApiKeyInput" style={{ display: 'block', marginBottom: '5px' }}>Google API Key (for Gemini Models):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
                type={showGoogleKey ? 'text' : 'password'}
                id="googleApiKeyInput"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="Enter your Google API Key"
                style={{ flexGrow: 1, padding: '8px', marginRight: '10px' }}
                disabled={isGoogleKeyValidating}
            />
            <button onClick={() => setShowGoogleKey(!showGoogleKey)} style={{padding: '8px'}} disabled={isGoogleKeyValidating}>
                {showGoogleKey ? 'Hide' : 'Show'}
            </button>
            </div>
            {googleApiKeyValidationStatus && (
            <p style={{
                marginTop: '10px',
                color: googleApiKeyValidationStatus.includes('Invalid') || googleApiKeyValidationStatus.includes('Error') || googleApiKeyValidationStatus.includes('blocked') || googleApiKeyValidationStatus.includes('IPC Error') || googleApiKeyValidationStatus.includes('unexpected error') ? '#ff6b6b' : '#66bb6a',
                fontSize: '0.9em'
            }}>
                {googleApiKeyValidationStatus}
            </p>
            )}
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #555', paddingTop: '15px'}}>
          <button onClick={() => { setShowApiKeySettings(false); setApiKeyValidationStatus(''); setGoogleApiKeyValidationStatus(''); }} disabled={isKeyValidating || isGoogleKeyValidating} style={{ padding: '8px 12px'}}>
            Cancel
          </button>
          <button onClick={handleSaveAllApiKeys} disabled={isKeyValidating || isGoogleKeyValidating} style={{ padding: '8px 12px'}}>
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="toolbar">
        <span style={{marginRight: 'auto'}}>Toolbar Placeholder (File, Edit, etc.)</span>
        
        {/* <DevTooltip note={notes.toolbar}> ... </DevTooltip> */}{/* REMOVED DevTooltip */}
        
        <div className="view-switcher">
          <button onClick={() => setCurrentView('scripting')} 
            style={{
              // Apply styles based on active state
              color: currentView === 'scripting' ? '#ff9800' : '#333', // Orange text for active, dark gray for inactive
              background: currentView === 'scripting' ? '#ffffff' : '#f0f0f0', // Almost white for active, pale gray for inactive
              fontWeight: 'normal', // Consistent font weight
              border: '1px solid #ccc', // Consistent border
              borderRadius: '4px', // Consistent border radius
              padding: '5px 10px', // Consistent padding
              boxShadow: 'none', // Explicitly remove bevel
              cursor: 'pointer', // Ensure cursor indicates interactivity
            }}
          >
            Scripting
          </button>
          <button onClick={() => setCurrentView('concept')} 
             style={{
               // Apply styles based on active state
              color: currentView === 'concept' ? '#ff9800' : '#333', // Orange text for active, dark gray for inactive
              background: currentView === 'concept' ? '#ffffff' : '#f0f0f0', // Almost white for active, pale gray for inactive
              fontWeight: 'normal', // Consistent font weight
              border: '1px solid #ccc', // Consistent border
              borderRadius: '4px', // Consistent border radius
              padding: '5px 10px', // Consistent padding
              boxShadow: 'none', // Explicitly remove bevel
              cursor: 'pointer', // Ensure cursor indicates interactivity
            }}
          >
            Concept
          </button>
          <button onClick={() => setCurrentView('editor')} 
             style={{
               // Apply styles based on active state
              color: currentView === 'editor' ? '#ff9800' : '#333', // Orange text for active, dark gray for inactive
              background: currentView === 'editor' ? '#ffffff' : '#f0f0f0', // Almost white for active, pale gray for inactive
              fontWeight: 'normal', // Consistent font weight
              border: '1px solid #ccc', // Consistent border
              borderRadius: '4px', // Consistent border radius
              padding: '5px 10px', // Consistent padding
              boxShadow: 'none', // Explicitly remove bevel
              cursor: 'pointer', // Ensure cursor indicates interactivity
            }}
          >
            Editor
          </button>
        </div>
      </div>
      
      {currentView === 'editor' && renderEditorView()}
      {currentView === 'concept' && renderConceptView()}
      {currentView === 'scripting' && renderScriptingView()}
      {showApiKeySettings && renderApiKeySettings()}
      {showPromptSettingsModal && renderPromptSettingsModal()}
    </div>
  );
}

export default App; 