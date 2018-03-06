import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import { CommandService } from '../../../platform/commands/commandService';
import * as Fonts from '../../styles/fonts';
import * as BotActions from '../../../data/action/botActions';
import store from '../../../data/store';
import { getBotById } from '../../../data/botHelpers';
import PrimaryButton from '../../shell/explorer/botExplorer/primaryButton';
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
    marginTop: '16px',
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

export default class SettingsEditor extends React.Component {
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

    this.state = {
      bot: getBotById(this.props.id)
    };
  }

  componentWillReceiveProps(newProps) {
    const { id: newId } = newProps;
    if (newId !== this.props.id) {
      this.setState({
        bot: getBotById(newId)
      });
    }
  }

  componentWillMount() {
    this.setState({
      bot: getBotById(this.props.id)
    });
  }

  onChangeBotId(e) {
    const bot = { ...this.state.bot, botId: e.target.value };
    this.setState({ bot });
  }

  onChangeEndpoint(e) {
    const bot = { ...this.state.bot, botUrl: e.target.value };
    this.setState({ bot });
  }

  onChangeAppId(e) {
    const bot = { ...this.state.bot, msaAppId: e.target.value };
    this.setState({ bot });
  }

  onChangeAppPw(e) {
    const bot = { ...this.state.bot, msaPassword: e.target.value };
    this.setState({ bot });
  }

  onChangeLocale(e) {
    const bot = { ...this.state.bot, locale: e.target.value };
    this.setState({ bot });
  }

  onChangeName(e) {
    const bot = { ...this.state.bot, botName: e.target.value };
    this.setState({ bot });
  }

  onSave(e) {
    return CommandService.remoteCall('bot:save', this.state.bot, this.props.id)
      .then(() => {
        store.dispatch(BotActions.patch(this.props.id, this.state.bot))
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
    CommandService.remoteCall('bot:settings:chooseFolder')
      .then(path => {
        const bot = { ...this.state.bot, path: path };
        this.setState({ bot });
      })
      .catch(err => console.log('User cancelled choosing a bot folder: ', err));
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
              <PrimaryButton text="Save" onClick={ this.onSave } buttonClass='save-button' />
              <PrimaryButton text="Save & Connect" onClick={ this.onSaveAndConnect } buttonClass='save-connect-button' />
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
              <input value={ this.state.bot.path } type="text" readOnly />
              <PrimaryButton text='Browse' onClick={ this.onSelectFolder } buttonClass='browse-path-button' />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SettingsEditor.propTypes = {
  id: PropTypes.string.isRequired
};
