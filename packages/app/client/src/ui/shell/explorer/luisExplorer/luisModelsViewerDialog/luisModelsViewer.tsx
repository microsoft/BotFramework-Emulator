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

import { Checkbox, DefaultButton, PrimaryButton } from '@bfemulator/ui-react';
import { ILuisService } from 'msbot/bin/schema';
import * as React from 'react';
import { ChangeEvent, ChangeEventHandler, Component } from 'react';
import { LuisModel } from '../../../../../data/http/luisApi';

import * as styles from './luisModelsViewer.scss';

interface LuisModelsViewerProps {
  luisServices: ILuisService[];
  luisModels: LuisModel[];
  addLuisModels: (models: LuisModel[]) => void;
  cancel: () => void;
}

interface LuisModelsViewerState {
  [selectedLuisModelId: string]: LuisModel | false;
}

export class LuisModelsViewer extends Component<LuisModelsViewerProps, LuisModelsViewerState> {
  public state: LuisModelsViewerState = {};

  constructor(props: LuisModelsViewerProps, context: LuisModelsViewerState) {
    super(props, context);
  }

  public componentWillReceiveProps(nextProps: LuisModelsViewerProps = {} as any): void {
    const { luisServices = [] as ILuisService[] } = nextProps;

    const state = luisServices
      .reduce((agg, luisService: ILuisService) => {
        agg[luisService.appId] = luisService;
        return agg;
      }, {});

    this.setState(state);
  }

  public render(): JSX.Element {
    const { state, props } = this;
    const keys = Object.keys(state);
    const checkAllChecked = props.luisModels
      .reduce((isTrue, luisModel) => state[luisModel.id] && isTrue, !!keys.length);
    return (
      <section className={ styles.luisModelsViewer }>
        { this.sectionHeader }
        <div className="listContainer">
          <p>Selecting a LUIS app below will store the app ID in your bot file.</p>
          <div className="selectAll">
            <Checkbox onChange={ this.onSelectAllChange } checked={ checkAllChecked } id="select-all-luis-models"
                      label="Select all"/>
          </div>
          <ul>
            { ...this.luisModelElements }
          </ul>
        </div>
        <div className="buttonGroup">
          <DefaultButton text="Cancel" onClick={ this.onCancelClick }/>
          <PrimaryButton text="Add" onClick={ this.onAddClick }/>
        </div>
      </section>
    );
  }

  private get sectionHeader(): JSX.Element {
    return (
      <header>
        <button className={ styles.closeButton } onClick={ this.onCancelClick }>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="1 1 16 16">
            <g>
              <polygon
                points="14.1015625 2.6015625 8.7109375 8 14.1015625 13.3984375 13.3984375 14.1015625 8 8.7109375
                2.6015625 14.1015625 1.8984375 13.3984375 7.2890625 8 1.8984375 2.6015625 2.6015625 1.8984375 8
                7.2890625 13.3984375 1.8984375"/>
            </g>
          </svg>
        </button>
        <h3>Add LUIS apps</h3>
      </header>
    );
  }

  private get luisModelElements(): JSX.Element[] {
    const { state, onChange } = this;
    const { luisModels } = this.props;
    return luisModels.map(luisModel => {
      const { id, name: label, culture, activeVersion } = luisModel;
      const checkboxProps = {
        label,
        checked: !!state[id],
        id: `model${id}`,
        onChange: onChange.bind(this, luisModel)
      };
      return (
        <li key={ id }>
          <Checkbox { ...checkboxProps } className="checkboxOverride"/>
          <span>&nbsp;-&nbsp;version { activeVersion }</span>
          <span>{ culture }</span>
        </li>
      );
    });
  }

  private onChange(luisModel: LuisModel, event: ChangeEvent<any>) {
    const { target }: { target: HTMLInputElement } = event;
    this.setState({ [luisModel.id]: target.checked ? luisModel : false });
  }

  private onSelectAllChange: ChangeEventHandler<any> = (event: ChangeEvent<any>) => {
    const { luisModels = [] } = this.props as any;
    const { target }: { target: HTMLInputElement } = event;
    const newState = {};
    luisModels.forEach(luisModel => {
      newState[luisModel.id] = target.checked ? luisModel : false;
    });
    this.setState(newState);
  }

  private onAddClick: ChangeEventHandler<any> = (_event: ChangeEvent<any>) => {
    const { state } = this;
    const reducer = (models, luisModelId) => {
      if (state[luisModelId]) {
        models.push(state[luisModelId]);
      }
      return models;
    };
    const addedModels: LuisModel[] = Object.keys(state).reduce(reducer, []);
    this.props.addLuisModels(addedModels);
  }

  private onCancelClick: ChangeEventHandler<any> = (_event: ChangeEvent<any>) => {
    this.props.cancel();
  }
}
