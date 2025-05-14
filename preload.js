const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded!');

// Securely expose a limited API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Expose an 'invoke' function that mirrors ipcRenderer.invoke
  // This allows calling Main process handlers that return a Promise
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

  // Example for one-way send (Renderer to Main), if needed later
  // send: (channel, data) => ipcRenderer.send(channel, data),

  // Example for receiving events from Main (Main to Renderer), if needed later
  // on: (channel, func) => {
  //   // Deliberately strip event sender from being exposed to renderer
  //   ipcRenderer.on(channel, (event, ...args) => func(...args));
  // }
  // TODO: Later, specifically expose channels like 'llm-generate-script' if we want stricter channel validation here.
});

// You can also expose other Node.js modules or utility functions here if needed,
// but do so sparingly and with security in mind.
// For example:
// contextBridge.exposeInMainWorld('nodeAPI', {
//   getPlatform: () => process.platform,
// }); 