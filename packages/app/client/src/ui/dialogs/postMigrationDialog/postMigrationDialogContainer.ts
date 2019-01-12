import { connect } from "react-redux";

import { DialogService } from "../service";

import {
  PostMigrationDialog,
  PostMigrationDialogProps
} from "./postMigrationDialog";

const mapStateToProps = (ownProps: PostMigrationDialogProps) => ownProps;

function mapDispatchToProps(): PostMigrationDialogProps {
  return {
    close: () => {
      DialogService.hideDialog();
    }
  };
}

export const PostMigrationDialogContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PostMigrationDialog);
