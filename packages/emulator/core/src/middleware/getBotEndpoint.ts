import * as Restify from 'restify';

import BotEmulator from '../botEmulator';
import BotEndpoint from '../facility/botEndpoint';

export default function getBotEndpoint(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const auth = req.header('Authorization');

    // TODO: We should not use token as conversation ID
    const tokenMatch = /Bearer\s+(.+)/.exec(auth);
    const botEndpoint = botEmulator.facilities.endpoints.getEndpoint(tokenMatch[1]) || botEmulator.facilities.endpoints.getDefaultEndpoint();

    if (botEndpoint) {
      req['botEndpoint'] = botEndpoint;

      next();
    } else {
      res.status(404);
      res.end();
    }
  };
}
