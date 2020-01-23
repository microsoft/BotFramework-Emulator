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

import { IEndpointService } from 'botframework-config/lib/schema';
import { Action } from 'redux';

import { ReactComponentClass } from '../../types';

export const OPEN_ENDPOINT_IN_EMULATOR = 'OPEN_ENDPOINT_IN_EMULATOR';
export const OPEN_ENDPOINT_CONTEXT_MENU = 'OPEN_ENDPOINT_CONTEXT_MENU';
export const LAUNCH_ENDPOINT_EDITOR = 'LAUNCH_ENDPOINT_EDITOR';

export interface EndpointServiceAction<T> extends Action {
  payload: T;
}

export interface EndpointServicePayload {
  endpointService: IEndpointService;
  resolver?: Function;
}

export interface EndpointEditorPayload extends EndpointServicePayload {
  endpointEditorComponent?: ReactComponentClass<any>;
}

export function launchEndpointEditor(
  endpointEditorComponent: ReactComponentClass<any>,
  endpointService?: IEndpointService,
  resolver?: Function
): EndpointServiceAction<EndpointEditorPayload> {
  return {
    type: LAUNCH_ENDPOINT_EDITOR,
    payload: { endpointEditorComponent, endpointService, resolver },
  };
}

export function openEndpointInEmulator(
  endpointService: IEndpointService
): EndpointServiceAction<EndpointServicePayload> {
  return {
    type: OPEN_ENDPOINT_IN_EMULATOR,
    payload: { endpointService },
  };
}

export function openEndpointExplorerContextMenu(
  endpointEditorComponent: ReactComponentClass<any>,
  endpointService?: IEndpointService
): EndpointServiceAction<EndpointEditorPayload> {
  return {
    type: OPEN_ENDPOINT_CONTEXT_MENU,
    payload: { endpointEditorComponent, endpointService },
  };
}
