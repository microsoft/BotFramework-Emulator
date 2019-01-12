import { connect } from "react-redux";

import { DialogService } from "../service";

import {
  SecretPromptDialog,
  SecretPromptDialogProps
} from "./secretPromptDialog";

const mapStateToProps = (): SecretPromptDialogProps => ({
  onCancelClick: () => DialogService.hideDialog(null),
  onSaveClick: (newSecret: string) => DialogService.hideDialog(newSecret)
});
export const SecretPromptDialogContainer = connect(mapStateToProps)(
  SecretPromptDialog
);
