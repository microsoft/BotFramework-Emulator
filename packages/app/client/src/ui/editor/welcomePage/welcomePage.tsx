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

import * as React from 'react';
import { BotInfo, SharedConstants } from '@bfemulator/app-shared';
import * as styles from './welcomePage.scss';
import { Column, LargeHeader, PrimaryButton, Row, SmallHeader, TruncateText } from '@bfemulator/ui-react';
import { GenericDocument } from '../../layout';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { connect } from 'react-redux';
import { RootState } from '../../../data/store';

const { Azure, UI } = SharedConstants.Commands;

export interface WelcomePageProps {
  accessToken?: string;
  documentId?: string;
  recentBots?: BotInfo[];
  onNewBotClick?: () => void;
  onOpenBotClick?: () => void;
  onBotClick?: (_e: any, path: string) => void;
  onDeleteBotClick?: (_e: any, path: string) => void;
}

class WelcomePageComponent extends React.Component<WelcomePageProps, {}> {
  constructor(props: WelcomePageProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { startSection, myBotsSection, howToBuildSection, signInSection } = this;

    return (
      <GenericDocument>
        <LargeHeader>Bot Framework Emulator</LargeHeader>
        <span className={styles.versionNumber}>Version 4</span>
        <Row>
          <Column>
            {startSection}
            {myBotsSection}
            {signInSection}
          </Column>
          <Column className={styles.rightColumn}>
            {howToBuildSection}
          </Column>
        </Row>
      </GenericDocument>
    );
  }

  private get startSection(): JSX.Element {
    const { onNewBotClick, onOpenBotClick } = this.props;

    return (
      <div className={styles.section}>
        <SmallHeader>Start by testing your bot</SmallHeader>
        <span>Start talking to your bot by connecting to an endpoint or by opening a
          bot saved locally.<br /> More about working locally with a bot.</span>
        <Row>
          <PrimaryButton className={styles.openBot} text="Open Bot" onClick={onOpenBotClick} />
        </Row>
        <span>If you don’t have a bot configuration,
          <button className={styles.ctaLink}
            onClick={onNewBotClick}>create a new bot configuration.</button>
        </span>
      </div>
    );
  }

  private get myBotsSection(): JSX.Element {
    const { onBotClick, onDeleteBotClick } = this.props;

    return (
      <div className={styles.section}>
        <SmallHeader>My Bots</SmallHeader>
        <ul className={`${styles.recentBotsList} ${styles.well}`}>
          {
            this.props.recentBots && this.props.recentBots.length ?
              this.props.recentBots.slice(0, 10).map(bot => bot &&
                <li className={styles.recentBot} key={bot.path}>
                  <button onClick={ev => onBotClick(ev, bot.path)}
                    title={bot.path}><TruncateText>{bot.displayName}</TruncateText></button>
                  <TruncateText className={styles.recentBotPath}
                    title={bot.path}>{bot.path}</TruncateText>
                  <div className={styles.recentBotActionBar}>
                    <button onClick={ev => onDeleteBotClick(ev, bot.path)}></button>
                  </div>
                </li>)
              :
              <li><span className={styles.noBots}><TruncateText>You have not opened any bots</TruncateText></span></li>
          }
        </ul>
      </div>
    );
  }

  private get signInSection(): JSX.Element {
    const { accessToken } = this.props;

    return (
      <div>
        {
          (accessToken && !accessToken.startsWith('invalid')) ?
            <button className={styles.ctaLink} onClick={() => this.signOutWithAzure()}>Sign out</button>
            :
            <button className={styles.ctaLink} onClick={() => this.signInWithAzure()}>Sign in with your Azure account.</button>
        }</div>
    );
  }

  private signInWithAzure() {
    CommandServiceImpl.call(UI.SignInToAzure);
  }

  private signOutWithAzure() {
    CommandServiceImpl.call(Azure.SignUserOutOfAzure)
    CommandServiceImpl.call(UI.InvalidateAzureArmToken)
  }

  private get howToBuildSection(): JSX.Element {
    return (
      <div className={styles.section}>

        <ul>
          <li><a href="https://aka.ms/BotBuilderOverview"><TruncateText>Overview</TruncateText></a></li>
          <li><a href="https://aka.ms/Btovso"><TruncateText>GitHub Repository</TruncateText></a></li>
          <li><a href="https://aka.ms/BotBuilderLocalDev"><TruncateText>Starting with Local
            Development</TruncateText></a></li>
          <li><a href="https://aka.ms/BotBuilderAZCLI"><TruncateText>Starting with Azure CLI</TruncateText></a>
          </li>
          <li><a href="https://aka.ms/BotBuilderIbiza">
            <TruncateText>Starting with the Azure Portal</TruncateText>
          </a>
          </li>
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): WelcomePageProps => ({
  accessToken: state.azureAuth.access_token
});

export const WelcomePage = connect(mapStateToProps)(WelcomePageComponent) as any;
