import { emulator } from './emulator';
import './fetchProxy';
import { mainWindow } from './main';
import { RestServer } from './restServer';

jest.mock('./main', () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true
    },
    logService: {
      logToChat: () => void (0)
    }
  }
}));

jest.mock('./emulator', () => ({
    emulator: new class {
      report() {
        return null;
      }
    }
  })
);

describe('The restServer', () => {
  let restServer;
  beforeAll(() => {
    restServer = new RestServer();
  });

  it('should log to the LOG panel after each successful request', () => {
    const logSpy = jest.spyOn(mainWindow.logService, 'logToChat');
    const mockReq = {
      method: 'post',
      conversation: {
        conversationId: '123'
      },
      params: {},
      _body: {},
      headers: {},
      url: 'http://localhost',
      statusCode: 200,
      statusMessage: 'ok'
    };
    const mockRes = {
      statusCode: 200
    };
    const mockRoute = {
      spec: { path: '' }
    };
    (restServer as any).onRouterAfter(mockReq, mockRes, mockRoute);

    expect(logSpy).toHaveBeenCalledWith('123', {
        'payload': {
          'body': {},
          'facility': 'network',
          'headers': {},
          'method': 'post',
          'url': 'http://localhost'
        }, 'type': 'network-request'
      },
      {
        'payload': {
          'body': undefined,
          'headers': undefined,
          'srcUrl': 'http://localhost',
          'statusCode': 200,
          'statusMessage': undefined
        }, 'type': 'network-response'
      },
      { 'payload': { 'level': 0, 'text': 'network.' }, 'type': 'text' });
  });

  it('should create a new conversation and open a new livechat window', async () => {
    const remoteCallSpy = jest.spyOn(mainWindow.commandService, 'remoteCall').mockResolvedValue(true);
    const reportSpy = jest.spyOn(emulator, 'report');
    const mockConversation = {
      conversationId: '123',
      botEndpoint: { id: '456', url: 'https://localhost' }
    };
    await (restServer as any).onNewConversation(mockConversation);
    expect(remoteCallSpy).toHaveBeenCalledWith('livechat:new', { 'endpoint': undefined, 'id': '456' });
    expect(reportSpy).toHaveBeenCalledWith('123');

    remoteCallSpy.mockReset();
    reportSpy.mockReset();
  });

  it('should not create a new conversation when the conversationId contains "transcript"', async () => {
    const remoteCallSpy = jest.spyOn(mainWindow.commandService, 'remoteCall').mockResolvedValue(true);
    const reportSpy = jest.spyOn(emulator, 'report');
    const mockConversation = {
      conversationId: 'transcript',
      botEndpoint: { id: '456', url: 'https://localhost' }
    };
    await (restServer as any).onNewConversation(mockConversation);
    expect(remoteCallSpy).not.toHaveBeenCalled();
    expect(reportSpy).not.toHaveBeenCalled();
  });

  it('should begin listening when listen is called', async () => {
    const result = await restServer.listen();
    expect(result).toEqual(
      {
        'url': jasmine.any(String),
        'port': jasmine.any(Number)
      }
    );
  });

  it('should close the server when close is called', async () => {
    const result = await restServer.close();
    expect(result).toBeUndefined();
  });

});
