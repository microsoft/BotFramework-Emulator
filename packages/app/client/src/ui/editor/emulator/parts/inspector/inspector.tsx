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
import {
  ExtensionInspector,
  InspectorAccessory,
  logEntry,
  LogLevel,
  luisEditorDeepLinkItem,
  textItem,
} from '@bfemulator/sdk-shared';
import { PrimaryButton, Spinner } from '@bfemulator/ui-react';
import { IBotConfiguration } from 'botframework-config/lib/schema';
import * as React from 'react';

import { ExtensionManager, GetInspectorResult, InspectorAPI } from '../../../../../extensions';
import { LogService } from '../../../../../platform/log/logService';
import Panel, { PanelContent, PanelControls } from '../../../panel/panel';

import * as styles from './inspector.scss';

interface InspectObject {
  [key: string]: any;
}

interface GetInspectorResultInternal {
  response: GetInspectorResult;
  inspectObj: InspectObject;
}

interface AccessoryButton {
  config: InspectorAccessory;
  state: string;
  enabled: boolean;
}

interface IpcMessageEvent extends Event {
  channel: string;
  args: any[];
}

interface InspectorProps {
  document: any;
  cwdAsBase: string;
  themeInfo: { themeName: string; themeComponents: string[] };
  activeBot?: IBotConfiguration;
  botHash?: string;
  trackEvent?: (name: string, properties?: { [key: string]: any }) => void;
}

interface InspectorState {
  titleOverride?: string;
  activeBot?: IBotConfiguration;
  botHash?: string;
  inspectorSrc?: string;
  inspectObj: InspectObject;
  themeInfo: { themeName: string; themeComponents: string[] };
  inspector: ExtensionInspector;
  buttons: AccessoryButton[];
  title: string;
  containerRef: HTMLDivElement;
}

declare type ElectronHTMLWebViewElement = HTMLWebViewElement & {
  send: (...args: any[]) => void;
};

export class Inspector extends React.Component<InspectorProps, InspectorState> {
  private static renderAccessoryIcon(icon: string) {
    if (icon === 'Spinner') {
      return <Spinner segmentRadius={2} width={25} height={25} />;
    } else if (icon) {
      return <i className={`${styles.accessoryButtonIcon} ms-Icon ms-Icon--${icon}`} aria-hidden="true" />;
    } else {
      return false;
    }
  }

  public get state(): InspectorState {
    return this._state;
  }

  public set state(value: InspectorState) {
    const oldState = this.state;
    this._state = value;
    this.stateChanged(value, oldState);
  }

  private _state = {} as InspectorState;
  private webViewByLocation: {
    [location: string]: ElectronHTMLWebViewElement;
  } = {};

  public static getDerivedStateFromProps(newProps: InspectorProps, prevState: InspectorState): InspectorState {
    const { document = {} } = newProps;
    const inspectorResult = Inspector.getInspector(document.inspectorObjects);
    const { inspector = { name: '' } } = inspectorResult.response;

    if (
      newProps.botHash !== prevState.botHash ||
      inspector.src !== prevState.inspectorSrc ||
      newProps.themeInfo.themeName !== prevState.themeInfo.themeName ||
      JSON.stringify(inspectorResult.inspectObj) !== JSON.stringify(prevState.inspectObj)
    ) {
      return {
        ...prevState,
        activeBot: newProps.activeBot,
        botHash: newProps.botHash,
        inspector,
        inspectorSrc: inspector.src,
        inspectObj: inspectorResult.inspectObj,
        themeInfo: newProps.themeInfo,
        title: inspector.name,
        buttons: Inspector.getButtons(inspector.accessories),
      };
    }
    return null;
  }

  private static getInspector(inspectorObjects: InspectObject[] = []): GetInspectorResultInternal {
    const obj = inspectorObjects[0];

    return {
      inspectObj: obj,
      // Find an inspector for this object.
      response: obj ? ExtensionManager.inspectorForObject(obj, true) || {} : ({} as any),
    };
  }

  private static getButtons(accessories: InspectorAccessory[] = []): AccessoryButton[] {
    return accessories
      .map(config => {
        // Accessory must have a "default" state to be added
        if (config && config.states.default) {
          return {
            config,
            state: 'default',
            enabled: true,
          };
        } else {
          return null;
        }
      })
      .filter(accessoryState => !!accessoryState);
  }

  public componentDidMount() {
    window.addEventListener('toggle-inspector-devtools', this.toggleDevTools);
    this.updateInspector(this.state);
  }

  public componentWillUnmount() {
    window.removeEventListener('toggle-inspector-devtools', this.toggleDevTools);
  }

  public render() {
    if (this.state.inspector && this.state.inspectObj) {
      return (
        <div className={styles.detailPanel}>
          <Panel title={['inspector', this.state.title].filter(s => s && s.length).join(' - ')}>
            {this.renderAccessoryButtons()}
            <PanelContent>
              <div className={styles.inspectorContainer} tabIndex={0}>
                <div ref={this.webViewContainer} className={styles.webViewContainer} />
              </div>
            </PanelContent>
          </Panel>
        </div>
      );
    } else {
      return (
        // No inspector was found.
        <div className={styles.detailPanel}>
          <Panel title={`inspector`}>
            <PanelContent>
              <div className={styles.nothingInspected}>
                Click on a log item in the panel below to inspect activity.
                <br />
                <br />
                {
                  'You can also inspect the JSON responses from your LUIS and QnA Maker services by selecting a "trace" activity. '
                }
                <a href="https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-4.0">
                  Learn More.
                </a>
              </div>
            </PanelContent>
          </Panel>
        </div>
      );
    }
  }

  private renderAccessoryButton(button: AccessoryButton, onClickHandler: (id: string) => void) {
    const { config, state, enabled } = button;
    const currentState = config.states[state] || {};
    const { icon, ...buttonAttrs } = currentState;
    return (
      <PrimaryButton
        {...buttonAttrs}
        className={styles.accessoryButton}
        key={config.id}
        disabled={!enabled}
        onClick={() => onClickHandler(config.id)}
      >
        {Inspector.renderAccessoryIcon(icon)}
        {currentState.label}
      </PrimaryButton>
    );
  }

  // eslint-disable-next-line typescript/no-unused-vars
  private renderAccessoryButtons() {
    return (
      <PanelControls>
        {this.state.buttons.map(accessoryButton => this.renderAccessoryButton(accessoryButton, this.accessoryClick))}
      </PanelControls>
    );
  }

  private stateChanged(newState: InspectorState, oldState: InspectorState): void {
    if (oldState.botHash !== newState.botHash) {
      this.botUpdated(newState.activeBot);
    }
    if (oldState.inspectorSrc !== newState.inspectorSrc || oldState.containerRef !== newState.containerRef) {
      this.updateInspector(this.state);
    }
    if (JSON.stringify(oldState.inspectObj) !== JSON.stringify(newState.inspectObj)) {
      this.inspect(newState.inspectObj);
    }
    if ((oldState.themeInfo || { themeName: '' }).themeName !== newState.themeInfo.themeName) {
      this.sendToInspector('theme', newState.themeInfo);
    }
  }

  private updateInspector(state: InspectorState): void {
    const { src } = state.inspector || { src: '' };
    if (!src) {
      return;
    }
    const { webViewByLocation: webViews } = this;
    const nextInspector = webViews[src] || (webViews[src] = this.createWebView(state));
    nextInspector.style.display = '';
    this.sendInitializationStackToInspector();

    const { containerRef } = this.state;
    if (!containerRef) {
      return;
    }
    if (!containerRef.contains(nextInspector)) {
      containerRef.appendChild(nextInspector);
    }
    Array.prototype.forEach.call(containerRef.children, child => {
      if (child !== nextInspector) {
        child.style.display = 'none';
      }
    });
  }

  private createWebView(state: InspectorState): ElectronHTMLWebViewElement {
    const { cwdAsBase } = this.props;
    const preload = `file://${cwdAsBase}/../../../node_modules/@bfemulator/client/public/inspector-preload.js`;

    const webView: ElectronHTMLWebViewElement = document.createElement('webview');
    webView.className = styles.webViewContainer;
    webView.setAttribute('partition', `persist:${state.botHash}`);
    webView.setAttribute('preload', preload);
    webView.setAttribute('src', state.inspector.src);
    webView.addEventListener('dragenter', this.onInspectorDrag, true);
    webView.addEventListener('dragover', this.onInspectorDrag, true);
    webView.addEventListener('dom-ready', this.onWebViewDOMReady);
    webView.addEventListener('ipc-message', this.ipcMessageEventHandler);

    return webView;
  }

  private webViewContainer = (ref: HTMLDivElement): void => {
    this.setState({ containerRef: ref });
  };

  private enableAccessory = (id: string, enable: boolean) => {
    const button = this.state.buttons.find(buttonArg => buttonArg.config.id === id);
    if (button) {
      if (button.enabled !== enable) {
        button.enabled = enable;
        this.setState(this.state);
      }
    }
  };

  private setAccessoryState = (id: string, state: string) => {
    const button = this.state.buttons.find(buttonArg => buttonArg.config.id === id);
    if (button && button.state !== state) {
      const { config } = button;
      if (config.states[state]) {
        button.state = state;
        this.setState(this.state);
      }
    }
  };

  private setInspectorTitle = (title: string) => {
    if (this.state.title !== title) {
      this.setState({ title });
    }
  };

  private accessoryClick = (id: string): void => {
    this.sendToInspector('accessory-click', id);
  };

  private toggleDevTools = (): void => {
    this.sendToInspector('toggle-dev-tools');
  };

  private canInspect(inspectObj: InspectObject): boolean {
    return this.state.inspector.name === 'JSON' || InspectorAPI.canInspect(this.state.inspector, inspectObj);
  }

  private onWebViewDOMReady = (event: Event) => {
    event.currentTarget.removeEventListener('domready', this.onWebViewDOMReady);
    this.sendInitializationStackToInspector();
  };

  private ipcMessageEventHandler = (event: IpcMessageEvent): void => {
    // TODO - localization
    const { channel } = event;
    switch (channel) {
      case 'enable-accessory':
        this.enableAccessory(event.args[0], event.args[1]);
        break;

      case 'set-accessory-state':
        this.setAccessoryState(event.args[0], event.args[1]);
        break;

      case 'set-inspector-title':
        this.setState({ titleOverride: event.args[0] });
        this.setInspectorTitle(event.args[0]);
        break;

      case 'logger.log':
      case 'logger.error': {
        const logLevel = channel === 'logger.log' ? LogLevel.Info : LogLevel.Error;
        const { documentId } = this.props.document;
        const inspectorName = this._state.titleOverride || this.state.inspector.name || 'inspector';
        const text = `[${inspectorName}] ${event.args[0]}`;
        LogService.logToDocument(documentId, logEntry(textItem(logLevel, text)));
        break;
      }

      case 'logger.luis-editor-deep-link': {
        const { documentId } = this.props.document;
        const inspectorName = this._state.titleOverride || this.state.inspector.name || 'inspector';
        const text = `[${inspectorName}] ${event.args[0]}`;
        LogService.logToDocument(documentId, logEntry(luisEditorDeepLinkItem(text)));
        break;
      }

      // record telemetry from extension
      case 'track-event': {
        const eventName = event.args[0];
        const eventProperties = event.args[1] || {};
        this.props.trackEvent(eventName, eventProperties);
        break;
      }

      default:
        // eslint-disable-next-line no-console
        console.warn('Unexpected message from inspector', event.channel, ...event.args);
    }
  };

  private sendInitializationStackToInspector(): void {
    this.botUpdated(this.state.activeBot);
    this.inspect(this.state.inspectObj);
    this.sendToInspector('theme', this.state.themeInfo);
  }

  private inspect(obj: InspectObject) {
    if (this.canInspect(obj)) {
      this.sendToInspector('inspect', obj);
    }
  }

  private botUpdated(bot: IBotConfiguration) {
    this.sendToInspector('bot-updated', bot);
  }

  private sendToInspector(channel: string, ...args: any[]) {
    const inspector = this.webViewByLocation[this.state.inspectorSrc];
    if (!inspector) {
      return;
    }
    try {
      inspector.send(channel, ...args);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  private onInspectorDrag = (event: DragEvent): void => {
    // prevent drag & drops inside of the inspector panel
    event.stopPropagation();
  };
}
