const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.invoke(channel, data),
  handle: (channel, callable) => ipcRenderer.on(channel, (event, data) => callable(event, data)),
  removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
});