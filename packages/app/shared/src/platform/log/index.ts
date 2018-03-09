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
  logToChat(conversationId: string, entry: ILogEntry): void;
}
