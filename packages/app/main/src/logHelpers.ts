import * as Restify from 'restify';
import { LogLevel, ILogEntry } from 'botframework-emulator-shared/built/platform/log';
import { mainWindow } from './main';

export function makeLogEntry(level: LogLevel, category: string, ...messages: any[]): ILogEntry {
  return {
    timestamp: Date.now(),
    level,
    category,
    messages
  }
}

export function makeInspectorLink(text: any, obj: any, title?: string): any {
  return {
    type: "inspector",
    text,
    obj,
    title
  };
}

export function makeBotSettingsLink(text: string): any {
  return {
    type: "settings:bot",
    text
  };
}

export function makeAppSettingsLink(text: string): any {
  return {
    type: "settings:app",
    text
  };
}

export function makeExternalLink(text: string, url: string): any {
  return {
    type: "url:external",
    text,
    url
  };
}

export function logRequest(conversationId: string, source: string, req: Restify.Request, ...messages: any[]) {
  const entry = makeLogEntry(
    LogLevel.Info,
    "network",
    {
      type: "request",
      payload: {
        source,
        headers: req.headers,
        method: req.method,
        body: req.body,
      }
    },
    ...messages
  );
  mainWindow.logService.logToLiveChat(conversationId, entry);
}

export function logResponse(conversationId: string, destination: string, res: Restify.Response, ...messages: any[]) {
  const entry = makeLogEntry(
    res.statusCode >= 400 ? LogLevel.Error : LogLevel.Info,
    "network",
    {
      type: "response",
      payload: {
        destination,
        headers: (res as any)._headers,
        body: (res as any)._body,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
      }
    },
    ...messages
  );
  mainWindow.logService.logToLiveChat(conversationId, entry);
}

export function logError(conversationId: string, ...messages: any[]) {
  const entry = makeLogEntry(
    LogLevel.Error,
    "network",
    ...messages
  );
  mainWindow.logService.logToLiveChat(conversationId, entry);
}

export function logWarning(conversationId: string, ...messages: any[]) {
  const entry = makeLogEntry(
    LogLevel.Warn,
    "network",
    ...messages
  );
  mainWindow.logService.logToLiveChat(conversationId, entry);
}
