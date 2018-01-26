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
import * as got from 'got';
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

    public static checkVersion(userAgent: string) {
        if (!VersionManager.hasChecked) {
            let version = VersionManager.parseUserAgentForVersion(userAgent);
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
        let options = {
            url: 'http://registry.npmjs.org/-/package/botbuilder/dist-tags',
            useElectronNet: true
        }

        let responseCallback = (resp) => {
            if (resp.body) {
                try {
                    let verObj = JSON.parse(resp.body);
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
        got.get(options)
            .then(responseCallback)
            .catch((err) => {
                // do not show the error; relies on 3rd party endpoint
            });
    }

    private static warnAboutNewSdkVersion(botVersion: IVersion, latestVersion: IVersion) {
        log.warn('Warning: The latest bot SDK version is ' + VersionManager.toString(latestVersion) +
                (botVersion ? ' but the bot is running SDK version ' + VersionManager.toString(botVersion) : '') + '. Consider upgrading the bot to the latest SDK.');
    }

    public static checkDotNetSdkVersion(version: IVersion) {
        let options = {
            url: 'https://www.nuget.org/api/v2/Packages?$filter=IsLatestVersion%20eq%20true%20and%20Id%20eq\'Microsoft.Bot.Builder\'&$select=NormalizedVersion',
            'useElectronNet': true
        };

        let responseCallback = (resp) => {
            if (resp.body) {
                try {
                    let doc = new DOMParser().parseFromString(resp.body, 'text/xml');
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
        got.get(options)
            .then(responseCallback)
            .catch(err => {
                // do not show the error; relies on 3rd party endpoint
            });
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
