// This is an inlined version of the react-splitter-layout npm package

import React from 'react';
import PropTypes from 'prop-types';

import Pane from './pane';


function clearSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {
        document.selection.empty();
    }
}

const DEFAULT_SPLITTER_SIZE = 4;


export default class Splitter extends React.Component {
    constructor(props) {
        super(props);
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleSplitterMouseDown = this.handleSplitterMouseDown.bind(this);
        this.state = {
            secondaryPaneSize: 0,
            resizing: false
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);

        let secondaryPaneSize;
        if (typeof this.props.secondaryInitialSize !== 'undefined') {
            secondaryPaneSize = this.props.secondaryInitialSize;
        } else {
            const containerRect = this.container.getBoundingClientRect();
            let splitterRect;
            if (this.splitter) {
                splitterRect = this.splitter.getBoundingClientRect();
            } else {
                // Simulate a splitter
                splitterRect = { width: DEFAULT_SPLITTER_SIZE, height: DEFAULT_SPLITTER_SIZE };
            }
            secondaryPaneSize = this.getSecondaryPaneSize(containerRect, splitterRect, {
                left: containerRect.left + ((containerRect.width - splitterRect.width) / 2),
                top: containerRect.top + ((containerRect.height - splitterRect.height) / 2)
            }, false);
        }
        this.setState({ secondaryPaneSize });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.secondaryPaneSize !== this.state.secondaryPaneSize && this.props.onSecondaryPaneSizeChange) {
            this.props.onSecondaryPaneSizeChange(this.state.secondaryPaneSize);
        }
        if (prevState.resizing !== this.state.resizing) {
            if (this.state.resizing) {
                if (this.props.onDragStart) {
                    this.props.onDragStart();
                }
            } else if (this.props.onDragEnd) {
                this.props.onDragEnd();
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    getSecondaryPaneSize(containerRect, splitterRect, clientPosition, offsetMouse) {
        let totalSize;
        let splitterSize;
        let offset;
        if (this.props.vertical) {
            totalSize = containerRect.height;
            splitterSize = splitterRect.height;
            offset = clientPosition.top - containerRect.top;
        } else {
            totalSize = containerRect.width;
            splitterSize = splitterRect.width;
            offset = clientPosition.left - containerRect.left;
        }
        if (offsetMouse) {
            offset -= splitterSize / 2;
        }
        if (offset < 0) {
            offset = 0;
        } else if (offset > totalSize - splitterSize) {
            offset = totalSize - splitterSize;
        }

        let secondaryPaneSize;
        if (this.props.primaryIndex === 1) {
            secondaryPaneSize = offset;
        } else {
            secondaryPaneSize = totalSize - splitterSize - offset;
        }
        let primaryPaneSize = totalSize - splitterSize - secondaryPaneSize;
        if (this.props.percentage) {
            secondaryPaneSize = (secondaryPaneSize * 100) / totalSize;
            primaryPaneSize = (primaryPaneSize * 100) / totalSize;
            splitterSize = (splitterSize * 100) / totalSize;
            totalSize = 100;
        }

        if (primaryPaneSize < this.props.primaryMinSize) {
            secondaryPaneSize = Math.max(secondaryPaneSize - (this.props.primaryMinSize - primaryPaneSize), 0);
        } else if (secondaryPaneSize < this.props.secondaryMinSize) {
            secondaryPaneSize = Math.min(totalSize - splitterSize - this.props.primaryMinSize, this.props.secondaryMinSize);
        }

        return secondaryPaneSize;
    }

    handleResize() {
        if (this.splitter && !this.props.percentage) {
            const containerRect = this.container.getBoundingClientRect();
            const splitterRect = this.splitter.getBoundingClientRect();
            const secondaryPaneSize = this.getSecondaryPaneSize(containerRect, splitterRect, {
                left: splitterRect.left,
                top: splitterRect.top
            }, false);
            this.setState({ secondaryPaneSize });
        }
    }

    handleMouseMove(e) {
        if (this.state.resizing) {
            const containerRect = this.container.getBoundingClientRect();
            const splitterRect = this.splitter.getBoundingClientRect();
            const secondaryPaneSize = this.getSecondaryPaneSize(containerRect, splitterRect, {
                left: e.clientX,
                top: e.clientY
            }, true);
            clearSelection();
            this.setState({ secondaryPaneSize });
        }
    }

    handleSplitterMouseDown() {
        clearSelection();
        this.setState({ resizing: true });
    }

    handleMouseUp() {
        this.setState({ resizing: false });
    }

    render() {
        let containerClasses = 'splitter-layout';
        if (this.props.customClassName) {
            containerClasses += ` ${this.props.customClassName}`;
        }
        if (this.props.vertical) {
            containerClasses += ' splitter-layout-vertical';
        }
        if (this.state.resizing) {
            containerClasses += ' layout-changing';
        }

        const children = React.Children.toArray(this.props.children).slice(0, 2);
        if (children.length === 0) {
            children.push(<div />);
        }
        const wrappedChildren = [];
        const primaryIndex = (this.props.primaryIndex !== 0 && this.props.primaryIndex !== 1) ? 0 : this.props.primaryIndex;
        for (let i = 0; i < children.length; ++i) {
            let primary = true;
            let size = null;
            if (children.length > 1 && i !== primaryIndex) {
                primary = false;
                size = this.state.secondaryPaneSize;
            }
            wrappedChildren.push(
                <Pane vertical={this.props.vertical} percentage={this.props.percentage} primary={primary} size={size}>
                    {children[i]}
                </Pane>
            );
        }

        return (
            <div className={containerClasses} ref={(c) => { this.container = c; }}>
                {wrappedChildren[0]}
                {wrappedChildren.length > 1 &&
                    <div
                        role="separator"
                        className="layout-splitter"
                        ref={(c) => { this.splitter = c; }}
                        onMouseDown={this.handleSplitterMouseDown}
                    />
                }
                {wrappedChildren.length > 1 && wrappedChildren[1]}
            </div>
        );
    }
}

Splitter.propTypes = {
    vertical: PropTypes.bool,
    percentage: PropTypes.bool,
    primaryIndex: PropTypes.number,
    primaryMinSize: PropTypes.number,
    secondaryInitialSize: PropTypes.number,
    secondaryMinSize: PropTypes.number,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onSecondaryPaneSizeChange: PropTypes.func,
    children: PropTypes.arrayOf(PropTypes.node)
};

Splitter.defaultProps = {
    vertical: false,
    percentage: false,
    primaryIndex: 0,
    primaryMinSize: 0,
    secondaryInitialSize: undefined,
    secondaryMinSize: 0,
    onDragStart: null,
    onDragEnd: null,
    onSecondaryPaneSizeChange: null,
    children: []
};
