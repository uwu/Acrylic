# Acrylic
 (Windows Only) Spiritual successor to Glasscord. Does not provide compatibility with Glasscord themes, only translucency effects.

# Disclaimer
 This Discord mod is still a work in progress. Features and compatibility may change at any time!

# Installation
 1. Copy `app` folder into `%userprofile%/AppData/Local/Discord/app-x.y.z/resources`
    - The Discord folder name changes depending on the installed channel

        | Channel |      Name      |
        | ------ | --------------- |
        | Stable | `Discord`       |
        | Canary | `DiscordCanary` |

 2. That's it :)

# Usage
 By default, Acrylic will inject it's own included css theme, making it standalone in case you don't want to use it with another mod.
 A simple API is exposed on `window.acrylic`, allowing quick toggling of both acrylic features and css.
 Settings are stored in IDB.

# Credits
 - [Impregnate](https://github.com/Cumcord/Impregnate) for injection
 - [Vibe](https://github.com/pykeio/vibe) for composition effects in electron apps
