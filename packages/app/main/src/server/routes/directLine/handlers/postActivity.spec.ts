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

import * as HttpStatus from 'http-status-codes';

import { createPostActivityHandler } from './postActivity';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

const mockSocket = {
  send: jest.fn(),
};

jest.mock('../../../webSocketServer', () => {
  return {
    WebSocketServer: {
      sendToSubscribers: (...args) => mockSocket.send(...args),
    },
  };
});

describe('postActivity handler', () => {
  beforeEach(() => {
    mockSendErrorResponse.mockClear();
    mockSocket.send.mockClear();
  });

  it('should return a 200 and the id of the posted activity', async () => {
    const activity = {
      id: 'activity1',
    };

    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };

    const req: any = {
      body: activity,
      conversation: {
        postActivityToBot: jest.fn().mockResolvedValueOnce({
          updatedActivity: activity,
          response: {},
          statusCode: HttpStatus.OK,
        }),
        conversationId: 'convo1',
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const postActivity = createPostActivityHandler(mockEmulatorServer);
    await postActivity(req, res);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, activity);
    expect(res.end).toHaveBeenCalled();
    expect(mockSocket.send).toHaveBeenCalledWith(req.params.conversationId, activity);
  });

  it('should return a 200 but not send the /INSPECT open command over the web socket', async () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const activity = {
      id: 'activity1',
      text: '/INSPECT open',
      type: 'message',
    };
    const req: any = {
      body: activity,
      conversation: {
        postActivityToBot: jest.fn().mockResolvedValueOnce({
          updatedActivity: activity,
          response: {},
          statusCode: HttpStatus.OK,
        }),
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const postActivity = createPostActivityHandler(mockEmulatorServer);
    await postActivity(req, res);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, { id: 'activity1' });
    expect(res.end).toHaveBeenCalled();
    expect(mockSocket.send).not.toHaveBeenCalled();
  });

  it('should return a 401 if the request is unauthorized', async () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const req: any = {
      body: {
        id: 'activity1',
      },
      conversation: {
        postActivityToBot: jest.fn().mockResolvedValueOnce({
          updatedActivity: {},
          response: {
            text: jest.fn().mockResolvedValueOnce('Unauthorized'),
          },
          statusCode: HttpStatus.UNAUTHORIZED,
        }),
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const postActivity = createPostActivityHandler(mockEmulatorServer);
    await postActivity(req, res);

    expect(mockEmulatorServer.logger.logMessage).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED, 'Unauthorized');
    expect(res.end).toHaveBeenCalled();
  });

  it('should return a 403 if the request is forbidden', async () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const req: any = {
      body: {
        id: 'activity1',
      },
      conversation: {
        postActivityToBot: jest.fn().mockResolvedValueOnce({
          activityId: 'activity1',
          response: {
            text: jest.fn().mockResolvedValueOnce('Forbidden'),
          },
          statusCode: HttpStatus.FORBIDDEN,
        }),
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const postActivity = createPostActivityHandler(mockEmulatorServer);
    await postActivity(req, res);

    expect(mockEmulatorServer.logger.logMessage).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(HttpStatus.FORBIDDEN, 'Forbidden');
    expect(res.end).toHaveBeenCalled();
  });

  it('should return the status code of a failed request other than a 401 or 403', async () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const req: any = {
      body: {
        id: 'activity1',
      },
      conversation: {
        postActivityToBot: jest.fn().mockResolvedValueOnce({
          activityId: 'activity1',
          response: {
            text: jest.fn().mockResolvedValueOnce('Bad request'),
          },
          statusCode: HttpStatus.BAD_REQUEST,
        }),
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const postActivity = createPostActivityHandler(mockEmulatorServer);
    await postActivity(req, res);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST, 'Bad request');
    expect(res.end).toHaveBeenCalled();
  });

  it('should return a 500 if the request failed for some reason and there is no status code', async () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const req: any = {
      body: {
        id: 'activity1',
      },
      conversation: {
        postActivityToBot: jest.fn().mockResolvedValueOnce({
          activity: undefined,
          response: {
            message: 'Request failed',
            status: undefined,
          },
          statusCode: undefined,
        }),
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const postActivity = createPostActivityHandler(mockEmulatorServer);
    await postActivity(req, res);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR, {
      message: 'Request failed',
      status: undefined,
    });
    expect(res.end).toHaveBeenCalled();
  });

  it('should send a 404 if the conversation is not attached to the request', async () => {
    const mockEmulatorServer: any = {
      logger: {
        logMessage: jest.fn(),
      },
    };
    const req: any = {
      conversation: undefined,
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const postActivity = createPostActivityHandler(mockEmulatorServer);
    await postActivity(req, res);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.NOT_FOUND, 'conversation not found');
    expect(res.end).toHaveBeenCalled();
    expect(mockEmulatorServer.logger.logMessage).toHaveBeenCalled();
  });
});
