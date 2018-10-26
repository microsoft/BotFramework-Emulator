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
  DialogFooter,
  PrimaryButton,
  Row,
  TextField
} from '@bfemulator/ui-react';
import { BotService, EndpointService } from 'botframework-config/lib/models';
import { IBotService, IEndpointService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { Component, MouseEvent } from 'react';
import * as styles from './endpointEditor.scss';

export interface UpdatedServicesPayload extends Array<IEndpointService | IBotService> {
  '0': IEndpointService;
  '1'?: IBotService;
  length: 1 | 2;
}

export interface EndpointEditorProps {
  endpointService?: IEndpointService;
  botService?: IBotService;
  cancel: () => void;
  updateEndpointService: (updatedServices: UpdatedServicesPayload) => void;
}

export interface EndpointEditorState {
  endpointService: IEndpointService;
  botService?: IBotService;
  nameError: string;
  endpointError: string;
  appIdError: string;
  appPasswordError: string;
  endpointWarning: string;
}

const title = 'Add a Endpoint for your bot';
const detailedDescription = 'You can add a endpoint that you use to communicate to an instance of your bot';

export class EndpointEditor extends Component<EndpointEditorProps, EndpointEditorState> {
  public state: EndpointEditorState = {} as EndpointEditorState;
  private endpointServiceInputHandlers: { [key: string]: (x: string) => void } = {};
  private botServiceInputHandlers: { [key: string]: (x: string) => void } = {};
  private endpointWarningDelay: any;
  private absContent: HTMLDivElement;

  public static getDerivedStateFromProps(nextProps: EndpointEditorProps) {
    const { endpointService, botService } = nextProps;
    const derivedState: EndpointEditorState = {} as EndpointEditorState;

    if (endpointService) {
      Object.assign(derivedState, {
        endpointService: new EndpointService(endpointService),
        nameError: '',
        endpointError: '',
        appPasswordError: '',
        appIdError: '',
        endpointWarning: '',
        isDirty: false
      });
    }

    if (botService) {
      Object.assign(derivedState, {
        botService: new BotService(botService)
      });
    }

    return derivedState;
  }

  private static validateEndpoint(endpoint: string): string {
    const controllerRegEx = /api\/messages\/?$/;
    return controllerRegEx.test(endpoint) ? '' : `Please include route if necessary: "/api/messages"`;
  }

  constructor(props: EndpointEditorProps, state: EndpointEditorState) {
    super(props, state);
    const { endpointService, botService } = props;

    this.state = {
      endpointService: new EndpointService(endpointService),
      nameError: '',
      endpointError: '',
      appPasswordError: '',
      appIdError: '',
      endpointWarning: '',
    };

    if (botService) {
      this.state.botService = new BotService(botService);
    }

    this.endpointServiceInputHandlers = {
      name: this.onEndpointInputChange.bind(this, 'name', true),
      endpoint: this.onEndpointInputChange.bind(this, 'endpoint', true),
      appId: this.onEndpointInputChange.bind(this, 'appId', false),
      appPassword: this.onEndpointInputChange.bind(this, 'appPassword', false)
    };

    this.botServiceInputHandlers = {
      tenantId: this.onBotInputChange.bind(this, 'tenantId'),
      subscriptionId: this.onBotInputChange.bind(this, 'subscriptionId'),
      resourceGroup: this.onBotInputChange.bind(this, 'resourceGroup'),
      serviceName: this.onBotInputChange.bind(this, 'serviceName')
    };
  }

  public render(): JSX.Element {
    const {
      appIdError,
      appPasswordError,
      endpointError,
      endpointService,
      endpointWarning,
      nameError,
      botService = {} as IBotService
    } = this.state;
    const { name = '', endpoint = '', appId = '', appPassword = '' } = endpointService;
    const { tenantId = '', subscriptionId = '', resourceGroup = '', serviceName = '' } = botService;
    const valid = !!endpoint && !!name;
    return (
      <Dialog title={ title } detailedDescription={ detailedDescription }
              cancel={ this.onCancelClick }>
        <TextField
          placeholder="https://"
          errorMessage={ endpointError } value={ endpoint }
          onChanged={ this.endpointServiceInputHandlers.endpoint }
          label="Endpoint url" required={ true }
        />
        { !endpointError && endpointWarning && <span className={ styles.endpointWarning }>{ endpointWarning }</span> }
        <TextField
          placeholder="Create name for your endpoint"
          errorMessage={ nameError } value={ name }
          onChanged={ this.endpointServiceInputHandlers.name } label="Name"
          required={ true }
        />
        <TextField
          placeholder="Optional"
          errorMessage={ appIdError } value={ appId }
          onChanged={ this.endpointServiceInputHandlers.appId }
          label="Application Id"
          required={ false }
        />
        <TextField
          placeholder="Optional. For Microsoft Apps"
          errorMessage={ appPasswordError } value={ appPassword }
          onChanged={ this.endpointServiceInputHandlers.appPassword }
          label="Application Password" required={ false }
        />
        <a href="javascript:void(0)"
           className={ styles.arrow } onClick={ this.onABSLinkClick }>
          Azure Bot Service configuration
        </a>
        <div className={ styles.absContent } ref={ this.absContentRef }>
          <div>
            <Row className={ styles.absTextFieldRow }>
              <TextField
                onChanged={ this.botServiceInputHandlers.serviceName }
                value={ serviceName }
                label="Azure BotId"/>
              <TextField
                onChanged={ this.botServiceInputHandlers.tenantId }
                value={ tenantId }
                label="Azure Directory ID"/>
            </Row>
            <Row className={ styles.absTextFieldRow }>
              <TextField
                onChanged={ this.botServiceInputHandlers.subscriptionId }
                value={ subscriptionId }
                label="Azure Subscription ID"/>
              <TextField
                onChanged={ this.botServiceInputHandlers.resourceGroup }
                value={ resourceGroup }
                label="Azure Resource Group"/>
            </Row>
          </div>
        </div>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.onCancelClick }/>
          <PrimaryButton disabled={ !this.isDirty || !valid } text="Submit" onClick={ this.onSubmitClick }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private get isDirty(): boolean {
    const { endpointService: originalEndpointService, botService: originalBotService = {} } = this.props;
    const { endpointService, botService = {} } = this.state;

    return JSON.stringify(originalEndpointService) !== JSON.stringify(endpointService) ||
      JSON.stringify(originalBotService) !== JSON.stringify(botService);
  }

  private onCancelClick = (): void => {
    this.props.cancel();
  }

  private onSubmitClick = (): void => {
    const { endpointService, botService } = this.state;
    const servicesToUpdate: UpdatedServicesPayload = [endpointService];
    if (botService) {
      botService.appId = endpointService.appId;
      servicesToUpdate[1] = botService;
    }
    this.props.updateEndpointService(servicesToUpdate);
  }

  private onEndpointInputChange = (propName: string, required: boolean, value: string): void => {
    const trimmedValue = value.trim();
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';
    const { endpointService } = this.state;
    endpointService[propName] = value;
    this.setState({ endpointService, [`${propName}Error`]: errorMessage } as any);

    if (propName === 'endpoint') {
      clearTimeout(this.endpointWarningDelay);
      this.endpointWarningDelay = setTimeout(() =>
        this.setState({ endpointWarning: EndpointEditor.validateEndpoint(value) }), 500);
    }
  }

  private onBotInputChange = (propName: string, value: string): void => {
    const trimmedValue = value.trim();
    let { botService } = this.state;
    if (!botService) {
      botService = new BotService();
    }
    botService[propName] = trimmedValue;
    this.setState({ botService });
  }

  private onABSLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Process this outside the react state
    const { currentTarget } = event;
    currentTarget.classList.toggle(styles.arrowExpanded);
    const expanded = currentTarget.classList.contains(styles.arrowExpanded);
    const { clientHeight } = this.absContent.firstChild as HTMLElement;
    const newHeight = expanded ? clientHeight : 0;
    this.absContent.style.height = `${newHeight}px`;
  }

  private absContentRef = (ref: HTMLDivElement): void => {
    this.absContent = ref;
  }
}
