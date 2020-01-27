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

import * as AppInsights from 'applicationinsights';
import { SettingsImpl } from '@bfemulator/app-shared';

import { getSettings } from '../state/store';

const INSTRUMENTATION_KEY = 'cc91f74a-1abd-4be0-8a96-fddedbc08dd7';

export class TelemetryService {
  private static _client: AppInsights.TelemetryClient;
  private static _hasStarted: boolean = false;

  public static trackEvent(name: string, properties?: { [key: string]: any }): void {
    if (!this.enabled || !name || (global as any).__JEST_ENV__) {
      return;
    }
    if (!this._client) {
      this.startup();
    }
    try {
      properties = {
        ...properties,
        toolName: 'bf-emulator',
      };
      this._client.trackEvent({ name, properties });
    } catch (e) {
      // swallow the exception; we don't want to crash the app
      // on a failed attempt to collect usage data
    }
  }

  private static get enabled(): boolean {
    const settings: SettingsImpl = getSettings() || ({} as SettingsImpl);
    const { framework = {} } = settings;
    return framework.collectUsageData;
  }

  private static startup(): void {
    if (!this._hasStarted) {
      AppInsights.setup(INSTRUMENTATION_KEY)
        // turn off extra instrumentation
        .setAutoCollectConsole(false)
        .setAutoCollectDependencies(false)
        .setAutoCollectExceptions(false)
        .setAutoCollectPerformance(false)
        .setAutoCollectRequests(false)
        // Fix for zonejs / restify conflict (https://github.com/Microsoft/ApplicationInsights-node.js/issues/460)
        .setAutoDependencyCorrelation(false);
      // do not collect the user's machine name
      AppInsights.defaultClient.context.tags[AppInsights.defaultClient.context.keys.cloudRoleInstance] = '';
      AppInsights.start();

      this._client = AppInsights.defaultClient;
      this._hasStarted = true;
    }
  }
}
