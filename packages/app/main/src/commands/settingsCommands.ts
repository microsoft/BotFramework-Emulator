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

import { FrameworkSettings, SharedConstants } from '@bfemulator/app-shared';
import { Command } from '@bfemulator/sdk-shared';

import { addSavedBotUrl } from '../settingsData/actions/savedBotUrlsActions';
import { setFramework } from '../settingsData/actions/frameworkActions';
import { dispatch, getSettings } from '../settingsData/store';
import { TelemetryService } from '../telemetry';

const Commands = SharedConstants.Commands.Settings;

/** Registers settings commands */
export class SettingsCommands {
  // ---------------------------------------------------------------------------
  // Saves global app settings
  @Command(Commands.SaveAppSettings)
  protected saveAppSettings(settings: FrameworkSettings): any {
    const frameworkSettings = getSettings().framework;
    const { ngrokPath = '' } = frameworkSettings;
    const { ngrokPath: newNgrokPath } = settings;
    if (newNgrokPath !== ngrokPath) {
      TelemetryService.trackEvent('app_configureNgrok');
    }
    dispatch(setFramework(settings));
  }

  // ---------------------------------------------------------------------------
  // Get and return app settings from store
  @Command(Commands.LoadAppSettings)
  protected loadAppSettings(...args: any[]): FrameworkSettings {
    return getSettings().framework;
  }

  // ---------------------------------------------------------------------------
  // Save a new bot url to disk
  @Command(Commands.SaveBotUrl)
  protected saveBotUrl(url: string) {
    if (!url) {
      return; // Nothing to save.
    }
    dispatch(addSavedBotUrl(url));
  }
}
