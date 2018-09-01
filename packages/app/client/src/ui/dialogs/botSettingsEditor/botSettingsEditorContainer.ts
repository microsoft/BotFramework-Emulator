import { RootState } from '../../../data/store';
import { connect } from 'react-redux';
import { BotSettingsEditor, BotSettingsEditorProps } from './botSettingsEditor';
import { DialogService } from '../service';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { beginAdd } from '../../../data/action/notificationActions';

const mapStateToProps = (state: RootState, ownProps: {}): Partial<BotSettingsEditorProps> => {
  return {
    window,
    bot: BotConfigWithPathImpl.fromJSON(state.bot.activeBot), // Copy only
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => ({
  cancel: () => DialogService.hideDialog(0),
  sendNotification: notification => dispatch(beginAdd(notification))
});

export const BotSettingsEditorContainer = connect(mapStateToProps, mapDispatchToProps)(BotSettingsEditor);
