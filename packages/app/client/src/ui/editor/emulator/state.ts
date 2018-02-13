
import * as WebChat from 'custom-botframework-webchat';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IEmulatorState {
  botConnection: WebChat.IBotConnection;
}

class NullConnection implements WebChat.IBotConnection {
  public connectionStatus$: any; //BehaviorSubject<WebChat.ConnectionStatus>;
  public activity$: any; //Observable<WebChat.Activity>;
  constructor() {
    this.connectionStatus$ = <any>(new BehaviorSubject<WebChat.ConnectionStatus>(WebChat.ConnectionStatus.Uninitialized));
    this.activity$ = Observable.empty();
  }
  end() { }
  postActivity(activity: WebChat.Activity): any /*Observable<string>*/ { return Observable.empty(); }
}

export default function state(): IEmulatorState {
  if (!global["emulator"]) {
    global["emulator"] = <IEmulatorState>{
      botConnection: <any>(new NullConnection())
    };
  }
  return global['emulator'];
}
