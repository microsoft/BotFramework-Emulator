import { connect } from 'react-redux';

import { SecretPromptDialog, SecretPromptDialogProps } from './secretPromptDialog';
import { DialogService } from '../service';

const mapStateToProps = (): SecretPromptDialogProps => ({
  onCancelClick: () => DialogService.hideDialog(null),
  onSaveClick: (newSecret: string) => DialogService.hideDialog(newSecret)
});
export const SecretPromptDialogContainer = connect(mapStateToProps)(SecretPromptDialog);
