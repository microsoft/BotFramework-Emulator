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
import { EndpointService } from 'msbot/bin/models';
import { IEndpointService } from 'msbot/bin/schema';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';

interface EndpointEditorProps {
  endpointService: IEndpointService;
  cancel: () => void;
  updateEndpointService: (updatedEndpointService: IEndpointService) => void;
}

interface EndpointEditorState {
  endpointService: IEndpointService;
  nameError: string;
  endpointError: string;
  appIdError: string;
  appPasswordError: string;
  isDirty: boolean;
}

const title = 'Add a Endpoint for your bot';
const detailedDescription = 'You can add a endpoint that you use to communicate to an instance of your bot';
const modalCssOverrides = {
  width: '400px',
  height: '500px'
};

export class EndpointEditor extends Component<EndpointEditorProps, EndpointEditorState> {

  public state: EndpointEditorState = {} as EndpointEditorState;

  constructor(props: EndpointEditorProps, state: EndpointEditorState) {
    super(props, state);
    const endpointService = new EndpointService(props.endpointService);
    this.state = {
      endpointService,
      nameError: '',
      endpointError: '',
      appPasswordError: '',
      appIdError: '',
      isDirty: false
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<EndpointEditorProps>): void {
    const endpointService = new EndpointService(nextProps.endpointService);
    this.setState({ endpointService, appIdError: '', appPasswordError: '', endpointError: '', nameError: '' });
  }

  public render(): JSX.Element {
    const { endpointService, appIdError, appPasswordError, endpointError, nameError, isDirty } = this.state;
    const { name = '', endpoint = '', appId = '', appPassword = '' } = endpointService;
    const valid = !!endpoint && !!name;
    return (
      <Modal cssOverrides={ modalCssOverrides } title={ title } detailedDescription={ detailedDescription }
             cancel={ this.onCancelClick }>
        <ModalContent>
          <TextInputField error={ nameError } value={ name } onChange={ this.onInputChange } label="Name"
                          required={ true } inputAttributes={ { 'data-propname': 'name' } }/>
          <TextInputField error={ endpointError } value={ endpoint } onChange={ this.onInputChange }
                          label="Endpoint url" required={ true } inputAttributes={ { 'data-propname': 'endpoint' } }/>
          <TextInputField error={ appIdError } value={ appId } onChange={ this.onInputChange } label="Application Id"
                          required={ false } inputAttributes={ { 'data-propname': 'appId' } }/>
          <TextInputField error={ appPasswordError } value={ appPassword } onChange={ this.onInputChange }
                          label="Application Password" required={ false }
                          inputAttributes={ { 'data-propname': 'appPassword' } }/>
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
    this.props.updateEndpointService(this.state.endpointService);
  }

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const { required, value } = input;
    const trimmedValue = value.trim();

    const { endpointService: originalEndpointService } = this.props;
    const propName = input.getAttribute('data-propname');
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { endpointService } = this.state;
    endpointService[propName] = input.value;

    const isDirty = Object.keys(endpointService)
      .reduce((dirty, key) => (dirty || endpointService[key] !== originalEndpointService[key]), false);
    this.setState({ endpointService, [`${propName}Error`]: errorMessage, isDirty } as any);
  }
}
