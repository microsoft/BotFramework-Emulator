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

// We need to skip Webpack bundler on bundling 'electron':
// 1. We are using react-scripts, thus, we are not able to configure Webpack
// 2. To skip bundling, we can hack with window['require']

import { IBot } from './types/botTypes';
import { ADJECTIVES } from './constants';
import { NOUNS } from './constants';

/**
 * Generates a random id that is unique enough for our purposes.
 */
export function uniqueId() {
  return Math.random().toString(36).substr(2);
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

/** Tries to scan the bot record for a display string */
export const getBotDisplayName = (bot: IBot = {}): string => {
  return bot.botName || bot.botId || bot.botUrl || bot.path || '¯\\_(ツ)_/¯';
}

/** Generates a random bot name from a list of adjectives and nouns */
export const generateRandomBotName = (): string => {
  let adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)].trim();
  adjective = adjective.slice(0, 1).toUpperCase() + adjective.substring(1);

  let noun = NOUNS[Math.floor(Math.random() * NOUNS.length)].trim();
  noun = noun.slice(0, 1).toUpperCase() + noun.substring(1);

  return `${adjective} ${noun} Bot`;
}
