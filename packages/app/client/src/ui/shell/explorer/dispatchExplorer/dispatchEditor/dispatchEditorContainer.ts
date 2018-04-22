import { connect } from 'react-redux';
import { IRootState } from '../../../../../data/store';
import { DialogService } from '../../../../dialogs/service';
import { DispatchEditor } from './dispatchEditor';

const mapStateToProps = (state: IRootState, ownProps: { [propName: string]: any }) => {
  return {
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateDispatchService: updatedDispatchService => DialogService.hideDialog(updatedDispatchService),
    cancel: () => DialogService.hideDialog()
  };
};

export const DispatchEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DispatchEditor) as any;
