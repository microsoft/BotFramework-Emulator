import { css } from 'glamor';
import React from 'react';

import Button from './Button';
import ConnectivityBadge from '../../Widget/ConnectivityBadge';

const CSS = css({
    backgroundColor: 'Red',
    width: 40,

    '& > ul': {
        display: 'flex',
        flexDirection: 'column',
        listStyleType: 'none',
        margin: 0,
        padding: 0,

        '& > li': {
            height: 40,
            width: 40
        }
    }
});

export default class NavBar extends React.Component {
    render() {
        return (
            <nav className={ CSS }>
                <ul>
                    <li>
                        <Button>Bots</Button>
                    </li>
                    <li>
                        <Button>Assets</Button>
                    </li>
                </ul>
                <ConnectivityBadge />
            </nav>
        );
    }
}
