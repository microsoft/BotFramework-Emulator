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

import { InspectorHost } from '@bfemulator/sdk-client';
// TODO: Revert import to `@bfemulator/sdk-shared` once issue #1333 (https://github.com/Microsoft/BotFramework-Emulator/issues/1333) is resolved.
import { json2HTML } from '@bfemulator/sdk-shared/build/utils/json2HTML';
import { Splitter } from '@bfemulator/ui-react';
import {
  IBotConfiguration,
  IConnectedService,
  IDispatchService,
  ILuisService,
  ServiceTypes,
} from 'botframework-config/lib/schema';
import * as React from 'react';
import { Component } from 'react';
import { LuisAuthoringModels } from 'luis-apis';

import AppStateAdapter from './Adapters/AppStateAdapter';
import * as styles from './App.scss';
import { ButtonSelected, ControlBar } from './Controls/ControlBar/ControlBar';
import { Editor } from './Controls/Editor/Editor';
import { Header } from './Controls/Header/Header';
import { AppInfo } from './Luis/AppInfo';
import { LuisClient } from './Luis/Client';
import { LuisAppInfo } from './Models/LuisAppInfo';
import { LuisTraceInfo } from './Models/LuisTraceInfo';

const $host: InspectorHost = (window as any).host;
// const LuisApiBasePath = 'https://westus.api.cognitive.microsoft.com/luis/api/v2.0';
const TrainAccessoryId = 'train';
const PublishAccessoryId = 'publish';
const AccessoryDefaultState = 'default';
const AccessoryWorkingState = 'working';

const persistentStateKey = Symbol('persistentState').toString();

export interface AppState {
  traceInfo: LuisTraceInfo;
  appInfo: AppInfo;
  intentInfo: LuisAuthoringModels.IntentClassifier[];
  persistentState: { [key: string]: PersistentAppState };
  controlBarButtonSelected: ButtonSelected;
  authoringKey: string;
  id: string;
}

export interface PersistentAppState {
  pendingTrain: boolean;
  pendingPublish: boolean;
}

export class App extends Component<any, AppState> {
  public luisclient: LuisClient;

  public static getLuisAuthoringKey(bot: IBotConfiguration, appId: string): string {
    if (!bot || !bot.services || !appId) {
      return '';
    }

    const lcAppId = appId.toLowerCase();
    const dispatchServices = bot.services.filter(
      (s: IConnectedService) => s.type === ServiceTypes.Dispatch
    ) as IDispatchService[];
    const dispatchService = dispatchServices.find(ds => ds.appId.toLowerCase() === lcAppId);
    if (dispatchService) {
      return dispatchService.authoringKey;
    }

    const luisServices = bot.services.filter((s: IConnectedService) => s.type === ServiceTypes.Luis) as ILuisService[];
    const luisService = luisServices.find(ls => ls.appId.toLowerCase() === lcAppId);
    if (luisService) {
      return luisService.authoringKey;
    }

    if (luisServices.length > 0) {
      return luisServices[0].authoringKey;
    }
    return '';
  }

  public setControlButtonSelected = (buttonSelected: ButtonSelected): void => {
    this.setState({
      controlBarButtonSelected: buttonSelected,
    });
  };

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      traceInfo: {
        luisModel: {
          ModelID: '',
        },
        recognizerResult: {},
        luisOptions: {},
      } as LuisTraceInfo,
      appInfo: {} as AppInfo,
      intentInfo: [],
      persistentState: this.loadAppPersistentState(),
      controlBarButtonSelected: ButtonSelected.RawResponse,
      id: '',
      authoringKey: '',
    };
  }

  public componentWillMount() {
    // Attach a handler to listen on inspect events
    if (!$host) {
      return;
    }
    $host.on('inspect', async (obj: any) => {
      const appState = new AppStateAdapter(obj);
      appState.persistentState = this.loadAppPersistentState();
      appState.authoringKey = App.getLuisAuthoringKey($host.bot, appState.traceInfo.luisModel.ModelID);
      this.setState(appState);
      await this.populateLuisInfo();
      $host.setInspectorTitle(this.state.appInfo.isDispatchApp ? 'Dispatch' : 'LUIS');
      $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
      $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
      $host.enableAccessory(
        TrainAccessoryId,
        this.state.persistentState[this.state.id] && this.state.persistentState[this.state.id].pendingTrain
      );
      $host.enableAccessory(
        PublishAccessoryId,
        this.state.persistentState[this.state.id] && this.state.persistentState[this.state.id].pendingPublish
      );
    });

    $host.on('accessory-click', async (id: string) => {
      switch (id) {
        case TrainAccessoryId:
          await this.train();
          break;

        case PublishAccessoryId:
          await this.publish();
          break;

        default:
          break;
      }
    });

    $host.on('bot-updated', (bot: IBotConfiguration) => {
      this.setState({
        authoringKey: App.getLuisAuthoringKey(bot, this.state.appInfo.appId),
      });
    });

    $host.on('theme', async (themeInfo: { themeName: string; themeComponents: string[] }) => {
      const { themeName = '' } = themeInfo;
      const oldThemeComponents = document.querySelectorAll<HTMLLinkElement>('[data-theme-component="true"]');
      const head = document.querySelector<HTMLHeadElement>('head') as HTMLHeadElement;
      const fragment = document.createDocumentFragment();
      const promises: Promise<any>[] = [];
      // Create the new links for each theme component
      themeInfo.themeComponents.forEach(themeComponent => {
        const link = document.createElement<'link'>('link');
        promises.push(
          new Promise(resolve => {
            link.addEventListener('load', resolve);
          })
        );
        link.href = themeComponent;
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-component', 'true');
        fragment.appendChild(link);
      });
      // Create the link for luis-specific themed styles
      const luisStyleLink = document.createElement<'link'>('link');
      promises.push(
        new Promise(resolve => {
          luisStyleLink.addEventListener('load', resolve);
        })
      );
      luisStyleLink.href = `./themes/${themeName.toLowerCase()}-luis.css`;
      luisStyleLink.rel = 'stylesheet';
      luisStyleLink.setAttribute('data-theme-component', 'true');
      fragment.appendChild(luisStyleLink);
      // insert links into document
      head.insertBefore(fragment, head.firstElementChild);
      // Wait for all the links to load their css
      await Promise.all(promises);
      // Remove the old links
      Array.prototype.forEach.call(oldThemeComponents, (themeComponent: HTMLLinkElement) => {
        if (themeComponent.parentElement) {
          themeComponent.parentElement.removeChild(themeComponent);
        }
      });
    });
  }

  public render() {
    const { traceInfo = {} as any, appInfo = {} as AppInfo, controlBarButtonSelected } = this.state;
    const { recognizerResult = {}, luisResult = {} } = traceInfo;
    const name = controlBarButtonSelected === ButtonSelected.RecognizerResult ? 'recognizerResult' : 'luisResponse';
    const result = controlBarButtonSelected === ButtonSelected.RecognizerResult ? recognizerResult : luisResult;
    const data = { [name]: result };
    return (
      <div className={styles.app}>
        <Header
          appId={traceInfo.luisModel.ModelID}
          appName={appInfo.name}
          slot={traceInfo.luisOptions.Staging ? 'Staging' : 'Production'}
          version={appInfo.activeVersion}
        />
        <ControlBar setButtonSelected={this.setControlButtonSelected} buttonSelected={controlBarButtonSelected} />
        <Splitter orientation={'vertical'} primaryPaneIndex={0} minSizes={{ 0: 306, 1: 306 }} initialSizes={{ 0: 306 }}>
          <div className={styles.json} dangerouslySetInnerHTML={{ __html: json2HTML(data) }} />
          <Editor
            recognizerResult={this.state.traceInfo.recognizerResult}
            intentInfo={this.state.intentInfo}
            intentReassigner={this.reassignIntent}
            appInfo={this.state.appInfo}
            traceId={this.state.id}
          />
        </Splitter>
      </div>
    );
  }

  public async populateLuisInfo() {
    if (this.state.traceInfo != null) {
      this.luisclient = new LuisClient({
        appId: this.state.traceInfo.luisModel.ModelID,
        key: this.state.authoringKey,
      } as LuisAppInfo);

      try {
        const appInfo = await this.luisclient.getApplicationInfo();
        this.setState({ appInfo });
        if (appInfo.authorized) {
          const intentInfo = await this.luisclient.getApplicationIntents(appInfo);
          this.setState({ intentInfo });
        } else {
          this.setState({ intentInfo: [] });
          const message = `Unauthorized: Your bot is not configured to interact with LUIS app: ${appInfo.appId}.`;
          $host.logger.logLuisEditorDeepLink(message);
        }
      } catch (err) {
        // Throw an auth error only if conversation is from a bot file instead of URL.
        if (!$host.bot && err.statusCode === 401) {
          return;
        }
        $host.logger.error(err.message);
      }
    }
  }

  private reassignIntent = async (newIntent: string, needsRetrain: boolean): Promise<void> => {
    try {
      await this.luisclient.reassignIntent(this.state.appInfo, this.state.traceInfo.luisResult, newIntent);
      $host.logger.log('Intent reassigned successfully');
      this.setAppPersistentState({
        pendingTrain: needsRetrain,
        pendingPublish: false,
      });
    } catch (err) {
      $host.logger.error(err.message);
    }
  };

  private train = async (): Promise<void> => {
    $host.setAccessoryState(TrainAccessoryId, AccessoryWorkingState);
    try {
      await this.luisclient.train(this.state.appInfo);
      $host.logger.log('Application trained successfully');
      this.setAppPersistentState({
        pendingTrain: false,
        pendingPublish: true,
      });
      $host.trackEvent('luis_trainSuccess');
    } catch (err) {
      $host.logger.error(err.message);
      $host.trackEvent('luis_trainFailure', { error: err.message });
    } finally {
      $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
    }
  };

  private publish = async (): Promise<void> => {
    $host.setAccessoryState(PublishAccessoryId, AccessoryWorkingState);
    try {
      await this.luisclient.publish(this.state.appInfo, this.state.traceInfo.luisOptions.Staging || false);
      $host.logger.log('Application published successfully');
      this.setAppPersistentState({
        pendingPublish: false,
        pendingTrain: false,
      });
      $host.trackEvent('luis_publishSuccess');
    } catch (err) {
      $host.logger.error(err.message);
      $host.trackEvent('luis_publishFailure', { error: err.message });
    } finally {
      $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
    }
  };

  private setAppPersistentState(persistentState: PersistentAppState) {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.persistentState[this.state.id] = persistentState;
    this.setState({ persistentState: this.state.persistentState });
    localStorage.setItem(persistentStateKey, JSON.stringify(this.state.persistentState));
    $host.enableAccessory(TrainAccessoryId, persistentState.pendingTrain);
    $host.enableAccessory(PublishAccessoryId, persistentState.pendingPublish);
  }

  private loadAppPersistentState(): { [key: string]: PersistentAppState } {
    const persisted = localStorage.getItem(persistentStateKey);
    if (persisted !== null) {
      return JSON.parse(persisted);
    }
    return {
      '': {
        pendingTrain: false,
        pendingPublish: false,
      },
    };
  }
}
