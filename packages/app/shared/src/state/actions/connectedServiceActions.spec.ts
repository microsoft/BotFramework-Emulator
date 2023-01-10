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

import {
  OPEN_SERVICE_DEEP_LINK,
  OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE,
  OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU,
  LAUNCH_EXTERNAL_LINK,
  OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU,
  LAUNCH_CONNECTED_SERVICE_EDITOR,
  LAUNCH_CONNECTED_SERVICE_PICKER,
  launchConnectedServiceEditor,
  launchConnectedServicePicker,
  openServiceDeepLink,
  openContextMenuForConnectedService,
  openAddServiceContextMenu,
  launchExternalLink,
  openSortContextMenu,
} from './connectedServiceActions';
import { CONNECTED_SERVICES_PANEL_ID } from './explorerActions';

describe('connected service actions', () => {
  it('should create a launchConnectedServiceEditor action', () => {
    const editorComponent: any = {};
    const connectedService: any = {};
    const action = launchConnectedServiceEditor(editorComponent, connectedService);

    expect(action.type).toBe(LAUNCH_CONNECTED_SERVICE_EDITOR);
    expect(action.payload).toEqual({ editorComponent, connectedService });
  });

  it('should create a launchConnectedServicePicker action', () => {
    const payload: any = {};
    const action = launchConnectedServicePicker(payload);

    expect(action.type).toBe(LAUNCH_CONNECTED_SERVICE_PICKER);
    expect(action.payload).toEqual(payload);
  });

  it('should create an openServiceDeepLink action', () => {
    const connectedService: any = {};
    const action = openServiceDeepLink(connectedService);

    expect(action.type).toBe(OPEN_SERVICE_DEEP_LINK);
    expect(action.payload).toEqual({ connectedService });
  });

  it('should create an openContextMenuForConnectedService action', () => {
    const editorComponent: any = {};
    const connectedService: any = {};
    const action = openContextMenuForConnectedService(editorComponent, connectedService);

    expect(action.type).toBe(OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE);
    expect(action.payload).toEqual({ editorComponent, connectedService });
  });

  it('should create an openAddServiceContextMenu action', () => {
    const payload: any = { resolver: expect.any(Function) };
    const action = openAddServiceContextMenu(payload, expect.any(Function) as any, { x: 150, y: 300 });

    expect(action.type).toBe(OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU);
    expect(action.payload).toEqual({ ...payload, menuCoords: { x: 150, y: 300 } });
  });

  it('should create a launchExternalLink action', () => {
    const payload: any = {};
    const action = launchExternalLink(payload);

    expect(action.type).toBe(LAUNCH_EXTERNAL_LINK);
    expect(action.payload).toEqual(payload);
  });

  it('should create an openSortContextMenu action', () => {
    const action = openSortContextMenu({ x: 150, y: 300 });

    expect(action.type).toBe(OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU);
    expect(action.payload).toEqual({ panelId: CONNECTED_SERVICES_PANEL_ID, menuCoords: { x: 150, y: 300 } });
  });
});
