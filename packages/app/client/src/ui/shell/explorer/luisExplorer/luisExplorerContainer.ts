import { ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchLuisModelsViewer } from '../../../../data/action/luisAuthActions';
import { openLuisDeepLink, openLuisExplorerContextMenu } from '../../../../data/action/luisServicesActions';
import { IRootState } from '../../../../data/store';
import { LuisExplorer } from './luisExplorer';

const mapStateToProps = (state: IRootState) => {
  const { services } = state.bot.activeBot;
  return {
    luisServices: services.filter(service => service.type === ServiceType.Luis),
    window
  };
};

const mapDispatchToProps = dispatch => {
  return {
    launchLuisModelsViewer: (luisModelViewer: ComponentClass<any>) => dispatch(launchLuisModelsViewer(luisModelViewer)),
    openLuisDeepLink: luisService => dispatch(openLuisDeepLink(luisService)),
    openContextMenu: luisService => dispatch(openLuisExplorerContextMenu(luisService))
  };
};

export const LuisExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisExplorer) as any;
