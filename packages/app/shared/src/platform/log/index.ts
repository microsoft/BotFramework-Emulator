export enum LogLevel {
  Info,
  Trace,
  Warn,
  Error
}

export interface ILogService {
  logToLiveChat(level: LogLevel, conversationId: string, ...args: any[]): void;
}
