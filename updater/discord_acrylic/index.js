const { contextBridge, ipcRenderer } = require('electron')
const { writeFile, readFileSync } = require('fs');
const path = require('path');

const success = ipcRenderer.sendSync('has-injected');
if(!success)
    return console.log('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', 'Could not inject into main process. Aborting.');

console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Injected successfully!`);

const utils = {
    validateSettings: (s) => {
        return (typeof s == 'object' && s?.color != undefined && typeof s?.color == 'string' && s?.opacity != undefined && typeof s?.opacity == 'number' && s?.enabled != undefined && typeof s?.enabled == 'boolean' && s?.blurType != undefined && typeof s?.blurType == 'number' && s?.injectCss != undefined && typeof s?.injectCss == 'boolean')
    },

    writeSettings: (s) => {
        writeFile(path.join(__dirname, 'assets/settings.json')), JSON.stringify(s), (err) => {
            if (err) console.err('[Acrylic] Could not save settings to file: %s', err);
            else console.log('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', 'Settings saved successfully.');
        }
    },

    loadSettings: (s) => {
        try {
            return require('./assets/settings.json');
        } catch (e) {
            return undefined;
        }
    },

    sleep: (ms) => { return new Promise(resolve => setTimeout(resolve, ms)) }
}

var settings = utils.loadSettings();

if (!utils.validateSettings(settings)) {
    console.warn('[Acrylic] Invalid configuration file. Resetting to default.');
    settings = {
        "enabled": true,
        "injectCss": true,
        "color": "ffffff",
        "opacity": 0,
        "blurType": 0
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
    updateSettings: (_settings, value) => {
        const tempSettings = settings;
        if(!value) {
            tempSettings[_settings] = value;
        }
        else {
            tempSettings = _settings;
        }
        if (!utils.validateSettings(tempSettings)) return console.error('[ewc-update] Invalid settings provided.');
        settings = { ...tempSettings };
        utils.writeSettings(settings);
        acrylic.enable();
    },
    getSettings: () => settings
};

ipcRenderer.on('ewc-enable', (event, arg, hasFailed) => {
    if (hasFailed) console.error('[ewc-enable]', arg);
    else console.log('[ewc-enable]', arg);
});

ipcRenderer.on('ewc-disable', (event, arg, hasFailed) => {
    if (hasFailed) console.error('[ewc-disable]', arg);
    else console.log('[ewc-disable]', arg);
});

contextBridge.exposeInMainWorld('acrylic', acrylic);
acrylic.enable();