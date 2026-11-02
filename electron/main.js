const { app, BrowserWindow, shell, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

// Load config
let config = {
  appUrl: "https://convodeck-one.vercel.app",
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

// ==========================================
// Version & Update Mechanism
// ==========================================
function parseSemVer(v) {
  if (!v) return [0, 0, 0];
  const clean = String(v).trim().replace(/^v/i, "");
  return clean.split(".").map((n) => parseInt(n, 10) || 0);
}

function isNewerVersion(remoteVer, currentVer) {
  const remote = parseSemVer(remoteVer);
  const current = parseSemVer(currentVer);
  const maxLen = Math.max(remote.length, current.length);
  for (let i = 0; i < maxLen; i++) {
    const r = remote[i] || 0;
    const c = current[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

function fetchJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === "http:" ? http : https;
      const req = client.get(
        parsedUrl,
        {
          timeout: timeoutMs,
          headers: {
            "User-Agent": `ConvoDeck-Desktop/${app.getVersion()}`,
            Accept: "application/json",
          },
        },
        (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            res.resume();
            return reject(new Error(`Server returned HTTP ${res.statusCode}`));
          }
          let data = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          });
        }
      );

      req.on("timeout", () => {
        req.destroy(new Error("Request timed out"));
      });
      req.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function checkAppVersion(win, options = { silentIfLatest: true }) {
  const currentVersion = app.getVersion();
  const versionApiUrl = `${config.appUrl.replace(/\/$/, "")}/api/version`;

  try {
    const data = await fetchJson(versionApiUrl);
    if (!data || !data.latestVersion) {
      return { success: false, reason: "Invalid server response" };
    }

    const hasUpdate = isNewerVersion(data.latestVersion, currentVersion);

    if (hasUpdate) {
      // Notify renderer via IPC
      if (win && !win.isDestroyed()) {
        win.webContents.send("app-update-available", {
          currentVersion,
          latestVersion: data.latestVersion,
          downloadUrl: data.downloadUrl,
          releaseNotes: data.releaseNotes,
          mandatory: Boolean(data.mandatory),
        });

        // Format prompt message
        const detailLines = [
          `Current version: v${currentVersion}`,
          `Latest version:  v${data.latestVersion}`,
          "",
          data.releaseNotes ? `${data.releaseNotes}\n` : "",
          "Would you like to open the download page now?",
        ].filter(Boolean);

        const buttons = ["Download Update", "Later"];
        if (data.mandatory) {
          buttons.pop();
        }

        const { response } = await dialog.showMessageBox(win, {
          type: "info",
          title: "Update Available — ConvoDeck",
          message: `A new version of ConvoDeck (v${data.latestVersion}) is available!`,
          detail: detailLines.join("\n"),
          buttons,
          defaultId: 0,
          cancelId: data.mandatory ? 0 : 1,
          noLink: true,
        });

        if (response === 0) {
          const targetUrl = data.downloadUrl || config.appUrl;
          shell.openExternal(targetUrl);
          if (data.mandatory) {
            app.quit();
          }
        }
      }

      return {
        success: true,
        updateAvailable: true,
        currentVersion,
        latestVersion: data.latestVersion,
        downloadUrl: data.downloadUrl,
      };
    } else {
      if (!options.silentIfLatest && win && !win.isDestroyed()) {
        await dialog.showMessageBox(win, {
          type: "info",
          title: "ConvoDeck is Up to Date",
          message: "You're running the latest version!",
          detail: `Version v${currentVersion} is the newest release. No update is required.`,
          buttons: ["OK"],
          defaultId: 0,
        });
      }
      return {
        success: true,
        updateAvailable: false,
        currentVersion,
        latestVersion: data.latestVersion,
      };
    }
  } catch (err) {
    console.warn("Version check notice:", err.message);
    if (!options.silentIfLatest && win && !win.isDestroyed()) {
      await dialog.showMessageBox(win, {
        type: "warning",
        title: "Update Check Failed",
        message: "Could not connect to update server",
        detail: `Failed to verify latest version: ${err.message}. Please verify your internet connection and try again.`,
        buttons: ["OK"],
        defaultId: 0,
      });
    }
    return { success: false, error: err.message };
  }
}

// ==========================================
// Window Creation & Lifecycle
// ==========================================
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

    // Startup Version Check (Non-blocking background check after window is visible)
    setTimeout(() => {
      checkAppVersion(mainWindow, { silentIfLatest: true });
    }, 2500);
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

// ==========================================
// IPC Handlers
// ==========================================
ipcMain.on("retry-connection", () => {
  loadApp();
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("check-for-updates", async () => {
  return await checkAppVersion(mainWindow, { silentIfLatest: false });
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
