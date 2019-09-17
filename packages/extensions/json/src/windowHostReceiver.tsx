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
  // The item we are using to diff with the selectedItem
  selectedDiffItem: Activity;
}

interface JsonViewerExtensionAccessory {
  json: string;
  leftArrow: string;
  rightArrow: string;
  diff: string;
}

type AccessoryId = keyof JsonViewerExtensionAccessory;

export function windowHostReceiver(WrappedComponent: ComponentClass<any>): ComponentClass {
  @IpcHost(['createAriaAlert', 'setAccessoryState', 'setHighlightedObjects', 'setInspectorObjects'])
  class WindowHostReceiver extends Component<{}, WindowHostReceiverState> {
    private createAriaAlert: (msg: string) => void;
    private setAccessoryState: (accessoryId: AccessoryId, state: string) => void;
    private setHighlightedObjects: (documentId: string, items: Activity | Activity[]) => void;
    private setInspectorObjects: (documentId: string, items: Activity | Activity[]) => void;

    private pendingHighlightReset;

    public state = { data: {} } as WindowHostReceiverState;

    constructor(props) {
      super(props);
      this.updateButtonStates();
    }

    @IpcHandler(ExtensionChannel.Inspect)
    protected inspectHandler(selectedItem: Activity | LogItem = {} as Activity | LogItem): void {
      if (this.pendingHighlightReset) {
        cancelAnimationFrame(this.pendingHighlightReset);
      }
      // always display the selected item
      const newStateFragment = { data: selectedItem } as WindowHostReceiverState;
      const { valueType } = selectedItem as Activity;
      // pull the user out of diff mode if this data is not a bot state
      newStateFragment.isDiff = valueType === ValueTypes.Diff;
      // If this is not a diff, the selectedItem and data will be the same
      // Once we enter diff mode, we want to retain the selected item
      // as a reference to our cursor's index
      if (valueType !== ValueTypes.Diff) {
        newStateFragment.selectedItem = selectedItem || ({} as Activity);
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

    @IpcHandler(ExtensionChannel.HighlightedObjectsUpdated)
    protected highlightedObjectsUpdatedHandler(highlightedObjects: Activity[]): void {
      // if we're diffing and the highlighted objects disappear,
      // set them back to the items in the diff after a bit
      if (this.pendingHighlightReset) {
        clearTimeout(this.pendingHighlightReset);
      }
      this.pendingHighlightReset = setTimeout(() => {
        const { isDiff, selectedItem, selectedDiffItem, chatLogs } = this.state;
        if (
          isDiff &&
          selectedItem &&
          (!highlightedObjects || !highlightedObjects.length || !Object.keys(highlightedObjects[0]).length)
        ) {
          const shouldBeHighlighted = [selectedItem as Activity];
          if (selectedDiffItem) {
            shouldBeHighlighted.unshift(selectedDiffItem);
          }
          this.setHighlightedObjects(chatLogs.documentId, shouldBeHighlighted);
        }
      }, 1000);
    }

    @IpcHandler(ExtensionChannel.AccessoryClick)
    protected accessoryClick(accessoryId: AccessoryId, currentState: string): void {
      const newStateFragment = { selectedDiffItem: null } as WindowHostReceiverState;
      const { selectedItem, chatLogs, isDiff } = this.state;
      const { logItems, documentId } = chatLogs;
      const highlightedObjects = [];
      const inspectorObjects = [];

      switch (accessoryId) {
        case 'diff':
          {
            const newState = currentState === 'selected' ? 'default' : 'selected';
            newStateFragment.isDiff = newState === 'selected';
            const previousBotState =
              getBotState(logItems, selectedItem as Activity) || extractBotStateActivitiesFromLogEntries(logItems)[0];
            const nextBotState = getBotState(logItems, previousBotState, 1);
            if (newStateFragment.isDiff && nextBotState && previousBotState) {
              newStateFragment.selectedItem = nextBotState;
              newStateFragment.selectedDiffItem = previousBotState;
              inspectorObjects.push(buildDiff(nextBotState, previousBotState));
              highlightedObjects.push(previousBotState, nextBotState);
              this.createAriaAlert('Showing bot state diff.');
            } else {
              inspectorObjects.push(selectedItem as Activity);
              this.createAriaAlert('Hiding bot state diff.');
            }
            this.setAccessoryState('diff', newState);
          }
          break;

        case 'leftArrow':
          {
            const newSelectedItem = getBotState(logItems, selectedItem as Activity);
            const previousBotState = getBotState(logItems, newSelectedItem);
            if (isDiff && previousBotState && newSelectedItem) {
              newStateFragment.selectedItem = newSelectedItem;
              newStateFragment.selectedDiffItem = previousBotState;
              inspectorObjects.push(buildDiff(newSelectedItem, previousBotState));
              highlightedObjects.push(previousBotState, newSelectedItem);
              this.createAriaAlert('Showing previous bot state diff.');
            } else if (!isDiff) {
              inspectorObjects.push(newSelectedItem || (selectedItem as Activity));
              this.createAriaAlert('Showing previous bot state.');
            } else {
              return;
            }
          }
          break;

        case 'rightArrow':
          {
            const newSelectedItem = getBotState(logItems, selectedItem as Activity, 1);
            const previousBotState = selectedItem as Activity;
            if (newSelectedItem && isDiff) {
              newStateFragment.selectedItem = newSelectedItem;
              newStateFragment.selectedDiffItem = previousBotState;
              inspectorObjects.push(buildDiff(newSelectedItem, previousBotState));
              highlightedObjects.push(newSelectedItem, previousBotState);
              this.createAriaAlert('Showing next bot state diff.');
            } else if (!isDiff) {
              inspectorObjects.push(newSelectedItem || (selectedItem as Activity));
              this.createAriaAlert('Showing next bot state.');
            } else {
              return;
            }
          }
          break;

        default:
          return;
      }
      this.setState(newStateFragment);
      this.setHighlightedObjects(documentId, highlightedObjects);
      this.setInspectorObjects(documentId, inspectorObjects);
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
