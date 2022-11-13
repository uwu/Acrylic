const electron = require("electron");
const path = require("path");
const fs = require("fs");

var vibe = null;
var cssEditor = null;
var mainWindow = null;

if (process.platform === "win32") {
  vibe = require("./vibe.node");
  vibe.setup(electron.app);
  console.log("[Acrylic] Setting up the vibe~");
} else {
  console.log("[Acrylic] Not getting the right vibes...");
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? copyDir(srcPath, destPath)
      : fs.copyFileSync(srcPath, destPath);
  }
}

const basePath = path.join(path.dirname(require.main.filename), "..");

if (process.platform != "darwin") {
  const modulesPath = path.join(basePath, "..", "modules");
  const corePath = fs
    .readdirSync(modulesPath)
    .find((folder) => folder.includes("discord_desktop_core-"));
  const acrylicPath = path.join(modulesPath, corePath, "discord_acrylic");

  if (fs.existsSync(acrylicPath)) {
    fs.rmdirSync(acrylicPath, { recursive: true });
  }
  copyDir(path.join(basePath, "app", "discord_acrylic"), acrylicPath);
} else {
  const os = require("os");

  const homePath = os.homedir();

  const hostBasePath = path.join(
    homePath,
    "Library/Application Support/discord"
  );
  const modulesPath = path.join(
    hostBasePath,
    fs
      .readdirSync(hostBasePath)
      .find((folder) => folder.split(".").length == 3),
    "modules"
  );
  const acrylicPath = path.join(modulesPath, "discord_acrylic");

  if (fs.existsSync(acrylicPath)) {
    fs.rmdirSync(acrylicPath, { recursive: true });
  }
  copyDir(path.join(basePath, "app", "discord_acrylic"), acrylicPath);
}

let originalAppPath = path.join(basePath, "original.asar");

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
const newElectron = {};
for (const propertyName of propertyNames) {
  Object.defineProperty(newElectron, propertyName, {
    ...Object.getOwnPropertyDescriptor(electron, propertyName),
    get: () =>
      propertyName === "BrowserWindow"
        ? class extends BrowserWindow {
            constructor(opts) {
              if (opts.resizable && process.platform == "win32") {
                if (vibe.platform.isWin11()) {
                  opts.frame = true;
                }
              }

              opts.webPreferences.devTools = true;

              const window = new BrowserWindow(opts);

              if (window.resizable && !mainWindow) {
                console.log("[Acrylic] Found Discord window.");

                mainWindow = window;

                window.webContents.on("dom-ready", () => {
                  if (process.platform == "win32") {
                    window.setBackgroundColor("#00000000");
                    vibe.forceTheme(window, "dark");
                  }

                  window.webContents.executeJavaScript(
                    `DiscordNative.nativeModules.requireModule("discord_acrylic");`
                  );
                });
              }

              return window;
            }
          }
        : electron[propertyName],
  });
}

electronCache.exports = newElectron;
//#endregion

module.exports = require(originalAppPath);

function loadCss() {
  return fs.readFileSync(path.join(basePath, "app", "theme.css"), "utf8");
}

function saveCss(css) {
  return fs.writeFileSync(path.join(basePath, "app", "theme.css"), css);
}

function removeCss(window) {
  window.webContents.executeJavaScript(
    `document.getElementById("acrylic")?.remove?.();`
  );
}

function injectCss(window, css, id = "acrylic") {
  window.webContents.executeJavaScript(
    `document.body.insertAdjacentHTML("beforeend", \`<style id="${id}">${css}</style>\`);`
  );
}

electron.ipcMain.handle("isMainProcessAlive", () => {
  console.log("[Acrylic] Injected into render process.");
  if (vibe.platform.isWin11()) {
    injectCss(
      mainWindow,
      ".titleBar-1it3bQ { display: none; }",
      "acrylic-titlebar-remove"
    );
  }
  return true;
});

electron.ipcMain.on("open-css", () => {
  if (!cssEditor) {
    cssEditor = new BrowserWindow({
      width: 1000,
      height: 800,
      autoHideMenuBar: true,
      backgroundColor: "#1e1e1e",
      webPreferences: {
        preload: path.join(
          path.join(basePath, "app", "css_editor", "preload.js")
        ),
      },
    });

    if (process.platform == "win32") {
      vibe.forceTheme(cssEditor, "dark");
    }

    cssEditor.setIcon(path.join(basePath, "app", "css_editor", "favicon.png"));
    cssEditor.loadFile(path.join(basePath, "app", "css_editor", "index.html"));
    cssEditor.on("closed", () => {
      cssEditor = null;
    });
  } else {
    cssEditor.focus();
  }
});

electron.ipcMain.on("get-css", (event) => {
  event.returnValue = loadCss();
});

electron.ipcMain.on("save-css", (_, css) => {
  saveCss(css);
});

electron.ipcMain.on("css-enable", () => {
  console.log("[Acrylic] Injecting CSS.");
  injectCss(mainWindow, loadCss());
});

electron.ipcMain.on("css-disable", () => {
  console.log("[Acrylic] Removing CSS.");
  removeCss(mainWindow);
});

electron.ipcMain.on("css-reload", () => {
  console.log("[Acrylic] Reloading CSS.");
  removeCss(mainWindow);
  injectCss(mainWindow, loadCss());
});

const types = ["mica", "acrylic", "blurbehind"];

electron.ipcMain.on("enable", (_, type) => {
  console.log("[Acrylic] Enabling Acrylic.");
  if ((type == 0 && !vibe.platform.isWin11()) || type === undefined) {
    type = 1;
  }
  console.log("[Acrylic] Type: " + types[type]);
  vibe?.applyEffect?.(mainWindow, types[type]);
});

electron.ipcMain.on("disable", () => {
  console.log("[Acrylic] Disabling Acrylic.");
  vibe?.clearEffects?.(mainWindow);
});
