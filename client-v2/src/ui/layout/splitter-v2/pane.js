import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

export default class SplitterV2Pane extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const style = {
            overflow: 'hidden',
            flexShrink: 0,
            flexGrow: 1,
            flexBasis: this.props.size,
            boxSizing: 'border-box'
        };

        if (this.props.orientation === 'horizontal') {
            style.maxWidth = '100%';
            style.left = 0;
            style.right = 0;
        } else {
            style.maxHeight = '100%';
            style.top = 0;
            style.bottom = 0;
        }

        return (
            <div className={ 'splitter-pane' } style={ style } >
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
    size: PropTypes.string
}
