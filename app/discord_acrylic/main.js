const { contextBridge, ipcRenderer } = require("electron");
const { getSettings, saveSettings } = require("./utils/settings");

ipcRenderer.invoke("isMainProcessAlive").then(async () => {
  console.log(
    "%c[Acrylic]%c %s",
    "color: #ceb4ed",
    "color: inherit",
    "Arcylic injected."
  );

  const settings = await getSettings();

  const acrylic = {
    version: "2.0.0",
    internal: {
      getSettings: () => {
        return settings;
      },
    },

    enable: () => {
      ipcRenderer.send("enable", settings.type);
      saveSettings({ ...settings, acrylic: true });
      settings.acrylic = true;
    },

    disable: () => {
      ipcRenderer.send("disable");
      saveSettings({ ...settings, acrylic: false });
      settings.acrylic = false;
    },

    setType: (type) => {
      if (type == settings.type || type < 0 || type > 2)
        return "Setting was not changed.";
      ipcRenderer.send("enable", type);
      saveSettings({ ...settings, type: type });
      settings.type = type;
    },

    css: {
      enable: () => {
        ipcRenderer.send("css-enable");
        saveSettings({ ...settings, css: true });
        settings.css = true;
      },
      disable: () => {
        ipcRenderer.send("css-disable");
        saveSettings({ ...settings, css: false });
        settings.css = false;
      },
      reload: () => {
        if (settings.css) {
          ipcRenderer.send("css-reload");
        }
      },
      openEditor: () => {
        if (!settings.css) {
          ipcRenderer.send("css-enable");
          saveSettings({ ...settings, css: true });
          settings.css = true;
        }
        ipcRenderer.send("open-css");
      },
    },
  };

  contextBridge.exposeInMainWorld("acrylic", acrylic);
  if (settings.acrylic) {
    acrylic.enable();
  }
  if (settings.css) {
    acrylic.css.enable();
  }
});
