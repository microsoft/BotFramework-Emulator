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

import * as ServerActions from '../../data/action/serverActions';

const CSS = css({
});

const CONNECTED_CSS = css({
    backgroundColor: 'Green',
    color: 'White'
});

const DISCONNECTED_CSS = css({
    backgroundColor: 'Red',
    color: 'White'
});

class ConnectivityBadge extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.dispatch(ServerActions.ping());
    }

    render() {
        const { connectedHost, connectedVersion } = this.props;

        return (
            <button
                className={ classNames(CSS + '', {
                    [CONNECTED_CSS]: connectedVersion,
                    [DISCONNECTED_CSS]: connectedVersion === false
                }) }
                disabled={ !connectedVersion && connectedVersion !== false }
                onClick={ this.handleClick }
                type="button"
            >
                {
                    connectedVersion ?
                        `Connected to ${ connectedVersion } (${ connectedHost })`
                    : connectedVersion === false ?
                        'Not connected'
                    :
                        'Checking'
                }
            </button>
        );
    }
}

export default connect(state => ({
    connectedHost: state.server.get('connected') && state.server.get('host'),
    connectedVersion: state.server.get('connected') && state.server.get('version')
}))(ConnectivityBadge)
