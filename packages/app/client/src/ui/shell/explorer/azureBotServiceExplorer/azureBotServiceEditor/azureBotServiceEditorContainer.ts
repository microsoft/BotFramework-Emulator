import { connect } from 'react-redux';
import { IRootState } from '../../../../../data/store';
import { DialogService } from '../../../../dialogs/service';
import { AzureBotServiceEditor } from './azureBotServiceEditor';

const mapStateToProps = (state: IRootState, ownProps: { [propName: string]: any }) => {
  return {
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateAzureBotService: updatedAzureBotService => DialogService.hideDialog(updatedAzureBotService),
    cancel: () => DialogService.hideDialog()
  };
};

export const AzureBotServiceEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AzureBotServiceEditor) as any;
