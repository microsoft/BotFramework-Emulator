import { css } from 'glamor';
import React from 'react';

import ExpandCollapse from '../layout/expandCollapse';

const CSS = css({
    backgroundColor: 'Pink',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    width: 200
});

const BOTS_CSS = css({
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0
});

export default props =>
    <ul className={ CSS }>
        <li>
            <ExpandCollapse
                initialExpanded={ true }
                title="Adaptive Cards"
            >
                <ul className={ BOTS_CSS }>
                    <li>Greeting</li>
                    <li>Address input</li>
                </ul>
            </ExpandCollapse>
        </li>
    </ul>
