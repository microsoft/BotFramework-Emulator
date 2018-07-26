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
import { ServiceType } from 'msbot/bin/schema';
import { call, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { DialogService } from '../../ui/dialogs/service';
import { LAUNCH_QNA_MAKER_EDITOR, OPEN_QNA_MAKER_CONTEXT_MENU, OPEN_QNA_MAKER_DEEP_LINK } from '../action/qnaMakerServiceActions';
import { SharedConstants } from '@bfemulator/app-shared';
function* launchQnaMakerEditor(action) {
    const { qnaMakerEditorComponent, qnaMakerService = {} } = action.payload;
    const result = yield DialogService
        .showDialog(qnaMakerEditorComponent, { qnaMakerService });
    if (result) {
        yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.AddOrUpdateService, ServiceType.QnA, result);
    }
}
function* openQnaMakerContextMenu(action) {
    const menuItems = [
        { label: 'Edit settings', id: 'edit' },
        { label: 'Open in web portal', id: 'open' },
        { label: 'Remove', id: 'forget' }
    ];
    const response = yield call(CommandServiceImpl
        .remoteCall.bind(CommandServiceImpl), SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
    switch (response.id) {
        case 'edit':
            yield* launchQnaMakerEditor(action);
            break;
        case 'open':
            yield* openQnaMakerDeepLink(action);
            break;
        case 'forget':
            yield* removeQnaMakerServiceFromActiveBot(action.payload.qnaMakerService);
            break;
        default:// canceled context menu
            return;
    }
}
function* openQnaMakerDeepLink(action) {
    const { kbId } = action.payload.qnaMakerService;
    const link = `https://qnamaker.ai/Edit/KnowledgeBase?kbid=${kbId}`;
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, link);
}
function* removeQnaMakerServiceFromActiveBot(qnaService) {
    const result = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowMessageBox, true, {
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove QnA service ${qnaService.name}. Are you sure?`,
        cancelId: 0,
    });
    if (result) {
        yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.RemoveService, ServiceType.QnA, qnaService.id);
    }
}
export function* qnaMakerSagas() {
    yield takeLatest(LAUNCH_QNA_MAKER_EDITOR, launchQnaMakerEditor);
    yield takeEvery(OPEN_QNA_MAKER_CONTEXT_MENU, openQnaMakerContextMenu);
    yield takeEvery(OPEN_QNA_MAKER_DEEP_LINK, openQnaMakerDeepLink);
}
//# sourceMappingURL=qnaMakerSagas.js.map