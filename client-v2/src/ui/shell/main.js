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
import React from 'react';
import ExplorerBar from './explorer';
import MDI from './mdi';
import NavBar from './navBar';
import Splitter from '../layout/splitter';
import Splitter2 from '../layout/splitter-v2';

css.global('html, body, #root', {
    height: '100%',
    margin: 0,
    minHeight: '100%',
    overflow: 'hidden'
});

const CSS1 = css({
    backgroundColor: 'floralwhite',
    height: '100%',
    width: '100%'
})

const CSS = css({
    backgroundColor: 'yellow',
    display: 'flex',
    minHeight: '100%'
});

const SECOND_CSS = css({
    backgroundColor: 'lightgreen',
    display: 'flex',
    flex: 1
})

export default class Main extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleTabChange = this.handleTabChange.bind(this);

        this.state = {
            tabValue: 0
        };
    }

    handleTabChange(nextTabValue) {
        this.setState(() => ({ tabValue: nextTabValue }));
    }

    render() {
        const old = (<div className={ CSS }>
            <NavBar />
            <div { ...SECOND_CSS }>
                <Splitter primaryIndex={ 1 } secondaryInitialSize={ 300 }>
                    <ExplorerBar />
                    <MDI />
                </Splitter>
            </div>
        </div>);


        return (
            <div className={ CSS1 }>
                <Splitter2 orientation={ 'horizontal' }>
                    <div style={{backgroundColor: 'skyblue', height: '100%', padding: '24px'}}>Div1</div>
                    <div style={{backgroundColor: 'coral', height: '100%', padding: '24px'}}>Div2</div>
                </Splitter2>
            </div>
        );
    }
}
