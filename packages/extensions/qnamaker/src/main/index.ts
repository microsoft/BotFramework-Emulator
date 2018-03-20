import { IPC, CommandService } from '@bfemulator/sdk-shared';
import { ProcessIPC, WebSocketIPC, stayAlive } from '@bfemulator/sdk-main';
const config = require('../bf-extension.json');

/**
 * READ READ: All the junk below will be rolled into a tidy extension SDK that is TBD.
 * We're defining its internals here! right now!
 */


stayAlive();

console.log(`QnA Maker running. pid: ${process.pid}`);

let ipc: IPC;

if (process.send) {
  // We're a child process
  ipc = new ProcessIPC(process);
} else {
  // We're a peer process
  ipc = new WebSocketIPC();
  ipc.id = process.pid;
  const connector = new CommandService(ipc, 'connector');
  connector.on('hello', () => {
    return {
      id: ipc.id,
      config
    }});
}

const commands = new CommandService(ipc, `ext-${ipc.id}`);

//commands.remoteCall('ext-ping')
//  .then(reply => console.log(reply))
//  .catch(err => console.log('ping failed', err));

commands.registry.registerCommand('connect', () => {
  console.log('[QnA Maker] got connect');
});

commands.registry.registerCommand('disconnect', () => {
  console.log('[QnA Maker] got disconnect');
  process.exit();
});

commands.registry.registerCommand('ext-ping', () => {
  return '[QnA Maker] ext-pong';
});
