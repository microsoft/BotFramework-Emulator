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

import ConnectivityBadge from '../widget/connectivityBadge';
import { expandFlatTree, treeViewFactory } from '../utils';

const CSS = css({});

class TestBedEditor extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleTreeNodeSelected = this.handleTreeNodeSelected.bind(this);

        this.state = {
            selectedTreeNodePath: null
        };
    }

    handleTreeNodeSelected(nextSelectedTreeNodePath) {
        this.setState(() => ({ selectedTreeNodePath: nextSelectedTreeNodePath }));
    }

    render() {
        return (
            <div className={ CSS }>
                <h1>Testbed</h1>
                <ConnectivityBadge />
                <header>
                    <h2>Tree view</h2>
                </header>
                <section>
                    {
                        treeViewFactory(
                            this.props.assetExplorer.files,
                            this.handleTreeNodeSelected,
                            (file, path) =>
                                <span>
                                    📝{ path.split('/').pop() }&nbsp;{ this.state.selectedTreeNodePath === path ? '✔' : '' }
                                    <br />
                                    <small>({ file.size } bytes, under /{ path.split('/').slice(0, -1).join('/') })</small>
                                </span>,
                            path => path.split('/').pop()
                        )
                    }
                </section>
                <header>
                    <h2>Raw store</h2>
                </header>
                <section>
                    <pre>{ JSON.stringify({ ...this.props, children: undefined }, null, 2) }</pre>
                </section>
            </div>
        );
    }
}

export default connect(state => state)(TestBedEditor)
