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

import BotExplorer from './botExplorer';
import CardExplorer from './cardExplorer';
import LuisExplorer from './luisExplorer';
import FormExplorer from './formExplorer';
import ConversationExplorer from './conversationExplorer';
import ExplorerSet from './explorerSet';

import * as constants from '../../../constants';


class ExplorerBar extends React.Component {
    render() {
        if (this.props.navBar.selection === constants.NavBar_Bots) {
            return (
                <ExplorerSet title="Emulator">
                    <BotExplorer />
                </ExplorerSet>
            );
        } else if (this.props.navBar.selection === constants.NavBar_Assets) {
            return (
                <ExplorerSet title="Assets">
                    <CardExplorer />
                    <LuisExplorer />
                    <FormExplorer />
                    <ConversationExplorer />
                </ExplorerSet>
            );
        }
        return false;
    }
}

export default connect(state => ({ navBar: state.navBar }))(ExplorerBar)
