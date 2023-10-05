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
import { clipboard } from 'electron';
import {
  EmulatorChannel,
  ExtensionChannel,
  ExtensionInspector,
  InspectorAccessory,
  logEntry,
  LogEntry,
  LogLevel,
  luisEditorDeepLinkItem,
  textItem,
} from '@bfemulator/sdk-shared';
import { LinkButton, PrimaryButton, Spinner } from '@bfemulator/ui-react';
import { IBotConfiguration } from 'botframework-config/lib/schema';
import { Activity } from 'botframework-schema';
import * as React from 'react';
import { MouseEvent } from 'react';

import { ExtensionManager, GetInspectorResult, InspectorAPI } from '../../../../../extensions';
import { logService } from '../../../../../platform/log/logService';
import Panel, { PanelContent, PanelControls } from '../../../panel/panel';
import { ChatDocument } from '../../../../../state/reducers/chat';

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

export interface InspectorProps {
  appPath?: string;
  createAriaAlert?: (msg: string) => void;
  document?: ChatDocument;
  documentId?: string;
  themeInfo?: { themeName: string; themeComponents: string[] };
  activeBot?: IBotConfiguration;
  botHash?: string;
  onAnchorClick?: (url: string) => void;
  trackEvent?: (name: string, properties?: { [key: string]: any }) => void;
  setHighlightedObjects?: (documentId: string, objects: Activity[]) => void;
  setInspectorObjects?: (documentId: string, inspectorObjects: Activity[]) => void;
  showMessage?: (title: string, message: string) => void;
}

interface InspectorState {
  titleOverride?: string;
  activeBot?: IBotConfiguration;
  logEntries: LogEntry[];
  highlightedObjects?: Activity[] | LogEntry[];
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

// TODO: Component could be greatly simplified by storing inspector state
// in the redux store referenced by owning document id.
export class Inspector extends React.Component<InspectorProps, InspectorState> {
  private static renderAccessoryIcon(icon: string) {
    if (icon === 'Spinner') {
      return <Spinner segmentRadius={2} width={25} height={25} />;
    } else if (icon) {
      return <div className={`${styles.accessoryButtonIcon} ${styles[icon]}`} aria-hidden="true" />;
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

  private domReadyByLocation = {};

  public static getDerivedStateFromProps(newProps: InspectorProps, prevState: InspectorState): InspectorState {
    const { activeBot, botHash, document = {} as ChatDocument, themeInfo } = newProps;
    const inspectorResult = Inspector.getInspector(document.inspectorObjects);
    const { inspector = { name: '' } } = inspectorResult.response;
    const buttons = Inspector.getButtons(inspector.accessories);
    const { inspector: prevInspector = {}, titleOverride } = prevState;

    const inspectorChanged = inspector.name !== prevInspector.name;

    if (prevState.buttons && !inspectorChanged) {
      Object.assign(buttons, prevState.buttons);
    }
    return {
      ...prevState,
      activeBot: activeBot,
      logEntries: document.log.entries,
      highlightedObjects: document.highlightedObjects,
      botHash: botHash,
      inspector,
      inspectorSrc: inspector.src,
      inspectObj: inspectorResult.inspectObj,
      themeInfo: themeInfo,
      title: inspector.name,
      titleOverride: inspectorChanged ? '' : titleOverride,
      buttons,
    };
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
    try {
      this.updateInspector(this.state);
    } catch (e) {
      // do nothing
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('toggle-inspector-devtools', this.toggleDevTools);
  }

  public render() {
    if (this.state.inspector && this.state.inspectObj) {
      const { title, titleOverride } = this.state;
      return (
        <div aria-label="inspector panel" className={styles.detailPanel} role="region">
          <Panel title={['inspector', titleOverride || title].filter(s => s && s.length).join(' - ')}>
            {this.renderAccessoryButtons()}
            <PanelContent>
              <div className={styles.inspectorContainer}>
                <div ref={this.webViewContainer} className={styles.webViewContainer} />
              </div>
            </PanelContent>
          </Panel>
        </div>
      );
    } else {
      return (
        // No inspector was found.
        <div aria-label="inspector panel" className={styles.detailPanel} role="region">
          <Panel title={`inspector`}>
            <PanelContent>
              <div className={styles.nothingInspected}>
                Click on a log item in the panel below to inspect activity.
                <br />
                <br />
                {
                  'You can also inspect the JSON responses from your LUIS and QnA Maker services by selecting a "trace" activity. '
                }
                <LinkButton
                  onClick={this.onDebugDocsClick}
                  ariaLabel="Learn more about debugging your bot with the Emulator"
                  linkRole={true}
                >
                  Learn More.
                </LinkButton>
              </div>
            </PanelContent>
          </Panel>
        </div>
      );
    }
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onDebugDocsClick = this.createAnchorClickHandler(
    'https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-4.0'
  );

  private renderAccessoryButton(button: AccessoryButton) {
    const { config, state, enabled } = button;
    const currentState = config.states[state] || {};
    const { icon, ...buttonAttrs } = currentState;
    return (
      <PrimaryButton
        {...buttonAttrs}
        className={styles.accessoryButton}
        key={config.id}
        disabled={!enabled}
        name={config.id}
        role={config.id == 'json' ? 'tab' : null}
        data-current-state={state}
        onClick={this.accessoryClick}
        aria-hidden={button.state === 'disabled' ? true : false}
        tabIndex={button.state === 'disabled' ? -1 : 0}
      >
        {Inspector.renderAccessoryIcon(icon)}
        {currentState.label}
      </PrimaryButton>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private renderAccessoryButtons() {
    return (
      <PanelControls>
        {this.state.buttons.map(accessoryButton => this.renderAccessoryButton(accessoryButton))}
      </PanelControls>
    );
  }

  private stateChanged(newState: InspectorState, oldState: InspectorState): void {
    if (!this.canInspect) {
      return;
    }

    if (oldState.botHash !== newState.botHash) {
      this.botUpdated(newState.activeBot);
    }

    if (oldState.inspectorSrc !== newState.inspectorSrc || oldState.containerRef !== newState.containerRef) {
      try {
        this.updateInspector(this.state);
      } catch (e) {
        // do nothing
      }
    }

    // Send these always
    this.chatLogUpdated(this.props.document.documentId, newState.logEntries);
    this.sendToExtension(ExtensionChannel.HighlightedObjectsUpdated, newState.highlightedObjects);

    if (JSON.stringify(oldState.inspectObj) !== JSON.stringify(newState.inspectObj)) {
      this.inspect(newState.inspectObj);
    }

    if ((oldState.themeInfo || { themeName: '' }).themeName !== (newState.themeInfo || { themeName: '' }).themeName) {
      this.sendToExtension(ExtensionChannel.Theme, newState.themeInfo);
    }
  }

  private updateInspector(state: InspectorState): void {
    const { src } = state.inspector || { src: '' };
    if (!src) {
      return;
    }
    const encodedSrc = encodeURI(src);
    const { webViewByLocation: webViews } = this;
    if (!webViews[encodedSrc]) {
      webViews[encodedSrc] = this.createWebView(state);
    } else {
      this.sendInitializationStackToInspector();
    }
    const nextInspector = webViews[encodedSrc] || (webViews[encodedSrc] = this.createWebView(state));
    nextInspector.style.display = '';

    const { containerRef } = this.state;
    if (!containerRef) {
      return;
    }
    if (!containerRef.contains(nextInspector)) {
      containerRef.appendChild(nextInspector);
      nextInspector.addEventListener('dom-ready', this.onWebViewDOMReady);
    }
    Array.prototype.forEach.call(containerRef.children, child => {
      if (child !== nextInspector) {
        child.style.display = 'none';
      }
    });
  }

  private createWebView(state: InspectorState): ElectronHTMLWebViewElement {
    const webView: ElectronHTMLWebViewElement = document.createElement('webview');

    webView.className = styles.webViewContainer;
    webView.addEventListener('dragenter', this.onInspectorDrag, true);
    webView.addEventListener('dragover', this.onInspectorDrag, true);
    webView.addEventListener('ipc-message', this.ipcMessageEventHandler);
    webView.setAttribute('partition', `persist:${state.botHash}`);
    webView.setAttribute('webPreferences', `contextIsolation=no`);
    webView.setAttribute('src', encodeURI(state.inspector.src));
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
    if (this.state.titleOverride !== title) {
      this.setState({ titleOverride: title });
    }
  };

  private accessoryClick = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = event.currentTarget.name;

    if (id == 'copyJson') {
      this.props.showMessage('Copy', 'Activity JSON copied to clipboard.');
      return clipboard.writeText(JSON.stringify(this.state.inspectObj, null, 2));
    }

    const { currentState } = event.currentTarget.dataset;
    this.sendToExtension(ExtensionChannel.AccessoryClick, id, currentState);
  };

  private toggleDevTools = (): void => {
    this.sendToExtension(ExtensionChannel.ToggleDevTools);
  };

  private canInspect(inspectObj: InspectObject): boolean {
    return this.state.inspector.name === 'JSON' || InspectorAPI.canInspect(this.state.inspector, inspectObj);
  }

  private onWebViewDOMReady = (event: Event) => {
    const webView = event.currentTarget as ElectronHTMLWebViewElement;
    this.domReadyByLocation[webView.getAttribute('src')] = true;
    webView.removeEventListener('dom-ready', this.onWebViewDOMReady);
    this.sendInitializationStackToInspector();
  };

  private handleLoggingFromExtension = (logLevel: LogLevel, argument: string): void => {
    const { documentId } = this.props.document;
    const inspectorName = this._state.titleOverride || this.state.inspector.name || 'inspector';
    const text = `[${inspectorName}] ${argument}`;
    logService.logToDocument(documentId, logEntry(textItem(logLevel, text)));
  };

  private ipcMessageEventHandler = (event: IpcMessageEvent): void => {
    // TODO - localization
    const { channel } = event;
    switch (channel) {
      case EmulatorChannel.CreateAriaAlert:
        this.props.createAriaAlert(event.args[0]);
        break;

      case EmulatorChannel.EnableAccessory:
        this.enableAccessory(event.args[0], event.args[1]);
        break;

      case EmulatorChannel.SetAccessoryState:
        this.setAccessoryState(event.args[0], event.args[1]);
        break;

      case EmulatorChannel.SetInspectorTitle:
        this.setState({ titleOverride: event.args[0] });
        this.setInspectorTitle(event.args[0]);
        break;

      case EmulatorChannel.Log:
        this.handleLoggingFromExtension(LogLevel.Info, event.args[0]);
        break;

      case EmulatorChannel.LogError:
        this.handleLoggingFromExtension(LogLevel.Error, event.args[0]);
        break;

      case EmulatorChannel.LogWarn:
        this.handleLoggingFromExtension(LogLevel.Warn, event.args[0]);
        break;

      case EmulatorChannel.LogLuisDeepLink: {
        const { documentId } = this.props.document;
        const inspectorName = this._state.titleOverride || this.state.inspector.name || 'inspector';
        const text = `[${inspectorName}] ${event.args[0]}`;
        logService.logToDocument(documentId, logEntry(luisEditorDeepLinkItem(text)));
        break;
      }

      // record telemetry from extension
      case EmulatorChannel.TrackEvent: {
        const eventName = event.args[0];
        const eventProperties = event.args[1] || {};
        this.props.trackEvent(eventName, eventProperties);
        break;
      }

      case EmulatorChannel.SetHightlightedObjects: {
        const [documentId, highlightedObjects] = event.args;
        this.props.setHighlightedObjects(documentId, highlightedObjects);
        break;
      }

      case EmulatorChannel.SetInspectorObjects: {
        const [documentId, inspectorObjects] = event.args;
        this.props.setInspectorObjects(documentId, inspectorObjects);
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
    this.sendToExtension(ExtensionChannel.Theme, this.state.themeInfo);
    this.chatLogUpdated(this.props.document.documentId, this.state.logEntries);
  }

  private inspect(obj: InspectObject) {
    if (this.canInspect(obj)) {
      // showInInspector is for internal bookkeeping and shouldn't make it to the view
      // remove before rendering
      delete obj.showInInspector;
      this.sendToExtension(ExtensionChannel.Inspect, obj);
    }
  }

  private botUpdated(bot: IBotConfiguration) {
    this.sendToExtension(ExtensionChannel.BotUpdated, bot);
  }

  private chatLogUpdated(documentId: string, logItems: LogEntry[]): void {
    this.sendToExtension(ExtensionChannel.ChatLogUpdated, documentId, logItems);
  }

  private sendToExtension(channel: ExtensionChannel, ...args: any[]) {
    const { inspectorSrc } = this.state;
    const inspector = this.webViewByLocation[encodeURI(inspectorSrc)];
    if (!inspector || !this.domReadyByLocation[encodeURI(inspectorSrc)]) {
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
