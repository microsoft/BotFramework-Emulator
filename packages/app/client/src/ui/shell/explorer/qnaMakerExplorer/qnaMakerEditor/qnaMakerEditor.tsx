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
import { QnaMakerService } from 'msbot/bin/models';
import { IQnAService } from 'msbot/bin/schema';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';

interface QnaMakerEditorProps {
  qnaMakerService: IQnAService;
  cancel: () => void;
  updateQnaMakerService: (updatedQnaMakerService: IQnAService) => void;
}

interface QnaMakerEditorState {
  qnaMakerService: IQnAService;
  nameError: string;
  subscriptionKeyError: string;
  hostnameError: string;
  endpointKeyError: string;
  kbIdError: string;
  isDirty: boolean;
}

const title = 'Add a QnA Maker knowledge base';
const detailedDescription = 'You can find your knowledge base subscription key in QnaMaker.ai';
const modalCssOverrides = {
  width: '400px',
  height: '530px'
};

export class QnaMakerEditor extends Component<QnaMakerEditorProps, QnaMakerEditorState> {

  public state: QnaMakerEditorState = {} as QnaMakerEditorState;

  constructor(props: QnaMakerEditorProps, state: QnaMakerEditorState) {
    super(props, state);
    const qnaMakerService = new QnaMakerService(props.qnaMakerService);
    this.state = {
      qnaMakerService,
      nameError: '',
      kbIdError: '',
      subscriptionKeyError: '',
      endpointKeyError: '',
      hostnameError: '',
      isDirty: false
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<QnaMakerEditorProps>): void {
    const qnaMakerService = new QnaMakerService(nextProps.qnaMakerService);
    this.setState({ qnaMakerService });
  }

  public render(): JSX.Element {
    const {
      qnaMakerService,
      kbIdError,
      nameError,
      subscriptionKeyError,
      hostnameError,
      endpointKeyError,
      isDirty
    } = this.state;
    const { name = '', subscriptionKey = '', hostname = '', endpointKey = '', kbId = '' } = qnaMakerService;
    const valid = !!kbId && !!name && !!subscriptionKey && !!hostname && !!endpointKey;
    return (
      <Modal cssOverrides={ modalCssOverrides } title={ title } detailedDescription={ detailedDescription }
             cancel={ this.onCancelClick }>
        <ModalContent>
          <TextInputField error={ nameError } value={ name } onChange={ this.onInputChange } label="Name"
                          required={ true } inputAttributes={ { 'data-propname': 'name' } }/>
          <TextInputField error={ subscriptionKeyError } value={ subscriptionKey } onChange={ this.onInputChange }
                          label="Subscription key" required={ true }
                          inputAttributes={ { 'data-propname': 'subscriptionKey' } }/>
          <TextInputField error={ hostnameError } value={ hostname } onChange={ this.onInputChange } label="Host name"
                          required={ true } inputAttributes={ { 'data-propname': 'hostname' } }/>
          <TextInputField error={ endpointKeyError } value={ endpointKey } onChange={ this.onInputChange }
                          label="Endpoint Key" required={ true }
                          inputAttributes={ { 'data-propname': 'endpointKey' } }/>
          <TextInputField error={ kbIdError } value={ kbId } onChange={ this.onInputChange } label="Knowledge base Id"
                          required={ true } inputAttributes={ { 'data-propname': 'kbId' } }/>
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
    this.props.updateQnaMakerService(this.state.qnaMakerService);
  }

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const { required, value } = input;
    const trimmedValue = value.trim();

    const { qnaMakerService: originalQnaMakerService } = this.props;
    const propName = input.getAttribute('data-propname');
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { qnaMakerService } = this.state;
    qnaMakerService[propName] = trimmedValue;

    const isDirty = Object.keys(qnaMakerService)
      .reduce((dirty, key) => (dirty || qnaMakerService[key] !== originalQnaMakerService[key]), false);
    this.setState({ qnaMakerService, [`${propName}Error`]: errorMessage, isDirty } as any);
  }
}
