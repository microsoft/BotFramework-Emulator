import * as Restify from 'restify';

import BotEmulator from '../../botEmulator';

export default function getConversation(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    req['conversation'] = botEmulator.facilities.conversations.conversationById(req.params.conversationId);

    next();
  };
}
