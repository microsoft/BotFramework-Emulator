import React from 'react';
import { connect } from 'react-redux';

export default connect((state, { conversationId }) => ({
    conversation: state.conversation.conversations[conversationId]
}))(props => <span>{ props.conversation ? props.conversation.name : `[${ props.conversationId }]` }</span>)

// TODO: connect it, read from props and find title from store.cards
