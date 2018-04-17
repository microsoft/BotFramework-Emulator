const { ipcRenderer } = window['require']('electron');

import { css } from 'glamor';
import * as React from 'react';
import * as crypto from 'crypto';
import { SettingsService } from '../../../../platform/settings/settingsService';
import { Extension, InspectorAPI } from '../../../../extensions';
import { IExtensionInspector } from '@bfemulator/sdk-shared';

const CSS = css({
  width: '100%',
  height: '100%'
});

export interface InspectorProps {
  extension: Extension;
  inspector: IExtensionInspector;
  document: any;
  inspectObj: any;
  enableAccessory: (id: string, enable: boolean) => void;
  setAccessoryState: (id: string, state: string) => void;
  setInspectorTitle: (title: string) => void;
}

export class Inspector extends React.Component<InspectorProps> {

  ref: any; //HTMLWebViewElement;

  constructor(props, context) {
    super(props, context);
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

  componentDidUpdate(prevProps: InspectorProps, prevState: any, prevContext: any): void {
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
