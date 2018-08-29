import { connect } from 'react-redux';
import BotExplorerBar from './botExplorerBar';
import { DialogService } from '../../../dialogs/service';
import { BotSettingsEditorContainer } from '../../../dialogs';
import { RootState } from '../../../../data/store';

const mapStateToProps = (state: RootState) => {
  return {
    openBotSettings: () => {
      DialogService.showDialog(BotSettingsEditorContainer, {bot: state.bot.activeBot}).catch();
    },
  };
};
export const BotExplorerBarContainer = connect(mapStateToProps)(BotExplorerBar);
