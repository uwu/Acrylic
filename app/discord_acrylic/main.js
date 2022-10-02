const { contextBridge, ipcRenderer } = require('electron');
const { getSettings, saveSettings } = require("./utils/settings");

ipcRenderer.invoke('isMainProcessAlive').then(async () => {
    console.log('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', "Arcylic injected.");

    const settings = await getSettings();

    const acrylic = {
        version: '2.0.0',

        enable: () => {
            ipcRenderer.send('enable');
            saveSettings({ ...settings, acrylic: true });
        },

        disable: () => {
            ipcRenderer.send('disable');
            saveSettings({ ...settings, acrylic: false });
        },

        css: {
            enable: () => {
                ipcRenderer.send('css-enable');
                saveSettings({ ...settings, css: true });
            },
            disable: () => {
                ipcRenderer.send('css-disable');
                saveSettings({ ...settings, css: false });
            },
            reload: () => {
                if(settings.css) {
                    ipcRenderer.send('css-reload');
                }
            },
            openEditor: () => {
                if(!settings.css) {
                    ipcRenderer.send('css-enable');
                    saveSettings({ ...settings, css: true });
                }
                ipcRenderer.send('open-css');
            }
        }
    }

    contextBridge.exposeInMainWorld('acrylic', acrylic);
    if(settings.acrylic) {
        acrylic.enable();
    }
    if(settings.css) {
        acrylic.css.enable();
    }
});
