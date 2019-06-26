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
import * as React from 'react';
import { Component, ComponentClass } from 'react';
import { Activity } from 'botframework-schema';
import { ExtensionChannel } from '@bfemulator/sdk-shared/build/types/ipc';
import { ValueTypes } from '@bfemulator/app-shared/built/enums/valueTypes';
import { LogEntry, LogItem } from '@bfemulator/sdk-shared/build/types/log';

import { buildDiff, getBotState, IpcHandler, IpcHost, updateTheme } from './utils';

export interface WindowHostReceiverState {
  data?: { [prop: string]: any };
  isDiff?: boolean;
  themeName?: string;
  chatLogs?: { conversationId: string; logItems: LogEntry[] };
  lastAccessoryClicked?: string;
  selectedItem: Activity | LogItem;
}

interface JsonViewerExtensionAccessory {
  json: string;
  leftArrow: string;
  rightArrow: string;
  resetDiff: string;
  diff: string;
}

type AccessoryId = keyof JsonViewerExtensionAccessory;

export function windowHostReceiver(WrappedComponent: ComponentClass<any>): ComponentClass {
  @IpcHost(['setAccessoryState'])
  class WindowHostReceiver extends Component<{}, WindowHostReceiverState> {
    private setAccessoryState: (accessoryId: AccessoryId, state: string) => void;

    constructor(props) {
      super(props);
      // set all buttons to disabled
      const toDisable: (keyof Partial<JsonViewerExtensionAccessory>)[] = [
        'diff',
        'leftArrow',
        'rightArrow',
        'resetDiff',
      ];
      toDisable.forEach(accessoryId => this.setAccessoryState(accessoryId, 'disabled'));
      this.setAccessoryState('json', 'selected');
    }

    @IpcHandler(ExtensionChannel.Inspect)
    protected inspectHandler(selectedItem: Activity | LogItem): void {
      // the diff button wants to know: Is this a botState?
      const isBotState = (selectedItem as Activity).valueType === ValueTypes.BotState;
      this.setAccessoryState('diff', isBotState ? 'default' : 'disabled');
      const newStateFragment = { selectedItem } as WindowHostReceiverState;
      if (!isBotState) {
        newStateFragment.isDiff = false;
      }
      // If we're not in diff mode or have selected something other than
      // a botState, the selectedItem and data will be the same
      if (!this.state.isDiff || !isBotState) {
        newStateFragment.data = selectedItem;
      }
      this.setState(newStateFragment);
    }

    @IpcHandler(ExtensionChannel.Theme)
    protected async themeHandler(themeInfo: { themeName: string; themeComponents: string[] }): Promise<void> {
      return updateTheme(themeInfo);
    }

    @IpcHandler(ExtensionChannel.ChatLogUpdated)
    protected async chatLogUpdatedHandler(conversationId: string, logItems: LogEntry[]): Promise<void> {
      this.setState({ chatLogs: { conversationId, logItems } });
    }

    @IpcHandler(ExtensionChannel.AccessoryClick)
    protected accessoryClick(id: AccessoryId): void {
      const newStateFragment = { lastAccessoryClicked: id } as WindowHostReceiverState;
      switch (id) {
        case 'diff':
          {
            newStateFragment.isDiff = true;
            // Determine if we can diff
            const previousBotState = getBotState(this.state.chatLogs.logItems, this.state.selectedItem as Activity);
            if (previousBotState) {
              newStateFragment.data = buildDiff(this.state.selectedItem as Activity, previousBotState);
            }
          }
          break;

        case 'leftArrow':
          break;

        case 'rightArrow':
          break;

        default:
          break;
      }
      this.setState(newStateFragment);
    }

    render() {
      const { selectedItem: _, ...props } = this.state;
      return <WrappedComponent {...props} />;
    }
  }

  return WindowHostReceiver;
}
