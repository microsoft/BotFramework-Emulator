import { RootState } from '../../../data/store';
import { connect } from 'react-redux';
import { BotSettingsEditor, BotSettingsEditorProps } from './botSettingsEditor';
import { DialogService } from '../service';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';

const mapStateToProps = (state: RootState, _ownProps: {}): Partial<BotSettingsEditorProps> => {
  return {
    bot: BotConfigWithPathImpl.fromJSON(state.bot.activeBot) // Copy only
  };
};

const mapDispatchToProps = _dispatch => ({
  cancel: () => DialogService.hideDialog(0)
});

export const BotSettingsEditorContainer = connect(mapStateToProps, mapDispatchToProps)(BotSettingsEditor);
