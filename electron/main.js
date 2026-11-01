const { app, BrowserWindow, shell, ipcMain, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

// Load config
let config = {
  appUrl: "https://convodeck.vercel.app",
  appName: "ConvoDeck",
};

const configPath = path.join(__dirname, "config.json");
if (fs.existsSync(configPath)) {
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    config = { ...config, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Failed to parse config.json:", err);
  }
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: config.appName,
    backgroundColor: "#090d16",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true,
    },
  });

  // Remove default menu for a clean SaaS app look
  Menu.setApplicationMenu(null);

  // Show window smoothly when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Load the Vercel deployed application
  loadApp();

  // Fail load handler (Offline / Network error)
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      // Ignore subframe failures or user aborts (errorCode -3)
      if (errorCode === -3) return;

      console.warn(`Page load failed [${errorCode}]: ${errorDescription} on ${validatedURL}`);
      mainWindow.loadFile(path.join(__dirname, "offline.html"));
    }
  );

  // External link handler (open outside links in default browser)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If it's the app's own domain or oauth, allow inside
    const appDomain = new URL(config.appUrl).hostname;
    try {
      const targetDomain = new URL(url).hostname;
      if (targetDomain === appDomain || targetDomain.endsWith("." + appDomain)) {
        return { action: "allow" };
      }
    } catch {
      // invalid URL, open externally
    }

    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function loadApp() {
  if (!mainWindow) return;
  mainWindow.loadURL(config.appUrl).catch((err) => {
    console.error("loadURL error:", err);
    mainWindow.loadFile(path.join(__dirname, "offline.html"));
  });
}

// Handle retry IPC from offline screen
ipcMain.on("retry-connection", () => {
  loadApp();
});

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
