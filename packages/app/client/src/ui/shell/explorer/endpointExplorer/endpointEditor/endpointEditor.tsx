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

import {
  DefaultButton,
  Dialog,
  DialogContent,
  DialogFooter,
  PrimaryButton,
  Row,
  TextField
} from '@bfemulator/ui-react';
import { EndpointService } from 'botframework-config/lib/models';
import { IEndpointService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { Component } from 'react';
import * as styles from './endpointEditor.scss';

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
  endpointWarning: string;
  isDirty: boolean;
}

const title = 'Add a Endpoint for your bot';
const detailedDescription = 'You can add a endpoint that you use to communicate to an instance of your bot';

export class EndpointEditor extends Component<EndpointEditorProps, EndpointEditorState> {
  public state: EndpointEditorState = {} as EndpointEditorState;
  private textFieldHandlers: { [key: string]: (x: string) => void } = {};
  private endpointWarningDelay: any;

  private static validateEndpoint(endpoint: string): string {
    const controllerRegEx = /api\/messages\/?$/;
    return controllerRegEx.test(endpoint) ? '' : `Please include route if necessary: "/api/messages"`;
  }

  constructor(props: EndpointEditorProps, state: EndpointEditorState) {
    super(props, state);
    const endpointService = new EndpointService(props.endpointService);
    this.state = {
      endpointService,
      nameError: '',
      endpointError: '',
      appPasswordError: '',
      appIdError: '',
      endpointWarning: '',
      isDirty: false
    };
    this.textFieldHandlers = {
      'name': this.onInputChange.bind(this, 'name', true),
      'endpoint': this.onInputChange.bind(this, 'endpoint', true),
      'appId': this.onInputChange.bind(this, 'appId', false),
      'appPassword': this.onInputChange.bind(this, 'appPassword', false)
    };
  }

  public componentWillReceiveProps(nextProps: Readonly<EndpointEditorProps>): void {
    const endpointService = new EndpointService(nextProps.endpointService);
    this.setState({ endpointService, appIdError: '', appPasswordError: '', endpointError: '', nameError: '' });
  }

  public render(): JSX.Element {
    const {
      endpointService,
      appIdError,
      appPasswordError,
      endpointError,
      nameError,
      endpointWarning,
      isDirty,
    } = this.state;
    const { name = '', endpoint = '', appId = '', appPassword = '' } = endpointService;
    const valid = !!endpoint && !!name;
    return (
      <Dialog title={ title } detailedDescription={ detailedDescription }
              cancel={ this.onCancelClick }>
        <DialogContent>
          <TextField
            placeholder="https://"
            errorMessage={ endpointError } value={ endpoint }
            onChanged={ this.textFieldHandlers.endpoint }
            label="Endpoint url" required={ true }
          />
          { !endpointError && endpointWarning && <span className={ styles.endpointWarning }>{ endpointWarning }</span> }
          <TextField
            placeholder="Create name for your endpoint"
            errorMessage={ nameError } value={ name }
            onChanged={ this.textFieldHandlers.name } label="Name"
            required={ true }
          />
          <TextField
            placeholder="Optional"
            errorMessage={ appIdError } value={ appId }
            onChanged={ this.textFieldHandlers.appId }
            label="Application Id"
            required={ false }
          />
          <TextField
            placeholder="Optional. For Microsoft Apps"
            errorMessage={ appPasswordError } value={ appPassword }
            onChanged={ this.textFieldHandlers.appPassword }
            label="Application Password" required={ false }
          />
          { /*<a href="javascript:void(0)"*/ }
          { /*className={ styles.arrow } onClick={ this.onABSLinkClick }>*/ }
          { /*Azure Bot Service configuration*/ }
          { /*</a>*/ }
          <div className={ styles.absContent } ref={ this.absContentRef }>
            <div>
              <Row className={ styles.absTextFieldRow }>
                <TextField label="Azure BotId"/>
                <TextField label="Azure Directory ID"/>
              </Row>
              <Row className={ styles.absTextFieldRow }>
                <TextField label="Azure Subscription ID"/>
                <TextField label="Azure Resource Group"/>
              </Row>
            </div>
          </div>
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
    this.props.updateEndpointService(this.state.endpointService);
  }

  private onInputChange = (propName: string, required: boolean, value: string): void => {
    const trimmedValue = value.trim();

    const { endpointService: originalEndpointService } = this.props;
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { endpointService } = this.state;
    endpointService[propName] = value;

    const isDirty = Object.keys(endpointService)
      .reduce((dirty, key) => (dirty || endpointService[key] !== originalEndpointService[key]), false);
    this.setState({ endpointService, [`${propName}Error`]: errorMessage, isDirty } as any);

    if (propName === 'endpoint') {
      clearTimeout(this.endpointWarningDelay);
      this.endpointWarningDelay = setTimeout(() =>
        this.setState({ endpointWarning: EndpointEditor.validateEndpoint(value) }), 500);
    }
  }

  // private onABSLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
  //   // Process this outside the react state
  //   const { currentTarget } = event;
  //   currentTarget.classList.toggle(styles.arrowExpanded);
  //   const expanded = currentTarget.classList.contains(styles.arrowExpanded);
  //   const { clientHeight } = this.absContent.firstChild as HTMLElement;
  //   const newHeight = expanded ? clientHeight : 0;
  //   this.absContent.style.height = `${newHeight}px`;
  // }

  private absContentRef = (_ref: HTMLDivElement): void => {
    // TODO - reimplement this
    // this.absContent = ref;
  }
}
