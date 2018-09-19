import { connect } from 'react-redux';

import { SecretPromptDialog, SecretPromptDialogProps } from './secretPromptDialog';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { SharedConstants } from '@bfemulator/app-shared';
import { DialogService } from '../service';

const mapStateToProps = (): SecretPromptDialogProps => ({
  onAnchorClick: (url: string) =>
    CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, url).catch(),
  onCancelClick: () => DialogService.hideDialog(null),
  onSaveClick: (newSecret: string) => DialogService.hideDialog(newSecret)
});
export const SecretPromptDialogContainer = connect(mapStateToProps)(SecretPromptDialog);
