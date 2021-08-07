# Acrylic
 (Windows Only for now) Spiritual successor to Glasscord. Does not provide compatibility with Glasscord themes, only translucency effects.

# Disclaimer
 This Discord mod is still a work in progress. Features and compatibility may change at any time!
 I currently only support Windows (GIEx1 and EWC only work on Windows), but other platforms will be supported in the future, probably.

# Installation
 1. Copy `updater` folder into `%userprofile%/AppData/Local/Discord/app-x.y.z`
    - The Discord folder name changes depending on the installed channel

        | Channel |      Name      |
        | ------ | --------------- |
        | Stable | `Discord`       |
        | Canary | `DiscordCanary` |

 2. Move `updater.node` from the `app-x.y.z` to the `updater` folder.
 3. Copy the `discord_acrylic` folder in `updater` to `modules/discord_desktop_core-xxxxxx`.
 4. Open `modules/discord_desktop_core-xxxxxx/discord_desktop_core/index.js` and append `require('../discord_acrylic/main.js')` at the end.

# Credits
 - GooseNest for [updater injection base](https://github.com/Goose-Nest/GIEx1)
 - 23phy for [EWC](https://github.com/23phy/ewc) (used for window composition effects on Windows)
