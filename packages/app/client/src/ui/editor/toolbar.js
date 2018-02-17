import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

import * as Colors from '../styles/colors';

const CSS = css({
  height: '40px',
  backgroundColor: Colors.TOOLBAR_BACKGROUND_DARK,
  lineHeight: '40px',

  '& > ul': {
    display: 'flex',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    '& > li': {
      padding: '0 8px 0 8px',
    },

    '& > .button > button': {
      cursor: 'pointer',
      margin: 0,
      border: 'none',
      height: '30px',
      backgroundColor: Colors.TOOLBAR_BUTTON_BACKGROUND_DARK,
      color: Colors.TOOLBAR_BUTTON_FOREGROUND_DARK,
      whiteSpace: 'nowrap',

      ':hover': {
        backgroundColor: Colors.TOOLBAR_BUTTON_HOVER_BACKGROUND_DARK,
        color: Colors.TOOLBAR_BUTTON_HOVER_FOREGROUND_DARK,
      }
    },

    '& > .separator': {
      backgroundColor: Colors.TOOLBAR_BUTTON_BACKGROUND_DARK,
      color: Colors.TOOLBAR_BUTTON_FOREGROUND_DARK,
    }
  }
});


export default class ToolBar extends React.Component {
  render() {
    return (
      <div className={ CSS }>
        <ul>
          { React.Children.map(this.props.children, child => this.createClass(child)) }
        </ul>
      </div>
    );
  }

  createClass(child) {
    if (child.type === Button) {
      return (
        <li className="button"><button onClick={ () => child.props.onClick() }>{ child.props.title }</button></li>
      )
    } else if (child.type === Separator) {
      return (
        <li className="separator">|</li>
      )
    } else {
      return false;
    }
  }
}

export const Button = props => props.children;
export const Separator = props => props.children;
