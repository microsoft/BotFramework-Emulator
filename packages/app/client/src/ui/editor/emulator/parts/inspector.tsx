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

  componentDidMount(): void {
    if (this.ref) {
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

  componentWillReceiveProps(nextProps: InspectorProps, nextContext: any): void {
    this.inspect(nextProps.obj);
  }

  render() {
    const md5 = crypto.createHash('md5');
    md5.update(this.props.inspector.src);
    const hash = md5.digest('base64');
    return (
      <webview { ...CSS }
        key={ hash }
        partition={ `persist:${hash}` }
        preload={ `file://${SettingsService.emulator.cwdAsBase}/../../node_modules/@bfemulator/client/build/inspector-preload.js` }
        ref={ ref => this.ref = ref }
        src={ this.props.inspector.src }
      />
    );
  }
}
