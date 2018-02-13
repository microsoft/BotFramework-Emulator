import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import * as Colors from '../../styles/colors';

const CSS = css({
    width: '100%',
    height: '48px',
    display: 'flex',
    flexFlow: 'row nowrap',
    padding: '8px',
    boxSizing: 'border-box',
    cursor: 'pointer',

    '&:hover': {
        backgroundColor: Colors.EXPLORER_ITEM_HOVER_BACKGROUND_DARK
    },

    '&:active': {
        backgroundColor: Colors.EXPLORER_ITEM_ACTIVE_BACKGROUND_DARK
    },

    '&.selected-bot': {
        backgroundColor: Colors.EXPLORER_ITEM_FOCUSED_BACKGROUND_DARK
    },

    // icon
    '& > div': {
        height: '100%',
        width: '32px',
        borderRadius: '32px',
        marginRight: '8px',
        backgroundColor: Colors.C9
    },

    '& > span': {
        display: 'inline-block',
        lineHeight: '32px'
    }
});

export class BotListItem extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const className = this.props.activeBot === this.props.bot.handle ? ' selected-bot' : '';

        return (
            <li className={ CSS + className } onClick={ (ev) => this.props.onSelect(ev, this.props.bot.handle) }
                role="button" title={ this.props.bot.endpoint }>
                <div />
                <span>
                    { this.props.bot.handle }
                </span>
            </li>
        );
    }
}

BotListItem.propTypes = {
    activeBot: PropTypes.string,
    bot: PropTypes.object,
    onSelect: PropTypes.func
};
