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

import { Colors, InsetShadow } from '@bfemulator/ui-react';
import * as Constants from '../../../constants';
import * as NavBarActions from '../../../data/action/navBarActions';
import * as EditorActions from '../../../data/action/editorActions';
import * as ExplorerActions from '../../../data/action/explorerActions';
import { CommandRegistry } from '../../../commands';
import { IRootState } from '../../../data/store';
import { IBotConfig } from 'msbot/bin/schema';
import { CommandService } from '../../../platform/commands/commandService';

const CSS = css({
  backgroundColor: Colors.NAVBAR_BACKGROUND_DARK,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  width: '50px',

  '& > a.nav-link': {
    display: 'inline-block',
    width: '50px',
    height: '50px',
    boxSizing: 'border-box',
    backgroundSize: '25px',
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    opacity: 0.6,

    '&:hover, &.selected': {
      opacity: 1
    },

    '&.disabled': {
      opacity: 0.6
    },

    // TODO: Add focus state
    // https://github.com/Microsoft/BotFramework-Emulator/issues/571

    '&.bot-explorer': {
      backgroundImage: 'url(./external/media/ic_bot_explorer.svg)'
    },

    '&.services': {
      backgroundImage: 'url(./external/media/ic_services.svg)'
    },

    '&.bot-settings': {
      backgroundImage: 'url(./external/media/ic_bot_settings.svg)'
    },

    '&.settings': {
      marginTop: 'auto',
      backgroundImage: 'url(./external/media/ic_settings.svg)'
    }
  }
});

export interface NavBarProps {
  activeBot?: IBotConfig;
  selection?: string;
  explorerShowing?: boolean;
  handleClick?: (evt, selection: string) => void;
  handleSettingsClick?: (evt) => void;
}

class NavBar extends React.Component<NavBarProps, {}> {
  constructor(props: NavBarProps) {
    super(props);
  }

  private handleBotSettingsClick = () => {
    if (this.props.activeBot) {
      CommandService.call('bot-settings:open', this.props.activeBot);
    }
  }

  render() {
    const { selection, handleClick, handleSettingsClick } = this.props;

    return (
      <nav { ...CSS }>
        <a className={ classNames('nav-link bot-explorer', { selected: selection === Constants.NavBar_Bot_Explorer }) } onClick={ evt => handleClick(evt, Constants.NavBar_Bot_Explorer) } href="javascript:void(0);" title="Bot Explorer"></a>
        <a className={ classNames('nav-link services', { selected: selection === Constants.NavBar_Services }) } onClick={ evt => handleClick(evt, Constants.NavBar_Services) } href="javascript:void(0);" title="Services"></a>
        <a className={ classNames('nav-link bot-settings', { disabled: !this.props.activeBot }) } onClick={ this.handleBotSettingsClick } href="javascript:void(0);" title="Bot Settings"></a>
        <a className="nav-link settings" onClick={ handleSettingsClick } href="javascript:void(0);" title="Settings"></a>
        <InsetShadow right={ true } />
      </nav>
    );
  }
}

const mapStateToProps = (state: IRootState): NavBarProps => ({
  activeBot: state.bot.activeBot,
  selection: state.navBar.selection,
  explorerShowing: state.explorer.showing
});

const mapDispatchToProps = (dispatch, ownProps: NavBarProps): NavBarProps => ({
  handleSettingsClick: (evt) => dispatch(EditorActions.open(Constants.ContentType_AppSettings, Constants.DocumentId_AppSettings, true, null)),
  handleClick: (evt, selection: string) => {
    if (ownProps.selection === selection) {
      // toggle explorer when clicking the same navbar icon
      dispatch(ExplorerActions.show(!ownProps.explorerShowing));
    } else {
      // switch tabs and show explorer when clicking different navbar icon
      dispatch(() => {
        dispatch(NavBarActions.select(selection));
        dispatch(ExplorerActions.show(true));
      });
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
