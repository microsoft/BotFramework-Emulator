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
import React from 'react';
import { connect } from 'react-redux';

import Button from './button';
import * as Colors from '../../styles/colors';
import * as constants from '../../../constants';
import * as NavBarActions from '../../../data/action/navBarActions';
import { CommandRegistry } from 'botframework-emulator-shared';


const CSS = css({
  backgroundColor: Colors.NAVBAR_BACKGROUND_DARK,
  boxShadow: 'inset -4px 0px 8px -4px rgba(0,0,0,0.6)',
  overflow: 'hidden',
  width: '48px',
  display: 'flex',
  flexDirection: 'column',

  '& > ul': {
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& > li': {
      backgroundColor: 'rgba(0,0,0,0)',
      transition: 'background-color 0.1s ease-out',
      cursor: 'pointer',
      height: '48px',

      '& > div': {
        height: '100%',
        width: '100%',

        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.15) !important',
        },
      },
      '& > div.selected': {
        backgroundColor: 'rgba(0,0,0,0.15) !important',
      }
    },
  },

  '& > ul.app': {
    marginBottom: 'auto',

    '& > li.app > div': {
      background: "url('./external/media/ic_bot_framework.svg') no-repeat 50% 50%",
      backgroundSize: '26px',
    },
    '& > li.files > div': {
      background: "url('./external/media/ic_files.svg') no-repeat 50% 50%",
      backgroundSize: '24px',
    },
    '& > li.assets > div': {
      background: "url('./external/media/ic_assets.svg') no-repeat 50% 50%",
      backgroundSize: '24px',
    },
    '& > li.services > div': {
      background: "url('./external/media/ic_services.svg') no-repeat 50% 50%",
      backgroundSize: '24px',
    },
    '& > li.analytics > div': {
      background: "url('./external/media/ic_analytics.svg') no-repeat 50% 50%",
      backgroundSize: '24px',
    },
  },

  '& > ul.sys': {
    '& > li.settings > div': {
      background: "url('./external/media/ic_settings.svg') no-repeat 50% 50%",
      backgroundSize: '24px'
    },
    '& > li.notifications > div': {
      background: "url('./external/media/ic_notification.svg') no-repeat 50% 50%",
      backgroundSize: '22px'
    },
    '& > li.user > div': {
      background: "url('./external/media/ic_user.svg') no-repeat 50% 50%",
      backgroundSize: '24px'
    },
  }
});

class NavBar extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.handleAppClick = this.handleClick.bind(this, constants.NavBar_App);
    this.handleFilesClick = this.handleClick.bind(this, constants.NavBar_Files);
    this.handleAssetsClick = this.handleClick.bind(this, constants.NavBar_Assets);
    this.handleServicesClick = this.handleClick.bind(this, constants.NavBar_Services);
    this.handleAnalyticsClick = this.handleClick.bind(this, constants.NavBar_Analytics);
    this.handleSettingsClick = this.handleClick.bind(this, constants.NavBar_Settings);
    this.handleNotificationsClick = this.handleClick.bind(this, constants.NavBar_Notifications);
    this.handleUserClick = this.handleClick.bind(this, constants.NavBar_User);
  }

  componentWillMount() {
    this._switchTabCommandHandler = CommandRegistry.registerCommand('navbar:switchtab', (context, tabName) => {
      this.props.dispatch(NavBarActions.selectOrToggle(tabName));
    });
  }

  componentWillUnmount() {
    if (this._switchTabCommandHandler) {
      this._switchTabCommandHandler.dispose();
    }
  }

  handleClick(selection) {
    this.props.dispatch(NavBarActions.selectOrToggle(selection));
  }

  selectionClass(entry) {
    return (entry === this.props.navBar.selection) ? "selected" : "";
  }

  render() {
    return (
      <nav className={CSS}>
        <ul className="app">
          <li role="button" className="app" title="App" onClick={this.handleAppClick}><div className={this.selectionClass(constants.NavBar_App)} /></li>
          <li role="button" className="files" title="Files" onClick={this.handleFilesClick}><div className={this.selectionClass(constants.NavBar_Files)} /></li>
          <li role="button" className="analytics" title="Analytics" onClick={this.handleAnalyticsClick}><div className={this.selectionClass(constants.NavBar_Analytics)} /></li>
        </ul>
        <ul className="sys">
          <li role="button" className="settings" title="Settings" onClick={this.handleSettingsClick}><div className={this.selectionClass(constants.NavBar_Settings)} /></li>
          <li role="button" className="notifications" title="Notifications" onClick={this.handleNotificationsClick}><div className={this.selectionClass(constants.NavBar_Notifications)} /></li>
          <li role="button" className="user" title="User" onClick={this.handleUserClick}><div className={this.selectionClass(constants.NavBar_User)} /></li>
        </ul>
      </nav>
    );
  }
}

export default connect(state => ({ navBar: state.navBar }))(NavBar)
