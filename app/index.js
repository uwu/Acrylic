const electron = require("electron");
const path = require("path");
const fs = require("fs");

const vibe = require("./vibe.node");

let mainWindow = null;

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
      let srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);

      entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

vibe.setup(electron.app);

console.log("[Acrylic] Setting up the vibe 💫");

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
//#endregion

const electronCache = require.cache[require.resolve("electron")];

//#region CSP Removal
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

  // Prevents other mods from removing CSP
  electronCache.exports.session.defaultSession.webRequest.onHeadersReceived =
    () => {
      console.log("[RawDog] Prevented CSP from being modified...");
    };
});
//#endregion

const { BrowserWindow } = electron;
const propertyNames = Object.getOwnPropertyNames(electronCache.exports);

delete electronCache.exports;
// Make a new electron that will use the new 'BrowserWindow'
const newElectron = {}
for (const propertyName of propertyNames) {
  Object.defineProperty(newElectron, propertyName, {
    ...Object.getOwnPropertyDescriptor(electron, propertyName),
    get: () => propertyName === "BrowserWindow" ? class extends BrowserWindow {
      constructor(opts) {

        if(opts.resizable) {
          opts.frame = true;
        }

        const window = new BrowserWindow(opts);

        if(window.resizable && !mainWindow) {
          console.log("[Acrylic] Found Discord window.");

          mainWindow = window;

          window.webContents.on("dom-ready", () => {
            window.setBackgroundColor("#00000000");
            vibe.setDarkMode(window);
            window.webContents.executeJavaScript(`DiscordNative.nativeModules.requireModule("discord_acrylic");`);
          });
        }

        return window;
      }
    } : electron[propertyName]
  })
}

electronCache.exports = newElectron;
//#endregion

module.exports = require(originalAppPath);

function loadCss() {
  return fs.readFileSync(path.join(basePath, "app", "theme.css"), "utf8");
}

function removeCss(window) {
  window.webContents.executeJavaScript(`document.getElementById("acrylic")?.remove?.();`);
}

function injectCss(window, css, id = "acrylic") {
  window.webContents.executeJavaScript(`document.body.insertAdjacentHTML("beforeend", \`<style id="${id}">${css}</style>\`);`);
}

electron.ipcMain.handle("isMainProcessAlive", () => {
  console.log("[Acrylic] Injected into render process.");
  injectCss(mainWindow, ".titleBar-1it3bQ { display: none; }", "acrylic-titlebar-remove");
  return true;
});

electron.ipcMain.on("css-enable", () => {
  console.log("injecting css");
  injectCss(mainWindow, loadCss());
});

electron.ipcMain.on("css-disable", () => {
  console.log("removing css");
  removeCss(mainWindow);
});

electron.ipcMain.on("css-reload", () => {
  console.log("reloading css");
  removeCss(mainWindow);
  injectCss(mainWindow, loadCss());
});

electron.ipcMain.on("enable", () => {
  console.log("enabling acrylic");
  vibe.applyEffect(mainWindow, "acrylic");
});

electron.ipcMain.on("disable", () => {
  console.log("disabling acrylic");
  vibe.clearEffects(mainWindow);
});