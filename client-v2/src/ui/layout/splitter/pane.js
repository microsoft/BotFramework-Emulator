// This is an inlined version of the react-splitter-layout npm package

import React from 'react';
import PropTypes from 'prop-types';

export default class Pane extends React.Component {
    render() {
        const size = this.props.size || 0;
        const unit = this.props.percentage ? '%' : 'px';
        let classes = 'layout-pane';
        const style = {};
        if (!this.props.primary) {
            if (this.props.vertical) {
                style.height = `${size}${unit}`;
            } else {
                style.width = `${size}${unit}`;
            }
        } else {
            classes += ' layout-pane-primary';
        } return (
            <div className={classes} style={style}>{this.props.children}</div>
        );
    }
}

Pane.propTypes = {
    vertical: PropTypes.bool,
    primary: PropTypes.bool,
    size: PropTypes.number,
    percentage: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};

Pane.defaultProps = {
    vertical: false,
    primary: false,
    size: 0,
    percentage: false,
    children: []
};
