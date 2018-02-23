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

import { css } from 'glamor';
import React from 'react';
import { connect } from 'react-redux';

import { CommandService } from '../../../platform/commands/commandService';
import { getBotDisplayName } from 'botframework-emulator-shared/built/utils';
import { getBotById } from '../../../data/botHelpers';

const CSS = css({
  padding: '8px 16px',
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  flexShrink: 0,

  '& > header': {
    fontSize: '13px',
    lineHeight: '24px',
    height: '24px',
    textTransform: 'uppercase'
  },

  '& > span.bot-settings-icon': {
    display: 'inline-block',
    marginLeft: 'auto',
    background: "url('./external/media/ic_settings.svg') no-repeat 50% 50%",
    backgroundSize: '16px',
    width: '24px',
    height: '24px',
    cursor: 'pointer'
  }
});

class ExplorerBarTitle extends React.Component {
  constructor(context, props) {
    super(context, props);

    this.onClickSettings = this.onClickSettings.bind(this);
  }

  onClickSettings(e) {
    const bot = getBotById(this.props.activeBot);
    CommandService.call('bot:settings:open', bot);
  }

  render() {
    const botIdentifier = this.props.activeBot ? getBotDisplayName(getBotById(this.props.activeBot)) : null;

    return (
      <div className={ CSS }>
        <header>
          { botIdentifier }
        </header>
        { this.props.activeBot ? <span className="bot-settings-icon" onClick={ this.onClickSettings } /> : null }
      </div>
    );
  }
}

export default connect(state => ({
  activeBot: state.bot.activeBot,
  bots: state.bot.bots,
  navBar: state.navBar
}))(ExplorerBarTitle)
