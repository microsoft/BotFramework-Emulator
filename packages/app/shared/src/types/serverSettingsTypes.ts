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

import { User } from '@bfemulator/sdk-shared';
import uuidv4 from 'uuid/v4';

import { Bot } from './botTypes';

export interface FrameworkSettings {
  // path to use for ngrok
  ngrokPath?: string;
  // option for deciding whether to bypass ngrok for bots on localhost
  bypassNgrokLocalhost?: boolean;
  // option to run ngrok when the emulator starts
  runNgrokAtStartup: boolean;
  stateSizeLimit?: number;
  // option for using 2.0 or 1.0 tokens
  use10Tokens?: boolean;
  // option for using a validation code for OAuthCards
  useCodeValidation?: boolean;
  // address to use for localhost; default: localhost
  localhost?: string;
  // locale to use across all endpoints
  locale?: string;
  // enables auto update on startup
  autoUpdate?: boolean;
  // enables pre-release updates
  usePrereleases?: boolean;
  // enables instrumentation
  collectUsageData?: boolean;
}

export interface WindowStateSettings {
  displayId?: number;
  zoomLevel?: number;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  theme?: string;
  availableThemes?: { name: string; href: string }[];
}

export interface UserSettings {
  currentUserId?: string;
  usersById?: { [id: string]: User };
  users?: { [id: string]: User };
}

export interface AzureSettings {
  signedInUser?: string;
  armToken?: string;
  persistLogin?: boolean;
}

export interface PersistentSettings {
  framework?: FrameworkSettings;
  bots?: Bot[];
  windowState?: WindowStateSettings;
  users?: UserSettings;
}

export interface Settings extends PersistentSettings {
  azure?: Partial<AzureSettings>;
}

export class SettingsImpl implements Settings {
  public framework: FrameworkSettings;
  public bots: Bot[];
  public windowState: WindowStateSettings;
  public users: UserSettings;
  public azure: AzureSettings;

  public constructor(source?: Settings) {
    const { framework, bots, windowState, users, azure }: Settings = source || {};
    Object.assign(this, { framework, bots, windowState, users, azure });
  }

  /**
   * Overridden to control which data is written to file
   * @returns {Partial<Settings>}
   */
  public toJSON(): Partial<Settings> {
    const { framework, bots, windowState, users, azure = {} } = this;
    // Do not write the armToken to disk
    const { armToken, ...azureProps } = azure;
    return { framework, bots, windowState, users, azure: azureProps };
  }
}

export const frameworkDefault: FrameworkSettings = {
  ngrokPath: '',
  bypassNgrokLocalhost: true,
  runNgrokAtStartup: false,
  stateSizeLimit: 64,
  use10Tokens: false,
  useCodeValidation: false,
  localhost: 'localhost',
  locale: '',
  usePrereleases: false,
  autoUpdate: true,
  collectUsageData: true,
};

export const windowStateDefault: WindowStateSettings = {
  zoomLevel: 0,
  width: 800,
  height: 600,
  left: 100,
  top: 50,
  theme: 'Light',
  availableThemes: [],
};

export const settingsDefault: Settings = new SettingsImpl({
  framework: frameworkDefault,
  bots: [
    {
      botId: uuidv4(),
      botUrl: 'http://localhost:3978/api/messages',
      msaAppId: '',
      msaPassword: '',
      locale: '',
    },
  ],
  windowState: windowStateDefault,
  users: {},
  azure: {},
});
