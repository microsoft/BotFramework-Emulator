export * from './commandRegistry';

import { IDisposable } from '../../base/lifecycle/disposable';

export interface ICommand {
  id: string;
  handler: ICommandHandler;
  description?: ICommandDescription;
}

export interface ICommandMap {
	[id: string]: ICommand;
}

export interface ICommandHandler {
  <T>(context: any, ...args: any[]): T;
}

export interface ICommandDescription {
  description: string;
  args: { name: string; description?: string; }[];
  returns?: string;
}

export interface ICommandService extends IDisposable {
	call<T = any>(commandName: string, ...args: any[]): Promise<T>;
	remoteCall<T = any>(commandName: string, ...args: any[]): Promise<T>;
}

export interface ICommandRegistry {
	registerCommand(id: string, command: ICommandHandler): IDisposable;
	registerCommand(command: ICommand): IDisposable;
	getCommand(id: string): ICommand;
	getCommands(): ICommandMap;
}
