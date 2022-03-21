# Acrylic
 (Windows Only for now) Spiritual successor to Glasscord. Does not provide compatibility with Glasscord themes, only translucency effects.

# Disclaimer
 This Discord mod is still a work in progress. Features and compatibility may change at any time!
 I currently only support Windows (GIEx1 and EWC only work on Windows), but other platforms will be supported in the future, probably.

# Installation
 1. Copy `updater` folder into `%localappdata%/Discord/app-x.y.z`
    - The Discord folder name changes depending on the installed channel

        | Channel |      Name      |
        | ------ | --------------- |
        | Stable | `Discord`       |
        | Canary | `DiscordCanary` |

 2. Move `updater.node` from the `app-x.y.z` to the `updater` folder.
 3. Copy the `discord_acrylic` folder in `updater` to `modules/discord_desktop_core-xxxxxx`.
 4. Open `modules/discord_desktop_core-xxxxxx/discord_desktop_core/index.js` and append `require('../discord_acrylic/main.js')` at the end.

# Usage
 By default, Acrylic will inject it's own included css theme, making it standalone in case you don't want to use it with another mod.
 
 Most features are customizable via the acrylic object exposed to window, for example:
- `acrylic.updateSettings("injectCss", false)`
- `const settings = acrylic.getSettings()`
    
 Here are all the valid options:
 | Setting name |      Valid values      |      Description      |
 | ------------ | ---------------------- | --------------------- |
 | `enabled`    | `true`, `false`        | Changes the tint color for the background |
 | `injectCss`  | `true`, `false`        | Whether or not to inject the included theme |
 | `blurType`   | `0`, `1`, `2`          | Changes the blur mode. 0 is Acrylic (default), 1 is blur and 2 is transparent |
 | `color`      | `#xxxxxx`              | Changes the tint color for the background |
 | `opacity`    | `number`               | Changes the mix factor between the tint color and the background. Setting it to 0 will make the tint disappear, setting to 100 will make the background disappear. |
 | `shadow`    | `true`, `false`         | For future use. |
 
# Credits
 - GooseNest for [updater injection base](https://github.com/Goose-Nest/GIEx1)
 - 23phy for [EWC](https://github.com/23phy/ewc) (used for window composition effects on Windows)
