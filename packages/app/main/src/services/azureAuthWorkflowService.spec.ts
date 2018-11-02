import { AzureAuthWorkflowService } from './azureAuthWorkflowService';
import { BrowserWindow } from 'electron';
import { SharedConstants } from '@bfemulator/app-shared';

const mockEvent = Event; // this is silly but required by jest
const mockArmToken = 'eyJhbGciOiJSU0EyNTYiLCJraWQiOiJmZGtqc2FoamdmIiwieDV0IjoiZiJ9.' +
  'eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.' +
  '7gjdshgfdsk98458205jfds9843fjds';

jest.mock('jsonwebtoken', () => ({
  verify: () => true
}));
let mockResponses;

jest.mock('node-fetch', () => {
  const fetch = (url, opts) => {
    return {
      ok: true,
      json: async () => mockResponses.pop(),
      text: async () => '{}',
    };
  };
  (fetch as any).Headers = class {
  };
  (fetch as any).Response = class {
  };
  return fetch;
});

jest.mock('rsa-pem-from-mod-exp', () => () => ({}));

let mockCertCbResult;
let mockCerts = ['cert1', 'cert2', 'cert3'];
jest.mock('electron', () => 
({
  BrowserWindow: class MockBrowserWindow {
    public static reporters = [];
    public listeners = [] as any;
    public webContents = {
      history: ['http://someotherUrl', `http://localhost/#t=13&id_token=${mockArmToken}`],
      once: (_eventName: string, handler: (...args) => any) => {
        const mockEvent: any = { preventDefault: () => null };
        const mockCallback = (cert: any) => { mockCertCbResult = cert };
        handler(mockEvent, mockCerts, mockCallback);
      },
      removeListener: () => null
    };

    private static report(...args: any[]) {
      this.reporters.forEach(r => r(args));
    }

    constructor(...args: any[]) {
      MockBrowserWindow.report('constructor', ...args);
    }

    setMenu() {
      // no-op
    }

    addListener(type: string, handler: (event: any) => void) {
      this.listeners.push({ type, handler });
      MockBrowserWindow.report('addListener', type, handler);
      if (type === 'page-title-updated') {
        [['http://someotherUrl'], [`http://localhost/#t=13&id_token=${mockArmToken}`]].forEach((url, index) => {
          let evt = new mockEvent('page-title-updated');
          (evt as any).sender = { history: [`http://localhost/#t=13&id_token=${mockArmToken}`] };
          setTimeout(() => {
            this.listeners.forEach(l => l.type === evt.type && l.handler(evt));
          }, 25 * index);
        });
      }
    }

    once(type: string, handler: (event: any) => void) {
      this.listeners.push({ type, handler });
      MockBrowserWindow.report('once', type, handler);
    }

    dispatch(event: any) {
      this.listeners.forEach(l => l.type === event.type && l.handler(event));
      MockBrowserWindow.report('dispatch', event);
    }

    show() {
      MockBrowserWindow.report('show');
    }

    close() {
      MockBrowserWindow.report('hide');
    }

    loadURL(url: string) {
      MockBrowserWindow.report('loadURL', url);
      let evt = new mockEvent('ready-to-show');
      setTimeout(() => {
        this.listeners.forEach(l => l.type === evt.type && l.handler(evt));
      });
    }
  },
  app: {
    on: (...args: any[]) => null,
    ipcMain: (...args: any[]) => null,
    setName: (name: string) => null
  }
}));

let mockSharedConstants = SharedConstants;
let mockRemoteCalls: { cmdName: string, args: any[] }[] = [];
jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      remoteCall: (cmdName: string, ...args) => {
        if (cmdName === mockSharedConstants.Commands.UI.ShowSelectCertDialog) {
          const mockRemoteCall = { cmdName, args };
          mockRemoteCalls.push(mockRemoteCall);
          return Promise.resolve('someCert');
        }
        return Promise.resolve(true);
      }
    }
  }
}));

describe('The azureAuthWorkflowService', () => {
  beforeEach(() => {
    mockResponses = [
      { access_token: mockArmToken },
      { jwks_uri: 'http://localhost', keys: { find: () => ({}) } },
      { authorization_endpoint: 'http://localhost', jwks_uri: 'http://localhost', token_endpoint: 'http://localhost' }
    ];
    (BrowserWindow as any).reporters = [];
    mockCertCbResult = null;
    mockRemoteCalls = [];
  });

  it('should make the appropriate calls and receive the expected values with the "retrieveAuthToken"', async () => {
    let reportedValues = [];
    let reporter = v => reportedValues.push(v);
    (BrowserWindow as any).reporters.push(reporter);
    const it = AzureAuthWorkflowService.retrieveAuthToken(false, '');
    let value = undefined;
    let ct = 0;
    while (true) {
      let next = it.next(value);
      if (next.done) {
        break;
      }
      value = await next.value;
      if (!ct) {
        expect(value instanceof BrowserWindow).toBe(true);
        expect(reportedValues.length).toBe(3);
        const [, uri] = reportedValues[1];
        const idx = uri.indexOf('#');
        const parts = uri.substring(idx).split('&');
        [
          'response_type',
          'client_id',
          'redirect_uri',
          'state',
          'client-request-id'
        ].forEach((part, index) => {
          expect(parts[index].includes(part));
        });
        reportedValues.length = 0;
      }

      if (ct === 1) {
        expect(value.id_token).toBe(mockArmToken);
        // Not sure if this is valuable or not.
        expect(reportedValues.length).toBe(3);
      }

      if (ct === 2) {
        expect(value.access_token).toBe(mockArmToken);
      }
      ct++;
    }
    expect(ct).toBe(4);
    
    // the cert callback should have been called with our mock cert value
    expect(mockRemoteCalls.some(remoteCall => {
      const { ShowSelectCertDialog } = SharedConstants.Commands.UI;
      return remoteCall.cmdName === ShowSelectCertDialog
        && remoteCall.args[0] == mockCerts;
    })).toBe(true);
    expect(mockCertCbResult).toBe('someCert');
  });
});
