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
import { DefaultButton, Dialog, DialogFooter, LinkButton, PrimaryButton } from '@bfemulator/ui-react';
import { ServiceTypes } from 'botframework-config/lib/schema';
import * as React from 'react';
import { Component, ReactNode } from 'react';

import * as styles from '../dialogStyles.scss';

export interface ConnectServicePromptDialogProps {
  cancel: () => void;
  confirm: () => void;
  addServiceManually: () => void;
  onAnchorClick: (url: string) => void;
  serviceType?: ServiceTypes;
}

const titleMap = {
  [ServiceTypes.Luis]: 'Connect your bot to a LUIS application',
  [ServiceTypes.Dispatch]: 'Connect your bot to a Dispatch model',
  [ServiceTypes.QnA]: 'Connect your bot to a QnA Maker knowledge base',
  [ServiceTypes.AppInsights]: 'Connect to an Azure Application Insights resource',
  [ServiceTypes.BlobStorage]: 'Connect your bot to an Azure Storage account',
  [ServiceTypes.CosmosDB]: 'Connect your bot to an Azure Cosmos DB account',
};

export class ConnectServicePromptDialog extends Component<ConnectServicePromptDialogProps, {}> {
  public render() {
    return (
      <Dialog className={styles.dialogMedium} cancel={this.props.cancel} title={titleMap[this.props.serviceType]}>
        {this.dialogContent}
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.props.cancel} />
          <PrimaryButton text="Sign in with Azure" onClick={this.props.confirm} />
        </DialogFooter>
      </Dialog>
    );
  }

  private get dialogContent(): ReactNode {
    const { serviceType } = this.props;
    switch (serviceType) {
      case ServiceTypes.Luis:
        return this.luisContent;

      case ServiceTypes.QnA:
        return this.qnaContent;

      case ServiceTypes.Dispatch:
        return this.dispatchContent;

      case ServiceTypes.AppInsights:
        return this.appInsightsContent;

      case ServiceTypes.BlobStorage:
        return this.blobStorageContent;

      case ServiceTypes.CosmosDB:
        return this.cosmosDbContent;

      default:
        throw new TypeError(`${serviceType} is not a known service type`);
    }
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onAppInsightsClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-appinsights-docs');

  private onAzureCosmosDbDocsClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-cosmosdb-docs'
  );

  private onAzureStorageDocsClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-storage-docs');

  private onDispatchDocsClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-create-dispatch');

  private onLuisDocsClick = this.createAnchorClickHandler('http://aka.ms/bot-framework-emulator-LUIS-docs-home');

  private onQnADocsClick = this.createAnchorClickHandler('http://aka.ms/bot-framework-emulator-qna-docs-home');

  private get luisContent(): ReactNode {
    return (
      <>
        <p role="presentation">
          {`Sign in to your Azure account to select the LUIS applications you'd like to associate with this bot. `}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onLuisDocsClick}>
            Learn more about LUIS.
          </LinkButton>
        </p>
        <p role="presentation">
          {`Alternatively, you can `}
          <LinkButton className={styles.dialogLink} onClick={this.props.addServiceManually}>
            add a LUIS app manually
          </LinkButton>
          {` with the app ID, version, and authoring key.`}
        </p>
      </>
    );
  }

  private get qnaContent(): JSX.Element {
    return (
      <>
        <p role="presentation">
          {'Sign in to your Azure account to select the QnA ' +
            "Maker knowledge bases you'd like to associate with this bot. "}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onQnADocsClick}>
            Learn more about QnA Maker.
          </LinkButton>
        </p>
        <p role="presentation">
          {`Alternatively, you can `}{' '}
          <LinkButton className={styles.dialogLink} onClick={this.props.addServiceManually}>
            connect to a QnA Maker knowledge base manually
          </LinkButton>
          {' with the app ID, version, and authoring key.'}
        </p>
      </>
    );
  }

  private get dispatchContent(): JSX.Element {
    return (
      <>
        <p role="presentation">
          {`Sign in to your Azure account to select the Dispatch model you'd like to associate with this bot. `}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onDispatchDocsClick}>
            Learn more about Dispatch models.
          </LinkButton>
        </p>
        <p role="presentation">
          {`Alternatively, you can `}
          <LinkButton className={styles.dialogLink} onClick={this.props.addServiceManually}>
            connect to a Dispatch model manually
          </LinkButton>
          {` with the app ID, version, and authoring key.`}
        </p>
      </>
    );
  }

  private get appInsightsContent(): JSX.Element {
    return (
      <>
        <p role="presentation">
          {'Sign in to your Azure account to select the Azure Application ' +
            "Insights you'd like to associate with this bot. "}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onAppInsightsClick}>
            Learn more about Azure Application Insights.
          </LinkButton>
        </p>
        <p role="presentation">
          {`Alternatively, you can `}
          <LinkButton className={styles.dialogLink} onClick={this.props.addServiceManually}>
            connect to a Azure Application Insights manually
          </LinkButton>
          {` with the app ID, version, and authoring key.`}
        </p>
      </>
    );
  }

  private get blobStorageContent(): ReactNode {
    return (
      <>
        <p role="presentation">
          {'Sign in to your Azure account to select the Azure Storage ' +
            "accounts you'd like to associate with this bot. "}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onAzureStorageDocsClick}>
            Learn more about Azure Storage.
          </LinkButton>
        </p>
        <p role="presentation">
          {`Alternatively, you can `}
          <LinkButton className={styles.dialogLink} onClick={this.props.addServiceManually}>
            connect to a Azure Storage account manually.
          </LinkButton>
        </p>
      </>
    );
  }

  private get cosmosDbContent(): ReactNode {
    return (
      <>
        <p role="presentation">
          {'Sign in to your Azure account to select the Azure Cosmos DB ' +
            "accounts you'd like to associate with this bot. "}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onAzureCosmosDbDocsClick}>
            Learn more about Azure Cosmos DB.
          </LinkButton>
        </p>
        <p role="presentation">
          {`Alternatively, you can `}
          <LinkButton className={styles.dialogLink} onClick={this.props.addServiceManually}>
            connect to a Azure Cosmos DB account manually.
          </LinkButton>
        </p>
      </>
    );
  }
}
