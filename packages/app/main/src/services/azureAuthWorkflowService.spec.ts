import { AzureAuthWorkflowService } from './azureAuthWorkflowService';
import { BrowserWindow } from 'electron';

const mockEvent = Event; // this is silly but required by jest
const mockArmToken = 'eyJhbGciOiJSU0EyNTYiLCJraWQiOiJmZGtqc2FoamdmIiwieDV0IjoiZiJ9.' +
  'eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.' +
  '7gjdshgfdsk98458205jfds9843fjds';
jest.mock('jsonwebtoken', () => ({
  verify: () => true
}));
jest.mock('electron-fetch', () => ({
  default: async () => ({
    json: async () => ({ jwks_uri: 'http://localhost', keys: { find: () => ({}) } })
  })
}));
jest.mock('rsa-pem-from-mod-exp', () => () => ({}));
jest.mock('electron', () => ({
  BrowserWindow: class MockBrowserWindow {
    public static reporters = [];
    public listeners: { type: string, handler: (event: any) => void }[] = [] as any;

    private static report(...args: any[]) {
      this.reporters.forEach(r => r(args));
    }

    constructor(...args: any[]) {
      MockBrowserWindow.report('constructor', ...args);
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
  }
}));
describe('The azureAuthWorkflowService', () => {
  beforeEach(() => {
    (BrowserWindow as any).reporters = [];
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
        expect(value.armToken).toBe(mockArmToken);
        // Not sure if this is valuable or not.
        expect(reportedValues.length).toBe(3);
      }
      ct++;
    }
    expect(ct).toBe(3);
  });

  it('should make the appropriate calls and receive the expected values with the "enterSignOutWorkflow"', async () => {
    let reportedValues = [];
    let reporter = v => reportedValues.push(v);
    (BrowserWindow as any).reporters.push(reporter);
    const it = AzureAuthWorkflowService.enterSignOutWorkflow(false);
    let value = undefined;
    let ct = 0;
    while (true) {
      const next = it.next(value);
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
          'post_logout_redirect',
          'x-client-SKU',
          'x-client-Ver',
        ].forEach((part, index) => {
          expect(parts[index].includes(part));
        });
        reportedValues.length = 0;
      } else if (ct === 1) {
        expect(value).not.toBe(null);
      }
      ct++;
    }
    expect(ct).toBe(3);
  });
});
