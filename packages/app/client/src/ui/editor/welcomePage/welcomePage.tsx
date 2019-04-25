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

import { BotInfo } from '@bfemulator/app-shared';
import { Column, LargeHeader, PrimaryButton, Row, SmallHeader, MediumHeader } from '@bfemulator/ui-react';
import * as React from 'react';
import { DebugMode } from '@bfemulator/app-shared';

import { GenericDocument } from '../../layout';
import { RecentBotsListContainer } from '../recentBotsList/recentBotsListContainer';

import { HowToBuildABot } from './howToBuildABot';
import * as styles from './welcomePage.scss';

export interface WelcomePageProps {
  accessToken?: string;
  onNewBotClick?: () => void;
  showOpenBotDialog: () => Promise<any>;
  sendNotification?: (error: Error) => void;
  signInWithAzure?: () => void;
  signOutWithAzure?: () => void;
  switchToBot?: (path: string) => Promise<any>;
  openBotInspectorDocs: () => void;
  debugMode?: number;
}

export class WelcomePage extends React.Component<WelcomePageProps, {}> {
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
            {this.props.debugMode === DebugMode.Normal && (
              <React.Fragment>
                <RecentBotsListContainer onBotSelected={this.onBotSelected} />
                {signInSection}
              </React.Fragment>
            )}
          </Column>
          <Column className={styles.rightColumn}>
            <HowToBuildABot />
          </Column>
        </Row>
      </GenericDocument>
    );
  }

  private get headerSection(): JSX.Element {
    return (
      <React.Fragment>
        <LargeHeader>Bot Framework Emulator</LargeHeader>
        {this.props.debugMode === DebugMode.Sidecar && (
          <div className={styles.botInspectorHeaderContainer}>
            <MediumHeader>
              Bot Inspector <span className={styles.betaLabel}>(BETA)</span>
            </MediumHeader>
            &nbsp;
            <span>
              <a href="javascript: void(0)" onClick={this.props.openBotInspectorDocs}>
                Get Started
              </a>
            </span>
          </div>
        )}
        <span className={styles.versionNumber}>Version 4</span>
      </React.Fragment>
    );
  }

  private get startSection(): JSX.Element {
    return (
      <div className={styles.section}>
        <SmallHeader className={styles.marginFix}>Start by testing your bot</SmallHeader>
        <span>
          {this.props.debugMode === DebugMode.Normal
            ? 'Start talking to your bot by connecting to an endpoint or by opening a bot saved locally.'
            : 'Start talking to your bot by connecting to an endpoint.'}
          <br />
          <a className={styles.ctaLink} href="https://aka.ms/bot-framework-emulator-create-bot-locally">
            More about working locally with a bot.
          </a>
        </span>
        <Row>
          <PrimaryButton className={styles.openBot} text="Open Bot" onClick={this.onOpenBotClick} />
        </Row>
        {this.props.debugMode === DebugMode.Normal && (
          <span>
            If you don’t have a bot configuration,&nbsp;
            <button className={styles.ctaLink} onClick={this.props.onNewBotClick}>
              create a new bot configuration.
            </button>
          </span>
        )}
      </div>
    );
  }

  private onBotSelected = async (bot: BotInfo) => {
    try {
      await this.props.switchToBot(bot.path);
    } catch (e) {
      this.props.sendNotification(e);
    }
  };

  private onOpenBotClick = async () => {
    try {
      await this.props.showOpenBotDialog();
    } catch (e) {
      this.props.sendNotification(e);
    }
  };

  private get signInSection(): JSX.Element {
    const { accessToken, signInWithAzure, signOutWithAzure } = this.props;
    return (
      <div>
        {accessToken && !accessToken.startsWith('invalid') ? (
          <button className={styles.ctaLink} onClick={signOutWithAzure}>
            Sign out
          </button>
        ) : (
          <button className={styles.ctaLink} onClick={signInWithAzure}>
            Sign in with your Azure account.
          </button>
        )}
      </div>
    );
  }
}
