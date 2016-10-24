import { getStore, getSettings, authenticationSettings } from './settings';
import * as jwt from 'jsonwebtoken';
import * as oid from './OpenIdMetadata';
import * as Restify from 'restify';

export class BotFrameworkAuthentication {
    private msaOpenIdMetadata: oid.OpenIdMetadata;

    constructor() {
        this.msaOpenIdMetadata = new oid.OpenIdMetadata(authenticationSettings.msaOpenIdMetadata);
    }

    registerAuth = (server: Restify.Server) => {
        server.use((req: Restify.Request, res: Restify.Response, next: Restify.Next) =>
        {
            this.verifyBotFramework(req, res, next);
        });
    }

    private verifyBotFramework(req: Restify.Request, res: Restify.Response, next: Restify.Next): void {
        var token: string;
        if (req.headers && req.headers.hasOwnProperty('authorization')) {
            var auth = req.headers['authorization'].trim().split(' ');;
            if (auth.length == 2 && auth[0].toLowerCase() == 'bearer') {
                token = auth[1];
            }
        }
        const activeBot = getSettings().getActiveBot();
        // Verify token
        if (token) {

            let decoded = jwt.decode(token, { complete: true });
            this.msaOpenIdMetadata.getKey(decoded.header.kid, key => {
                if (key) {
                    try {
                        var verifyOptions = {
                            jwtId: activeBot.botId,
                            issuer: authenticationSettings.msaIssuer,
                            audience: authenticationSettings.msaAudience,
                            clockTolerance: 300
                        };

                        jwt.verify(token, key, verifyOptions);
                    } catch (err) {
                        res.status(401);
                        res.end();
                        return;
                    }

                    next();
                } else {
                    res.status(500);
                    res.end();
                    return;
                }
            });
        } else if (!activeBot.msaAppId && !activeBot.msaPassword) {
              // Emulator running without auth enabled
            next();
        } else {
            // Token not provided so
            res.status(401);
            res.end();
        }
    }

}

