//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { ChildProcess, fork } from 'child_process';
import * as path from 'path';

import { SharedConstants } from '@bfemulator/app-shared';
import { ProcessIPC, WebSocketIPC } from '@bfemulator/sdk-main';
import {
  CommandService,
  CommandServiceImpl,
  DisposableImpl,
  ExtensionConfig,
  IPC,
  NoopIPC,
} from '@bfemulator/sdk-shared';

import { mainWindow } from './main';
import { getDirectories, readFileSync } from './utils';

// =============================================================================
export interface Extension {
  readonly config: ExtensionConfig;
  readonly ipc: IPC;

  on(event: 'exit', listener: NodeJS.ExitListener);

  call(commandName: string, ...args: any[]): Promise<any>;

  connect();

  disconnect();
}

// =============================================================================
export abstract class ExtensionImpl extends DisposableImpl
  implements Extension {
  protected _ext: CommandService;
  protected _cli: CommandService;

  get config(): ExtensionConfig {
    return this._config;
  }

  get ipc(): IPC {
    return this._ipc;
  }

  protected constructor(private _config: ExtensionConfig, protected _ipc: IPC) {
    super();
    this._ext = new CommandServiceImpl(
      this._ipc,
      `ext-${this._config.location}`
    );
    this._cli = new CommandServiceImpl(
      mainWindow.ipc,
      `ext-${this._config.location}`
    );
    this.toDispose(this._ipc);
    this.toDispose(this._ext);

    // -------------------------------------------------------------------------
    // Methods callable by extension
    this._ext.on('ext-ping', () => {
      return 'ext-pong';
    });

    // -------------------------------------------------------------------------
    // Methods callable by client interface
    this._cli.on('cli-ping', () => {
      return 'cli-pong';
    });

    // -------------------------------------------------------------------------
    // Pass unknown commands from client to extension
    this._cli.on(
      'command-not-found',
      (commandName: string, ...args: any[]): Promise<any> => {
        return this._ext.remoteCall(commandName, ...args);
      }
    );

    // -------------------------------------------------------------------------
    // Pass unknown commands from extension to shell
    this._ext.on(
      'command-not-found',
      (commandName: string, ...args: any[]): Promise<any> => {
        return mainWindow.commandService.call(commandName, ...args);
      }
    );
  }

  public call(commandName: string, ...args: any[]): Promise<any> {
    try {
      return this._ext.remoteCall(commandName, ...args);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public abstract on(event: 'exit', listener: NodeJS.ExitListener);

  public abstract connect();

  public abstract disconnect();

  public toDispose(obj: any) {
    super.toDispose(obj);
  }
}

// =============================================================================
export class ChildExtension extends ExtensionImpl {
  constructor(config: ExtensionConfig, private _process: ChildProcess) {
    super(config, new ProcessIPC(_process));
  }

  public on(event: 'exit', listener: NodeJS.ExitListener) {
    this._process.on(event, listener);
  }

  public connect() {
    this.call('connect').catch(() => null);
  }

  public disconnect() {
    this.call('disconnect').catch(() => null);
    this._process.disconnect();
  }
}

// =============================================================================
export class PeerExtension extends ExtensionImpl {
  constructor(config: ExtensionConfig, private _wsipc: WebSocketIPC) {
    super(config, _wsipc);
  }

  public on(event: 'exit', listener: NodeJS.ExitListener) {
    this._wsipc.ws.on('close', listener);
  }

  public connect() {
    this.call('connect').catch(() => null);
  }

  public disconnect() {
    this.call('disconnect').catch(() => null);
  }
}

// =============================================================================
export class ClientExtension extends ExtensionImpl {
  public static counter: number = 0;

  constructor(config: ExtensionConfig) {
    super(config, new NoopIPC(--ClientExtension.counter));
  }

  public on() {
    return null;
  }

  public connect() {
    return null;
  }

  public disconnect() {
    return null;
  }
}

// =============================================================================
export interface ExtensionManager {
  findExtension(name: string): ExtensionImpl;

  addExtension(extension: ExtensionImpl, configPath: string);

  loadExtensions();

  unloadExtensions();
}

// =============================================================================
class ExtManagerImpl extends DisposableImpl implements ExtensionManager {
  private extensions: Map<IPC, ExtensionImpl> = new Map<IPC, ExtensionImpl>();

  public findExtension(name: string): ExtensionImpl {
    for (const kvPair of this.extensions) {
      if (kvPair[1].config.name === name) {
        return kvPair[1];
      }
    }
    return undefined;
  }

  public loadExtensions() {
    let folders = [];
    try {
      // Get all subdirectories under ../extensions
      const folder = this.unpackedFolder(
        path.resolve(path.join(__dirname, '..', 'extensions'))
      );
      folders = getDirectories(folder);
    } catch {
      // do nothing
    }
    // Load each extension
    folders.forEach(folder => {
      try {
        this.spawnExtension(folder);
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.log(`Failed to spawn extension '${folder}'`, ex);
      }
    });
  }

  public unloadExtensions() {
    for (const kvPair of this.extensions) {
      this.unloadExtension(kvPair[0]);
    }
  }

  public unloadExtension(ipc: IPC) {
    const extension = this.extensions.get(ipc);
    if (extension) {
      // eslint-disable-next-line no-console
      console.log(`Removing extension ${extension.config.name}`);
      // Disconnect from the extension process
      extension.disconnect();
      // Notify the client that the extension is gone.
      mainWindow.commandService.remoteCall(
        SharedConstants.Commands.Extension.Disconnect,
        extension.config.location
      );
      // Cleanup
      this.extensions.delete(ipc);
    }
  }

  public addExtension(extension: ExtensionImpl, configPath: string) {
    // Cleanup configPath
    configPath = configPath.replace(/\\/g, '/');
    // Remove any previous extension with matching name.
    this.unloadExtension(extension.ipc);
    // Save it off.
    this.extensions.set(extension.ipc, extension);
    extension.on('exit', () => {
      // Unload the extension if its process exits.
      this.unloadExtension(extension.ipc);
    });
    // eslint-disable-next-line no-console
    console.log(`Adding extension ${extension.config.name}`);
    // Cleanup some data
    extension.config.client = extension.config.client || {};
    extension.config.node = extension.config.node || {};
    // Cleanup basePath (root of webpack-dev-server, where index.html would live)
    extension.config.client.basePath = (
      extension.config.client.basePath || ''
    ).replace(/\\/g, '/');
    // Get the list of inspectors
    const inspectors = extension.config.client.inspectors || [];
    // Cleanup inspector paths
    inspectors.forEach(inspector => {
      inspector.src = (inspector.src || '').replace(/\\/g, '/');
    });
    if (
      extension.config.client.debug &&
      extension.config.client.debug.enabled &&
      extension.config.client.debug.webpack
    ) {
      // If running in debug mode, rewrite inspector paths as http URLs for webpack-dev-server.
      const port = extension.config.client.debug.webpack.port || 3030;
      const host = extension.config.client.debug.webpack.host || 'localhost';
      inspectors.forEach(inspector => {
        inspector.src = `http://${host}:${port}/${inspector.src}`.replace(
          extension.config.client.basePath,
          ''
        );
      });
    } else {
      // If not in debug mode, rewrite paths as file path URLs.
      inspectors.forEach(inspector => {
        let folder = path.resolve(configPath).replace(/\\/g, '/');
        if (folder[0] !== '/') {
          folder = `/${folder}`;
        }
        inspector.src = `file://${folder}/` + inspector.src;
      });
    }
    // Connect to the extension's node process (if any).
    extension.connect();
    // Notify the client of the new extension.
    mainWindow.commandService.remoteCall(
      SharedConstants.Commands.Extension.Connect,
      extension.config
    );
  }

  // Check whether we're running from an 'app.asar' packfile. If so, it means we were installed
  // using an installer (as opposed to running a developer build).
  private isPacked(): boolean {
    return /[\\/]app.asar[\\/]/.test(__dirname);
  }

  // Most source files of the installed application exist in a packed archive called 'app.asar'.
  // The emulator is configured to unpack extensions out of the asar file onto disk in a folder
  // called 'app.asar.unpacked'. Electron doesn't support an automatic way to remap file paths
  // from packed to unpacked locations, so we're doing that manually here.
  private unpackedFolder(filename: string) {
    if (path.isAbsolute(filename) && this.isPacked()) {
      return filename.replace('app.asar', 'app.asar.unpacked');
    } else {
      return filename;
    }
  }

  private spawnExtension(folder: string) {
    let child: ChildProcess;
    try {
      // Read the extension's config file.
      let config = JSON.parse(readFileSync(`${folder}/bf-extension.json`));
      if (!config.location) {
        return;
      }
      if (!path.isAbsolute(config.location)) {
        // If relative path, make it absolute from the app directory
        folder = this.unpackedFolder(path.join(__dirname, config.location));
      } else {
        folder = this.unpackedFolder(path.resolve(config.location));
      }
      try {
        Object.assign(
          config,
          JSON.parse(readFileSync(`${folder}/bf-extension.json`))
        );
      } catch (ex) {
        config = null;
      }
      if (config && config.name) {
        if (config.node) {
          if (config.node.debug && config.node.debug.enabled) {
            if (
              config.node.debug.websocket &&
              config.node.debug.websocket.port
            ) {
              const port = +config.node.debug.websocket.port;
              try {
                // This extension is going to connect to us over websocket. Once that
                // connection is established we'll add the extension.
                // const wss = new ExtensionServer(port);
                // eslint-disable-next-line no-console
                console.log(
                  `Waiting for extension ${
                    config.name
                  } to connect on port ${port}`
                );
              } catch (err) {
                const msg = `Failed to spawn WebSocketServer on port ${port}.
                Extension ${config.name} will be unable to connect.`;
                // eslint-disable-next-line no-console
                console.log(msg, err);
              }
            }
          } else if (config.node.main) {
            // Launch node process as a child of this one.
            const file = this.unpackedFolder(
              path.resolve(folder, config.node.main)
            );
            // Start the extension in a child process.
            child = fork(file, [], {
              cwd: path.dirname(file),
              stdio: [0, 1, 2, 'ipc'],
            });
            // Wrap the extension process.
            const extension = new ChildExtension(config, child);
            // Add it to the ecosystem (notifies client, etc).
            this.addExtension(extension, folder);
          }
        } else {
          // It's a client-only extension
          const extension = new ClientExtension(config);
          // Add it to the ecosystem (notifies client, etc).
          this.addExtension(extension, folder);
        }
      }
    } catch (err) {
      // Something went wrong. If we still have a child process, try to kill it.
      // eslint-disable-next-line no-console
      console.log('Failed to spawn extension', folder, err);
      try {
        if (child) {
          child.kill();
        }
      } catch {
        // do nothing
      }
    }
  }
}
export const ExtensionManagerImpl = new ExtManagerImpl();

// =============================================================================
// class PendingExtension extends DisposableImpl {
//   private readonly _ipc: WebSocketIPC;
//   private readonly _ext: CommandService;

//   public constructor(private _ws: WebSocket) {
//     super();
//     this._ipc = new WebSocketIPC(this._ws);
//     this._ext = new CommandServiceImpl(this._ipc, 'connector');
//     super.toDispose(this._ipc);
//     super.toDispose(this._ext);
//     this._ext
//       .remoteCall('hello')
//       .then(
//         (reply: {
//           id: number;
//           configPath: string;
//           config: ExtensionConfig;
//         }) => {
//           const ipc = new WebSocketIPC(this._ws);
//           ipc.id = reply.id;
//           const configPath = reply.configPath;
//           const extension = new PeerExtension(reply.config, ipc);
//           ExtensionManagerImpl.addExtension(extension, configPath);
//           super.dispose();
//         }
//       );
//   }
// }

// =============================================================================
// class ExtensionServer extends WebSocketServer {
//   constructor(port: number) {
//     super(port);
//   }

//   public onConnection(ws: WebSocket): PendingExtension {
//     return new PendingExtension(ws);
//   }
// }
