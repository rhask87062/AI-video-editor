const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('node:path');
const axios = require('axios'); // Import axios
const Store = require('electron-store'); // Added Store

// Initialize electron-store
// const store = new Store(); // Original
// Try accessing .default if Store is not a constructor directly
const store = new (Store.default || Store)();

// Determine if running in development or production
const isDev = !app.isPackaged; // Simple check, might need refinement

let mainWindow; // Make mainWindow accessible for sending messages

// Basic function to create the main application window
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200, // Increased width for more space
    height: 800, // Increased height
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Recommended for security
      nodeIntegration: false, // Recommended for security (disable Node.js in renderer)
      sandbox: true // Recommended for security, if possible with your app needs
    }
  });

  // Load the index.html file into the window.
  // In a real app, this will load our React build.
  if (isDev) {
    // Load from Vite dev server
    mainWindow.loadURL('http://localhost:5173'); // Default Vite port
    mainWindow.webContents.openDevTools();
  } else {
    // Load the built React app
    mainWindow.loadFile(path.join(__dirname, 'dist-react', 'index.html'));
  }
}

// --- Application Menu --- 
const menuTemplate = [
  { 
    label: 'File',
    submenu: [
      { label: 'New Project', click: () => { /* TODO */ } },
      { label: 'Open Project', click: () => { /* TODO */ } },
      { type: 'separator' },
      { label: 'Save Project', click: () => { /* TODO */ } },
      { label: 'Save Project As...', click: () => { /* TODO */ } },
      { type: 'separator' },
      { label: 'Import Media', click: () => { /* TODO */ } },
      { label: 'Export Video', click: () => { /* TODO */ } },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { role: 'selectAll' }
      // { label: 'Preferences...', click: () => { /* TODO: mainWindow.webContents.send('open-preferences'); */ } }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'API Keys...',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('open-api-key-settings');
          }
        }
      }
      // Add other settings later
    ]
  },
  {
    label: 'Help',
    submenu: [
      { label: 'Learn More', click: async () => { const { shell } = require('electron'); await shell.openExternal('https://electronjs.org') } }
    ]
  }
];

if (process.platform === 'darwin') {
  menuTemplate.unshift({ role: 'appMenu' });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Example IPC handler
  ipcMain.handle('get-app-version', () => {
    console.log('Main process: Received get-app-version request');
    return app.getVersion();
  });

  // New IPC handler to call Python backend
  ipcMain.handle('ping-python-backend', async () => {
    console.log('Main process: Received ping-python-backend request');
    try {
      // Ensure your Python FastAPI server is running on http://127.0.0.1:8000
      const response = await axios.get('http://127.0.0.1:8000/ping');
      console.log('Python response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error calling Python backend:', error.message);
      // Consider sending a more structured error to the renderer
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Python error response data:', error.response.data);
        console.error('Python error response status:', error.response.status);
        return { success: false, error: `Server error: ${error.response.status}`, data: error.response.data };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Python no response:', error.request);
        return { success: false, error: 'No response from Python server. Is it running?' };
      } else {
        // Something happened in setting up the request that triggered an Error
        return { success: false, error: error.message };
      }
    }
  });

  // IPC handler for LLM script generation
  ipcMain.handle('llm-generate-script', async (event, { prompt, modelIdentifier }) => {
    console.log(`Main process: Received llm-generate-script request for model: ${modelIdentifier}`);
    if (!prompt || !modelIdentifier) {
      return { success: false, error: 'Prompt and modelIdentifier are required.' };
    }
    try {
      let apiKey = null;
      if (modelIdentifier.startsWith('claude')) {
        apiKey = store.get('ANTHROPIC_API_KEY');
      } else if (modelIdentifier.startsWith('gpt')) {
        apiKey = store.get('OPENAI_API_KEY'); // Placeholder for future
      } else if (modelIdentifier.startsWith('gemini')) {
        apiKey = store.get('GOOGLE_API_KEY'); // Placeholder for future
      }

      if (!apiKey) {
        console.warn(`API key for ${modelIdentifier} not found in store. Python backend will try environment variables.`);
        // We could optionally return an error here if we want to enforce UI input
        // return { success: false, error: `API key for ${modelIdentifier} not set in settings.` };
      }

      const response = await axios.post('http://127.0.0.1:8000/generate-script', {
        prompt: prompt,
        model_identifier: modelIdentifier,
        api_key: apiKey // Pass the retrieved API key (or null if not found)
      });
      return response.data;
    } catch (error) {
      console.error('Error calling Python /generate-script endpoint:', error.message);
      if (error.response) {
        return { success: false, error: `LLM Server error: ${error.response.status}`, data: error.response.data };
      } else if (error.request) {
        return { success: false, error: 'No response from Python LLM endpoint. Is the Python server running correctly?' };
      } else {
        return { success: false, error: `Error setting up LLM request: ${error.message}` };
      }
    }
  });

  // IPC handlers for API keys
  ipcMain.handle('get-api-key', (event, serviceName) => {
    return store.get(serviceName); // e.g., serviceName = 'ANTHROPIC_API_KEY'
  });
  ipcMain.on('save-api-key', (event, { serviceName, apiKey }) => {
    store.set(serviceName, apiKey);
    console.log(`${serviceName} saved to store.`);
  });

  // IPC handler for API key validation
  ipcMain.handle('validate-api-key', async (event, { serviceName, apiKey }) => {
    console.log(`Main process: Validating API key for ${serviceName}`);
    if (!apiKey) {
      return { success: false, error: 'API key is empty.' };
    }
    try {
      let validationUrl = '';
      if (serviceName === 'ANTHROPIC_API_KEY') {
        validationUrl = 'http://127.0.0.1:8000/validate-anthropic-key';
      } else {
        return { success: false, error: `Validation for ${serviceName} not implemented.` };
      }
      
      const response = await axios.post(validationUrl, { api_key: apiKey });
      return response.data; // Python backend structures this with success/error
    } catch (error) {
      console.error(`Error validating ${serviceName} key:`, error.message);
      if (error.response) {
        return { success: false, error: `Validation server error: ${error.response.status}`, data: error.response.data };
      } else if (error.request) {
        return { success: false, error: 'No response from Python validation endpoint.' };
      } else {
        return { success: false, error: `Error setting up validation request: ${error.message}` };
      }
    }
  });

  createWindow();

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// For example, setup IPC listeners here to communicate with the renderer process (React app). 