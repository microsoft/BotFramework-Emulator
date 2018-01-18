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
