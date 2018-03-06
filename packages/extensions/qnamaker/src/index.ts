import { IPC, CommandService } from '@bfemulator/sdk-shared';
import { ProcessIPC, stayAlive } from '@bfemulator/sdk-main';
const config = require('../bf-extension.json');

stayAlive();

console.log(`QnA Maker running. pid: ${process.pid}`);

let ipc: IPC;

//if (process.send) {
// We're a child process
ipc = new ProcessIPC(process);
//} else {
// We're a peer process
//ipc = new WebSocketIPC(...)
//}

const commands = new CommandService(ipc, `ext-${config.name}`);

commands.remoteCall('ext-ping')
  .then(reply => console.log(reply))
  .catch(err => console.log('ping failed', err));

commands.registry.registerCommand('connect', () => {
  //console.log('got connect');
});

commands.registry.registerCommand('disconnect', () => {
  //console.log('got disconnect');
  process.exit();
});

commands.registry.registerCommand('ext-ping', () => {
  return 'ext-pong';
});