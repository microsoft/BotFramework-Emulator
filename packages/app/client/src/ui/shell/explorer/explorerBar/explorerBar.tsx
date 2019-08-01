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

import { InsetShadow } from '@bfemulator/ui-react';
import { IBotConfiguration } from 'botframework-config/lib/schema';
import * as React from 'react';
import { connect } from 'react-redux';

import * as Constants from '../../../../constants';
import { RootState } from '../../../../state/store';
import { BotExplorerBarContainer } from '../botExplorerBar/botExplorerBarContainer';
import { NotificationsExplorerBar } from '../notificationsExplorer/notificationsExplorerBar';
import { ResourcesBarContainer } from '../resourcesBar/resourcesBarContainer';

import * as styles from './explorerBar.scss';

interface ExplorerBarProps {
  activeBot?: IBotConfiguration;
  selectedNavTab?: string;
}

class ExplorerBarComponent extends React.Component<ExplorerBarProps> {
  constructor(props: ExplorerBarProps) {
    super(props);
  }

  private get explorerBar(): JSX.Element {
    const { activeBot = null, selectedNavTab = null } = this.props;
    return (
      <BotExplorerBarContainer
        activeBot={activeBot}
        key={'bot-explorer-bar'}
        hidden={selectedNavTab !== Constants.NAVBAR_BOT_EXPLORER}
      />
    );
  }

  private get notificationsBar(): JSX.Element {
    return <NotificationsExplorerBar key={'notifications-explorer-bar'} />;
  }

  private get resourcesBar(): JSX.Element {
    return <ResourcesBarContainer key="resources" />;
  }

  public render(): JSX.Element {
    const { selectedNavTab = null } = this.props;
    let explorer;
    switch (selectedNavTab) {
      case Constants.NAVBAR_NOTIFICATIONS:
        explorer = [this.explorerBar, this.notificationsBar];
        break;

      case Constants.NAVBAR_RESOURCES:
        explorer = [this.resourcesBar];
        break;

      default:
        explorer = [this.explorerBar];
        break;
    }

    return (
      <div className={styles.explorerBar}>
        {explorer}
        <InsetShadow orientation={'right'} />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): ExplorerBarProps => ({
  activeBot: state.bot.activeBot,
  selectedNavTab: state.navBar.selection,
});

export const ExplorerBar = connect(mapStateToProps)(ExplorerBarComponent);
