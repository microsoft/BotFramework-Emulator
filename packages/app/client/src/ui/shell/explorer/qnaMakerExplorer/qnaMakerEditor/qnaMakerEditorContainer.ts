import { connect } from 'react-redux';
import { IRootState } from '../../../../../data/store';
import { DialogService } from '../../../../dialogs/service';
import { QnaMakerEditor } from './qnaMakerEditor';

const mapStateToProps = (state: IRootState, ownProps: { [propName: string]: any }) => {
  return {
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateQnaMakerService: updatedQnaMakerService => DialogService.hideDialog(updatedQnaMakerService),
    cancel: () => DialogService.hideDialog()
  };
};

export const QnaMakerEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QnaMakerEditor) as any;
