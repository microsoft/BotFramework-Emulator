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

import { MouseEvent } from 'react';
import * as React from 'react';
import { BotInfo } from '@bfemulator/app-shared';
import * as styles from './welcomePage.scss';
import { Column, LargeHeader, PrimaryButton, Row, SmallHeader, TruncateText } from '@bfemulator/ui-react';
import { GenericDocument } from '../../layout';

export interface WelcomePageProps {
  accessToken?: string;
  documentId?: string;
  onLinkClick: (url: string) => void;
  onNewBotClick?: () => void;
  onOpenBotClick?: () => void;
  onBotClick?: (_e: any, path: string) => void;
  onDeleteBotClick?: (_e: any, path: string) => void;
  showContextMenuForBot?: (bot: BotInfo) => void;
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
        <Row>
          <Column className={ styles.spacing }>
            <LargeHeader>Bot Framework Emulator</LargeHeader>
            <span className={ styles.versionNumber }>Version 4</span>
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

  private onBotContextMenu = (event: React.MouseEvent<HTMLLIElement>): void => {
    const { index } = event.currentTarget.dataset;
    const bot: BotInfo = this.props.recentBots[index];
    this.props.showContextMenuForBot(bot);
  }

  private onLinkClick = (event: MouseEvent<HTMLButtonElement>): void => {
    const { currentTarget: link } = event;
    const { href } = link.dataset;
    this.props.onLinkClick(href);
  }

  private onDeleteBotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { index } = event.currentTarget.dataset;
    const bot = this.props.recentBots[index];
    this.props.onDeleteBotClick(event, bot.path);
  }

  private get startSection(): JSX.Element {
    const { onNewBotClick, onOpenBotClick } = this.props;

    return (
      <div className={ styles.section }>
        <SmallHeader className={ styles.marginFix }>Start by testing your bot</SmallHeader>
        <span>Start talking to your bot by connecting to an endpoint or by opening a
          bot saved locally.<br/>
          <button
            className={ styles.ctaLink }
            data-href="https://aka.ms/bot-framework-emulator-create-bot-locally"
            onClick={ this.onLinkClick }
          >More about working locally with a bot.
          </button>
        </span>
        <Row>
          <PrimaryButton className={ styles.openBot } text="Open Bot" onClick={ onOpenBotClick }/>
        </Row>
        <span>If you don’t have a bot configuration,&nbsp;
          <button className={ styles.ctaLink }
                  onClick={ onNewBotClick }>create a new bot configuration.
        </button>
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
                <li className={ styles.recentBot }
                    key={ bot.path }
                    data-index={ index }
                    onContextMenu={ this.onBotContextMenu }>
                  <button
                    data-index={ index }
                    onClick={ this.onBotClick }
                    title={ bot.path }>
                    <TruncateText>{ bot.displayName }</TruncateText>
                  </button>
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
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-design-guidelines"
                  onClick={ this.onLinkClick }
                >
                  design guidelines
                </button>&nbsp;for best practices&nbsp;
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
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-tools"
                  onClick={ this.onLinkClick }
                >
                  Download Command Line tools
                </button><br/>
                Create a bot&nbsp;
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-create-bot-azure"
                  onClick={ this.onLinkClick }
                >
                  from Azure
                </button> or&nbsp;
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-create-bot-locally"
                  onClick={ this.onLinkClick }
                >
                  locally
                </button><br/>
                Add services such as<br/>
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-LUIS-docs-home"
                  onClick={ this.onLinkClick }
                >
                  Language Understanding (LUIS)
                </button>,&nbsp;
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-qna-docs-home"
                  onClick={ this.onLinkClick }
                >
                  QnAMaker
                </button>&nbsp;
                and&nbsp;
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-create-dispatch"
                  onClick={ this.onLinkClick }
                >
                  Dispatch
                </button>
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
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-debug-with-emulator"
                  onClick={ this.onLinkClick }
                >
                  Emulator
                </button> <br/>
                Test online in&nbsp;
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-debug-with-web-chat"
                  onClick={ this.onLinkClick }
                >
                  Web Chat
                </button></dd>
            </dl>
          </div>
          <div className={ styles.stepContainer }>
            <div className={ styles.stepIcon }>
              <div className={ styles.buildPlan04 }></div>
            </div>
            <dl>
              <dt>Publish:</dt>
              <dd>
                Publish directly to Azure or<br/>
                Use <button
                className={ styles.ctaLink }
                data-href="https://aka.ms/bot-framework-emulator-publish-continuous-deployment"
                onClick={ this.onLinkClick }
                tabIndex={ 0 }
              >
                Continuous Deployment
              </button>
                &nbsp;
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
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-connect-channels"
                  onClick={ this.onLinkClick }
                >
                  channels
                </button>
                &nbsp;
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
                <button
                  className={ styles.ctaLink }
                  data-href="https://aka.ms/bot-framework-emulator-bot-analytics"
                  onClick={ this.onLinkClick }
                >
                  View analytics
                </button>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    );
  }
}
