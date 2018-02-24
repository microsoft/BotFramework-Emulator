

export interface IDisposable {
  dispose(): void;
}

export function isDisposable(obj: any): boolean {
  return obj && typeof obj.dispose === 'function';
}

export function dispose<T extends IDisposable>(obj: T): T;
export function dispose<T extends IDisposable>(...arr: T[]): T[];
export function dispose<T extends IDisposable>(arr: T[]): T[];
export function dispose<T extends IDisposable>(arg: T | T[]): T | T[] {
  if (Array.isArray(arg)) {
    arg.forEach(elem => elem && elem.dispose());
    return [];
  } else {
    arg && arg.dispose();
    return undefined;
  }
}

export abstract class Disposable implements IDisposable {

  private _toDispose: IDisposable[];

  constructor() {
    this._toDispose = [];
  }

  public dispose(): void {
    this._toDispose = dispose(this._toDispose);
  }

  public toDispose(...objs: IDisposable[]): void {
    this._toDispose.push(...objs);
  }
}
