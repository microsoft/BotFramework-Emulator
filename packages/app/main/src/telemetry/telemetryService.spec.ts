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

import { TelemetryService } from './telemetryService';

let mockAppInsights;
let mockSetup;
let mockDefaultClient;
let mockStart;
jest.mock('applicationinsights', () => ({
  get defaultClient() {
    return mockDefaultClient;
  },
  get setup() {
    return mockSetup;
  },
  get start() {
    return mockStart;
  },
}));

let mockSettings;
jest.mock('../settingsData/store', () => ({
  getSettings: () => mockSettings,
}));

describe('TelemetryService', () => {
  let tmpClient;
  let tmpStartup;

  beforeEach(() => {
    mockDefaultClient = {
      context: {
        keys: {
          cloudRoleInstance: 'cloudRoleInstance',
        },
        tags: {
          cloudRoleInstance: 'SOME-MACHINE-NAME',
        },
      },
    };
    mockAppInsights = {};
    mockSettings = { framework: { collectUsageData: true } };
    mockSetup = jest.fn((_iKey: string) => mockAppInsights);
    mockStart = jest.fn(() => null);
    tmpClient = (TelemetryService as any)._client;
    tmpStartup = (TelemetryService as any).startup;
  });

  afterEach(() => {
    (TelemetryService as any)._client = tmpClient;
    (TelemetryService as any).startup = tmpStartup;
  });

  it('should startup', () => {
    const mockAutoCollect = jest.fn(_config => mockAppInsights);
    mockAppInsights = {
      setAutoCollectConsole: mockAutoCollect,
      setAutoCollectDependencies: mockAutoCollect,
      setAutoCollectExceptions: mockAutoCollect,
      setAutoCollectPerformance: mockAutoCollect,
      setAutoCollectRequests: mockAutoCollect,
      setAutoDependencyCorrelation: mockAutoCollect,
    };
    (TelemetryService as any).startup();

    expect(mockSetup).toHaveBeenCalledTimes(1);
    expect(mockSetup).toHaveBeenCalledWith('631faf57-1d84-40b4-9a71-fce28a3934a8');
    expect(mockAutoCollect).toHaveBeenCalledTimes(6);
    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(mockDefaultClient.context.tags.cloudRoleInstance).toBe('');
    expect((TelemetryService as any)._hasStarted).toBe(true);
    expect((TelemetryService as any)._client).toBe(mockDefaultClient);
  });

  it('should toggle enabled / disabled state based on app settings', () => {
    mockSettings = { framework: { collectUsageData: false } };
    expect((TelemetryService as any).enabled).toBe(false);

    mockSettings = { framework: { collectUsageData: true } };
    expect((TelemetryService as any).enabled).toBe(true);
  });

  it('should not track events if disabled or if no name is provided', () => {
    const mockAITrackEvent = jest.fn((_name, _properties) => null);
    (TelemetryService as any)._client = { trackEvent: mockAITrackEvent };

    mockSettings = { framework: { collectUsageData: false } };
    TelemetryService.trackEvent(null, null);
    expect(mockAITrackEvent).not.toHaveBeenCalled();

    mockSettings = { framework: { collectUsageData: true } };
    TelemetryService.trackEvent('', {});
    expect(mockAITrackEvent).not.toHaveBeenCalled();
  });

  it('should track events', () => {
    const mockStartup = jest.fn(() => null);
    (TelemetryService as any).startup = mockStartup;
    const mockAutoCollect = jest.fn(_config => mockAppInsights);
    mockAppInsights = {
      setAutoCollectConsole: mockAutoCollect,
      setAutoCollectDependencies: mockAutoCollect,
      setAutoCollectExceptions: mockAutoCollect,
      setAutoCollectPerformance: mockAutoCollect,
      setAutoCollectRequests: mockAutoCollect,
    };
    const mockAITrackEvent = jest.fn((_name, _properties) => null);
    (TelemetryService as any)._client = { trackEvent: mockAITrackEvent };

    TelemetryService.trackEvent('someEvent', { some: 'property' });
    expect(mockStartup).toHaveBeenCalled;
    expect(mockAITrackEvent).toHaveBeenCalledWith({
      name: 'someEvent',
      properties: { some: 'property' },
    });
  });
});
