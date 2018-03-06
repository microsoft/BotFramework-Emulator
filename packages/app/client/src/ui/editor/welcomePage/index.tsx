import { css } from 'glamor';
import * as React from 'react';
import * as Colors from '../../styles/colors';
import PrimaryButton from '../../widget/primaryButton';
import { CommandService } from '../../../platform/commands/commandService';
import { hasNonGlobalTabs } from '../../../data/editorHelpers';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';

const CSS = css({
  display: 'flex',
  minWeight: '100%',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',

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

    '& li': {

    },

    '& .content': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'initial',

      '& .column': {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0px',

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

export default class WelcomePage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onAddBotClick = this.onAddBotClick.bind(this);
  }

  onAddBotClick() {
    ActiveBotHelper.confirmAndCreateBot();
  }

  render() {
    return (
      <div className={ CSS as any }>
        <div className="welcome">
          <div className="title">
            <h1 className="title">Welcome to the Bot Framework Emulator</h1>
          </div>
          <div className="content">
            <div className="column">
              <div className="section">
                <h2>My Bots</h2>
                <ul>
                  <li><span className="no-bots">No recent bots</span></li>
                  </ul>
                  <p><PrimaryButton text="Add a bot" onClick={ this.onAddBotClick } /></p>
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
