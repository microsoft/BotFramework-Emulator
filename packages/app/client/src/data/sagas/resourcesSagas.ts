import { ForkEffect, put, takeEvery } from 'redux-saga/effects';
import {
  editResource,
  OPEN_CONTEXT_MENU_FOR_RESOURCE,
  OPEN_RESOURCE,
  RENAME_RESOURCE,
  ResourcesAction
} from '../action/resourcesAction';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { isChatFile, isTranscriptFile, SharedConstants } from '@bfemulator/app-shared/built';
import { IFileService } from 'msbot/bin/schema';

function* openContextMenuForResource(action: ResourcesAction<IFileService>): IterableIterator<any> {
  const menuItems = [
    { label: 'Open file location', id: 0 },
    { label: 'Rename', id: 1 },
    { label: 'Delete', id: 2 }
  ];

  const result = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  switch (result.id) {
    case 0:
      yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenFileLocation, action.payload.filePath);
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
  const { name, filePath } = action.payload;
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
    yield CommandServiceImpl.remoteCall(UnlinkFile, filePath);
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
  const { filePath } = action.payload;
  if (isChatFile(filePath)) {
    yield CommandServiceImpl.call(OpenChatFile, filePath, true);
  } else if (isTranscriptFile(filePath)) {
    yield CommandServiceImpl.call(OpenTranscript, filePath);
  } else {
    throw new TypeError('This resource type is not supported by the Emulator');
  }
}

export function* resourceSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(OPEN_CONTEXT_MENU_FOR_RESOURCE, openContextMenuForResource);
  yield takeEvery(RENAME_RESOURCE, doRename);
  yield takeEvery(OPEN_RESOURCE, doOpenResource);
}
