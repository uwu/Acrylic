const electron = require("electron");
const electronCache = require.cache[require.resolve("electron")];

console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Injected into main process.`);

if (process.platform == 'darwin') {
    console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `MacOS cannot be supported. Discord forces nodeIntegration to be disabled.`);
    console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `See "https://gist.github.com/kevinsawicki/9d05fabdee32105367969bbca259ab3e#gistcomment-3602972".`);
    const options = {
        type: 'warning',
        buttons: ['Continue', 'Close Discord'],
        defaultId: 0,
        title: 'Warning',
        message: `Acrylic cannot, and never will, work on MacOS due to Discord's electron fork disabling some required features.`,
        detail: `If you continue, Discord will load normally and Acrylic won't be injected.\nPlease uninstall Acrylic to avoid seeing this message again.`
    };

    if (electron.dialog.showMessageBoxSync(null, options)) process.exit();
    else return;
}

const inject = "DiscordNative.nativeModules.requireModule('discord_acrylic')";

let mainWindow = null;

let settings = { transparent: false};
try {
    settings = require("fs").readFileSync("../settings.json");
} catch {}

let shouldBeTransparent = (process.platform != "win32") || settings.transparent;

const { BrowserWindow, ipcMain } = electron;
const electronProxy = new Proxy(electron, { get(target, prop) {

    if (prop !== "BrowserWindow") {
      return target[prop];
    }

    return class extends BrowserWindow {
        constructor(opts) {
            if(shouldBeTransparent) opts.transparent = true;
            const window = new BrowserWindow(opts);

            // In case Canary or PTB add themselves to the name later
            if (window.title.startsWith("Discord")) {
                console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Injecting into renderer process.`);
                window.webContents.on("dom-ready", () => {
                    window.webContents.executeJavaScript(inject)
                });
            }

            return window;
        }
    };
}});

delete electronCache.exports;
electronCache.exports = electronProxy;

if(process.platform == "win32"){
    const ewc = require('../ewc');
    global.ewc = ewc;
}


const toHex = (v) => {
    return Math.floor(((v / 100) * 255)).toString(16).padStart(2, "0");
}

ipcMain.on('enableAcrylic', (event, settings) => {
    try {
        console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Updating window...`);

        mainWindow.setBackgroundColor(`#${toHex(settings.opacity)}${settings.color}`)
        mainWindow.setHasShadow(settings.shadow);

        switch(settings.blurType) {
            case 0:
                if(process.platform == "win32"){
                    ewc.setAcrylic(mainWindow);
                }
                else if(process.platform == "linux") {

                }
                break;
            case 1:
                if(process.platform == "win32"){
                    ewc.setBlurBehind(mainWindow);
                }
                else if(process.platform == "linux") {

                }
                break;
            case 3:
                if(process.platform == "win32"){
                    ewc.setTransparentGradient(mainWindow);
                }
                else if(process.platform == "linux") {
                    mainWindow.setVibrancy("content");
                }
                break;
            default:
                if(process.platform == "win32"){
                    ewc.disable(mainWindow);
                }
                else if(process.platform == "linux") {

                }
                break;
        }

        console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Successfully updated.`);
        event.reply('enableAcrylic');
    } catch (exception) {
        console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Failed to update the window. Check the console using DevTools.`);
        event.reply('enableAcrylic', exception);
    }
});

ipcMain.on('disableAcrylic', (event) => {
    try {

        console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Updating window...`);

        mainWindow.setBackgroundColor(`#FF202225`);
        mainWindow.setHasShadow(true);
        if(process.platform == "win32"){
            ewc.disable(mainWindow);
        }
        else if(process.platform == "linux") {

        }

        console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Successfully updated.`);
        event.reply('disableAcrylic');
    } catch (exception) {
        console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Failed to update the window. Check the console using DevTools.`);
        event.reply('disableAcrylic', exception);
    }
});

ipcMain.handle('injectSuccess', (event) => {
    console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Successfully injected.`);
    mainWindow = electron.BrowserWindow.fromId(global.mainWindowId);
    return true;
});