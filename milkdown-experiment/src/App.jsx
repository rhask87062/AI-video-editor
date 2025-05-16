import React, { useState, useEffect, useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { history, undoCommand, redoCommand } from '@milkdown/plugin-history';
import { callCommand } from '@milkdown/utils';
import '@milkdown/theme-nord/style.css';

// Basic initial markdown content
const initialMarkdown = '# Milkdown Experiment\n\nHello, Milkdown!\n\n*   Start typing here...\n*   **Bold text**\n*   *Italic text*';

// Reinstating EditorComponent
const EditorComponent = () => {
  const { editor, getInstance } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, initialMarkdown);
      })
      .use(nord)
      .use(commonmark)
      .use(history)
  );

  const handleUndo = () => {
    const editorInstance = getInstance();
    if (editorInstance) {
      editorInstance.action(callCommand(undoCommand.key));
    }
  };

  const handleRedo = () => {
    const editorInstance = getInstance();
    if (editorInstance) {
      editorInstance.action(callCommand(redoCommand.key));
    }
  };

  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleUndo} style={{ marginRight: '5px' }}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
      <Milkdown />
    </>
  );
};

function App() {
  // const [themeMode, setThemeMode] = useState('dark'); // Theme toggle removed for now
  const [promptText, setPromptText] = useState('');
  const textareaRef = useRef(null);

  // useEffect(() => {
  //   document.body.setAttribute('data-theme', themeMode);
  // }, [themeMode]);

  // const toggleTheme = () => {
  //   setThemeMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  // };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [promptText]);

  const handlePromptChange = (event) => {
    setPromptText(event.target.value);
  };

  return (
    <MilkdownProvider>
      <div className="app-layout">
        {/* Header div can be removed or left empty if no header content is needed for the experiment now */}
        {/* <div className="app-header"> */}
          {/* <button onClick={toggleTheme} style={{ marginRight: '10px' }}> */}
          {/*   Switch to {themeMode === 'dark' ? 'Light' : 'Dark'} Mode */}
          {/* </button> */}
          {/* <h1>Milkdown Editor</h1> */}
        {/* </div> */}
        
        <div className="milkdown-editor-wrapper">
          <EditorComponent />
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