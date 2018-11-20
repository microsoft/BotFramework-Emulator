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

import { DefaultButton, Dialog, DialogFooter, PrimaryButton, TextField } from '@bfemulator/ui-react';
import { BotConfigurationBase } from 'botframework-config/lib/botConfigurationBase';
import { ConnectedService } from 'botframework-config/lib/models';
import { IConnectedService, ServiceTypes } from 'botframework-config/lib/schema';
import * as React from 'react';
import { ChangeEvent, Component } from 'react';
import { serviceTypeLabels } from '../../../../../utils/serviceTypeLables';
import * as styles from './connectedServiceEditor.scss';

interface ConnectedServiceEditorProps {
  connectedService: IConnectedService;
  cancel: () => void;
  updateConnectedService: (updatedLuisService: IConnectedService) => void;
  onAnchorClick: (url: string) => void;
  serviceType?: ServiceTypes;
}

interface ConnectedServiceEditorState extends Partial<any> {
  connectedServiceCopy: ConnectedService;
  isDirty: boolean;
}

const labelMap = {
  authoringKey: 'Authoring key',
  applicationId: 'App Insights Application ID',
  instrumentationKey: 'App Insights Instrumentation Key',
  serviceName: 'Azure Service Name',
  appId: 'LUIS app ID',
  id: 'App ID',
  endpointKey: 'Endpoint key',
  hostname: 'Host Name',
  kbId: 'Knowledge base ID',
  name: 'Name',
  resourceGroup: 'Azure Resource group',
  subscriptionId: 'Azure Subscription ID',
  subscriptionKey: 'Azure Subscription key',
  tenantId: 'Azure Tenant ID',
  version: 'Version',
  ...serviceTypeLabels
};

const titleMap = {
  [ServiceTypes.Luis]: 'Connect to a LUIS app',
  [ServiceTypes.Dispatch]: 'Connect to a Dispatch model',
  [ServiceTypes.QnA]: 'Connect to a QnA Maker knowledge base',
  [ServiceTypes.Bot]: 'Connect to Azure Bot Service',
  [ServiceTypes.AppInsights]: 'Connect to Application Insights resource'
};

const portalMap = {
  [ServiceTypes.Luis]: 'LUIS.ai',
  [ServiceTypes.Dispatch]: 'LUIS.ai',
  [ServiceTypes.QnA]: 'QnaMaker.ai',
};

const getEditableFields = (service: IConnectedService): string[] => {
  switch (service.type) {
    case ServiceTypes.Luis:
    case ServiceTypes.Dispatch:
      return ['name', 'appId', 'authoringKey', 'version', 'subscriptionKey'];

    case ServiceTypes.QnA:
      return ['name', 'kbId', 'hostname', 'subscriptionKey', 'endpointKey'];

    case ServiceTypes.AppInsights:
      return [
        'name',
        'tenantId',
        'subscriptionKey',
        'resourceGroup',
        'serviceName',
        'instrumentationKey',
        'applicationId'
      ];

    default:
      throw new TypeError(`${ service.type } is not a valid service type`);
  }
};

export class ConnectedServiceEditor extends Component<ConnectedServiceEditorProps, ConnectedServiceEditorState> {
  public state: ConnectedServiceEditorState = {} as ConnectedServiceEditorState;

  constructor(props: ConnectedServiceEditorProps, state: ConnectedServiceEditorState) {
    super(props, state);
    const connectedServiceCopy = BotConfigurationBase
      .serviceFromJSON((props.connectedService || { type: props.serviceType, name: '' }));
    this.state = {
      connectedServiceCopy,
      isDirty: false
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<ConnectedServiceEditorProps>): void {
    const connectedServiceCopy = BotConfigurationBase.serviceFromJSON(this.props.connectedService);
    this.setState({ connectedServiceCopy });
  }

  public render(): JSX.Element {
    const { state, onInputChange, props, onSubmitClick } = this;
    const { isDirty, connectedServiceCopy } = state;
    const { type } = connectedServiceCopy;
    const fields = getEditableFields(connectedServiceCopy);
    const textInputs: JSX.Element[] = [];
    let valid = true;
    // Build the editable inputs from the enumerable properties
    // in the data model. This assumes all enumerable fields are editable
    // except the type
    fields.forEach((prop, index) => {
      const isRequired = this.isRequired(prop);
      valid = valid && (!isRequired || !!connectedServiceCopy[prop]);
      textInputs.push(
        <TextField
          key={ `input_${ index }` }
          errorMessage={ state[`${ prop }Error`] || '' }
          value={ (connectedServiceCopy[prop] || '') }
          data-prop={ prop }
          onChange={ onInputChange }
          label={ labelMap[prop] } required={ isRequired }
        />
      );
    });

    return (
      <Dialog title={ titleMap[type] } cancel={ props.cancel } className={ styles.connectedServiceEditor }>
        <p>
          You can find your knowledge base ID and subscription key in { portalMap[type] }&nbsp;
          <a href="javascript:void(0);" onClick={ this.onLearnMoreClick }>
            Learn more about keys in { labelMap[type] }
          </a>
        </p>
        { textInputs }
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ props.cancel }/>
          <PrimaryButton disabled={ !isDirty || !valid } text="Submit" onClick={ onSubmitClick }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private isRequired(key: string): boolean {
    if (key === 'applicationId') {
      return false;
    }

    if (key !== 'subscriptionKey') {
      return true;
    }

    switch (this.state.connectedServiceCopy.type) {
      case ServiceTypes.Dispatch:
      case ServiceTypes.Luis:
        return false;

      default:
        return true;
    }
  }

  private onLearnMoreClick = (): void => {
    let url;
    switch (this.props.serviceType) {
      case ServiceTypes.Luis:
        url = 'http://aka.ms/bot-framework-emulator-LUIS-docs-home';
        break;

      case ServiceTypes.QnA:
        url = 'http://aka.ms/bot-framework-emulator-qna-keys';
        break;

      case ServiceTypes.Dispatch:
        url = 'https://aka.ms/bot-framework-emulator-create-dispatch';
        break;

      default:
        throw new Error(`${this.props.serviceType} is not a known service.`);
    }
    this.props.onAnchorClick(url);
  }

  private onSubmitClick = (): void => {
    this.props.updateConnectedService(this.state.connectedServiceCopy);
  }

  private onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    const { prop } = event.target.dataset;

    const trimmedValue = value.trim();

    const { connectedService: originalLuisService = {} } = this.props;
    const errorMessage = (this.isRequired(prop) && !trimmedValue) ? `The field cannot be empty` : '';

    const { connectedServiceCopy } = this.state;
    connectedServiceCopy[prop] = value;

    const isDirty = Object.keys(connectedServiceCopy)
      .reduce((dirty, key) => (dirty || connectedServiceCopy[key] !== originalLuisService[key]), false);
    this.setState({ connectedServiceCopy, [`${ prop }Error`]: errorMessage, isDirty } as any);
  }
}
