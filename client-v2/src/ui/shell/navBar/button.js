import { css } from 'glamor';
import React from 'react';

const CSS = css({
    height: 40,
    overflow: 'hidden',
    width: 40
});

export default class Button extends React.Component {
    render() {
        return (
            <button className={ CSS }>
                { this.props.children }
            </button>
        );
    }
}
