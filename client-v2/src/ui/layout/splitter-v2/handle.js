import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

export default class SplitterV2Handle extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    componentWillMount() {
    }

    render() {
        let handleStyle = {
            backgroundColor: 'black',
        };
        if (this.props.orientation === 'horizontal') {
            handleStyle.width = '100%';
            handleStyle.height = '10px';
            handleStyle.cursor = 'ns-resize';
        } else {
            handleStyle.width = '10px';
            handleStyle.height = '100%';
            handleStyle.cursor = 'ew-resize';
        }

        return (
            <div style={ handleStyle } onMouseDown={ this.props.onMouseDown } />
        );
    }
}

SplitterV2Handle.propTypes = {
    onMouseDown: PropTypes.func,
    orientation: PropTypes.oneOf([
        'horizontal',
        'vertical'
    ]).isRequired
}
