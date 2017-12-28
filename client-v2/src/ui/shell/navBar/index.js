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
import ConnectivityBadge from '../../widget/connectivityBadge';
import * as constants from '../../../constants';
import * as NavBarActions from '../../../data/action/navBarActions';


const CSS = css({
    backgroundColor: 'Red',
    width: 40,

    '& > ul': {
        display: 'flex',
        flexDirection: 'column',
        listStyleType: 'none',
        margin: 0,
        padding: 0,

        '& > li': {
            height: 40,
            width: 40
        }
    }
});

class NavBar extends React.Component {
    handleClick(selection) {
        this.props.dispatch(NavBarActions.select(selection));
    }

    render() {
        return (
            <nav className={ CSS }>
                <ul>
                    <li onClick={() => this.handleClick(constants.NavBar_Bots) }>
                        <Button>Bots</Button>
                    </li>
                    <li onClick={() => this.handleClick(constants.NavBar_Assets) }>
                        <Button>Assets</Button>
                    </li>
                </ul>
                <ConnectivityBadge />
            </nav>
        );
    }
}

export default connect(state => ({ navBar: state.navBar }))(NavBar)
