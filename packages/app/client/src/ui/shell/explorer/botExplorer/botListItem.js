import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import * as Colors from '../../../styles/colors';
import { getBotDisplayName } from '@bfemulator/app-shared';

const BASE_CSS = css({
  width: '100%',
  height: '48px',
  display: 'flex',
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
  '& div.bot-icon': {
    height: '32px',
    minHeight: '32px',
    width: '32px',
    minWidth: '32px',
    borderRadius: '32px',
    marginRight: '8px',
    backgroundColor: Colors.C9,
    lineHeight: '32px',
    textAlign: 'center'
  },

  '& div.bot-name': {
    whiteSpace: 'nowrap',
    lineHeight: '32px',
    flexGrow: 1,
    flexShrink: 1,
  },

  '& div.bot-accessories': {
    alignSelf: 'flex-end',
    display: 'flex',
  },

  '&:hover span.bot-widget': {
    visibility: 'visible'
  },

  '& span.bot-widget': {
    display: 'inline-block',
    visibility: 'hidden',
    width: '32px',
    height: '32px'
  },

  '& span.bot-settings-icon': {
    marginLeft: 'auto',
    background: "url('./external/media/ic_settings.svg') no-repeat 50% 50%",
    backgroundSize: '16px'
  },

  '& span.bot-delete-icon': {
    background: "url('./external/media/ic_close.svg') no-repeat 50% 50%",
    backgroundSize: '16px'
  }
});

export class BotListItem extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const botLabel = getBotDisplayName(this.props.bot);
    const className = this.props.activeBot === this.props.bot.id ? ' selected-bot' : '';

    const ICON_LETTERING = css({
      '& > div.bot-icon:after': { content: botLabel.substring(0, 1).toUpperCase() || '' }
    });
    const CSS = css(BASE_CSS, ICON_LETTERING);

    return (
      <li className={ CSS + className } onClick={ (ev) => this.props.onSelect(ev, this.props.bot.id) }
        role="button" title={ this.props.bot.botUrl }>
        <div className="bot-icon" />
        <div className="bot-name">
          { botLabel }
        </div>
        <div className="bot-accessories">
          <span className="bot-widget bot-settings-icon" onClick={ (ev) => this.props.onClickSettings(ev, this.props.bot) } role="button" />
          <span className="bot-widget bot-delete-icon" onClick={ (ev) => this.props.onClickDelete(ev, this.props.bot) } role="button" />
        </div>
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
