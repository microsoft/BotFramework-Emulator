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

import * as path from 'path';

import { SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, ExtensionConfig } from '@bfemulator/sdk-shared';
import { CommandServiceInstance } from '@bfemulator/sdk-shared';

import { getDirectories, readFileSync } from './utils';

// =============================================================================
export interface Extension {
  readonly config: ExtensionConfig;
}

// =============================================================================
export interface ExtensionManager {
  findExtension(name: string): Extension;

  addExtension(extension: Extension, configPath: string);

  loadExtensions();

  unloadExtensions();
}

// =============================================================================
class ExtManagerImpl implements ExtensionManager {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;
  private extensions: Map<Extension, string> = new Map<Extension, string>();

  public findExtension(name: string): Extension {
    for (const kvPair of this.extensions) {
      if (kvPair[0].config.name === name) {
        return kvPair[0];
      }
    }
    return undefined;
  }

  public loadExtensions() {
    let folders = [];
    try {
      // Get all subdirectories under ../extensions
      const folder = this.unpackedFolder(path.resolve(path.join(__dirname, '..', 'extensions')));
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

  public unloadExtension(extension: Extension) {
    if (extension) {
      // eslint-disable-next-line no-console
      console.log(`Removing extension ${extension.config.name}`);
      // Notify the client that the extension is gone.
      this.commandService.remoteCall(SharedConstants.Commands.Extension.Disconnect, extension.config.location);
      // Cleanup
      this.extensions.delete(extension);
    }
  }

  public addExtension(extension: Extension, configPath: string) {
    // Cleanup configPath
    configPath = configPath.replace(/\\/g, '/');
    // Remove any previous extension with matching name.
    this.unloadExtension(extension);
    // Save it off.
    this.extensions.set(extension, configPath);
    // eslint-disable-next-line no-console
    console.log(`Adding extension ${extension.config.name}`);
    // Cleanup some data
    extension.config.client = extension.config.client || {};
    extension.config.node = extension.config.node || {};
    // Cleanup basePath (root of webpack-dev-server, where index.html would live)
    extension.config.client.basePath = (extension.config.client.basePath || '').replace(/\\/g, '/');
    // Get the list of inspectors
    const inspectors = extension.config.client.inspectors || [];
    // Cleanup inspector paths
    inspectors.forEach(inspector => {
      inspector.src = (inspector.src || '').replace(/\\/g, '/');
    });
    inspectors.forEach(inspector => {
      let folder = path.resolve(configPath).replace(/\\/g, '/');
      if (folder[0] !== '/') {
        folder = `/${folder}`;
      }
      inspector.src = `file://${folder}/` + inspector.src;
      inspector.preloadPath =
        'file://' + path.resolve(path.join(__dirname, '..', 'extensions', 'inspector-preload.js'));
    });

    // Notify the client of the new extension.
    this.commandService.remoteCall(SharedConstants.Commands.Extension.Connect, extension.config);
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
        Object.assign(config, JSON.parse(readFileSync(`${folder}/bf-extension.json`)));
      } catch (ex) {
        config = null;
      }
      if (config && config.name) {
        // It's a client-only extension
        const extension = { config } as Extension;
        // Add it to the ecosystem (notifies client, etc).
        this.addExtension(extension, folder);
      }
    } catch (err) {
      // Something went wrong.
      // eslint-disable-next-line no-console
      console.log('Failed to spawn extension', folder, err);
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
