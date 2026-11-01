const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  retry: () => ipcRenderer.send("retry-connection"),
  isDesktop: true,
  platform: process.platform,
});
