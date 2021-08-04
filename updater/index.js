/*
MIT License

Copyright (c) 2021 GooseNest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/

const { copyFileSync, mkdirSync, unlinkSync, readdirSync, appendFileSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');

const nativeUpdaterModule = require('./updater');

function copyDir(src, dest) {
    mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        let srcPath = join(src, entry.name);
        let destPath = join(dest, entry.name);

        entry.isDirectory() ? copyDir(srcPath, destPath) : copyFileSync(srcPath, destPath);
    }
}

class Updater extends nativeUpdaterModule.Updater {

    constructor(options) {

        const originalHandler = options.response_handler;

        options.response_handler = (response) => {

            const [_id, detail] = JSON.parse(response);

            if (detail['TaskProgress'] != null) { // Host update rehooking
                const TaskProgress = detail['TaskProgress'];

                if (TaskProgress[0].HostInstall && TaskProgress[1] === 'Complete') { // Host update hooking

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `A host update has been successfully installed, rehooking!`);

                    const newAppDir = join(__dirname, '..', '..', `app-${TaskProgress[0].HostInstall.version.version.join('.')}`);
                    const injectBase = join(newAppDir, 'updater');

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Making new injection base directory...`);

                    mkdirSync(injectBase); // Make inject base dir

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Copying injector from old app directory to new injection directory...`);

                    copyFileSync(join(__dirname, 'index.js'), join(injectBase, 'index.js')); // Copy this file

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Copying payload from old app directory to new injection directory...`);

                    copyDir(join(__dirname, 'discord_acrylic'), join(injectBase, 'discord_acrylic')); // Copy this file

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Moving new native module into injection base directory...`);

                    copyFileSync(join(newAppDir, 'updater.node'), join(injectBase, 'updater.node')); // Move new native module from app base to inject base

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Deleting the native module from app folder...`);

                    unlinkSync(join(newAppDir, 'updater.node'));

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Rehooked successfully!`);
                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Copying Acrylic files to discord_desktop_core...`);

                    const coreDir = readdirSync(join(newAppDir, 'modules')).find(folder => folder.includes('discord_desktop_core'));
                    copyDir(join(__dirname, 'discord_acrylic'), join(newAppDir, 'modules', coreDir, 'discord_acrylic'));
    
                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Injecting into index.js...`);
                    appendFileSync(join(newAppDir, 'modules', coreDir, 'discord_desktop_core', 'index.js'), '\nrequire("../discord_acrylic/main.js");');
    
                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Done!`);
                }
                else if (TaskProgress[0].ModuleInstall && TaskProgress[1] === 'Complete' && TaskProgress[0].ModuleInstall.version.module.name == 'discord_desktop_core') { // Module update hooking

                    console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Detected discord_desktop_core update, reinjecting...`);

                    const currentInjectionDir = join(__dirname, '..', 'modules', 'discord_desktop_core-' + TaskProgress[0].ModuleInstall.version.version, 'discord_acrylic');
                    const indexPath = join(currentInjectionDir, '..', 'discord_desktop_core', 'index.js');

                    if (!existsSync(currentInjectionDir)) { // Core update rehooking
                        console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Copying Acrylic files to discord_desktop_core...`);
                        copyDir(join(__dirname, 'discord_acrylic'), join(currentInjectionDir));
                    }
        
                    if(!readFileSync(indexPath).includes('require("../discord_acrylic/main.js")')) {
                        console.log(`%c[Acrylic]%c %s`, `color: #ceb4ed`, `color: inherit`, `Injecting into index.js...`);
                        appendFileSync(indexPath, '\nrequire("../discord_acrylic/main.js");');
                    }
                }
            }

            return originalHandler(response);
        }

        super(options);
    }
}

module.exports = { Updater };