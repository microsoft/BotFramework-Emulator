import * as log from 'npmlog';
import * as Restify from 'restify';
import IGenericActivity from '@bfemulator/emulator-core/lib/types/activity/generic';
import ILogger from '@bfemulator/emulator-core/lib/types/logger';

function shortId(id) {
  return [id.substr(0, 3), id.substr(-5)].join('...');
}

export default class NpmLogger implements ILogger {
  logActivity(conversationId: string, activity: IGenericActivity, destination: string) {
    log.verbose(shortId(conversationId), `Sending activity to ${ destination }`, activity);
  }

  logError(conversationId: string, err: any, ...messages: any[]) {
    log.error(shortId(conversationId), err, ...messages);
  }

  logInfo(conversationId: string, ...messages: any[]) {
    log.info(shortId(conversationId), ...messages);
  }

  logRequest(conversationId: string, source: string, req: Restify.Request, ...messages: any[]) {
    log.http(shortId(conversationId), `Receiving request from ${ source } at ${ req.method } ${ req.url }`, ...messages);
  }

  logResponse(conversationId: string, destination: string, res: Restify.Response, ...messages: any[]) {
    log.http(shortId(conversationId), `Sending response to ${ destination } with HTTP ${ res.statusCode }`, ...messages);
  }

  logTrace(conversationId: string, ...messages: any[]) {
    log.silly(shortId(conversationId), ...messages);
  }

  logWarning(conversationId: string, ...messages: any[]) {
    log.warn(shortId(conversationId), ...messages);
  }
}
