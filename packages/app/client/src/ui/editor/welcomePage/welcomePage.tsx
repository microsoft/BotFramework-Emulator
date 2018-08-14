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
import { connect } from 'react-redux';
import { BotInfo } from '@bfemulator/app-shared';
import * as styles from './welcomePage.scss';
import { Column, LargeHeader, PrimaryButton, Row, SmallHeader, TruncateText } from '@bfemulator/ui-react';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { GenericDocument } from '../../layout';
import { RootState } from '../../../data/store';
import { SharedConstants } from '../../../../../shared/src/constants';

interface WelcomePageProps {
  documentId?: string;
  recentBots?: BotInfo[];
}

class WelcomePageComponent extends React.Component<WelcomePageProps, {}> {
  onNewBotClick = () => {
    CommandServiceImpl.call(SharedConstants.Commands.UI.ShowBotCreationDialog).catch();
  }

  onOpenBotClick = () => {
    CommandServiceImpl.call(SharedConstants.Commands.Bot.OpenBrowse).catch();
  }

  onBotClick = (_e: any, path) => {
    CommandServiceImpl.call(SharedConstants.Commands.Bot.Switch, path).catch();
  }

  render() {
    return (
      <GenericDocument>
        <LargeHeader>Welcome to the Bot Framework Emulator!</LargeHeader>
        <Row>
          <Column>
            <div className={ styles.section }>
              <SmallHeader>Start</SmallHeader>
              <span>Start talking to your bot by connecting to an endpoint or by opening a
                bot saved locally. More about working locally with a bot.</span>
              <Row>
                <PrimaryButton className={ styles.openBot } text="Open Bot" onClick={ this.onOpenBotClick }/>
              </Row>
              <span>If you don’t have a bot configuration,
                <a className={ styles.ctaLink } href="javascript:void(0)"
                   onClick={ this.onNewBotClick }>create a new bot configuration.</a>
              </span>
            </div>
            <div className={ styles.section }>
              <SmallHeader>My Bots</SmallHeader>
              <ul className={ `${styles.recentBotsList} ${styles.well}` }>
                {
                  this.props.recentBots && this.props.recentBots.length ?
                    this.props.recentBots.slice(0, 10).map(bot => bot &&
                      <li key={ bot.path }>
                        <a href="javascript:void(0);" onClick={ ev => this.onBotClick(ev, bot.path) }
                           title={ bot.path }><TruncateText>{ bot.displayName }</TruncateText></a>
                        <TruncateText className={ styles.recentBotDetail }
                                      title={ bot.path }>{ bot.path }</TruncateText>
                      </li>)
                    :
                    <li><span className={ styles.noBots }><TruncateText>No recent bots</TruncateText></span></li>
                }
              </ul>
            </div>
          </Column>
          <Column className={ styles.rightColumn }>
            <div className={ styles.section }>
              <SmallHeader>Help</SmallHeader>
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
          </Column>
        </Row>
      </GenericDocument>
    );
  }
}

const mapStateToProps = (state: RootState): WelcomePageProps => ({
  recentBots: state.bot.botFiles
});

export const WelcomePage = connect(mapStateToProps)(WelcomePageComponent);
