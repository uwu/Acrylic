const { get, set } = require("./idb");

const defaultSettings = {
  acrylic: true,
  css: true,
  type: 1,
};

let currentSettings = null;

const saveSettings = async (settings) => {
  await set("settings", settings);
  currentSettings = settings;
};

const getSettings = async () => {
  if (!currentSettings) {
    currentSettings = await get("settings");
    if (
      !currentSettings ||
      !Object.keys(currentSettings).length ==
        Object.keys(defaultSettings).length
    ) {
      await saveSettings(defaultSettings);
    }
  }
  return currentSettings;
};

module.exports = { saveSettings, getSettings };
