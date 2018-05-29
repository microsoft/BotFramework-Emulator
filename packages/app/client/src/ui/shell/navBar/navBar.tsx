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

import { connect } from 'react-redux';
import { css } from 'glamor';
import classNames from 'classnames';
import * as React from 'react';
import { MouseEvent } from 'react';

import { Colors, InsetShadow } from '@bfemulator/ui-react';
import * as Constants from '../../../constants';
import * as NavBarActions from '../../../data/action/navBarActions';
import * as ExplorerActions from '../../../data/action/explorerActions';
import * as EditorActions from '../../../data/action/editorActions';
import { RootState } from '../../../data/store';
import { IBotConfig } from 'msbot/bin/schema';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { NavLink } from './navLink';

const CSS = css({
  backgroundColor: Colors.NAVBAR_BACKGROUND_DARK,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  width: '50px',

  '& .bot-explorer': {
    backgroundImage: 'url(./external/media/ic_bot_explorer.svg)'
  },

  '& .services': {
    backgroundImage: 'url(./external/media/ic_services.svg)'
  },

  '& .bot-settings': {
    backgroundImage: 'url(./external/media/ic_bot_settings.svg)'
  },

  '& .settings': {
    backgroundImage: 'url(./external/media/ic_settings.svg)'
  }
});

interface NavBarProps {
  activeBot?: IBotConfig;
  selection?: string;
  showingExplorer?: boolean;
  handleClick?: (evt: MouseEvent<HTMLAnchorElement>, selection: string) => void;
  handleSettingsClick?: (evt: MouseEvent<HTMLAnchorElement>) => void;
}

class NavBarComponent extends React.Component<NavBarProps> {
  constructor(props: NavBarProps) {
    super(props);
  }

  render() {
    const { selection, handleClick, handleSettingsClick } = this.props;

    return (
      <nav { ...CSS }>
        <NavLink
          className={ classNames('nav-link bot-explorer', { selected: selection === Constants.NAVBAR_BOT_EXPLORER }) }
          onClick={ evt => handleClick(evt, Constants.NAVBAR_BOT_EXPLORER) } title="Bot Explorer"/>
        <NavLink className={ classNames('nav-link services', { selected: selection === Constants.NAVBAR_SERVICES }) }
                 onClick={ evt => handleClick(evt, Constants.NAVBAR_SERVICES) } title="Services"/>
        <NavLink className={ classNames('nav-link bot-settings', { disabled: !this.props.activeBot }) }
                 onClick={ this.handleBotSettingsClick } title="Bot Settings"/>
        <NavLink className="nav-link settings" onClick={ handleSettingsClick } title="Settings" justifyEnd={ true }/>
        <InsetShadow right={ true }/>
      </nav>
    );
  }

  private handleBotSettingsClick = () => {
    if (this.props.activeBot) {
      CommandServiceImpl.call('bot-settings:open', this.props.activeBot);
    }
  }
}

const mapStateToProps = (state: RootState): NavBarProps => ({
  activeBot: state.bot.activeBot
});

const mapDispatchToProps = (dispatch, ownProps: NavBarProps): NavBarProps => ({
  handleSettingsClick: () => dispatch(EditorActions.open(
    Constants.CONTENT_TYPE_APP_SETTINGS,
    Constants.DOCUMENT_ID_APP_SETTINGS,
    true,
    null)),
  handleClick: (_evt: MouseEvent<HTMLAnchorElement>, selection: string) => {
    if (ownProps.selection === selection) {
      // toggle explorer when clicking the same navbar icon
      dispatch(ExplorerActions.show(!ownProps.showingExplorer));
    } else {
      // switch tabs and show explorer when clicking different navbar icon
      dispatch(() => {
        dispatch(NavBarActions.select(selection));
        dispatch(ExplorerActions.show(true));
      });
    }
  }
});

export const NavBar = connect(mapStateToProps, mapDispatchToProps)(NavBarComponent);
