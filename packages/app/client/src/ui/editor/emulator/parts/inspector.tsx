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
  obj: any;
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

  canInspect(obj: any): boolean {
    return this.props.inspector.name === 'JSON' || InspectorAPI.canInspect(this.props.inspector, obj);
  }

  updateRef = (ref) => {
    this.ref = ref;
    if (ref) {
      this.ref.addEventListener('dom-ready', (e) => {
        this.inspect(this.props.obj);
      })
      this.ref.addEventListener('ipc-message', (ev, ...args) => {
        console.log("message from inspector", ...args);
      });
    }
  }

  inspect(obj: any) {
    if (this.ref && this.canInspect(obj)) {
      this.ref.send('inspect', obj);
    }
  }

  componentDidUpdate(prevProps: InspectorProps, prevState: any, prevContext: any): void {
    if (prevProps.obj && this.props.obj) {
      if (JSON.stringify(prevProps.obj) !== JSON.stringify(this.props.obj)) {
        this.inspect(this.props.obj);
      }
    } else {
      this.inspect(this.props.obj);
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
