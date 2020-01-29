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

import { DefaultButton, Dialog, DialogFooter, LinkButton, PrimaryButton, TextField } from '@bfemulator/ui-react';
import { BotConfigurationBase } from 'botframework-config/lib/botConfigurationBase';
import { ConnectedService } from 'botframework-config/lib/models';
import { IConnectedService, IGenericService, ServiceTypes, IQnAService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { ChangeEvent, Component, ReactNode } from 'react';

import { serviceTypeLabels } from '../../../../../utils/serviceTypeLables';
import { QnAMakerSampleHostname } from '../../../../../constants';

import * as styles from './connectedServiceEditor.scss';
import { KvPair } from './kvPair';

interface ConnectedServiceEditorProps {
  connectedService: IConnectedService;
  cancel: () => void;
  updateConnectedService: (updatedLuisService: IConnectedService) => void;
  onAnchorClick: (url: string) => void;
  serviceType?: ServiceTypes;
}

interface ConnectedServiceEditorState extends Partial<any> {
  connectedServiceCopy: ConnectedService;
}

const labelMap = {
  authoringKey: 'Authoring key',
  appId: 'LUIS app ID',
  applicationId: 'App Insights Application ID',
  collection: 'Cosmos DB collection name',
  connectionString: 'Blob storage connection string',
  container: 'Blob container name',
  database: 'Cosmos DB collection database',
  endpoint: 'Cosmos DB connection string',
  endpointKey: 'Endpoint key',
  hostname: 'Host Name',
  id: 'App ID',
  instrumentationKey: 'App Insights Instrumentation Key',
  kbId: 'Knowledge base ID',
  name: 'Service Name',
  region: 'Region',
  resourceGroup: 'Azure Resource group',
  serviceName: 'Azure Service Name',
  subscriptionId: 'Azure Subscription ID',
  subscriptionKey: 'Azure Subscription key',
  tenantId: 'Azure Tenant ID',
  url: 'Service URL',
  version: 'Version',
  ...serviceTypeLabels,
};

const titleMap = {
  [ServiceTypes.Luis]: 'Connect to a LUIS app',
  [ServiceTypes.Dispatch]: 'Connect to a Dispatch model',
  [ServiceTypes.QnA]: 'Connect to a QnA Maker knowledge base',
  [ServiceTypes.AppInsights]: 'Connect to Application Insights resource',
  [ServiceTypes.BlobStorage]: 'Connect to an Azure Storage account',
  [ServiceTypes.CosmosDB]: 'Connect to an Azure Cosmos DB account',
  [ServiceTypes.Generic]: 'Connect to a generic service',
};

const portalMap = {
  [ServiceTypes.Luis]: 'LUIS.ai',
  [ServiceTypes.Dispatch]: 'LUIS.ai',
  [ServiceTypes.QnA]: 'QnaMaker.ai',
};

export class ConnectedServiceEditor extends Component<ConnectedServiceEditorProps, ConnectedServiceEditorState> {
  constructor(props: ConnectedServiceEditorProps, state: ConnectedServiceEditorState) {
    super(props, state);
    const connectedService = props.connectedService || {
      type: props.serviceType,
      name: '',
    };
    // if qnamaker, initialize with sample hostname so that botframework-config doesn't throw
    if (props.serviceType === ServiceTypes.QnA) {
      (connectedService as IQnAService).hostname = (connectedService as IQnAService).hostname || QnAMakerSampleHostname;
    }
    this.state = {
      connectedServiceCopy: BotConfigurationBase.serviceFromJSON(connectedService),
    };
  }

  public render(): JSX.Element {
    const { state, onInputChange, props, onSaveClick } = this;
    const { connectedServiceCopy } = state;
    const { type } = connectedServiceCopy;
    const fields = this.editableFields;
    const textInputs: JSX.Element[] = [];
    const isDirty = JSON.stringify(connectedServiceCopy) !== JSON.stringify(this.props.connectedService);
    let valid = true;
    // Build the editable inputs from the enumerable properties
    // in the data model. This assumes all enumerable fields are editable
    // except the type
    fields.forEach((prop, index) => {
      const isRequired = this.isRequired(prop);
      valid = valid && (!isRequired || !!connectedServiceCopy[prop]);
      textInputs.push(
        <TextField
          key={`input_${index}`}
          errorMessage={state[`${prop}Error`] || ''}
          value={connectedServiceCopy[prop] || ''}
          data-prop={prop}
          onChange={onInputChange}
          label={labelMap[prop]}
          required={isRequired}
        />
      );
    });

    return (
      <Dialog title={titleMap[type]} cancel={props.cancel} className={styles.connectedServiceEditor}>
        {this.headerContent}
        {textInputs}
        {this.supplementalContent}
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={props.cancel} />
          <PrimaryButton disabled={!isDirty || !valid} text="Save" onClick={onSaveClick} />
        </DialogFooter>
      </Dialog>
    );
  }

  private get editableFields(): string[] {
    const { serviceType } = this.props;
    switch (serviceType) {
      case ServiceTypes.Luis:
      // Falls through

      case ServiceTypes.Dispatch:
        return ['name', 'appId', 'authoringKey', 'version', 'region', 'subscriptionKey'];

      case ServiceTypes.QnA:
        return ['name', 'kbId', 'hostname', 'subscriptionKey', 'endpointKey'];

      case ServiceTypes.AppInsights:
        return [
          'name',
          'tenantId',
          'subscriptionId',
          'resourceGroup',
          'serviceName',
          'instrumentationKey',
          'applicationId',
        ];

      case ServiceTypes.BlobStorage:
        return ['name', 'tenantId', 'subscriptionId', 'resourceGroup', 'serviceName', 'connectionString', 'container'];

      case ServiceTypes.CosmosDB:
        return [
          'name',
          'tenantId',
          'subscriptionId',
          'resourceGroup',
          'serviceName',
          'endpoint',
          'database',
          'collection',
        ];

      case ServiceTypes.Generic:
        return ['name', 'url'];

      default:
        throw new TypeError(`${serviceType} is not a valid service type`);
    }
  }

  private get headerContent(): ReactNode {
    switch (this.props.serviceType) {
      case ServiceTypes.Luis:
      // Falls through

      case ServiceTypes.Dispatch:
        return this.luisAndDispatchHeader;

      case ServiceTypes.QnA:
        return this.qnaHeader;

      case ServiceTypes.AppInsights:
      // Falls through

      case ServiceTypes.BlobStorage:
        return this.appInsightsAndBlobStorageHeader;

      case ServiceTypes.CosmosDB:
        return this.cosmosDbHeader;

      case ServiceTypes.Generic:
        return this.genericHeader;

      default:
        return null;
    }
  }

  private get supplementalContent(): ReactNode {
    if (this.props.serviceType === ServiceTypes.Generic) {
      return <KvPair onChange={this.onKvPairChange} />;
    }

    return null;
  }

  private get luisAndDispatchHeader(): ReactNode {
    const { serviceType } = this.props;
    return (
      <p role="presentation">
        {`You can find your LUIS app ID and subscription key in ${portalMap[serviceType]}. `}
        {this.learnMoreLinkButton}
      </p>
    );
  }

  private get qnaHeader(): ReactNode {
    const { serviceType } = this.props;

    return (
      <p role="presentation">
        {`You can find your knowledge base ID and subscription key in ${portalMap[serviceType]}. `}
        {this.learnMoreLinkButton}
      </p>
    );
  }

  private get appInsightsAndBlobStorageHeader(): ReactNode {
    return (
      <p role="presentation">
        {`You can find your knowledge base ID and subscription key in the `}
        <LinkButton className={styles.link} linkRole={true} onClick={this.onAzurePortalClick}>
          Azure Portal.
        </LinkButton>
        <br />
        {this.learnMoreLinkButton}
      </p>
    );
  }

  private get cosmosDbHeader(): ReactNode {
    return (
      <p role="presentation">
        {`You can find the information below in the `}
        <LinkButton className={styles.link} linkRole={true} onClick={this.onAzurePortalClick}>
          Azure Portal.
        </LinkButton>
        <br />
        {this.learnMoreLinkButton}
      </p>
    );
  }

  private get genericHeader(): ReactNode {
    return <p>You can connect your bot to a generic service with key-value pairs.</p>;
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private isRequired = (key: string): boolean => {
    if (key === 'applicationId') {
      return false;
    }

    if (key !== 'subscriptionKey') {
      return true;
    }

    switch (this.state.connectedServiceCopy.type) {
      case ServiceTypes.Dispatch:
      // Falls through

      case ServiceTypes.Luis:
        return false;

      default:
        return true;
    }
  };

  private get learnMoreLinkButton(): ReactNode {
    const { serviceType } = this.props;

    switch (serviceType) {
      case ServiceTypes.Luis: {
        const luisString = 'Learn more about keys in ' + labelMap[serviceType].toString();
        return (
          <LinkButton
            ariaLabel="Learn more about keys"
            className={styles.link}
            linkRole={true}
            onClick={this.createAnchorClickHandler('http://aka.ms/bot-framework-emulator-LUIS-docs-home')}
          >
            {luisString}
          </LinkButton>
        );
      }

      case ServiceTypes.QnA: {
        const qnaString = 'Learn more about keys in ' + labelMap[serviceType].toString();
        return (
          <LinkButton
            ariaLabel="Learn more about keys"
            className={styles.link}
            linkRole={true}
            onClick={this.createAnchorClickHandler('http://aka.ms/bot-framework-emulator-qna-keys')}
          >
            {qnaString}
          </LinkButton>
        );
      }

      case ServiceTypes.Dispatch: {
        const dispatchString = 'Learn more about keys in ' + labelMap[serviceType].toString();
        return (
          <LinkButton
            ariaLabel="Learn more about keys"
            className={styles.link}
            linkRole={true}
            onClick={this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-create-dispatch')}
          >
            {dispatchString}
          </LinkButton>
        );
      }

      case ServiceTypes.AppInsights: {
        const appInsightsString = 'Learn more about ' + labelMap[serviceType].toString() + ' keys.';
        return (
          <LinkButton
            ariaLabel="Learn more about keys"
            className={styles.link}
            linkRole={true}
            onClick={this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-appinsights-keys')}
          >
            {appInsightsString}
          </LinkButton>
        );
      }

      case ServiceTypes.BlobStorage: {
        const blobStorageString = 'Learn more about ' + labelMap[serviceType].toString() + ' keys.';

        return (
          <LinkButton
            ariaLabel="Learn more about keys"
            className={styles.link}
            linkRole={true}
            onClick={this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-storage-keys')}
          >
            {blobStorageString}
          </LinkButton>
        );
      }

      case ServiceTypes.CosmosDB: {
        const cosmosDBString = 'Learn more about ' + labelMap[serviceType].toString() + ' keys.';
        return (
          <LinkButton
            ariaLabel="Learn more about keys"
            className={styles.link}
            linkRole={true}
            onClick={this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-cosmosdb-keys')}
          >
            {cosmosDBString}
          </LinkButton>
        );
      }
      default:
        return '';
    }
  }

  private onAzurePortalClick = this.createAnchorClickHandler('https://portal.azure.com');

  private onSaveClick = (): void => {
    this.props.updateConnectedService(this.state.connectedServiceCopy);
  };

  private onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    const { prop } = event.target.dataset;

    const trimmedValue = value.trim();
    const errorMessage = this.isRequired(prop) && !trimmedValue ? `The field cannot be empty` : '';
    const { connectedServiceCopy } = this.state;
    connectedServiceCopy[prop] = value;

    this.setState({
      connectedServiceCopy,
      [`${prop}Error`]: errorMessage,
    } as any);
  };

  private onKvPairChange = (configuration: { [propName: string]: string }): void => {
    const { connectedServiceCopy } = this.state;
    (connectedServiceCopy as Partial<IGenericService>).configuration = configuration;
    this.setState({ connectedServiceCopy });
  };
}
