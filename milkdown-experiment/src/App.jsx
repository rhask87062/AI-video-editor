import React, { useState, useEffect, useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import '@milkdown/theme-nord/style.css';

// Basic initial markdown content
const initialMarkdown = '# Milkdown Experiment\n\nHello, Milkdown!\n\n*   Start typing here...\n*   **Bold text**\n*   *Italic text*';

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

  return (
    <MilkdownProvider>
      <div className="app-layout">
        <div className="app-header">
          {/* Minimal header content, or remove app-header div if truly empty */}
        </div>
        
        <div className="main-content-area">
          {isChatPanelOpen && (
            <div className="chat-panel">
              <p>Chat Panel Content...</p>
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
          <textarea
            ref={textareaRef}
            value={promptText}
            onChange={handlePromptChange}
            placeholder="Enter your AI prompt here..."
            rows={1}
          />
        </div>
      </div>
    </MilkdownProvider>
  );
}

export default App; 