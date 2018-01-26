
import * as WebChat from 'botframework-webchat';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IEmulatorState {
    botConnection: WebChat.IBotConnection;
}

class NullConnection implements WebChat.IBotConnection {
    public connectionStatus$: BehaviorSubject<WebChat.ConnectionStatus>;
    public activity$: Observable<WebChat.Activity>;
    constructor() {
        this.connectionStatus$ = new BehaviorSubject<WebChat.ConnectionStatus>(WebChat.ConnectionStatus.Uninitialized);
        this.activity$ = Observable.empty();
    }
    end() {}
    postActivity(activity: WebChat.Activity): Observable<string> { return Observable.empty(); }
}

export default function state(): IEmulatorState {
    if (!global["emulator"]) {
        global["emulator"] = <IEmulatorState> {
            botConnection: new NullConnection()
        };
    }
    return global['emulator'];
}
