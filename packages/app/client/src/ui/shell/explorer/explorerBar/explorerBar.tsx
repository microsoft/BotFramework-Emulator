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

import BotExplorerBar from '../botExplorerBar';
import { ServicesExplorerBarContainer } from '../servicesExplorerBar';
import * as Constants from '../../../../constants';
import { IBotConfig } from 'msbot/bin/schema';
import { RootState } from '../../../../data/store';
import * as styles from './explorerBar.scss';

interface ExplorerBarProps {
  activeBot?: IBotConfig;
  selectedNavTab?: string;
}

class ExplorerBarComponent extends React.Component<ExplorerBarProps> {
  constructor(props: ExplorerBarProps) {
    super(props);
  }

  render() {
    let explorer = [];
    explorer.push(
      <BotExplorerBar key={ 'bot-explorer-bar' }
                      activeBot={ this.props.activeBot }
                      hidden={ this.props.selectedNavTab !== Constants.NAVBAR_BOT_EXPLORER }/>
    );
    if (this.props.selectedNavTab === Constants.NAVBAR_SERVICES) {
      explorer.push(
        <ServicesExplorerBarContainer key={ 'services-explorer-bar' }/>
      );
    }
    if (!this.props.selectedNavTab) {
      explorer = null;
    }

    return (
      <div className={ styles.explorerBar }>
        { explorer }
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): ExplorerBarProps => ({
  activeBot: state.bot.activeBot,
  selectedNavTab: state.navBar.selection
});

export const ExplorerBar = connect(mapStateToProps)(ExplorerBarComponent);
