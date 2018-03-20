import { css } from 'glamor';
import * as React from 'react';
import { connect } from 'react-redux';
import { IBotInfo } from '@bfemulator/app-shared';

import * as Colors from '../../styles/colors';
import { PrimaryButton } from '../../widget';
import { CommandService } from '../../../platform/commands/commandService';
import { DialogService } from '../../dialogs/service/index';
import BotCreationDialog from '../../dialogs/botCreationDialog';
import { Column, Row, GenericDocument, TruncateText } from '../../layout';

const CSS = css({
  '& h1.title': {
    padding: 0,
    margin: 0,
    border: 'none',
    fontWeight: 400,
    fontSize: '36px',
    marginTop: '1em',
    marginBottom: '1em'
  },

  '& h2': {
    fontWeight: 200,
    fontSize: '20px',
    lineHeight: 'normal'
  },

  '& .right-column': {
    marginLeft: '48px'
  },

  '& .section': {
    marginBottom: '5em',
    width: '100%'
  },

  '& .no-bots': {
    fontStyle: 'italic',
  },

  '& .recent-bots-list': {
    maxHeight: '100px',
    overflowY: 'auto',
    overflowX: 'hidden',

    '& > li': {
      display: 'flex'
    },

    '& a': {
      flexShrink: 0
    }
  },

  '& .recent-bot-detail': {
    display: 'inline-block',
    marginLeft: '8px',
    color: Colors.APP_HYPERLINK_DETAIL_DARK,
    userSelect: 'text',
    cursor: 'text'
  },

  '& a': {
    minWidth: 0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textDecoration: 'none',
    color: Colors.APP_HYPERLINK_FOREGROUND_DARK,

    ':hover': {
      color: Colors.APP_HYPERLINK_FOREGROUND_DARK
    }
  },

  '& ul': {
    margin: 0,
    listStyle: 'none',
    padding: 0,
  },

});

interface Props {
  documentId?: string;
  recentBots?: IBotInfo[];
}

class WelcomePage extends React.Component<Props, {}> {
  constructor(props, context) {
    super(props, context);
    this.onAddBotClick = this.onAddBotClick.bind(this);
    this.onBotClick = this.onBotClick.bind(this);
    this.onOpenTranscriptClick = this.onOpenTranscriptClick.bind(this);
  }

  onAddBotClick() {
    CommandService.call('bot-creation:show');
  }

  onBotClick(e, id) {
    CommandService.call('bot:switch', id);
  }

  onOpenTranscriptClick() {
    CommandService.call('transcript:prompt-open');
  }

  render() {
    return (
      <GenericDocument style={ CSS }>
        <h1 className="title"><TruncateText>Welcome to the Bot Framework Emulator</TruncateText></h1>
        <Row>
          <Column>
            <div className="section">
              <h2><TruncateText>Start</TruncateText></h2>
              <ul>
                <li><a href='javascript:void(0);' onClick={ this.onAddBotClick } title=''><TruncateText>Add a bot configuration</TruncateText></a></li>
                <li><a href='javascript:void(0);' onClick={ this.onOpenTranscriptClick } title=''><TruncateText>Open a saved chat transcript</TruncateText></a></li>
              </ul>
            </div>
            <div className="section">
              <h2><TruncateText>My Bots</TruncateText></h2>
              <ul className="recent-bots-list">
                {
                  this.props.recentBots && this.props.recentBots.length ?
                    this.props.recentBots.map(bot => bot &&
                      <li key={ bot.id }>
                        <a href="javascript:void(0);" onClick={ ev => this.onBotClick(ev, bot.id) } ><TruncateText>{ bot.displayName }</TruncateText></a>
                        <TruncateText className='recent-bot-detail'>{ bot.path }</TruncateText>
                      </li>)
                    :
                    <li><span className="no-bots"><TruncateText>No recent bots</TruncateText></span></li>
                }
              </ul>
            </div>
          </Column>
          <Column className='right-column'>
            <div className="section">
              <h2><TruncateText>Tutorials</TruncateText></h2>
              <ul>
                <li><a href='javascript:void(0);' title=''><TruncateText>VIDEO: Getting started with the Bot Framework Emulator</TruncateText></a></li>
                <li><a href='javascript:void(0);' title=''><TruncateText>VIDEO: Creating bots with the BotBuilder SDK</TruncateText></a></li>
              </ul>
            </div>
            <div className="section">
              <h2><TruncateText>Help</TruncateText></h2>
              <ul>
                <li><a href='javascript:void(0);' title=''><TruncateText>What is the Bot Framework Emulator?</TruncateText></a></li>
                <li><a href='javascript:void(0);' title=''><TruncateText>BotBuilder SDK Documentation</TruncateText></a></li>
                <li><a href='javascript:void(0);' title=''><TruncateText>BotBuilder SDK API Reference</TruncateText></a></li>
                <li><a href='javascript:void(0);' title=''><TruncateText>Samples</TruncateText></a></li>
                <li><a href='javascript:void(0);' title=''><TruncateText>GitHub repository</TruncateText></a></li>
                <li><a href='javascript:void(0);' title=''><TruncateText>Report an issue</TruncateText></a></li>
              </ul>
            </div>
          </Column>
        </Row>
      </GenericDocument>
    );
  }
}

function mapStateToProps(state: any): any {
  return ({ recentBots: state.bot.botFiles });
}

export default connect(mapStateToProps, null)(WelcomePage);
