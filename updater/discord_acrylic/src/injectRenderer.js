const { contextBridge, ipcRenderer } = require('electron');
const SettingsManager = require("./utils/settingsManager");
const settings = new SettingsManager("./settings.json");

ipcRenderer.invoke('injectSuccess').then(() => {
    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Injected.`);

    let injectedCSS;
    const acrylic = {
        version: '1.0.0',
        enable: () => {
            ipcRenderer.send('enableAcrylic', settings.getAll());
            injectedCSS?.remove();
            if(settings.get("injectTheme")) {
                injectedCSS = document.createElement('style');
                injectedCSS.id = 'acrylic-css';
                injectedCSS.textContent = settings.loadCss();
                document.head.appendChild(injectedCSS);
            }
        },
    
        disable: () => {
            ipcRenderer.send('disableAcrylic');
            injectedCSS?.remove();
        },
    
        updateSettings: (key, value) => {
            if(key === undefined) return;
            if(value === undefined && typeof(key) === 'object') {
                const newSettings = key;
                if(!settings.validateSettings(newSettings)) {
                    return console.warn(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Invalid settings provided.`);
                }
                settings.set(newSettings);
                settings.writeSettings();
            } 
            else {
                if(settings.get(key) === undefined) {
                    return console.warn(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `The key provided does not exist.`);
                }
                if(value === undefined || typeof(settings.get(key)) !== typeof(value)) {
                    return console.warn(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Invalid value provided.`);
                }
                settings.set(key, value);
                settings.writeSettings();
            }

            acrylic.enable();
        },
    
        getSettings: () => settings.getAll(),
        reloadSettings: () => settings.loadSettings(),
        resetSettings: () => settings.resetSettings()
    };
    
    ipcRenderer.on('enableAcrylic', (e, err) => {
        if(err) 
            return console.error(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Failed to update the window. \n ${err}`);
        console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Updated the window.`);
    });
    
    ipcRenderer.on('disableAcrylic', (e, err) => {
        if(err) 
            return console.error(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Failed to update the window. \n ${err}`);
        console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Updated the window.`);
    });
    
    contextBridge.exposeInMainWorld('acrylic', acrylic);
    acrylic.enable();
});