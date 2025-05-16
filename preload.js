const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded!');

// Securely expose a limited API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Expose an 'invoke' function that mirrors ipcRenderer.invoke
  // This allows calling Main process handlers that return a Promise
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

  // Example for one-way send (Renderer to Main), if needed later
  send: (channel, data) => ipcRenderer.send(channel, data),

  // Example for receiving events from Main (Main to Renderer), if needed later
  on: (channel, func) => {
    const validChannels = ['open-api-key-settings']; // Whitelist channels
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  // Specifically expose channels we intend to use for clarity and potential future validation
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  pingPythonBackend: () => ipcRenderer.invoke('ping-python-backend'),
  generateLlmScript: (data) => ipcRenderer.invoke('llm-generate-script', data),
  saveApiKey: (data) => ipcRenderer.send('save-api-key', data), // send for save, no response needed by UI beyond confirmation
  getApiKey: (serviceName) => ipcRenderer.invoke('get-api-key', serviceName),
  validateApiKey: (data) => ipcRenderer.invoke('validate-api-key', data),
  validateAnthropicApiKey: (args) => ipcRenderer.invoke('validate-anthropic-key', args),
  validateGoogleApiKey: (args) => ipcRenderer.invoke('validate-google-key', args),
  onOpenApiKeySettings: (callback) => ipcRenderer.on('open-api-key-settings', callback)
});

// You can also expose other Node.js modules or utility functions here if needed,
// but do so sparingly and with security in mind.
// For example:
// contextBridge.exposeInMainWorld('nodeAPI', {
//   getPlatform: () => process.platform,
// }); 