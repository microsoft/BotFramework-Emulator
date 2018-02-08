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
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import expandFlatTree from '../utils/expandFlatTree';

const TREE_CSS = css({
    display: 'flex',
    flexDirection: 'column'
});

const BRANCH_CSS = css({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0
});

const BRANCH_COLLAPSED_CSS = css(BRANCH_CSS, { display: 'none' });

const LEAF_CSS = css({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',

    '& > button': {
        backgroundColor: 'transparent',
        border: 0,
        cursor: 'pointer',
        flex: 1,
        paddingBottom: 5,
        paddingTop: 5,
        textAlign: 'left',

        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, .2)'
        }
    }
});

const DEPTH_INDENT_PIXEL = 10;

const NodeList = props =>
    <ul className={ props.collapsed ? BRANCH_COLLAPSED_CSS : BRANCH_CSS }>
        { React.Children.map(props.children, child => child.type === Branch && React.cloneElement(child, { depth: props.depth })) }
        { React.Children.map(props.children, child => child.type === Leaf && React.cloneElement(child, { depth: props.depth })) }
        { renderFlatNodes(props.children, props.depth) }
    </ul>

NodeList.defaultProps = {
    depth: 0
};

NodeList.propTypes = {
    collapsed: PropTypes.bool,
    depth: PropTypes.number
};

export default props =>
    <div className={ TREE_CSS }>
        <NodeList depth={ 0 }>{ props.children }</NodeList>
    </div>;

export class Branch extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            expanded: typeof props.initialExpanded === 'undefined' || props.initialExpanded
        };
    }

    handleClick() {
        this.setState(state => ({ expanded: !state.expanded }));
    }

    render() {
        return (
            <li
                aria-expanded={ this.state.expanded }
                className={ LEAF_CSS }
            >
                <button
                    className={ css({ paddingLeft: this.props.depth * DEPTH_INDENT_PIXEL }) }
                    onClick={ this.handleClick }
                    type="button"
                >
                    { this.state.expanded ? '➖' : '➕' }&nbsp;
                    { React.Children.map(this.props.children, child => child && child.type === Content && child) }
                </button>
                <NodeList
                    collapsed={ !this.state.expanded }
                    depth={ this.props.depth + 1 }
                >
                    { this.props.children }
                </NodeList>
            </li>
        );
    }
}

Branch.defaultProps = {
    depth: 0
};

Branch.propTypes = {
    depth: PropTypes.number,
    initialExpanded: PropTypes.bool
};

export const Leaf = props =>
    <li className={ LEAF_CSS }>
        <button
            className={ css({ paddingLeft: props.depth * DEPTH_INDENT_PIXEL }) }
            onClick={ props.onClick }
            type="button"
        >
            { React.Children.map(props.children, child => child.type === Content && child) }
        </button>
    </li>;

Leaf.defaultProps = {
    depth: 0
};

Leaf.propTypes = {
    depth: PropTypes.number
};

export const FlatNode = props => props.children;

FlatNode.defaultProps = {
    depth: 0
};

FlatNode.propTypes = {
    depth: PropTypes.number,
    onClick: PropTypes.func
};

export const Content = props => props.children;

function branchOrLeaf(instance) {
    return instance.type === Branch || instance.type === Leaf;
}

function renderFlatNodes(children, baseDepth) {
    const nodes = React.Children.toArray(children)
        .filter(child => child.type === FlatNode)
        .reduce((map, child) => {
            map[child.props.path] = child;

            return map;
        }, {});
    const expanded = expandFlatTree(Object.keys(nodes));
    const walk = (expanded, depth) => Object.keys(expanded).map(segment => {
        const subtree = expanded[segment];

        return (
            typeof subtree === 'string' ?
                <Leaf
                    depth={ depth }
                    key={ segment }
                    onClick={ nodes[subtree].props.onClick }
                >
                    <Content>{ nodes[subtree] }</Content>
                </Leaf>
            :
                <Branch
                    depth={ depth }
                    key={ segment }
                >
                    <Content>{ segment }</Content>
                    { walk(subtree, depth + 1) }
                </Branch>
        );
    });

    return walk(expanded, baseDepth);
}
