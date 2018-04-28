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
    transition: 'background 0.05s',

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
  },

  '& .open-bot': {
    marginTop: '8px',
    marginBottom: '8px'
  },

  '& .new-bot': {
    marginBottom: '8px'
  },

  '& .big-button': {
    width: '140px',
    height: '30px'
  }

});

interface Props {
  documentId?: string;
  recentBots?: IBotInfo[];
}

class WelcomePage extends React.Component<Props, {}> {

  onNewBotClick = () => {
    CommandService.call('bot-creation:show');
  }

  onOpenBotClick = () => {
    CommandService.call('bot:browse-open');
  }

  onBotClick = (e, path) => {
    CommandService.call('bot:switch', path);
  }

  render() {
    return (
      <GenericDocument style={ CSS }>
        <LargeHeader>Welcome to the Bot Framework Emulator</LargeHeader>
        <Row>
          <Column>
            <div className="section">
              <SmallHeader>Start</SmallHeader>
              <span>Start talking to your bot by connecting to an endpoint or by opening a bot saved locally.</span>
              <Row>
                <PrimaryButton className="open-bot big-button" text="Open Bot" onClick={ this.onOpenBotClick } />
              </Row>
              <Row>
                <PrimaryButton className="new-bot big-button" text="New Bot" onClick={ this.onNewBotClick } />
              </Row>
            </div>
            <div className="section">
              <SmallHeader>My Bots</SmallHeader>
              <ul className="recent-bots-list well">
                {
                  this.props.recentBots && this.props.recentBots.length ?
                    this.props.recentBots.slice(0, 10).map(bot => bot &&
                      <li key={ bot.path }>
                        <a href="javascript:void(0);" onClick={ ev => this.onBotClick(ev, bot.path) } ><TruncateText>{ bot.displayName }</TruncateText></a>
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
              <SmallHeader>Help</SmallHeader>
              <ul>
                <li><a href='https://aka.ms/BotBuilderOverview'><TruncateText>Overview</TruncateText></a></li>
                <li><a href='https://aka.ms/bbtools'><TruncateText>GitHub Repository</TruncateText></a></li>
                <li><a href='https://aka.ms/BotBuilderLocalDev'><TruncateText>Starting with Local Development</TruncateText></a></li>
                <li><a href='https://aka.ms/BotBuilderAZCLI'><TruncateText>Starting with Azure CLI</TruncateText></a></li>
                <li><a href='https://aka.ms/BotBuilderIbiza'><TruncateText>Starting with the Azure Portal</TruncateText></a></li>
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
