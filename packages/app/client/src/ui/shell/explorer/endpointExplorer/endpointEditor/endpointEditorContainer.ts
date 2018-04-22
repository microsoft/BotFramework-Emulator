import { connect } from 'react-redux';
import { IRootState } from '../../../../../data/store';
import { DialogService } from '../../../../dialogs/service';
import { EndpointEditor } from './endpointEditor';

const mapStateToProps = (state: IRootState, ownProps: { [propName: string]: any }) => {
  return {
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateEndpointService: updatedEndpointService => DialogService.hideDialog(updatedEndpointService),
    cancel: () => DialogService.hideDialog()
  };
};

export const EndpointEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EndpointEditor) as any;
