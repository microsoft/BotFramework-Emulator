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

import { Fonts, GlobalCss, Splitter, ThemeVariables } from '@bfemulator/ui-react';
import { InspectorHost } from '@bfemulator/sdk-client';
import { mergeStyles } from '@uifabric/merge-styles';
import { IBotConfig, IDispatchService, ILuisService, ServiceType, IConnectedService } from 'msbot/bin/schema';
import * as React from 'react';
import { Component } from 'react';
import ReactJson from 'react-json-view';
import AppStateAdapter from './Adapters/AppStateAdapter';
import { ButtonSelected, ControlBar } from './Controls/ControlBar';
import Editor from './Controls/Editor';
import Header from './Controls/Header';
import MockState from './Data/MockData';
import { AppInfo } from './Luis/AppInfo';
import LuisClient from './Luis/Client';
import { IntentInfo } from './Luis/IntentInfo';
import { LuisAppInfo } from './Models/LuisAppInfo';
import { LuisTraceInfo } from './Models/LuisTraceInfo';

let $host: InspectorHost = (window as any).host;
const LuisApiBasePath = 'https://westus.api.cognitive.microsoft.com/luis/api/v2.0';
const TrainAccessoryId = 'train';
const PublichAccessoryId = 'publish';
const AccessoryDefaultState = 'default';
const AccessoryWorkingState = 'working';

let persistentStateKey = Symbol('persistentState').toString();

let globalCss = {
  whiteSpace: 'nowrap',
  width: '622px'
};

let jsonViewerCss = {
  overflowY: 'auto',
  paddingTop: '10px',
  paddingBottom: '10px',
  height: '95%',
  backgroundColor: `var(${ThemeVariables.neutral15})`,
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
};

const appCss = mergeStyles({
  displayName: 'luisApp',
  height: '100%',
  fontSize: '12px',
  padding: '5px'
});

interface AppState {
  traceInfo: LuisTraceInfo;
  appInfo: AppInfo;
  intentInfo: IntentInfo[];
  persistentState: { [key: string]: PersistentAppState };
  controlBarButtonSelected: ButtonSelected;
  authoringKey: string;
  id: string;
}

interface PersistentAppState {
  pendingTrain: boolean;
  pendingPublish: boolean;
}

class App extends Component<any, AppState> {

  luisclient: LuisClient;

  static getLuisAuthoringKey(bot: IBotConfig, appId: string): string {
    if (!bot || !bot.services || !appId) {
      return '';
    }

    let lcAppId = appId.toLowerCase();
    let dispatchServices = bot.services.filter((s: IConnectedService) =>
      s.type === ServiceType.Dispatch) as IDispatchService[];
    let dispatchService = dispatchServices.find(ds => ds.appId.toLowerCase() === lcAppId);
    if (dispatchService) {
      return dispatchService.authoringKey;
    }

    let luisServices = bot.services.filter((s: IConnectedService) => s.type === ServiceType.Luis) as ILuisService[];
    let luisService = luisServices.find(ls => ls.appId.toLowerCase() === lcAppId);
    if (luisService) {
      return luisService.authoringKey;
    }

    if (luisServices.length > 0) {
      return luisServices[0].authoringKey;
    }

    console.log('No authoring key found in the bot config for app Id: ' + appId);
    return '';
  }

  setControlButtonSelected = (buttonSelected: ButtonSelected): void => {
    this.setState({
      controlBarButtonSelected: buttonSelected
    });
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      traceInfo: {
        luisModel: {
          ModelID: ''
        },
        recognizerResult: {},
        luisOptions: {}
      } as LuisTraceInfo,
      appInfo: {} as AppInfo,
      intentInfo: [] as IntentInfo[],
      persistentState: this.loadAppPersistentState(),
      controlBarButtonSelected: ButtonSelected.RawResponse,
      id: '',
      authoringKey: ''
    };
    this.reassignIntent = this.reassignIntent.bind(this);
  }

  componentWillMount() {
    // Attach a handler to listen on inspect events
    if (!this.runningDetached()) {
      $host.on('inspect', async (obj: any) => {
        let appState = new AppStateAdapter(obj);
        appState.persistentState = this.loadAppPersistentState();
        appState.authoringKey = App.getLuisAuthoringKey($host.bot, appState.traceInfo.luisModel.ModelID);
        this.setState(appState);
        await this.populateLuisInfo();
        $host.setInspectorTitle(this.state.appInfo.isDispatchApp ? 'Dispatch' : 'LUIS');
        $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
        $host.setAccessoryState(PublichAccessoryId, AccessoryDefaultState);
        $host.enableAccessory(TrainAccessoryId, this.state.persistentState[this.state.id] &&
          this.state.persistentState[this.state.id].pendingTrain);
        $host.enableAccessory(PublichAccessoryId, this.state.persistentState[this.state.id] &&
          this.state.persistentState[this.state.id].pendingPublish);
      });

      $host.on('accessory-click', async (id: string) => {
        switch (id) {
          case TrainAccessoryId:
            await this.train();
            break;
          case PublichAccessoryId:
            await this.publish();
            break;
          default:
            break;
        }
      });

      $host.on('bot-updated', (bot: IBotConfig) => {
        this.setState({
          authoringKey: App.getLuisAuthoringKey(bot, this.state.appInfo.appId)
        });
      });
    } else {
      this.setState(new MockState());
    }
  }

  render() {
    return (
      <div className={ appCss }>
        <Header
          appId={ this.state.traceInfo.luisModel.ModelID }
          appName={ this.state.appInfo.name }
          slot={ this.state.traceInfo.luisOptions.Staging ? 'Staging' : 'Production' }
          version={ this.state.appInfo.activeVersion }
        />
        <ControlBar
          setButtonSelected={ this.setControlButtonSelected }
          buttonSelected={ this.state.controlBarButtonSelected }
        />
        <Splitter orientation={ 'vertical' }
                  primaryPaneIndex={ 0 }
                  minSizes={ { 0: 306, 1: 306 } }
                  initialSizes={ { 0: 306 } }>
          <ReactJson
            name={ this.state.controlBarButtonSelected === ButtonSelected.RecognizerResult ?
              'recognizerResult' :
              'luisResponse' }
            src={ this.state.controlBarButtonSelected === ButtonSelected.RecognizerResult ?
              this.state.traceInfo.recognizerResult :
              this.state.traceInfo.luisResult }
            theme="monokai"
            style={ jsonViewerCss }
          />
          <Editor
            recognizerResult={ this.state.traceInfo.recognizerResult }
            intentInfo={ this.state.intentInfo }
            intentReassigner={ this.reassignIntent }
            appInfo={ this.state.appInfo }
            traceId={ this.state.id }
          />
        </Splitter>
      </div>
    );
  }

  runningDetached() {
    return !$host;
  }

  async populateLuisInfo() {
    if (this.state.traceInfo != null) {
      this.luisclient = new LuisClient({
        appId: this.state.traceInfo.luisModel.ModelID,
        baseUri: LuisApiBasePath,
        key: this.state.authoringKey
      } as LuisAppInfo);

      try {
        let appInfo = await this.luisclient.getApplicationInfo();
        this.setState({
          appInfo: appInfo
        });
        let intents = await this.luisclient.getApplicationIntents(appInfo);
        this.setState({
          intentInfo: intents
        });
      } catch (err) {
        $host.logger.error(err.message);
      }
    }
  }

  async reassignIntent(newIntent: string, needsRetrain: boolean): Promise<void> {
    try {
      await this.luisclient.reassignIntent(
        this.state.appInfo,
        this.state.traceInfo.luisResult,
        newIntent);
      $host.logger.log('Intent reassigned successfully');
      this.setAppPersistentState({
        pendingTrain: needsRetrain,
        pendingPublish: false
      });
    } catch (err) {
      $host.logger.error(err.message);
    }
  }

  async train(): Promise<void> {
    $host.setAccessoryState(TrainAccessoryId, AccessoryWorkingState);
    try {
      await this.luisclient.train(this.state.appInfo);
      $host.logger.log('Application trained successfully');
      $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
      this.setAppPersistentState({
        pendingTrain: false,
        pendingPublish: true
      });
    } catch (err) {
      $host.logger.error(err.message);
    }
  }

  async publish(): Promise<void> {
    $host.setAccessoryState(PublichAccessoryId, AccessoryWorkingState);
    try {
      await this.luisclient.publish(this.state.appInfo, this.state.traceInfo.luisOptions.Staging || false);
      $host.logger.log('Application published successfully');
      $host.setAccessoryState(PublichAccessoryId, AccessoryDefaultState);
      this.setAppPersistentState({
        pendingPublish: false,
        pendingTrain: false
      });
    } catch (err) {
      $host.logger.error(err.message);
    }
  }

  private setAppPersistentState(persistentState: PersistentAppState) {
    this.state.persistentState[this.state.id] = persistentState;
    this.setState({ persistentState: this.state.persistentState });
    localStorage.setItem(persistentStateKey, JSON.stringify(this.state.persistentState));
    $host.enableAccessory(TrainAccessoryId, persistentState.pendingTrain);
    $host.enableAccessory(PublichAccessoryId, persistentState.pendingPublish);
  }

  private loadAppPersistentState(): { [key: string]: PersistentAppState } {
    let persisted = localStorage.getItem(persistentStateKey);
    if (persisted !== null) {
      return JSON.parse(persisted);
    }
    return {
      '': {
        pendingTrain: false,
        pendingPublish: false
      }
    };
  }
}

export { App, AppState, PersistentAppState };
