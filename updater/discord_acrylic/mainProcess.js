const electron = require("electron");
const electronCache = require.cache[require.resolve("electron")];

console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Injected into main process.`);

const inject = "DiscordNative.nativeModules.requireModule('discord_acrylic')";

let mainWindow = null;

const { BrowserWindow, ipcMain  } = electron;
const electronProxy = new Proxy(electron, {
  get(target, prop) {
    if (!(prop === "BrowserWindow")) {
      return target[prop];
    }

    return class extends BrowserWindow {
      constructor(opts) {
        console.log(opts)
        const window = new BrowserWindow(opts);

        // In case Canary or PTB add themselves to the name later
        if (window.title.startsWith("Discord")) {
            mainWindow = window;
            console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Injecting into renderer process.`);
            window.webContents.on("dom-ready", () => window.webContents.executeJavaScript(inject));
        }

        return window;
      }
    };
  },
});

delete electronCache.exports;
electronCache.exports = electronProxy;

const ewc = require('./ewc');

const toHex = (v) => {
    return Math.floor(((v / 100) * 255)).toString(16).padStart(2, "0");
}

const updateWindowColor = (color, opacity) => {
    mainWindow.setBackgroundColor(`#${toHex(opacity)}${color}`)
}

const updateWindowShadow = (shadow) => {
    mainWindow.setHasShadow(shadow);
}

ipcMain.on('enableAcrylic', (event, settings) => {
    try {
        
        updateWindowColor(settings.color, settings.opacity);
        updateWindowShadow(settings.shadow);

        switch(settings.blurType) {
            case 0:
                ewc.setAcrylic(mainWindow);
                break;
            case 1:
                ewc.setBlurBehind(mainWindow);
                break;
            default:
                ewc.setTransparentGradient(mainWindow);
                break;
        }

        event.reply('enableAcrylic');
    } catch (exception) {
        event.reply('enableAcrylic', exception);
    }
});

ipcMain.on('disableAcrylic', (event) => {
    try {

        updateWindowShadow(true);
        ewc.disable(mainWindow);

        event.reply('disableAcrylic');

    } catch (exception) {
        event.reply('disableAcrylic', exception);
    }
});

ipcMain.once('injectSuccess', () => {
    console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Successfully injected.`);
});