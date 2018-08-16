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

import { Checkbox, DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import { ILuisService } from 'msbot/bin/schema';
import * as React from 'react';
import { ChangeEventHandler, Component } from 'react';

import * as styles from './luisModelsViewer.scss';

interface LuisModelsViewerProps {
  authenticatedUser: string;
  existingLuisServices: ILuisService[];
  availableLuisServices: ILuisService[];
  launchLuisEditor: () => void;
  addLuisModels: (models: ILuisService[]) => void;
  cancel: () => void;
}

interface LuisModelsViewerState {
  [selectedLuisModelId: string]: ILuisService | boolean;

  checkAllChecked: boolean;
}

export class LuisModelsViewer extends Component<LuisModelsViewerProps, LuisModelsViewerState> {

  public state: LuisModelsViewerState = { checkAllChecked: false };
  private existingLuisServicesMap: { [id: string]: ILuisService } = {};

  constructor(props: LuisModelsViewerProps, context: LuisModelsViewerState) {
    super(props, context);
    this.updateExistingServicesMap(props);
  }

  public componentWillReceiveProps(nextProps: LuisModelsViewerProps = {} as any): void {
    this.updateExistingServicesMap(nextProps);
    this.setState({...this.state, ...this.existingLuisServicesMap});
  }

  public render(): JSX.Element {
    return (
      <Dialog
        title="Add your LUIS apps"
        className={ styles.luisModelsViewer }
        cancel={ this.props.cancel }>
        <div className={ styles.listContainer }>
          <p>
            Select a LUIS app below to store the app ID in your bot file or&nbsp;
            <a href="javascript:void(0);" onClick={ this.props.launchLuisEditor }>
              add a LUIS app manually by entering the app ID and key
            </a>
          </p>
          <div className={ styles.selectAll }>
            <Checkbox
              onChange={ this.onSelectAllChange }
              checked={ this.state.checkAllChecked } id="select-all-luis-models"
              label="Select all"/>
          </div>
          <ul>
            { ...this.luisModelElements }
          </ul>

          <p>
            <a href="javascript:void(0);" className={ styles.newLuisApp }>Create a new LUIS app</a>
          </p>
          <p>
            Signed in as { this.props.authenticatedUser }. You can link apps from a different LUIS
            account to this Azure account by adding yourself as a collaborator.&nbsp;
            <a href="javascript:void(0);">Learn more about collaborating.</a>
          </p>
        </div>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel }/>
          <PrimaryButton text="Add" onClick={ this.onAddClick } aria-disabled={!this.addButtonEnabled}/>
        </DialogFooter>
      </Dialog>
    );
  }

  private get luisModelElements(): JSX.Element[] {
    const { state, onChange } = this;
    const { availableLuisServices } = this.props;
    const items = availableLuisServices.map(luisModel => {
      const { id, name: label, version } = luisModel;
      const checkboxProps = {
        label,
        checked: !!state[id],
        id: `model${id}`,
        onChange: onChange.bind(this, luisModel),
        disabled: !!this.existingLuisServicesMap[id]
      };
      return (
        <li key={ id }>
          <Checkbox { ...checkboxProps } className={ styles.checkboxOverride }/>
          <span>&nbsp;-&nbsp;v{ version }</span>
          <span>{ 'en-us' }</span>
        </li>
      );
    });
    while (items.length < 4) {
      items.push(<li key={ `empty_${Math.random()}` }>&nbsp;</li>);
    }
    return items;
  }

  private get addButtonEnabled(): boolean {
    const { state, existingLuisServicesMap: map } = this;
    const { checkAllChecked: _discarded, ...selectedModels } = state;
    return Object.keys(selectedModels).some((bool, key) => !!state[key] && !map[key]);
  }

  private onChange(luisModel: ILuisService) {
    const { checkAllChecked: _discarded, ...newState } = this.state;
    const { existingLuisServicesMap: map } = this;

    newState[luisModel.id] = !this.state[luisModel.id] ? luisModel : false;
    newState.checkAllChecked = Object.keys(newState).every(key => !!newState[key] || !!map[key]);
    this.setState(newState);
  }

  private updateExistingServicesMap(props: LuisModelsViewerProps) {
    const { existingLuisServices = [] as ILuisService[] } = props;

    this.existingLuisServicesMap = existingLuisServices
      .reduce((agg, luisService: ILuisService) => {
        agg[luisService.appId] = luisService;
        return agg;
      }, {});
  }

  private onSelectAllChange: ChangeEventHandler<any> = () => {
    const { availableLuisServices = [] } = this.props as any;
    const { existingLuisServicesMap: map } = this;
    const newState = {} as LuisModelsViewerState;
    const checked = newState.checkAllChecked = !this.state.checkAllChecked;

    availableLuisServices
      .forEach(luisModel => newState[luisModel.id] = !!map[luisModel.id] || checked ? luisModel : false);

    this.setState(newState);
  }

  private onAddClick: ChangeEventHandler<any> = () => {
    const { checkAllChecked: _discarded, ...luisModels } = this.state;
    const reducer = (models, luisModelId) => {
      if (luisModels[luisModelId]) {
        models.push(luisModels[luisModelId]);
      }
      return models;
    };
    const addedModels: ILuisService[] = Object.keys(luisModels).reduce(reducer, []);
    this.props.addLuisModels(addedModels);
  }
}
