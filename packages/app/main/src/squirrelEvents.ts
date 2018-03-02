import { app } from "electron";
import { spawn } from "child_process";
import * as path from "path";
import * as registry from './registryUtils';

function runUpdateExe(args: string[], done: Function): void {
    const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
    //logger.log(`Spawning ${updateExe} with args ${args}`);
    spawn(updateExe, args, {
        detached: true
    })
    .on("close", done as any);
}

export function handleStartupEvent(): boolean {
    if (process.platform !== "win32") {
        return false;
    }

    const cmd = process.argv[1];
    //logger.log(`Processing squirrel command ${cmd}`);
    const target = path.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
        registry.registerProtocolHandler('bfemulator', 'Bot Framework Emulator').then(_ => {
            runUpdateExe(['--createShortcut=' + target + ''], app.quit);
        });
        return true;
    }
    else if (cmd === "--squirrel-uninstall") {
        registry.unregisterProtocolHandler('botemulator');
        registry.unregisterProtocolHandler('bfemulator').then(_ => {
            runUpdateExe(['--removeShortcut=' + target + ''], app.quit);
        });
        return true;
    }
    else if (cmd === "--squirrel-obsolete") {
        app.quit();
        return true;
    }
    else {
        return false;
    }
}
