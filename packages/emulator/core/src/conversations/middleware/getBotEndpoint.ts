import * as Restify from 'restify';

import BotEmulator from '../../botEmulator';

export default function getBotEndpoint(botEmulator: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    // TODO: We need to know how to find the correct endpoint from user
    //       We can find out the app ID from JWT
    //       But what if the bot does not supply app ID
    //       Only "createConversation from bot" use this function

    //       { header:
    //         { typ: 'JWT',
    //           alg: 'RS256',
    //           x5t: 'FSimuFrFNoC0sJXGmv13nNZceDc',
    //           kid: 'FSimuFrFNoC0sJXGmv13nNZceDc' },
    //         payload:
    //         { aud: 'https://api.botframework.com',
    //           iss: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
    //           iat: 1524702525,
    //           nbf: 1524702525,
    //           exp: 1524706425,
    //           aio: 'Y2dgYOjiffRgz8v9D1dum12cW/vrOgA=',
    //           appid: '31e41702-aedd-4a84-85ee-4239332360f1',
    //           appidacr: '1',
    //           idp: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
    //           tid: 'd6d49420-f39b-4df7-a1dc-d59a935871db',
    //           uti: 'ZPtC8TT5bk-41eVUsOAAAA',
    //           ver: '1.0' },

    req['botEndpoint'] = botEmulator.facilities.endpoints.getEndpoint(req['jwt'].payload.appid);
  };
}
