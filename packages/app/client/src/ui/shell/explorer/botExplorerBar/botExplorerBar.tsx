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
import * as styles from './botExplorerBar.scss';
import * as explorerStyles from '../explorerStyles.scss';
import { EndpointExplorerContainer } from '../endpointExplorer';
import { BotNotOpenExplorer } from '../botNotOpenExplorer';
import { IBotConfiguration } from 'botframework-config/lib/schema';
import { ServicesExplorerContainer } from '../servicesExplorer';

interface BotExplorerBarState {
  isBotActive: boolean;
}

interface BotExplorerBarProps {
  activeBot: IBotConfiguration;
  hidden: boolean;
  openBotSettings: () => void;
}

export default class BotExplorerBar extends React.Component<BotExplorerBarProps, BotExplorerBarState> {
  public state: BotExplorerBarState = {} as any;

  public static getDerivedStateFromProps(newProps: BotExplorerBarProps) {
    return {
      isBotActive: !!newProps.activeBot
    };
  }

  private get activeBotJsx(): JSX.Element {
    return (
      <>
        <EndpointExplorerContainer title="Endpoint" ariaLabel="Endpoints" />
        <ServicesExplorerContainer title="Services" ariaLabel="Services" />
      </>
    );
  }

  private get botNotOpenJsx(): JSX.Element {
    return <BotNotOpenExplorer/>;
  }

  public render() {
    const className = this.props.hidden ? styles.explorerOffScreen : '';
    const explorerBody = this.props.activeBot ? this.activeBotJsx : this.botNotOpenJsx;
    return (
      <div className={ `${styles.botExplorerBar} ${className}` }>
        <div className={ explorerStyles.explorerBarHeader }>
          <header>
            Bot Explorer
          </header>
          <button
            aria-label="Open bot settings"
            className={ explorerStyles.botSettings }
            disabled={ !this.state.isBotActive }
            onClick={ this.props.openBotSettings }>
            <span></span>
          </button>
        </div>
        <ul className={ explorerStyles.explorerSet }>
          <li>{ explorerBody }</li>
        </ul>
      </div>
    );
  }
}
