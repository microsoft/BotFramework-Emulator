//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as Electron from 'electron';
import * as Fs from 'fs';
import * as Mkdirp from 'mkdirp';
import * as url from 'url';
import * as path from 'path';
import * as globals from './globals';


/**
 * Generates a random id that is unique enough for our purposes.
 */
export const uniqueId = (length?: number) => Math.random().toString(24).substr(2, length);

const ensureStoragePath = (): string => {
    const commandLineArgs = globals.getGlobal('commandlineargs');
    const app = Electron.app || Electron.remote.app;
    const storagePath = commandLineArgs.storagepath || path.join(app.getPath("userData"), "botframework-emulator");
    Mkdirp.sync(storagePath);
    return storagePath;
}

/**
 * Load JSON object from file.
 */
export const loadSettings = <T>(filename: string, defaultSettings: T): T => {
    try {
        filename = `${ensureStoragePath()}/${filename}`;
        const stat = Fs.statSync(filename);
        if (stat.isFile()) {
            const loaded = JSON.parse(Fs.readFileSync(filename, 'utf8'));
            return mergeDeep(defaultSettings, loaded);
        }
        return defaultSettings;
    } catch (e) {
        console.error(`Failed to read file: ${filename}`, e);
        return defaultSettings;
    }
}

/**
 * Save JSON object to file.
 */
export const saveSettings = <T>(filename: string, settings: T): void => {
    try {
        filename = `${ensureStoragePath()}/${filename}`;
        Fs.writeFileSync(filename, JSON.stringify(settings, null, 2), {encoding: 'utf8'});
    } catch (e) {
        console.error(`Failed to write file: ${filename}`, e);
    }
}

export function isObject(item: any): boolean {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

export function mergeDeep(target: any, source: any): any {
    let output = Object.assign({}, target);
    //if (isObject(target) && isObject(source)) {
    {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
            if (!(key in target))
                Object.assign(output, { [key]: source[key] });
            else
                output[key] = mergeDeep(target[key], source[key]);
            } else {
            Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

export const isLocalhostUrl = (urlStr: string): boolean => {
    const parsedUrl = url.parse(urlStr);
    return (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1');
}

export const isSecuretUrl = (urlStr: string): boolean => {
    const parsedUrl = url.parse(urlStr);
    return (!!parsedUrl.protocol && parsedUrl.protocol.startsWith('https'));
}

export const safeStringify = (o: any, space: string | number = undefined): string => {
    let cache = [];
    if (typeof o !== 'object')
        return `${o}`;
    return JSON.stringify(o, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    }, space);
}

export const approximateObjectSize = (object: any, cache:any[] = []): number => {
    switch (typeof object) {
        case 'boolean':
            return 4;
        case 'number':
            return 8;
        case 'string':
            return object.length * 2;
        case 'object':
            let bytes = 0;
            cache.push(object);
            for (let i in object) {
                let value = object[i];
                //check for infinite recursion
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        continue;
                    }
                    cache.push(value);
                }
                bytes += approximateObjectSize(value, cache);
            }
            return bytes;
        default:
            //value is null, undefined, or a function
            return 0;
    }
}