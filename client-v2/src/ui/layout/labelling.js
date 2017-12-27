import { css } from 'glamor';
import React from 'react';

const CSS = css({
    '& > small': {
        display: 'block'
    }
});

export default props =>
    <div className={ CSS }>
        <small>{ props.title }</small>
        <div>{ props.children }</div>
    </div>
