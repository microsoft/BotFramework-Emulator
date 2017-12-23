import React from 'react';
import { css } from 'glamor';
import ExpandCollapse from '../Layout/ExpandCollapse';

const CSS = css({
    backgroundColor: 'skyblue',
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
                title="Bots"
            >
                <ExpandCollapseTitle>Bots</ExpandCollapseTitle>
                <ul className={ BOTS_CSS }>
                    <li>http://localhost:3000/</li>
                    <li>http://localhost:3001/</li>
                    <li>http://localhost:3002/</li>
                </ul>
            </ExpandCollapse>
        </li>
    </ul>

const ExpandCollapseTitle = props => false;
