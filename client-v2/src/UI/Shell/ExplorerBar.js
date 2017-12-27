import React from 'react';
import { css } from 'glamor';

const CSS = css({
    backgroundColor: 'LightGreen',
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& > li': {
        display: 'flex',
        flexDirection: 'column'
    },

    '& > li:last-child': {
        flex: 1
    }
});

export default class ExplorerBar extends React.Component {
    render() {
        return (
            <ul className={ CSS }>
                {
                    React.Children.map(this.props.children, child =>
                        <li>{ child }</li>
                    )
                }
            </ul>
        );
    }
}
