const { contextBridge, ipcRenderer } = require('electron');

console.log('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', "Arcylic injected.");

const utils = {
    getCss: () => {
        return ipcRenderer.sendSync('get-css');
    },

    saveCss: (css) => {
        ipcRenderer.send('save-css', css);
    },

    reloadCss: () => {
        ipcRenderer.send('css-reload');
    }
}

contextBridge.exposeInMainWorld('utils', utils);