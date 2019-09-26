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

import { serviceTypeLabels } from '../../../utils/serviceTypeLables';
import * as styles from '../dialogStyles.scss';

export interface GetStartedWithCSDialogProps {
  cancel: () => void;
  confirm: () => void;
  launchConnectedServiceEditor: () => void;
  onAnchorClick: (url: string) => void;
  authenticatedUser?: string;
  serviceType?: ServiceTypes;
  showNoModelsFoundContent?: boolean;
}

const titleMap = {
  [ServiceTypes.Luis]: 'Create a LUIS app',
  [ServiceTypes.Dispatch]: 'Connect to a Dispatch model',
  [ServiceTypes.QnA]: 'Create a QnA Maker knowledge base',
  [ServiceTypes.BlobStorage]: 'Create a Blob Storage Container',
};

const buttonTextMap = {
  [ServiceTypes.Luis]: 'LUIS',
  [ServiceTypes.Dispatch]: 'Dispatch',
  [ServiceTypes.QnA]: 'QnA Maker',
  [ServiceTypes.BlobStorage]: 'Blob Storage',
};

export class GetStartedWithCSDialog extends Component<GetStartedWithCSDialogProps, {}> {
  public render() {
    return (
      <Dialog className={styles.dialogMedium} cancel={this.props.cancel} title={titleMap[this.props.serviceType]}>
        {this.content}
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.props.cancel} />
          <PrimaryButton text={`Go to ${buttonTextMap[this.props.serviceType]}`} onClick={this.props.confirm} />
        </DialogFooter>
      </Dialog>
    );
  }

  private get content(): ReactNode {
    const { serviceType } = this.props;

    switch (serviceType) {
      case ServiceTypes.Luis:
        return this.luisContent;

      case ServiceTypes.Dispatch:
        return this.dispatchContent;

      case ServiceTypes.QnA:
        return this.qnaContent;

      case ServiceTypes.BlobStorage:
        return this.blobContent;

      case ServiceTypes.CosmosDB:
        return this.cosmosDbContent;

      default:
        return null;
    }
  }

  private get luisContent(): ReactNode {
    if (this.props.showNoModelsFoundContent) {
      return this.luisNoModelsFoundContent;
    }
    return (
      <>
        <p>
          {'Language Understanding Service (LUIS) is a matching learning-based service for adding language ' +
            'understanding to bots, applications and IoT devices.'}
        </p>
        <p>
          {`You have not signed up for a LUIS account under ${this.props.authenticatedUser} `}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onLUISDocsClick}>
            Learn more about LUIS
          </LinkButton>
        </p>
        <p>
          {'Alternatively, you can '}
          <LinkButton className={styles.dialogLink} onClick={this.props.launchConnectedServiceEditor}>
            connect to a LUIS app manually
          </LinkButton>
          {' if you know the app ID, version, and authoring key.'}
        </p>
      </>
    );
  }

  private get luisNoModelsFoundContent(): ReactNode {
    const label = serviceTypeLabels[this.props.serviceType];
    const connectModalManuallyText = `Connect to a ${label} model manually`;
    const learnMoreAbtModelsText = `Learn more about ${label} models`;
    return (
      <>
        <p>Signed in as {this.props.authenticatedUser}.</p>
        <p>
          {`You do not have any ${label} models associated with this account. `}
          <LinkButton
            ariaLabel={connectModalManuallyText}
            className={styles.dialogLink}
            onClick={this.props.launchConnectedServiceEditor}
          >
            {connectModalManuallyText}
          </LinkButton>{' '}
          by entering the app ID and key.
        </p>
        <p>
          <LinkButton
            ariaLabel={learnMoreAbtModelsText}
            className={styles.dialogLink}
            linkRole={true}
            onClick={this.onLUISInfoClick}
          >
            {learnMoreAbtModelsText}
          </LinkButton>
          <br />
        </p>
        <p>
          {`You can link apps from a different ${label} account to this Azure account by adding ` +
            'yourself as a collaborator. '}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onLUISCollabDocsClick}>
            Learn more about collaborating
          </LinkButton>
        </p>
      </>
    );
  }

  private get dispatchContent(): ReactNode {
    if (this.props.showNoModelsFoundContent) {
      return this.dispatchNoModelsFoundContent;
    }

    return (
      <>
        <p>
          {'A Dispatch model is a LUIS model that enables your bot to dispatch intents across multiple LUIS ' +
            'apps and QnAMaker knowledge bases. '}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onDispatchLinkClick}>
            Learn more about Dispatch models
          </LinkButton>
        </p>
        <p>
          {`You have not signed up for a LUIS account under ${this.props.authenticatedUser} `}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onLUISDocsClick}>
            Learn more about LUIS
          </LinkButton>
        </p>
        <br />
        {'Alternatively, you can '}
        <LinkButton className={styles.dialogLink} onClick={this.props.launchConnectedServiceEditor}>
          connect to a Dispatch app manually
        </LinkButton>
        {' if you know the app ID, version, and authoring key.'}
      </>
    );
  }

  private get dispatchNoModelsFoundContent(): ReactNode {
    return (
      <>
        <p>Signed in as {this.props.authenticatedUser}.</p>
        <p>
          {'You do not have any Dispatch models associated with this account. '}
          <LinkButton className={styles.dialogLink} onClick={this.props.launchConnectedServiceEditor}>
            Connect to a Dispatch model manually
          </LinkButton>
          {' by entering this app ID and key.'}
        </p>
        <p>
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onDispatchLinkClick}>
            Learn more about Dispatch models
          </LinkButton>
        </p>
        <p>
          {'You can link apps from a different Dispatch account to this Azure account by adding ' +
            'yourself as a collaborator. '}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onLUISCollabDocsClick}>
            Learn more about collaborating
          </LinkButton>
        </p>
      </>
    );
  }

  private get qnaContent(): ReactNode {
    return (
      <>
        <p>
          {'QnA Maker is a service that creates a question-and-answer knowledge base from FAQs and product manuals.'}
        </p>
        <p>
          {`You have not signed up for a QnA Maker account under ${this.props.authenticatedUser}. `}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onQnADocsClick}>
            Get started with QnA Maker
          </LinkButton>
        </p>
        <p>
          {' Alternatively, you can '}
          <LinkButton className={styles.dialogLink} onClick={this.props.launchConnectedServiceEditor}>
            connect to a knowledge base manually
          </LinkButton>
          {' if you know the ID and subscription key.'}
        </p>
      </>
    );
  }

  private get blobContent(): ReactNode {
    return (
      <>
        <p>
          {'Blob Storage is a service that allows you to store unstructured ' +
            "data and is commonly used to store a Bot's transcripts."}
        </p>
        <p>
          {`You have do not have a Blob container under ${this.props.authenticatedUser}. `}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onBlobStorageDocsClick}>
            Get started with Blob Storage
          </LinkButton>
        </p>
        <p>
          {' Alternatively, you can '}
          <LinkButton className={styles.dialogLink} onClick={this.props.launchConnectedServiceEditor}>
            connect to a Blob container manually
          </LinkButton>
          {' if you know the ID, subscription key, container name and connection string.'}
        </p>
      </>
    );
  }

  private get cosmosDbContent(): ReactNode {
    return (
      <>
        <p>{"CosmosDB is a multi-model database service commonly used to store a bot's state."}</p>
        <p>
          {`You have do not have any CosmosDB collections under ${this.props.authenticatedUser}. `}
          <LinkButton className={styles.dialogLink} linkRole={true} onClick={this.onCosmosdbDocsClick}>
            Get started with CosmosDB
          </LinkButton>
        </p>
        <p>
          {' Alternatively, you can '}
          <LinkButton className={styles.dialogLink} onClick={this.props.launchConnectedServiceEditor}>
            connect to a CosmosDB collection manually
          </LinkButton>
          {' if you know the ID, subscription key, collection and database name.'}
        </p>
      </>
    );
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onBlobStorageDocsClick = this.createAnchorClickHandler(
    'https://azure.microsoft.com/en-us/services/storage/blobs/'
  );

  private onCosmosdbDocsClick = this.createAnchorClickHandler('https://azure.microsoft.com/en-us/services/cosmos-db/');

  private onDispatchLinkClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-create-dispatch');

  private onLUISDocsClick = this.createAnchorClickHandler('http://aka.ms/bot-framework-emulator-LUIS-docs-home');

  private onLUISCollabDocsClick = this.createAnchorClickHandler(
    'http://aka.ms/bot-framework-emulator-luis-collaboration'
  );

  private onLUISInfoClick = this.createAnchorClickHandler(
    'https://docs.microsoft.com/en-us/azure/cognitive-services/luis/what-is-luis'
  );

  private onQnADocsClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-qna-docs-home');
}
