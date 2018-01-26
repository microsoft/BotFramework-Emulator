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


const CSS = css({
    backgroundColor: Colors.NAVBAR_BACKGROUND_DARK,
    boxShadow: 'inset -4px 0px 8px -4px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    width: '50px',
    display: 'flex',
    flexDirection: 'column',

    '& > ul': {
        display: 'flex',
        flexDirection: 'column',
        listStyleType: 'none',
        margin: 0,
        padding: 0,

        '& > li': {
            backgroundColor: Colors.NAVBAR_FOREGROUND_DARK,
            cursor: 'pointer',
            height: '50px',
            opacity: 0.6,

            '&:hover': {
                opacity: 1
            }
        }
    },

    '& > ul.app': {
        marginBottom: 'auto',

        '& > .app': {
            mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M17.705 8H9s-2 .078-2 2v15s0 2 2 2l11-.004C22 27 22 25 22 25V13.509L17.705 8zM16 10v5h4v10H9V10h7zm5.509-6h-8.493S11 4.016 10.985 6H19v.454L22.931 11H24v12c2 0 2-1.995 2-1.995V9.648L21.509 4z' fill='%23fff'/%3E%3C/svg%3E\") no-repeat 50% 50%",
        },
        '& > .files': {
            mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M17.705 8H9s-2 .078-2 2v15s0 2 2 2l11-.004C22 27 22 25 22 25V13.509L17.705 8zM16 10v5h4v10H9V10h7zm5.509-6h-8.493S11 4.016 10.985 6H19v.454L22.931 11H24v12c2 0 2-1.995 2-1.995V9.648L21.509 4z' fill='%23fff'/%3E%3C/svg%3E\") no-repeat 50% 50%",
        },
        '& > .assets': {
            mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M17.705 8H9s-2 .078-2 2v15s0 2 2 2l11-.004C22 27 22 25 22 25V13.509L17.705 8zM16 10v5h4v10H9V10h7zm5.509-6h-8.493S11 4.016 10.985 6H19v.454L22.931 11H24v12c2 0 2-1.995 2-1.995V9.648L21.509 4z' fill='%23fff'/%3E%3C/svg%3E\") no-repeat 50% 50%",
        },
        '& > .services': {
            mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M17.705 8H9s-2 .078-2 2v15s0 2 2 2l11-.004C22 27 22 25 22 25V13.509L17.705 8zM16 10v5h4v10H9V10h7zm5.509-6h-8.493S11 4.016 10.985 6H19v.454L22.931 11H24v12c2 0 2-1.995 2-1.995V9.648L21.509 4z' fill='%23fff'/%3E%3C/svg%3E\") no-repeat 50% 50%",
        },
        '& > .analytics': {
            mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M17.705 8H9s-2 .078-2 2v15s0 2 2 2l11-.004C22 27 22 25 22 25V13.509L17.705 8zM16 10v5h4v10H9V10h7zm5.509-6h-8.493S11 4.016 10.985 6H19v.454L22.931 11H24v12c2 0 2-1.995 2-1.995V9.648L21.509 4z' fill='%23fff'/%3E%3C/svg%3E\") no-repeat 50% 50%",
        },
    },

    '& > ul.sys': {
        '& > .settings': {
            mask: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cg fill='%23424242'%3E%3Cpath d='M12.714 9.603c-.07.207-.15.407-.246.601l1.017 2.139a6.976 6.976 0 0 1-1.142 1.143l-2.14-1.018a4.797 4.797 0 0 1-.601.247l-.795 2.235c-.265.03-.534.05-.807.05-.272 0-.541-.02-.806-.05l-.795-2.235a4.874 4.874 0 0 1-.602-.247l-2.14 1.017a7.022 7.022 0 0 1-1.143-1.143l1.017-2.139a5.094 5.094 0 0 1-.245-.6L1.05 8.807C1.02 8.542 1 8.273 1 8s.02-.542.05-.807l2.236-.795c.07-.207.15-.407.246-.601L2.516 3.658a7.016 7.016 0 0 1 1.143-1.142l2.14 1.017c.193-.096.394-.176.602-.247l.793-2.236C7.459 1.02 7.728 1 8 1c.273 0 .542.02.808.05l.795 2.236c.207.07.407.15.601.246l2.14-1.017a6.97 6.97 0 0 1 1.142 1.142l-1.017 2.139c.096.194.176.394.246.601l2.236.795c.029.266.049.535.049.808s-.02.542-.05.807l-2.236.796zM8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'/%3E%3Ccircle cx='8' cy='8' r='1.5'/%3E%3C/g%3E%3C/svg%3E\") no-repeat 50% 50%",
            maskSize: '22px'
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
    }

    handleClick(selection) {
        this.props.dispatch(NavBarActions.selectOrToggle(selection));
    }

    render() {
        return (
            <nav className={ CSS }>
                <ul className="app">
                    <li role="button" className="files" title="Files" onClick={ this.handleFilesClick } />
                    <li role="button" className="assets" title="Assets" onClick={ this.handleAssetsClick } />
                    <li role="button" className="services" title="Services" onClick={ this.handleServicesClick } />
                    <li role="button" className="analytics" title="Analytics" onClick={ this.handleAnalyticsClick } />
                </ul>
                <ul className="sys">
                    <li role="button" className="settings" title="Settings" onClick={ this.handleSettingsClick } />
                </ul>
            </nav>
        );
    }
}

export default connect(state => ({ navBar: state.navBar }))(NavBar)
