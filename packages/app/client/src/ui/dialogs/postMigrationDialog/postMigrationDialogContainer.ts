import { connect } from 'react-redux';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { DialogService } from '../service';
import { PostMigrationDialog, PostMigrationDialogProps } from './postMigrationDialog';
import { SharedConstants } from '@bfemulator/app-shared';

const mapStateToProps = (ownProps: PostMigrationDialogProps) => ownProps;

function mapDispatchToProps(): PostMigrationDialogProps {
  return {
    close: () => {
      DialogService.hideDialog();
    },
    onAnchorClick: (url) => {
      CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, url).catch();
    }
  };
}

export const PostMigrationDialogContainer = connect(mapStateToProps, mapDispatchToProps)(PostMigrationDialog);
