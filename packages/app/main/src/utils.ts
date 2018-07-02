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
  APIException,
  BotInfo,
  createErrorResponse,
  ErrorCodes,
  ErrorResponse,
  mergeDeep
} from '@bfemulator/app-shared';
import { BrowserWindow, dialog, OpenDialogOptions, SaveDialogOptions, MessageBoxOptions } from 'electron';
import * as HttpStatus from 'http-status-codes';
import * as Restify from 'restify';
import * as globals from './globals';
import * as Path from 'path';
import { CustomActivity } from './utils/conversation';

const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');
const readTextFile = require('read-text-file');

const electron = require('electron'); // use a lowercase name "electron" to prevent clash with "Electron" namespace
const electronApp: Electron.App = electron.app;
const electronRemote: Electron.Remote = electron.remote;

const Fs = require('fs');
const Mkdirp = require('mkdirp');
const url = require('url');
const chatdown = require('chatdown');

export function exceptionToAPIException(exception: any): APIException {
  if (exception.error && exception.statusCode) {
    return exception;
  }
  return {
    error: createErrorResponse(ErrorCodes.ServiceError, exception.message),
    statusCode: HttpStatus.BAD_REQUEST
  };
}

// send exception as error response
export function sendErrorResponse(req: Restify.Request, res: Restify.Response, next: Restify.Next, exception: any)
  : ErrorResponse {
  let apiException = exceptionToAPIException(exception);
  res.send(apiException.statusCode, apiException.error);
  res.end();
  return apiException.error;
}

export const ensureStoragePath = (): string => {
  const commandLineArgs = globals.getGlobal('commandlineargs');
  const app = electronApp || electronRemote.app;
  const storagePath = commandLineArgs.storagepath || Path.join(app.getPath('userData'), 'botframework-emulator');
  Mkdirp.sync(storagePath);
  return storagePath;
};

/**
 * Load JSON object from file.
 */
export const loadSettings = <T>(filename: string, defaultSettings: T): T => {
  try {
    filename = `${ensureStoragePath()}/${filename}`;
    const stat = Fs.statSync(filename);
    if (stat.isFile()) {
      const loaded = JSON.parse(Fs.readFileSync(filename, 'utf8'));
      return mergeDeep(defaultSettings, loaded);
    }
    return defaultSettings;
  } catch (e) {
    console.error(`Failed to read file: ${filename}`, e);
    return defaultSettings;
  }
};

/**
 * Save JSON object to file.
 */
export const saveSettings = <T>(filename: string, settings: T): void => {
  try {
    filename = `${ensureStoragePath()}/${filename}`;
    Fs.writeFileSync(filename, JSON.stringify(settings, null, 2), { encoding: 'utf8' });
  } catch (e) {
    console.error(`Failed to write file: ${filename}`, e);
  }
};

export const isLocalhostUrl = (urlStr: string): boolean => {
  const parsedUrl = url.parse(urlStr);
  return ( parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1' );
};

export const isSecuretUrl = (urlStr: string): boolean => {
  const parsedUrl = url.parse(urlStr);
  return ( !!parsedUrl.protocol && parsedUrl.protocol.startsWith('https') );
};

export const directoryExists = (path1: string) => {
  let stat = null;
  try {
    stat = Fs.statSync(path1);
  } catch {
    // do nothing
  }

  if (!stat || !stat.isDirectory()) {
    return false;
  } else {
    return true;
  }
};

export const fileExists = (path2: string) => {
  let stat = null;
  try {
    stat = Fs.statSync(path2);
  } catch {
    // do nothing
  }

  if (!stat || !stat.isFile()) {
    return false;
  } else {
    return true;
  }
};

export const getFilesInDir = (path3: string) => {
  return Fs.readdirSync(path3, 'utf-8');
};

export const readFileSync = (path4: string): string => {
  try {
    return readTextFile.readSync(path4);
  } catch (e) {
    console.error(`Error reading file ${path4}: ${e}`);
    return '';
  }
};

/** Writes contents to a file at path */
export const writeFile = (filePath: string, contents: object | string): void => {
  try {
    const contentsToWrite = typeof contents === 'object' ? JSON.stringify(contents, null, 2) : contents;

    // write parent director(y | ies) if non-existent
    Mkdirp.sync(Path.dirname(filePath));
    Fs.writeFileSync(filePath, contentsToWrite, { encoding: 'utf8' });
  } catch (e) {
    console.error(`Failed to write file at ${filePath}`, e);
  }
};

/**
 * Uses the chatdown library to convert a .chat file into a list of conversation activities
 * @param file The .chat file to parse
 */
export const parseActivitiesFromChatFile = async (file: string): Promise<CustomActivity[]> => {
  let conversation: string;
  let activities: CustomActivity[];

  if (Path.extname(file) !== '.chat') {
    throw new Error('Can only use chatdown on .chat files.');
  }

  // read conversation from chat file
  try {
    conversation = readFileSync(file);
  } catch (err) {
    throw new Error(`Error while trying to read conversation from chat file: ${err}`);
  }
  // convert conversation to list of activities using chatdown
  try {
    activities = await chatdown(conversation, {});
  } catch (err) {
    throw new Error(`Error while converting .chat file to list of activites: ${err}`);
  }

  if (!activities) {
    return [];
  }

  return activities;
};

/** Shows a native open file / directory dialog */
export function showOpenDialog(window: BrowserWindow, options: OpenDialogOptions): string {
  const filePaths = dialog.showOpenDialog(window, options);
  const filePath = filePaths && filePaths[0];
  return filePath;
}

export function showSaveDialog(window: BrowserWindow, options: SaveDialogOptions): string {
  return dialog.showSaveDialog(window, options);
}

export function showMessageBox(window: BrowserWindow, options: MessageBoxOptions): number {
  return dialog.showMessageBox(window, options);
}

/** Returns a starting name for a bot */
export const getSafeBotName = (): string => 'My Bot';

/** Returns a list of subfolders */
export const getDirectories = source =>
  readdirSync(source).map(name => join(source, name)).filter((sourceArg: any) => lstatSync(sourceArg).isDirectory());

export function isDev(): boolean {
  return ( process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath) );
}

export const getBotsFromDisk = (): BotInfo[] => {
  const botsJsonPath = Path.join(ensureStoragePath(), 'bots.json');
  const botsJsonContents = readFileSync(botsJsonPath);
  const botsJson = botsJsonContents ? JSON.parse(botsJsonContents) : null;

  if (botsJson && botsJson.bots && Array.isArray(botsJson.bots)) {
    return botsJson.bots;
  } else {
    return [];
  }
};
