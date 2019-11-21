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
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  LinkButton,
  PrimaryButton,
  Row,
  RowAlignment,
  TextField,
} from '@bfemulator/ui-react';
import { BotService, EndpointService } from 'botframework-config/lib/models';
import { IBotService, IEndpointService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { ChangeEvent, Component, MouseEvent } from 'react';

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
  onAnchorClick: (url: string) => void;
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

const title = 'Add an Endpoint for your bot';
const detailedDescription = 'You can add an endpoint that you use to communicate to an instance of your bot';
const usGovernmentAzureChannelService = 'https://botframework.azure.us';

export class EndpointEditor extends Component<EndpointEditorProps, EndpointEditorState> {
  public state: EndpointEditorState = {} as EndpointEditorState;
  private endpointWarningDelay: any;
  private absContent: HTMLDivElement;

  private static validateEndpoint(endpoint: string): string {
    const controllerRegEx = /api\/messages\/?$/;
    return controllerRegEx.test(endpoint) ? '' : `Please include route if necessary: "/api/messages"`;
  }

  private static isUsGov(channelService: string): boolean {
    return channelService === usGovernmentAzureChannelService;
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
  }

  public render(): JSX.Element {
    const {
      appIdError,
      appPasswordError,
      endpointError,
      endpointService,
      endpointWarning,
      nameError,
      botService = {} as IBotService,
    } = this.state;
    const { name = '', endpoint = '', appId = '', appPassword = '' } = endpointService;
    const { tenantId = '', subscriptionId = '', resourceGroup = '', serviceName = '' } = botService;
    const hasBotService = !!(tenantId || subscriptionId || resourceGroup || serviceName);
    const valid = !!endpoint && !!name;
    const isUsGov = EndpointEditor.isUsGov((endpointService as any).channelService);
    return (
      <Dialog title={title} detailedDescription={detailedDescription} cancel={this.onCancelClick}>
        <TextField
          placeholder="https://"
          errorMessage={endpointError}
          value={endpoint}
          data-prop="endpoint"
          onChange={this.onEndpointInputChange}
          label="Endpoint url"
          required={true}
        />
        {!endpointError && endpointWarning && <span className={styles.endpointWarning}>{endpointWarning}</span>}
        <TextField
          placeholder="Create name for your endpoint"
          errorMessage={nameError}
          value={name}
          data-prop="name"
          onChange={this.onEndpointInputChange}
          label="Name"
          required={true}
        />
        <TextField
          placeholder="Optional"
          errorMessage={appIdError}
          value={appId}
          data-prop="appId"
          onChange={this.onEndpointInputChange}
          label="Application Id"
          required={false}
        />
        <TextField
          placeholder="Optional. For Microsoft Apps"
          errorMessage={appPasswordError}
          value={appPassword}
          data-prop="appPassword"
          onChange={this.onEndpointInputChange}
          label="Application Password"
          required={false}
        />
        <Row align={RowAlignment.Center}>
          <Checkbox label="Azure for US Government" checked={isUsGov} onChange={this.onChannelServiceChange} />
          &nbsp;
          <LinkButton
            ariaLabel="Learn more about Azure for US Government"
            className={styles.endpointLink}
            linkRole={true}
            onClick={this.onAzureGovDocClick}
          >
            Learn more.
          </LinkButton>
        </Row>
        <button
          className={`${styles.absContentToggle} ${hasBotService ? styles.arrowExpanded : ''}`}
          onClick={this.onABSLinkClick}
          aria-controls="abs-config-content"
          aria-expanded={hasBotService}
        >
          Azure Bot Service configuration
          <span role="presentation"></span>
        </button>
        <div
          id="abs-config-content"
          className={styles.absContent}
          ref={this.absContentRef}
          role="region"
          aria-hidden={true}
        >
          <div>
            <Row className={styles.absTextFieldRow}>
              <TextField
                onChange={this.onBotInputChange}
                data-prop="serviceName"
                value={serviceName}
                label="Azure BotId"
                tabIndex={-1}
              />
              <TextField
                onChange={this.onBotInputChange}
                data-prop="tenantId"
                value={tenantId}
                label="Azure Directory ID"
                tabIndex={-1}
              />
            </Row>
            <Row className={styles.absTextFieldRow}>
              <TextField
                onChange={this.onBotInputChange}
                value={subscriptionId}
                data-prop="subscriptionId"
                label="Azure Subscription ID"
                tabIndex={-1}
              />
              <TextField
                data-prop="resourceGroup"
                onChange={this.onBotInputChange}
                value={resourceGroup}
                label="Azure Resource Group"
                tabIndex={-1}
              />
            </Row>
          </div>
        </div>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.onCancelClick} />
          <PrimaryButton disabled={!this.isDirty || !valid} text="Save" onClick={this.onSaveClick} />
        </DialogFooter>
      </Dialog>
    );
  }

  private get isDirty(): boolean {
    const { endpointService: originalEndpointService, botService: originalBotService = {} } = this.props;
    const { endpointService, botService = {} } = this.state;

    return (
      JSON.stringify(originalEndpointService) !== JSON.stringify(endpointService) ||
      JSON.stringify(originalBotService) !== JSON.stringify(botService)
    );
  }

  private onAzureGovDocClick = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-azuregov');
  };

  private onCancelClick = (): void => {
    this.props.cancel();
  };

  private onSaveClick = (): void => {
    const { endpointService, botService } = this.state;
    const servicesToUpdate: UpdatedServicesPayload = [endpointService];
    if (botService) {
      botService.appId = endpointService.appId;
      servicesToUpdate[1] = botService;
    }
    this.props.updateEndpointService(servicesToUpdate);
  };

  private onEndpointInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    const required = !!event.target.hasAttribute('required');
    const { prop } = event.target.dataset;

    const trimmedValue = value.trim();
    const errorMessage = required && !trimmedValue ? `The field cannot be empty` : '';
    const { endpointService } = this.state;
    endpointService[prop] = value;
    this.setState({ endpointService, [`${prop}Error`]: errorMessage } as any);

    if (prop === 'endpoint') {
      clearTimeout(this.endpointWarningDelay);
      this.endpointWarningDelay = setTimeout(
        () =>
          this.setState({
            endpointWarning: EndpointEditor.validateEndpoint(value),
          }),
        500
      );
    }
  };

  private onChannelServiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const { endpointService } = this.state;
    (endpointService as any).channelService = checked ? usGovernmentAzureChannelService : '';
    this.setState({ endpointService } as any);
  };

  private onBotInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    const { prop } = event.target.dataset;
    const trimmedValue = value.trim();
    let { botService } = this.state;
    if (!botService) {
      botService = new BotService();
    }
    botService[prop] = trimmedValue;
    this.setState({ botService });
  };

  private onABSLinkClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Process this outside the react state
    const { currentTarget } = event;
    currentTarget.classList.toggle(styles.arrowExpanded);
    const expanded = currentTarget.classList.contains(styles.arrowExpanded);
    const { clientHeight } = this.absContent.firstElementChild as HTMLElement;
    const newHeight = expanded ? clientHeight : 0;
    this.absContent.style.height = `${newHeight}px`;
    currentTarget.setAttribute('aria-expanded', expanded + '');
    this.absContent.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    this.absContent.querySelectorAll('input').forEach((node: HTMLElement) => {
      if (node.hasAttribute('tabIndex')) {
        node.setAttribute('tabIndex', expanded ? '0' : '-1');
      }
    });
  };

  private absContentRef = (ref: HTMLDivElement): void => {
    this.absContent = ref;
    if (!ref) {
      return;
    }
    const { tenantId = '', subscriptionId = '', resourceGroup = '', serviceName = '' } = this.props.botService || {};
    const hasBotService = tenantId || subscriptionId || resourceGroup || serviceName;
    ref.style.height = hasBotService ? `${ref.firstElementChild.clientHeight}px` : '0';
  };
}
