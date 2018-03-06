export * from './registry';
export * from './service';

export interface ICommand {
  id: string;
  handler: ICommandHandler;
  description?: ICommandDescription;
}

export interface ICommandMap {
	[id: string]: ICommand;
}

export interface ICommandHandler {
  <T>(...args: any[]): T;
}

export interface ICommandDescription {
  description: string;
  args: { name: string; description?: string; }[];
  returns?: string;
}
