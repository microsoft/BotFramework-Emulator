import React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';
import PropTypes from 'prop-types';

import { BotListItem } from './botListItem';
import { fuzzysearch } from '../../../utils/fuzzySearch';
import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../../layout/expandCollapse';
import PrimaryButton from './primaryButton';
import { ActiveBotHelper } from '../../../helpers/activeBotHelper';

const CSS = css({
  overflowX: 'hidden',
  height: '100%',

  '& > ul': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    height: '100%'
  },

  '& > ul > li.empty-bot-list': {
    width: '100%',
    padding: '16px',
    boxSizing: 'border-box'
  },
});

const INPUT_CSS = css({
  minHeight: '32px',
  padding: '4px 8px',
  width: '100%',
  boxSizing: 'border-box'
});

const ACCESSORIES_CSS = css({
  '& .accessory-button': {
    width: '30px',
    height: '30px',
  },

  '& .create-bot-button': {
    background: "url('./external/media/ic_new_file.svg') no-repeat 50% 50%",
    backgroundSize: '16px',
  },
});

const BOTTOM_DOCK_CSS = css({
  marginTop: 'auto',
  padding: '16px'
});

export class BotList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onSelectBot = this.onSelectBot.bind(this);
    this.onChangeQuery = this.onChangeQuery.bind(this);
    this.onClickSettings = this.onClickSettings.bind(this);
    this.onCreateBot = this.onCreateBot.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);

    this.state = { botQuery: '' };
  }

  onSelectBot(e, id) {
    e.stopPropagation();
    ActiveBotHelper.confirmAndSwitchBots(id);
  }

  onClickSettings(e, bot) {
    e.stopPropagation();
    CommandService.call('bot:settings:open', bot);
  }

  onClickDelete(e, bot) {
    e.stopPropagation();
    ActiveBotHelper.confirmAndDeleteBot(bot.id);
  }

  onCreateBot(e) {
    e.stopPropagation();
    ActiveBotHelper.confirmAndCreateBot();
  }

  onChangeQuery(e) {
    const query = e.target.value.toLowerCase();
    this.setState(({ botQuery: query }));
  }

  render() {
    let bots = this.state.botQuery ?
      this.props.bots.map(bot => fuzzysearch(this.state.botQuery, getBotDisplayName(bot).toLowerCase()) ? bot : null).filter(bot => !!bot)
      :
      this.props.bots;

    return (
      <React.Fragment>
        <ExpandCollapse initialExpanded={ true } title="My Bots">
          <ExpandCollapseControls>
            <div className={ ACCESSORIES_CSS }>
              <div className="accessory-button create-bot-button" role="button" onClick={ this.onCreateBot } />
            </div>
          </ExpandCollapseControls>
          <ExpandCollapseContent>
            <div className={ CSS }>
              <ul>
                {
                  bots.length ?
                    bots.map(bot => <BotListItem key={ bot.id } bot={ bot } onSelect={ this.onSelectBot } activeBot={ this.props.activeBot }
                      onClickSettings={ this.onClickSettings } onClickDelete={ this.onClickDelete } />)
                    :
                    false
                }
              </ul>
            </div>
          </ExpandCollapseContent>
        </ExpandCollapse>
      </React.Fragment>
    );
  }
}

export default connect((state, ownProps) => ({
  activeBot: state.bot.activeBot,
  activeEditor: state.editor.activeEditor,
  bots: state.bot.bots
}))(BotList);

BotList.propTypes = {
  activeBot: PropTypes.string,
  activeEditor: PropTypes.string,
  bots: PropTypes.arrayOf(PropTypes.object)
};
