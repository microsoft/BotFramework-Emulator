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
import { BotInfo, isChatFile, isTranscriptFile, NotificationType, SharedConstants } from '@bfemulator/app-shared';
import { newNotification } from '@bfemulator/app-shared/built';
import { IFileService } from 'botframework-config/lib/schema';
import { ComponentClass } from 'react';
import { ForkEffect, put, takeEvery } from 'redux-saga/effects';

import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { DialogService } from '../../ui/dialogs/service';
import { beginAdd } from '../action/notificationActions';
import {
  editResource,
  OPEN_CONTEXT_MENU_FOR_RESOURCE,
  OPEN_RESOURCE,
  OPEN_RESOURCE_SETTINGS,
  RENAME_RESOURCE,
  ResourcesAction,
} from '../action/resourcesAction';

function* openContextMenuForResource(action: ResourcesAction<IFileService>): IterableIterator<any> {
  const menuItems = [{ label: 'Open file location', id: 0 }, { label: 'Rename', id: 1 }, { label: 'Delete', id: 2 }];

  const result = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  switch (result.id) {
    case 0:
      yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenFileLocation, action.payload.path);
      break;

    case 1:
      yield put(editResource(action.payload));
      break;

    case 2:
      yield* deleteFile(action);
      break;

    default:
      // Canceled context menu
      break;
  }
}

function* deleteFile(action: ResourcesAction<IFileService>): IterableIterator<any> {
  const { name, path } = action.payload;
  const { ShowMessageBox, UnlinkFile } = SharedConstants.Commands.Electron;
  const result = yield CommandServiceImpl.remoteCall(ShowMessageBox, true, {
    type: 'info',
    title: 'Delete this file',
    buttons: ['Cancel', 'Delete'],
    defaultId: 1,
    message: `This action cannot be undone. Are you sure you want to delete ${name}?`,
    cancelId: 0,
  });
  if (result) {
    yield CommandServiceImpl.remoteCall(UnlinkFile, path);
  }
}

function* doRename(action: ResourcesAction<IFileService>) {
  const { payload } = action;
  const { ShowMessageBox, RenameFile } = SharedConstants.Commands.Electron;
  if (!payload.name) {
    return CommandServiceImpl.remoteCall(ShowMessageBox, true, {
      type: 'error',
      title: 'Invalid file name',
      buttons: ['Ok'],
      defaultId: 1,
      message: `A valid file name must be used`,
      cancelId: 0,
    });
  }
  yield CommandServiceImpl.remoteCall(RenameFile, payload);
  yield put(editResource(null));
}

function* doOpenResource(action: ResourcesAction<IFileService>): IterableIterator<any> {
  const { OpenChatFile, OpenTranscript } = SharedConstants.Commands.Emulator;
  const { TrackEvent } = SharedConstants.Commands.Telemetry;
  const { path, name } = action.payload;
  if (isChatFile(path)) {
    yield CommandServiceImpl.call(OpenChatFile, path, true);
    CommandServiceImpl.remoteCall(TrackEvent, 'chatFile_open').catch(_e => void 0);
  } else if (isTranscriptFile(path)) {
    yield CommandServiceImpl.call(OpenTranscript, path, name);
    CommandServiceImpl.remoteCall(TrackEvent, 'transcriptFile_open', {
      method: 'resources_pane',
    }).catch(_e => void 0);
  }
  // unknown types just fall into the abyss
}

function* launchResourcesSettingsModal(action: ResourcesAction<{ dialog: ComponentClass<any> }>) {
  const result: Partial<BotInfo> = yield DialogService.showDialog(action.payload.dialog);
  if (result) {
    try {
      yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.PatchBotList, result.path, result);
    } catch (e) {
      const notification = newNotification('Unable to save resource settings', NotificationType.Error);
      yield put(beginAdd(notification));
    }
  }
}

export function* resourceSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(OPEN_CONTEXT_MENU_FOR_RESOURCE, openContextMenuForResource);
  yield takeEvery(RENAME_RESOURCE, doRename);
  yield takeEvery(OPEN_RESOURCE, doOpenResource);
  yield takeEvery(OPEN_RESOURCE_SETTINGS, launchResourcesSettingsModal);
}
