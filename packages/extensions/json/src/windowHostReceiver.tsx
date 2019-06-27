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

import {
  buildDiff,
  extractBotStateActivitiesFromLogEntries,
  getBotState,
  IpcHandler,
  IpcHost,
  updateTheme,
} from './utils';

export interface WindowHostReceiverState {
  // The data that's actually displayed in the viewer
  data?: Activity | LogItem;
  isDiff?: boolean;
  containsBotStateActivities?: boolean;
  themeName?: string;
  chatLogs?: { documentId: string; logItems: LogEntry[] };
  // The item explicitly selected by the user
  selectedItem: Activity | LogItem;
}

interface JsonViewerExtensionAccessory {
  json: string;
  leftArrow: string;
  rightArrow: string;
  diff: string;
}

type AccessoryId = keyof JsonViewerExtensionAccessory;

export function windowHostReceiver(WrappedComponent: ComponentClass<any>): ComponentClass {
  @IpcHost(['setAccessoryState', 'setHighlightedObjects'])
  class WindowHostReceiver extends Component<{}, WindowHostReceiverState> {
    private setAccessoryState: (accessoryId: AccessoryId, state: string) => void;
    private setHighlightedObjects: (documentId: string, items: Activity | Activity[]) => void;

    public state = { data: {} } as WindowHostReceiverState;

    constructor(props) {
      super(props);
      this.updateButtonStates();
    }

    @IpcHandler(ExtensionChannel.Inspect)
    protected inspectHandler(selectedItem: Activity | LogItem = {} as Activity | LogItem): void {
      const newStateFragment = { selectedItem } as WindowHostReceiverState;
      const isBotState = (selectedItem as Activity).valueType === ValueTypes.BotState;
      // pull the user out of diff mode if this data is not a bot state
      if (!isBotState) {
        newStateFragment.isDiff = false;
      }
      // If we're not in diff mode or have selected something other than
      // a botState, the selectedItem and data will be the same
      if (!this.state.isDiff || !isBotState) {
        newStateFragment.data = selectedItem || ({} as Activity);
      }
      this.setState(newStateFragment);
    }

    @IpcHandler(ExtensionChannel.Theme)
    protected async themeHandler(themeInfo: { themeName: string; themeComponents: string[] }): Promise<void> {
      const themeNameLower = themeInfo.themeName.toLowerCase();
      this.setState({ themeName: themeNameLower });
      return updateTheme(themeInfo);
    }

    @IpcHandler(ExtensionChannel.ChatLogUpdated)
    protected async chatLogUpdatedHandler(documentId: string, logItems: LogEntry[]): Promise<void> {
      const containsBotStateActivities = !!extractBotStateActivitiesFromLogEntries(logItems).length;
      this.setState({ chatLogs: { documentId, logItems }, containsBotStateActivities });
    }

    @IpcHandler(ExtensionChannel.AccessoryClick)
    protected accessoryClick(accessoryId: AccessoryId, currentState: string): void {
      const newStateFragment = {} as WindowHostReceiverState;
      const { selectedItem, chatLogs } = this.state;
      const { logItems, documentId } = chatLogs;

      switch (accessoryId) {
        // Show the diff
        case 'diff':
          {
            const newState = currentState === 'disabled' ? 'default' : 'disabled';
            newStateFragment.isDiff = newState === 'default';
            const previousBotState = getBotState(logItems, selectedItem as Activity);
            if (newStateFragment.isDiff && previousBotState) {
              newStateFragment.data = buildDiff(selectedItem as Activity, previousBotState);
            } else {
              newStateFragment.data = selectedItem;
            }
          }
          break;

        case 'leftArrow':
          {
            const newSelectedItem = getBotState(logItems, selectedItem as Activity);
            const previousBotState = getBotState(logItems, newSelectedItem);
            if (previousBotState) {
              newStateFragment.selectedItem = newSelectedItem;
              newStateFragment.data = buildDiff(newSelectedItem, previousBotState);
            }
          }
          break;

        case 'rightArrow':
          {
            const newSelectedItem = getBotState(logItems, selectedItem as Activity, 1);
            const previousSelectedItem = selectedItem as Activity;
            if (previousSelectedItem && previousSelectedItem.valueType === ValueTypes.BotState && this.state.isDiff) {
              newStateFragment.selectedItem = newSelectedItem;
              newStateFragment.data = buildDiff(newSelectedItem, previousSelectedItem);
              this.setHighlightedObjects(documentId, [newSelectedItem, previousSelectedItem]);
            } else {
              newStateFragment.selectedItem = newStateFragment.data = newSelectedItem;
              this.setHighlightedObjects(documentId, [newSelectedItem]);
            }
          }
          break;

        default:
          break;
      }
      this.setState(newStateFragment);
    }

    public render() {
      const { selectedItem: _, ...props } = this.state;
      this.updateButtonStates();
      return <WrappedComponent {...props} />;
    }

    private updateButtonStates(): void {
      const groupStates: Partial<AccessoryId>[] = ['leftArrow', 'rightArrow'];
      const { containsBotStateActivities, isDiff } = this.state;
      groupStates.forEach(accessoryId =>
        this.setAccessoryState(accessoryId, containsBotStateActivities ? 'default' : 'disabled')
      );
      this.setAccessoryState('json', isDiff ? 'default' : 'selected');
      this.setAccessoryState('diff', isDiff ? 'selected' : containsBotStateActivities ? 'default' : 'disabled');
    }
  }

  return WindowHostReceiver;
}
