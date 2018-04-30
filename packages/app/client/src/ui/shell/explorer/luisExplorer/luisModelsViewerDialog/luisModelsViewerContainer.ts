import { ServiceType } from 'msbot/bin/schema';
import { connect } from 'react-redux';
import { IRootState } from '../../../../../data/store';
import { DialogService } from '../../../../dialogs/service';
import { LuisModelsViewer } from './luisModelsViewer';

const mapStateToProps = (state: IRootState, ownProps: { [propName: string]: any }) => {
  const { services } = state.bot.activeBot;
  return {
    luisServices: services.filter(service => service.type === ServiceType.Luis),
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addLuisModels: updatedLuisModels => DialogService.hideDialog(updatedLuisModels),
    cancel: () => DialogService.hideDialog()
  };
};

export const LuisModelsViewerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisModelsViewer as any) as any;
