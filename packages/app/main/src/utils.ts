import * as fetch from 'electron-fetch';
import * as Restify from 'restify';
import * as HttpStatus from 'http-status-codes';
import { Bot as BotEmulator } from '@bfemulator/emulator-core';
import { IErrorResponse, APIException, createErrorResponse, ErrorCodes, mergeDeep, IBotInfo, IBotConfig, getFirstBotEndpoint } from '@bfemulator/app-shared';
import { dialog, OpenDialogOptions, SaveDialogOptions, BrowserWindow } from 'electron';

const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const os = require('os');

const electron = require('electron'); // use a lowercase name "electron" to prevent clash with "Electron" namespace
const electronApp: Electron.App = electron.app;
const electronRemote: Electron.Remote = electron.remote;

const Fs = require('fs');
const Mkdirp = require('mkdirp');
const url = require('url');
const path = require('path');
const sanitize = require("sanitize-filename");

import * as globals from './globals';
import { mainWindow } from './main';

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

export const readFileSync = (path: string): string => {
  try {
    return Fs.readFileSync(path, 'utf-8');
  } catch (e) {
    return '';
  }
}

/** Writes contents to a file at path */
export const writeFile = (filePath: string, contents: object | string): void => {
  try {
    const contentsToWrite = typeof contents === 'object' ? JSON.stringify(contents, null, 2) : contents;

    // write parent director(y | ies) if non-existent
    Mkdirp.sync(path.dirname(filePath));
    Fs.writeFileSync(filePath, contentsToWrite, { encoding: 'utf8' });
  } catch (e) {
    console.error(`Failed to write file at ${filePath}`, e);
  }
}

/** Shows a native open file / directory dialog */
export function showOpenDialog(window: BrowserWindow, options: OpenDialogOptions): string {
  const filePaths = dialog.showOpenDialog(window, options);
  const filePath = filePaths && filePaths[0];
  return filePath;
}

export function showSaveDialog(window: BrowserWindow, options: SaveDialogOptions): string {
  return dialog.showSaveDialog(window, options);
}

/** Returns a starting name for a bot */
export const getSafeBotName = (): string => 'My Bot';

/** Returns a list of subfolders */
export const getDirectories = source =>
  readdirSync(source).map(name => join(source, name)).filter(source => lstatSync(source).isDirectory());

export function isDev(): boolean {
  return (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));
}

export const decodeBase64 = (str: string) =>
  Buffer.from(str, 'base64').toString();

export const getBotsFromDisk = (): IBotInfo[] => {
  const botsJsonPath = path.join(ensureStoragePath(), 'bots.json');
  const botsJsonContents = readFileSync(botsJsonPath);
  const botsJson = botsJsonContents ? JSON.parse(botsJsonContents) : null;

  if (botsJson && botsJson.bots && Array.isArray(botsJson.bots)) {
    return botsJson.bots;
  } else {
    return [];
  }
}

export const createBotEmulatorFromBotConfig = (bot: IBotConfig, serviceUrl: string) => {
  const endpoint = getFirstBotEndpoint(bot);

  return new BotEmulator(
    endpoint.id,
    endpoint.endpoint,
    serviceUrl,
    endpoint.appId,
    endpoint.appPassword,
    {
      fetch,
      loggerOrLogService: mainWindow.logService
    }
  );
};
