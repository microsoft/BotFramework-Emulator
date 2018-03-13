import { css } from 'glamor';
import * as React from 'react';
import { connect } from 'react-redux';

import * as Colors from '../../styles/colors';
import PrimaryButton from '../../widget/primaryButton';
import { CommandService } from '../../../platform/commands/commandService';
import { getTabGroupForDocument, hasNonGlobalTabs } from '../../../data/editorHelpers';
import { DialogService } from '../../dialogs/service/index';
import BotCreationDialog from '../../dialogs/botCreationDialog';
import { IBotInfo } from '@bfemulator/app-shared';

const CSS = css({
  display: 'flex',
  minWeight: '100%',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',

  '& .recent-bots-list': {
    maxHeight: '106px',
    overflowY: 'auto',

    '& > li': {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }
  },

  '& .recent-bot-detail': {
    display: 'inline-block',
    marginLeft: '8px',
    color: Colors.APP_HYPERLINK_DETAIL_DARK,
    userSelect: 'text',
    cursor: 'text'
  },

  '& .welcome': {
    width: '90%',
    maxWidth: '1200px',
    fontSize: '13px',

    '& h1': {
      padding: 0,
      margin: 0,
      border: 'none',
      fontWeight: 400,
      fontSize: '36px',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',

      '.title': {
        marginTop: '1em',
        marginBottom: '1em',
      }
    },

    '& h2': {
      fontWeight: 200,
      marginTop: '17px',
      marginBottom: '5px',
      fontSize: '19px',
      lineHeight: 'normal',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
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

    '& .content': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'initial',

      '& .column:first-child': {
        marginLeft: 0,
      },

      '& .column': {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0px',
        marginLeft: '8px',

        '& .section': {
          marginBottom: '5em',
        },

        '& .no-bots': {
          fontStyle: 'italic',
        }
      },
    },
  },
});

interface Props {
  documentId?: string;
  recentBots?: IBotInfo[];
}

interface State {
  activeEditor?: string;
}

class WelcomePage extends React.Component<Props, State> {
  constructor(props, context) {
    super(props, context);
    this.onAddBotClick = this.onAddBotClick.bind(this);
    this.onBotClick = this.onBotClick.bind(this);
    this.onOpenTranscriptClick = this.onOpenTranscriptClick.bind(this);

    this.state = { activeEditor: getTabGroupForDocument(this.props.documentId) };
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
      <div { ...CSS }>
        <div className="welcome">
          <div className="title">
            <h1 className="title">Welcome to the Bot Framework Emulator</h1>
          </div>
          <div className="content">
            <div className="column">
              <div className="section">
                <h2>Start</h2>
                <ul>
                  <li><a href='javascript:void(0);' onClick={ this.onAddBotClick } title=''>Add a bot configuration</a></li>
                  <li><a href='javascript:void(0);' onClick={ this.onOpenTranscriptClick } title=''>Open a saved chat transcript</a></li>
                </ul>
              </div>
              <div className="section">
                <h2>My Bots</h2>
                <ul className="recent-bots-list">
                  {
                    this.props.recentBots && this.props.recentBots.length ?
                      this.props.recentBots.map(bot => bot &&
                        <li key={ bot.id }>
                          <a href="javascript:void(0);" onClick={ ev => this.onBotClick(ev, bot.id) } >{ bot.displayName }</a>
                          <span className="recent-bot-detail">{ bot.path }</span>
                        </li>)
                      :
                      <li><span className="no-bots">No recent bots</span></li>
                  }
                </ul>
              </div>
            </div>
            <div className="column">
              <div className="section">
                <h2>Tutorials</h2>
                <ul>
                  <li><a href='javascript:void(0);' title=''>VIDEO: Getting started with the Bot Framework Emulator</a></li>
                  <li><a href='javascript:void(0);' title=''>VIDEO: Creating bots with the BotBuilder SDK</a></li>
                </ul>
              </div>
              <div className="section">
                <h2>Help</h2>
                <ul>
                  <li><a href='javascript:void(0);' title=''>What is the Bot Framework Emulator?</a></li>
                  <li><a href='javascript:void(0);' title=''>BotBuilder SDK Documentation</a></li>
                  <li><a href='javascript:void(0);' title=''>BotBuilder SDK API Reference</a></li>
                  <li><a href='javascript:void(0);' title=''>Samples</a></li>
                  <li><a href='javascript:void(0);' title=''>GitHub repository</a></li>
                  <li><a href='javascript:void(0);' title=''>Report an issue</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: any): any {
  return ({ recentBots: state.bot.botFiles });
}

export default connect(mapStateToProps, null)(WelcomePage);
