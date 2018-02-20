import React from 'react';
import { connect } from 'react-redux';
import { css } from 'glamor';
import PropTypes from 'prop-types';

import * as BotActions from '../../../../data/action/botActions';
import * as Constants from '../../../../constants';
import * as EditorActions from '../../../../data/action/editorActions';
import * as NavBarActions from '../../../../data/action/navBarActions';
import { BotListItem } from './botListItem';
import { fuzzysearch } from '../../../utils/fuzzySearch';
import { CommandService } from '../../../../platform/commands/commandService';
import ExpandCollapse, { Controls as AccessoryButtons, Content as ExpandCollapseContent } from '../../../layout/expandCollapse';

const CSS = css({
  overflow: 'auto',

  '& > ul': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },

  '& > ul > li.empty-bot-list': {
    width: '100%',
    height: '48px',
    padding: '12px 24px',
    boxSizing: 'border-box'
  }
});

const INPUT_CSS = css({
  minHeight: '24px',
  padding: '4px 8px',
  width: '100%'
});

const ACTIONS_CSS = css({
  display: 'flex',

  '& > span': {
    marginRight: '12px',
    display: 'inline-block',
    fontSize: '16px',
    lineHeight: '22px'
  },

  '& > span.open-bot-icon': {
    height: '22px',
    width: '11px',
    background: "url('./external/media/ic_files.svg') no-repeat 50% 50%",
    backgroundSize: '11px',
  }
});

export class BotList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onSelectBot = this.onSelectBot.bind(this);
    this.onChangeQuery = this.onChangeQuery.bind(this);
    this.onClickSettings = this.onClickSettings.bind(this);
    this.onCreateBot = this.onCreateBot.bind(this);
    this.onOpenBot = this.onOpenBot.bind(this);

    this.state = { botQuery: '' };
  }

  onSelectBot(e, botId) {
    this.props.dispatch(BotActions.setActive(botId));
  }

  onClickSettings(e, bot) {
    CommandService.call('bot:settings:open', bot);
  }

  onOpenBot(e) {
    CommandService.remoteCall('bot:list:open')
      .then(bot => {
        this.props.dispatch((dispatch) => {
          // open bot settings and switch to explorer view
          this.props.dispatch(BotActions.open(bot));
          this.props.dispatch(NavBarActions.selectOrToggle(Constants.NavBar_Files));
        });
      })
      .catch(err => {
        console.error('Error during bot open: ', err);
      });
  }

  onCreateBot(e) {
    // show explorer to choose directory and write bot file to disk
    CommandService.remoteCall('bot:list:promptCreate')
      .then(bot => {
        this.props.dispatch((dispatch) => {
          // have main process dispatch a bot CREATE action
          CommandService.remoteCall('bot:list:create', bot)
          .then(() => {
            // open bot settings and switch to explorer view
            this.props.dispatch(NavBarActions.selectOrToggle(Constants.NavBar_Files));
            this.props.dispatch(EditorActions.open(Constants.ContentType_BotSettings, bot.botId + ':settings', bot.botId));
          })
        });
      })
      .catch(err => {
        console.error('Error during bot prompt create: ', err)
      });
  }

  onChangeQuery(e) {
    const query = e.target.value.toLowerCase();
    this.setState(({ botQuery: query }));
  }

  render() {
    let bots = this.state.botQuery ?
      this.props.bots.map(bot => fuzzysearch(this.state.botQuery, bot.botId.toLowerCase()) ? bot : null).filter(bot => !!bot)
      :
      this.props.bots;

    return (
      <ExpandCollapse initialExpanded={true} title="Bots">
        <AccessoryButtons>
          <div className={ACTIONS_CSS}>
            <span role="button" onClick={this.onCreateBot}>+</span>
            <span role="button" className="open-bot-icon" onClick={this.onOpenBot}></span>
          </div>
        </AccessoryButtons>
        <ExpandCollapseContent>
          {this.props.bots.length ? <input className={INPUT_CSS} value={this.state.botQuery} onChange={this.onChangeQuery} placeholder="Search for a bot..." /> : null}
          <div className={CSS}>
            <ul>
              {
                bots.length ?
                  bots.map(bot => <BotListItem key={bot.botId} bot={bot} onSelect={this.onSelectBot} onClickSettings={this.onClickSettings} activeBot={this.props.activeBot} />)
                  :
                  <li className="empty-bot-list">No bots found...</li>
              }
            </ul>
          </div>
        </ExpandCollapseContent>
      </ExpandCollapse>
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
