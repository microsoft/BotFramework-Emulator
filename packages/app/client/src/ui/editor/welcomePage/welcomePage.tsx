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

import { Column, LargeHeader, LinkButton, PrimaryButton, Row, SmallHeader } from '@bfemulator/ui-react';
import * as React from 'react';
import { BotInfo } from '@bfemulator/app-shared';

import { GenericDocument } from '../../layout';
import { RecentBotsListContainer } from '../recentBotsList/recentBotsListContainer';

import { HowToBuildABotContainer } from './howToBuildABotContainer';
import * as styles from './welcomePage.scss';

export interface WelcomePageProps {
  accessToken?: string;
  onNewBotClick?: () => void;
  showOpenBotDialog: () => void;
  sendNotification?: (error: Error) => void;
  signInWithAzure?: () => void;
  signOutWithAzure?: () => void;
  switchToBot?: (path: string) => void;
  onAnchorClick: (url: string) => void;
  openBotInspectorDocs: () => void;
  debugMode?: number;
}

export class WelcomePage extends React.Component<WelcomePageProps, {}> {
  private newBotButtonRef: HTMLButtonElement;
  private openBotButtonRef: HTMLButtonElement;
  private signIntoAzureButtonRef: HTMLButtonElement;

  constructor(props: WelcomePageProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { startSection, signInSection, headerSection } = this;

    return (
      <GenericDocument>
        <Row>
          <Column className={styles.spacing}>
            {headerSection}
            {startSection}
            <React.Fragment>
              <RecentBotsListContainer onBotSelected={this.onBotSelected} />
              {signInSection}
            </React.Fragment>
          </Column>
          <Column className={styles.rightColumn}>
            <HowToBuildABotContainer />
          </Column>
        </Row>
      </GenericDocument>
    );
  }

  private get headerSection(): JSX.Element {
    return (
      <React.Fragment>
        <LargeHeader>Bot Framework Emulator</LargeHeader>
        <span className={styles.versionNumber}>Version 4</span>
      </React.Fragment>
    );
  }

  private get startSection(): JSX.Element {
    return (
      <div className={styles.section}>
        <SmallHeader className={styles.marginFix}>Start by testing your bot</SmallHeader>
        <span>
          {'Start talking to your bot by connecting to an endpoint.'}
          <br />
          <LinkButton linkRole={true} onClick={this.onWorkingLocallyLinkClick}>
            More about working locally with a bot.
          </LinkButton>
        </span>
        <Row>
          <PrimaryButton
            id={'open-bot-welcome'}
            className={styles.openBot}
            text="Open Bot"
            onClick={this.onOpenBotClick}
            buttonRef={this.setOpenBotButtonRef}
          />
        </Row>
        <span>
          If you don’t have a bot configuration,&nbsp;
          <LinkButton buttonRef={this.setNewBotButtonRef} onClick={this.onNewBotClick}>
            create a new bot configuration.
          </LinkButton>
        </span>
      </div>
    );
  }

  private get signInSection(): JSX.Element {
    const { accessToken, signOutWithAzure } = this.props;
    return (
      <div>
        {accessToken && !accessToken.startsWith('invalid') ? (
          <LinkButton onClick={signOutWithAzure}>Sign out</LinkButton>
        ) : (
          <LinkButton buttonRef={this.setSignInToAzureButtonRef} onClick={this.signInToAzure}>
            Sign in with your Azure account.
          </LinkButton>
        )}
      </div>
    );
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onBotSelected = (bot: BotInfo) => {
    this.props.switchToBot(bot.path);
  };

  private onOpenBotClick = async () => {
    await this.props.showOpenBotDialog();

    this.openBotButtonRef && this.openBotButtonRef.focus();
  };

  private onNewBotClick = async () => {
    await this.props.onNewBotClick();

    this.newBotButtonRef && this.newBotButtonRef.focus();
  };

  private signInToAzure = async () => {
    await this.props.signInWithAzure();

    this.signIntoAzureButtonRef && this.signIntoAzureButtonRef.focus();
  };

  private setNewBotButtonRef = (ref: HTMLButtonElement): void => {
    this.newBotButtonRef = ref;
  };

  private setOpenBotButtonRef = (ref: HTMLButtonElement): void => {
    this.openBotButtonRef = ref;
  };

  private setSignInToAzureButtonRef = (ref: HTMLButtonElement): void => {
    this.signIntoAzureButtonRef = ref;
  };

  private onWorkingLocallyLinkClick = this.createAnchorClickHandler(
    'https://aka.ms/bot-framework-emulator-create-bot-locally'
  );
}
