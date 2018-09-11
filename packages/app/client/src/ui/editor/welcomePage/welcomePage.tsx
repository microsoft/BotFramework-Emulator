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
import { BotInfo } from '@bfemulator/app-shared';
import * as styles from './welcomePage.scss';
import { Column, LargeHeader, PrimaryButton, Row, SmallHeader, TruncateText } from '@bfemulator/ui-react';
import { GenericDocument } from '../../layout';

export interface WelcomePageProps {
  accessToken?: string;
  documentId?: string;
  onAnchorClick: (url: string) => void;
  onNewBotClick?: () => void;
  onOpenBotClick?: () => void;
  onBotClick?: (_e: any, path: string) => void;
  onDeleteBotClick?: (_e: any, path: string) => void;
  recentBots?: BotInfo[];
  signInWithAzure?: () => void;
  signOutWithAzure?: () => void;
}

export class WelcomePage extends React.Component<WelcomePageProps, {}> {
  constructor(props: WelcomePageProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { startSection, myBotsSection, howToBuildSection, signInSection } = this;

    return (
      <GenericDocument>
        <LargeHeader>Bot Framework Emulator</LargeHeader>
        <span className={ styles.versionNumber }>Version 4</span>
        <Row>
          <Column className={ styles.spacing }>
            { startSection }
            { myBotsSection }
            { signInSection }
          </Column>
          <Column className={ styles.rightColumn }>
            { howToBuildSection }
          </Column>
        </Row>
      </GenericDocument>
    );
  }

  private onBotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { index } = event.currentTarget.dataset;
    const bot = this.props.recentBots[index];
    this.props.onBotClick(event, bot.path);
  }

  private onDeleteBotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { index } = event.currentTarget.dataset;
    const bot = this.props.recentBots[index];
    this.props.onDeleteBotClick(event, bot.path);
  }

  private onLearnMoreCDAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-publish-continuous-deployment');
  }

  private onLearnMoreCommandLineAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-tools');
  }

  private onLearnMoreCreateBotAzureAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-create-bot-azure');
  }

  private onLearnMoreDebugWebChatAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-debug-with-web-chat');
  }

  private onLearnMoreDesignGuidelinesAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-design-guidelines');
  }

  private onLearnMoreDispatchAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-create-dispatch');
  }

  private onLearnMoreEmulatorAnalyticsAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-bot-analytics');
  }

  private onLearnMoreEmulatorAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-debug-with-emulator');
  }

  private onLearnMoreEmulatorChannelsAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-connect-channels');
  }

  private onLearnMoreLocalBotAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-create-bot-locally');
  }

  private onLearnMoreLUISAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-LUIS-docs-home');
  }

  private onLearnMoreQnAAnchor = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-qna-docs-home');
  }

  private get startSection(): JSX.Element {
    const { onNewBotClick, onOpenBotClick } = this.props;

    return (
      <div className={ styles.section }>
        <SmallHeader className={ styles.marginFix }>Start by testing your bot</SmallHeader>
        <span>Start talking to your bot by connecting to an endpoint or by opening a
          bot saved locally.<br />
          <a
            className={ styles.ctaLink }
            href="javascript:void(0);"
            onClick={ this.onLearnMoreLocalBotAnchor }
          >More about working locally with a bot.
          </a>
        </span>
        <Row>
          <PrimaryButton className={ styles.openBot } text="Open Bot" onClick={ onOpenBotClick } />
        </Row>
        <span>If you don’t have a bot configuration,&nbsp;
          <button className={ styles.ctaLink }
            onClick={ onNewBotClick }>create a new bot configuration.</button>
        </span>
      </div>
    );
  }

  private get myBotsSection(): JSX.Element {
    return (
      <div className={ styles.section }>
        <SmallHeader className={ styles.marginFix }>My Bots</SmallHeader>
        <ul className={ `${ styles.recentBotsList } ${ styles.well }` }>
          {
            this.props.recentBots && this.props.recentBots.length ?
              this.props.recentBots.slice(0, 10).map((bot, index) => bot &&
                <li className={ styles.recentBot } key={ bot.path }>
                  <button data-index={ index } onClick={ this.onBotClick }
                    title={ bot.path }><TruncateText>{ bot.displayName }</TruncateText></button>
                  <TruncateText className={ styles.recentBotPath }
                    title={ bot.path }>{ bot.path }</TruncateText>
                  <div className={ styles.recentBotActionBar }>
                    <button data-index={ index } onClick={ this.onDeleteBotClick }></button>
                  </div>
                </li>)
              :
              <li>
                <span className={ styles.noBots }><TruncateText>You have not opened any bots</TruncateText></span>
              </li>
          }
        </ul>
      </div>
    );
  }

  private get signInSection(): JSX.Element {
    const { accessToken, signInWithAzure, signOutWithAzure } = this.props;

    return (
      <div>
        {
          (accessToken && !accessToken.startsWith('invalid')) ?
            <button className={ styles.ctaLink } onClick={ signOutWithAzure }>Sign out</button>
            :
            <button className={ styles.ctaLink } onClick={ signInWithAzure }>
              Sign in with your Azure account.
            </button>
        }</div>
    );
  }

  private get howToBuildSection(): JSX.Element {
    return (
      <div className={ styles.section }>
        <div className={ styles.howToBuildSection }>
          <h3>How to build a bot</h3>
          <div className={ styles.stepContainer }>
            <div className={ styles.stepIcon }>
              <div className={ styles.buildPlan01 }></div>
            </div>
            <dl>
              <dt>Plan:</dt>
              <dd>
                Review the bot&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreDesignGuidelinesAnchor }
                >
                  design guidelines&nbsp;
                </a>
                for best practices&nbsp;
              </dd>
            </dl>
          </div>
          <div className={ styles.stepContainer }>
            <div className={ styles.stepIcon }>
              <div className={ styles.buildPlan02 }></div>
            </div>
            <dl>
              <dt>Build:</dt>
              <dd>
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreCommandLineAnchor }
                >
                  Download Command Line tools&nbsp;
                </a><br />
                Create a bot&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreCreateBotAzureAnchor }
                >
                  from Azure
                </a> or&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreLocalBotAnchor }
                >
                  locally
                </a><br />
                Add services such as<br />
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreLUISAnchor }
                >
                  Language Understanding (LUIS)
                </a>,&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreQnAAnchor }
                >
                  QnAMaker&nbsp;
                </a>
                and&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreDispatchAnchor }
                >
                  Dispatch
                </a>
              </dd>
            </dl>
          </div>
          <div className={ styles.stepContainer }>
            <div className={ styles.stepIcon }>
              <div className={ styles.buildPlan03 }></div>
            </div>
            <dl>
              <dt className={ styles.testBullet }>Test:</dt>
              <dd>
                Test with the&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreEmulatorAnchor }
                >
                  Emulator
                </a> <br />
                Test online in&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreDebugWebChatAnchor }
                >
                  Web Chat
                </a></dd>
            </dl>
          </div>
          <div className={ styles.stepContainer }>
            <div className={ styles.stepIcon }>
              <div className={ styles.buildPlan04 }></div>
            </div>
            <dl>
              <dt>Publish:</dt>
              <dd>
                Publish directly to Azure or<br />
                Use <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreCDAnchor }
                >
                  Continuous Deployment&nbsp;
                </a>
              </dd>
            </dl>
          </div>
          <div className={ styles.stepContainer }>
            <div className={ styles.stepIcon }>
              <div className={ styles.buildPlan05 }></div>
            </div>
            <dl>
              <dt>Connect:</dt>
              <dd>
                Connect to&nbsp;
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreEmulatorChannelsAnchor }
                >
                  channels&nbsp;
                </a>
              </dd>
            </dl>
          </div>
          <div className={ styles.stepContainer }>
            <div className={ styles.stepIcon }>
              <div className={ styles.buildPlan06 }></div>
            </div>
            <dl>
              <dt>Evaluate:</dt>
              <dd>
                <a
                  className={ styles.ctaLink }
                  href="javascript:void(0);"
                  onClick={ this.onLearnMoreEmulatorAnalyticsAnchor }
                >
                  View analytics
                </a>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    );
  }
}
