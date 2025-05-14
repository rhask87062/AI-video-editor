const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// Determine if running in development or production
const isDev = !app.isPackaged; // Simple check, might need refinement

// Basic function to create the main application window
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js') // We might need a preload script later for secure IPC
    }
  });

  // Load the index.html file into the window.
  // In a real app, this will load our React build.
  if (isDev) {
    // Load from Vite dev server
    mainWindow.loadURL('http://localhost:5173'); // Default Vite port
  } else {
    // Load the built React app
    mainWindow.loadFile(path.join(__dirname, 'dist-react', 'index.html'));
  }

  // Open the DevTools automatically if needed (useful for debugging)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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