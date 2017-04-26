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

interface IVersion {
    major: number,
    minor: number,
    subminor: number
}

export class VersionManager {
    static hasChecked: boolean = false;
    static SDKTypes: string[] = ['(BotBuilder .Net/', '(BotBuilder Node.js/'];

    static minimumVersion: IVersion = {
        major: 3,
        minor: 5,
        subminor: 0
    };

    public static checkVersion(userAgent: string) {
        if (!VersionManager.hasChecked) {
            let version = VersionManager.parseUserAgentForVersion(userAgent);
            if (!version || 
                (version.major < VersionManager.minimumVersion.major) ||
                (version.major === VersionManager.minimumVersion.major && version.minor < VersionManager.minimumVersion.minor) ||
                (version.major === VersionManager.minimumVersion.major && version.minor === VersionManager.minimumVersion.minor && 
                 version.subminor < VersionManager.minimumVersion.subminor)) {
                log.warn('Warning: The Bot is using SDK version ' + VersionManager.toString(version) + '.');
                log.warn('Warning: SDK versions earlier than 3.5.0 use an authentication configuration that will no longer work after May 31, 2017.');
                log.warn('Warning: For your bot to continue working beyond this date, please update your bot to use an SDK version greater than or equal to 3.5.0.');
                log.warn(log.makeLinkMessage('Read about the Bot Framework authentication change.', 'https://aka.ms/botfxv31authchange'));   
            }
            VersionManager.hasChecked = true;
        }
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
                        let parts = versionString.split('.');
                        if (parts.length >= 3) {
                            let version = {
                                major: parseInt(parts[0]),
                                minor: parseInt(parts[1]),
                                subminor: parseInt(parts[2])
                            }
                            return version;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    private static toString(version: IVersion): string {
        return version.major + '.' + version.minor + '.' + version.subminor;
    }
}