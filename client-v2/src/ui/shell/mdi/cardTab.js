import React from 'react';
import { connect } from 'react-redux';

export default connect((state, { cardId }) => ({ title: state.card.cards[cardId].title }))(props => <span>{ props.title }</span>);
