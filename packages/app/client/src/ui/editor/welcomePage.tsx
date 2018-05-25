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
import { hot } from 'react-hot-loader';
import { css } from 'glamor';
import * as React from 'react';
import { connect } from 'react-redux';
import { BotInfo } from '@bfemulator/app-shared';

import { Colors, Column, Row, PrimaryButton, LargeHeader, SmallHeader, TruncateText } from '@bfemulator/ui-react';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { GenericDocument } from '../layout';
import { RootState } from '../../data/store';

const CSS = css({
  '& .right-column': {
    marginLeft: '48px'
  },

  '& .section': {
    marginBottom: '34px',
    width: 'auto',
    maxWidth: '100%'
  },

  '& .well': {
    padding: '12px 10px',
    background: 'rgba(0,0,0,.2)',
    transition: 'background 0.05s',

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent'
    },

    '&:hover': {
      background: 'rgba(200,235,255,.072)',

      '&::-webkit-scrollbar-thumb': {
        backgroundColor: Colors.SCROLLBAR_THUMB_BACKGROUND_DARK
      }
    }
  },

  '& .no-bots': {
    fontStyle: 'italic',
  },

  '& .recent-bots-list': {
    maxHeight: '100px',
    overflowY: 'auto',
    overflowX: 'hidden',

    '& > li': {
      display: 'flex'
    },

    '& a': {
      flexShrink: 0
    }
  },

  '& .recent-bot-detail': {
    display: 'inline-block',
    marginLeft: '8px',
    color: Colors.APP_HYPERLINK_DETAIL_DARK,
    userSelect: 'text',
    cursor: 'text'
  },

  '& a': {
    minWidth: 0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textDecoration: 'none',
    color: Colors.APP_HYPERLINK_FOREGROUND_DARK,

    ':hover': {
      color: Colors.APP_HYPERLINK_FOREGROUND_DARK
    }
  },

  '& ul': {
    margin: 0,
    listStyle: 'none',
    padding: 0,
  },

  '& .open-bot': {
    marginTop: '24px',
    marginBottom: '16px',
    width: '180px',
    height: '26px',

    '& .primary-button-text': {
      lineHeight: '26px'
    }
  },

  '& .cta-link': {
    whiteSpace: 'normal'
  }
});

interface WelcomePageProps {
  documentId?: string;
  recentBots?: BotInfo[];
}

class WelcomePageComponent extends React.Component<WelcomePageProps, {}> {
  onNewBotClick = () => {
    CommandServiceImpl.call('bot-creation:show');
  }

  onOpenBotClick = () => {
    CommandServiceImpl.call('bot:browse-open');
  }

  onBotClick = (_e: any, path) => {
    CommandServiceImpl.call('bot:switch', path);
  }

  render() {
    return (
      <GenericDocument style={ CSS }>
        <LargeHeader>Welcome to the Bot Framework Emulator!</LargeHeader>
        <Row>
          <Column>
            <div className="section">
              <SmallHeader>Start</SmallHeader>
              <span>Start talking to your bot by connecting to an endpoint or by opening a
                bot saved locally. More about working locally with a bot.</span>
              <Row>
                <PrimaryButton className="open-bot big-button" text="Open Bot" onClick={ this.onOpenBotClick }/>
              </Row>
              <span>If you don’t have a bot configuration, 
                <a className="cta-link" href="javascript:void(0)" 
                   onClick={ this.onNewBotClick }>create a new bot configuration.</a>
              </span>
            </div>
            <div className="section">
              <SmallHeader>My Bots</SmallHeader>
              <ul className="recent-bots-list well">
                {
                  this.props.recentBots && this.props.recentBots.length ?
                    this.props.recentBots.slice(0, 10).map(bot => bot &&
                      <li key={ bot.path }>
                        <a href="javascript:void(0);" onClick={ ev => this.onBotClick(ev, bot.path) }
                           title={ bot.path }><TruncateText>{ bot.displayName }</TruncateText></a>
                        <TruncateText className="recent-bot-detail" title={ bot.path }>{ bot.path }</TruncateText>
                      </li>)
                    :
                    <li><span className="no-bots"><TruncateText>No recent bots</TruncateText></span></li>
                }
              </ul>
            </div>
          </Column>
          <Column className="right-column">
            <div className="section">
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

export const WelcomePage = connect(mapStateToProps)(hot(module)(WelcomePageComponent)) as any;
