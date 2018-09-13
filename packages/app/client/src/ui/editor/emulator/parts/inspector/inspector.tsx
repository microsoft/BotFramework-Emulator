//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// Cheating here and pulling in a module from node. Can be easily replaced if we ever move the emulator to the web.
import { logEntry, textItem } from '@bfemulator/emulator-core/lib/types/log/util';
import LogLevel from '@bfemulator/emulator-core/lib/types/log/level';
import { ExtensionInspector } from '@bfemulator/sdk-shared';
import { IBotConfiguration } from 'botframework-config/lib/schema';
import * as React from 'react';
import { Extension, InspectorAPI } from '../../../../../extensions';
import { LogService } from '../../../../../platform/log/logService';
import { SettingsService } from '../../../../../platform/settings/settingsService';
import * as styles from './inspector.scss';

interface IpcMessageEvent extends Event {
  channel: string;
  args: any[];
}

interface InspectorProps extends InspectorState {
  extension: Extension;
  inspector: ExtensionInspector;
  document: any;
  enableAccessory: (id: string, enable: boolean) => void;
  setAccessoryState: (id: string, state: string) => void;
  setInspectorTitle: (title: string) => void;
}

interface InspectorState {
  titleOverride?: string;
  activeBot?: IBotConfiguration;
  botHash?: string;
  extensionSource?: string;
  inspectObj: { [propName: string]: any };
  themeInfo: { themeName: string, themeComponents: string[] };
}

declare type ElectronHTMLWebViewElement = HTMLWebViewElement & { send: (...args: any[]) => void };

export class Inspector extends React.Component<InspectorProps, InspectorState> {
  get state(): InspectorState {
    return this._state;
  }

  set state(value: InspectorState) {
    const oldState = this.state;
    this._state = value;
    this.stateChanged(value, oldState);
  }

  private _state = {} as InspectorState;
  private containerRef: HTMLDivElement;
  private webViewByLocation: { [location: string]: ElectronHTMLWebViewElement } = {};

  public static getDerivedStateFromProps(newProps: InspectorProps, prevState: InspectorState): InspectorState {
    const { inspector = { src: '' } } = newProps;
    if (newProps.botHash !== prevState.botHash ||
      inspector.src !== prevState.extensionSource ||
      newProps.themeInfo.themeName !== prevState.themeInfo.themeName ||
      JSON.stringify(newProps.inspectObj) !== JSON.stringify(prevState.inspectObj)) {
      return {
        ...prevState,
        activeBot: newProps.activeBot,
        botHash: newProps.botHash,
        extensionSource: inspector.src,
        inspectObj: newProps.inspectObj,
        themeInfo: newProps.themeInfo
      };
    }
    return null;
  }

  public shouldComponentUpdate(nextProps: InspectorProps, nextState: InspectorState, nextContext: any): boolean {
    return false; // always false
  }

  public componentDidMount() {
    window.addEventListener('toggle-inspector-devtools', this.toggleDevTools);
    this.updateInspector(this.props);
  }

  public componentWillUnmount() {
    window.removeEventListener('toggle-inspector-devtools', this.toggleDevTools);
  }

  public render() {
    return (<div ref={ this.webViewContainer } className={ styles.inspector }>&nbsp;</div>);
  }

  private stateChanged(newState: InspectorState, oldState: InspectorState): void {
    if (oldState.botHash !== newState.botHash) {
      this.botUpdated(newState.activeBot);
    }
    if (oldState.extensionSource !== newState.extensionSource) {
      this.updateInspector(this.props);
    }
    if (JSON.stringify(oldState.inspectObj) !== JSON.stringify(newState.inspectObj)) {
      this.inspect(newState.inspectObj);
    }
    if ((oldState.themeInfo || { themeName: '' }).themeName !== newState.themeInfo.themeName) {
      this.sendToInspector('theme', newState.themeInfo);
    }
  }

  private updateInspector(props: InspectorProps): void {
    const { src } = (props.inspector || { src: '' });
    const { webViewByLocation: webViews, containerRef } = this;
    const nextInspector = webViews[src] || (webViews[src] = this.createWebView(props));
    nextInspector.style.display = '';
    this.sendInitializationStackToInspector();

    if (!containerRef) {
      return;
    }
    if (!this.containerRef.contains(nextInspector)) {
      this.containerRef.appendChild(nextInspector);
    }
    Array.prototype.forEach.call(containerRef.children, child => {
      if (child !== nextInspector) {
        child.style.display = 'none';
      }
    });
  }

  private createWebView(props: InspectorProps): ElectronHTMLWebViewElement {
    const { cwdAsBase } = SettingsService.emulator;
    const preload = `file://${cwdAsBase}/../../../node_modules/@bfemulator/client/public/inspector-preload.js`;

    const webView: ElectronHTMLWebViewElement = document.createElement('webview');
    webView.className = styles.inspector;
    webView.setAttribute('partition', `persist:${props.botHash}`);
    webView.setAttribute('preload', preload);
    webView.setAttribute('src', props.inspector.src);
    webView.addEventListener('dragenter', this.onInspectorDrag, true);
    webView.addEventListener('dragover', this.onInspectorDrag, true);
    webView.addEventListener('dom-ready', this.onWebViewDOMReady);
    webView.addEventListener('ipc-message', this.ipcMessageEventHandler);

    return webView;
  }

  private webViewContainer = (ref: HTMLDivElement): void => {
    this.containerRef = ref;
  }

  private toggleDevTools = (): void => {
    this.sendToInspector('toggle-dev-tools');
  }

  private canInspect(inspectObj: any): boolean {
    return this.props.inspector.name === 'JSON' || InspectorAPI.canInspect(this.props.inspector, inspectObj);
  }

  private onWebViewDOMReady = (event: Event) => {
    event.currentTarget.removeEventListener('domready', this.onWebViewDOMReady);
    this.sendInitializationStackToInspector();
  }

  private ipcMessageEventHandler = (event: IpcMessageEvent): void => {
    // TODO - localization
    const { channel } = event;
    switch (channel) {
      case 'enable-accessory':
        this.props.enableAccessory(event.args[0], event.args[1]);
        break;

      case 'set-accessory-state':
        this.props.setAccessoryState(event.args[0], event.args[1]);
        break;

      case 'set-inspector-title':
        this.setState({ titleOverride: event.args[0] });
        this.props.setInspectorTitle(event.args[0]);
        break;

      case 'logger.log':
      case 'logger.error':
        const logLevel = channel === 'logger.log' ? LogLevel.Info : LogLevel.Error;
        const { documentId } = this.props.document;
        const inspectorName = this._state.titleOverride || this.props.inspector.name || 'inspector';
        const text = `[${inspectorName}] ${event.args[0]}`;
        LogService.logToDocument(documentId, logEntry(textItem(logLevel, text)));
        break;

      default:
        console.warn('Unexpected message from inspector', event.channel, ...event.args);
    }
  }

  private sendInitializationStackToInspector(): void {
    this.botUpdated(this.state.activeBot);
    this.inspect(this.state.inspectObj);
    this.sendToInspector('theme', this.state.themeInfo);
  }

  private inspect(obj: any) {
    if (this.canInspect(obj)) {
      this.sendToInspector('inspect', obj);
    }
  }

  private botUpdated(bot: IBotConfiguration) {
    this.sendToInspector('bot-updated', bot);
  }

  private sendToInspector(channel: any, ...args: any[]) {
    const inspector = this.webViewByLocation[this.props.inspector.src];
    if (!inspector) {
      return;
    }
    try {
      inspector.send(channel, ...args);
    } catch (e) {
      console.error(e);
    }
  }

  private onInspectorDrag = (event: DragEvent): void => {
    // prevent drag & drops inside of the inspector panel
    event.stopPropagation();
  }
}
