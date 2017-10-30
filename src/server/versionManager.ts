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

import * as log from './log';
import * as request from 'request';
import * as http from 'http';
import { DOMParser } from 'xmldom';

interface IVersion {
    type?: string,
    major: number,
    minor: number,
    subminor: number
}

export class VersionManager {
    static hasChecked: boolean = false;
    static SDKTypes: string[] = ['(BotBuilder .Net/', '(BotBuilder Node.js/'];
    static currentSdkVersion: IVersion = null;

    static minimumVersion: IVersion = {
        major: 3,
        minor: 11,
        subminor: 0
    };

    public static checkVersion(userAgent: string) {
        if (!VersionManager.hasChecked) {
            let version = VersionManager.parseUserAgentForVersion(userAgent);
            if (!version || VersionManager.isLess(version, VersionManager.minimumVersion)) {
                if (version) {
                    log.warn('Warning: The bot is using SDK version ' + VersionManager.toString(version) + '.');
                } else {
                    log.warn('Warning: The bot is using an SDK version earlier than ' + VersionManager.toString(VersionManager.minimumVersion) + '.');
                }
                log.warn('Warning: SDK versions earlier than ' + VersionManager.toString(VersionManager.minimumVersion) + ' use an authentication configuration that will no longer work with the emulator after November 15, 2017.');
                log.warn('Warning: For your bot to continue working with the emulator, please update your bot to use an SDK version greater than or equal to ' + VersionManager.toString(VersionManager.minimumVersion) + '.');
                log.warn(log.makeLinkMessage('Read about the Bot Framework authentication change.', 'https://aka.ms/botfxv32authchange'));   
            }
            VersionManager.checkCurrentSdkVersion(version);
            VersionManager.hasChecked = true;
        }
    }

    public static checkCurrentSdkVersion(version: IVersion)
    {
        if (!version || version.type === 'node') { 
            VersionManager.checkNodeSdkVersion(version);
        } else {
            VersionManager.checkDotNetSdkVersion(version);
        }            
    }

    public static checkNodeSdkVersion(version: IVersion)
    {
        let options: request.OptionsWithUrl = {
            url: 'http://registry.npmjs.org/-/package/botbuilder/dist-tags',
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        }

        let responseCallback = (err, resp: http.IncomingMessage, body) => {
            if(!err && body) {
                try {
                    let verObj = JSON.parse(body);
                    if (verObj.latest) {
                        let latestVersion: IVersion = VersionManager.parseVersion(verObj.latest);
                        if(!version || VersionManager.isLess(version, latestVersion)) {
                            VersionManager.warnAboutNewSdkVersion(version, latestVersion);
                        }
                    }
                } catch(err) {
                    // do not show the error; relies on 3rd party endpoint
                }
            }
        }
        request(options, responseCallback);
    }

    private static warnAboutNewSdkVersion(botVersion: IVersion, latestVersion: IVersion) {
        log.warn('Warning: The latest bot SDK version is ' + VersionManager.toString(latestVersion) + 
                (botVersion ? ' but the bot is running SDK version ' + VersionManager.toString(botVersion) : '') + '.');
        log.warn('Warning: Consider upgrading the bot to the latest SDK version.');
    }

    public static checkDotNetSdkVersion(version: IVersion) {
        let options: request.OptionsWithUrl = {
            url: 'https://www.nuget.org/api/v2/Packages?$filter=IsLatestVersion%20eq%20true%20and%20Id%20eq\'Microsoft.Bot.Builder\'&$select=NormalizedVersion',
            method: 'GET'
        };

        let responseCallback = (err, resp: http.IncomingMessage, body) => {
            if(body && !err) {
                try {
                    let doc = new DOMParser().parseFromString(body, 'text/xml');
                    let entryElem = doc.documentElement.getElementsByTagName('entry')[0];
                    let properties = entryElem.getElementsByTagName('m:properties')[0];
                    let versionElem = properties.getElementsByTagName('d:NormalizedVersion')[0];
                    if (versionElem.textContent) {
                        let latestVersion: IVersion = VersionManager.parseVersion(versionElem.textContent);
                        if(!version || VersionManager.isLess(version, latestVersion)) {
                            VersionManager.warnAboutNewSdkVersion(version, latestVersion);
                        }
                    }
                } catch(err) {
                    // do not show the error; relies on 3rd party endpoint
                }
            }
        }
        request(options, responseCallback);
    }

    private static parseUserAgentForVersion(userAgent: string): IVersion {
        if (userAgent && userAgent.length) {
            for (let i = 0; i< VersionManager.SDKTypes.length; i++) {
                let type = VersionManager.SDKTypes[i];
                let idx = userAgent.indexOf(type);
                if (idx !== -1) {
                    idx += type.length;
                    let endIdx = userAgent.indexOf(')', idx);
                    if (endIdx !== -1) {
                        let versionString = userAgent.substring(idx, endIdx);
                        let version = VersionManager.parseVersion(versionString);
                        if (version) {
                            version.type = i === 0 ? 'dotnet' : 'node';
                        }
                        return version;
                    }
                }
            }
        }

        return undefined;
    }

    private static parseVersion(versionString: string): IVersion {
        let parts = versionString.split('.');
        if (parts.length >= 3) {
            let version = {
                major: parseInt(parts[0]),
                minor: parseInt(parts[1]),
                subminor: parseInt(parts[2])
            }
            return version;
        }
        return undefined;
    }

    private static toString(version: IVersion): string {
        return version.major + '.' + version.minor + '.' + version.subminor;
    }

    private static isLess(a: IVersion, b: IVersion): boolean {
        return ((a.major < b.major) ||
                (a.major === b.major && a.minor < b.minor) ||
                (a.major === b.major && a.minor === b.minor && a.subminor < b.subminor));
    }
}
