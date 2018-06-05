jest.mock('./main', () => ({
  mainWindow: {
    commandService: {
      call: (...args: any[]) => null,
      remoteCall: (...args: any[]) => null
    }
  }
}));

// some dependency un ./utils will try to invoke getGlobal in ./globals
jest.mock('./globals', () => ({
  getGlobal: () => ({})
}));

import {
  Protocol,
  ProtocolHandler
} from './protocolHandler';
import { mainWindow } from './main';
import { running, ngrokEmitter } from './ngrok';
import { getSettings } from './settings';
import { emulator } from './emulator';

describe('Protocol handler tests', () => {
  describe('the parseProtocolUrl() function', () => {
    it('should return an info object about the parsed URL', () => {
      const info: Protocol = ProtocolHandler.parseProtocolUrl(
        'bfemulator://bot.open?path=somePath'
      );
      expect(info.domain).toBe('bot');
      expect(info.action).toBe('open');
      expect(info.args).toEqual('path=somePath');
      expect(info.parsedArgs).toEqual({ path: 'somePath' });
    });

    it('should throw on an invalid protocol url', () => {
      expect(() => ProtocolHandler.parseProtocolUrl('invalidProtocolUrl://blah')).toThrow();
    });
  });

  it('should dispatch the result of parseProtocolUrl', () => {
    // preserve functions that will be mocked
    const tmpParseProtocolUrl = ProtocolHandler.parseProtocolUrl;
    const tmpDispatchProtocolAction = ProtocolHandler.dispatchProtocolAction;

    // mock functions
    const mockParseProtocolUrl = jest.fn(() => ({}));
    const mockDispatchProtocolAction = jest.fn(() => null);

    ProtocolHandler.parseProtocolUrl = mockParseProtocolUrl;
    ProtocolHandler.dispatchProtocolAction = mockDispatchProtocolAction;

    ProtocolHandler.parseProtocolUrlAndDispatch('someUrl');
    expect(mockParseProtocolUrl).toHaveBeenCalledTimes(1);
    expect(mockDispatchProtocolAction).toHaveBeenCalledTimes(1);

    // restore functions to original form
    ProtocolHandler.parseProtocolUrl = tmpParseProtocolUrl;
    ProtocolHandler.dispatchProtocolAction = tmpDispatchProtocolAction;
  });

  describe('dispatching protocol actions', () => {
    let tmpPerformBotAction;
    let tmpPerformLiveChatAction;
    let tmpPerformTranscriptAction;

    beforeEach(() => {
      tmpPerformBotAction = ProtocolHandler.performBotAction;
      tmpPerformLiveChatAction = ProtocolHandler.performLiveChatAction;
      tmpPerformTranscriptAction = ProtocolHandler.performTranscriptAction;
    });

    afterEach(() => {
      ProtocolHandler.performBotAction = tmpPerformBotAction;
      ProtocolHandler.performLiveChatAction = tmpPerformLiveChatAction;
      ProtocolHandler.performTranscriptAction = tmpPerformTranscriptAction;
    });

    it('shouldn\t do anything on an unrecognized action', () => {
      const mockPerformBotAction = jest.fn(() => null);
      ProtocolHandler.performBotAction = mockPerformBotAction;
      const mockPerformLiveChatAction = jest.fn(() => null);
      ProtocolHandler.performLiveChatAction = mockPerformLiveChatAction;
      const mockPerformTranscriptAction = jest.fn(() => null);
      ProtocolHandler.performTranscriptAction = mockPerformTranscriptAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'invalidDomain' });

      expect(mockPerformBotAction).not.toHaveBeenCalled();
      expect(mockPerformLiveChatAction).not.toHaveBeenCalled();
      expect(mockPerformTranscriptAction).not.toHaveBeenCalled();
    });

    it('should dispatch a bot action', () => {
      const mockPerformBotAction = jest.fn(() => null);
      ProtocolHandler.performBotAction = mockPerformBotAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'bot' });

      expect(mockPerformBotAction).toHaveBeenCalledTimes(1);
    });

    it('should dispatch a livechat action', () => {
      const mockPerformLiveChatAction = jest.fn(() => null);
      ProtocolHandler.performLiveChatAction = mockPerformLiveChatAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'livechat' });

      expect(mockPerformLiveChatAction).toHaveBeenCalledTimes(1);
    });

    it('should dispatch a transcript action', () => {
      const mockPerformTranscriptAction = jest.fn(() => null);
      ProtocolHandler.performTranscriptAction = mockPerformTranscriptAction;

      ProtocolHandler.dispatchProtocolAction({ domain: 'transcript' });

      expect(mockPerformTranscriptAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('opening a bot', () => {
    const commandServiceProperty = 'commandService';
    const openBotProtocol: Protocol = {
      parsedArgs: {
        path: 'somePath',
        secret: 'someSecret'
      }
    };

    let tmpCommandService;
    let tmpRunning;
    let tmpGetSettings;
    let tmpEmulator;

    beforeEach(() => {
      // perserve original functionality
      tmpCommandService = mainWindow[commandServiceProperty];
      tmpRunning = running;
      tmpGetSettings = getSettings;
      tmpEmulator = emulator;
    });

    afterEach(() => {
      // restore original functionality
      (mainWindow as any)[commandServiceProperty] = tmpCommandService;
      (running as any) = tmpRunning;
      (getSettings as any) = tmpGetSettings;
      (emulator as any) = tmpEmulator;
    });

    describe('loading the bot if ngrok is not configured', () => {
      beforeEach(() => {
        (getSettings as any) = jest.fn(() => ({ framework: { ngrokPath: null }}));
      });

      it('should load the bot with the supplied path and secret', () => {
        const mockCall = jest.fn((...args: any[]) => Promise.resolve());
        (mainWindow as any)[commandServiceProperty] = { call: mockCall };

        expect(() => ProtocolHandler.openBot(openBotProtocol)).not.toThrow();
        expect(mockCall).toHaveBeenCalledTimes(1);
        expect(mockCall).toHaveBeenCalledWith('bot:load', 'somePath', 'someSecret');
      });

      it('should throw if the "bot:load" command throws', () => {
        (emulator as any) = {
          ngrok: {
            getSpawnStatus: () => ({ triedToSpawn: true })
          }
        };
        const mockCall = jest.fn((...args: any[]) => { throw new Error(); });
        (mainWindow as any)[commandServiceProperty] = ({ call: mockCall });
        expect(() => ProtocolHandler.openBot(openBotProtocol)).toThrow();
      });
    });

    describe('loading the bot if ngrok is configured', () => {
      beforeEach(() => {
        (getSettings as any) = jest.fn(() => ({ framework: { ngrokPath: 'someNgrokPath' }}));
        (emulator as any) = {
          ngrok: {
            getSpawnStatus: () => ({ triedToSpawn: true })
          }
        };
      });

      it('should throw an error if the emulator did not try to spawn or if it failed to spawn', () => {
        (emulator as any) = {
          ngrok: {
            getSpawnStatus: () => ({ triedToSpawn: false })
          }
        };
        expect(() => ProtocolHandler.openBot(openBotProtocol)).toThrow();

        (emulator as any) = {
          ngrok: {
            getSpawnStatus: () => ({ triedToSpawn: true, err: 'someError' })
          }
        };
        expect(() => ProtocolHandler.openBot(openBotProtocol)).toThrow();
      });

      it('should load the bot immediately if ngrok is running', () => {
        (running as any) = () => true;
        const mockCall = jest.fn((...args: any[]) => Promise.resolve());
        (mainWindow as any)[commandServiceProperty] = { call: mockCall };

        expect(() => ProtocolHandler.openBot(openBotProtocol)).not.toThrow();
        expect(mockCall).toHaveBeenCalledTimes(1);
        expect(mockCall).toHaveBeenCalledWith('bot:load', 'somePath', 'someSecret');
      });

      it('should throw if ngrok is running and loading the bot immediately throws', () => {
        (running as any) = () => true;
        const mockCall = jest.fn((...args: any[]) => { throw new Error(); });
        (mainWindow as any)[commandServiceProperty] = ({ call: mockCall });

        expect(() => ProtocolHandler.openBot(openBotProtocol)).toThrow();
        expect(mockCall).toHaveBeenCalledTimes(1);
      });

      it('should wait for ngrok to connect and then load the bot', () => {
        (running as any) = () => false;
        let tmpNgrokEmitter = ngrokEmitter;
        (ngrokEmitter as any) = {
          once: (eventName: string, cb: (...args: any[]) => any) => cb()
        };
        const mockCall = jest.fn((...args: any[]) => Promise.resolve());
        (mainWindow as any)[commandServiceProperty] = { call: mockCall };

        expect(() => ProtocolHandler.openBot(openBotProtocol)).not.toThrow();
        expect(mockCall).toHaveBeenCalledTimes(1);
        expect(mockCall).toHaveBeenCalledWith('bot:load', 'somePath', 'someSecret');

        (ngrokEmitter as any) = tmpNgrokEmitter;
      });

      it('should throw if after waiting for ngrok to connect and loading the bot throws', () => {
        (running as any) = () => false;
        let tmpNgrokEmitter = ngrokEmitter;
        (ngrokEmitter as any) = {
          once: (eventName: string, cb: (...args: any[]) => any) => cb()
        };
        const mockCall = jest.fn((...args: any[]) => { throw new Error(); });
        (mainWindow as any)[commandServiceProperty] = ({ call: mockCall });

        expect(() => ProtocolHandler.openBot(openBotProtocol)).toThrow();
        expect(mockCall).toHaveBeenCalledTimes(1);

        (ngrokEmitter as any) = tmpNgrokEmitter;
      });
    });
  });

  // unmock mainWindow
  jest.unmock('./main');
  jest.unmock('./globals');
});
