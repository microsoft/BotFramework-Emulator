import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import * as Colors from '../../../styles/colors';

const BASE_CSS = css({
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
    backgroundColor: Colors.C9,
    lineHeight: '32px',
    textAlign: 'center'
  },

  '& > span': {
    display: 'inline-block',
    lineHeight: '32px'
  },

  '& > span.bot-settings-icon': {
    display: 'inline-block',
    marginLeft: 'auto',
    background: "url('./external/media/ic_settings.svg') no-repeat 50% 50%",
    backgroundSize: '16px',
    width: '32px',
    height: '32px'
  }
});

export class BotListItem extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const className = this.props.activeBot === this.props.bot.botId ? ' selected-bot' : '';

    const ICON_LETTERING = css({
      '& > div:after': { content: this.props.bot.botId.substring(0, 1).toUpperCase() || '' }
    });
    const CSS = css(BASE_CSS, ICON_LETTERING);

    return (
      <li className={CSS + className} onClick={(ev) => this.props.onSelect(ev, this.props.bot.botId)}
        role="button" title={this.props.bot.botUrl}>
        <div />
        <span>
          {this.props.bot.botId}
        </span>
        <span className="bot-settings-icon" onClick={(ev) => this.props.onClickSettings(ev, this.props.bot)} />
      </li>
    );
  }
}

BotListItem.propTypes = {
  activeBot: PropTypes.string,
  bot: PropTypes.object,
  onClickSettings: PropTypes.func,
  onSelect: PropTypes.func
};
