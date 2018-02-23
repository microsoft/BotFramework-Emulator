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

import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

import Chat from './parts/chat';
import * as Colors from '../../styles/colors';
import Panel, { Controls as PanelControls, Content as PanelContent } from '../panel';
import { getActiveBot, getBotById } from '../../../data/botHelpers';

const CSS = css({
  height: '100%',

  '& > header': {
    backgroundColor: Colors.SECTION_HEADER_BACKGROUND_DARK,
    color: Colors.SECTION_HEADER_FOREGROUND_DARK,
    lineHeight: '30px',
    minHeight: '30px',
    paddingLeft: '16px',
    textTransform: 'lowercase',
    userSelect: 'text',
    whiteSpace: 'nowrap'
  }
});

export default class ChatPanel extends React.Component {
  render() {
    let botId = getActiveBot();
    let bot = getBotById(botId);
    let endpoint = bot ? bot.botUrl : "";
    return (
      <div className={ CSS }>
        <header>{ endpoint }</header>
        <Chat document={ this.props.document } />
      </div>
    );
  }
}


ChatPanel.propTypes = {
  document: PropTypes.object.isRequired
};
