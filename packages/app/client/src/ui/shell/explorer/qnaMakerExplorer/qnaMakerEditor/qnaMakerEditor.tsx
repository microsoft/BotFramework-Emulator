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

import { Dialog, DialogFooter, DialogContent } from '@bfemulator/ui-react';
import { PrimaryButton, DefaultButton, TextField } from '@bfemulator/ui-react';
import { QnaMakerService } from 'msbot/bin/models';
import { IQnAService } from 'msbot/bin/schema';
import * as React from 'react';
import { Component } from 'react';

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

export class QnaMakerEditor extends Component<QnaMakerEditorProps, QnaMakerEditorState> {

  public state: QnaMakerEditorState = {} as QnaMakerEditorState;

  private _textFieldHandlers: { [key: string]: (x: string) => void } = {};

  constructor(props: QnaMakerEditorProps, state: QnaMakerEditorState) {
    super(props, state);
    const qnaMakerService = new QnaMakerService(Object.assign({ hostname: '' }, props.qnaMakerService));
    this.state = {
      qnaMakerService,
      nameError: '',
      kbIdError: '',
      subscriptionKeyError: '',
      endpointKeyError: '',
      hostnameError: '',
      isDirty: false
    };
    this._textFieldHandlers = {
      'name': this.onInputChange.bind(this, 'name', true),
      'subscriptionKey': this.onInputChange.bind(this, 'subscriptionKey', true),
      'hostname': this.onInputChange.bind(this, 'hostname', true),
      'endpointKey': this.onInputChange.bind(this, 'endpointKey', true),
      'kbId': this.onInputChange.bind(this, 'kbId', true)
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<QnaMakerEditorProps>): void {
    const qnaMakerService = new QnaMakerService(Object.assign({ hostname: '' }, nextProps.qnaMakerService));
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
      <Dialog title={title} detailedDescription={detailedDescription}
        cancel={this.onCancelClick} >
        <DialogContent>
          <TextField
            onChanged={this._textFieldHandlers.name}
            errorMessage={nameError}
            value={name}
            label="Name"
            required={true}
          />
          <TextField errorMessage={subscriptionKeyError} value={subscriptionKey}
            onChanged={this._textFieldHandlers.subscriptionKey}
            label="Subscription key" required={true}
          />
          <TextField errorMessage={hostnameError} value={hostname}
            onChanged={this._textFieldHandlers.hostname} label="Host name"
            required={true}
          />
          <TextField errorMessage={endpointKeyError} value={endpointKey}
            onChanged={this._textFieldHandlers.endpointKey}
            label="Endpoint Key" required={true}
          />
          <TextField errorMessage={kbIdError} value={kbId}
            onChanged={this._textFieldHandlers.kbId} label="Knowledge base Id"
            required={true}
          />
        </DialogContent>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.onCancelClick} />
          <PrimaryButton disabled={!isDirty || !valid} text="Submit" onClick={this.onSubmitClick} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onCancelClick = (): void => {
    this.props.cancel();
  }

  private onSubmitClick = (): void => {
    this.props.updateQnaMakerService(this.state.qnaMakerService);
  }

  private onInputChange = (propName: string, required: boolean, value: string): void => {
    const trimmedValue = value.trim();

    const { qnaMakerService: originalQnaMakerService } = this.props;
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { qnaMakerService } = this.state;
    qnaMakerService[propName] = trimmedValue;

    const isDirty = Object.keys(qnaMakerService)
      .reduce((dirty, key) => (dirty || qnaMakerService[key] !== originalQnaMakerService[key]), false);
    this.setState({ qnaMakerService, [`${propName}Error`]: errorMessage, isDirty } as any);
  }
}
