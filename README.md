# Acrylic

(Windows Only) Spiritual successor to Glasscord. Does not provide compatibility with Glasscord themes, only translucency effects.

# Disclaimer

This Discord mod is still a work in progress. Features and compatibility may change at any time!

# Installation

1. Copy `app` folder into `%userprofile%/AppData/Local/Discord/app-x.y.z/resources`

    - The Discord folder name changes depending on the installed channel

      | Channel | Name            |
      | ------- | --------------- |
      | Stable  | `Discord`       |
      | Canary  | `DiscordCanary` |

2. Rename app.asar to original.asar
3. That's it :)

# Usage

The recommended way to interact with the settings is to use https://shelter.xirreal.dev/acrylicSettings/, which provides a comfy menu to interact with the API.

By default, Acrylic will inject it's own included css theme, making it standalone in case you don't want to use it with another mod.
A simple API is exposed on `window.acrylic`, allowing quick toggling of both acrylic features and css.
To open the CSS editor, use `window.acrylic.css.openEditor()`.

Settings are stored in IDB, under the `acrylic/settings` table.

# Credits

- [Impregnate](https://github.com/Cumcord/Impregnate) for injection
- [Vibe](https://github.com/pykeio/vibe) for composition effects in electron apps
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) and [Monaco Loader](https://github.com/suren-atoyan/monaco-loader)
