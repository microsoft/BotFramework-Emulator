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

import { DefaultButton, Dialog, DialogContent, DialogFooter, PrimaryButton, TextField } from '../../../../../../../../sdk/ui-react/built/index';
import { DispatchService } from 'msbot/bin/models';
import { IDispatchService } from 'msbot/bin/schema';
import * as React from 'react';
import { Component } from 'react';

interface DispatchEditorProps {
  dispatchService: IDispatchService;
  cancel: () => void;
  updateDispatchService: (updatedDispatchService: IDispatchService) => void;
}

interface DispatchEditorState {
  dispatchService: IDispatchService;
  nameError: string;
  appIdError: string;
  authoringKeyError: string;
  versionError: string;
  subscriptionKeyError: string;
  isDirty: boolean;
}

const title = 'Connect to a Dispatch Application';
const detailedDescription = 'You can connect your bot to a Dispatch application';

export class DispatchEditor extends Component<DispatchEditorProps, DispatchEditorState> {

  public state: DispatchEditorState = {} as DispatchEditorState;
  private _textFieldHandlers: { [key: string]: (x: string) => void } = {};

  constructor(props: DispatchEditorProps, state: DispatchEditorState) {
    super(props, state);
    const dispatchService = new DispatchService(props.dispatchService);
    this.state = {
      dispatchService,
      nameError: '',
      appIdError: '',
      authoringKeyError: '',
      versionError: '',
      subscriptionKeyError: '',
      isDirty: false
    };
    this._textFieldHandlers = {
      'name': this.onInputChange.bind(this, 'name', true),
      'appId': this.onInputChange.bind(this, 'appId', true),
      'authoringKey': this.onInputChange.bind(this, 'authoringKey', true),
      'version': this.onInputChange.bind(this, 'version', true),
      'subscriptionKey': this.onInputChange.bind(this, 'subscriptionKey', false)
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<DispatchEditorProps>): void {
    const dispatchService = new DispatchService(nextProps.dispatchService);
    this.setState({ dispatchService });
  }

  public render(): JSX.Element {
    const {
      dispatchService,
      appIdError,
      authoringKeyError,
      isDirty,
      nameError,
      subscriptionKeyError,
      versionError
    } = this.state;
    const { name = '', appId = '', authoringKey = '', subscriptionKey = '', version = '' } = dispatchService;
    const valid = !nameError && !appIdError && !authoringKeyError && !versionError && !subscriptionKeyError;

    return (
      <Dialog title={ title } detailedDescription={ detailedDescription }
              cancel={ this.onCancelClick }>
        <DialogContent>
          <TextField value={ name }
                     onChanged={ this._textFieldHandlers.name } label="Name" required={ true }
          />
          <TextField value={ appId }
                     onChanged={ this._textFieldHandlers.appId } label="Application Id" required={ true }
          />
          <TextField value={ authoringKey }
                     onChanged={ this._textFieldHandlers.authoringKey } label="Authoring key" required={ true }
          />
          <TextField value={ version }
                     onChanged={ this._textFieldHandlers.version } label="Version" required={ true }
          />
          <TextField value={ subscriptionKey }
                     onChanged={ this._textFieldHandlers.subscriptionKey } label="Subscription key"
          />
        </DialogContent>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.onCancelClick }/>
          <PrimaryButton disabled={ !isDirty || !valid } text="Submit" onClick={ this.onSubmitClick }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private onCancelClick = (): void => {
    this.props.cancel();
  }

  private onSubmitClick = (): void => {
    const { dispatchService } = this.state;
    dispatchService.id = dispatchService.appId;
    this.props.updateDispatchService(dispatchService);
  }

  private onInputChange = (propName: string, required: boolean, value: string): void => {
    const trimmedValue = value.trim();

    const { dispatchService: originalDispatchService } = this.props;
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { dispatchService } = this.state;
    dispatchService[propName] = value;

    const isDirty = Object.keys(dispatchService)
      .reduce((dirty, key) => (dirty || dispatchService[key] !== originalDispatchService[key]), false);
    this.setState({ dispatchService, [`${propName}Error`]: errorMessage, isDirty } as any);
  }
}
