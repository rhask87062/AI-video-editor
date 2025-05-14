import React, { useState, useEffect } from 'react';
// import reactLogo from './assets/react.svg' // Example asset import
// import viteLogo from '/vite.svg' // Example asset import
import './App.css';
import DevTooltip from './DevTooltip'; // Import the new component

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

  const notes = {
    imageAssets: "Left sidebar (Concept View) for generating and managing image assets for storyboarding. Supports dragging to storyboard. Future: Filter/search assets.",
    storyboard: "Central area (Concept View) for arranging shot cards. Each card will have an image, script ref, action, dialogue, SFX. Future: Reorder scenes/shots, AI-fill from script.",
    moodboard: "Right sidebar (Concept View) for visual inspiration and references. Supports image generation. Future: Organize into collections, add notes to images.",
    // Editor View Notes
    editorMediaBin: "Media Bin (Editor View): Organizes all project assets. Video, Audio, and Image sections with respective generation/import tools. Future: Folder structure, tagging, metadata display.",
    editorVideoGen: "Video Generation (Editor Media Bin): Tools for AI video clip generation. Future: Multiple models, advanced controls, direct import to timeline.",
    editorAudioGen: "Audio/Music Generation (Editor Media Bin): Tools for AI audio effects and music tracks. Future: Speech synthesis, sound effect libraries, music style controls.",
    editorImageAssets: "Image Assets (Editor Media Bin): For importing or generating overlay images like logos, banners, titles with transparency. Future: Basic image editing (crop, resize).", 
    editorPreviewWindow: "Preview Window (Editor View): Displays the current state of the timeline. Future: Playback controls, resolution/quality settings, full-screen mode.",
    editorTimeline: "Timeline (Editor View): Main editing interface. Arrange video, audio, image tracks. Future: Multi-track support, trimming, splitting, transitions, effects, keyframing.",
    // Scripting View Notes
    scriptingEditor: "Main text editor (Scripting View) for writing and refining scripts. Future: AI co-writing (suggestions, summarization, plot points), rich text formatting, revision history, scene detection.",
    // Toolbar Note
    toolbar: "Main application toolbar. Will contain File (New, Open, Save, Import, Export), Edit (Undo, Redo, Preferences), View (Toggle Panels, Zoom), Window, and Help menus. Functionality will be added incrementally."
  };

  const renderEditorView = () => (
    <>
      <div className="main-content">
        <div className="left-panel">
          <div className="media-bin">
            <div className="section-header-wrapper">
              <h4>Media Bin</h4>
              <DevTooltip note={notes.editorMediaBin}>
                <span className="info-icon-container">
                  <span className="info-icon">&#x24D8;</span>
                  <span className="dev-notes-label">Dev Notes</span>
                </span>
              </DevTooltip>
            </div>
            <div className="media-section video-clips-section">
              <button className="generation-toggle-button" onClick={() => setIsVideoGenVisible(!isVideoGenVisible)}>
                {isVideoGenVisible ? '▼' : '►'} Video Generation 
                <DevTooltip note={notes.editorVideoGen}><span className="info-icon mini-info-icon">&#x24D8;</span></DevTooltip>
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
                 <DevTooltip note={notes.editorAudioGen}><span className="info-icon mini-info-icon">&#x24D8;</span></DevTooltip>
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
                <DevTooltip note={notes.editorImageAssets}><span className="info-icon mini-info-icon">&#x24D8;</span></DevTooltip>
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
              <DevTooltip note={notes.editorPreviewWindow}><span className="info-icon-container"><span className="info-icon">&#x24D8;</span><span className="dev-notes-label">Dev Notes</span></span></DevTooltip> 
            </div>
            Preview Window Placeholder
          </div>
        </div>
      </div>
      <div className="timeline">
        <div className="section-header-wrapper">
          <h5>Timeline</h5>
          <DevTooltip note={notes.editorTimeline}>
            <span className="info-icon-container">
              <span className="info-icon">&#x24D8;</span>
              <span className="dev-notes-label">Dev Notes</span>
            </span>
          </DevTooltip>
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
          <DevTooltip note={notes.imageAssets}>
            <span className="info-icon-container">
              <span className="info-icon">&#x24D8;</span>
              <span className="dev-notes-label">Dev Notes</span>
            </span>
          </DevTooltip>
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
          <DevTooltip note={notes.storyboard}>
            <span className="info-icon-container">
              <span className="info-icon">&#x24D8;</span>
              <span className="dev-notes-label">Dev Notes</span>
            </span>
          </DevTooltip>
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
          <DevTooltip note={notes.moodboard}>
            <span className="info-icon-container">
              <span className="info-icon">&#x24D8;</span>
              <span className="dev-notes-label">Dev Notes</span>
            </span>
          </DevTooltip>
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

  const renderScriptingView = () => (
    <div className="scripting-view-container">
      <div className="section-header-wrapper">
        <h2>Scripting & Notes View</h2>
        <DevTooltip note={notes.scriptingEditor}><span className="info-icon-container"><span className="info-icon">&#x24D8;</span><span className="dev-notes-label">Dev Notes</span></span></DevTooltip>
      </div>
      <p>Collaborative AI text editor placeholder (like a canvas).</p>
      
      <div style={{ marginTop: '20px', borderTop: '1px solid #555', paddingTop: '10px' }}>
        <button onClick={handleGetAppVersion}>Get App Version (IPC Test)</button>
        <p>App Version: {appVersion}</p>
      </div>

      {/* Test Python IPC Button */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #555', paddingTop: '10px' }}>
        <button onClick={handlePingPython}>Ping Python Backend (IPC Test)</button>
        <p>Python Response: <pre>{pythonResponse}</pre></p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="toolbar">
        <span style={{marginRight: 'auto'}}>Toolbar Placeholder (File, Edit, etc.)</span>
        
        <DevTooltip note={notes.toolbar}>
          <span className="info-icon-container">
             <span className="info-icon">&#x24D8;</span>
             <span className="dev-notes-label">Dev Notes</span>
          </span>
        </DevTooltip>
        
        <div className="view-switcher">
          <button onClick={() => setCurrentView('scripting')} disabled={currentView === 'scripting'}>
            Scripting
          </button>
          <button onClick={() => setCurrentView('concept')} disabled={currentView === 'concept'}>
            Concept
          </button>
          <button onClick={() => setCurrentView('editor')} disabled={currentView === 'editor'}>
            Editor
          </button>
        </div>
      </div>
      
      {currentView === 'editor' && renderEditorView()}
      {currentView === 'concept' && renderConceptView()}
      {currentView === 'scripting' && renderScriptingView()}
    </div>
  );
}

export default App; 