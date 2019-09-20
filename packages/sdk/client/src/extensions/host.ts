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

import { Activity } from 'botframework-schema';
import { IBotConfiguration } from 'botframework-config/lib/schema';
import { ExtensionChannel } from '@bfemulator/sdk-shared/build/types/ipc';

export interface InspectorHost {
  // The current bot (msbot schema)
  readonly bot: IBotConfiguration;
  readonly logger: {
    log(message: string): () => void;
    error(message: string): () => void;
    logLuisEditorDeepLink(message: string): () => void;
  };

  // Each "on" function returns a method that when called, will unregister the handler.
  on(event: ExtensionChannel.Inspect, handler: (activity: Activity) => void): () => void;

  on(event: ExtensionChannel.BotUpdated, handler: (bot: IBotConfiguration) => void): () => void;

  on(event: ExtensionChannel.AccessoryClick, handler: (id: string, currentState: string) => void): () => void;

  on(
    event: ExtensionChannel.Theme,
    handler: (themeInfo: { themeName: string; themeComponents: string[] }) => void
  ): void;

  // Creates an invisible ARIA alert to be announced by screen reader technology
  createAriaAlert(msg: string): void;

  // Enable/disable an accessory button
  enableAccessory(id: string, enabled: boolean): void;

  // Set the state of an accessory button
  setAccessoryState(id: string, state: string): void;

  // Set inspector title
  setInspectorTitle(title: string): void;

  // Tracks a telemetry event to App Insights
  trackEvent(name: string, properties?: { [key: string]: any }): void;

  // Sets highlighted items within chat and the logs
  setHighlightedObjects(documentId: string, items: Activity | Activity[]): void;

  // Sets inspect items within the chat and logs
  setInspectorObjects(documentId: string, items: Activity | Activity[]): void;
}
