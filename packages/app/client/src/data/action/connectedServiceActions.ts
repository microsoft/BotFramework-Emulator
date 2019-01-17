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
  IConnectedService,
  ServiceTypes,
} from 'botframework-config/lib/schema';
import { ComponentClass } from 'react';
import { Action } from 'redux';

import { CONNECTED_SERVICES_PANEL_ID } from './explorerActions';

export const OPEN_SERVICE_DEEP_LINK = 'OPEN_SERVICE_DEEP_LINK';
export const OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE =
  'OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE';
export const OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU =
  'OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU';
export const OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU =
  'OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU';
export const LAUNCH_CONNECTED_SERVICE_EDITOR =
  'LAUNCH_CONNECTED_SERVICE_EDITOR';
export const LAUNCH_CONNECTED_SERVICE_PICKER =
  'LAUNCH_CONNECTED_SERVICE_PICKER';

export interface ConnectedServiceAction<T> extends Action {
  payload: T;
}

export interface ConnectedServicePayload {
  serviceType?: ServiceTypes;
  connectedService?: IConnectedService;
  authenticatedUser?: string;
  editorComponent?: ComponentClass<any>;
  panelId?: string;
}

export function launchConnectedServiceEditor<T>(
  editorComponent: ComponentClass<T>,
  connectedService?: IConnectedService
): ConnectedServiceAction<ConnectedServicePayload> {
  return {
    type: LAUNCH_CONNECTED_SERVICE_EDITOR,
    payload: { editorComponent, connectedService },
  };
}

export interface ConnectedServicePickerPayload extends ConnectedServicePayload {
  azureAuthWorkflowComponents: {
    promptDialog: ComponentClass<any>;
    loginSuccessDialog: ComponentClass<any>;
    loginFailedDialog: ComponentClass<any>;
  };
  pickerComponent: ComponentClass<any>;
  getStartedDialog: ComponentClass<any>;
  editorComponent: ComponentClass<any>;
  progressIndicatorComponent?: ComponentClass<any>;
}

export function launchConnectedServicePicker(
  payload: ConnectedServicePickerPayload
): ConnectedServiceAction<ConnectedServicePickerPayload> {
  return {
    type: LAUNCH_CONNECTED_SERVICE_PICKER,
    payload,
  };
}

export function openServiceDeepLink(
  connectedService: IConnectedService
): ConnectedServiceAction<ConnectedServicePayload> {
  return {
    type: OPEN_SERVICE_DEEP_LINK,
    payload: { connectedService },
  };
}

export function openContextMenuForConnectedService<T>(
  editorComponent: ComponentClass<T>,
  connectedService?: IConnectedService
): ConnectedServiceAction<ConnectedServicePayload> {
  return {
    type: OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE,
    payload: { editorComponent, connectedService },
  };
}

export function openAddServiceContextMenu(
  payload: ConnectedServicePickerPayload
): ConnectedServiceAction<ConnectedServicePickerPayload> {
  return {
    type: OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU,
    payload,
  };
}

export function openSortContextMenu(): ConnectedServiceAction<
  ConnectedServicePayload
> {
  return {
    type: OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU,
    payload: { panelId: CONNECTED_SERVICES_PANEL_ID },
  };
}
