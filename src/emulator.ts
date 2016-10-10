import { DirectLineServer } from './directLine/directLineServer';
import { FrameworkServer } from './framework/frameworkServer';
import { ConversationStore } from './conversationStore';
import { ISettings } from './settings';

class Emulator {
    directLineServer = new DirectLineServer();
    frameworkServer = new FrameworkServer();
    conversationStore = new ConversationStore();
}

export var emulator: Emulator;

export const configure = (settings: ISettings) => {
    emulator = emulator || new Emulator();
    console.log(`Applying: ${settings}`);
    emulator.directLineServer.configure(settings.directLineSettings);
    emulator.frameworkServer.configure(settings.frameworkSettings);
}
