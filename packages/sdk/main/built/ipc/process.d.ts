/// <reference types="node" />
import { IPC } from '@bfemulator/sdk-shared';
export interface Process {
  pid: number;
  send?(message: any): any;
  on(event: 'message', listener: NodeJS.MessageListener): any;
  on(event: 'exit', listener: NodeJS.ExitListener): any;
}
export declare class ProcessIPC extends IPC {
  private _process;
  readonly id: number;
  constructor(_process: Process);
  send(...args: any[]): void;
}
