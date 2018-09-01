import { IFileService } from 'botframework-config/lib/schema';
import { Action } from 'redux';
import { ComponentClass } from 'react';

export const TRANSCRIPTS_UPDATED = 'TRANSCRIPTS_UPDATED';
export const CHAT_FILES_UPDATED = 'CHAT_FILES_UPDATED';
export const OPEN_CONTEXT_MENU_FOR_RESOURCE = 'OPEN_CONTEXT_MENU_FOR_RESOURCE';
export const EDIT_RESOURCE = 'EDIT_RESOURCE';
export const RENAME_RESOURCE = 'RENAME_RESOURCE';
export const OPEN_RESOURCE = 'OPEN_RESOURCE';
export const OPEN_RESOURCE_SETTINGS = 'OPEN_RESOURCE_SETTINGS';

export interface ResourcesAction<T> extends Action {
  payload: T;
}

export function transcriptsUpdated(payload: IFileService[]): ResourcesAction<IFileService[]> {
  return {
    type: TRANSCRIPTS_UPDATED,
    payload
  };
}

export function chatFilesUpdated(payload: IFileService[]): ResourcesAction<IFileService[]> {
  return {
    type: CHAT_FILES_UPDATED,
    payload
  };
}

export function openContextMenuForResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: OPEN_CONTEXT_MENU_FOR_RESOURCE,
    payload
  };
}

export function editResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: EDIT_RESOURCE,
    payload
  };
}

export function renameResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: RENAME_RESOURCE,
    payload
  };
}

export function openResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: OPEN_RESOURCE,
    payload
  };
}

declare type ResourceSettingsPayload = { dialog: ComponentClass<any> };

export function openResourcesSettings(payload: ResourceSettingsPayload): ResourcesAction<ResourceSettingsPayload> {
  return {
    type: OPEN_RESOURCE_SETTINGS,
    payload
  };
}
