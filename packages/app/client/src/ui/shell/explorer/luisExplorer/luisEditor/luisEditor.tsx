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

import { LuisService } from 'msbot/bin/models';
import { ILuisService } from 'msbot/bin/schema';
import { DefaultButton, Dialog, DialogContent, DialogFooter, PrimaryButton, TextField } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component } from 'react';

interface LuisEditorProps {
  luisService: ILuisService;
  cancel: () => void;
  updateLuisService: (updatedLuisService: ILuisService) => void;
}

interface LuisEditorState {
  luisService: ILuisService;
  nameError: string;
  appIdError: string;
  authoringKeyError: string;
  versionError: string;
  subscriptionKeyError: string;
  isDirty: boolean;
}

const title = 'Connect to a Luis Application';
const detailedDescription = 'You can connect your bot to a Luis.ai application';

export class LuisEditor extends Component<LuisEditorProps, LuisEditorState> {

  public state: LuisEditorState = {} as LuisEditorState;

  private _textFieldHandlers: { [key: string]: (x: string) => void } = {};

  constructor(props: LuisEditorProps, state: LuisEditorState) {
    super(props, state);
    const luisService = new LuisService(props.luisService);
    this.state = {
      luisService,
      nameError: '',
      appIdError: '',
      authoringKeyError: '',
      versionError: '',
      subscriptionKeyError: '',
      isDirty: false
    };

    this._textFieldHandlers = {
      name: this.onInputChange.bind(this, 'name', true),
      appId: this.onInputChange.bind(this, 'appId', true),
      authoringKey: this.onInputChange.bind(this, 'authoringKey', true),
      version: this.onInputChange.bind(this, 'version', true),
      subscriptionKey: this.onInputChange.bind(this, 'subscriptionKey', false)
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<LuisEditorProps>): void {
    const luisService = new LuisService(nextProps.luisService);
    this.setState({ luisService });
  }

  public render(): JSX.Element {
    const { onCancelClick, onSubmitClick } = this;
    const {
      luisService,
      nameError,
      appIdError,
      authoringKeyError,
      versionError,
      subscriptionKeyError,
      isDirty
    } = this.state;
    const { name = '', appId = '', authoringKey = '', subscriptionKey = '', version = '' } = luisService;
    const valid = !!name && !!appId && !!authoringKey && !!version;
    return (
      <Dialog title={title} detailedDescription={detailedDescription}
        cancel={onCancelClick}>
        <DialogContent>
          <TextField
            errorMessage={nameError}
            value={name}
            onChanged={this._textFieldHandlers.name}
            label="Name" required={true}
          />
          <TextField
            errorMessage={appIdError}
            value={appId}
            onChanged={this._textFieldHandlers.appId}
            label="Application Id"
            required={true}
          />
          <TextField
            errorMessage={authoringKeyError}
            value={authoringKey}
            onChanged={this._textFieldHandlers.authoringKey}
            label="Authoring key" required={true}
            data-propname="authoringKey"
          />
          <TextField
            errorMessage={versionError}
            value={version}
            onChanged={this._textFieldHandlers.version}
            label="Version"
            required={true}
          />
          <TextField
            errorMessage={subscriptionKeyError}
            value={subscriptionKey}
            onChanged={this._textFieldHandlers.subscriptionKey}
            label="Subscription key"
            required={false}
          />
        </DialogContent>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={onCancelClick} />
          <PrimaryButton disabled={!isDirty || !valid} text="Submit" onClick={onSubmitClick} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onCancelClick = (): void => {
    this.props.cancel();
  }

  private onSubmitClick = (): void => {
    this.props.updateLuisService(this.state.luisService);
  }

  private onInputChange = (propName: string, required: boolean, value: string): void => {
    const trimmedValue = value.trim();

    const { luisService: originalLuisService } = this.props;
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { luisService } = this.state;
    luisService[propName] = value;

    const isDirty = Object.keys(luisService)
      .reduce((dirty, key) => (dirty || luisService[key] !== originalLuisService[key]), false);
    this.setState({ luisService, [`${propName}Error`]: errorMessage, isDirty } as any);
  }
}
