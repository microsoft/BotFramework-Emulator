export enum LogLevel {
  Info,
  Trace,
  Warn,
  Error
}

export interface ILogEntry {
  level: LogLevel;
  source: string;
  category: string;
  messages: any[];
}

export interface ILogService {
  logToLiveChat(conversationId: string, entry: ILogEntry): void;
}

export function logEntry(level: LogLevel, source: string, category: string, ...messages: any[]): ILogEntry {
  return {
    level,
    source,
    category,
    messages
  }
}
