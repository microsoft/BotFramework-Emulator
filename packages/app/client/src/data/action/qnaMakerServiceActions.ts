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

import { IQnAService } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { Action } from 'redux';
import { QnaMakerEditor } from '../../ui/shell/explorer/qnaMakerExplorer/qnaMakerEditor/qnaMakerEditor';

export const OPEN_QNA_MAKER_DEEP_LINK = 'OPEN_QNA_MAKER_DEEP_LINK';
export const OPEN_QNA_MAKER_CONTEXT_MENU = 'OPEN_QNA_MAKER_CONTEXT_MENU';
export const LAUNCH_QNA_MAKER_EDITOR = 'LAUNCH_QNA_MAKER_EDITOR';

export interface QnaMakerServiceAction<T> extends Action {
  payload: T;
}

export interface QnaMakerServicePayload {
  qnaMakerService: IQnAService;
}

export interface QnaMakerEditorPayload extends QnaMakerServicePayload {
  qnaMakerEditorComponent?: ComponentClass<QnaMakerEditor>;
}

export function launchQnaMakerEditor(qnaMakerEditorComponent: ComponentClass<QnaMakerEditor>,
                                     qnaMakerService?: IQnAService): QnaMakerServiceAction<QnaMakerEditorPayload> {
  return {
    type: LAUNCH_QNA_MAKER_EDITOR,
    payload: { qnaMakerEditorComponent, qnaMakerService }
  };
}

export function openQnAMakerDeepLink(qnaMakerService: IQnAService): QnaMakerServiceAction<QnaMakerServicePayload> {
  return {
    type: OPEN_QNA_MAKER_DEEP_LINK,
    payload: { qnaMakerService }
  };
}

export function openQnaMakerExplorerContextMenu(qnaMakerEditorComponent: ComponentClass<QnaMakerEditor>,
                                                qnaMakerService?: IQnAService)
  : QnaMakerServiceAction<QnaMakerEditorPayload> {
  return {
    type: OPEN_QNA_MAKER_CONTEXT_MENU,
    payload: { qnaMakerEditorComponent, qnaMakerService }
  };
}
