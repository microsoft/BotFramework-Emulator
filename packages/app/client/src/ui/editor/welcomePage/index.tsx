import { css } from 'glamor';
import * as React from 'react';
import { connect } from 'react-redux';
import { IBotInfo } from '@bfemulator/app-shared';

import { Colors, Column, Row, PrimaryButton, LargeHeader, SmallHeader, TruncateText } from '@bfemulator/ui-react';
import { CommandService } from '../../../platform/commands/commandService';
import { DialogService } from '../../dialogs/service/index';
import BotCreationDialog from '../../dialogs/botCreationDialog';
import { GenericDocument } from '../../layout';

const CSS = css({
  '& .right-column': {
    marginLeft: '48px'
  },

  '& .section': {
    marginBottom: '5em',
    width: 'auto',
    maxWidth: '100%'
  },

  '& .well': {
    padding: '12px 10px',
    background: 'rgba(0,0,0,.2)',

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent'
    },

    '&:hover': {
      background: 'rgba(200,235,255,.072)',

      '&::-webkit-scrollbar-thumb': {
        backgroundColor: Colors.SCROLLBAR_THUMB_BACKGROUND_DARK
      }
    }
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
  }
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
          <LargeHeader>Welcome to the Bot Framework Emulator</LargeHeader>
          <Row>
            <Column>
              <div className="section">
                <SmallHeader>Start</SmallHeader>
                <ul>
                  <li><a href='javascript:void(0);' onClick={ this.onAddBotClick } title=''><TruncateText>Add a bot configuration</TruncateText></a></li>
                  <li><a href='javascript:void(0);' onClick={ this.onOpenTranscriptClick } title=''><TruncateText>Open a saved chat transcript</TruncateText></a></li>
                </ul>
              </div>
              <div className="section">
                <SmallHeader>My Bots</SmallHeader>
                <ul className="recent-bots-list well">
                  {
                    this.props.recentBots && this.props.recentBots.length ?
                      this.props.recentBots.slice(0, 10).map(bot => bot &&
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
                <SmallHeader>Tutorials</SmallHeader>
                <ul>
                  <li><a href='javascript:void(0);' title=''><TruncateText>VIDEO: Getting started with the Bot Framework Emulator</TruncateText></a></li>
                  <li><a href='javascript:void(0);' title=''><TruncateText>VIDEO: Creating bots with the BotBuilder SDK</TruncateText></a></li>
                </ul>
              </div>
              <div className="section">
                <SmallHeader>Help</SmallHeader>
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
