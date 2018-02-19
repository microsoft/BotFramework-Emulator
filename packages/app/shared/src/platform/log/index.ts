export enum LogLevel {
  Info,
  Trace,
  Warn,
  Error
}

export interface ILogEntry {
  level?: LogLevel;
  source?: string;
  category?: string;
  message: string;
}

export interface ILogService {
  logToLiveChat(conversationId: string, entry: ILogEntry): void;
}
