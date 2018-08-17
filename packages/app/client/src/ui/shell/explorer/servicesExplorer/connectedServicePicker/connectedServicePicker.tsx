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
import { IConnectedService, ServiceType } from 'msbot/bin/schema';
import * as React from 'react';
import { ChangeEventHandler, Component } from 'react';

import * as styles from './connectedServicePicker.scss';

interface ConnectedServicesPickerProps {
  authenticatedUser: string;
  serviceType: ServiceType;

  connectedServices: IConnectedService[];
  availableServices: IConnectedService[];
  launchServiceEditor: () => void;
  connectServices: (models: IConnectedService[]) => void;
  cancel: () => void;
}

interface ConnectedServicesPickerState {
  [selectedLuisModelId: string]: IConnectedService | boolean;

  checkAllChecked: boolean;
}

export class ConnectedServicePicker extends Component<ConnectedServicesPickerProps, ConnectedServicesPickerState> {

  public state: ConnectedServicesPickerState = { checkAllChecked: false };
  private connectedServicesMap: { [id: string]: IConnectedService } = {};

  constructor(props: ConnectedServicesPickerProps, context: ConnectedServicesPickerState) {
    super(props, context);
    this.updateExistingServicesMap(props);
  }

  public componentWillReceiveProps(nextProps: ConnectedServicesPickerProps = {} as any): void {
    this.updateExistingServicesMap(nextProps);
    this.setState({ ...this.state, ...this.connectedServicesMap });
  }

  public render(): JSX.Element {
    return (
      <Dialog
        title="Add your LUIS apps"
        className={ styles.luisModelsViewer }
        cancel={ this.props.cancel }>
        <div className={ styles.listContainer }>
          { this.headerElements }
          { this.selectAllCheckbox }
          <ul>
            { ...this.serviceListElements }
          </ul>
          { this.contentElements }
        </div>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel }/>
          <PrimaryButton text="Add" onClick={ this.onAddClick } disabled={ !this.addButtonEnabled }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private get serviceListElements(): JSX.Element[] {
    const { state, onChange } = this;
    const { availableServices } = this.props;
    const items = availableServices.map(service => {
      const { id, name: label } = service;
      const checkboxProps = {
        label,
        checked: !!state[id],
        id: `service_${id}`,
        onChange: onChange.bind(this, service),
        disabled: !!this.connectedServicesMap[id]
      };
      return (
        <li key={ id }>
          <Checkbox { ...checkboxProps } className={ styles.checkboxOverride }/>
          { ('version' in service) ? <span>v{ (service as any).version }</span> : null }
        </li>
      );
    });
    return items;
  }

  private get addButtonEnabled(): boolean {
    const { state, connectedServicesMap: map } = this;
    const { checkAllChecked: _discarded, ...selectedModels } = state;
    return Object.keys(selectedModels).some(key => !!state[key] && !map[key]);
  }

  private onChange(service: IConnectedService) {
    const { checkAllChecked: _discarded, ...newState } = this.state;
    const { connectedServicesMap: map } = this;

    newState[service.id] = !this.state[service.id] ? service : false;
    newState.checkAllChecked = Object.keys(newState).every(key => !!newState[key] || !!map[key]);
    this.setState(newState);
  }

  private updateExistingServicesMap(props: ConnectedServicesPickerProps) {
    const { connectedServices = [] as IConnectedService[] } = props;
    this.connectedServicesMap = connectedServices.reduce((map, service) => (map[service.id] = true, map), {});
  }

  private onSelectAllChange: ChangeEventHandler<any> = () => {
    const { availableServices = [] } = this.props as any;
    const { connectedServicesMap: map } = this;
    const newState = {} as ConnectedServicesPickerState;
    const checked = newState.checkAllChecked = !this.state.checkAllChecked;

    availableServices.forEach(service => newState[service.id] = !!map[service.id] || checked ? service : false);

    this.setState(newState);
  }

  private onAddClick: ChangeEventHandler<any> = () => {
    const { checkAllChecked: _discarded, ...services } = this.state;
    const reducer = (models, serviceId) => {
      if (services[serviceId]) {
        models.push(services[serviceId]);
      }
      return models;
    };
    const addedModels: IConnectedService[] = Object.keys(services).reduce(reducer, []);
    this.props.connectServices(addedModels);
  }

  private get selectAllCheckbox(): JSX.Element {
    if (this.props.availableServices.length < 2) {
      return null;
    }
    return (
      <div className={ styles.selectAll }>
        <Checkbox
          onChange={ this.onSelectAllChange }
          checked={ this.state.checkAllChecked }
          id="select-all-services"
          label="Select all"/>
      </div>
    );
  }

  // --------------------------------
  // Header specific to
  private get headerElements(): JSX.Element {
    switch (this.props.serviceType) {
      case ServiceType.Luis:
        return this.luisServiceHeader;

      case ServiceType.QnA:
        return this.qnaServiceHeader;

      case ServiceType.Dispatch:
        return this.dispatchServiceHeader;

      default:
        return null;
    }
  }

  private get luisServiceHeader(): JSX.Element {
    return (
      <p>
        Select a LUIS app below to store the app ID in your bot file or&nbsp;
        <a href="javascript:void(0);" onClick={ this.props.launchServiceEditor }>
          add a LUIS app manually by entering the app ID and key
        </a>
      </p>
    );
  }

  private get qnaServiceHeader(): JSX.Element {
    return (
      <p>
        Select a knowledge base below to store the knowledge base Id in your bot file&npsp;
        or <a href="javascript:void(0);">connect to a knowledge base manually</a> by&nbsp;
        entering the knowledge base ID and key.
      </p>
    );
  }

  private get dispatchServiceHeader(): JSX.Element {
    return (
      <p>
        Select a Dispatch app below to store the app ID in your bot file&npsp;
        or <a href="javascript:void(0);">connect to a Dispatch app manually</a> by&nbsp;
        entering the knowledge base ID and key.
      </p>
    );
  }

  // --------------------------------------
  // Content specific to the service
  private get contentElements(): JSX.Element {
    switch (this.props.serviceType) {
      case ServiceType.Luis:
        return this.luisServiceContent;

      case ServiceType.QnA:
        return this.qnaServiceContent;

      case ServiceType.Dispatch:
        return this.dispatchServiceContent;

      default:
        return null;
    }
  }

  private get luisServiceContent(): JSX.Element {
    return (
      <>
        <a href="javascript:void(0);" className={ styles.paddedLink }>Create a new LUIS app</a>
        <p>
          Signed in as { this.props.authenticatedUser }. You can link apps from a different LUIS
          account to this Azure account by adding yourself as a collaborator.&nbsp;
          <a href="javascript:void(0);">Learn more about collaborating.</a>
        </p>
      </>
    );
  }

  private get qnaServiceContent(): JSX.Element {
    return (
      <>
        <a href="javascript:void(0);" className={ styles.paddedLink }>Create a new knowledge base</a>
        <p>
          Signed in as { this.props.authenticatedUser }.
        </p>
      </>
    );
  }

  private get dispatchServiceContent(): JSX.Element {
    return (
      <>
        <a href="javascript:void(0);" className={ styles.paddedLink }>Learn more about using Dispatch apps</a>
        <p>
          Signed in as { this.props.authenticatedUser }. You can link apps from a different LUIS
          account to this Azure account by adding yourself as a collaborator.&nbsp;
          <a href="javascript:void(0);">Learn more about collaborating.</a>
        </p>
      </>
    );
  }
}
