const electron = require('electron');
const ewc = require('./ewc');

console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Injected into main process.`);

if (process.platform != 'win32') {
    console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Invalid platform. Acrylic only supports windows as of right now! Injection will not proceed.`);
    const options = {
        type: 'warning',
        buttons: ['Continue', 'Close Discord'],
        defaultId: 0,
        title: 'Warning',
        message: 'Acrylic is only compatible with Windows.',
        detail: `If you continue, Discord will load up normally and Acrylic won't be injected.\nPlease consider uninstalling.`
    };

    if (electron.dialog.showMessageBoxSync(null, options)) process.exit();
    else return;
}

const injectLoop = setInterval(() => {
    console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Attempting to get main window...`);

    if (!global.mainWindowId) return console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Failed. Retrying in 100ms.`);

    console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Hooked into main window.`);

    clearInterval(injectLoop);

    const mainWindow = electron.BrowserWindow.fromId(global.mainWindowId);

    mainWindow.webContents.on('dom-ready', () => {
        console.log(`[${'\x1b[38;2;206;180;237mAcrylic\x1b[0m'}]`, `Injecting into renderer process.`);
        mainWindow.webContents.executeJavaScript(`DiscordNative.nativeModules.requireModule('discord_acrylic')`);
    });
}, 100);

const convertRange = (v) => {
    return Math.round(((v * 255) / 100));
}

const toHex = (v) => {
    let string = convertRange(v).toString(16);
    return string.length > 1 ? string : '0' + string;
}

electron.ipcMain.on('ewc-enable', (event, settings) => {
    try {
        const mainWindow = electron.BrowserWindow.fromId(global.mainWindowId);
        if (!mainWindow) throw 'Unable to get main window.'

        mainWindow.setBackgroundColor(`#${toHex(settings.opacity)}${settings.color}`);

        if (settings.blurType == 0) ewc.setAcrylic(mainWindow, 16777216);
        else if (settings.blurType == 1) ewc.setBlurBehind(mainWindow, 16777216);
        else ewc.setTransparentGradient(mainWindow, 16777216);

        event.reply('ewc-enable', 'Updated window.', false);
    } catch (exception) {
        event.reply('ewc-enable', 'Failed.\n' + exception, true);
    }
});

electron.ipcMain.on('ewc-disable', (event) => {
    try {
        const mainWindow = electron.BrowserWindow.fromId(global.mainWindowId);

        if (!mainWindow) throw 'Unable to get main window.'

        ewc.disable(mainWindow, 16777216);
        event.reply('ewc-disable', 'Disabled.', false);
    } catch (exception) {
        event.reply('ewc-disable', 'Failed.\n' + exception, true);
    }
});

electron.ipcMain.on('has-injected', (event) => {
    event.returnValue = "true";
});