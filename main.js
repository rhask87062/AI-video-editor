const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const axios = require('axios'); // Import axios

// Determine if running in development or production
const isDev = !app.isPackaged; // Simple check, might need refinement

// Basic function to create the main application window
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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