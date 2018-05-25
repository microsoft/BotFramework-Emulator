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

import { Modal, ModalActions, ModalContent, PrimaryButton, TextInputField } from '@bfemulator/ui-react';
import { AzureBotService } from 'msbot/bin/models';
import { IAzureBotService } from 'msbot/bin/schema';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';

interface AzureBotServiceEditorProps {
  azureBotService: IAzureBotService;
  cancel: () => void;
  updateAzureBotService: (updatedAzureBotService: IAzureBotService) => void;
}

interface AzureBotServiceEditorState {
  azureBotService: IAzureBotService;
  nameError: string;
  idError: string;
  tenantIdError: string;
  subscriptionIdError: string;
  resourceGroupError: string;
  isDirty: boolean;
}

const title = 'Connect to Azure Bot Service';
const detailedDescription = 'Connect your bot to a registration in the Azure Bot Service portal';
const modalCssOverrides = {
  width: '400px',
  height: '550px'
};

export class AzureBotServiceEditor extends Component<AzureBotServiceEditorProps, AzureBotServiceEditorState> {

  public state: AzureBotServiceEditorState = {} as AzureBotServiceEditorState;

  constructor(props: AzureBotServiceEditorProps, state: AzureBotServiceEditorState) {
    super(props, state);
    const azureBotService = new AzureBotService(props.azureBotService);
    this.state = {
      azureBotService,
      isDirty: false,
      idError: '',
      nameError: '',
      tenantIdError: '',
      subscriptionIdError: '',
      resourceGroupError: ''
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<AzureBotServiceEditorProps>): void {
    const azureBotService = new AzureBotService(nextProps.azureBotService);
    this.setState({ azureBotService });
  }

  public render(): JSX.Element {
    const {
      azureBotService,
      idError,
      nameError,
      isDirty,
      tenantIdError,
      subscriptionIdError,
      resourceGroupError
    } = this.state;
    const { name = '', id = '', tenantId = '', subscriptionId = '', resourceGroup = '' } = azureBotService;
    const valid = !tenantIdError && !subscriptionIdError && !resourceGroupError && !idError && !nameError;
    return (
      <Modal cssOverrides={ modalCssOverrides } title={ title } detailedDescription={ detailedDescription }
             cancel={ this.onCancelClick }>
        <ModalContent>
          <TextInputField error={ nameError } value={ name } onChange={ this.onInputChange } label="Bot Name"
                          required={ true } inputAttributes={ { 'data-propname': 'name' } }/>
          <TextInputField error={ idError } value={ id } onChange={ this.onInputChange } label="Azure Bot Id"
                          required={ true } inputAttributes={ { 'data-propname': 'id' } }/>
          <TextInputField error={ tenantIdError } value={ tenantId } onChange={ this.onInputChange }
                          label="Azure Tenant Id" required={ true }
                          inputAttributes={ { 'data-propname': 'tenantId' } }/>
          <TextInputField error={ subscriptionIdError } value={ subscriptionId } onChange={ this.onInputChange }
                          label="Azure Subscription Id" required={ true }
                          inputAttributes={ { 'data-propname': 'subscriptionId' } }/>
          <TextInputField error={ resourceGroupError } value={ resourceGroup } onChange={ this.onInputChange }
                          label="Azure Resource Group" required={ true }
                          inputAttributes={ { 'data-propname': 'resourceGroup' } }/>
        </ModalContent>
        <ModalActions>
          <PrimaryButton text="Cancel" secondary={ true } onClick={ this.onCancelClick }/>
          <PrimaryButton disabled={ !isDirty || !valid } text="Submit" onClick={ this.onSubmitClick }/>
        </ModalActions>
      </Modal>
    );
  }

  private onCancelClick = (_event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.cancel();
  }

  private onSubmitClick = (_event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.updateAzureBotService(this.state.azureBotService);
  }

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const { required, value } = input;
    const trimmedValue = value.trim();

    const { azureBotService: originalAzureBotService } = this.props;
    const propName = input.getAttribute('data-propname');
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { azureBotService } = this.state;
    azureBotService[propName] = input.value;

    const isDirty = Object.keys(azureBotService)
      .reduce((dirty, key) => (dirty || azureBotService[key] !== originalAzureBotService[key]), false);
    this.setState({ azureBotService, [`${propName}Error`]: errorMessage, isDirty } as any);
  }
}
