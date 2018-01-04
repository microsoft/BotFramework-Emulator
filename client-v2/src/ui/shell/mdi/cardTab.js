import React from 'react';
import { connect } from 'react-redux';


export default props => <span>{ props.document.title || "unnamedCard" }</span>

// TODO: connect it, read from props and find title from store.cards
