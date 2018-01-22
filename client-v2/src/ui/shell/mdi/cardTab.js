import React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';

import * as Colors from '../../colors/colors';

const CSS = css({
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    border: 'none',
    borderRight: `1px solid ${Colors.EDITOR_TAB_BORDER}`,
    backgroundColor: Colors.EDITOR_TAB_INACTIVE_BACKGROUND_DARK,
    color: Colors.EDITOR_TAB_INACTIVE_FOREGROUND_DARK,
    cursor: 'pointer',
    padding: '4px 16px',
    boxSizing: 'border-box',

    '&.active-editor-tab': {
        backgroundColor: Colors.EDITOR_TAB_ACTIVE_BACKGROUND_DARK,
        color: Colors.EDITOR_TAB_ACTIVE_FOREGROUND_DARK
    },

    '& > span': {
        display: 'inline-block',
        height: 'auto'
    }
});

export default connect((state, { cardId }) => ({
    title: state.card.cards[cardId].title,
    active: state.editor.activeDocumentId === cardId
}))(props => props.active ?
        <div className={ CSS + ' active-editor-tab' }><span>{ props.title }</span></div>
    :
        <div className={ CSS }><span >{ props.title }</span></div>
);
