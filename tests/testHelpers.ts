import * as path from 'path';
import * as fs from 'fs';


/**
 * The directory used by tests to store user settings, insuring default
 * settings for all tests.
 */
export const tempLocalStore = path.join(__dirname, 'testsettings');

/**
 * Called when tests are completed, deleting tempLocalStore and all files
 * within.
 */
export function cleanUpLocalStore() {
    if (fs.existsSync(tempLocalStore)) {
        fs.readdirSync(tempLocalStore).forEach((f) => {
            fs.unlinkSync(path.join(tempLocalStore, f));
        });
        fs.rmdirSync(tempLocalStore);
    }
}
