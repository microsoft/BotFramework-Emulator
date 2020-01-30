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
import { Action } from 'redux';

import { SortCriteria } from '../reducers/explorer';
export const CONNECTED_SERVICES_PANEL_ID = 'connectedServices';

export enum ExplorerActions {
  Show = 'EXPLORER/SHOW',
  Sort = 'EXPLORER/SORT',
}

export interface ExplorerAction<T> extends Action {
  type: ExplorerActions;
  payload: T;
}

export interface ExplorerPayload {
  show?: boolean;
  sortSelectionByPanelId?: { [panelId: string]: SortCriteria };
}

export function showExplorer(show: boolean): ExplorerAction<ExplorerPayload> {
  return {
    type: ExplorerActions.Show,
    payload: { show },
  };
}

export function sortExplorerContents(panelId: string, sort: SortCriteria): ExplorerAction<ExplorerPayload> {
  return {
    type: ExplorerActions.Sort,
    payload: { sortSelectionByPanelId: { [panelId]: sort } },
  };
}
