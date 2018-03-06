import { ICommand, ICommandHandler, ICommandMap } from './';
import { IDisposable } from '../lifecycle';

export interface ICommandRegistry {
	registerCommand(id: string, command: ICommandHandler): IDisposable;
	registerCommand(command: ICommand): IDisposable;
	getCommand(id: string): ICommand;
	getCommands(): ICommandMap;
}

export class CommandRegistry implements ICommandRegistry {

  private _commands: ICommandMap = {};

  registerCommand(idOrCommand: string | ICommand, handler?: ICommandHandler): IDisposable {

    if (!idOrCommand) {
      throw new Error("invalid command");
    }

    if (typeof idOrCommand === 'string') {
      if (!handler) {
        throw new Error("invalid command");
      }
      return this.registerCommand({ id: idOrCommand, handler });
    }

    const { id } = idOrCommand;

    this._commands[id] = idOrCommand;

    return {
      dispose: () => delete this._commands[id]
    };
  }

  getCommand(id: string): ICommand {
    return this._commands[id];
  }

  getCommands(): ICommandMap {
    return this._commands;
  }
}
