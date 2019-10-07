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

import { IBotConfiguration } from 'botframework-config/lib/schema';
import * as React from 'react';

import { BotNotOpenExplorerContainer } from '../botNotOpenExplorer';
import { EndpointExplorerContainer } from '../endpointExplorer';
import * as explorerStyles from '../explorerStyles.scss';
import { ServicesExplorerContainer } from '../servicesExplorer';

import * as styles from './botExplorerBar.scss';

interface BotExplorerBarProps {
  activeBot: IBotConfiguration;
  hidden: boolean;
  openBotSettings: () => void;
}

export default class BotExplorerBar extends React.Component<BotExplorerBarProps, {}> {
  private static get activeBotJsx(): JSX.Element {
    return (
      <>
        <EndpointExplorerContainer title="Endpoint" ariaLabel="Endpoints" />
        <ServicesExplorerContainer title="Services" ariaLabel="Services" />
      </>
    );
  }

  private openBotSettingsButtonRef: HTMLButtonElement;

  public render() {
    const className = this.props.hidden ? styles.explorerOffScreen : '';
    const explorerBody = this.props.activeBot ? BotExplorerBar.activeBotJsx : <BotNotOpenExplorerContainer />;
    return (
      <div className={`${styles.botExplorerBar} ${className}`}>
        <div className={explorerStyles.explorerBarHeader}>
          <header>Bot Explorer</header>
          <button
            aria-label="Open bot settings"
            className={explorerStyles.botSettings}
            disabled={!this.props.activeBot}
            onClick={this.openBotSettingsClick}
            ref={this.setOpenBotSettingsRef}
          >
            <span />
          </button>
        </div>
        <ul className={explorerStyles.explorerSet}>
          <li>{explorerBody}</li>
        </ul>
      </div>
    );
  }

  private openBotSettingsClick = async () => {
    await this.props.openBotSettings();
    this.openBotSettingsButtonRef.focus();
  };

  private setOpenBotSettingsRef = (ref: HTMLButtonElement): void => {
    this.openBotSettingsButtonRef = ref;
  };
}
