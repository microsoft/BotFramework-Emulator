import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

export default class SplitterV2Pane extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        let style = { overflow: 'hidden' };
        style.flexShrink = 0;
        style.flexGrow = 1;
        style.flexBasis = this.props.size;
        style.boxSizing = 'border-box';

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
    size: PropTypes.number
}
