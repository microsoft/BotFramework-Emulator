
import { getStore, addSettingsListener, getSettings } from './settings';
import * as ngrok from './ngrok';
import { isLocalhostUrl } from './utils';
import { promisify } from 'util';
import { emulator } from './emulator';


export class NgrokService {
  private _ngrokPath: string;
  private _serviceUrl: string;
  private _inspectUrl: string;
  private _spawnErr: any;
  private _localhost: string;
  private _bypass: boolean;

  getServiceUrl(botUrl: string): string {
    if (isLocalhostUrl(botUrl) && this._bypass) {
      const port = emulator.framework.serverPort;
      return `http://${this._localhost}:${port}`;
    } else {
      return this._serviceUrl;
    }
  }

  public async startup() {
    this.cacheHostAndPortSettings();
    await this.recycle();
    addSettingsListener(async ({ framework: { bypassNgrokLocalhost, ngrokPath, localhost } }) => {
      this.cacheHostAndPortSettings();
      this._bypass = bypassNgrokLocalhost;
      if (this._ngrokPath !== ngrokPath) {
        await this.recycle();
      }
    });
  }

  public async recycle() {
    try {
      await killNgrok();
    } catch (err) {
      console.error("Failed to kill ngrok", err);
    }

    const port = emulator.framework.serverPort;
    this._ngrokPath = getStore().getState().framework.ngrokPath;
    this._serviceUrl = `http://${this._localhost}:${port}`;
    this._inspectUrl = null;
    this._spawnErr = null;

    if (this._ngrokPath && this._ngrokPath.length) {
      try {
        const { inspectUrl, url } = await ngrokConnect({ port: emulator.framework.serverPort, path: this._ngrokPath });
        this._serviceUrl = url;
        this._inspectUrl = inspectUrl;
      } catch (err) {
        this._spawnErr = err;
        console.error("Failed to spawn ngrok", err);
      }
    }
  }

  report(conversationId: string): void {
    // TODO: Report ngrok status to the conversation log when one is created (and when recycled?)
    /*
    if (this._spawnErr) {
    } else if (!this._ngrokPath || !this._ngrokPath.length) {
      log.debug('ngrok not configured (only needed when connecting to remotely hosted bots)');
      log.error(log.makeLinkMessage('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo'));
      log.error(log.ngrokConfigurationLink('Edit ngrok settings'));
    } else if (ngrok.running()) {
      const bypassNgrokLocalhost = getStore().getState().framework.bypassNgrokLocalhost;
      log.debug(`ngrok listening on ${this._serviceUrl}`);
      log.debug('ngrok traffic inspector:', log.makeLinkMessage(inspectUrl, this._inspectUrl));
      if (bypassNgrokLocalhost) {
        log.debug(`Will bypass ngrok for local addresses`);
      } else {
        log.debug(`Will use ngrok for local addresses`);
      }
    } else {
      // Ngrok configured but not runnin
    }
    */
  }

  private cacheHostAndPortSettings() {
    const localhost = getStore().getState().framework.localhost || 'localhost';
    const parts = localhost.split(':');
    let hostname = localhost;
    if (parts.length > 0) {
      hostname = parts[0].trim();
    }
    if (parts.length > 1) {
      // Ignore port, for now
      //port = +parts[1].trim();
    }
    this._localhost = hostname;
  }
}


function ngrokConnect({ path, port }: { path: string, port: number }): Promise<{ inspectUrl: string, url: string }> {
  return new Promise((resolve, reject) => {
    ngrok.connect({ path, port }, (err, url, inspectUrl) => {
      err ? reject(err) : resolve({ inspectUrl, url });
    });
  });
}

async function killNgrok() {
  const killNgrokInternal = (cb) => {
    ngrok.kill(wasRunning => {
      cb(null, wasRunning);
    });
  }
  
  const wasRunning = await promisify(killNgrokInternal)();

  if (wasRunning) {
    //log.debug('ngrok stopped');
  }
}
