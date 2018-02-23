export enum LogLevel {
  Info,
  Trace,
  Warn,
  Error
}

export interface ILogEntry {
  timestamp: number,
  level: LogLevel;
  category: string;
  messages: any[];
}

export interface ILogService {
  logToLiveChat(conversationId: string, entry: ILogEntry): void;
}
