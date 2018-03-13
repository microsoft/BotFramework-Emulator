import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import { debounce } from 'lodash';
import { connect } from 'react-redux';

import { CommandService } from '../../../platform/commands/commandService';
import * as Fonts from '../../styles/fonts';
import * as BotActions from '../../../data/action/botActions';
import * as ChatActions from '../../../data/action/chatActions';
import * as EditorActions from '../../../data/action/editorActions';
import store from '../../../data/store';
import PrimaryButton from '../../widget/primaryButton';
import { getBotDisplayName } from '@bfemulator/app-shared';

const CSS = css({
  boxSizing: 'border-box',
  padding: '32px',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  boxSizing: 'border-box',

  '& h2': {
    fontWeight: 200,
    marginTop: 0,
    marginBottom: '5px',
    fontSize: '19px',
    lineHeight: 'normal',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  '& input': {
    marginTop: '8px',
    height: '32px',
    padding: '4px 8px',
    boxSizing: 'border-box',
    width: '100%'
  },

  '& span': {
    marginTop: '16px'
  },

  '& button': {
    width: '120px',
    height: '32px',
  },

  '& .browse-path-button': {
    marginLeft: '8px',
    alignSelf: 'flex-end',
  },

  '& .save-button': {
  },

  '& .save-connect-button': {
    marginLeft: '8px',
  },

  '& .horz-group': {
    display: 'flex',
    flexWrap: 'nowrap',
  },

  '& .column': {
    display: 'flex',
    flexDirection: 'column',
  },

  '& .right': {
    marginLeft: 'auto',
  },

  '& .stretch': {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0px',
  },

  '& .space-left': {
    marginLeft: '8px',
  },

  '& .space-right': {
    marginRight: '8px',
  },

  '& .label': {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
});

class BotSettingsEditor extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onChangeBotId = this.onChangeBotId.bind(this);
    this.onChangeEndpoint = this.onChangeEndpoint.bind(this);
    this.onChangeAppId = this.onChangeAppId.bind(this);
    this.onChangeAppPw = this.onChangeAppPw.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onSaveAndConnect = this.onSaveAndConnect.bind(this);
    this.onSelectFolder = this.onSelectFolder.bind(this);
    this.setDirtyFlag = debounce(this.setDirtyFlag, 500);

    this.state = {
      bot: this.props.bot,
      projectDir: this.props.bot.projectDir
    };
  }

  componentWillReceiveProps(newProps) {
    const { bot: newBot } = newProps;
    // handling a new bot
    if (newBot.id !== this.state.bot.id) {
      this.setDirtyFlag(false);
    }
  }

  onChangeBotId(e) {
    const bot = { ...this.state.bot, botId: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeEndpoint(e) {
    const bot = { ...this.state.bot, botUrl: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeAppId(e) {
    const bot = { ...this.state.bot, msaAppId: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeAppPw(e) {
    const bot = { ...this.state.bot, msaPassword: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeLocale(e) {
    const bot = { ...this.state.bot, locale: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onChangeName(e) {
    const bot = { ...this.state.bot, botName: e.target.value };
    this.setState({ bot });
    this.setDirtyFlag(true);
  }

  onSave(e) {
    return CommandService.remoteCall('bot:save', this.state.bot)
      .then(() => {
        // refresh filewatcher if project directory was changed
        if (this.state.bot.projectDir !== this.state.projectDir) {
          store.dispatch(ChatActions.clearTranscripts());
          CommandService.remoteCall('bot:init-filewatcher', this.state.bot);
        }

        store.dispatch(BotActions.patch(this.state.bot));
        this.setDirtyFlag(false);
        this.setState({ bot: this.state.bot, projectDir: this.state.bot.projectDir });
        CommandService.remoteCall('app:setTitleBar', getBotDisplayName(this.state.bot));
      });
  }

  onSaveAndConnect(e) {
    this.onSave(e)
      .then(() => {
        CommandService.call('livechat:new');
      })
  }

  onSelectFolder(e) {
    const dialogOptions = {
      title: 'Choose a folder for your bot',
      buttonLabel: 'Choose folder',
      properties: ['openDirectory', 'promptToCreate']
    };

    CommandService.remoteCall('shell:showOpenDialog', dialogOptions)
      .then(path => {
        const bot = { ...this.state.bot, projectDir: path };
        this.setState({ bot });
        this.setDirtyFlag(true);
      })
      .catch(err => console.log('User cancelled choosing a bot folder: ', err));
  }

  setDirtyFlag(dirty) {
    store.dispatch(EditorActions.setDirtyFlag(this.props.documentId, dirty));
  }

  render() {
    const botLabel = getBotDisplayName(this.state.bot);

    return (
      <div className={ CSS }>
        <div className="horz-group">
          <div className="column">
            <h2>Bot Settings</h2>
          </div>
          <div className="column right">
            <div className="label space-left">
              <PrimaryButton text="Save" onClick={ this.onSave } buttonClass='save-button' disabled={ !this.props.dirty } />
              <PrimaryButton text="Save & Connect" onClick={ this.onSaveAndConnect } buttonClass='save-connect-button' disabled={ !this.props.dirty } />
            </div>
          </div>
        </div>

        <div className="horz-group">
          <div className="column stretch">
            <span className='label'>Endpoint URL</span>
            <input value={ this.state.bot.botUrl } onChange={ this.onChangeEndpoint } type="text" />
          </div>
        </div>

        <div className="horz-group">
          <div className="column stretch">
            <span className='label'>MSA App Id</span>
            <input value={ this.state.bot.msaAppId } onChange={ this.onChangeAppId } type="text" />
          </div>

          <div className="column stretch space-left space-right">
            <span className='label'>MSA App Password</span>
            <input value={ this.state.bot.msaPassword } onChange={ this.onChangeAppPw } type="password" />
          </div>

          <div className="column">
            <span className='label'>Locale</span>
            <input value={ this.state.bot.locale } onChange={ this.onChangeLocale } type="text" />
          </div>
        </div>

        <div className="horz-group">
          <div className="column">
            <span className='label'>Bot name</span>
            <input value={ this.state.bot.botName } onChange={ this.onChangeName } type="text" />
          </div>

          <div className="column stretch space-left">
            <span className='label'>Local folder</span>
            <div className='horz-group'>
              <input value={ this.state.bot.projectDir } type="text" readOnly />
              <PrimaryButton text='Browse' onClick={ this.onSelectFolder } buttonClass='browse-path-button' />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state, ownProps) => ({
  bot: state.bot.activeBot
}))(BotSettingsEditor);

BotSettingsEditor.propTypes = {
  documentId: PropTypes.string.isRequired,
  bot: PropTypes.object.isRequired,
  dirty: PropTypes.bool
};
