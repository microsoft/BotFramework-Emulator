import { css }    from 'glamor';
import classNames from 'classnames';
import PropTypes  from 'prop-types';
import React      from 'react';

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

export default props =>
    <div className={ TREE_CSS }>
        <ul className={ BRANCH_CSS }>
            { React.Children.map(props.children, child => branchOrLeaf(child) && child) }
        </ul>
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
                    { React.Children.map(this.props.children, child => child.type === Content && child) }
                </button>
                {
                    this.state.expanded
                    && React.Children.toArray(this.props.children).some(child => branchOrLeaf(child))
                    &&
                        <ul className={ BRANCH_CSS }>
                            {
                                React.Children.map(
                                    this.props.children,
                                    child => branchOrLeaf(child) && React.cloneElement(child, { depth: this.props.depth + 1 })
                                )
                            }
                        </ul>
                }
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

export const Content = props => props.children;

function branchOrLeaf(instance) {
    return instance.type === Branch || instance.type === Leaf;
}
