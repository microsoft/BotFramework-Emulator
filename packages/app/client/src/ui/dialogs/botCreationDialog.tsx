import * as React from 'react';
import { IBot, newBot } from '@bfemulator/app-shared';
import { css } from 'glamor';

import * as Fonts from '../styles/fonts';
import * as Colors from '../styles/colors';
import * as BotActions from '../../data/action/botActions';
import * as NavBarActions from '../../data/action/navBarActions';
import * as Constants from '../../constants';
import { CommandService } from '../../platform/commands/commandService';
import store from '../../data/store';
import PrimaryButton from '../widget/primaryButton';
import { DialogService } from './service/index';
import { ActiveBotHelper } from '../helpers/activeBotHelper';

const CSS = css({
  boxSizing: 'border-box',
  padding: '32px',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontFamily: Fonts.FONT_FAMILY_DEFAULT,
  backgroundColor: Colors.EDITOR_TAB_BACKGROUND_DARK,
  minWidth: '540px',

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

  '& .connect-button': {
    marginLeft: '8px'
  },

  '& > .horiz-input-group': {
    marginTop: '16px'
  },

  '& .horiz-input-group': {
    display: 'flex',

    '& > .vert-input-group': {
      marginRight: '8px'
    },

    '& > .vert-input-group:last-child': {
      margin: 0
    }
  },

  '& > .button-row': {
    marginTop: '48px',
    display: 'flex',
    justifyContent: 'flex-end'
  }
});

interface IBotCreationDialogProps {
  activeEditor?: string;
}

interface IBotCreationDialogState {
  bot: IBot;
  touchedName: boolean;
}

export default class BotCreationDialog extends React.Component<IBotCreationDialogProps, IBotCreationDialogState> {
  constructor(props, context) {
    super(props, context);

    this.onChangeEndpoint = this.onChangeEndpoint.bind(this);
    this.onChangeAppId = this.onChangeAppId.bind(this);
    this.onChangeAppPw = this.onChangeAppPw.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSelectFolder = this.onSelectFolder.bind(this);

    this.state = {
      bot: { botUrl: '', msaAppId: '', msaPassword: '', locale: '', botName: '', localDir: '' },
      touchedName: false
    };

    // get new bot from main
    CommandService.remoteCall('bot:new')
      .then(bot => {
        this.setState({ ...this.state, bot });
        return CommandService.remoteCall('path:basename', bot.localDir);
      })
      .then(dirName => {
        const bot = { ...this.state.bot, botName: dirName };
        this.setState({ bot });
      })
      .catch(err => console.error('Error getting a new bot object from the server: ', err));
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
    this.setState({ bot, touchedName: true });
  }

  onCancel(e) {
    DialogService.hideDialog();
  }

  onConnect(e) {
    ActiveBotHelper.confirmAndCreateBot(this.state.bot)
      .then(() => DialogService.hideDialog())
      .catch(err => console.error('Error during confirm and create bot.'))
  }

  onSelectFolder(e) {
    const dialogOptions = {
      title: 'Choose a folder for your bot',
      buttonLabel: 'Choose folder',
      properties: ['openDirectory', 'promptToCreate']
    };

    CommandService.remoteCall('shell:showOpenDialog', dialogOptions)
      .then(path => {
        const bot = { ...this.state.bot, localDir: path };
        this.setState({ bot });

        // use bot directory as bot name if name hasn't been touched
        if (!this.state.touchedName)
          CommandService.remoteCall('path:basename', path)
            .then(dirName => {
              const bot = { ...this.state.bot, botName: dirName };
              this.setState({ bot });
            });
      })
      .catch(err => console.log('User cancelled choosing a bot folder: ', err));
  }

  render(): JSX.Element {
    return (
      <div className={ CSS as any }>
        <h1>Add a bot</h1>

        <span>Endpoint URL</span>
        <input value={ this.state.bot.botUrl } onChange={ this.onChangeEndpoint } type="text" />

        <div className="horiz-input-group">
          <div className="vert-input-group">
            <span>MSA app ID (optional)</span>
            <input value={ this.state.bot.msaAppId } onChange={ this.onChangeAppId } type="text" />
          </div>

          <div className="vert-input-group">
            <span>MSA app password (optional)</span>
            <input value={ this.state.bot.msaPassword } onChange={ this.onChangeAppPw } type="password" />
          </div>

          <div className="vert-input-group">
            <span>Locale (optional)</span>
            <input value={ this.state.bot.locale } onChange={ this.onChangeLocale } type="text" />
          </div>
        </div>

        <div className="horiz-input-group">
          <div className="vert-input-group">
            <span>Bot name</span>
            <input value={ this.state.bot.botName } onChange={ this.onChangeName } type="text" />
          </div>

          <div className="vert-input-group">
            <span>Local folder (optional)</span>
            <div className='horiz-input-group'>
              <input value={ this.state.bot.localDir } type="text" readOnly />
              <PrimaryButton text='Browse' onClick={ this.onSelectFolder } buttonClass='browse-path-button' />
            </div>
          </div>
        </div>

        <div className="button-row">
          <PrimaryButton text='Cancel' onClick={ this.onCancel } buttonClass='cancel-button' />
          <PrimaryButton text='Connect' onClick={ this.onConnect } buttonClass='connect-button' />
        </div>
      </div>
    );
  }
}
