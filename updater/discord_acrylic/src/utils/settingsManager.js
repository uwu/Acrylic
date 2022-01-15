const { readFileSync, writeFileSync } = require("fs");
const { resolve, join, isAbsolute } = require("path");

class settingsManager {

    defaultSettings = {
        "enabled": true,
        "color": "ffffff",
        "opacity": 0,
        "blurType": 0,
        "shadow": true,
        "injectTheme": true,
        "themePath": "./assets/acrylic.css",
        "transparent": false
    };

    settings = null;
    settingsPath = null;

    constructor(path) {
        this.settingsPath = resolve(join(__dirname, "..", "..", path));
        this.loadSettings();
    }

    validateSettings (newSettings, cb = resetSettings) {
        for (const [key, value] of Object.entries(this.defaultSettings)) {
            if(newSettings[key] === undefined && typeof(value) !== typeof(newSettings[key])) {
                cb();
                return false;
            }
        }
        return true;
    }

    resetSettings () {
        this.settings = this.defaultSettings;
        this.writeSettings();
    }

    loadSettings() {
        const readJson = readFileSync(this.settingsPath);
        const newSettings = JSON.parse(readJson);
        this.settings = newSettings;
        this.validateSettings(newSettings, () => {
            console.error('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', 'Invalid settings. Loading default settings...');
            this.settings = this.defaultSettings;
            this.writeSettings();
        });
        console.log('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', 'Settings loaded.');
    }

    writeSettings() {
        try {
            writeFileSync(this.settingsPath, JSON.stringify(this.settings));
        } catch {
            console.error('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', 'Failed to write settings.');
        }
    }

    loadCss() {
        try {
            let cssPath = this.settings.themePath;
            if(!isAbsolute(cssPath)) cssPath = resolve(join(__dirname, "..", "..", this.settings.themePath));
            return readFileSync(cssPath);
        } catch {
            console.error('%c[Acrylic]%c %s', 'color: #ceb4ed', 'color: inherit', 'Failed to load CSS.');
            return "";
        }
    }

    get(key) {
        return this.settings[key];
    }

    getAll() {
        return this.settings;
    }

    set(newSettings, newValue) {
        if(typeof(newSettings) === 'object') this.settings = newSettings;
        else this.settings[newSettings] = newValue;
    }
};

module.exports = settingsManager