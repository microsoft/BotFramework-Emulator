import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

export default class SplitterV2Pane extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        let style = { overflow: 'hidden' };
        if (this.props.orientation === 'horizontal') {
            style.width = this.props.size + 'px'
        } else {
            style.height = this.props.size + 'px';
        }

        return (
            <div style={ style } >
                { this.props.children }
            </div>
        );
    }
}

SplitterV2Pane.propTypes = {
    orientation: PropTypes.oneOf([
        'horizontal',
        'vertical'
    ]).isRequired,
    size: PropTypes.number.isRequired
}
