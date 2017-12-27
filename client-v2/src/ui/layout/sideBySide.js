import { css } from 'glamor';
import React from 'react';

const CSS = css({
    display: 'flex',

    '& > div:not(:last-child)': {
        marginRight: 20
    }
});

export default props =>
    <div className={ CSS }>
        {
            React.Children.map(props.children, child =>
                <div>
                    { child }
                </div>
            )
        }
    </div>
