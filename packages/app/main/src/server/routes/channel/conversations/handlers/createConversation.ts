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

import { BAD_REQUEST, CREATED } from 'http-status-codes';
import { Next, Request, Response } from 'restify';

import { BotEndpoint } from '../../../../state/botEndpoint';
import { EmulatorRestServer } from '../../../../restServer';

function validateRequest(payload): any {
  if (!payload.bot) {
    return new Error('Missing bot object in request.');
  } else if (!payload.botEndpoint) {
    return new Error('Missing botEndpoint object in request.');
  } else if (payload.members.length !== 1 || payload.members[0].role !== 'user') {
    return new Error('Missing user inside of members array in request.');
  }
}

export function createCreateConversationHandler(emulatorServer: EmulatorRestServer) {
  return (req: Request, res: Response, next: Next): any => {
    const validationResult = validateRequest({
      ...req.body,
      botEndpoint: (req as any).botEndpoint,
    });
    if (validationResult) {
      res.send(BAD_REQUEST, validationResult);
      res.end();
      return next();
    }

    const { members, mode } = req.body;
    const { botEndpoint }: { botEndpoint: BotEndpoint } = req as any;
    const { conversations } = emulatorServer.state;

    const conversation = conversations.newConversation(
      emulatorServer,
      botEndpoint,
      members[0],
      undefined, // generate a conversation id
      mode
    );
    res.send(CREATED, {
      conversationId: conversation.conversationId,
      endpointId: botEndpoint.id,
      members: conversation.members,
      id: conversation.conversationId,
    });
    res.end();
    next();
  };
}
