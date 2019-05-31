import { BotEmulator } from '../botEmulator';
import { RequestHandler, Server } from 'restify';
import { getFile } from './middleware/getFile';

export default function registerRoutes(botEmulator: BotEmulator, server: Server, uses: RequestHandler[]): void {
  server.get('/extension/:extensionId/.*', getFile);
}
