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

import * as Colors from '../../colors/colors';

const CSS = css({
    backgroundColor: Colors.EXPLORER_BACKGROUND_DARK,
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    height: '100%'
});

const HEADER_CSS = css({
    lineHeight: '30px',
    color: Colors.EXPLORER_FOREGROUND_DARK,
    paddingLeft: 16,
    textTransform: 'uppercase',
    fontFamily: '\'Segoe UI\', \'Helvetica Neue\', \'Arial\', \'sans-serif\''
})

const EXPLORER_CSS = css({
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& > li': {
        display: 'flex',
        flexDirection: 'column'
    },

    '& > li:last-child': {
        flex: 1
    }
});

export default class ExplorerSet extends React.Component {
    render() {
        return (
            <div className={ CSS }>
                <div className={ HEADER_CSS }>
                    { this.props.title }
                </div>
                <ul className={ EXPLORER_CSS }>
                    {
                        React.Children.map(this.props.children, child =>
                            <li>{ child }</li>
                        )
                    }
                </ul>
            </div>
        );
    }
}
