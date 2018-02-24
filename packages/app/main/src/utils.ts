
import * as Restify from 'restify';
import * as HttpStatus from 'http-status-codes';
import { IErrorResponse, APIException, createErrorResponse, ErrorCodes, mergeDeep } from 'botframework-emulator-shared';
import { dialog, OpenDialogOptions } from 'electron';

const electron = require('electron'); // use a lowercase name "electron" to prevent clash with "Electron" namespace
const electronApp: Electron.App = electron.app;
const electronRemote: Electron.Remote = electron.remote;

const Fs = require('fs');
const Mkdirp = require('mkdirp');
const url = require('url');
const path = require('path');

import * as globals from './globals';

export function exceptionToAPIException(exception: any): APIException {
  if (exception.error && exception.statusCode) {
    return exception;
  }
  return {
    error: createErrorResponse(ErrorCodes.ServiceError, exception.message),
    statusCode: HttpStatus.BAD_REQUEST
  }
}

// send exception as error response
export function sendErrorResponse(req: Restify.Request, res: Restify.Response, next: Restify.Next, exception: any): IErrorResponse {
  let apiException = exceptionToAPIException(exception);
  res.send(apiException.statusCode, apiException.error);
  res.end();
  return apiException.error;
}

export const ensureStoragePath = (): string => {
  const commandLineArgs = globals.getGlobal('commandlineargs');
  const app = electronApp || electronRemote.app;
  const storagePath = commandLineArgs.storagepath || path.join(app.getPath("userData"), "botframework-emulator");
  Mkdirp.sync(storagePath);
  return storagePath;
}

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
}

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
}

export const isLocalhostUrl = (urlStr: string): boolean => {
  const parsedUrl = url.parse(urlStr);
  return (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1');
}

export const isSecuretUrl = (urlStr: string): boolean => {
  const parsedUrl = url.parse(urlStr);
  return (!!parsedUrl.protocol && parsedUrl.protocol.startsWith('https'));
}

export const directoryExists = (path) => {
  let stat = null;
  try {
    stat = Fs.statSync(path);
  } catch (e) { }

  if (!stat || !stat.isDirectory()) {
    return false;
  } else return true;
}

export const fileExists = (path) => {
  let stat = null;
  try {
    stat = Fs.statSync(path);
  } catch (e) { }

  if (!stat || !stat.isFile()) {
    return false;
  } else return true;
}

export const getFilesInDir = (path) => {
  return Fs.readdirSync(path, 'utf-8');
}

export const readFileSync = (path) => {
  try {
    return Fs.readFileSync(path, 'utf-8');
  } catch (e) {
    return false;
  }
}

/** Writes contents to a file at path */
export const writeFile = (path: string, contents: object | string): void => {
  try {
    const contentsToWrite = typeof contents === 'object' ? JSON.stringify(contents, null, 2) : contents;
    Fs.writeFileSync(path, contentsToWrite, { encoding: 'utf8' });
  } catch (e) {
    console.error(`Failed to write bot settings file at ${path}`, e);
  }
}

/** Shows a native open file / directory dialog */
export const showOpenDialog = (options: OpenDialogOptions) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(options, filePaths => {
      const filePath = filePaths && filePaths[0];

      filePath ? resolve(filePath) : reject(new Error('user cancelled'));
    });
  });
}
