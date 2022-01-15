const { contextBridge, ipcRenderer } = require('electron')
const { writeFile, readFileSync } = require('fs');
const path = require('path');

ipcRenderer.sendSync('injectSuccess');
console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Injected.`);

var settings = utils.loadSettings();

if (!utils.validateSettings(settings)) {
    console.warn('[Acrylic] Invalid configuration file. Resetting to default.');
    settings = {
        "enabled": true,
        "injectCss": true,
        "color": "ffffff",
        "opacity": 0,
        "blurType": 0,
        "shadow": true
    }
    utils.writeSettings(settings);
} else {
    console.log('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', 'Settings loaded.');
}

let injectedCSS;
const acrylic = {
    version: '1.0.0',
    enable: () => {
        ipcRenderer.send('ewc-enable', settings);
        injectedCSS?.remove();
        if(settings.injectCss) {
            injectedCSS = document.createElement('style');
            injectedCSS.id = 'acrylic-css';
            injectedCSS.textContent = readFileSync(path.join(__dirname, 'assets/acrylic.css'));
            document.head.appendChild(injectedCSS);
        }
    },
    disable: () => {
        ipcRenderer.send('ewc-disable');
        injectedCSS?.remove();
    },
    updateSettings: (settingName, newValue) => {
        let tempSettings = { ...settings };
        tempSettings[settingName] = newValue;
        if (!utils.validateSettings(tempSettings)) return console.error('[ewc-update] Invalid settings provided.');
        settings = { ...tempSettings };
        console.log(settings);
        utils.writeSettings(settings);
        acrylic.enable();
    },
    getSettings: () => settings
};

ipcRenderer.on('enableAcrylic', (e, err) => {
    if (err) console.error(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Failed to update the window. \n ${err}`);
    else console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Updated the window`);
});

ipcRenderer.on('disableAcrylic', (e, err) => {
    if (err) console.error(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Failed to update the window. \n ${err}`);
    else console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Updated the window`);
});

contextBridge.exposeInMainWorld('acrylic', acrylic);
acrylic.enable();