const electron = require("electron");
const path = require("path");
const fs = require("fs");

const vibe = require("./vibe.node");

let mainWindow = null;

if (process.platform != 'win32') {
  console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Unsupported OS`);
  const options = {
      type: 'warning',
      buttons: ['Continue', 'Close Discord'],
      defaultId: 0,
      title: 'Warning',
      message: 'Acrylic only supports Windows 10 or newer! If you continue, Acrylic will not be injected.',
      detail: `Please consider uninstalling.`
  };

  if (electron.dialog.showMessageBoxSync(null, options)) process.exit();
  else return;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
      let srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);

      entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

electron.nativeTheme.themeSource = 'dark';
vibe.setup(electron.app);

console.log("[Acrylic] Setting up vibe.");

const basePath = path.join(path.dirname(require.main.filename), "..");
const modulesPath = path.join(basePath, "..", "modules");
const corePath = fs.readdirSync(modulesPath).find(folder => folder.includes('discord_desktop_core-'));
const acrylicPath = path.join(modulesPath, corePath, 'discord_acrylic');

fs.rmdirSync(acrylicPath, { recursive: true });
copyDir(path.join(basePath, "app", "discord_acrylic"), acrylicPath);

let originalAppPath = path.join(basePath, "app.asar");

const originalPackage = require(path.resolve(
  path.join(originalAppPath, "package.json")
));

require.main.filename = path.join(originalAppPath, originalPackage.main);

electron.app.setAppPath(originalAppPath);
electron.app.name = originalPackage.name;

electron.app.on("ready", () => {
  // Removes CSP
  electron.session.defaultSession.webRequest.onHeadersReceived(
    ({ responseHeaders }, done) => {
      const cspHeaders = Object.keys(responseHeaders).filter((name) =>
        name.toLowerCase().startsWith("content-security-policy")
      );

      for (const header of cspHeaders) {
        delete responseHeaders[header];
      }

      done({ responseHeaders });
    }
  );
});

electron.app.on('browser-window-created', (event, window) => {
  window.on("show", () => {
    window.setBackgroundColor("#00000000");
  });
  if(window.title.startsWith("Discord") && !mainWindow) {
    console.log("[Acrylic] Found Discord window.");
    mainWindow = window;
    window.webContents.on("dom-ready", () => {
      window.webContents.executeJavaScript(`DiscordNative.nativeModules.requireModule("discord_acrylic");`);
    });
  }
});

module.exports = require(originalAppPath);


function removeCss(window) {
  window.webContents.executeJavaScript(`document.getElementById("acrylic")?.remove?.();`);
}

function injectCss(window) {
  const css = fs.readFileSync(path.join(basePath, "app", "theme.css"), "utf8");
  window.webContents.executeJavaScript(`document.body.insertAdjacentHTML("beforeend", \`<style id="acrylic">${css}</style>\`);`);
}

electron.ipcMain.handle("isMainProcessAlive", () => {
  console.log("[Acrylic] Injected into render process.");
  return true;
});

electron.ipcMain.on("css-enable", () => {
  injectCss(mainWindow);
});

electron.ipcMain.on("css-disable", () => {
  removeCss(mainWindow);
});

electron.ipcMain.on("css-reload", () => {
  removeCss(mainWindow);
  injectCss(mainWindow);
});

electron.ipcMain.on("enable", () => {
  vibe.applyEffect(mainWindow, "acrylic");
});

electron.ipcMain.on("disable", () => {
  vibe.clearEffects(mainWindow);
});