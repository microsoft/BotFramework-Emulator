import * as Restify from 'restify';
import { LogLevel, logEntry } from 'botframework-emulator-shared/built/platform/log';
import { mainWindow } from './main';

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

export function logNetwork(conversationId: string, req: Restify.Request, res: Restify.Response, ...messages: any[]) {
  const level = res.statusCode >= 400 ? LogLevel.Error : LogLevel.Info;
  const entry = logEntry(
    level,
    "network",
    "network"
  );
  entry.messages.push(makeInspectorLink(req.method, req.body));
  entry.messages.push(makeInspectorLink(`${res.statusCode}`, (res as any).body,`(${res.statusMessage})`));
  entry.messages.push(...messages);
  mainWindow.logService.logToLiveChat(conversationId, entry);
}

export function logError(conversationId: string, ...messages: any[]) {
  const entry = logEntry(
    LogLevel.Error,
    "network",
    "network",
    ...messages
  );
  mainWindow.logService.logToLiveChat(conversationId, entry);
}
