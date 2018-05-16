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
import React from 'react';

import { Colors, InsetShadow } from '@bfemulator/ui-react';
import * as Constants from '../../../constants';
import * as NavBarActions from '../../../data/action/navBarActions';
import * as EditorActions from '../../../data/action/editorActions';
import * as ExplorerActions from '../../../data/action/explorerActions';

const CSS = css({
  backgroundColor: Colors.NAVBAR_BACKGROUND_DARK,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  width: 48,

  '& > ul': {
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& > li': {
      backgroundColor: 'Transparent',
      cursor: 'pointer',
      height: 48,
      transition: 'background-color .1s ease-out',

      '& > div': {
        height: '100%',
        width: '100%',

        '&:hover': {
          // TODO: Don't use !important
          backgroundColor: 'rgba(0, 0, 0, .15) !important'
        }
      },

      '&.app > div': {
        backgroundColor: 'initial !important'
      },

      '& > div.selected': {
        // TODO: Don't use !important
        backgroundColor: 'rgba(0, 0, 0, .15) !important'
      }
    }
  },

  // TODO: We should use WOFF and not need backgroundSize here
  '& > ul > li > div': {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50% 50%',
    backgroundSize: 24
  },

  '& > ul.app': {
    marginBottom: 'auto',

    '& > li.app > div': {
      backgroundImage: 'url(./external/media/ic_bot_framework.svg)',
      backgroundSize: 26,
      cursor: 'default'
    },

    '& > li.bot-explorer > div': {
      backgroundImage: 'url(./external/media/ic_chat.svg)'
    },

    '& > li.assets > div': {
      backgroundImage: 'url(./external/media/ic_assets.svg)'
    },

    '& > li.services > div': {
      backgroundImage: 'url(./external/media/ic_services.svg)'
    },

    '& > li.analytics > div': {
      backgroundImage: 'url(./external/media/ic_analytics.svg)'
    }
  },

  '& > ul.sys': {
    '& > li.settings > div': {
      backgroundImage: 'url(./external/media/ic_settings.svg)'
    },

    '& > li.notifications > div': {
      backgroundImage: 'url(./external/media/ic_notification.svg)',
      backgroundSize: 22
    },

    '& > li.user > div': {
      backgroundImage: 'url(./external/media/ic_user.svg)'
    }
  }
});

class NavBar extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleFilesClick = this.handleClick.bind(this, Constants.NavBar_Bot_Explorer);
    this.handleServicesClick = this.handleClick.bind(this, Constants.NavBar_Services);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
  }

  handleClick(selection) {
    if (this.props.selection === selection) {
      // toggle explorer when clicking the same navbar icon
      this.props.dispatch(ExplorerActions.show(!this.props.explorerShowing));
    } else {
      // switch tabs and show explorer when clicking different navbar icon
      this.props.dispatch(() => {
        this.props.dispatch(NavBarActions.select(selection));
        this.props.dispatch(ExplorerActions.show(true));
      });
    }
  }

  handleSettingsClick(e) {
    this.props.dispatch(EditorActions.open(Constants.ContentType_AppSettings, Constants.DocumentId_AppSettings, true, null));
  }

  render() {
    const { selection } = this.props;

    // TODO: Don't use onClick on <li>, if it is a button, make it a <button>
    return (
      <nav className={CSS}>
        <ul className="app">
          <li role="button" className="bot-explorer" onClick={this.handleFilesClick} title="Bot Explorer">
            <div className={classNames({ selected: selection === Constants.NavBar_Bot_Explorer })}/>
          </li>
          <li role="button" className="services" onClick={this.handleServicesClick} title="Services">
            <div className={classNames({ selected: selection === Constants.NavBar_Services })}/>
          </li>
        </ul>
        <ul className="sys">
          <li role="button" className="settings" onClick={this.handleSettingsClick} title="Settings">
            <div className={classNames({ selected: selection === Constants.NavBar_Settings })}/>
          </li>
        </ul>
        <InsetShadow right={true}/>
      </nav>
    );
  }
}

export default connect(state => ({
  selection: state.navBar.selection,
  explorerShowing: state.explorer.showing
}))(NavBar)
