const { ipcRenderer } = window['require']('electron');

import { css } from 'glamor';
import * as React from 'react';
import * as crypto from 'crypto';
import { SettingsService } from '../../../../platform/settings/settingsService';
import { Extension } from '../../../../extensions';

const CSS = css({
  width: '100%',
  height: '100%'
});

export interface Props {
  inspector: any;
  document: any;
  src: string;
  obj: any;
}

export class Inspector extends React.Component<Props> {

  ref: any; //HTMLWebViewElement;

  constructor(props, context) {
    super(props, context);
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

  inspect(obj) {
    if (this.ref) {
      if (this.props.inspector.name === "JSON" || Extension.canInspect(this.props.inspector, obj)) {
        this.ref.send('inspect', obj);
      }
    }
  }

  componentWillReceiveProps(nextProps: Props, nextContext: any): void {
    this.inspect(nextProps.obj);
  }

  componentDidUpdate(prevProps: Props, prevState: any, prevContext: any): void {
  }

  onMessage = () => {
  }

  render() {
    const md5 = crypto.createHash('md5');
    md5.update(this.props.src);
    const hash = md5.digest('base64');
    let cwd = SettingsService.emulator.cwd;
    if (!cwd.startsWith('/'))
      cwd = `/${cwd}`;
    return (
      <webview { ...CSS }
        partition={ `persist:${hash}` }
        preload={ `file://${cwd}/../../node_modules/@bfemulator/client/build/inspector-preload.js` }
        ref={ ref => this.ref = ref }
        src={ this.props.src }
      />
    );
  }
}
