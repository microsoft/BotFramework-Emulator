const { ipcRenderer } = window['require']('electron');
const crypto = window['require']('crypto'); // Cheating here and pulling in a module from node. Can be easily replaced if we ever move the emulator to the web.

import { css } from 'glamor';
import * as React from 'react';
import { SettingsService } from '../../../../platform/settings/settingsService';
import { Extension, InspectorAPI } from '../../../../extensions';
import { IBotConfig, IExtensionInspector } from '@bfemulator/sdk-shared';
import { getActiveBot } from '../../../../data/botHelpers';

const CSS = css({
  width: '100%',
  height: '100%'
});

interface InspectorProps {
  bot: IBotConfig;
  extension: Extension;
  inspector: IExtensionInspector;
  document: any;
  inspectObj: any;
  enableAccessory: (id: string, enable: boolean) => void;
  setAccessoryState: (id: string, state: string) => void;
  setInspectorTitle: (title: string) => void;
}

interface InspectorState {
  botHash: string;
}

export class Inspector extends React.Component<InspectorProps, InspectorState> {

  ref: any; //HTMLWebViewElement;

  constructor(props, context) {
    super(props, context);
    this.state = {
      botHash: this.hash(getActiveBot())
    };
  }
  
  componentDidMount() {
    window.addEventListener('toggle-inspector-devtools', () => this.toggleDevTools());
  }
  
  componentWillUnmount() {
    window.removeEventListener('toggle-inspector-devtools', () => this.toggleDevTools());    
  }
  
  hash(obj: object): string {
    const md5 = crypto.createHash('md5');
    md5.update(JSON.stringify(obj));
    return md5.digest('base64');
  }

  toggleDevTools() {
    if (this.ref) {
      this.ref.send('toggle-dev-tools');
    }
  }

  accessoryClick(id: string) {
    if (this.ref) {
      this.ref.send('accessory-click', id);
    }
  }

  canInspect(inspectObj: any): boolean {
    return this.props.inspector.name === 'JSON' || InspectorAPI.canInspect(this.props.inspector, inspectObj);
  }

  updateRef = (ref) => {
    this.ref = ref;
    if (ref) {
      this.ref.addEventListener('dom-ready', ev => {
        this.botUpdated(getActiveBot());
        this.inspect(this.props.inspectObj);
      });
      this.ref.addEventListener('ipc-message', ev => {
        if (ev.channel === 'enable-accessory') {
          this.props.enableAccessory(ev.args[0], ev.args[1]);
        } else if (ev.channel === 'set-accessory-state') {
          this.props.setAccessoryState(ev.args[0], ev.args[1]);
        } else if (ev.channel === 'set-inspector-title') {
          this.props.setInspectorTitle(ev.args[0]);
        } else {
          console.warn("Unexpected message from inspector", ev.channel, ...ev.args);
        }
      });
    }
  }

  inspect(obj: any) {
    if (this.ref && this.canInspect(obj)) {
      this.ref.send('inspect', obj);
    }
  }
  
  botUpdated(bot: IBotConfig) {
    if (this.ref) {
      this.ref.send('bot-updated', bot);
    }
  }
  
  componentDidUpdate(prevProps: InspectorProps, prevState: any, prevContext: any): void {
    const botHash = this.hash(getActiveBot());
    if (botHash != this.state.botHash) {
      this.setState({
        botHash
      });
      this.botUpdated(getActiveBot());
    }
    if (prevProps.inspectObj && this.props.inspectObj) {
      if (JSON.stringify(prevProps.inspectObj) !== JSON.stringify(this.props.inspectObj)) {
        this.inspect(this.props.inspectObj);
      }
    } else {
      this.inspect(this.props.inspectObj);
    }
  }

  render() {
    const md5 = crypto.createHash('md5');
    md5.update(this.props.inspector.src);
    const hash = md5.digest('base64');
    return (
      <webview { ...CSS }
        webpreferences="webSecurity=no"
        key={ hash }
        partition={ `persist:${hash}` }
        preload={ `file://${SettingsService.emulator.cwdAsBase}/../../node_modules/@bfemulator/client/build/inspector-preload.js` }
        ref={ ref => this.updateRef(ref) }
        src={ this.props.inspector.src }
      />
    );
  }
}
