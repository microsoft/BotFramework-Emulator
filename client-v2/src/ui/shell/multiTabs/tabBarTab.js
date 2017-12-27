import { css } from 'glamor';
import React from 'react';

const CSS = css({
    height: '100%'
});

export default props =>
    <button
        className={ CSS }
        onClick={ props.onClick }
        type="button"
    >
        { props.children }
    </button>
