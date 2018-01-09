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
import PropTypes from 'prop-types';
import React from 'react';

import { filterChildren } from '../utils';

const CSS = css({
    '> header': {
        backgroundColor: 'hotpink',
        display: 'flex',
        lineHeight: '30px',

        '> .content': {
            flex: 1
        },

        '> .accessories': {
            margin: '0 0 0 auto'
        }
    }
});

export default class ExpandCollapse extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleTitleClick = this.handleTitleClick.bind(this);

        this.state = {
            expanded: props.initialExpanded
        };
    }

    handleTitleClick() {
        this.setState(state => ({ expanded: !state.expanded }));
    }

    render() {
        // TODO: Consider <input type="checkbox"> instead of <div />
        return (
            <div aria-expanded={ this.state.expanded } className={ CSS }>
                <header>
                    <div className="content" onClick={ this.handleTitleClick }>
                        { this.state.expanded ? '▽' : '▷' }&nbsp;
                        { this.props.title }
                    </div>
                    <div className="accessories">
                        { filterChildren(this.props.children, child => child.type === Controls) }
                    </div>
                </header>
                {
                    this.state.expanded &&
                        <section>
                            { filterChildren(this.props.children, child => child.type === Content) }
                        </section>
                }
            </div>
        );
    }
}

ExpandCollapse.defaultProps = {
    initialExpanded: false
};

ExpandCollapse.propTypes = {
    initialExpanded: PropTypes.bool
};

export const Controls = props => props.children;
export const Content = props => props.children;
