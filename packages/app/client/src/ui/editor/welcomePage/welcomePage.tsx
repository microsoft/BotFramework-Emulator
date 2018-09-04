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
        <div className={styles.howToBuildSection}>
          <h3>How to build a bot</h3>
          <div className={styles.stepContainer}>
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan01}></div>
            </div>
            <dl>
              <dt>Plan:</dt>
              <dd>Review the bot design guidelines for best practices</dd>
            </dl>
          </div>
          <div className={styles.stepContainer}>
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan02}></div>
            </div>
            <dl>
              <dt>Build:</dt>
              <dd>
                <a className={styles.ctaLink} href="https://github.com/Microsoft/botbuilder-tools">Download Command Line tools</a><br />
                Create a bot from Azure or locally<br />
                Add services such as <a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-v4-luis?view=azure-bot-service-4.0&tabs=cs">Language Understanding (LUIS)</a>, <a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-qna?view=azure-bot-service-4.0&tabs=cs">QnAMaker</a> and <a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-tutorial-dispatch?view=azure-bot-service-4.0&tabs=csaddref%2Ccsbotconfig">Dispatch</a>
              </dd>
            </dl>
          </div>
          <div className={styles.stepContainer}>
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan03}></div>
            </div>
            <dl>
              <dt className={styles.testBullet}>Test:</dt>
              <dd>Test with the <a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-service-debug-emulator?view=azure-bot-service-4.0">Emulator</a> <br />
                Test online in <a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-test-webchat?view=azure-bot-service-4.0">Web Chat</a></dd>
            </dl>
          </div>
          <div className={styles.stepContainer}>
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan04}></div>
            </div>
            <dl>
              <dt>Publish:</dt>
              <dd>
                Publish directly to Azure or<br />
                Use <a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-service-build-continuous-deployment?view=azure-bot-service-4.0">Continuous Deployment</a>
              </dd>
            </dl>
          </div>
          <div className={styles.stepContainer}>
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan05}></div>
            </div>
            <dl>
              <dt>Connect:</dt>
              <dd>Connect to <a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-channels?view=azure-bot-service-4.0">channels</a></dd>
            </dl>
          </div>
          <div className={styles.stepContainer}>
            <div className={styles.stepIcon}>
              <div className={styles.buildPlan06}></div>
            </div>
            <dl>
              <dt>Evaluate:</dt>
              <dd><a className={styles.ctaLink} href="https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-analytics?view=azure-bot-service-4.0">View analytics</a></dd>
            </dl>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): WelcomePageProps => ({
  accessToken: state.azureAuth.access_token
});

export const WelcomePage = connect(mapStateToProps)(WelcomePageComponent) as any;
