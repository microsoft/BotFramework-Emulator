import React from 'react';
import { css } from 'glamor';
import ExpandCollapse from '../Layout/ExpandCollapse';

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
                title="Assets"
            >
                <ul className={ BOTS_CSS }>
                    <li>Adaptive cards</li>
                    <li>LUIS models</li>
                </ul>
            </ExpandCollapse>
        </li>
    </ul>
